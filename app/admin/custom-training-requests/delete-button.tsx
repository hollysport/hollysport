"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

import { deleteProgramRequest } from "./actions";

type ProgramRequestDeleteButtonProps = {
    requestId: string;
    fullName: string;
};

/*
 * Tek bir talebi kalıcı olarak siler (iki adımlı onay: Sil →
 * Evet, sil / Vazgeç). Sunucu tarafı action `revalidatePath`
 * ile listeyi yeniler; buradaki `router.refresh()` aynı anda
 * mevcut görünümü de tazeler. Hata metni kartın altında görünür.
 */
export default function ProgramRequestDeleteButton({
    requestId,
    fullName,
}: ProgramRequestDeleteButtonProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [confirming, setConfirming] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    function handleDelete() {
        if (isPending) return;

        setErrorMessage("");
        setConfirming(false);

        startTransition(async () => {
            const result = await deleteProgramRequest(requestId);

            if (!result.success) {
                setErrorMessage(
                    result.error ??
                        "Talep silinemedi. Lütfen tekrar deneyin.",
                );
                return;
            }

            router.refresh();
        });
    }

    return (
        <div className="flex shrink-0 flex-col items-end gap-2">
            {!confirming ? (
                <button
                    type="button"
                    onClick={() => setConfirming(true)}
                    disabled={isPending}
                    aria-label={`${fullName} talebini sil`}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-4 text-xs font-semibold text-red-300 transition hover:border-red-400/60 hover:bg-red-500/20 hover:text-red-200 disabled:opacity-50"
                >
                    {isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Sil
                </button>
            ) : (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 p-1 pl-3">
                    <span className="text-xs font-semibold text-red-200">
                        Silinsin mi?
                    </span>

                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isPending}
                        className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-red-500 px-3 text-xs font-bold text-white transition hover:bg-red-400 disabled:opacity-50"
                    >
                        {isPending && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        Evet, sil
                    </button>

                    <button
                        type="button"
                        onClick={() => setConfirming(false)}
                        disabled={isPending}
                        className="inline-flex min-h-8 items-center rounded-full px-3 text-xs font-semibold text-white/50 transition hover:text-white disabled:opacity-50"
                    >
                        Vazgeç
                    </button>
                </div>
            )}

            {errorMessage && (
                <p
                    role="alert"
                    className="max-w-[16rem] rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-right text-xs leading-5 text-red-300"
                >
                    {errorMessage}
                </p>
            )}
        </div>
    );
}
