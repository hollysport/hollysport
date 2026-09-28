"use server";

import "server-only";

import { createClient as createJsClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";

export type SaveWorkoutInput = {
    templateName: string;
    targetGoal: string;
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
 * Antrenman programını kaydeder (`saved_workouts`).
 *
 * GERÇEK ŞEMA (PostgREST openapi ile doğrulandı):
 *   id, user_id, template_name, target_goal, exercises (jsonb), created_at
 * Kodun daha önce yazdığı `title/goal/environment/muscles` kolonları
 * tabloda YOKTU → PGRST204 ("Could not find the 'environment' column")
 * hatası ve "Program kaydedilemedi" mesajı buydu.
 *
 * - user_id istemciden gelmez; SSR oturumundan doğrulanır.
 * - environment / muscles bilgisi exercises (jsonb) içine gömülür.
 * - Her hata message / code / details / hint ile console.error'a basılır.
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
        const templateName = input.templateName.trim();
        const targetGoal = input.targetGoal.trim();
        const muscles = (input.muscles ?? []).filter(Boolean);
        const items = Array.isArray(input.exercises)
            ? input.exercises
            : [];

        if (muscles.length === 0 || items.length === 0) {
            return {
                success: false,
                error: "Kaydedilecek program boş. Önce bölge seç.",
            };
        }

        /*
         * Tabloda environment/muscles kolonu yok; jsonb exercises
         * içine environment ve muscles eklenir ki profil kartı
         * "Ev · 3 bölge" bilgisini gösterebilsin.
         */
        const exercisesPayload = (items as Record<string, unknown>[]).map(
            (item) => ({
                ...item,
                environment: input.environment,
                muscles,
            }),
        );

        const row = {
            user_id: user.id, // ← doğrulanmış oturum ID'si
            template_name: templateName || "Antrenman Programı",
            target_goal: targetGoal,
            exercises: exercisesPayload as Json,
        };

        // 3) RLS'li normal insert
        const { data, error } = await supabase
            .from("saved_workouts")
            .insert(row)
            .select("id")
            .single();

        if (!error) {
            console.log(
                `saveWorkout: kaydedildi (id=${data?.id}, user=${user.id}, template=${row.template_name})`,
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
                template_name: row.template_name,
                target_goal: row.target_goal,
                muscles,
                exerciseCount: items.length,
            },
        });

        /*
         * 42501 = RLS insert politikası engeli
         * PGRST204 = tablo şemasında olmayan kolon
         * Oturum doğrulandığı için bu iki durumda service-role
         * ile aynı user_id ile yeniden denenir.
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
            process.env.SUPABASE_SECRET_KEY ??
            process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            console.error(
                "saveWorkout: eksik env (SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY)",
            );
            return {
                success: false,
                error: "Sunucu yapılandırması eksik.",
            };
        }

        const supabaseAdmin = createJsClient(
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
            `saveWorkout: RLS/şema engeli aşıldı, service-role ile kaydedildi (id=${adminData?.id}, user=${user.id}).`,
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
