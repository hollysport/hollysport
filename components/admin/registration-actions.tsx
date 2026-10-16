"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type RegistrationStatus =
    | "pending"
    | "approved"
    | "rejected"
    | "waitlist"
    | "cancelled";

type RegistrationActionsProps = {
    registrationId: string;
    currentStatus: RegistrationStatus;
    applicantName: string;
};

const statusActions: Array<{
    status: "approved" | "waitlist";
    label: string;
    className: string;
}> = [
    {
        status: "approved",
        label: "Onayla",
        className:
            "bg-[#27D66B] text-black hover:scale-[1.03]",
    },
    {
        status: "waitlist",
        label: "Bekleme listesi",
        className:
            "border border-yellow-200 text-yellow-700 hover:bg-yellow-50",
    },
];

export default function RegistrationActions({
    registrationId,
    currentStatus,
    applicantName,
}: RegistrationActionsProps) {
    const router = useRouter();

    const [isPending, startTransition] = useTransition();
    const [loadingAction, setLoadingAction] = useState<
        "status" | "reject-delete" | "delete" | null
    >(null);

    const [errorMessage, setErrorMessage] = useState("");

    function changeStatus(
        nextStatus: "approved" | "waitlist",
    ) {
        if (nextStatus === currentStatus || isPending) {
            return;
        }

        setErrorMessage("");
        setLoadingAction("status");

        startTransition(async () => {
            const supabase = createClient();

            const { error } = await supabase.rpc(
                "review_event_registration",
                {
                    p_registration_id: registrationId,
                    p_new_status: nextStatus,
                },
            );

            setLoadingAction(null);

            if (error) {
                setErrorMessage(
                    `Başvuru güncellenemedi: ${error.message}`,
                );
                return;
            }

            router.refresh();
        });
    }

    function rejectAndDelete() {
        if (isPending) {
            return;
        }

        const confirmed = window.confirm(
            `${applicantName} adlı kişinin başvurusu reddedilip kalıcı olarak silinsin mi?`,
        );

        if (!confirmed) {
            return;
        }

        setErrorMessage("");
        setLoadingAction("reject-delete");

        startTransition(async () => {
            const supabase = createClient();

            /*
             * Önce RPC ile reddediyoruz.
             * Başvuru daha önce onaylandıysa participant_count
             * bu aşamada otomatik olarak azaltılır.
             */
            const { error: statusError } = await supabase.rpc(
                "review_event_registration",
                {
                    p_registration_id: registrationId,
                    p_new_status: "rejected",
                },
            );

            if (statusError) {
                setLoadingAction(null);
                setErrorMessage(
                    `Başvuru reddedilemedi: ${statusError.message}`,
                );
                return;
            }

            const { error: deleteError } = await supabase
                .from("event_registrations")
                .delete()
                .eq("id", registrationId);

            setLoadingAction(null);

            if (deleteError) {
                setErrorMessage(
                    `Başvuru reddedildi ancak silinemedi: ${deleteError.message}`,
                );
                return;
            }

            router.refresh();
        });
    }

    function deleteRegistration() {
        if (isPending) {
            return;
        }

        const confirmed = window.confirm(
            `${applicantName} adlı kişinin başvurusu kalıcı olarak silinsin mi?`,
        );

        if (!confirmed) {
            return;
        }

        setErrorMessage("");
        setLoadingAction("delete");

        startTransition(async () => {
            const supabase = createClient();

            /*
             * Onaylanmış kayıt doğrudan silinirse katılımcı
             * sayısı yüksek kalabilir. Önce cancelled durumuna
             * geçirerek RPC'nin sayacı düzeltmesini sağlıyoruz.
             */
            if (currentStatus === "approved") {
                const { error: statusError } = await supabase.rpc(
                    "review_event_registration",
                    {
                        p_registration_id: registrationId,
                        p_new_status: "cancelled",
                    },
                );

                if (statusError) {
                    setLoadingAction(null);
                    setErrorMessage(
                        `Katılımcı sayısı güncellenemedi: ${statusError.message}`,
                    );
                    return;
                }
            }

            const { error: deleteError } = await supabase
                .from("event_registrations")
                .delete()
                .eq("id", registrationId);

            setLoadingAction(null);

            if (deleteError) {
                setErrorMessage(
                    `Başvuru silinemedi: ${deleteError.message}`,
                );
                return;
            }

            router.refresh();
        });
    }

    return (
        <div>
            <div className="flex flex-wrap gap-2">
                {statusActions.map((action) => {
                    const isCurrent =
                        currentStatus === action.status;

                    return (
                        <button
                            key={action.status}
                            type="button"
                            onClick={() =>
                                changeStatus(action.status)
                            }
                            disabled={isPending || isCurrent}
                            className={`flex h-10 items-center justify-center rounded-full px-4 text-xs font-semibold uppercase tracking-wider transition-all disabled:cursor-not-allowed disabled:opacity-35 ${action.className}`}
                        >
                            {isCurrent
                                ? `${action.label} ✓`
                                : loadingAction === "status"
                                  ? "İşleniyor..."
                                  : action.label}
                        </button>
                    );
                })}

                <button
                    type="button"
                    onClick={rejectAndDelete}
                    disabled={isPending}
                    className="flex h-10 items-center justify-center rounded-full border border-red-200 px-4 text-xs font-semibold uppercase tracking-wider text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-35"
                >
                    {loadingAction === "reject-delete"
                        ? "Siliniyor..."
                        : "Reddet ve Sil"}
                </button>

                <button
                    type="button"
                    onClick={deleteRegistration}
                    disabled={isPending}
                    className="flex h-10 items-center justify-center gap-2 rounded-full border border-line px-4 text-xs font-semibold uppercase tracking-wider text-ink-soft transition hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-35"
                >
                    <Trash2 className="h-4 w-4" />

                    {loadingAction === "delete"
                        ? "Siliniyor..."
                        : "Başvuruyu Sil"}
                </button>
            </div>

            {errorMessage && (
                <p className="mt-3 max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
                    {errorMessage}
                </p>
            )}
        </div>
    );
}