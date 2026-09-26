"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";

type SeedResult = {
    success: boolean;
    error?: string;
    inserted?: number;
};

/*
 * Hazır egzersiz veri seti — /training algoritma motorunun
 * (kas + ortam + goals) hepsine hitap eden başlangıç kayıtları.
 * Yalnızca tablo boşken Seed butonuyla çalıştırılır.
 */

type SeedEntry = [
    name: string,
    muscle: string,
    environment: "home" | "gym",
    goals: string[],
    sets: string,
    reps: string,
    description: string,
];

const SEED_DATA: SeedEntry[] = [
    // Göğüs
    ["Bench Press", "gogus", "gym", ["hacim", "kuvvet"], "3", "12", "Göğsün ana hacim-kuvvet hareketi; omuzlar geride."],
    ["Incline Dumbbell Press", "gogus", "gym", ["hacim"], "3", "12", "Üst göğüs odağı; sehpa 30-45°."],
    ["Şınav", "gogus", "home", ["hacim", "kuvvet"], "3", "12", "Gövde tek çizgi; göğüs yere yaklaşsın."],
    ["Yavaş Tempo Şınav", "gogus", "home", ["hacim"], "3", "8", "4 sn iniş; gerilim altında kalma süresi."],
    ["Kapıda Göğüs Esnetmesi", "gogus", "home", ["esneklik", "postur"], "3", "30 sn", "Kol 90° kapı kasasında; göğsü öne bırak."],

    // Sırt
    ["Barbell Row", "sirt", "gym", ["hacim", "kuvvet"], "3", "12", "Sırt düz; barı göbek hizasına çek."],
    ["Pull-Up", "sirt", "gym", ["hacim", "kuvvet"], "3", "8", "Tam açıl; kontrollü iniş."],
    ["Face Pull", "sirt", "gym", ["postur", "hacim"], "3", "15", "Arka omuz ve postür; dirsekler yukarıda."],
    ["Masa Altı Çekiş (Inverted Row)", "sirt", "home", ["hacim", "kuvvet"], "3", "12", "Sağlam masa kenarı; gövde düz çizgi."],
    ["Cat-Cow", "sirt", "home", ["esneklik", "postur"], "3", "30 sn", "Omurga mobilitesi; nefesle senkron."],

    // Omuz
    ["Overhead Press", "omuz", "gym", ["kuvvet", "hacim"], "5", "5", "Karın sıkı; bar çeneyi geçsin."],
    ["Lateral Raise", "omuz", "gym", ["hacim"], "3", "12", "Dirsekler hafif bükük; savurmadan yükselt."],
    ["Pike Push-Up", "omuz", "home", ["hacim", "kuvvet"], "3", "10", "Dikey press simülasyonu."],
    ["Wall Angels", "omuz", "home", ["postur"], "3", "15", "Sırt duvara yapışık; kolları sürterek kaldır."],
    ["Cross-Body Omuz Esnetmesi", "omuz", "home", ["esneklik"], "3", "30 sn", "Kolu göğüs hizasında karşıya çek."],

    // Ön Kol
    ["Barbell Curl", "on_kol", "gym", ["hacim", "kuvvet"], "3", "12", "Dirsekler gövdeye sabit."],
    ["Hammer Curl", "on_kol", "gym", ["hacim"], "3", "12", "Nötr tutuş; brachialis yüklenir."],
    ["Havlu Biceps Curl", "on_kol", "home", ["hacim", "kuvvet"], "3", "12", "Havluyu kapıya sar; kendi ağırlığınla çek."],
    ["Kapıda Pazı Esnetmesi", "on_kol", "home", ["esneklik"], "3", "30 sn", "Avuç kapı kasasında; gövdeyi karşıya çevir."],

    // Arka Kol
    ["Close-Grip Bench Press", "arka_kol", "gym", ["kuvvet", "hacim"], "5", "5", "Triceps odaklı bench varyasyonu."],
    ["Cable Pushdown", "arka_kol", "gym", ["hacim"], "3", "12", "Dirsekler sabit; tam açılımda sıkıştır."],
    ["Sandalye Dips", "arka_kol", "home", ["hacim", "kuvvet"], "3", "12", "Omuzlar geride; kalça banka yakın."],
    ["Overhead Triceps Esnetmesi", "arka_kol", "home", ["esneklik"], "3", "30 sn", "Dirseği başın arkasına indir."],

    // Ön Bacak
    ["Back Squat", "on_bacak", "gym", ["kuvvet", "hacim", "sicrama"], "5", "5", "Dizler ayak yönünde; kontrollü derinlik."],
    ["Bulgarian Split Squat", "on_bacak", "gym", ["hacim", "sicrama"], "3", "10", "Arka ayak yükseltide; gövde dik."],
    ["Bodyweight Squat", "on_bacak", "home", ["hacim", "kuvvet"], "3", "12", "Topuklar yerde; dizler ayak yönünde."],
    ["Jump Squat", "on_bacak", "home", ["sicrama"], "4", "6", "Patlayıcı kalkış; yumuşak iniş."],
    ["Ayakta Quad Esnetmesi", "on_bacak", "home", ["esneklik"], "3", "30 sn", "Topuğu kalçaya çek; dizler bitişik."],

    // Arka Bacak
    ["Romanian Deadlift", "arka_bacak", "gym", ["kuvvet", "hacim"], "5", "5", "Kalça geriye; sırt düz çizgi."],
    ["Leg Curl", "arka_bacak", "gym", ["hacim"], "3", "12", "Topukları kalçaya çek."],
    ["Nordic Curl (Destekli)", "arka_bacak", "home", ["kuvvet", "hacim"], "3", "8", "Ayaklar sabit; gövdeyi yavaş bırak."],
    ["Yerde Hamstring Esnetmesi", "arka_bacak", "home", ["esneklik"], "3", "30 sn", "Sırtüstü bacağı göğse çek."],

    // Kalça
    ["Hip Thrust", "kalca", "gym", ["hacim", "kuvvet", "sicrama"], "4", "10", "Tepe noktada kalça sıkı; 2 sn bekle."],
    ["Depth Jump", "kalca", "gym", ["sicrama"], "4", "6", "Yükseltiden in; patlayıcı sıçra."],
    ["Glute Bridge", "kalca", "home", ["hacim", "postur"], "3", "15", "Tepe noktada kalça sıkı."],
    ["Squat Jump", "kalca", "home", ["sicrama"], "4", "6", "Derin squat'tan patlayıcı sıçrayış."],
    ["Pigeon Pose", "kalca", "home", ["esneklik"], "3", "30 sn", "Kalça rotatorlerini esnet."],

    // Karın
    ["Hanging Leg Raise", "karin", "gym", ["kuvvet", "hacim"], "3", "12", "Sallanmadan bacakları kaldır."],
    ["Pallof Press", "karin", "gym", ["postur", "kuvvet"], "3", "15", "Rotasyona karşı karın gergin."],
    ["Plank", "karin", "home", ["postur", "kuvvet"], "3", "30 sn", "Dirsekler omuz altında; kalça sabit."],
    ["Dead Bug", "karin", "home", ["postur"], "3", "15", "Karşı kol-bacak; bel nötr kalmalı."],
    ["Cobra Esnetmesi", "karin", "home", ["esneklik"], "3", "30 sn", "Kollar düz; ön gövde esner."],
];

export async function seedExercises(): Promise<SeedResult> {
    const { supabase } = await requireAdmin();

    // Tekrarlı tohumlamayı engelle
    const { count } = await supabase
        .from("exercises")
        .select("id", { count: "exact", head: true });

    if ((count ?? 0) > 0) {
        return {
            success: false,
            error: "Tabloda zaten egzersiz var; seed atlandı.",
        };
    }

    const { error } = await supabase.from("exercises").insert(
        SEED_DATA.map(
            ([
                name,
                target_muscle,
                environment,
                goals,
                sets,
                reps,
                description,
            ]) => ({
                name,
                target_muscle,
                environment,
                goals,
                sets,
                reps,
                description,
            }),
        ),
    );

    if (error) {
        console.error("Seed hatası:", error);
        return {
            success: false,
            error: `Seed başarısız: ${error.message}`,
        };
    }

    revalidatePath("/admin/exercises");
    revalidatePath("/training");

    return { success: true, inserted: SEED_DATA.length };
}
