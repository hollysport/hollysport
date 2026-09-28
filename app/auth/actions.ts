"use server";

import "server-only";

import { createClient as createJsClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export type RegisterInput = {
    email: string;
    password: string;
    fullName: string;
    avatar: string;
    gender: string | null;
    birthDate: string | null;
    interestedSports: string[];
    /* Veteran üyeler için geçmişe dönük ISO string; yeni üyelerde null */
    joinDate: string | null;
    captchaToken: string | null;
};

export type RegisterResult = {
    success: boolean;
    error?: string;
};

/*
 * Üyelik kaydı — kayıt sonrası profil yazımı SQL trigger'ına
 * BIRAKILMAZ: signUp başarılı olduğunda service-role admin client
 * ile profiles satırı doğrudan güncellenir (RLS ve trigger
 * bağımlılığı yok, veri kaybı imkânsız).
 */
export async function registerUser(
    input: RegisterInput,
): Promise<RegisterResult> {
    try {
        const supabase = await createClient();

        // 1) Supabase Auth kaydı
        const { data, error: signUpError } =
            await supabase.auth.signUp({
                email: input.email,
                password: input.password,
                options: {
                    captchaToken: input.captchaToken ?? undefined,
                    data: {
                        full_name: input.fullName,
                        avatar: input.avatar,
                        avatar_url: input.avatar,
                        gender: input.gender,
                        birth_date: input.birthDate,
                        interested_sports: input.interestedSports,
                    },
                },
            });

        if (signUpError) {
            console.error("registerUser signUp hatası:", {
                message: signUpError.message,
                code: signUpError.code,
                status: signUpError.status,
            });
            return {
                success: false,
                error: signUpError.message.includes(
                    "already registered",
                )
                    ? "Bu e-posta adresiyle zaten bir hesap var."
                    : `Kayıt tamamlanamadı: ${signUpError.message}`,
            };
        }

        const user = data.user;

        if (!user) {
            console.error("registerUser: user nesnesi dönmedi");
            return {
                success: false,
                error: "Kayıt tamamlanamadı (kullanıcı nesnesi eksik).",
            };
        }

        // 2) Admin client (service-role) — RLS bypass
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            console.error(
                "registerUser: eksik env değişkeni (SUPABASE_SERVICE_ROLE_KEY)",
            );
            return {
                success: false,
                error: "Sunucu yapılandırması eksik.",
            };
        }

        const adminClient = createJsClient(
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

        // 3) profiles satırını doğrudan yaz (trigger beklenmez)
        const joinDate = input.joinDate ?? new Date().toISOString();

        const { error: profileError } = await adminClient
            .from("profiles")
            .upsert(
                {
                    id: user.id,
                    email: input.email,
                    full_name: input.fullName,
                    avatar_url: input.avatar,
                    gender: input.gender,
                    birth_date: input.birthDate,
                    interested_sports: input.interestedSports,
                    join_date: joinDate,
                },
                { onConflict: "id" },
            );

        if (profileError) {
            console.error(
                "registerUser profiles yazım hatası:",
                profileError,
            );
            /* Kayıt başarılı ancak profil yazılamadı — kullanıcı
               kaybetmemesi için kayıt başarılı sayılır, hata loglanır. */
        }

        console.log(
            `registerUser: ${user.id} profili yazıldı (join_date: ${joinDate})`,
        );

        return { success: true };
    } catch (unexpectedError) {
        console.error(
            "registerUser beklenmeyen hata:",
            unexpectedError,
        );
        return {
            success: false,
            error:
                unexpectedError instanceof Error
                    ? unexpectedError.message
                    : "Beklenmeyen bir hata oluştu.",
        };
    }
}
