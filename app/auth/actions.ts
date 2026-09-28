"use server";

import "server-only";

import { createClient as createJsClient } from "@supabase/supabase-js";

import { verifyTurnstileToken } from "@/lib/security/turnstile";

export type RegisterInput = {
    email: string;
    password: string;
    fullName: string;
    avatar: string;
    gender: string | null;
    birthDate: string | null;
    /* Doğrulamasız, opsiyonel telefon */
    phone: string | null;
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
 * Kayıt (signUp) Server Action mimarisi:
 *
 * 1) Turnstile token'ı sunucuda doğrulanır (admin.createUser
 *    Supabase'in yerleşik captcha kontrolünü atladığı için şart).
 * 2) supabaseAdmin.auth.admin.createUser() ile kullanıcı doğrudan
 *    (email_confirm: true) oluşturulur; tüm form verisi
 *    user_metadata'ya mühürlenir.
 * 3) user.id döner dönmez service-role admin client ile
 *    profiles tablosuna UPSERT atılır — trigger'a BİRAKILMAZ,
 *    RLS engeline takılmaz, veri kaybı imkânsız.
 * 4) Tüm aşamalar try-catch altında, hatalar console.error
 *    ile detaylı basılır.
 */
export async function registerUser(
    input: RegisterInput,
): Promise<RegisterResult> {
    try {
        // 0) Ortam kontrolü — admin client için service-role key şart
        const supabaseUrl =
            process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey =
            process.env.SUPABASE_SECRET_KEY ??
            process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            console.error(
                "registerUser: eksik env değişkeni (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY)",
            );
            return {
                success: false,
                error: "Sunucu yapılandırması eksik.",
            };
        }

        // 1) Turnstile doğrulaması (sunucu tarafı, action: register)
        if (input.captchaToken) {
            try {
                const captcha =
                    await verifyTurnstileToken({
                        token: input.captchaToken,
                        expectedAction: "register",
                    });

                if (!captcha.success) {
                    console.error(
                        "registerUser: Turnstile doğrulaması başarısız:",
                        captcha.errors,
                    );
                    return {
                        success: false,
                        error: "Güvenlik doğrulaması başarısız. Lütfen tekrar deneyin.",
                    };
                }
            } catch (captchaError) {
                console.error(
                    "registerUser: Turnstile servis hatası:",
                    captchaError,
                );
                return {
                    success: false,
                    error: "Güvenlik doğrulaması yapılamadı. Lütfen tekrar deneyin.",
                };
            }
        } else {
            console.error(
                "registerUser: captchaToken eksik — kayıt reddedildi.",
            );
            return {
                success: false,
                error: "Güvenlik doğrulaması eksik. Sayfayı yenileyip tekrar deneyin.",
            };
        }

        // 2) Admin client (service-role) — RLS bypass
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

        const joinDate =
            input.joinDate ?? new Date().toISOString();

        // 3) Kullanıcıyı admin yetkisiyle doğrudan oluştur
        const { data, error: signUpError } =
            await supabaseAdmin.auth.admin.createUser({
                email: input.email,
                password: input.password,
                email_confirm: true, // Direkt onaylı kullanıcı
                user_metadata: {
                    full_name: input.fullName,
                    avatar: input.avatar,
                    avatar_url: input.avatar,
                    gender: input.gender,
                    birth_date: input.birthDate,
                    phone: input.phone,
                    interested_sports: input.interestedSports,
                    join_date: joinDate,
                },
            });

        if (signUpError) {
            console.error(
                "registerUser createUser hatası:",
                {
                    message: signUpError.message,
                    status: signUpError.status,
                },
            );

            const message =
                signUpError.message.toLowerCase();

            if (
                message.includes("already") ||
                message.includes("exists")
            ) {
                return {
                    success: false,
                    error: "Bu e-posta adresiyle zaten bir hesap var.",
                };
            }

            return {
                success: false,
                error: `Kayıt tamamlanamadı: ${signUpError.message}`,
            };
        }

        const user = data.user;

        if (!user) {
            console.error(
                "registerUser: createUser user nesnesi dönmedi",
            );
            return {
                success: false,
                error: "Kayıt tamamlanamadı (kullanıcı nesnesi eksik).",
            };
        }

        // 4) profiles satırını anında mühürle (trigger beklenmez)
        const baseProfileRow = {
            id: user.id,
            email: input.email,
            full_name: input.fullName,
            avatar_url: input.avatar,
            gender: input.gender,
            birth_date: input.birthDate,
            phone: input.phone,
            interested_sports: input.interestedSports,
            join_date: joinDate,
        };

        let { error: profileError } = await supabaseAdmin
            .from("profiles")
            .upsert(
                {
                    ...baseProfileRow,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "id" },
            );

        // profiles şemasında updated_at kolonu yoksa
        // (PGRST204) kolonsuz hâliyle tekrar dene
        if (
            profileError &&
            (profileError.code === "PGRST204" ||
                profileError.message.includes(
                    "updated_at",
                ))
        ) {
            console.warn(
                "registerUser: profiles.updated_at yok, kolon olmadan yeniden deneniyor.",
            );

            ({ error: profileError } = await supabaseAdmin
                .from("profiles")
                .upsert(baseProfileRow, {
                    onConflict: "id",
                }));
        }

        if (profileError) {
            console.error(
                "registerUser profiles upsert hatası:",
                {
                    message: profileError.message,
                    code: profileError.code,
                    details: profileError.details,
                    hint: profileError.hint,
                    userId: user.id,
                    payload: {
                        full_name: input.fullName,
                        avatar_url: input.avatar,
                        gender: input.gender,
                        birth_date: input.birthDate,
                        phone: input.phone,
                        interested_sports:
                            input.interestedSports,
                        join_date: joinDate,
                    },
                },
            );

            return {
                success: false,
                error: "Kullanıcı oluşturuldu ancak profil bilgileri yazılamadı. Lütfen destek ekibine başvurun.",
            };
        }

        /*
         * 5) YAZIM DOĞRULAMASI — kayıt "başarılı" demeden önce satır
         *    geri okunur: cinsiyet, ilgi alanları ve üyelik tarihi
         *    gönderilen değerlerle birebir eşleşmeli. Eşleşmezse bir
         *    kez daha yazılır; hâlâ eşleşmiyorsa kayıt GERİ ALINIR
         *    (auth user + profil satırı silinir) ki kullanıcı
         *    eksik veriyle hesap sahibi olmasın.
         */
        const verifyProfile = async (): Promise<{
            ok: boolean;
            detail: string;
        }> => {
            const { data: verifyRow, error: verifyError } =
                await supabaseAdmin
                    .from("profiles")
                    .select(
                        "gender, interested_sports, join_date",
                    )
                    .eq("id", user.id)
                    .single();

            if (verifyError || !verifyRow) {
                return {
                    ok: false,
                    detail: `okunamadı: ${
                        verifyError?.message ?? "satır yok"
                    }`,
                };
            }

            const writtenGender =
                (verifyRow.gender as string | null) ?? null;
            const writtenSports = Array.isArray(
                verifyRow.interested_sports,
            )
                ? (verifyRow.interested_sports as string[])
                : [];
            const writtenJoin =
                (verifyRow.join_date as string | null) ?? null;

            const genderOk =
                writtenGender === (input.gender ?? null);

            const sportsOk =
                JSON.stringify(writtenSports) ===
                JSON.stringify(input.interestedSports);

            const joinOk = joinDate
                ? writtenJoin !== null &&
                  Math.abs(
                      new Date(writtenJoin).getTime() -
                          new Date(joinDate).getTime(),
                  ) < 1000
                : writtenJoin === null;

            return {
                ok: genderOk && sportsOk && joinOk,
                detail: `gender=${String(writtenGender)} sports=${JSON.stringify(writtenSports)} join_date=${String(writtenJoin)}`,
            };
        };

        let verification = await verifyProfile();

        if (!verification.ok) {
            console.warn(
                "registerUser: yazım doğrulaması başarısız, profil yeniden yazılıyor:",
                verification.detail,
            );

            const { error: rewriteError } = await supabaseAdmin
                .from("profiles")
                .upsert(baseProfileRow, {
                    onConflict: "id",
                });

            if (rewriteError) {
                console.error(
                    "registerUser: yeniden yazma hatası:",
                    {
                        message: rewriteError.message,
                        code: rewriteError.code,
                    },
                );
            }

            verification = await verifyProfile();
        }

        if (!verification.ok) {
            const rollbackProfile = await supabaseAdmin
                .from("profiles")
                .delete()
                .eq("id", user.id);
            const rollbackUser =
                await supabaseAdmin.auth.admin.deleteUser(
                    user.id,
                );

            console.error(
                "registerUser: profil alanları mühürlenemedi — kayıt geri alındı:",
                {
                    userId: user.id,
                    reason: verification.detail,
                    expected: {
                        gender: input.gender,
                        interested_sports: input.interestedSports,
                        join_date: joinDate,
                    },
                    rollbackProfile:
                        rollbackProfile.error?.message ?? "ok",
                    rollbackUser:
                        rollbackUser.error?.message ?? "ok",
                },
            );

            return {
                success: false,
                error: "Kayıt sırasında profil bilgileri yazılamadı. Lütfen tekrar deneyin.",
            };
        }

        console.log(
            `registerUser: kullanıcı=${user.id} profili mühürlendi ve doğrulandı (full_name="${input.fullName}", avatar="${input.avatar}", gender=${String(input.gender)}, sports=${JSON.stringify(input.interestedSports)}, join_date=${joinDate})`,
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
