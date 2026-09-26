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
    sports: string[];
    avatar: string | null;
};

export type SaveProfileResult = {
    success: boolean;
    error?: string;
};

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
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error(
            "deleteMyAccount: eksik env değişkeni:",
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
