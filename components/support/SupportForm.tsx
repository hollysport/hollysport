"use client";

import { FormEvent, useMemo, useState } from "react";
import { Check, HandHeart, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const supportOptions = [
    { value: "financial_support", label: "Maddi destek görüşmesi" },
    { value: "volunteer", label: "Gönüllü destek" },
    { value: "social_media", label: "Sosyal medya desteği" },
    { value: "photo_video", label: "Fotoğraf ve video desteği" },
    { value: "design_content", label: "Grafik tasarım ve içerik üretimi" },
    { value: "software", label: "Yazılım ve teknik destek" },
    { value: "event_operations", label: "Etkinlik ve organizasyon desteği" },
    { value: "transport_logistics", label: "Ulaşım ve lojistik desteği" },
    { value: "venue", label: "Mekân desteği" },
    { value: "equipment_product", label: "Ekipman veya ürün desteği" },
    { value: "corporate_sponsorship", label: "Kurumsal sponsorluk" },
    { value: "mentorship_network", label: "Mentorluk ve bağlantı desteği" },
    { value: "other", label: "Diğer" },
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

type NameVisibility = "full" | "surname_masked" | "initials_masked";

function maskSurname(fullName: string) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) return "Ad S*****";
    if (parts.length === 1) return parts[0];

    const surname = parts[parts.length - 1];
    const maskedSurname =
        surname.charAt(0).toLocaleUpperCase("tr-TR") +
        "*".repeat(Math.max(surname.length - 1, 4));

    return [...parts.slice(0, -1), maskedSurname].join(" ");
}

function maskAllNames(fullName: string) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) return "A*** S***";

    return parts
        .map(
            (part) =>
                part.charAt(0).toLocaleUpperCase("tr-TR") +
                "*".repeat(Math.max(part.length - 1, 3)),
        )
        .join(" ");
}

function formatDisplayName(
    fullName: string,
    visibility: NameVisibility,
) {
    const cleanName = fullName.trim();

    if (!cleanName) {
        if (visibility === "full") return "Ad Soyad";
        if (visibility === "surname_masked") return "Ad S*****";
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

export default function SupportForm() {
    const supabase = createClient();

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [city, setCity] = useState("");

    const [supportTypes, setSupportTypes] = useState<string[]>([]);
    const [volunteerRoles, setVolunteerRoles] = useState<string[]>([]);

    const [organizationName, setOrganizationName] = useState("");
    const [website, setWebsite] = useState("");

    const [amountType, setAmountType] = useState("");
    const [estimatedAmount, setEstimatedAmount] = useState("");

    const [message, setMessage] = useState("");
    const [nameVisibility, setNameVisibility] =
        useState<NameVisibility>("surname_masked");

    const [kvkkAccepted, setKvkkAccepted] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const displayName = useMemo(
        () => formatDisplayName(fullName, nameVisibility),
        [fullName, nameVisibility],
    );

    const hasVolunteerSupport = supportTypes.includes("volunteer");
    const hasCorporateSupport =
        supportTypes.includes("corporate_sponsorship");
    const hasFinancialSupport =
        supportTypes.includes("financial_support");

    function toggleSupportType(value: string) {
        setSupportTypes((current) =>
            current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value],
        );
    }

    function toggleVolunteerRole(value: string) {
        setVolunteerRoles((current) =>
            current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value],
        );
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setSuccessMessage("");
        setErrorMessage("");

        if (supportTypes.length === 0) {
            setErrorMessage("En az bir destek türü seçmelisin.");
            return;
        }

        if (!kvkkAccepted) {
            setErrorMessage("KVKK aydınlatma metnini kabul etmelisin.");
            return;
        }

        setIsSubmitting(true);

        const amount = estimatedAmount
            ? Number(estimatedAmount.replace(",", "."))
            : null;

        const { error } = await supabase.from("support_requests").insert({
            full_name: fullName.trim(),
            phone: phone.trim(),
            email: email.trim() || null,
            city: city.trim() || null,

            support_types: supportTypes,
            volunteer_roles: hasVolunteerSupport ? volunteerRoles : [],

            organization_name: hasCorporateSupport
                ? organizationName.trim() || null
                : null,

            website: hasCorporateSupport
                ? website.trim() || null
                : null,

            amount_type: hasFinancialSupport
                ? amountType || null
                : null,

            estimated_amount:
                hasFinancialSupport && amount !== null && !Number.isNaN(amount)
                    ? amount
                    : null,

            message: message.trim() || null,

            name_visibility: nameVisibility,
            display_consent: true,
            kvkk_accepted: kvkkAccepted,
        });

        setIsSubmitting(false);

        if (error) {
            console.error(error);
            setErrorMessage(
                "Başvurun gönderilemedi. Bilgileri kontrol edip tekrar dene.",
            );
            return;
        }

        setSuccessMessage(
            "Başvurun başarıyla alındı. Holly Sport ekibi seninle iletişime geçecek.",
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
        setNameVisibility("surname_masked");
        setKvkkAccepted(false);
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
        >
            <div className="grid gap-6 sm:grid-cols-2">
                <label className="sm:col-span-2">
                    <span className="mb-2 block text-sm font-semibold text-zinc-950">
                        Ad soyad
                    </span>

                    <input
                        required
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        placeholder="Adınız ve soyadınız"
                        className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                    />
                </label>

                <label>
                    <span className="mb-2 block text-sm font-semibold text-zinc-950">
                        Telefon
                    </span>

                    <input
                        required
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="05XX XXX XX XX"
                        className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                    />
                </label>

                <label>
                    <span className="mb-2 block text-sm font-semibold text-zinc-950">
                        E-posta
                    </span>

                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="ornek@mail.com"
                        className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                    />
                </label>

                <label className="sm:col-span-2">
                    <span className="mb-2 block text-sm font-semibold text-zinc-950">
                        Şehir
                    </span>

                    <input
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        placeholder="İstanbul"
                        className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                    />
                </label>
            </div>

            <div className="mt-10">
                <h2 className="text-xl font-bold text-zinc-950">
                    Nasıl destek olmak istersin?
                </h2>

                <p className="mt-2 text-sm text-zinc-600">
                    Birden fazla destek türü seçebilirsin.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {supportOptions.map((option) => {
                        const selected = supportTypes.includes(option.value);

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => toggleSupportType(option.value)}
                                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${selected
                                    ? "border-orange-500 bg-orange-50 text-orange-700"
                                    : "border-zinc-200 text-zinc-700 hover:border-zinc-400"
                                    }`}
                            >
                                {option.label}

                                <span
                                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${selected
                                        ? "border-orange-500 bg-orange-500 text-white"
                                        : "border-zinc-300"
                                        }`}
                                >
                                    {selected && <Check className="h-3.5 w-3.5" />}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {hasVolunteerSupport && (
                <div className="mt-8 rounded-3xl bg-zinc-50 p-5">
                    <h3 className="font-bold text-zinc-950">
                        Gönüllü olmak istediğin alanlar
                    </h3>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {volunteerOptions.map((option) => {
                            const selected = volunteerRoles.includes(option);

                            return (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => toggleVolunteerRole(option)}
                                    className={`rounded-xl border px-4 py-3 text-left text-sm transition ${selected
                                        ? "border-orange-500 bg-white text-orange-700"
                                        : "border-zinc-200 bg-white text-zinc-700"
                                        }`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {hasCorporateSupport && (
                <div className="mt-8 grid gap-5 rounded-3xl bg-zinc-50 p-5 sm:grid-cols-2">
                    <label>
                        <span className="mb-2 block text-sm font-semibold text-zinc-950">
                            Firma veya kurum adı
                        </span>

                        <input
                            value={organizationName}
                            onChange={(event) =>
                                setOrganizationName(event.target.value)
                            }
                            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
                        />
                    </label>

                    <label>
                        <span className="mb-2 block text-sm font-semibold text-zinc-950">
                            İnternet sitesi
                        </span>

                        <input
                            value={website}
                            onChange={(event) => setWebsite(event.target.value)}
                            placeholder="https://"
                            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
                        />
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
                                onChange={(event) => setAmountType(event.target.value)}
                                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
                            >
                                <option value="">Seçiniz</option>
                                <option value="one_time">Tek seferlik</option>
                                <option value="monthly">Düzenli destek</option>
                                <option value="other">Diğer</option>
                            </select>
                        </label>

                        <label>
                            <span className="mb-2 block text-sm font-semibold text-zinc-950">
                                Tahmini destek tutarı
                            </span>

                            <input
                                type="number"
                                min="0"
                                value={estimatedAmount}
                                onChange={(event) =>
                                    setEstimatedAmount(event.target.value)
                                }
                                placeholder="₺"
                                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
                            />
                        </label>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-zinc-500">
                        Bu alan yalnızca ön bilgilendirme amaçlıdır. Burada herhangi
                        bir ödeme işlemi yapılmaz.
                    </p>
                </div>
            )}

            <div className="mt-10">
                <h2 className="text-xl font-bold text-zinc-950">
                    İsmin nasıl gösterilsin?
                </h2>

                <p className="mt-2 text-sm text-zinc-600">
                    Destekçiler alanında görünecek formatı seç.
                </p>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {[
                        {
                            value: "full" as const,
                            title: "Tam ad soyad",
                            example: formatDisplayName(
                                fullName || "Umut Küçük",
                                "full",
                            ),
                        },
                        {
                            value: "surname_masked" as const,
                            title: "Soyadı sansürlü",
                            example: formatDisplayName(
                                fullName || "Umut Küçük",
                                "surname_masked",
                            ),
                        },
                        {
                            value: "initials_masked" as const,
                            title: "Tamamen gizli",
                            example: formatDisplayName(
                                fullName || "Umut Küçük",
                                "initials_masked",
                            ),
                        },
                    ].map((option) => {
                        const selected = nameVisibility === option.value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setNameVisibility(option.value)}
                                className={`rounded-2xl border p-4 text-left transition ${selected
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

                    <p className="mt-2 text-xl font-bold">{displayName}</p>
                </div>
            </div>

            <label className="mt-8 block">
                <span className="mb-2 block text-sm font-semibold text-zinc-950">
                    Eklemek istediğin bilgiler
                </span>

                <textarea
                    rows={5}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Nasıl destek olmak istediğini kısaca anlatabilirsin."
                    className="w-full resize-none rounded-2xl border border-zinc-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                />
            </label>

            <label className="mt-6 flex cursor-pointer items-start gap-3">
                <input
                    required
                    type="checkbox"
                    checked={kvkkAccepted}
                    onChange={(event) => setKvkkAccepted(event.target.checked)}
                    className="mt-1 h-4 w-4 accent-orange-500"
                />

                <span className="text-sm leading-6 text-zinc-600">
                    KVKK aydınlatma metnini okudum ve kişisel verilerimin destek
                    başvurusunun değerlendirilmesi amacıyla işlenmesini kabul
                    ediyorum.
                </span>
            </label>

            {errorMessage && (
                <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {errorMessage}
                </div>
            )}

            {successMessage && (
                <div className="mt-6 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
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
                        Destek Başvurusunu Gönder
                    </>
                )}
            </button>
        </form>
    );
}