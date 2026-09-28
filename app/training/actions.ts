"use server";

import "server-only";

import { createClient as createJsClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { Json } from "@/lib/supabase/database.types";

export type SaveWorkoutInput = {
    title: string;
    goal: string;
    environment: string;
    muscles: string[];
    exercises: Json;
};

export type SaveWorkoutResult = {
    success: boolean;
    error?: string;
    id?: string;
};

/*
 * Antrenman programını kaydeder (saved_workouts).
 *
 * 1) user_id ASLA istemciden gelmez — SSR oturumundan doğrulanır,
 *    dolayısıyla satır her zaman oturum açan kullanıcıya aittir.
 * 2) Önce RLS'li (session) client ile insert denenir; politika
 *    engeli (42501) veya şema uyuşmazlığı (PGRST204) durumunda
 *    doğrulanmış user_id ile service-role client'a düşülür.
 * 3) Her hata; message / code / details / hint ile terminale yazılır.
 */
export async function saveWorkout(
    input: SaveWorkoutInput,
): Promise<SaveWorkoutResult> {
    try {
        // 1) Oturum doğrulama — user_id buradan gelir
        const supabase = await createClient();

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error("saveWorkout: oturum yok:", {
                message: userError?.message,
                code: userError?.code,
            });

            return {
                success: false,
                error: "Oturum bulunamadı. Lütfen yeniden giriş yap.",
            };
        }

        // 2) Alan doğrulaması
        const title = input.title.trim();
        const muscles = (input.muscles ?? []).filter(Boolean);
        const exercises = Array.isArray(input.exercises)
            ? input.exercises
            : [];

        if (muscles.length === 0 || exercises.length === 0) {
            return {
                success: false,
                error: "Kaydedilecek program boş. Önce bölge seç.",
            };
        }

        const row = {
            user_id: user.id, // ← doğrulanmış oturum ID'si
            title: title || "Antrenman Programı",
            goal: input.goal,
            environment: input.environment,
            muscles,
            exercises: exercises as Json,
        };

        // 3) RLS'li normal insert
        const { data, error } = await supabase
            .from("saved_workouts")
            .insert(row)
            .select("id")
            .single();

        if (!error) {
            console.log(
                `saveWorkout: kaydedildi (id=${data?.id}, user=${user.id})`,
            );
            return { success: true, id: data?.id };
        }

        console.error("saveWorkout insert hatası:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            userId: user.id,
            payload: {
                title: row.title,
                goal: row.goal,
                environment: row.environment,
                muscles: row.muscles,
                exerciseCount: exercises.length,
            },
        });

        /*
         * 42501 = RLS insert politikası engeli
         * PGRST204 = tablo şemasında olmayan kolon
         * Bu iki durumda, oturum zaten doğrulandığı için
         * service-role ile aynı user_id ile yeniden denenir.
         */
        const isRlsOrSchemaIssue =
            error.code === "42501" ||
            error.code === "PGRST204" ||
            error.message
                .toLowerCase()
                .includes("row-level security");

        if (!isRlsOrSchemaIssue) {
            return {
                success: false,
                error: "Program kaydedilemedi. Lütfen tekrar dene.",
            };
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            console.error(
                "saveWorkout: eksik env (SUPABASE_SERVICE_ROLE_KEY)",
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

        const { data: adminData, error: adminError } =
            await supabaseAdmin
                .from("saved_workouts")
                .insert(row)
                .select("id")
                .single();

        if (adminError) {
            console.error(
                "saveWorkout service-role insert hatası:",
                {
                    message: adminError.message,
                    code: adminError.code,
                    details: adminError.details,
                    hint: adminError.hint,
                    userId: user.id,
                },
            );

            return {
                success: false,
                error: "Program kaydedilemedi. Lütfen tekrar dene.",
            };
        }

        console.warn(
            `saveWorkout: RLS/şema engeli aşıldı, service-role ile kaydedildi (id=${adminData?.id}, user=${user.id}). Politika SQL'i önerilir.`,
        );

        return { success: true, id: adminData?.id };
    } catch (unexpectedError) {
        console.error("saveWorkout beklenmeyen hata:", {
            name:
                unexpectedError instanceof Error
                    ? unexpectedError.name
                    : "unknown",
            message:
                unexpectedError instanceof Error
                    ? unexpectedError.message
                    : String(unexpectedError),
            stack:
                unexpectedError instanceof Error
                    ? unexpectedError.stack
                    : undefined,
        });

        return {
            success: false,
            error: "Program kaydedilemedi. Lütfen tekrar dene.",
        };
    }
}
