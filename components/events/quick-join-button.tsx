"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, UserCheck } from "lucide-react";

import { joinEvent } from "@/app/join/actions";

type QuickJoinButtonProps = {
    eventId: string;
    eventTitle: string;
    alreadyRegistered: boolean;
    /**
     * card  → /join sayfasında formun yerine tam kart (varsayılan)
     * inline → etkinlik detay sayfasında yalnızca buton + mesajlar
     */
    variant?: "card" | "inline";
};

/*
 * Giriş yapmış üyeler için tek tuşla katılım.
 * Misafir kullanıcılar için uzun başvuru formu
 * (`registration-form.tsx`) bu bileşenle değişmez; yalnızca
 * oturum açılmışsa bu buton formun yerine gösterilir.
 */
export default function QuickJoinButton({
    eventId,
    eventTitle,
    alreadyRegistered,
    variant = "card",
}: QuickJoinButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [joined, setJoined] = useState(alreadyRegistered);
    const [errorMessage, setErrorMessage] = useState("");

    const isInline = variant === "inline";

    function handleJoin() {
        if (isPending || joined) return;

        setErrorMessage("");
        startTransition(async () => {
            const result = await joinEvent(eventId);

            if (result.success || result.already) {
                setJoined(true);
                return;
            }

            setErrorMessage(
                result.error ??
                    "Katılım oluşturulamadı. Lütfen tekrar deneyin.",
            );
        });
    }

    if (joined) {
        if (isInline) {
            return (
                <div className="mt-8 rounded-2xl border border-[#27D66B]/30 bg-[#27D66B]/10 p-5 text-center">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-[#27D66B]" />

                    <p className="mt-3 text-sm font-semibold text-[#27D66B]">
                        Bu etkinliğe zaten kayıtlısın.
                    </p>

                    <Link
                        href="/profile"
                        className="mt-3 inline-block text-xs font-semibold uppercase tracking-wider text-white/50 transition hover:text-[#27D66B]"
                    >
                        Etkinliklerimi görüntüle →
                    </Link>
                </div>
            );
        }

        return (
            <div className="h-fit rounded-3xl border border-[#27D66B]/30 bg-[#111111] p-7 text-center md:p-10">
                <CheckCircle2 className="mx-auto h-12 w-12 text-[#27D66B]" />

                <h2 className="mt-5 text-2xl font-bold">
                    Kaydın mevcut
                </h2>

                <p className="mt-3 leading-7 text-white/50">
                    &quot;{eventTitle}&quot; etkinliğine zaten kayıtlısın.
                    Katılım durumunu profil sayfandan takip edebilirsin.
                </p>

                <Link
                    href="/profile"
                    className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#27D66B] px-8 text-sm font-bold text-[#050505] transition hover:bg-[#45e27f]"
                >
                    <UserCheck className="h-4 w-4" />
                    Etkinliklerimi Gör
                </Link>
            </div>
        );
    }

    if (isInline) {
        return (
            <div className="mt-8">
                <button
                    type="button"
                    onClick={handleJoin}
                    disabled={isPending}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#27D66B] text-sm font-bold uppercase tracking-wider text-[#050505] transition hover:bg-[#45e27f] active:scale-[0.98] disabled:opacity-60"
                >
                    {isPending && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {isPending
                        ? "Kaydediliyor..."
                        : "Etkinliğe Katıl"}
                </button>

                <p className="mt-3 text-center text-xs leading-5 text-white/35">
                    Profilindeki bilgilerinle anında başvurun alınır.
                </p>

                {errorMessage && (
                    <p
                        role="alert"
                        className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-xs leading-5 text-red-300"
                    >
                        {errorMessage}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="h-fit rounded-3xl border border-white/10 bg-[#111111] p-7 md:p-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#27D66B]">
                Üye katılımı
            </span>

            <h2 className="mt-4 text-2xl font-bold">
                Tek tuşla etkinliğe katıl
            </h2>

            <p className="mt-3 leading-7 text-white/50">
                Profilindeki bilgilerin (ad soyad, e-posta, telefon,
                cinsiyet) ile &quot;{eventTitle}&quot; etkinliğine
                başvurun hemen alınır. Başvurun admin onayından sonra
                kesinleşir.
            </p>

            <button
                type="button"
                onClick={handleJoin}
                disabled={isPending}
                className="mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#27D66B] text-sm font-bold uppercase tracking-wider text-[#050505] transition hover:bg-[#45e27f] active:scale-[0.98] disabled:opacity-60"
            >
                {isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {isPending ? "Kaydediliyor..." : "Etkinliğe Katıl"}
            </button>

            {errorMessage && (
                <p
                    role="alert"
                    className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300"
                >
                    {errorMessage}
                </p>
            )}

            <Link
                href="/profile"
                className="mt-4 block text-center text-xs font-semibold uppercase tracking-wider text-white/35 transition hover:text-[#27D66B]"
            >
                Profilimi görüntüle
            </Link>
        </div>
    );
}
