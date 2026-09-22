import { NextResponse } from "next/server";

import {
    checkFormRateLimit,
    getClientIp,
} from "@/lib/security/form-rate-limit";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const allowedGenders = [
    "female",
    "male",
    "other",
    "prefer_not_to_say",
] as const;

type RegistrationFormPayload = {
    eventId?: unknown;
    fullName?: unknown;
    email?: unknown;
    phone?: unknown;
    gender?: unknown;
    notes?: unknown;
    consentAccepted?: unknown;
    turnstileToken?: unknown;
    website?: unknown;
};

function getText(value: unknown) {
    return typeof value === "string" ? value.trim() : "";
}

function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeTurkishPhone(phone: string) {
    const digits = phone.replace(/\D/g, "");

    let localNumber = digits;

    if (localNumber.startsWith("90")) {
        localNumber = localNumber.slice(2);
    }

    if (localNumber.startsWith("0")) {
        localNumber = localNumber.slice(1);
    }

    if (!/^5\d{9}$/.test(localNumber)) {
        return null;
    }

    return `+90${localNumber}`;
}

function validateRequestOrigin(request: Request) {
    const origin = request.headers.get("origin");
    const requestHost = request.headers.get("host");

    if (!origin || !requestHost) {
        return true;
    }

    try {
        return new URL(origin).host === requestHost;
    } catch {
        return false;
    }
}

export async function POST(request: Request) {
    try {
        const contentLength = Number(
            request.headers.get("content-length") ?? "0",
        );

        if (contentLength > 20_000) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Gönderilen veri çok büyük.",
                },
                {
                    status: 413,
                },
            );
        }

        if (!validateRequestOrigin(request)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Geçersiz form isteği.",
                },
                {
                    status: 403,
                },
            );
        }

        let body: RegistrationFormPayload;

        try {
            body =
                (await request.json()) as RegistrationFormPayload;
        } catch {
            return NextResponse.json(
                {
                    success: false,
                    message: "Form bilgileri okunamadı.",
                },
                {
                    status: 400,
                },
            );
        }

        const eventId = getText(body.eventId);
        const fullName = getText(body.fullName);
        const email = getText(body.email).toLowerCase();
        const phone = getText(body.phone);
        const gender = getText(body.gender);
        const notes = getText(body.notes);
        const turnstileToken = getText(body.turnstileToken);

        /*
         * Honeypot alanı: normal kullanıcılar bu alanı görmez.
         * Bot doldurursa sahte başarı cevabı verilir ancak
         * veritabanına kayıt yapılmaz.
         */
        const website = getText(body.website);

        if (website) {
            return NextResponse.json({
                success: true,
                message: "Başvurun başarıyla kaydedildi.",
            });
        }

        if (
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                eventId,
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    field: "eventId",
                    message: "Geçerli bir etkinlik seçilmeli.",
                },
                {
                    status: 400,
                },
            );
        }

        if (
            fullName.length < 2 ||
            fullName.length > 100
        ) {
            return NextResponse.json(
                {
                    success: false,
                    field: "fullName",
                    message:
                        "Ad soyad 2 ile 100 karakter arasında olmalıdır.",
                },
                {
                    status: 400,
                },
            );
        }

        if (
            email.length > 160 ||
            !validateEmail(email)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    field: "email",
                    message:
                        "Geçerli bir e-posta adresi gir.",
                },
                {
                    status: 400,
                },
            );
        }

        const normalizedPhone =
            normalizeTurkishPhone(phone);

        if (!normalizedPhone) {
            return NextResponse.json(
                {
                    success: false,
                    field: "phone",
                    message:
                        "Geçerli bir Türkiye cep telefonu numarası gir.",
                },
                {
                    status: 400,
                },
            );
        }

        if (
            !allowedGenders.includes(
                gender as (typeof allowedGenders)[number],
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    field: "gender",
                    message:
                        "Geçerli bir cinsiyet seçeneği seçmelisin.",
                },
                {
                    status: 400,
                },
            );
        }

        if (notes.length > 1000) {
            return NextResponse.json(
                {
                    success: false,
                    field: "notes",
                    message:
                        "Not alanı en fazla 1000 karakter olabilir.",
                },
                {
                    status: 400,
                },
            );
        }

        if (body.consentAccepted !== true) {
            return NextResponse.json(
                {
                    success: false,
                    field: "consentAccepted",
                    message:
                        "Başvuru şartlarını kabul etmelisin.",
                },
                {
                    status: 400,
                },
            );
        }

        if (!turnstileToken) {
            return NextResponse.json(
                {
                    success: false,
                    field: "turnstile",
                    message:
                        "Lütfen güvenlik doğrulamasını tamamla.",
                },
                {
                    status: 400,
                },
            );
        }

        const ipAddress = getClientIp(request);

        const turnstileResult =
            await verifyTurnstileToken({
                token: turnstileToken,
                ipAddress,
                expectedAction: "registration_form",
            });

        if (!turnstileResult.success) {
            console.error(
                "Kayıt formu Turnstile hatası:",
                turnstileResult.errors,
            );

            return NextResponse.json(
                {
                    success: false,
                    field: "turnstile",
                    message:
                        "Güvenlik doğrulaması başarısız oldu. Sayfayı yenileyip tekrar dene.",
                },
                {
                    status: 400,
                },
            );
        }

        const rateLimitAllowed =
            await checkFormRateLimit({
                request,
                formKey: "registration_form",
                limit: 3,
                windowSeconds: 600,
            });

        if (!rateLimitAllowed) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Çok fazla başvuru gönderdin. 10 dakika sonra tekrar dene.",
                },
                {
                    status: 429,
                },
            );
        }

        const supabase = createAdminClient();

        const { data: event, error: eventError } =
            await supabase
                .from("events")
                .select(
                    "id, status, ends_at, registration_deadline, capacity, participant_count, registration_open",
                )
                .eq("id", eventId)
                .maybeSingle();

        if (eventError || !event) {
            return NextResponse.json(
                {
                    success: false,
                    field: "eventId",
                    message: "Etkinlik bulunamadı.",
                },
                {
                    status: 400,
                },
            );
        }

        const currentTime = Date.now();

        const isPast =
            new Date(event.ends_at).getTime() <=
            currentTime;

        const deadlinePassed =
            event.registration_deadline !== null &&
            new Date(
                event.registration_deadline,
            ).getTime() <= currentTime;

        const isFull =
            event.capacity !== null &&
            event.participant_count >= event.capacity;

        const canRegister =
            event.status === "published" &&
            event.registration_open &&
            !isPast &&
            !deadlinePassed &&
            !isFull;

        if (!canRegister) {
            return NextResponse.json(
                {
                    success: false,
                    field: "eventId",
                    message: isPast
                        ? "Bu etkinlik tamamlandı."
                        : isFull
                          ? "Etkinlik kontenjanı doldu."
                          : deadlinePassed
                            ? "Bu etkinliğin başvuru süresi sona erdi."
                            : "Bu etkinliğin kayıtları şu anda kapalı.",
                },
                {
                    status: 400,
                },
            );
        }

        const { error } = await supabase
            .from("event_registrations")
            .insert({
                event_id: eventId,
                user_id: null,
                full_name: fullName,
                email,
                phone: normalizedPhone,
                gender,
                notes: notes || null,
                status: "pending",
                consent_accepted: true,
            });

        if (error) {
            if (error.code === "23505") {
                return NextResponse.json(
                    {
                        success: false,
                        field: "email",
                        message:
                            "Bu e-posta adresiyle etkinliğe daha önce başvuru yapılmış.",
                    },
                    {
                        status: 409,
                    },
                );
            }

            console.error(
                "Etkinlik başvurusu kayıt hatası:",
                error,
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Başvurun şu anda kaydedilemedi. Lütfen tekrar dene.",
                },
                {
                    status: 500,
                },
            );
        }

        return NextResponse.json({
            success: true,
            message:
                "Başvurun başarıyla kaydedildi. İnceleme sonrası seninle iletişime geçilecek.",
        });
    } catch (error) {
        console.error(
            "Kayıt formu beklenmeyen hata:",
            error,
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar dene.",
            },
            {
                status: 500,
            },
        );
    }
}
