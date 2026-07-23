import { NextResponse } from "next/server";

import {
    checkFormRateLimit,
    getClientIp,
} from "@/lib/security/form-rate-limit";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type DreamFormPayload = {
    fullName?: unknown;
    phone?: unknown;
    email?: unknown;
    dreamTitle?: unknown;
    dreamDescription?: unknown;
    kvkkAccepted?: unknown;
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

        let body: DreamFormPayload;

        try {
            body =
                (await request.json()) as DreamFormPayload;
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

        const fullName = getText(body.fullName);
        const phone = getText(body.phone);
        const email = getText(body.email).toLowerCase();
        const dreamTitle = getText(body.dreamTitle);
        const dreamDescription = getText(
            body.dreamDescription,
        );
        const turnstileToken = getText(
            body.turnstileToken,
        );

        /*
         * Bu alan normal kullanıcılar tarafından görülmez.
         * Bot doldurursa sahte başarı cevabı verilir ancak
         * veritabanına kayıt yapılmaz.
         */
        const website = getText(body.website);

        if (website) {
            return NextResponse.json({
                success: true,
                message: "Başvurun başarıyla gönderildi.",
            });
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

        if (
            dreamTitle.length < 3 ||
            dreamTitle.length > 140
        ) {
            return NextResponse.json(
                {
                    success: false,
                    field: "dreamTitle",
                    message:
                        "Hayal başlığı 3 ile 140 karakter arasında olmalıdır.",
                },
                {
                    status: 400,
                },
            );
        }

        if (
            dreamDescription.length < 20 ||
            dreamDescription.length > 3000
        ) {
            return NextResponse.json(
                {
                    success: false,
                    field: "dreamDescription",
                    message:
                        "Hayal açıklaması 20 ile 3000 karakter arasında olmalıdır.",
                },
                {
                    status: 400,
                },
            );
        }

        if (body.kvkkAccepted !== true) {
            return NextResponse.json(
                {
                    success: false,
                    field: "kvkkAccepted",
                    message:
                        "KVKK Aydınlatma Metni’ni kabul etmelisin.",
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
                expectedAction: "dream_form",
            });

        if (!turnstileResult.success) {
            console.error(
                "Turnstile doğrulama hatası:",
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
                formKey: "dream_form",
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

        const { error } = await supabase
            .from("dream_submissions")
            .insert({
                full_name: fullName,
                phone: normalizedPhone,
                email,
                dream_title: dreamTitle,
                dream_description: dreamDescription,
                kvkk_accepted: true,
                status: "new",
                admin_note: null,
            });

        if (error) {
            console.error(
                "Hayal başvurusu kayıt hatası:",
                error,
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Başvuru şu anda kaydedilemedi. Lütfen tekrar dene.",
                },
                {
                    status: 500,
                },
            );
        }

        return NextResponse.json({
            success: true,
            message:
                "Hayalin bize ulaştı. En kısa sürede değerlendireceğiz.",
        });
    } catch (error) {
        console.error(
            "Hayal formu beklenmeyen hata:",
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