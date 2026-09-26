"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
 * Hesap silme (Danger Zone). Kimlik cookie oturumundan doğrulanır;
 * silme service-role admin client ile auth.users üzerinde yapılır
 * (profiles'a bağlı kayıtlar ON DELETE CASCADE ile temizlenir).
 */
export async function deleteMyAccount(): Promise<DeleteAccountResult> {
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

    const admin = createAdminClient();

    const { error } = await admin.auth.admin.deleteUser(user.id);

    if (error) {
        console.error("Hesap silme hatası:", error);
        return {
            success: false,
            error: "Hesap silinemedi. Lütfen daha sonra tekrar dene.",
        };
    }

    return { success: true };
}
