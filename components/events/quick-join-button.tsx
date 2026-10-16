"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
    CheckCircle2,
    Loader2,
    TicketCheck,
    UserCheck,
} from "lucide-react";

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
 *
 * Bildirim ayrımı:
 * - "joined"  → bu tıklamada YENİ kayıt oluşturuldu → "Kaydınız tamamlanmıştır."
 * - "existing" → veritabanında zaten vardı → "Bu etkinliğe zaten kayıtlısın."
 */
export default function QuickJoinButton({
    eventId,
    eventTitle,
    alreadyRegistered,
    variant = "card",
}: QuickJoinButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [state, setState] = useState<
        "idle" | "joined" | "existing"
    >(alreadyRegistered ? "existing" : "idle");
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const isInline = variant === "inline";

    function handleJoin() {
        if (isPending || state !== "idle") return;

        setErrorMessage("");
        setSuccessMessage("");

        startTransition(async () => {
            const result = await joinEvent(eventId);

            if (result.success) {
                setState("joined");
                setSuccessMessage(
                    result.message ?? "Kaydınız tamamlanmıştır.",
                );
                return;
            }

            /* Yalnızca sunucu gerçekten mevcut bir satır bulduysa */
            if (result.already) {
                setState("existing");
                return;
            }

            setErrorMessage(
                result.error ??
                    "Katılım oluşturulamadı. Lütfen tekrar deneyin.",
            );
        });
    }

    if (state === "existing") {
        if (isInline) {
            return (
                <div className="mt-8 rounded-2xl border border-holly-ink/25 bg-holly/10 p-5 text-center">
                    <TicketCheck className="mx-auto h-8 w-8 text-holly-ink" />

                    <p className="mt-3 text-sm font-semibold text-holly-ink">
                        Bu etkinliğe zaten kayıtlısın.
                    </p>

                    <Link
                        href="/profile"
                        className="mt-3 inline-block text-xs font-semibold uppercase tracking-wider text-ink-soft transition hover:text-holly-ink"
                    >
                        Etkinliklerimi görüntüle →
                    </Link>
                </div>
            );
        }

        return (
            <div className="h-fit rounded-3xl border border-line bg-shell p-7 text-center md:p-10">
                <TicketCheck className="mx-auto h-12 w-12 text-holly-ink" />

                <h2 className="mt-5 text-2xl font-bold text-ink">
                    Bu etkinliğe zaten kayıtlısın
                </h2>

                <p className="mt-3 leading-7 text-ink-soft">
                    &quot;{eventTitle}&quot; kaydın sistemde mevcut.
                    Katılım durumunu profil sayfandan takip
                    edebilirsin.
                </p>

                <Link
                    href="/profile"
                    className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-holly px-8 text-sm font-bold text-ink transition hover:bg-[#1fc461]"
                >
                    <UserCheck className="h-4 w-4" />
                    Etkinliklerimi Gör
                </Link>
            </div>
        );
    }

    if (state === "joined") {
        if (isInline) {
            return (
                <div
                    role="status"
                    className="mt-8 rounded-2xl border border-holly-ink/25 bg-holly/10 p-5 text-center"
                >
                    <CheckCircle2 className="mx-auto h-8 w-8 text-holly-ink" />

                    <p className="mt-3 text-sm font-semibold text-holly-ink">
                        {successMessage}
                    </p>

                    <Link
                        href="/profile"
                        className="mt-3 inline-block text-xs font-semibold uppercase tracking-wider text-ink-soft transition hover:text-holly-ink"
                    >
                        Etkinliklerimi görüntüle →
                    </Link>
                </div>
            );
        }

        return (
            <div
                role="status"
                className="h-fit rounded-3xl border border-line bg-shell p-7 text-center md:p-10"
            >
                <CheckCircle2 className="mx-auto h-12 w-12 text-holly-ink" />

                <h2 className="mt-5 text-2xl font-bold text-holly-ink">
                    {successMessage}
                </h2>

                <p className="mt-3 leading-7 text-ink-soft">
                    &quot;{eventTitle}&quot; etkinliğine başvurun
                    alındı. Durumunu profil sayfandaki
                    &quot;Etkinliklerim&quot; sekmesinden
                    takip edebilirsin.
                </p>

                <Link
                    href="/profile"
                    className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-holly px-8 text-sm font-bold text-ink transition hover:bg-[#1fc461]"
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
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-holly text-sm font-bold uppercase tracking-wider text-ink transition hover:bg-[#1fc461] active:scale-[0.98] disabled:opacity-60"
                >
                    {isPending && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {isPending
                        ? "Kaydediliyor..."
                        : "Etkinliğe Katıl"}
                </button>

                <p className="mt-3 text-center text-xs leading-5 text-ink-soft">
                    Profilindeki bilgilerinle anında başvurun alınır.
                </p>

                {errorMessage && (
                    <p
                        role="alert"
                        className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-xs leading-5 text-red-700"
                    >
                        {errorMessage}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="h-fit rounded-3xl border border-line bg-shell p-7 md:p-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-holly-ink">
                Üye katılımı
            </span>

            <h2 className="mt-4 text-2xl font-bold text-ink">
                Tek tuşla etkinliğe katıl
            </h2>

            <p className="mt-3 leading-7 text-ink-soft">
                Profilindeki bilgilerin (ad soyad, e-posta, telefon,
                cinsiyet) ile &quot;{eventTitle}&quot; etkinliğine
                başvurun hemen alınır. Başvurun admin onayından sonra
                kesinleşir.
            </p>

            <button
                type="button"
                onClick={handleJoin}
                disabled={isPending}
                className="mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-holly text-sm font-bold uppercase tracking-wider text-ink transition hover:bg-[#1fc461] active:scale-[0.98] disabled:opacity-60"
            >
                {isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {isPending ? "Kaydediliyor..." : "Etkinliğe Katıl"}
            </button>

            {errorMessage && (
                <p
                    role="alert"
                    className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                >
                    {errorMessage}
                </p>
            )}

            <Link
                href="/profile"
                className="mt-4 block text-center text-xs font-semibold uppercase tracking-wider text-ink-soft transition hover:text-holly-ink"
            >
                Profilimi görüntüle
            </Link>
        </div>
    );
}
