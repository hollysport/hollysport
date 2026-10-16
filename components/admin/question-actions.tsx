"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    CheckCircle2,
    Clock3,
    Loader2,
    Lock,
    Trash2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type QuestionActionsProps = {
    question: {
        id: string;
        status: string;
    };
};

export default function QuestionActions({
    question,
}: QuestionActionsProps) {
    const router = useRouter();
    const supabase = createClient();

    const [loadingAction, setLoadingAction] = useState<string | null>(
        null,
    );

    const [errorMessage, setErrorMessage] = useState("");

    async function updateStatus(status: string) {
        setLoadingAction(status);
        setErrorMessage("");

        const { error } = await supabase
            .from("contact_questions")
            .update({ status })
            .eq("id", question.id);

        setLoadingAction(null);

        if (error) {
            console.error(error);
            setErrorMessage("Soru durumu güncellenemedi.");
            return;
        }

        router.refresh();
    }

    async function deleteQuestion() {
        const confirmed = window.confirm(
            "Bu soruyu tamamen silmek istiyor musun?",
        );

        if (!confirmed) return;

        setLoadingAction("delete");
        setErrorMessage("");

        const { error } = await supabase
            .from("contact_questions")
            .delete()
            .eq("id", question.id);

        setLoadingAction(null);

        if (error) {
            console.error(error);
            setErrorMessage("Soru silinemedi.");
            return;
        }

        router.refresh();
    }

    return (
        <div className="mt-6 border-t border-line pt-5">
            {errorMessage && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                </div>
            )}

            <div className="flex flex-wrap gap-3">
                <button
                    type="button"
                    disabled={loadingAction !== null}
                    onClick={() => updateStatus("pending")}
                    className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink/70 transition hover:border-ink-soft hover:text-ink disabled:opacity-40"
                >
                    {loadingAction === "pending" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Clock3 className="h-4 w-4" />
                    )}

                    Bekliyor
                </button>

                <button
                    type="button"
                    disabled={loadingAction !== null}
                    onClick={() => updateStatus("answered")}
                    className="inline-flex items-center gap-2 rounded-full bg-[#27D66B] px-4 py-2 text-sm font-bold text-black transition hover:bg-[#1fc461] disabled:opacity-40"
                >
                    {loadingAction === "answered" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <CheckCircle2 className="h-4 w-4" />
                    )}

                    Cevaplandı
                </button>

                <button
                    type="button"
                    disabled={loadingAction !== null}
                    onClick={() => updateStatus("closed")}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-40"
                >
                    {loadingAction === "closed" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Lock className="h-4 w-4" />
                    )}

                    Kapat
                </button>

                <button
                    type="button"
                    disabled={loadingAction !== null}
                    onClick={deleteQuestion}
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-40"
                >
                    {loadingAction === "delete" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Trash2 className="h-4 w-4" />
                    )}

                    Sil
                </button>
            </div>
        </div>
    );
}