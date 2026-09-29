"use server";

import "server-only";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export type ProgramRequestStatus =
    | "pending"
    | "reviewed";

export type SetProgramRequestStatusResult = {
    success: boolean;
    error?: string;
};

export type DeleteProgramRequestResult = {
    success: boolean;
    error?: string;
};

const ALLOWED_STATUSES: ProgramRequestStatus[] = [
    "pending",
    "reviewed",
];

/*
 * Admin: özel antrenman talebinin durumunu değiştirir.
 * Yazma service-role ile yapılır (admin oturumu requireAdmin ile
 * doğrulanır), böylece tabloda RLS INSERT/UPDATE politikası olsa
 * bile engellenmez.
 */
export async function setProgramRequestStatus(
    requestId: string,
    status: ProgramRequestStatus,
): Promise<SetProgramRequestStatusResult> {
    try {
        await requireAdmin();

        if (!requestId) {
            return {
                success: false,
                error: "Talep bulunamadı.",
            };
        }

        if (!ALLOWED_STATUSES.includes(status)) {
            return {
                success: false,
                error: "Geçersiz durum.",
            };
        }

        const supabaseAdmin = createAdminClient();

        const { error } = await supabaseAdmin
            .from("custom_program_requests")
            .update({ status })
            .eq("id", requestId);

        if (error) {
            console.error(
                "setProgramRequestStatus: güncelleme hatası:",
                {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint,
                    requestId,
                    status,
                },
            );

            /* `status` kolonu henüz yoksa (PGRST204) SQL'i kullanıcıya göster */
            const sqlHint =
                error.code === "PGRST204"
                    ? " — Durum kolonu eksik; Supabase dashboard'da çalıştır: alter table public.custom_program_requests add column if not exists status text not null default 'pending';"
                    : "";

            return {
                success: false,
                error: `Durum güncellenemedi (${error.code ?? "?"}): ${error.message}${sqlHint}`,
            };
        }

        console.log(
            `setProgramRequestStatus: durum güncellendi (request=${requestId}, status=${status})`,
        );

        revalidatePath("/admin/custom-training-requests");

        return { success: true };
    } catch (unexpectedError) {
        const message =
            unexpectedError instanceof Error
                ? unexpectedError.message
                : String(unexpectedError);

        console.error(
            "setProgramRequestStatus beklenmeyen hata:",
            {
                message,
                stack:
                    unexpectedError instanceof Error
                        ? unexpectedError.stack
                        : undefined,
                requestId,
                status,
            },
        );

        return {
            success: false,
            error: `Durum güncellenemedi: ${message}`,
        };
    }
}

/*
 * Admin: özel antrenman talebini kalıcı olarak siler.
 * Silme service-role ile yapılır (admin oturumu requireAdmin ile
 * doğrulanır), böylece tabloda DELETE politikası olmasa da engellenmez.
 * Silinen kayıt yoksa (zaten silinmiş) bu ayrı bir hata olarak döner.
 */
export async function deleteProgramRequest(
    requestId: string,
): Promise<DeleteProgramRequestResult> {
    try {
        await requireAdmin();

        if (!requestId) {
            return {
                success: false,
                error: "Talep bulunamadı.",
            };
        }

        const supabaseAdmin = createAdminClient();

        const { data, error } = await supabaseAdmin
            .from("custom_program_requests")
            .delete()
            .eq("id", requestId)
            .select("id");

        if (error) {
            console.error(
                "deleteProgramRequest: silme hatası:",
                {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint,
                    requestId,
                },
            );

            return {
                success: false,
                error: `Talep silinemedi (${error.code ?? "?"}): ${error.message}`,
            };
        }

        if (!data || data.length === 0) {
            console.warn(
                "deleteProgramRequest: silinecek kayıt bulunamadı:",
                { requestId },
            );

            return {
                success: false,
                error: "Talep bulunamadı (kayıt zaten silinmiş olabilir).",
            };
        }

        console.log(
            `deleteProgramRequest: talep silindi (request=${requestId})`,
        );

        // Liste anında tazelensin (silinen öğe ekrandan kaybolsun)
        revalidatePath("/admin/custom-training-requests");

        return { success: true };
    } catch (unexpectedError) {
        const message =
            unexpectedError instanceof Error
                ? unexpectedError.message
                : String(unexpectedError);

        console.error(
            "deleteProgramRequest beklenmeyen hata:",
            {
                message,
                stack:
                    unexpectedError instanceof Error
                        ? unexpectedError.stack
                        : undefined,
                requestId,
            },
        );

        return {
            success: false,
            error: `Talep silinemedi: ${message}`,
        };
    }
}
