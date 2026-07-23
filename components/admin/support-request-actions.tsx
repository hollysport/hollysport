"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Check,
    Loader2,
    PhoneCall,
    Trash2,
    X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type NameVisibility =
    | "full"
    | "surname_masked"
    | "initials_masked";

type SupportRequestActionsProps = {
    request: {
        id: string;
        full_name: string;
        name_visibility: NameVisibility;
        display_consent: boolean;
        support_types: string[];
        status: string;
    };
};

function maskSurname(fullName: string) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);

    if (parts.length < 2) {
        return parts[0] || "Destekçi";
    }

    const surname = parts.at(-1) ?? "";

    const maskedSurname =
        surname.charAt(0).toLocaleUpperCase("tr-TR") +
        "*".repeat(Math.max(surname.length - 1, 4));

    return [...parts.slice(0, -1), maskedSurname].join(" ");
}

function maskAllNames(fullName: string) {
    return fullName
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(
            (part) =>
                part.charAt(0).toLocaleUpperCase("tr-TR") +
                "*".repeat(Math.max(part.length - 1, 3)),
        )
        .join(" ");
}

function formatDisplayName(
    fullName: string,
    visibility: NameVisibility,
) {
    if (visibility === "surname_masked") {
        return maskSurname(fullName);
    }

    if (visibility === "initials_masked") {
        return maskAllNames(fullName);
    }

    return fullName.trim();
}

export default function SupportRequestActions({
    request,
}: SupportRequestActionsProps) {
    const router = useRouter();
    const supabase = createClient();

    const defaultCategory = request.support_types.includes(
        "financial_support",
    )
        ? "angel_investor"
        : request.support_types.includes("volunteer")
            ? "volunteer"
            : "individual";

    const [supporterCategory, setSupporterCategory] =
        useState(defaultCategory);

    const [loadingAction, setLoadingAction] = useState<
        "contacted" | "approved" | "rejected" | "delete" | null
    >(null);

    const [errorMessage, setErrorMessage] = useState("");

    async function updateStatus(
        status: "contacted" | "rejected",
    ) {
        setLoadingAction(status);
        setErrorMessage("");

        const { error } = await supabase
            .from("support_requests")
            .update({ status })
            .eq("id", request.id);

        setLoadingAction(null);

        if (error) {
            console.error(error);
            setErrorMessage("Başvuru durumu güncellenemedi.");
            return;
        }

        router.refresh();
    }

    async function approveAndPublish() {
        setLoadingAction("approved");
        setErrorMessage("");

        if (!request.display_consent) {
            setLoadingAction(null);
            setErrorMessage(
                "Bu kişi isminin destekçiler alanında yayımlanmasına izin vermemiş.",
            );
            return;
        }

        const displayName = formatDisplayName(
            request.full_name,
            request.name_visibility,
        );

        const { error: supporterError } = await supabase
            .from("individual_supporters")
            .upsert(
                {
                    support_request_id: request.id,
                    display_name: displayName,
                    support_types: request.support_types,
                    supporter_category: supporterCategory,
                    is_active: true,
                },
                {
                    onConflict: "support_request_id",
                },
            );

        if (supporterError) {
            console.error(supporterError);
            setLoadingAction(null);
            setErrorMessage("Destekçi ana sayfaya eklenemedi.");
            return;
        }

        const { error: requestError } = await supabase
            .from("support_requests")
            .update({ status: "approved" })
            .eq("id", request.id);

        setLoadingAction(null);

        if (requestError) {
            console.error(requestError);
            setErrorMessage("Başvuru durumu güncellenemedi.");
            return;
        }

        router.refresh();
    }

    async function handleDelete() {
        const confirmed = window.confirm(
            `${request.full_name} adlı kişinin destek başvurusu kalıcı olarak silinsin mi?`,
        );

        if (!confirmed) {
            return;
        }

        setLoadingAction("delete");
        setErrorMessage("");

        const { error } = await supabase
            .from("support_requests")
            .delete()
            .eq("id", request.id);

        setLoadingAction(null);

        if (error) {
            console.error(error);
            setErrorMessage("Destek başvurusu silinemedi.");
            return;
        }

        router.refresh();
    }

    return (
        <div className="mt-6 border-t border-zinc-200 pt-5">
            <label className="block">
                <span className="mb-2 block text-sm font-semibold text-zinc-950">
                    Ana sayfadaki destekçi kategorisi
                </span>

                <select
                    value={supporterCategory}
                    onChange={(event) =>
                        setSupporterCategory(event.target.value)
                    }
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none focus:border-orange-500"
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

            {errorMessage && (
                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
                <button
                    type="button"
                    disabled={loadingAction !== null}
                    onClick={() => updateStatus("contacted")}
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950 disabled:opacity-50"
                >
                    {loadingAction === "contacted" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <PhoneCall className="h-4 w-4" />
                    )}

                    İletişime Geçildi
                </button>

                <button
                    type="button"
                    disabled={loadingAction !== null}
                    onClick={approveAndPublish}
                    className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                >
                    {loadingAction === "approved" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Check className="h-4 w-4" />
                    )}

                    Onayla ve Yayınla
                </button>

                <button
                    type="button"
                    disabled={loadingAction !== null}
                    onClick={() => updateStatus("rejected")}
                    className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                >
                    {loadingAction === "rejected" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <X className="h-4 w-4" />
                    )}

                    Reddet
                </button>

                <button
                    type="button"
                    disabled={loadingAction !== null}
                    onClick={handleDelete}
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-500 hover:bg-red-50 disabled:opacity-50"
                >
                    {loadingAction === "delete" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Trash2 className="h-4 w-4" />
                    )}

                    Başvuruyu Sil
                </button>
            </div>
        </div>
    );
}