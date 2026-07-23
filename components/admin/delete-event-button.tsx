"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type DeleteEventButtonProps = {
    eventId: string;
    eventTitle: string;
};

export default function DeleteEventButton({
    eventId,
    eventTitle,
}: DeleteEventButtonProps) {
    const router = useRouter();
    const supabase = createClient();

    const [isDeleting, setIsDeleting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function handleDelete() {
        const confirmed = window.confirm(
            `"${eventTitle}" etkinliğini tamamen silmek istiyor musun?\n\nBu işlem geri alınamaz.`,
        );

        if (!confirmed) {
            return;
        }

        setIsDeleting(true);
        setErrorMessage("");

        const { error } = await supabase
            .from("events")
            .delete()
            .eq("id", eventId);

        setIsDeleting(false);

        if (error) {
            console.error(error);
            setErrorMessage(
                "Etkinlik silinemedi. Bağlı başvuru veya görsel kayıtları olabilir.",
            );
            return;
        }

        router.refresh();
    }

    return (
        <div className="flex flex-1 flex-col sm:flex-none">
            <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-500/10 px-5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isDeleting ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Siliniyor
                    </>
                ) : (
                    <>
                        <Trash2 className="h-4 w-4" />
                        Sil
                    </>
                )}
            </button>

            {errorMessage && (
                <p className="mt-2 max-w-xs text-xs leading-5 text-red-300">
                    {errorMessage}
                </p>
            )}
        </div>
    );
}