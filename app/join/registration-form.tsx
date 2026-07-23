"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";

type RegistrationFormProps = {
    eventId: string;
    eventTitle: string;
    eventSlug: string;
};

export default function RegistrationForm({
    eventId,
    eventTitle,
    eventSlug,
}: RegistrationFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const inputClass =
        "registration-field mt-2 h-14 w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 outline-none transition-colors focus:border-[#27D66B] focus:ring-4 focus:ring-[#27D66B]/10";

    const textareaClass =
        "registration-field mt-2 w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-4 outline-none transition-colors focus:border-[#27D66B] focus:ring-4 focus:ring-[#27D66B]/10";
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        setErrorMessage("");
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);

        const fullName = String(formData.get("full_name") ?? "").trim();

        const email = String(formData.get("email") ?? "")
            .trim()
            .toLowerCase();

        const phone = String(formData.get("phone") ?? "").trim();

        const gender = String(formData.get("gender") ?? "").trim();

        const notes = String(formData.get("notes") ?? "").trim();

        const consentAccepted =
            formData.get("consent_accepted") === "on";

        if (!fullName || !email || !phone || !gender) {
            setErrorMessage(
                "Ad soyad, e-posta, telefon ve cinsiyet alanları zorunludur.",
            );
            setIsSubmitting(false);
            return;
        }

        if (
            ![
                "female",
                "male",
                "other",
                "prefer_not_to_say",
            ].includes(gender)
        ) {
            setErrorMessage("Geçerli bir cinsiyet seçeneği seçmelisin.");
            setIsSubmitting(false);
            return;
        }

        if (!consentAccepted) {
            setErrorMessage("Başvuru şartlarını kabul etmelisin.");
            setIsSubmitting(false);
            return;
        }

        const supabase = createClient();

        const { error } = await supabase
            .from("event_registrations")
            .insert({
                event_id: eventId,
                user_id: null,
                full_name: fullName,
                email,
                phone,
                gender,
                notes: notes || null,
                status: "pending",
                consent_accepted: true,
            });

        if (error) {
            if (error.code === "23505") {
                setErrorMessage(
                    "Bu e-posta adresiyle etkinliğe daha önce başvuru yapılmış.",
                );
            } else {
                setErrorMessage(
                    `Başvuru gönderilemedi: ${error.message}`,
                );
            }

            setIsSubmitting(false);
            return;
        }

        setIsCompleted(true);
        setIsSubmitting(false);
    }

    if (isCompleted) {
        return (
            <div className="rounded-3xl border border-white/10 bg-[#111111] p-8 text-center md:p-12">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#27D66B] text-3xl font-bold text-black">
                    ✓
                </div>

                <h2 className="mt-8 text-3xl font-bold">
                    Başvurun alındı!
                </h2>

                <p className="mx-auto mt-4 max-w-md leading-7 text-white/50">
                    <strong className="text-white">
                        {eventTitle}
                    </strong>{" "}
                    etkinliği için başvurun başarıyla kaydedildi.
                    Başvurun incelendikten sonra seninle iletişime
                    geçilecek.
                </p>

                <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        href={`/events/${eventSlug}`}
                        className="flex h-13 items-center justify-center rounded-full border border-white/15 px-7 text-sm font-semibold uppercase tracking-wider transition-colors hover:border-[#27D66B] hover:text-[#27D66B]"
                    >
                        Etkinliğe dön
                    </Link>

                    <Link
                        href="/events"
                        className="flex h-13 items-center justify-center rounded-full bg-[#27D66B] px-7 text-sm font-semibold uppercase tracking-wider text-black"
                    >
                        Diğer etkinlikler
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/10 bg-[#111111] p-7 md:p-10"
        >
            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#27D66B]">
                Etkinlik Başvurusu
            </span>

            <h2 className="mt-5 text-3xl font-bold">
                {eventTitle}
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/45">
                Bilgilerini eksiksiz doldur. Başvurun admin
                paneline düşecek.
            </p>

            {errorMessage && (
                <div className="mt-7 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300">
                    {errorMessage}
                </div>
            )}

            <div className="mt-9 space-y-6">
                <label className="block">
                    <span className="text-sm text-white/60">
                        Ad Soyad *
                    </span>

                    <input
                        name="full_name"
                        type="text"
                        required
                        autoComplete="name"
                        placeholder="Adın ve soyadın"
                        className={inputClass}
                    />
                </label>

                <label className="block">
                    <span className="text-sm text-white/60">
                        E-posta *
                    </span>

                    <input
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="ornek@email.com"
                        className={inputClass}
                    />
                </label>

                <label className="block">
                    <span className="text-sm text-white/60">
                        Telefon *
                    </span>

                    <input
                        name="phone"
                        type="tel"
                        required
                        autoComplete="tel"
                        placeholder="05XX XXX XX XX"
                        className={inputClass}
                    />
                </label>

                <label className="block">
                    <span className="text-sm text-white/60">
                        Cinsiyet *
                    </span>

                    <select
                        name="gender"
                        required
                        defaultValue=""
                        className={inputClass}
                    >
                        <option value="" disabled>
                            Seçim yap
                        </option>

                        <option value="female">
                            Kadın
                        </option>

                        <option value="male">
                            Erkek
                        </option>

                        <option value="other">
                            Diğer
                        </option>

                        <option value="prefer_not_to_say">
                            Belirtmek istemiyorum
                        </option>
                    </select>
                </label>

                <label className="block">
                    <span className="text-sm text-white/60">
                        Eklemek istediğin not
                    </span>

                    <textarea
                        name="notes"
                        rows={4}
                        maxLength={1000}
                        placeholder="Sağlık durumu, deneyim seviyesi veya paylaşmak istediğin başka bir bilgi..."
                        className={textareaClass}
                    />
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-4">
                    <input
                        name="consent_accepted"
                        type="checkbox"
                        required
                        className="mt-0.5 h-5 w-5 shrink-0 accent-[#27D66B]"
                    />

                    <span className="text-sm leading-6 text-white/50">
                        Başvuru bilgilerimin etkinlik organizasyonu
                        ve iletişim amacıyla kullanılmasını kabul
                        ediyorum.
                    </span>
                </label>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-8 flex h-14 w-full items-center justify-center rounded-full bg-[#27D66B] text-sm font-semibold uppercase tracking-wider text-black transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isSubmitting
                    ? "Gönderiliyor..."
                    : "Başvuruyu gönder"}
            </button>
        </form>
    );
}