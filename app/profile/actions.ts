"use server";

import "server-only";

import { createClient as createJsClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type DeleteAccountResult = {
    success: boolean;
    error?: string;
};

export type SaveProfileInput = {
    fullName: string;
    gender: string | null;
    phone: string | null;
    sports: string[];
    avatar: string | null;
};

export type SaveProfileResult = {
    success: boolean;
    error?: string;
};

export type CancelRegistrationResult = {
    success: boolean;
    error?: string;
};

/*
 * Profil sayfasındaki "Etkinliklerim" listesinden katılım iptali.
 * - Kimlik cookie tabanlı SSR oturumu ile doğrulanır.
 * - Yalnızca `user_id` kendi kimliğiyle eşleşen satır silinebilir
 *   (misafir başvuruları `user_id = null` → bu yoldan silinemez).
 * - Onaylanmış kayıtta önce `review_event_registration` RPC'si
 *   `cancelled` yapar ki `participant_count` düşsün; RPC çalışmazsa
 *   sayaç manuel olarak azaltılır, sonra satır silinir.
 */
export async function cancelEventRegistration(
    registrationId: string,
): Promise<CancelRegistrationResult> {
    if (!registrationId) {
        return {
            success: false,
            error: "Kayıt bulunamadı.",
        };
    }

    // 1) Kimlik doğrulama
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return {
            success: false,
            error: "Oturum bulunamadı. Lütfen yeniden giriş yap.",
        };
    }

    // 2) Service-role client (env kontrolü ile)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey =
        process.env.SUPABASE_SECRET_KEY ??
        process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error(
            "cancelEventRegistration: eksik env (SUPABASE_SECRET_KEY)",
        );
        return {
            success: false,
            error: "Sunucu yapılandırması eksik.",
        };
    }

    const supabaseAdmin = createJsClient<Database>(
        supabaseUrl,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
                detectSessionInUrl: false,
            },
        },
    );

    // 3) Kaydı oku + sahiplik kontrolü
    const { data: registration, error: fetchError } =
        await supabaseAdmin
            .from("event_registrations")
            .select("id, user_id, event_id, status, email")
            .eq("id", registrationId)
            .maybeSingle();

    if (fetchError || !registration) {
        console.error(
            "cancelEventRegistration: kayıt okunamadı:",
            {
                message: fetchError?.message,
                code: fetchError?.code,
                registrationId,
                userId: user.id,
            },
        );
        return {
            success: false,
            error: "Kayıt bulunamadı. Sayfayı yenileyip tekrar deneyin.",
        };
    }

    if (registration.user_id !== user.id) {
        console.error(
            "cancelEventRegistration: sahiplik reddedildi:",
            {
                registrationId,
                owner: registration.user_id,
                requester: user.id,
            },
        );
        return {
            success: false,
            error: "Bu katılımı iptal etme yetkiniz yok.",
        };
    }

    // 4) Onaylı kayıtta önce sayacı düzelt
    if (registration.status === "approved") {
        const { error: rpcError } = await supabaseAdmin.rpc(
            "review_event_registration",
            {
                p_registration_id: registrationId,
                p_new_status: "cancelled",
            },
        );

        if (rpcError) {
            console.warn(
                "cancelEventRegistration: RPC başarısız, sayaç manuel düşürülüyor:",
                { message: rpcError.message, code: rpcError.code },
            );

            const { data: eventRow } = await supabaseAdmin
                .from("events")
                .select("id, participant_count")
                .eq("id", registration.event_id)
                .maybeSingle();

            if (eventRow) {
                const { error: countError } = await supabaseAdmin
                    .from("events")
                    .update({
                        participant_count: Math.max(
                            0,
                            eventRow.participant_count - 1,
                        ),
                    })
                    .eq("id", eventRow.id);

                if (countError) {
                    console.error(
                        "cancelEventRegistration: sayaç güncellenemedi:",
                        {
                            message: countError.message,
                            code: countError.code,
                        },
                    );
                }
            }
        }
    }

    // 5) Kaydı sil
    const { error: deleteError } = await supabaseAdmin
        .from("event_registrations")
        .delete()
        .eq("id", registrationId);

    if (deleteError) {
        console.error(
            "cancelEventRegistration: silme hatası:",
            {
                message: deleteError.message,
                code: deleteError.code,
                details: deleteError.details,
                registrationId,
                userId: user.id,
            },
        );
        return {
            success: false,
            error: `Katılım iptal edilemedi: ${deleteError.message}`,
        };
    }

    console.log(
        `cancelEventRegistration: iptal edildi (registration=${registrationId}, event=${registration.event_id}, user=${user.id})`,
    );

    return { success: true };
}

/* Profil bilgilerini günceller (kullanıcı yalnızca kendi satırını). */
export async function saveProfile(
    input: SaveProfileInput,
): Promise<SaveProfileResult> {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return {
            success: false,
            error: "Oturum bulunamadı. Lütfen yeniden giriş yap.",
        };
    }

    if (!input.fullName.trim()) {
        return { success: false, error: "Ad soyad zorunludur." };
    }

    const { error } = await supabase
        .from("profiles")
        .update({
            full_name: input.fullName.trim(),
            gender: input.gender,
            phone: input.phone,
            interested_sports: input.sports,
            avatar_url: input.avatar,
        })
        .eq("id", user.id);

    if (error) {
        console.error("Profil güncelleme hatası:", error);
        return {
            success: false,
            error: "Bilgiler kaydedilemedi. Lütfen tekrar dene.",
        };
    }

    return { success: true };
}

/*
 * Hesap silme (Danger Zone).
 * Kimlik cookie tabanlı SSR client ile `getUser()` üzerinden doğrulanır;
 * silme işlemi doğrudan service-role anahtarıyla oluşturulan admin
 * client ile `auth.admin.deleteUser` üzerinde yapılır (cookie/RLS
 * client'ı admin işlemlerinde kullanılmaz).
 */
export async function deleteMyAccount(): Promise<DeleteAccountResult> {
    // 1) Kimlik doğrulama — mevcut SSR oturumu
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        console.error(
            "deleteMyAccount: oturum doğrulanamadı:",
            userError?.message,
        );
        return {
            success: false,
            error: "Oturum bulunamadı. Lütfen yeniden giriş yap.",
        };
    }

    // 2) Ortam değişkenleri kontrolü
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey =
        process.env.SUPABASE_SECRET_KEY ??
        process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error(
            "deleteMyAccount: eksik env anahtarı:",
            !supabaseUrl
                ? "NEXT_PUBLIC_SUPABASE_URL"
                : "SUPABASE_SERVICE_ROLE_KEY",
        );
        return {
            success: false,
            error: "Sunucu yapılandırması eksik (service role key).",
        };
    }

    // 3) Admin client — cookie kullanmaz, doğrudan service-role
    const supabaseAdmin = createJsClient<Database>(
        supabaseUrl,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
                detectSessionInUrl: false,
            },
        },
    );

    // 4) Kalıcı silme — detaylı hata yakalama
    try {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(
            user.id,
        );

        if (error) {
            console.error("deleteMyAccount: deleteUser hatası:", {
                message: error.message,
                code: error.code,
                status: error.status,
                name: error.name,
            });
            return {
                success: false,
                error: `Silme hatası: ${error.message}`,
            };
        }
    } catch (unexpectedError) {
        console.error(
            "deleteMyAccount: beklenmeyen hata:",
            unexpectedError,
        );
        return {
            success: false,
            error:
                unexpectedError instanceof Error
                    ? `Beklenmeyen hata: ${unexpectedError.message}`
                    : "Beklenmeyen bir hata oluştu.",
        };
    }

    return { success: true };
}
