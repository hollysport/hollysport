"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
    AlertCircle,
    CheckCircle2,
    Loader2,
    Send,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type FieldName =
    | "fullName"
    | "phone"
    | "email"
    | "dreamTitle"
    | "dreamDescription"
    | "kvkk";

type FieldErrors = Partial<Record<FieldName, string>>;

function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
}

function isValidTurkishPhone(value: string) {
    let digits = value.replace(/\D/g, "");

    if (digits.startsWith("90") && digits.length === 12) {
        digits = digits.slice(2);
    }

    if (digits.startsWith("0") && digits.length === 11) {
        digits = digits.slice(1);
    }

    return /^5\d{9}$/.test(digits);
}

export default function DreamForm() {
    const supabase = createClient();

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [dreamTitle, setDreamTitle] = useState("");
    const [dreamDescription, setDreamDescription] =
        useState("");
    const [kvkkAccepted, setKvkkAccepted] =
        useState(false);

    const [fieldErrors, setFieldErrors] =
        useState<FieldErrors>({});
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] =
        useState("");
    const [isSubmitting, setIsSubmitting] =
        useState(false);

    function clearFieldError(field: FieldName) {
        setFieldErrors((currentErrors) => {
            if (!currentErrors[field]) {
                return currentErrors;
            }

            const nextErrors = { ...currentErrors };
            delete nextErrors[field];

            return nextErrors;
        });
    }

    function validateForm() {
        const errors: FieldErrors = {};

        const trimmedFullName = fullName.trim();
        const trimmedPhone = phone.trim();
        const trimmedEmail = email.trim();
        const trimmedDreamTitle = dreamTitle.trim();
        const trimmedDreamDescription =
            dreamDescription.trim();

        if (!trimmedFullName) {
            errors.fullName =
                "İsim soyisim alanı boş bırakılamaz.";
        } else if (trimmedFullName.length < 3) {
            errors.fullName =
                "İsim soyisim en az 3 karakter olmalı.";
        }

        if (!trimmedPhone) {
            errors.phone =
                "Telefon numarası boş bırakılamaz.";
        } else if (!isValidTurkishPhone(trimmedPhone)) {
            errors.phone =
                "Telefon numarasını 05XX XXX XX XX formatında gir.";
        }

        if (!trimmedEmail) {
            errors.email =
                "E-posta adresi boş bırakılamaz.";
        } else if (!isValidEmail(trimmedEmail)) {
            errors.email =
                "Geçerli bir e-posta adresi gir. Örnek: adiniz@mail.com";
        }

        if (!trimmedDreamTitle) {
            errors.dreamTitle =
                "Hayalinin kısa başlığını yazmalısın.";
        } else if (trimmedDreamTitle.length < 3) {
            errors.dreamTitle =
                "Hayal başlığı en az 3 karakter olmalı.";
        } else if (trimmedDreamTitle.length > 120) {
            errors.dreamTitle =
                "Hayal başlığı en fazla 120 karakter olabilir.";
        }

        if (!trimmedDreamDescription) {
            errors.dreamDescription =
                "Hayalini açıklamalısın.";
        } else if (
            trimmedDreamDescription.length < 10
        ) {
            errors.dreamDescription =
                "Hayalini en az 10 karakterle açıklamalısın.";
        } else if (
            trimmedDreamDescription.length > 2000
        ) {
            errors.dreamDescription =
                "Açıklama en fazla 2000 karakter olabilir.";
        }

        if (!kvkkAccepted) {
            errors.kvkk =
                "KVKK bilgilendirmesini kabul etmelisin.";
        }

        return errors;
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");

        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setFieldErrors(validationErrors);
            setErrorMessage(
                "Formdaki hatalı alanları kontrol et.",
            );
            return;
        }

        setFieldErrors({});
        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from("dream_submissions")
                .insert({
                    full_name: fullName.trim(),
                    phone: phone.trim(),
                    email: email.trim().toLowerCase(),
                    dream_title: dreamTitle.trim(),
                    dream_description:
                        dreamDescription.trim(),
                    kvkk_accepted: kvkkAccepted,
                });

            if (error) {
                console.error(
                    "Hayal başvurusu gönderim hatası:",
                    error,
                );

                setErrorMessage(
                    "Hayalin gönderilemedi. Bilgilerini kontrol edip tekrar dene.",
                );

                return;
            }

            setSuccessMessage(
                "Hayalin bize ulaştı. Holly Sport ekibi başvurunu inceleyecek ve uygun görülmesi hâlinde seninle iletişime geçecek.",
            );

            setFullName("");
            setPhone("");
            setEmail("");
            setDreamTitle("");
            setDreamDescription("");
            setKvkkAccepted(false);
            setFieldErrors({});
        } catch (error) {
            console.error(
                "Beklenmeyen hayal formu hatası:",
                error,
            );

            setErrorMessage(
                "Beklenmeyen bir hata oluştu. İnternet bağlantını kontrol edip tekrar dene.",
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    const normalFieldClass =
        "form-field-dark w-full rounded-2xl border border-white/10 px-4 py-3.5 text-white outline-none transition focus:border-[#27D66B] focus:ring-4 focus:ring-[#27D66B]/10";

    const errorFieldClass =
        "form-field-dark w-full rounded-2xl border border-red-500 px-4 py-3.5 text-white outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10";

    return (
        <form
            noValidate
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-white/10 bg-[#101010] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.4)] sm:p-8"
        >
            <div className="mb-8">
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#27D66B]">
                    Hayalini paylaş
                </p>

                <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-white">
                    Aklındaki hedefi bize anlat.
                </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <label htmlFor="dream-full-name">
                    <span className="mb-2 block text-sm font-semibold text-white">
                        İsim soyisim
                    </span>

                    <input
                        id="dream-full-name"
                        type="text"
                        autoComplete="name"
                        value={fullName}
                        aria-invalid={Boolean(
                            fieldErrors.fullName,
                        )}
                        onChange={(event) => {
                            setFullName(event.target.value);
                            clearFieldError("fullName");
                            setErrorMessage("");
                        }}
                        placeholder="Adınız ve soyadınız"
                        className={
                            fieldErrors.fullName
                                ? errorFieldClass
                                : normalFieldClass
                        }
                    />

                    {fieldErrors.fullName && (
                        <FieldError
                            message={fieldErrors.fullName}
                        />
                    )}
                </label>

                <label htmlFor="dream-phone">
                    <span className="mb-2 block text-sm font-semibold text-white">
                        Telefon
                    </span>

                    <input
                        id="dream-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={phone}
                        maxLength={20}
                        aria-invalid={Boolean(
                            fieldErrors.phone,
                        )}
                        onChange={(event) => {
                            setPhone(event.target.value);
                            clearFieldError("phone");
                            setErrorMessage("");
                        }}
                        placeholder="05XX XXX XX XX"
                        className={
                            fieldErrors.phone
                                ? errorFieldClass
                                : normalFieldClass
                        }
                    />

                    {fieldErrors.phone && (
                        <FieldError
                            message={fieldErrors.phone}
                        />
                    )}
                </label>

                <label
                    htmlFor="dream-email"
                    className="sm:col-span-2"
                >
                    <span className="mb-2 block text-sm font-semibold text-white">
                        E-posta
                    </span>

                    <input
                        id="dream-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={email}
                        aria-invalid={Boolean(
                            fieldErrors.email,
                        )}
                        onChange={(event) => {
                            setEmail(event.target.value);
                            clearFieldError("email");
                            setErrorMessage("");
                        }}
                        placeholder="ornek@mail.com"
                        className={
                            fieldErrors.email
                                ? errorFieldClass
                                : normalFieldClass
                        }
                    />

                    {fieldErrors.email && (
                        <FieldError
                            message={fieldErrors.email}
                        />
                    )}
                </label>

                <label
                    htmlFor="dream-title"
                    className="sm:col-span-2"
                >
                    <span className="mb-2 block text-sm font-semibold text-white">
                        Kısaca hayaliniz
                    </span>

                    <input
                        id="dream-title"
                        type="text"
                        maxLength={120}
                        value={dreamTitle}
                        aria-invalid={Boolean(
                            fieldErrors.dreamTitle,
                        )}
                        onChange={(event) => {
                            setDreamTitle(event.target.value);
                            clearFieldError("dreamTitle");
                            setErrorMessage("");
                        }}
                        placeholder="Örnek: Likya Yolu’nu yürümek, Ağrı Dağı’na tırmanmak"
                        className={
                            fieldErrors.dreamTitle
                                ? errorFieldClass
                                : normalFieldClass
                        }
                    />

                    <div className="mt-2 flex items-start justify-between gap-4">
                        <div>
                            {fieldErrors.dreamTitle && (
                                <FieldError
                                    message={
                                        fieldErrors.dreamTitle
                                    }
                                />
                            )}
                        </div>

                        <span className="shrink-0 text-xs text-white/30">
                            {dreamTitle.length}/120
                        </span>
                    </div>
                </label>

                <label
                    htmlFor="dream-description"
                    className="sm:col-span-2"
                >
                    <span className="mb-2 block text-sm font-semibold text-white">
                        Hayalinizi açıklayın
                    </span>

                    <textarea
                        id="dream-description"
                        rows={7}
                        maxLength={2000}
                        value={dreamDescription}
                        aria-invalid={Boolean(
                            fieldErrors.dreamDescription,
                        )}
                        onChange={(event) => {
                            setDreamDescription(
                                event.target.value,
                            );
                            clearFieldError(
                                "dreamDescription",
                            );
                            setErrorMessage("");
                        }}
                        placeholder="Bu hayalin senin için neden önemli olduğunu ve gerçekleştirmek için nasıl bir desteğe ihtiyaç duyduğunu anlatabilirsin."
                        className={`resize-none ${fieldErrors.dreamDescription
                                ? errorFieldClass
                                : normalFieldClass
                            }`}
                    />

                    <div className="mt-2 flex items-start justify-between gap-4">
                        <div>
                            {fieldErrors.dreamDescription && (
                                <FieldError
                                    message={
                                        fieldErrors.dreamDescription
                                    }
                                />
                            )}
                        </div>

                        <span className="shrink-0 text-xs text-white/30">
                            {dreamDescription.length}/2000
                        </span>
                    </div>
                </label>
            </div>

            <div className="mt-6">
                <label className="flex cursor-pointer items-start gap-3">
                    <input
                        type="checkbox"
                        checked={kvkkAccepted}
                        aria-invalid={Boolean(
                            fieldErrors.kvkk,
                        )}
                        onChange={(event) => {
                            setKvkkAccepted(
                                event.target.checked,
                            );
                            clearFieldError("kvkk");
                            setErrorMessage("");
                        }}
                        className="mt-1 h-4 w-4 shrink-0 accent-[#27D66B]"
                    />

                    <span className="text-sm leading-6 text-white/55">
                        Kişisel verilerimin başvurumun
                        değerlendirilmesi ve benimle iletişime
                        geçilmesi amacıyla işlenmesini kabul
                        ediyorum.{" "}
                        <Link
                            href="/kvkk"
                            className="font-semibold text-[#27D66B] underline underline-offset-4"
                        >
                            KVKK metni
                        </Link>
                    </span>
                </label>

                {fieldErrors.kvkk && (
                    <FieldError
                        message={fieldErrors.kvkk}
                    />
                )}
            </div>

            {errorMessage && (
                <div
                    role="alert"
                    className="mt-5 flex items-start gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300"
                >
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    {errorMessage}
                </div>
            )}

            {successMessage && (
                <div
                    role="status"
                    className="mt-5 flex items-start gap-2 rounded-2xl border border-[#27D66B]/20 bg-[#27D66B]/10 px-4 py-4 text-sm font-medium leading-6 text-[#65e995]"
                >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                    {successMessage}
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-7 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#27D66B] px-7 text-sm font-bold uppercase tracking-wider text-[#050505] transition hover:bg-[#45e27f] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Gönderiliyor
                    </>
                ) : (
                    <>
                        <Send className="h-5 w-5" />
                        Hayalimi Gönder
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
        <span className="mt-2 flex items-start gap-1.5 text-sm font-medium text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {message}
        </span>
    );
}