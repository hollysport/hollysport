import { NextResponse } from "next/server";

import {
    checkFormRateLimit,
    getClientIp,
} from "@/lib/security/form-rate-limit";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const allowedSupportTypes = [
    "financial_support",
    "volunteer",
    "social_media",
    "photo_video",
    "design_content",
    "software",
    "event_operations",
    "transport_logistics",
    "venue",
    "equipment_product",
    "corporate_sponsorship",
    "mentorship_network",
    "other",
] as const;

const allowedVolunteerRoles = [
    "Etkinlik organizasyonu",
    "Katılımcı karşılama",
    "Saha ve ekipman düzeni",
    "Sosyal medya",
    "Fotoğraf ve video",
    "Grafik tasarım",
    "Yazılım",
    "Ulaşım ve lojistik",
] as const;

const allowedNameVisibilities = [
    "full",
    "surname_masked",
    "initials_masked",
] as const;

const allowedAmountTypes = [
    "one_time",
    "monthly",
    "other",
] as const;

type SupportFormPayload = {
    fullName?: unknown;
    phone?: unknown;
    email?: unknown;
    city?: unknown;
    supportTypes?: unknown;
    volunteerRoles?: unknown;
    organizationName?: unknown;
    website?: unknown;
    amountType?: unknown;
    estimatedAmount?: unknown;
    message?: unknown;
    nameVisibility?: unknown;
    kvkkAccepted?: unknown;
    turnstileToken?: unknown;
    companyFax?: unknown;
};

function getText(value: unknown) {
    return typeof value === "string" ? value.trim() : "";
}

function getStringArray(value: unknown) {
    if (!Array.isArray(value)) {
        return [];
    }

    return Array.from(
        new Set(
            value
                .filter(
                    (item): item is string =>
                        typeof item === "string",
                )
                .map((item) => item.trim())
                .filter(Boolean),
        ),
    );
}

function isValidEmail(email: string) {
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

function normalizeWebsite(website: string) {
    if (!website) {
        return null;
    }

    const preparedWebsite = /^https?:\/\//i.test(website)
        ? website
        : `https://${website}`;

    try {
        const parsedUrl = new URL(preparedWebsite);

        if (
            parsedUrl.protocol !== "http:" &&
            parsedUrl.protocol !== "https:"
        ) {
            return null;
        }

        return parsedUrl.toString();
    } catch {
        return null;
    }
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

        if (contentLength > 50_000) {
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

        let body: SupportFormPayload;

        try {
            body =
                (await request.json()) as SupportFormPayload;
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
        const city = getText(body.city);
        const organizationName = getText(
            body.organizationName,
        );
        const website = getText(body.website);
        const amountType = getText(body.amountType);
        const estimatedAmountText = getText(
            body.estimatedAmount,
        );
        const message = getText(body.message);
        const nameVisibility = getText(
            body.nameVisibility,
        );
        const turnstileToken = getText(
            body.turnstileToken,
        );

        const companyFax = getText(body.companyFax);

        /*
         * Gizli honeypot alanını dolduran botlara sahte
         * başarı cevabı verilir fakat kayıt yapılmaz.
         */
        if (companyFax) {
            return NextResponse.json({
                success: true,
                message: "Başvurun başarıyla alındı.",
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
            email &&
            (email.length > 160 || !isValidEmail(email))
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

        if (city.length > 80) {
            return NextResponse.json(
                {
                    success: false,
                    field: "city",
                    message:
                        "Şehir bilgisi en fazla 80 karakter olabilir.",
                },
                {
                    status: 400,
                },
            );
        }

        const requestedSupportTypes =
            getStringArray(body.supportTypes);

        const supportTypes =
            requestedSupportTypes.filter((item) =>
                allowedSupportTypes.includes(
                    item as (typeof allowedSupportTypes)[number],
                ),
            );

        if (
            supportTypes.length === 0 ||
            supportTypes.length !==
                requestedSupportTypes.length
        ) {
            return NextResponse.json(
                {
                    success: false,
                    field: "supportTypes",
                    message:
                        "En az bir geçerli destek türü seçmelisin.",
                },
                {
                    status: 400,
                },
            );
        }

        const hasVolunteerSupport =
            supportTypes.includes("volunteer");

        const hasCorporateSupport =
            supportTypes.includes(
                "corporate_sponsorship",
            );

        const hasFinancialSupport =
            supportTypes.includes("financial_support");

        const requestedVolunteerRoles =
            getStringArray(body.volunteerRoles);

        const volunteerRoles = hasVolunteerSupport
            ? requestedVolunteerRoles.filter((item) =>
                  allowedVolunteerRoles.includes(
                      item as (typeof allowedVolunteerRoles)[number],
                  ),
              )
            : [];

        if (
            hasVolunteerSupport &&
            volunteerRoles.length !==
                requestedVolunteerRoles.length
        ) {
            return NextResponse.json(
                {
                    success: false,
                    field: "volunteerRoles",
                    message:
                        "Geçersiz gönüllü destek alanı seçildi.",
                },
                {
                    status: 400,
                },
            );
        }

        if (organizationName.length > 160) {
            return NextResponse.json(
                {
                    success: false,
                    field: "organizationName",
                    message:
                        "Firma veya kurum adı en fazla 160 karakter olabilir.",
                },
                {
                    status: 400,
                },
            );
        }

        if (website.length > 300) {
            return NextResponse.json(
                {
                    success: false,
                    field: "website",
                    message:
                        "İnternet sitesi adresi çok uzun.",
                },
                {
                    status: 400,
                },
            );
        }

        const normalizedWebsite =
            hasCorporateSupport && website
                ? normalizeWebsite(website)
                : null;

        if (
            hasCorporateSupport &&
            website &&
            !normalizedWebsite
        ) {
            return NextResponse.json(
                {
                    success: false,
                    field: "website",
                    message:
                        "Geçerli bir internet sitesi adresi gir.",
                },
                {
                    status: 400,
                },
            );
        }

        if (
            hasFinancialSupport &&
            amountType &&
            !allowedAmountTypes.includes(
                amountType as (typeof allowedAmountTypes)[number],
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    field: "amountType",
                    message:
                        "Geçerli bir destek biçimi seç.",
                },
                {
                    status: 400,
                },
            );
        }

        let estimatedAmount: number | null = null;

        if (
            hasFinancialSupport &&
            estimatedAmountText
        ) {
            estimatedAmount = Number(
                estimatedAmountText.replace(",", "."),
            );

            if (
                !Number.isFinite(estimatedAmount) ||
                estimatedAmount < 0 ||
                estimatedAmount > 100_000_000
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        field: "estimatedAmount",
                        message:
                            "Geçerli bir tahmini destek tutarı gir.",
                    },
                    {
                        status: 400,
                    },
                );
            }
        }

        if (message.length > 3000) {
            return NextResponse.json(
                {
                    success: false,
                    field: "message",
                    message:
                        "Ek bilgiler en fazla 3000 karakter olabilir.",
                },
                {
                    status: 400,
                },
            );
        }

        if (
            !allowedNameVisibilities.includes(
                nameVisibility as (typeof allowedNameVisibilities)[number],
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    field: "nameVisibility",
                    message:
                        "Geçerli bir isim görünürlüğü seç.",
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
                        "Güvenlik doğrulamasını tamamlamalısın.",
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
                expectedAction: "support_form",
            });

        if (!turnstileResult.success) {
            console.error(
                "Destek formu Turnstile hatası:",
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
                formKey: "support_form",
                limit: 3,
                windowSeconds: 600,
            });

        if (!rateLimitAllowed) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Çok fazla destek başvurusu gönderdin. 10 dakika sonra tekrar dene.",
                },
                {
                    status: 429,
                },
            );
        }

        const supabase = createAdminClient();

        const { error } = await supabase
            .from("support_requests")
            .insert({
                full_name: fullName,
                phone: normalizedPhone,
                email: email || null,
                city: city || null,

                support_types: supportTypes,
                volunteer_roles: hasVolunteerSupport
                    ? volunteerRoles
                    : [],

                organization_name:
                    hasCorporateSupport
                        ? organizationName || null
                        : null,

                website: hasCorporateSupport
                    ? normalizedWebsite
                    : null,

                amount_type:
                    hasFinancialSupport && amountType
                        ? amountType
                        : null,

                estimated_amount:
                    hasFinancialSupport
                        ? estimatedAmount
                        : null,

                message: message || null,

                name_visibility: nameVisibility,
                display_consent: true,
                kvkk_accepted: true,
                status: "pending",
            });

        if (error) {
            console.error(
                "Destek başvurusu kayıt hatası:",
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
                "Başvurun başarıyla alındı. Holly Sport ekibi seninle iletişime geçecek.",
        });
    } catch (error) {
        console.error(
            "Destek formu beklenmeyen hata:",
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