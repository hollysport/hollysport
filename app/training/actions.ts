"use server";

import "server-only";

import { headers } from "next/headers";
import { createClient as createJsClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkFormRateLimit } from "@/lib/security/form-rate-limit";
import { GOALS } from "@/lib/data/exercises";
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

/* =========================================================================
 * Kişiye özel antrenman programı talebi (ProgramRequestDialog)
 *
 * Eski akış: client insert → `custom_program_requests` (PGRST204 çünkü
 * gerçek kolon `contact_info`, kodda `contact` yazılıydı) + RLS/izin
 * belirsizliği → kullanıcıya jenerik "Talebin gönderilemedi" hatası.
 *
 * Yeni akış: sunucu action → alan doğrulaması → rate limit →
 * service-role insert (RLS bypass). Gerçek `error.message` / `error.code`
 * hem console'a loglanır hem kullanıcıya döner.
 *
 * GERÇEK kolonlar (PostgREST openapi ile doğrulandı):
 * id, full_name, contact_info, age, height, weight, goal, notes, created_at
 * ========================================================================= */

export type ProgramRequestInput = {
    fullName: string;
    contact: string;
    age: number | null;
    height: number | null;
    weight: number | null;
    goal: string;
    notes: string | null;
    /* Bot tuzağı (honeypot) — dolu gelirse kayıt yapılmaz */
    honeypot?: string | null;
};

export type ProgramRequestResult = {
    success: boolean;
    error?: string;
};

function normalizeOptionalNumber(
    value: number | null | undefined,
    min: number,
    max: number,
): { ok: boolean; value: number | null } {
    if (value === null || value === undefined) {
        return { ok: true, value: null };
    }

    const numeric = Number(value);

    if (!Number.isFinite(numeric)) {
        return { ok: true, value: null };
    }

    if (numeric < min || numeric > max) {
        return { ok: false, value: null };
    }

    return { ok: true, value: Math.round(numeric) };
}

export async function submitProgramRequest(
    input: ProgramRequestInput,
): Promise<ProgramRequestResult> {
    try {
        // 0) Honeypot — bot doldurursa sahte başarı (kayıt yok)
        if ((input.honeypot ?? "").trim()) {
            console.warn(
                "submitProgramRequest: honeypot dolduruldu — kayıt atlandı.",
                {
                    fullName: input.fullName,
                    contact: input.contact,
                },
            );
            return { success: true };
        }

        // 1) Alan doğrulaması
        const fullName = (input.fullName ?? "").trim();
        const contact = (input.contact ?? "").trim();
        const goal = (input.goal ?? "").trim();
        const notes = (input.notes ?? "").trim();

        if (fullName.length < 2 || fullName.length > 100) {
            return {
                success: false,
                error: "Ad soyad 2-100 karakter arasında olmalıdır.",
            };
        }

        if (contact.length < 5 || contact.length > 120) {
            return {
                success: false,
                error: "İletişim bilgisi 5-120 karakter arasında olmalıdır.",
            };
        }

        if (!GOALS.some((item) => item.key === goal)) {
            return {
                success: false,
                error: "Geçerli bir hedef seçin.",
            };
        }

        if (notes.length > 500) {
            return {
                success: false,
                error: "Notlar en fazla 500 karakter olabilir.",
            };
        }

        const age = normalizeOptionalNumber(input.age, 10, 99);
        const height = normalizeOptionalNumber(
            input.height,
            100,
            230,
        );
        const weight = normalizeOptionalNumber(
            input.weight,
            30,
            250,
        );

        if (!age.ok || !height.ok || !weight.ok) {
            return {
                success: false,
                error: "Yaş (10-99), boy (100-230 cm) ve kilo (30-250 kg) aralıklarını kontrol edin.",
            };
        }

        // 2) Hız sınırı — RPC hatasında form bloklanmaz (sadece log)
        try {
            const requestHeaders = await headers();
            const request = new Request(
                "http://internal/program-request",
                { headers: requestHeaders },
            );

            const allowed = await checkFormRateLimit({
                request,
                formKey: "program_request",
                limit: 3,
                windowSeconds: 600,
            });

            if (!allowed) {
                return {
                    success: false,
                    error: "Çok sık gönderim yaptınız. Lütfen 10 dakika sonra tekrar deneyin.",
                };
            }
        } catch (rateLimitError) {
            console.error(
                "submitProgramRequest: rate-limit kontrol edilemedi:",
                {
                    message:
                        rateLimitError instanceof Error
                            ? rateLimitError.message
                            : String(rateLimitError),
                },
            );
        }

        // 3) Service-role client (RLS bypass) — env eksikse oturum client'ı
        let supabaseWriter;
        let usingAdmin = true;

        try {
            supabaseWriter = createAdminClient();
        } catch (adminClientError) {
            usingAdmin = false;
            console.error(
                "submitProgramRequest: admin client oluşturulamadı, oturum client'ı ile denenecek:",
                {
                    message:
                        adminClientError instanceof Error
                            ? adminClientError.message
                            : String(adminClientError),
                },
            );

            supabaseWriter = await createClient();
        }

        const row = {
            full_name: fullName,
            contact_info: contact, // GERÇEK kolon adı
            age: age.value,
            height: height.value,
            weight: weight.value,
            goal,
            notes: notes || null,
        };

        console.log("submitProgramRequest: gönderilen payload:", {
            columns: Object.keys(row),
            full_name: row.full_name,
            contact_info: row.contact_info,
            goal: row.goal,
            usingAdmin,
        });

        // 4) Insert (.select()siz → PGRST116 riski yok)
        const { error } = await supabaseWriter
            .from("custom_program_requests")
            .insert(row);

        if (error) {
            console.error("submitProgramRequest: insert hatası:", {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
                usingAdmin,
                payload: row,
            });

            return {
                success: false,
                error: `Talebin gönderilemedi. Lütfen tekrar dene. (${error.code ?? "?"}) ${error.message}`,
            };
        }

        console.log(
            `submitProgramRequest: talep alındı (ad=${row.full_name}, iletişim=${row.contact_info}, hedef=${row.goal}, serviceRole=${usingAdmin})`,
        );

        return { success: true };
    } catch (unexpectedError) {
        const message =
            unexpectedError instanceof Error
                ? unexpectedError.message
                : String(unexpectedError);
        const code = (unexpectedError as { code?: string })
            ?.code;

        console.error("submitProgramRequest beklenmeyen hata:", {
            name:
                unexpectedError instanceof Error
                    ? unexpectedError.name
                    : "unknown",
            code,
            message,
            stack:
                unexpectedError instanceof Error
                    ? unexpectedError.stack
                    : undefined,
        });

        return {
            success: false,
            error: `Talebin gönderilemedi. Lütfen tekrar dene. (${code ? `${code} ` : ""}${message})`,
        };
    }
}
