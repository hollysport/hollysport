"use client";

import { FormEvent, useState } from "react";
import { AlertCircle, Loader2, Send } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type FieldName =
    | "fullName"
    | "email"
    | "phone"
    | "subject"
    | "question"
    | "kvkk";

type FieldErrors = Partial<Record<FieldName, string>>;

function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
}

function isValidTurkishMobilePhone(value: string) {
    let digits = value.replace(/\D/g, "");

    if (digits.startsWith("90") && digits.length === 12) {
        digits = digits.slice(2);
    }

    if (digits.startsWith("0") && digits.length === 11) {
        digits = digits.slice(1);
    }

    return /^5\d{9}$/.test(digits);
}

export default function QuestionForm() {
    const supabase = createClient();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [category, setCategory] = useState("general");
    const [subject, setSubject] = useState("");
    const [question, setQuestion] = useState("");
    const [kvkkAccepted, setKvkkAccepted] = useState(false);

    const [fieldErrors, setFieldErrors] =
        useState<FieldErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

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
        const trimmedEmail = email.trim();
        const trimmedPhone = phone.trim();
        const trimmedSubject = subject.trim();
        const trimmedQuestion = question.trim();

        if (!trimmedFullName) {
            errors.fullName = "Ad ve soyad alanı boş bırakılamaz.";
        } else if (trimmedFullName.length < 3) {
            errors.fullName = "Ad ve soyad en az 3 karakter olmalı.";
        } else if (trimmedFullName.split(/\s+/).length < 2) {
            errors.fullName = "Lütfen adını ve soyadını birlikte yaz.";
        }

        if (!trimmedEmail) {
            errors.email = "E-posta adresi boş bırakılamaz.";
        } else if (!isValidEmail(trimmedEmail)) {
            errors.email =
                "Geçerli bir e-posta adresi gir. Örnek: adiniz@mail.com";
        }

        if (
            trimmedPhone &&
            !isValidTurkishMobilePhone(trimmedPhone)
        ) {
            errors.phone =
                "Telefon numarasını 05XX XXX XX XX formatında gir.";
        }

        if (!trimmedSubject) {
            errors.subject = "Başlık alanı boş bırakılamaz.";
        } else if (trimmedSubject.length < 3) {
            errors.subject = "Başlık en az 3 karakter olmalı.";
        } else if (trimmedSubject.length > 150) {
            errors.subject = "Başlık en fazla 150 karakter olabilir.";
        }

        if (!trimmedQuestion) {
            errors.question = "Sorunu yazmalısın.";
        } else if (trimmedQuestion.length < 10) {
            errors.question =
                "Sorun en az 10 karakter uzunluğunda olmalı.";
        } else if (trimmedQuestion.length > 2000) {
            errors.question =
                "Sorun en fazla 2000 karakter olabilir.";
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

        setSuccessMessage("");
        setErrorMessage("");

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
                .from("contact_questions")
                .insert({
                    full_name: fullName.trim(),
                    email: email.trim().toLowerCase(),
                    phone: phone.trim() || null,
                    category,
                    subject: subject.trim(),
                    question: question.trim(),
                    kvkk_accepted: kvkkAccepted,
                });

            if (error) {
                console.error(
                    "İletişim formu gönderim hatası:",
                    error,
                );

                setErrorMessage(
                    "Mesaj gönderilemedi. Lütfen birkaç dakika sonra tekrar dene.",
                );

                return;
            }

            setSuccessMessage(
                "Sorun başarıyla gönderildi. Holly Sport ekibi seninle iletişime geçecek.",
            );

            setFullName("");
            setEmail("");
            setPhone("");
            setCategory("general");
            setSubject("");
            setQuestion("");
            setKvkkAccepted(false);
            setFieldErrors({});
        } catch (error) {
            console.error(
                "Beklenmeyen iletişim formu hatası:",
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
        "w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-[#27D66B] focus:ring-4 focus:ring-[#27D66B]/10";

    const errorFieldClass =
        "w-full rounded-2xl border border-red-500 bg-red-50 px-4 py-3 text-zinc-950 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10";

    return (
        <form
            noValidate
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
        >
            <div className="grid gap-5 sm:grid-cols-2">
                <label htmlFor="contact-full-name">
                    <span className="mb-2 block text-sm font-semibold text-zinc-950">
                        Ad soyad
                    </span>

                    <input
                        id="contact-full-name"
                        name="fullName"
                        type="text"
                        autoComplete="name"
                        value={fullName}
                        aria-invalid={Boolean(
                            fieldErrors.fullName,
                        )}
                        aria-describedby={
                            fieldErrors.fullName
                                ? "contact-full-name-error"
                                : undefined
                        }
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
                        <span
                            id="contact-full-name-error"
                            className="mt-2 flex items-start gap-1.5 text-sm font-medium text-red-600"
                        >
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            {fieldErrors.fullName}
                        </span>
                    )}
                </label>

                <label htmlFor="contact-email">
                    <span className="mb-2 block text-sm font-semibold text-zinc-950">
                        E-posta
                    </span>

                    <input
                        id="contact-email"
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={email}
                        aria-invalid={Boolean(fieldErrors.email)}
                        aria-describedby={
                            fieldErrors.email
                                ? "contact-email-error"
                                : undefined
                        }
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
                        <span
                            id="contact-email-error"
                            className="mt-2 flex items-start gap-1.5 text-sm font-medium text-red-600"
                        >
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            {fieldErrors.email}
                        </span>
                    )}
                </label>

                <label htmlFor="contact-phone">
                    <span className="mb-2 block text-sm font-semibold text-zinc-950">
                        Telefon{" "}
                        <span className="font-normal text-zinc-400">
                            (isteğe bağlı)
                        </span>
                    </span>

                    <input
                        id="contact-phone"
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        maxLength={20}
                        value={phone}
                        aria-invalid={Boolean(fieldErrors.phone)}
                        aria-describedby={
                            fieldErrors.phone
                                ? "contact-phone-error"
                                : undefined
                        }
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
                        <span
                            id="contact-phone-error"
                            className="mt-2 flex items-start gap-1.5 text-sm font-medium text-red-600"
                        >
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            {fieldErrors.phone}
                        </span>
                    )}
                </label>

                <label htmlFor="contact-category">
                    <span className="mb-2 block text-sm font-semibold text-zinc-950">
                        Konu
                    </span>

                    <select
                        id="contact-category"
                        name="category"
                        value={category}
                        onChange={(event) =>
                            setCategory(event.target.value)
                        }
                        className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-[#27D66B] focus:ring-4 focus:ring-[#27D66B]/10"
                    >
                        <option value="general">Genel soru</option>
                        <option value="event">Etkinlikler</option>
                        <option value="membership">
                            Topluluğa katılım
                        </option>
                        <option value="volunteer">
                            Gönüllülük
                        </option>
                        <option value="support">
                            Destek olmak
                        </option>
                        <option value="corporate">
                            Kurumsal iş birliği
                        </option>
                        <option value="other">Diğer</option>
                    </select>
                </label>

                <label
                    htmlFor="contact-subject"
                    className="sm:col-span-2"
                >
                    <span className="mb-2 block text-sm font-semibold text-zinc-950">
                        Başlık
                    </span>

                    <input
                        id="contact-subject"
                        name="subject"
                        type="text"
                        maxLength={150}
                        value={subject}
                        aria-invalid={Boolean(
                            fieldErrors.subject,
                        )}
                        aria-describedby={
                            fieldErrors.subject
                                ? "contact-subject-error"
                                : undefined
                        }
                        onChange={(event) => {
                            setSubject(event.target.value);
                            clearFieldError("subject");
                            setErrorMessage("");
                        }}
                        placeholder="Sorunun kısa başlığı"
                        className={
                            fieldErrors.subject
                                ? errorFieldClass
                                : normalFieldClass
                        }
                    />

                    {fieldErrors.subject && (
                        <span
                            id="contact-subject-error"
                            className="mt-2 flex items-start gap-1.5 text-sm font-medium text-red-600"
                        >
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            {fieldErrors.subject}
                        </span>
                    )}
                </label>

                <label
                    htmlFor="contact-question"
                    className="sm:col-span-2"
                >
                    <span className="mb-2 block text-sm font-semibold text-zinc-950">
                        Sorun
                    </span>

                    <textarea
                        id="contact-question"
                        name="question"
                        maxLength={2000}
                        rows={6}
                        value={question}
                        aria-invalid={Boolean(
                            fieldErrors.question,
                        )}
                        aria-describedby={
                            fieldErrors.question
                                ? "contact-question-error"
                                : undefined
                        }
                        onChange={(event) => {
                            setQuestion(event.target.value);
                            clearFieldError("question");
                            setErrorMessage("");
                        }}
                        placeholder="Merak ettiğin konuyu detaylı şekilde yazabilirsin."
                        className={`resize-none ${fieldErrors.question
                                ? errorFieldClass
                                : normalFieldClass
                            }`}
                    />

                    <div className="mt-2 flex items-start justify-between gap-4">
                        <div>
                            {fieldErrors.question && (
                                <span
                                    id="contact-question-error"
                                    className="flex items-start gap-1.5 text-sm font-medium text-red-600"
                                >
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                    {fieldErrors.question}
                                </span>
                            )}
                        </div>

                        <span
                            className={`shrink-0 text-xs ${question.length >= 2000
                                    ? "font-semibold text-red-600"
                                    : "text-zinc-400"
                                }`}
                        >
                            {question.length}/2000
                        </span>
                    </div>
                </label>
            </div>

            <div className="mt-6">
                <label className="flex cursor-pointer items-start gap-3">
                    <input
                        type="checkbox"
                        checked={kvkkAccepted}
                        aria-invalid={Boolean(fieldErrors.kvkk)}
                        aria-describedby={
                            fieldErrors.kvkk
                                ? "contact-kvkk-error"
                                : undefined
                        }
                        onChange={(event) => {
                            setKvkkAccepted(
                                event.target.checked,
                            );
                            clearFieldError("kvkk");
                            setErrorMessage("");
                        }}
                        className="mt-1 h-4 w-4 shrink-0 accent-[#27D66B]"
                    />

                    <span className="text-sm leading-6 text-zinc-600">
                        Kişisel verilerimin soruma dönüş yapılması
                        amacıyla işlenmesine ilişkin bilgilendirmeyi
                        okudum.
                    </span>
                </label>

                {fieldErrors.kvkk && (
                    <span
                        id="contact-kvkk-error"
                        className="mt-2 flex items-start gap-1.5 text-sm font-medium text-red-600"
                    >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        {fieldErrors.kvkk}
                    </span>
                )}
            </div>

            {errorMessage && (
                <div
                    role="alert"
                    className="mt-5 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                >
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    {errorMessage}
                </div>
            )}

            {successMessage && (
                <div
                    role="status"
                    className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
                >
                    {successMessage}
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#27D66B] px-7 text-sm font-bold text-[#050505] transition hover:bg-[#45e27f] disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Gönderiliyor
                    </>
                ) : (
                    <>
                        <Send className="h-5 w-5" />
                        Sorumu Gönder
                    </>
                )}
            </button>
        </form>
    );
}