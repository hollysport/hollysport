"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";

const allowedStatuses = [
    "new",
    "reviewing",
    "contacted",
    "completed",
    "rejected",
] as const;

type DreamStatus = (typeof allowedStatuses)[number];

function isDreamStatus(value: string): value is DreamStatus {
    return allowedStatuses.includes(value as DreamStatus);
}

export async function updateDreamSubmission(
    formData: FormData,
) {
    const id = String(formData.get("id") ?? "");
    const status = String(formData.get("status") ?? "");
    const adminNote = String(
        formData.get("admin_note") ?? "",
    ).trim();

    if (!id || !isDreamStatus(status)) {
        throw new Error("Geçersiz hayal başvurusu bilgisi.");
    }

    const { supabase } = await requireAdmin();

    const { error } = await supabase
        .from("dream_submissions")
        .update({
            status,
            admin_note: adminNote || null,
        })
        .eq("id", id);

    if (error) {
        console.error(
            "Hayal başvurusu güncelleme hatası:",
            error,
        );

        throw new Error("Hayal başvurusu güncellenemedi.");
    }

    revalidatePath("/admin");
    revalidatePath("/admin/dreams");
}

export async function deleteDreamSubmission(
    formData: FormData,
) {
    const id = String(formData.get("id") ?? "");

    if (!id) {
        throw new Error("Geçersiz hayal başvurusu.");
    }

    const { supabase } = await requireAdmin();

    const { error } = await supabase
        .from("dream_submissions")
        .delete()
        .eq("id", id);

    if (error) {
        console.error(
            "Hayal başvurusu silme hatası:",
            error,
        );

        throw new Error("Hayal başvurusu silinemedi.");
    }

    revalidatePath("/admin");
    revalidatePath("/admin/dreams");
}