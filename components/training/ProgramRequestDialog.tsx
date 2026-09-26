"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { GOALS } from "@/lib/data/exercises";

type ProgramRequestDialogProps = {
    open: boolean;
    onClose: () => void;
};

/*
 * "Kişisel Antrenman Programı İstiyorum" modal formu.
 * Gönderimler Supabase `custom_program_requests` tablosuna yazılır.
 */
export default function ProgramRequestDialog({
    open,
    onClose,
}: ProgramRequestDialogProps) {
    const supabase = useMemo(() => createClient(), []);
    const [fullName, setFullName] = useState("");
    const [contact, setContact] = useState("");
    const [age, setAge] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [goal, setGoal] = useState(GOALS[0].key);
    const [notes, setNotes] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Esc ile kapat + arka plan kaydırmayı kilitle
    useEffect(() => {
        if (!open) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") onClose();
        }

        document.addEventListener("keydown", handleKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [open, onClose]);

    if (!open) return null;

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage("");

        if (!fullName.trim() || !contact.trim()) {
            setErrorMessage("Ad soyad ve iletişim alanları zorunludur.");
            return;
        }

        setSubmitting(true);

        const { error } = await supabase
            .from("custom_program_requests")
            .insert({
                full_name: fullName.trim(),
                contact: contact.trim(),
                age: age ? Number(age) : null,
                height: height ? Number(height) : null,
                weight: weight ? Number(weight) : null,
                goal,
                notes: notes.trim() || null,
            });

        setSubmitting(false);

        if (error) {
            console.error(error);
            setErrorMessage(
                "Talebin gönderilemedi. Lütfen tekrar dene.",
            );
            return;
        }

        setSubmitted(true);
    }

    function handleClose() {
        onClose();

        if (submitted) {
            setSubmitted(false);
            setFullName("");
            setContact("");
            setAge("");
            setHeight("");
            setWeight("");
            setNotes("");
        }
    }

    const inputClass =
        "mt-2 w-full rounded-xl border border-white/15 bg-[#050505] px-4 py-3 text-sm font-medium text-white outline-none transition placeholder:text-white/25 focus:border-[#27D66B]";

    const labelClass =
        "text-xs font-semibold uppercase tracking-wider text-white/40";

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Kişisel antrenman programı talebi"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={handleClose}
        >
            <div
                className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#111111] p-7 sm:p-9"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#27D66B]">
                            Kişiye Özel
                        </span>
                        <h2 className="mt-2 text-2xl font-bold text-white">
                            Kişisel Antrenman Programı
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-white/45">
                            Bilgilerini bırak; koç ekibimiz sana özel
                            program hazırlayıp iletişime geçsin.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Kapat"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/50 transition hover:border-white/40 hover:text-white"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {submitted ? (
                    <div className="mt-8 rounded-2xl border border-[#27D66B]/30 bg-[#27D66B]/10 p-8 text-center">
                        <CheckCircle2 className="mx-auto h-10 w-10 text-[#27D66B]" />
                        <h3 className="mt-4 text-lg font-bold text-white">
                            Talebin alındı!
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-white/50">
                            En kısa sürede seninle iletişime geçeceğiz.
                        </p>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#27D66B] px-8 text-sm font-bold text-[#050505] transition hover:bg-[#45e27f]"
                        >
                            Tamam
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <label className="block">
                            <span className={labelClass}>Ad Soyad *</span>
                            <input
                                type="text"
                                required
                                maxLength={100}
                                value={fullName}
                                onChange={(event) =>
                                    setFullName(event.target.value)
                                }
                                placeholder="Adın Soyadın"
                                className={inputClass}
                            />
                        </label>

                        <label className="block">
                            <span className={labelClass}>
                                İletişim (e-posta veya telefon) *
                            </span>
                            <input
                                type="text"
                                required
                                maxLength={120}
                                value={contact}
                                onChange={(event) =>
                                    setContact(event.target.value)
                                }
                                placeholder="ornek@mail.com veya 05xx xxx xx xx"
                                className={inputClass}
                            />
                        </label>

                        <div className="grid gap-5 sm:grid-cols-3">
                            <label className="block">
                                <span className={labelClass}>Yaş</span>
                                <input
                                    type="number"
                                    min={10}
                                    max={99}
                                    value={age}
                                    onChange={(event) =>
                                        setAge(event.target.value)
                                    }
                                    placeholder="25"
                                    className={inputClass}
                                />
                            </label>

                            <label className="block">
                                <span className={labelClass}>Boy (cm)</span>
                                <input
                                    type="number"
                                    min={100}
                                    max={230}
                                    value={height}
                                    onChange={(event) =>
                                        setHeight(event.target.value)
                                    }
                                    placeholder="178"
                                    className={inputClass}
                                />
                            </label>

                            <label className="block">
                                <span className={labelClass}>Kilo (kg)</span>
                                <input
                                    type="number"
                                    min={30}
                                    max={250}
                                    value={weight}
                                    onChange={(event) =>
                                        setWeight(event.target.value)
                                    }
                                    placeholder="74"
                                    className={inputClass}
                                />
                            </label>
                        </div>

                        <label className="block">
                            <span className={labelClass}>Hedef</span>
                            <select
                                value={goal}
                                onChange={(event) =>
                                    setGoal(
                                        event.target
                                            .value as typeof goal,
                                    )
                                }
                                className={`${inputClass} bg-[#050505]`}
                            >
                                {GOALS.map((item) => (
                                    <option key={item.key} value={item.key}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="block">
                            <span className={labelClass}>
                                Ekstra Notlar (sakatlık, ekipman vb.)
                            </span>
                            <textarea
                                rows={3}
                                maxLength={500}
                                value={notes}
                                onChange={(event) =>
                                    setNotes(event.target.value)
                                }
                                placeholder="Varsa sakatlık geçmişin, eldeki ekipman, hedefin detayı…"
                                className={`${inputClass} resize-none`}
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#27D66B] text-sm font-bold text-[#050505] transition hover:bg-[#45e27f] disabled:opacity-50"
                        >
                            {submitting && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            Program talebini gönder
                        </button>

                        {errorMessage && (
                            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                {errorMessage}
                            </p>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
}
