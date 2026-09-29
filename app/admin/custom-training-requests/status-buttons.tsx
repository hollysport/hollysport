"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, RotateCcw } from "lucide-react";

import {
    setProgramRequestStatus,
    type ProgramRequestStatus,
} from "./actions";

type ProgramRequestStatusActionsProps = {
    requestId: string;
    currentStatus: ProgramRequestStatus;
};

/*
 * Tek bir talebin durumunu değiştirir (Bekliyor ↔ İncelendi).
 * Server action service-role ile yazar; hata metni arayüzde gösterilir.
 */
export default function ProgramRequestStatusActions({
    requestId,
    currentStatus,
}: ProgramRequestStatusActionsProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [errorMessage, setErrorMessage] = useState("");

    function changeStatus(status: ProgramRequestStatus) {
        if (isPending || status === currentStatus) return;

        setErrorMessage("");
        startTransition(async () => {
            const result = await setProgramRequestStatus(
                requestId,
                status,
            );

            if (!result.success) {
                setErrorMessage(
                    result.error ??
                        "Durum güncellenemedi. Lütfen tekrar deneyin.",
                );
                return;
            }

            router.refresh();
        });
    }

    return (
        <div className="mt-5">
            <div className="inline-flex rounded-full border border-white/10 bg-[#050505] p-1">
                <button
                    type="button"
                    onClick={() => changeStatus("pending")}
                    disabled={isPending}
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-4 text-xs font-semibold transition ${
                        currentStatus === "pending"
                            ? "bg-yellow-500/15 text-yellow-300"
                            : "text-white/45 hover:text-white"
                    }`}
                >
                    {isPending &&
                    currentStatus !== "pending" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <RotateCcw className="h-3.5 w-3.5" />
                    )}
                    Bekliyor
                </button>

                <button
                    type="button"
                    onClick={() => changeStatus("reviewed")}
                    disabled={isPending}
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-4 text-xs font-semibold transition ${
                        currentStatus === "reviewed"
                            ? "bg-[#27D66B]/15 text-[#27D66B]"
                            : "text-white/45 hover:text-white"
                    }`}
                >
                    {isPending &&
                    currentStatus !== "reviewed" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Check className="h-3.5 w-3.5" />
                    )}
                    İncelendi
                </button>
            </div>

            {errorMessage && (
                <p
                    role="alert"
                    className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs leading-5 text-red-300"
                >
                    {errorMessage}
                </p>
            )}
        </div>
    );
}
