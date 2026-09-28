"use server";

import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ACTIVE_REGISTRATION_STATUSES } from "@/lib/events/registration-status";

export type JoinEventResult = {
    success: boolean;
    /* Daha önce kayıt var (yalnızca gerçekten aktif bir satır) */
    already?: boolean;
    /* Başarıda kullanıcıya gösterilecek metin */
    message?: string;
    error?: string;
};

/*
 * Oturum açmış üye için "tek tuşla etkinliğe katıl".
 *
 * Misafir kullanıcıların uzun başvuru formu
 * (`app/join/registration-form.tsx` → `POST /api/forms/registration`)
 * AYNI ŞEKİLDE çalışmaya devam eder; bu action yalnızca giriş yapmış
 * kullanıcılar için alternatif yol olarak kullanılır.
 *
 * - Kimlik SSR oturumuyla doğrulanır; `user_id` istemciden gelmez.
 * - Uygunluk kuralları public kayıt API'siyle birebir aynı:
 *   yayın açık, geçmiş bitiş, son başvuru ve kontenjan kontrolü.
 * - Başvuru `pending` olarak yazılır (admin onayı mevcut akışı
 *   bozmaz, `participant_count` yine RPC ile onayda artar).
 */
export async function joinEvent(
    eventId: string,
): Promise<JoinEventResult> {
    if (!eventId) {
        return {
            success: false,
            error: "Etkinlik seçilmedi.",
        };
    }

    try {
        // 1) Oturum
        const supabase = await createClient();

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return {
                success: false,
                error: "Oturum bulunamadı. Lütfen giriş yapın.",
            };
        }

        const supabaseAdmin = createAdminClient();

        // 2) Etkinlik uygunluk kontrolü
        const { data: event, error: eventError } =
            await supabaseAdmin
                .from("events")
                .select(
                    "id, status, registration_open, ends_at, registration_deadline, capacity, participant_count",
                )
                .eq("id", eventId)
                .maybeSingle();

        if (eventError || !event) {
            console.error("joinEvent: etkinlik okunamadı:", {
                message: eventError?.message,
                code: eventError?.code,
                eventId,
            });
            return {
                success: false,
                error: "Etkinlik bulunamadı. Sayfayı yenileyin.",
            };
        }

        const now = Date.now();
        const isPast =
            new Date(event.ends_at).getTime() <= now;
        const deadlinePassed =
            event.registration_deadline !== null &&
            new Date(event.registration_deadline).getTime() <=
                now;
        const isFull =
            event.capacity !== null &&
            event.participant_count >= event.capacity;

        if (
            event.status !== "published" ||
            !event.registration_open ||
            isPast ||
            deadlinePassed ||
            isFull
        ) {
            return {
                success: false,
                error: isPast
                    ? "Bu etkinlik tamamlandı."
                    : isFull
                      ? "Etkinlik kontenjanı doldu."
                      : deadlinePassed
                        ? "Bu etkinliğin başvuru süresi sona erdi."
                        : "Bu etkinliğin kayıtları şu anda kapalı.",
            };
        }

        // 3) Profil verileri — kayıt bu verilerle doldurulur
        const { data: profile, error: profileError } =
            await supabaseAdmin
                .from("profiles")
                .select("full_name, email, phone, gender")
                .eq("id", user.id)
                .maybeSingle();

        if (profileError) {
            console.error(
                "joinEvent: profil okunamadı:",
                {
                    message: profileError.message,
                    code: profileError.code,
                    userId: user.id,
                },
            );
        }

        const fullName = (
            profile?.full_name ??
            (user.user_metadata?.full_name as string | undefined) ??
            ""
        ).trim();

        const email = (
            profile?.email ?? user.email ?? ""
        ).trim();

        const phone = (
            profile?.phone ??
            (user.user_metadata?.phone as string | undefined) ??
            ""
        ).trim();

        const rawGender = profile?.gender ?? "";

        if (!fullName || !email) {
            return {
                success: false,
                error:
                    "Profilinde ad soyad veya e-posta eksik. Ayarlar bölümünden tamamlayıp tekrar deneyin.",
            };
        }

        // Profil cinsiyeti → başvuru formunun değerleriyle eşle
        const genderMap: Record<string, string> = {
            kadin: "female",
            erkek: "male",
            "belirtmek-istemiyorum": "prefer_not_to_say",
            female: "female",
            male: "male",
            other: "other",
            prefer_not_to_say: "prefer_not_to_say",
        };
        const gender = genderMap[rawGender] ?? "";

        // 4) Gerçekten var olan bir kayıt var mı?
        //    (kendi user_id'si, yoksa aynı e-postayla yapılmış başvuru)
        const { data: byUser, error: byUserError } =
            await supabaseAdmin
                .from("event_registrations")
                .select("id, status")
                .eq("event_id", eventId)
                .eq("user_id", user.id)
                .maybeSingle();

        if (byUserError) {
            console.warn("joinEvent: user_id mükerrer kontrolü:", {
                message: byUserError.message,
                code: byUserError.code,
            });
        }

        let existing = byUser;

        if (!existing) {
            const { data: byEmail, error: byEmailError } =
                await supabaseAdmin
                    .from("event_registrations")
                    .select("id, status")
                    .eq("event_id", eventId)
                    .eq("email", email)
                    .maybeSingle();

            if (byEmailError) {
                console.warn("joinEvent: email mükerrer kontrolü:", {
                    message: byEmailError.message,
                    code: byEmailError.code,
                });
            }

            existing = byEmail;
        }

        if (existing) {
            const existingStatus = (
                existing.status ?? ""
            ).toLowerCase();

            // İptal/ret sonrası yeniden katılım: satırı pending'e çek
            if (!ACTIVE_REGISTRATION_STATUSES.has(existingStatus)) {
                const { error: reactivateError } =
                    await supabaseAdmin
                        .from("event_registrations")
                        .update({
                            status: "pending",
                            user_id: user.id,
                            full_name: fullName,
                            email,
                            phone,
                            gender,
                            notes: "Profil bilgileriyle tek tuşla katılım.",
                        })
                        .eq("id", existing.id);

                if (reactivateError) {
                    console.error(
                        "joinEvent: yeniden kayıt güncellenemedi:",
                        {
                            message: reactivateError.message,
                            code: reactivateError.code,
                            registrationId: existing.id,
                        },
                    );

                    return {
                        success: false,
                        error: `Başvuru oluşturulamadı: ${reactivateError.message}`,
                    };
                }

                console.log(
                    `joinEvent: yeniden katılım alındı (registration=${existing.id}, event=${eventId}, user=${user.id})`,
                );

                return {
                    success: true,
                    message: "Kaydınız tamamlanmıştır.",
                };
            }

            console.log(
                `joinEvent: zaten kayıtlı (registration=${existing.id}, status=${existingStatus}, user=${user.id})`,
            );

            return {
                success: false,
                already: true,
                error: "Bu etkinliğe zaten kayıtlısın.",
            };
        }

        // 5) Başvuru (misafir formuyla aynı alanlar)
        const { error: insertError } = await supabaseAdmin
            .from("event_registrations")
            .insert({
                event_id: eventId,
                user_id: user.id,
                full_name: fullName,
                email,
                phone,
                gender,
                notes: "Profil bilgileriyle tek tuşla katılım.",
                status: "pending",
                consent_accepted: true,
            });

        if (insertError) {
            console.error("joinEvent: insert hatası:", {
                message: insertError.message,
                code: insertError.code,
                details: insertError.details,
                hint: insertError.hint,
                userId: user.id,
                eventId,
                payload: { full_name: fullName, email, phone, gender },
            });

            /* UNIQUE ihlali = veritabanında gerçekten kayıt var */
            if (insertError.code === "23505") {
                console.log(
                    `joinEvent: 23505 → mevcut kayıt (event=${eventId}, user=${user.id})`,
                );

                return {
                    success: false,
                    already: true,
                    error: "Bu etkinliğe zaten kayıtlısın.",
                };
            }

            return {
                success: false,
                error: `Başvuru oluşturulamadı: ${insertError.message}`,
            };
        }

        console.log(
            `joinEvent: katılım alındı (event=${eventId}, user=${user.id}, email=${email}, phone=${phone || "yok"})`,
        );

        return {
            success: true,
            message: "Kaydınız tamamlanmıştır.",
        };
    } catch (unexpectedError) {
        console.error("joinEvent beklenmeyen hata:", {
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
            error:
                unexpectedError instanceof Error
                    ? unexpectedError.message
                    : "Beklenmeyen bir hata oluştu.",
        };
    }
}
