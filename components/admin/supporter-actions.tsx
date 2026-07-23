"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Trash2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type SupporterActionsProps = {
    supporter: {
        id: string;
        supporter_category: string;
        is_active: boolean;
    };
};

export default function SupporterActions({
    supporter,
}: SupporterActionsProps) {
    const router = useRouter();
    const supabase = createClient();

    const [category, setCategory] = useState(
        supporter.supporter_category,
    );

    const [isActive, setIsActive] = useState(
        supporter.is_active,
    );

    const [loadingAction, setLoadingAction] = useState<
        "save" | "delete" | null
    >(null);

    const [errorMessage, setErrorMessage] = useState("");

    async function handleSave() {
        setLoadingAction("save");
        setErrorMessage("");

        const { error } = await supabase
            .from("individual_supporters")
            .update({
                supporter_category: category,
                is_active: isActive,
            })
            .eq("id", supporter.id);

        setLoadingAction(null);

        if (error) {
            console.error(error);
            setErrorMessage("Destekçi güncellenemedi.");
            return;
        }

        router.refresh();
    }

    async function handleDelete() {
        const confirmed = window.confirm(
            "Bu destekçiyi listeden tamamen silmek istiyor musun?",
        );

        if (!confirmed) return;

        setLoadingAction("delete");
        setErrorMessage("");

        const { error } = await supabase
            .from("individual_supporters")
            .delete()
            .eq("id", supporter.id);

        setLoadingAction(null);

        if (error) {
            console.error(error);
            setErrorMessage("Destekçi silinemedi.");
            return;
        }

        router.refresh();
    }

    return (
        <div className="mt-5 border-t border-zinc-200 pt-5">
            <div className="grid gap-4 sm:grid-cols-2">
                <label>
                    <span className="mb-2 block text-sm font-semibold text-zinc-950">
                        Kategori
                    </span>

                    <select
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500"
                    >
                        <option value="individual">
                            Bireysel destekçi
                        </option>

                        <option value="volunteer">
                            Gönüllü destekçi
                        </option>

                        <option value="angel_investor">
                            Stratejik yatırımcı
                        </option>
                    </select>
                </label>

                <label>
                    <span className="mb-2 block text-sm font-semibold text-zinc-950">
                        Yayın durumu
                    </span>

                    <select
                        value={isActive ? "active" : "passive"}
                        onChange={(event) =>
                            setIsActive(event.target.value === "active")
                        }
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500"
                    >
                        <option value="active">
                            Ana sayfada göster
                        </option>

                        <option value="passive">
                            Ana sayfada gizle
                        </option>
                    </select>
                </label>
            </div>

            {errorMessage && (
                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
                <button
                    type="button"
                    disabled={loadingAction !== null}
                    onClick={handleSave}
                    className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
                >
                    {loadingAction === "save" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}

                    Kaydet
                </button>

                <button
                    type="button"
                    disabled={loadingAction !== null}
                    onClick={handleDelete}
                    className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                >
                    {loadingAction === "delete" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Trash2 className="h-4 w-4" />
                    )}

                    Listeden Sil
                </button>
            </div>
        </div>
    );
}