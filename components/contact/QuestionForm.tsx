"use client";

import { FormEvent, useState } from "react";
import { Loader2, Send } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function QuestionForm() {
    const supabase = createClient();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [category, setCategory] = useState("general");
    const [subject, setSubject] = useState("");
    const [question, setQuestion] = useState("");
    const [kvkkAccepted, setKvkkAccepted] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setSuccessMessage("");
        setErrorMessage("");

        if (!kvkkAccepted) {
            setErrorMessage("KVKK bilgilendirmesini kabul etmelisin.");
            return;
        }

        setIsSubmitting(true);

        const { error } = await supabase
            .from("contact_questions")
            .insert({
                full_name: fullName.trim(),
                email: email.trim(),
                phone: phone.trim() || null,
                category,
                subject: subject.trim(),
                question: question.trim(),
                kvkk_accepted: kvkkAccepted,
            });

        setIsSubmitting(false);

        if (error) {
            console.error(error);
            setErrorMessage(
                "Sorun gönderilemedi. Bilgileri kontrol edip tekrar dene.",
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
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
        >
            <div className="grid gap-5 sm:grid-cols-2">
                <label>
                    <span className="mb-2 block text-sm font-semibold text-zinc-950">
                        Ad soyad
                    </span>

                    <input
                        required
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        placeholder="Adınız ve soyadınız"
                        className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-[#27D66B] focus:ring-4 focus:ring-[#27D66B]/10"
                    />
                </label>

                <label>
                    <span className="mb-2 block text-sm font-semibold text-zinc-950">
                        E-posta
                    </span>

                    <input
                        required
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="ornek@mail.com"
                        className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-[#27D66B] focus:ring-4 focus:ring-[#27D66B]/10"
                    />
                </label>

                <label>
                    <span className="mb-2 block text-sm font-semibold text-zinc-950">
                        Telefon
                    </span>

                    <input
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="05XX XXX XX XX"
                        className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-[#27D66B] focus:ring-4 focus:ring-[#27D66B]/10"
                    />
                </label>

                <label>
                    <span className="mb-2 block text-sm font-semibold text-zinc-950">
                        Konu
                    </span>

                    <select
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-[#27D66B]"
                    >
                        <option value="general">Genel soru</option>
                        <option value="event">Etkinlikler</option>
                        <option value="membership">Topluluğa katılım</option>
                        <option value="volunteer">Gönüllülük</option>
                        <option value="support">Destek olmak</option>
                        <option value="corporate">Kurumsal iş birliği</option>
                        <option value="other">Diğer</option>
                    </select>
                </label>

                <label className="sm:col-span-2">
                    <span className="mb-2 block text-sm font-semibold text-zinc-950">
                        Başlık
                    </span>

                    <input
                        required
                        minLength={3}
                        maxLength={150}
                        value={subject}
                        onChange={(event) => setSubject(event.target.value)}
                        placeholder="Sorunun kısa başlığı"
                        className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-[#27D66B] focus:ring-4 focus:ring-[#27D66B]/10"
                    />
                </label>

                <label className="sm:col-span-2">
                    <span className="mb-2 block text-sm font-semibold text-zinc-950">
                        Sorun
                    </span>

                    <textarea
                        required
                        minLength={10}
                        maxLength={2000}
                        rows={6}
                        value={question}
                        onChange={(event) => setQuestion(event.target.value)}
                        placeholder="Merak ettiğin konuyu detaylı şekilde yazabilirsin."
                        className="w-full resize-none rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-[#27D66B] focus:ring-4 focus:ring-[#27D66B]/10"
                    />

                    <span className="mt-2 block text-right text-xs text-zinc-400">
                        {question.length}/2000
                    </span>
                </label>
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3">
                <input
                    required
                    type="checkbox"
                    checked={kvkkAccepted}
                    onChange={(event) => setKvkkAccepted(event.target.checked)}
                    className="mt-1 h-4 w-4 accent-[#27D66B]"
                />

                <span className="text-sm leading-6 text-zinc-600">
                    Kişisel verilerimin soruma dönüş yapılması amacıyla işlenmesine
                    ilişkin bilgilendirmeyi okudum.
                </span>
            </label>

            {errorMessage && (
                <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {errorMessage}
                </div>
            )}

            {successMessage && (
                <div className="mt-5 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
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