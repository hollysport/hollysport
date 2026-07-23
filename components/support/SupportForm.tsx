"use client";

import Link from "next/link";
import {
    FormEvent,
    useMemo,
    useState,
} from "react";
import {
    AlertCircle,
    Check,
    CheckCircle2,
    HandHeart,
    Loader2,
} from "lucide-react";

import TurnstileWidget from "@/components/security/TurnstileWidget";

const supportOptions = [
    {
        value: "financial_support",
        label: "Maddi destek görüşmesi",
    },
    {
        value: "volunteer",
        label: "Gönüllü destek",
    },
    {
        value: "social_media",
        label: "Sosyal medya desteği",
    },
    {
        value: "photo_video",
        label: "Fotoğraf ve video desteği",
    },
    {
        value: "design_content",
        label: "Grafik tasarım ve içerik üretimi",
    },
    {
        value: "software",
        label: "Yazılım ve teknik destek",
    },
    {
        value: "event_operations",
        label: "Etkinlik ve organizasyon desteği",
    },
    {
        value: "transport_logistics",
        label: "Ulaşım ve lojistik desteği",
    },
    {
        value: "venue",
        label: "Mekân desteği",
    },
    {
        value: "equipment_product",
        label: "Ekipman veya ürün desteği",
    },
    {
        value: "corporate_sponsorship",
        label: "Kurumsal sponsorluk",
    },
    {
        value: "mentorship_network",
        label: "Mentorluk ve bağlantı desteği",
    },
    {
        value: "other",
        label: "Diğer",
    },
];

const volunteerOptions = [
    "Etkinlik organizasyonu",
    "Katılımcı karşılama",
    "Saha ve ekipman düzeni",
    "Sosyal medya",
    "Fotoğraf ve video",
    "Grafik tasarım",
    "Yazılım",
    "Ulaşım ve lojistik",
];

type NameVisibility =
    | "full"
    | "surname_masked"
    | "initials_masked";

type FieldName =
    | "fullName"
    | "phone"
    | "email"
    | "city"
    | "supportTypes"
    | "volunteerRoles"
    | "organizationName"
    | "website"
    | "amountType"
    | "estimatedAmount"
    | "message"
    | "nameVisibility"
    | "kvkk"
    | "turnstile";

type FieldErrors = Partial<
    Record<FieldName, string>
>;

type ApiResponse = {
    success?: boolean;
    message?: string;
    field?: string;
};

function maskSurname(fullName: string) {
    const parts = fullName
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 0) {
        return "Ad S*****";
    }

    if (parts.length === 1) {
        return parts[0];
    }

    const surname = parts[parts.length - 1];

    const maskedSurname =
        surname.charAt(0).toLocaleUpperCase("tr-TR") +
        "*".repeat(
            Math.max(surname.length - 1, 4),
        );

    return [
        ...parts.slice(0, -1),
        maskedSurname,
    ].join(" ");
}

function maskAllNames(fullName: string) {
    const parts = fullName
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 0) {
        return "A*** S***";
    }

    return parts
        .map(
            (part) =>
                part
                    .charAt(0)
                    .toLocaleUpperCase("tr-TR") +
                "*".repeat(
                    Math.max(part.length - 1, 3),
                ),
        )
        .join(" ");
}

function formatDisplayName(
    fullName: string,
    visibility: NameVisibility,
) {
    const cleanName = fullName.trim();

    if (!cleanName) {
        if (visibility === "full") {
            return "Ad Soyad";
        }

        if (visibility === "surname_masked") {
            return "Ad S*****";
        }

        return "A*** S***";
    }

    if (visibility === "surname_masked") {
        return maskSurname(cleanName);
    }

    if (visibility === "initials_masked") {
        return maskAllNames(cleanName);
    }

    return cleanName;
}

function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(
        value,
    );
}

function isValidTurkishPhone(value: string) {
    let digits = value.replace(/\D/g, "");

    if (
        digits.startsWith("90") &&
        digits.length === 12
    ) {
        digits = digits.slice(2);
    }

    if (
        digits.startsWith("0") &&
        digits.length === 11
    ) {
        digits = digits.slice(1);
    }

    return /^5\d{9}$/.test(digits);
}

function isValidWebsite(value: string) {
    if (!value.trim()) {
        return true;
    }

    const preparedValue = /^https?:\/\//i.test(
        value.trim(),
    )
        ? value.trim()
        : `https://${value.trim()}`;

    try {
        const url = new URL(preparedValue);

        return (
            url.protocol === "http:" ||
            url.protocol === "https:"
        );
    } catch {
        return false;
    }
}

function mapApiField(
    field?: string,
): FieldName | null {
    if (
        field === "fullName" ||
        field === "phone" ||
        field === "email" ||
        field === "city" ||
        field === "supportTypes" ||
        field === "volunteerRoles" ||
        field === "organizationName" ||
        field === "website" ||
        field === "amountType" ||
        field === "estimatedAmount" ||
        field === "message" ||
        field === "nameVisibility" ||
        field === "turnstile"
    ) {
        return field;
    }

    if (field === "kvkkAccepted") {
        return "kvkk";
    }

    return null;
}

export default function SupportForm() {
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [city, setCity] = useState("");

    const [supportTypes, setSupportTypes] =
        useState<string[]>([]);
    const [volunteerRoles, setVolunteerRoles] =
        useState<string[]>([]);

    const [
        organizationName,
        setOrganizationName,
    ] = useState("");
    const [website, setWebsite] = useState("");

    const [amountType, setAmountType] =
        useState("");
    const [
        estimatedAmount,
        setEstimatedAmount,
    ] = useState("");

    const [message, setMessage] = useState("");

    const [nameVisibility, setNameVisibility] =
        useState<NameVisibility>("surname_masked");

    const [kvkkAccepted, setKvkkAccepted] =
        useState(false);

    const [companyFax, setCompanyFax] =
        useState("");

    const [
        turnstileToken,
        setTurnstileToken,
    ] = useState<string | null>(null);

    const [
        turnstileResetKey,
        setTurnstileResetKey,
    ] = useState(0);

    const [fieldErrors, setFieldErrors] =
        useState<FieldErrors>({});

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [successMessage, setSuccessMessage] =
        useState("");

    const [errorMessage, setErrorMessage] =
        useState("");

    const displayName = useMemo(
        () =>
            formatDisplayName(
                fullName,
                nameVisibility,
            ),
        [fullName, nameVisibility],
    );

    const hasVolunteerSupport =
        supportTypes.includes("volunteer");

    const hasCorporateSupport =
        supportTypes.includes(
            "corporate_sponsorship",
        );

    const hasFinancialSupport =
        supportTypes.includes(
            "financial_support",
        );

    function clearFieldError(field: FieldName) {
        setFieldErrors((currentErrors) => {
            if (!currentErrors[field]) {
                return currentErrors;
            }

            const nextErrors = {
                ...currentErrors,
            };

            delete nextErrors[field];

            return nextErrors;
        });
    }

    function clearMessages() {
        setErrorMessage("");
        setSuccessMessage("");
    }

    function toggleSupportType(value: string) {
        setSupportTypes((current) =>
            current.includes(value)
                ? current.filter(
                      (item) => item !== value,
                  )
                : [...current, value],
        );

        clearFieldError("supportTypes");
        clearMessages();
    }

    function toggleVolunteerRole(
        value: string,
    ) {
        setVolunteerRoles((current) =>
            current.includes(value)
                ? current.filter(
                      (item) => item !== value,
                  )
                : [...current, value],
        );

        clearFieldError("volunteerRoles");
        clearMessages();
    }

    function resetTurnstile() {
        setTurnstileToken(null);

        setTurnstileResetKey(
            (current) => current + 1,
        );
    }

    function validateForm() {
        const errors: FieldErrors = {};

        const trimmedFullName =
            fullName.trim();

        const trimmedPhone = phone.trim();
        const trimmedEmail = email.trim();
        const trimmedCity = city.trim();

        const trimmedOrganizationName =
            organizationName.trim();

        const trimmedWebsite =
            website.trim();

        const trimmedMessage =
            message.trim();

        if (
            trimmedFullName.length < 2 ||
            trimmedFullName.length > 100
        ) {
            errors.fullName =
                "Ad soyad 2 ile 100 karakter arasında olmalı.";
        }

        if (
            !isValidTurkishPhone(
                trimmedPhone,
            )
        ) {
            errors.phone =
                "Telefon numarasını 05XX XXX XX XX formatında gir.";
        }

        if (
            trimmedEmail &&
            !isValidEmail(trimmedEmail)
        ) {
            errors.email =
                "Geçerli bir e-posta adresi gir.";
        } else if (
            trimmedEmail.length > 160
        ) {
            errors.email =
                "E-posta adresi en fazla 160 karakter olabilir.";
        }

        if (trimmedCity.length > 80) {
            errors.city =
                "Şehir bilgisi en fazla 80 karakter olabilir.";
        }

        if (supportTypes.length === 0) {
            errors.supportTypes =
                "En az bir destek türü seçmelisin.";
        }

        if (
            trimmedOrganizationName.length >
            160
        ) {
            errors.organizationName =
                "Firma veya kurum adı en fazla 160 karakter olabilir.";
        }

        if (
            hasCorporateSupport &&
            trimmedWebsite &&
            !isValidWebsite(trimmedWebsite)
        ) {
            errors.website =
                "Geçerli bir internet sitesi adresi gir.";
        }

        if (
            hasFinancialSupport &&
            estimatedAmount
        ) {
            const amount = Number(
                estimatedAmount.replace(",", "."),
            );

            if (
                !Number.isFinite(amount) ||
                amount < 0 ||
                amount > 100_000_000
            ) {
                errors.estimatedAmount =
                    "Geçerli bir tahmini destek tutarı gir.";
            }
        }

        if (trimmedMessage.length > 3000) {
            errors.message =
                "Ek bilgiler en fazla 3000 karakter olabilir.";
        }

        if (!kvkkAccepted) {
            errors.kvkk =
                "KVKK Aydınlatma Metni’ni kabul etmelisin.";
        }

        if (!turnstileToken) {
            errors.turnstile =
                "Güvenlik doğrulamasını tamamlamalısın.";
        }

        return errors;
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        clearMessages();

        const validationErrors =
            validateForm();

        if (
            Object.keys(validationErrors)
                .length > 0
        ) {
            setFieldErrors(validationErrors);

            setErrorMessage(
                "Formdaki hatalı alanları kontrol et.",
            );

            return;
        }

        setFieldErrors({});
        setIsSubmitting(true);

        try {
            const response = await fetch(
                "/api/forms/support",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        fullName:
                            fullName.trim(),
                        phone: phone.trim(),
                        email: email
                            .trim()
                            .toLowerCase(),
                        city: city.trim(),
                        supportTypes,
                        volunteerRoles:
                            hasVolunteerSupport
                                ? volunteerRoles
                                : [],
                        organizationName:
                            hasCorporateSupport
                                ? organizationName.trim()
                                : "",
                        website:
                            hasCorporateSupport
                                ? website.trim()
                                : "",
                        amountType:
                            hasFinancialSupport
                                ? amountType
                                : "",
                        estimatedAmount:
                            hasFinancialSupport
                                ? estimatedAmount
                                : "",
                        message:
                            message.trim(),
                        nameVisibility,
                        kvkkAccepted,
                        turnstileToken,
                        companyFax,
                    }),
                },
            );

            let result: ApiResponse;

            try {
                result =
                    (await response.json()) as ApiResponse;
            } catch {
                result = {
                    success: false,
                    message:
                        "Sunucudan geçerli bir yanıt alınamadı.",
                };
            }

            if (
                !response.ok ||
                !result.success
            ) {
                const apiField =
                    mapApiField(
                        result.field,
                    );

                if (apiField) {
                    setFieldErrors({
                        [apiField]:
                            result.message ??
                            "Bu alanı kontrol et.",
                    });
                }

                setErrorMessage(
                    result.message ??
                        "Başvurun gönderilemedi. Bilgileri kontrol edip tekrar dene.",
                );

                resetTurnstile();

                return;
            }

            setSuccessMessage(
                result.message ??
                    "Başvurun başarıyla alındı.",
            );

            setFullName("");
            setPhone("");
            setEmail("");
            setCity("");
            setSupportTypes([]);
            setVolunteerRoles([]);
            setOrganizationName("");
            setWebsite("");
            setAmountType("");
            setEstimatedAmount("");
            setMessage("");
            setNameVisibility(
                "surname_masked",
            );
            setKvkkAccepted(false);
            setCompanyFax("");
            setFieldErrors({});

            resetTurnstile();
        } catch (error) {
            console.error(
                "Destek formu gönderim hatası:",
                error,
            );

            setErrorMessage(
                "Beklenmeyen bir hata oluştu. İnternet bağlantını kontrol edip tekrar dene.",
            );

            resetTurnstile();
        } finally {
            setIsSubmitting(false);
        }
    }

    const fieldClass =
        "w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

    const fieldErrorClass =
        "w-full rounded-2xl border border-red-500 bg-white px-4 py-3 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10";

    return (
        <form
            noValidate
            onSubmit={handleSubmit}
            className="relative rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
            >
                <label htmlFor="support-company-fax">
                    Firma faks numarası
                </label>

                <input
                    id="support-company-fax"
                    name="companyFax"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={companyFax}
                    onChange={(event) =>
                        setCompanyFax(
                            event.target.value,
                        )
                    }
                />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <label className="sm:col-span-2">
                    <span className="mb-2 block text-sm font-semibold text-zinc-950">
                        Ad soyad
                    </span>

                    <input
                        type="text"
                        autoComplete="name"
                        maxLength={100}
                        value={fullName}
                        onChange={(event) => {
                            setFullName(
                                event.target.value,
                            );
                            clearFieldError(
                                "fullName",
                            );
                            clearMessages();
                        }}
                        placeholder="Adınız ve soyadınız"
                        className={
                            fieldErrors.fullName
                                ? fieldErrorClass
                                : fieldClass
                        }
                    />

                    {fieldErrors.fullName && (
                        <FieldError
                            message={
                                fieldErrors.fullName
                            }
                        />
                    )}
                </label>

                <label>
                    <span className="mb-2 block text-sm font-semibold text-zinc-950">
                        Telefon
                    </span>

                    <input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        maxLength={20}
                        value={phone}
                        onChange={(event) => {
                            setPhone(
                                event.target.value,
                            );
                            clearFieldError(
                                "phone",
                            );
                            clearMessages();
                        }}
                        placeholder="05XX XXX XX XX"
                        className={
                            fieldErrors.phone
                                ? fieldErrorClass
                                : fieldClass
                        }
                    />

                    {fieldErrors.phone && (
                        <FieldError
                            message={
                                fieldErrors.phone
                            }
                        />
                    )}
                </label>

                <label>
                    <span className="mb-2 block text-sm font-semibold text-zinc-950">
                        E-posta
                    </span>

                    <input
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        maxLength={160}
                        value={email}
                        onChange={(event) => {
                            setEmail(
                                event.target.value,
                            );
                            clearFieldError(
                                "email",
                            );
                            clearMessages();
                        }}
                        placeholder="ornek@mail.com"
                        className={
                            fieldErrors.email
                                ? fieldErrorClass
                                : fieldClass
                        }
                    />

                    {fieldErrors.email && (
                        <FieldError
                            message={
                                fieldErrors.email
                            }
                        />
                    )}
                </label>

                <label className="sm:col-span-2">
                    <span className="mb-2 block text-sm font-semibold text-zinc-950">
                        Şehir
                    </span>

                    <input
                        type="text"
                        autoComplete="address-level2"
                        maxLength={80}
                        value={city}
                        onChange={(event) => {
                            setCity(
                                event.target.value,
                            );
                            clearFieldError(
                                "city",
                            );
                            clearMessages();
                        }}
                        placeholder="İstanbul"
                        className={
                            fieldErrors.city
                                ? fieldErrorClass
                                : fieldClass
                        }
                    />

                    {fieldErrors.city && (
                        <FieldError
                            message={
                                fieldErrors.city
                            }
                        />
                    )}
                </label>
            </div>

            <div className="mt-10">
                <h2 className="text-xl font-bold text-zinc-950">
                    Nasıl destek olmak istersin?
                </h2>

                <p className="mt-2 text-sm text-zinc-600">
                    Birden fazla destek türü
                    seçebilirsin.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {supportOptions.map(
                        (option) => {
                            const selected =
                                supportTypes.includes(
                                    option.value,
                                );

                            return (
                                <button
                                    key={
                                        option.value
                                    }
                                    type="button"
                                    onClick={() =>
                                        toggleSupportType(
                                            option.value,
                                        )
                                    }
                                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                                        selected
                                            ? "border-orange-500 bg-orange-50 text-orange-700"
                                            : "border-zinc-200 text-zinc-700 hover:border-zinc-400"
                                    }`}
                                >
                                    {option.label}

                                    <span
                                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                            selected
                                                ? "border-orange-500 bg-orange-500 text-white"
                                                : "border-zinc-300"
                                        }`}
                                    >
                                        {selected && (
                                            <Check className="h-3.5 w-3.5" />
                                        )}
                                    </span>
                                </button>
                            );
                        },
                    )}
                </div>

                {fieldErrors.supportTypes && (
                    <FieldError
                        message={
                            fieldErrors.supportTypes
                        }
                    />
                )}
            </div>

            {hasVolunteerSupport && (
                <div className="mt-8 rounded-3xl bg-zinc-50 p-5">
                    <h3 className="font-bold text-zinc-950">
                        Gönüllü olmak istediğin
                        alanlar
                    </h3>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {volunteerOptions.map(
                            (option) => {
                                const selected =
                                    volunteerRoles.includes(
                                        option,
                                    );

                                return (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() =>
                                            toggleVolunteerRole(
                                                option,
                                            )
                                        }
                                        className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                                            selected
                                                ? "border-orange-500 bg-white text-orange-700"
                                                : "border-zinc-200 bg-white text-zinc-700"
                                        }`}
                                    >
                                        {option}
                                    </button>
                                );
                            },
                        )}
                    </div>

                    {fieldErrors.volunteerRoles && (
                        <FieldError
                            message={
                                fieldErrors.volunteerRoles
                            }
                        />
                    )}
                </div>
            )}

            {hasCorporateSupport && (
                <div className="mt-8 grid gap-5 rounded-3xl bg-zinc-50 p-5 sm:grid-cols-2">
                    <label>
                        <span className="mb-2 block text-sm font-semibold text-zinc-950">
                            Firma veya kurum adı
                        </span>

                        <input
                            type="text"
                            maxLength={160}
                            value={
                                organizationName
                            }
                            onChange={(event) => {
                                setOrganizationName(
                                    event.target.value,
                                );
                                clearFieldError(
                                    "organizationName",
                                );
                                clearMessages();
                            }}
                            className={
                                fieldErrors.organizationName
                                    ? fieldErrorClass
                                    : fieldClass
                            }
                        />

                        {fieldErrors.organizationName && (
                            <FieldError
                                message={
                                    fieldErrors.organizationName
                                }
                            />
                        )}
                    </label>

                    <label>
                        <span className="mb-2 block text-sm font-semibold text-zinc-950">
                            İnternet sitesi
                        </span>

                        <input
                            type="url"
                            maxLength={300}
                            value={website}
                            onChange={(event) => {
                                setWebsite(
                                    event.target.value,
                                );
                                clearFieldError(
                                    "website",
                                );
                                clearMessages();
                            }}
                            placeholder="https://"
                            className={
                                fieldErrors.website
                                    ? fieldErrorClass
                                    : fieldClass
                            }
                        />

                        {fieldErrors.website && (
                            <FieldError
                                message={
                                    fieldErrors.website
                                }
                            />
                        )}
                    </label>
                </div>
            )}

            {hasFinancialSupport && (
                <div className="mt-8 rounded-3xl bg-zinc-50 p-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <label>
                            <span className="mb-2 block text-sm font-semibold text-zinc-950">
                                Destek biçimi
                            </span>

                            <select
                                value={amountType}
                                onChange={(
                                    event,
                                ) => {
                                    setAmountType(
                                        event.target
                                            .value,
                                    );
                                    clearFieldError(
                                        "amountType",
                                    );
                                    clearMessages();
                                }}
                                className={
                                    fieldErrors.amountType
                                        ? fieldErrorClass
                                        : fieldClass
                                }
                            >
                                <option value="">
                                    Seçiniz
                                </option>

                                <option value="one_time">
                                    Tek seferlik
                                </option>

                                <option value="monthly">
                                    Düzenli destek
                                </option>

                                <option value="other">
                                    Diğer
                                </option>
                            </select>

                            {fieldErrors.amountType && (
                                <FieldError
                                    message={
                                        fieldErrors.amountType
                                    }
                                />
                            )}
                        </label>

                        <label>
                            <span className="mb-2 block text-sm font-semibold text-zinc-950">
                                Tahmini destek
                                tutarı
                            </span>

                            <input
                                type="number"
                                min="0"
                                max="100000000"
                                step="0.01"
                                value={
                                    estimatedAmount
                                }
                                onChange={(
                                    event,
                                ) => {
                                    setEstimatedAmount(
                                        event.target
                                            .value,
                                    );
                                    clearFieldError(
                                        "estimatedAmount",
                                    );
                                    clearMessages();
                                }}
                                placeholder="₺"
                                className={
                                    fieldErrors.estimatedAmount
                                        ? fieldErrorClass
                                        : fieldClass
                                }
                            />

                            {fieldErrors.estimatedAmount && (
                                <FieldError
                                    message={
                                        fieldErrors.estimatedAmount
                                    }
                                />
                            )}
                        </label>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-zinc-500">
                        Bu alan yalnızca ön
                        bilgilendirme amaçlıdır.
                        Burada herhangi bir ödeme
                        işlemi yapılmaz.
                    </p>
                </div>
            )}

            <div className="mt-10">
                <h2 className="text-xl font-bold text-zinc-950">
                    İsmin nasıl gösterilsin?
                </h2>

                <p className="mt-2 text-sm text-zinc-600">
                    Destekçiler alanında görünecek
                    formatı seç.
                </p>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {[
                        {
                            value: "full" as const,
                            title: "Tam ad soyad",
                            example:
                                formatDisplayName(
                                    fullName ||
                                        "Umut Küçük",
                                    "full",
                                ),
                        },
                        {
                            value: "surname_masked" as const,
                            title:
                                "Soyadı sansürlü",
                            example:
                                formatDisplayName(
                                    fullName ||
                                        "Umut Küçük",
                                    "surname_masked",
                                ),
                        },
                        {
                            value: "initials_masked" as const,
                            title:
                                "Tamamen gizli",
                            example:
                                formatDisplayName(
                                    fullName ||
                                        "Umut Küçük",
                                    "initials_masked",
                                ),
                        },
                    ].map((option) => {
                        const selected =
                            nameVisibility ===
                            option.value;

                        return (
                            <button
                                key={
                                    option.value
                                }
                                type="button"
                                onClick={() => {
                                    setNameVisibility(
                                        option.value,
                                    );
                                    clearFieldError(
                                        "nameVisibility",
                                    );
                                    clearMessages();
                                }}
                                className={`rounded-2xl border p-4 text-left transition ${
                                    selected
                                        ? "border-orange-500 bg-orange-50"
                                        : "border-zinc-200 hover:border-zinc-400"
                                }`}
                            >
                                <span className="block font-semibold text-zinc-950">
                                    {option.title}
                                </span>

                                <span className="mt-2 block text-sm text-zinc-600">
                                    {option.example}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-5 rounded-2xl bg-zinc-950 p-5 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
                        Canlı önizleme
                    </p>

                    <p className="mt-2 text-xl font-bold">
                        {displayName}
                    </p>
                </div>
            </div>

            <label className="mt-8 block">
                <span className="mb-2 block text-sm font-semibold text-zinc-950">
                    Eklemek istediğin bilgiler
                </span>

                <textarea
                    rows={5}
                    maxLength={3000}
                    value={message}
                    onChange={(event) => {
                        setMessage(
                            event.target.value,
                        );
                        clearFieldError(
                            "message",
                        );
                        clearMessages();
                    }}
                    placeholder="Nasıl destek olmak istediğini kısaca anlatabilirsin."
                    className={`resize-none ${
                        fieldErrors.message
                            ? fieldErrorClass
                            : fieldClass
                    }`}
                />

                <div className="mt-2 flex items-start justify-between gap-4">
                    <div>
                        {fieldErrors.message && (
                            <FieldError
                                message={
                                    fieldErrors.message
                                }
                            />
                        )}
                    </div>

                    <span className="shrink-0 text-xs text-zinc-400">
                        {message.length}/3000
                    </span>
                </div>
            </label>

            <div className="mt-6">
                <label className="flex cursor-pointer items-start gap-3">
                    <input
                        type="checkbox"
                        checked={kvkkAccepted}
                        onChange={(event) => {
                            setKvkkAccepted(
                                event.target
                                    .checked,
                            );
                            clearFieldError(
                                "kvkk",
                            );
                            clearMessages();
                        }}
                        className="mt-1 h-4 w-4 shrink-0 accent-orange-500"
                    />

                    <span className="text-sm leading-6 text-zinc-600">
                        Kişisel verilerimin destek
                        başvurusunun
                        değerlendirilmesi amacıyla
                        işlenmesini kabul ediyorum.{" "}
                        <Link
                            href="/kvkk"
                            className="font-semibold text-orange-600 underline underline-offset-4"
                        >
                            KVKK Aydınlatma Metni
                        </Link>
                    </span>
                </label>

                {fieldErrors.kvkk && (
                    <FieldError
                        message={
                            fieldErrors.kvkk
                        }
                    />
                )}
            </div>

            <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <TurnstileWidget
                    action="support_form"
                    resetKey={
                        turnstileResetKey
                    }
                    theme="light"
                    onTokenChange={(token) => {
                        setTurnstileToken(
                            token,
                        );

                        if (token) {
                            clearFieldError(
                                "turnstile",
                            );
                            clearMessages();
                        }
                    }}
                />

                {fieldErrors.turnstile && (
                    <FieldError
                        message={
                            fieldErrors.turnstile
                        }
                    />
                )}
            </div>

            {errorMessage && (
                <div
                    role="alert"
                    className="mt-6 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                >
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    {errorMessage}
                </div>
            )}

            {successMessage && (
                <div
                    role="status"
                    className="mt-6 flex items-start gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
                >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                    {successMessage}
                </div>
            )}

            <button
                disabled={isSubmitting}
                type="submit"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-4 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Gönderiliyor
                    </>
                ) : (
                    <>
                        <HandHeart className="h-5 w-5" />
                        Destek Başvurusunu
                        Gönder
                    </>
                )}
            </button>
        </form>
    );
}

function FieldError({
    message,
}: {
    message: string;
}) {
    return (
        <span className="mt-2 flex items-start gap-1.5 text-sm font-medium text-red-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {message}
        </span>
    );
}