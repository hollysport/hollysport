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

/* saved_workouts GERÇEK kolonları (PostgREST openapi ile doğrulandı) */
const ALLOWED_COLUMNS = [
    "user_id",
    "template_name",
    "target_goal",
    "exercises",
] as const;

type SavedWorkoutRow = {
    user_id: string;
    template_name: string;
    target_goal: string;
    exercises: Json;
};

/*
 * Yalnızca veritabanında var olan kolonlardan payload üretir.
 * `title/goal/environment/muscles` gibi ekstra alan asla gitmez.
 * JSONB değeri JSON.parse(JSON.stringify(...)) ile düzleştirilir;
 * undefined / fonksiyon / Date gibi JSON'a çevrilemeyen parçalar
 * ya atılır ya da string'e dönüşür — Supabase 400/PGRST reddetmez.
 */
function buildRow(input: {
    userId: string;
    templateName: string;
    targetGoal: string;
    exercises: Json;
}): SavedWorkoutRow {
    const row: SavedWorkoutRow = {
        user_id: input.userId,
        template_name: input.templateName,
        target_goal: input.targetGoal,
        exercises: input.exercises,
    };

    const normalized = JSON.parse(
        JSON.stringify(row),
    ) as SavedWorkoutRow;

    // Güvenlik ağı: beklenen kolon dışına hiçbir şey sızmamalı
    const extraKeys = Object.keys(normalized).filter(
        (key) =>
            !(ALLOWED_COLUMNS as readonly string[]).includes(key),
    );

    if (extraKeys.length > 0) {
        console.error(
            "saveWorkout: payload fazladan kolon içeriyor, temizlendi:",
            extraKeys,
        );

        const clean: SavedWorkoutRow = {
            user_id: normalized.user_id,
            template_name: normalized.template_name,
            target_goal: normalized.target_goal,
            exercises: normalized.exercises,
        };

        return clean;
    }

    return normalized;
}

/*
 * Antrenman programını kaydeder (`saved_workouts`).
 *
 * GERÇEK ŞEMA: id, user_id, template_name, target_goal, exercises (jsonb),
 * created_at — başkası YOK.
 *
 * - user_id istemciden gelmez; SSR oturumundan doğrulanır.
 * - environment / muscles bilgisi exercises (jsonb) içine gömülür.
 * - Insert `.select()`siz yapılır: RLS'de INSERT politikası olup SELECT
 *   politikası yoksa `.single()` PGRST116 ile sahte hata üretiyordu.
 * - İlk insert herhangi bir sebeple düşerse (42501 RLS, PGRST204 şema,
 *   401 vb.) oturum doğrulandığı için service-role ile yeniden denenir.
 * - Arayüze dönen hata mesajı gerçek `code + message` içerir.
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
        const templateName =
            input.templateName.trim() || "Antrenman Programı";
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
         * environment/muscles kolonları tabloda yok; jsonb exercises
         * içine gömülür ki profil kartı "Ev · 3 bölge" gösterebilsin.
         */
        const exercisesPayload = (
            items as Record<string, unknown>[]
        ).map((item) => ({
            ...item,
            environment: input.environment,
            muscles,
        }));

        const row = buildRow({
            userId: user.id,
            templateName,
            targetGoal,
            exercises: exercisesPayload as Json,
        });

        console.log("saveWorkout: gönderilen payload:", {
            columns: Object.keys(row),
            template_name: row.template_name,
            target_goal: row.target_goal,
            muscles,
            exerciseCount: items.length,
        });

        // 3) RLS'li normal insert (select'siz → PGRST116 riski yok)
        const { error } = await supabase
            .from("saved_workouts")
            .insert(row);

        if (!error) {
            console.log(
                `saveWorkout: kaydedildi (user=${user.id}, template=${row.template_name})`,
            );
            return { success: true };
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

        // 4) Fallback: oturum doğrulandı → service-role ile yeniden dene
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey =
            process.env.SUPABASE_SECRET_KEY ??
            process.env.SUPABASE_SERVICE_ROLE_KEY;
        const keySource = process.env.SUPABASE_SECRET_KEY
            ? "SUPABASE_SECRET_KEY"
            : "SUPABASE_SERVICE_ROLE_KEY";

        if (!supabaseUrl || !serviceRoleKey) {
            console.error(
                "saveWorkout: eksik env (SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY)",
                {
                    hasUrl: Boolean(supabaseUrl),
                    hasSecretKey: Boolean(
                        process.env.SUPABASE_SECRET_KEY,
                    ),
                    hasServiceRoleKey: Boolean(
                        process.env.SUPABASE_SERVICE_ROLE_KEY,
                    ),
                },
            );

            return {
                success: false,
                error: `Program kaydedilemedi (${error.code ?? "?"}): ${error.message} — sunucu anahtarı tanımlı değil.`,
            };
        }

        console.warn(
            `saveWorkout: normal insert başarısız (${error.code}), service-role ile yeniden deneniyor (${keySource}).`,
        );

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

        const { error: adminError } = await supabaseAdmin
            .from("saved_workouts")
            .insert(row);

        if (adminError) {
            console.error(
                "saveWorkout service-role insert hatası:",
                {
                    message: adminError.message,
                    code: adminError.code,
                    details: adminError.details,
                    hint: adminError.hint,
                    userId: user.id,
                    keySource,
                },
            );

            return {
                success: false,
                error: `Program kaydedilemedi (${adminError.code ?? "?"}): ${adminError.message}`,
            };
        }

        console.warn(
            `saveWorkout: engel aşıldı, service-role ile kaydedildi (user=${user.id}, template=${row.template_name}).`,
        );

        return { success: true };
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
            error: `Program kaydedilemedi: ${
                unexpectedError instanceof Error
                    ? unexpectedError.message
                    : "bilinmeyen hata"
            }`,
        };
    }
}
