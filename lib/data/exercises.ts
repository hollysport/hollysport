/*
 * Antrenman Merkezi — paylaşılan tip, sabit ve algoritma yardımcıları.
 *
 * Egzersiz kayıtları Supabase `exercises` tablosundan canlı çekilir
 * (hedef uyumluluğu `goals text[]` kolonu ile). Bu dosya artık veri
 * taşımaz; yalnızca tipleri, sabit listeleri ve saf algoritma
 * yardımcılarını barındırır.
 */

export type MuscleGroup =
    | "gogus"
    | "sirt"
    | "omuz"
    | "on_kol"
    | "arka_kol"
    | "on_bacak"
    | "arka_bacak"
    | "kalca"
    | "karin";

export type Environment = "home" | "gym";

export type TrainingGoal =
    | "hacim"
    | "kuvvet"
    | "esneklik"
    | "postur"
    | "sicrama";

export type Exercise = {
    id: string;
    name: string;
    target_muscle: MuscleGroup;
    environment: Environment;
    sets: string;
    reps: string;
    description: string | null;
    goals: TrainingGoal[];
    created_at: string;
};

export const MUSCLE_GROUPS: {
    key: MuscleGroup;
    label: string;
}[] = [
    { key: "gogus", label: "Göğüs" },
    { key: "sirt", label: "Sırt" },
    { key: "omuz", label: "Omuz" },
    { key: "on_kol", label: "Ön Kol" },
    { key: "arka_kol", label: "Arka Kol" },
    { key: "on_bacak", label: "Ön Bacak" },
    { key: "arka_bacak", label: "Arka Bacak" },
    { key: "kalca", label: "Kalça" },
    { key: "karin", label: "Karın" },
];

export const ENVIRONMENTS: {
    key: Environment;
    label: string;
}[] = [
    { key: "home", label: "Ev" },
    { key: "gym", label: "Spor Salonu" },
];

export const GOALS: {
    key: TrainingGoal;
    label: string;
    description: string;
    sets: string;
    reps: string;
}[] = [
    {
        key: "hacim",
        label: "Hacim (Hipertrofi)",
        description: "Kas kütlesi kazanımına odaklı, orta-yüksek tekrar aralığı.",
        sets: "3",
        reps: "12",
    },
    {
        key: "kuvvet",
        label: "Maksimum Kuvvet",
        description: "Düşük tekrar, yüksek şiddet; temel kuvvet gelişimi.",
        sets: "5",
        reps: "5",
    },
    {
        key: "esneklik",
        label: "Esneklik / Mobilite",
        description: "Hareket açıklığı ve esneme odaklı çalışma.",
        sets: "3",
        reps: "30 sn",
    },
    {
        key: "postur",
        label: "Postür Düzeltme",
        description: "Duruş kaslarını dengeleyici, kontrollü tempo.",
        sets: "3",
        reps: "15",
    },
    {
        key: "sicrama",
        label: "Dikey Sıçrama Geliştirme",
        description: "Patlayıcı kuvvet ve reaktif hız odaklı.",
        sets: "4",
        reps: "6",
    },
];

/*
 * Algoritma kuralı — seçilen bölge sayısına göre bölge başı hareket:
 * 1 bölge → 4 hareket, 2 bölge → 3'er hareket, 3+ bölge → dengeli 2'şer.
 */
export function exercisesPerRegion(regionCount: number): number {
    if (regionCount <= 0) return 0;
    if (regionCount === 1) return 4;
    if (regionCount === 2) return 3;
    return 2;
}

export type ProgramGroup = {
    muscle: MuscleGroup;
    label: string;
    exercises: Exercise[];
};

/*
 * Hazır antrenman şablonları — seçimde bölge setini bilimsel
 * dağılıma göre otomatik doldurur ("custom" = özel seçim).
 */
export type TemplateKey =
    | "custom"
    | "fullbody"
    | "ust_vucut"
    | "alt_vucut"
    | "push"
    | "pull";

export const TRAINING_TEMPLATES: {
    key: TemplateKey;
    label: string;
    muscles: MuscleGroup[];
}[] = [
    { key: "custom", label: "Özel Seçim", muscles: [] },
    { key: "fullbody", label: "Fullbody", muscles: MUSCLE_GROUPS.map((group) => group.key) },
    { key: "ust_vucut", label: "Üst Vücut", muscles: ["gogus", "sirt", "omuz", "on_kol", "arka_kol", "karin"] },
    { key: "alt_vucut", label: "Alt Vücut", muscles: ["on_bacak", "arka_bacak", "kalca"] },
    { key: "push", label: "İtiş (Push)", muscles: ["gogus", "omuz", "arka_kol"] },
    { key: "pull", label: "Çekiş (Pull)", muscles: ["sirt", "on_kol"] },
];

/*
 * Canlı çekilen egzersizleri bölge gruplarına dağıtır.
 * Filtreleme (kas + ortam + hedef) sorgu tarafında yapılır;
 * burada bölge başı limit uygulanır ve set/tekrar hedef
 * kuralından gelerek havuz kaydının üzerine yazılır.
 */
export function groupExercises(
    exercises: Exercise[],
    muscles: MuscleGroup[],
    goal: TrainingGoal,
): ProgramGroup[] {
    const perRegion = exercisesPerRegion(muscles.length);
    const goalInfo = GOALS.find((item) => item.key === goal);

    if (perRegion === 0 || !goalInfo) return [];

    return muscles.map((muscle) => ({
        muscle,
        label:
            MUSCLE_GROUPS.find((group) => group.key === muscle)?.label ??
            muscle,
        exercises: exercises
            .filter((exercise) => exercise.target_muscle === muscle)
            .slice(0, perRegion)
            .map((exercise) => ({
                ...exercise,
                sets: goalInfo.sets,
                reps: goalInfo.reps,
            })),
    }));
}
