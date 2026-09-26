"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";

/*
 * Metabolizma ve Makro Hesaplayıcı
 *
 * BMR: Mifflin-St Jeor formülü
 *   Erkek : 10 * kilo + 6.25 * boy - 5 * yaş + 5
 *   Kadın : 10 * kilo + 6.25 * boy - 5 * yaş - 161
 *
 * TDEE: BMR * aktivite katsayısı (1.2 – 1.9)
 *
 * Hedef kalorisi: TDEE - 400 (kilo verme) / TDEE (koruma) / TDEE + 400
 * (kilo alma). Güvenlik sınırı: 1200 kcal altına düşülmez.
 *
 * Makrolar (gram):
 *   Protein      : 2 g / kg (kas koruması için sabit, 4 kcal/g)
 *   Yağ          : 0.9 g / kg (9 kcal/g)
 *   Karbonhidrat : kalan kalori / 4
 */

type Gender = "male" | "female";
type Goal = "lose" | "maintain" | "gain";

type ActivityLevel = {
    key: string;
    label: string;
    description: string;
    multiplier: number;
};

const ACTIVITY_LEVELS: ActivityLevel[] = [
    {
        key: "sedentary",
        label: "Masa başı",
        description: "Neredeyse hiç egzersiz yok",
        multiplier: 1.2,
    },
    {
        key: "light",
        label: "Hafif aktif",
        description: "Haftada 1-3 gün hafif egzersiz",
        multiplier: 1.375,
    },
    {
        key: "moderate",
        label: "Orta aktif",
        description: "Haftada 3-5 gün egzersiz",
        multiplier: 1.55,
    },
    {
        key: "active",
        label: "Aktif",
        description: "Haftada 6-7 gün yoğun egzersiz",
        multiplier: 1.725,
    },
    {
        key: "very_active",
        label: "Çok aktif",
        description: "Günde 2 antrenman veya fiziksel iş",
        multiplier: 1.9,
    },
];

const GOALS: {
    key: Goal;
    label: string;
    description: string;
    adjustment: number;
}[] = [
    {
        key: "lose",
        label: "Kilo verme",
        description: "Günde ~400 kcal açık ile yağ kaybı",
        adjustment: -400,
    },
    {
        key: "maintain",
        label: "Kilo koruma",
        description: "Mevcut kilonu sürdür",
        adjustment: 0,
    },
    {
        key: "gain",
        label: "Kilo alma / kas geliştirme",
        description: "Günde ~400 kcal fazla ile kontrollü artış",
        adjustment: 400,
    },
];

const MIN_CALORIES = 1200;
const PROTEIN_PER_KG = 2;
const FAT_PER_KG = 0.9;

const inputClassName =
    "w-full rounded-2xl border border-white/15 bg-[#050505] px-5 py-4 text-lg font-semibold text-white outline-none transition placeholder:text-white/25 focus:border-[#27D66B]";

const STEP_TITLES = [
    "Önce seni tanıyalım",
    "Ne kadar hareketlisin?",
    "Hedefin ne?",
] as const;

function formatNumber(value: number) {
    return new Intl.NumberFormat("tr-TR", {
        maximumFractionDigits: 0,
    }).format(value);
}

export default function MetabolismCalculator() {
    const [step, setStep] = useState(0);

    const [gender, setGender] = useState<Gender>("male");
    const [age, setAge] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [activity, setActivity] = useState<ActivityLevel | null>(
        null,
    );
    const [goal, setGoal] = useState<Goal | null>(null);

    const parsedAge = Number(age);
    const parsedHeight = Number(height);
    const parsedWeight = Number(weight);

    const isBodyValid =
        parsedAge >= 10 &&
        parsedAge <= 100 &&
        parsedHeight >= 120 &&
        parsedHeight <= 230 &&
        parsedWeight >= 30 &&
        parsedWeight <= 300;

    const canContinue =
        step === 0
            ? isBodyValid
            : step === 1
              ? activity !== null
              : goal !== null;

    const result = useMemo(() => {
        if (!isBodyValid || !activity || !goal) {
            return null;
        }

        const bmr =
            10 * parsedWeight +
            6.25 * parsedHeight -
            5 * parsedAge +
            (gender === "male" ? 5 : -161);

        const tdee = bmr * activity.multiplier;

        const adjustment =
            GOALS.find((item) => item.key === goal)?.adjustment ??
            0;

        const targetCalories = Math.max(
            MIN_CALORIES,
            Math.round(tdee + adjustment),
        );

        const proteinGrams = Math.round(
            parsedWeight * PROTEIN_PER_KG,
        );
        const fatGrams = Math.round(parsedWeight * FAT_PER_KG);
        const carbGrams = Math.max(
            0,
            Math.round(
                (targetCalories -
                    proteinGrams * 4 -
                    fatGrams * 9) /
                    4,
            ),
        );

        return {
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            targetCalories,
            proteinGrams,
            fatGrams,
            carbGrams,
            isClamped:
                Math.round(tdee + adjustment) < MIN_CALORIES,
        };
    }, [
        activity,
        gender,
        goal,
        isBodyValid,
        parsedAge,
        parsedHeight,
        parsedWeight,
    ]);

    function reset() {
        setStep(0);
        setGender("male");
        setAge("");
        setHeight("");
        setWeight("");
        setActivity(null);
        setGoal(null);
    }

    return (
        <div className="grid gap-12 lg:grid-cols-[1fr_420px]">
            <div className="rounded-3xl border border-white/10 bg-[#111111] p-7 md:p-10">
                <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#27D66B]">
                        Metabolizma ve Makro Hesaplayıcı
                    </span>

                    <span className="text-sm tabular-nums text-white/35">
                        {Math.min(step + 1, 3)} / 3
                    </span>
                </div>

                <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                        className="h-full bg-[#27D66B] transition-all duration-500"
                        style={{
                            width: `${((step + 1) / 4) * 100}%`,
                        }}
                    />
                </div>

                {step < 3 && (
                    <h2 className="mt-10 text-3xl font-bold tracking-tight md:text-4xl">
                        {STEP_TITLES[step]}
                    </h2>
                )}

                {step === 0 && (
                    <div className="mt-10 space-y-8">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-white/35">
                                Cinsiyet
                            </span>

                            <div className="mt-3 grid grid-cols-2 gap-3">
                                {(
                                    [
                                        ["male", "Erkek"],
                                        ["female", "Kadın"],
                                    ] as const
                                ).map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() =>
                                            setGender(value)
                                        }
                                        className={`rounded-2xl border px-5 py-4 text-lg font-semibold transition ${
                                            gender === value
                                                ? "border-[#27D66B] bg-[#27D66B]/10 text-[#27D66B]"
                                                : "border-white/15 text-white/60 hover:border-white/30"
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-3">
                            <label className="block">
                                <span className="text-xs font-semibold uppercase tracking-wider text-white/35">
                                    Yaş
                                </span>

                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min={10}
                                    max={100}
                                    value={age}
                                    onChange={(event) =>
                                        setAge(
                                            event.target
                                                .value,
                                        )
                                    }
                                    placeholder="28"
                                    className={`mt-3 ${inputClassName}`}
                                />
                            </label>

                            <label className="block">
                                <span className="text-xs font-semibold uppercase tracking-wider text-white/35">
                                    Boy (cm)
                                </span>

                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min={120}
                                    max={230}
                                    value={height}
                                    onChange={(event) =>
                                        setHeight(
                                            event.target
                                                .value,
                                        )
                                    }
                                    placeholder="178"
                                    className={`mt-3 ${inputClassName}`}
                                />
                            </label>

                            <label className="block">
                                <span className="text-xs font-semibold uppercase tracking-wider text-white/35">
                                    Kilo (kg)
                                </span>

                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min={30}
                                    max={300}
                                    value={weight}
                                    onChange={(event) =>
                                        setWeight(
                                            event.target
                                                .value,
                                        )
                                    }
                                    placeholder="75"
                                    className={`mt-3 ${inputClassName}`}
                                />
                            </label>
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="mt-10 space-y-3">
                        {ACTIVITY_LEVELS.map((level) => (
                            <button
                                key={level.key}
                                type="button"
                                onClick={() =>
                                    setActivity(level)
                                }
                                className={`flex w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left transition ${
                                    activity?.key ===
                                    level.key
                                        ? "border-[#27D66B] bg-[#27D66B]/10"
                                        : "border-white/15 hover:border-white/30"
                                }`}
                            >
                                <span>
                                    <span
                                        className={`block text-lg font-semibold ${
                                            activity?.key ===
                                            level.key
                                                ? "text-[#27D66B]"
                                                : "text-white"
                                        }`}
                                    >
                                        {level.label}
                                    </span>

                                    <span className="mt-1 block text-sm text-white/40">
                                        {level.description}
                                    </span>
                                </span>

                                <span className="shrink-0 text-sm tabular-nums text-white/30">
                                    ×{level.multiplier}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {step === 2 && (
                    <div className="mt-10 space-y-3">
                        {GOALS.map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() =>
                                    setGoal(item.key)
                                }
                                className={`block w-full rounded-2xl border px-5 py-4 text-left transition ${
                                    goal === item.key
                                        ? "border-[#27D66B] bg-[#27D66B]/10"
                                        : "border-white/15 hover:border-white/30"
                                }`}
                            >
                                <span
                                    className={`block text-lg font-semibold ${
                                        goal === item.key
                                            ? "text-[#27D66B]"
                                            : "text-white"
                                    }`}
                                >
                                    {item.label}
                                </span>

                                <span className="mt-1 block text-sm text-white/40">
                                    {item.description}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {step === 3 && result && (
                    <div className="mt-6">
                        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#27D66B]">
                            Sonuçların hazır
                        </span>

                        <div className="mt-6">
                            <span className="text-sm uppercase tracking-wider text-white/35">
                                Günlük hedef kalori
                            </span>

                            <p className="mt-2 text-7xl font-bold tabular-nums tracking-tight text-[#27D66B] lg:text-8xl">
                                {formatNumber(
                                    result.targetCalories,
                                )}
                                <span className="ml-3 text-2xl font-semibold text-white/40">
                                    kcal
                                </span>
                            </p>
                        </div>

                        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
                            {(
                                [
                                    [
                                        "Protein",
                                        result.proteinGrams,
                                    ],
                                    [
                                        "Karbonhidrat",
                                        result.carbGrams,
                                    ],
                                    [
                                        "Yağ",
                                        result.fatGrams,
                                    ],
                                ] as const
                            ).map(([label, grams]) => (
                                <div
                                    key={label}
                                    className="bg-[#111111] px-5 py-6"
                                >
                                    <span className="text-xs uppercase tracking-wider text-white/35">
                                        {label}
                                    </span>

                                    <p className="mt-2 text-3xl font-bold tabular-nums">
                                        {grams}
                                        <span className="ml-1 text-base font-semibold text-white/40">
                                            g
                                        </span>
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 space-y-4 border-t border-white/10 pt-6 text-sm leading-6 text-white/45">
                            <p>
                                Bazal metabolizma hızın
                                (BMR):{" "}
                                <strong className="text-white">
                                    {formatNumber(result.bmr)}{" "}
                                    kcal
                                </strong>{" "}
                                — vücudun tam dinlenmede yaktığı
                                enerji.
                            </p>

                            <p>
                                Toplam günlük harcaman (TDEE):{" "}
                                <strong className="text-white">
                                    {formatNumber(result.tdee)}{" "}
                                    kcal
                                </strong>{" "}
                                — aktivite seviyen dahil günlük
                                yaklaşık tüketim.
                            </p>

                            {result.isClamped && (
                                <p className="text-[#27D66B]">
                                    Hesaplanan hedef düşük
                                    çıktığı için güvenli alt
                                    sınır olan {MIN_CALORIES}{" "}
                                    kcal&apos;e yükseltildi.
                                    Daha düşük bir hedef için
                                    mutlaka bir uzmana danış.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-10 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
                    {step > 0 ? (
                        <button
                            type="button"
                            onClick={() =>
                                setStep((current) =>
                                    Math.max(
                                        0,
                                        current - 1,
                                    ),
                                )
                            }
                            className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-semibold text-white/70 transition hover:border-white/30 hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Geri
                        </button>
                    ) : (
                        <span />
                    )}

                    {step < 3 ? (
                        <button
                            type="button"
                            disabled={!canContinue}
                            onClick={() =>
                                setStep((current) =>
                                    Math.min(
                                        3,
                                        current + 1,
                                    ),
                                )
                            }
                            className="inline-flex h-12 items-center gap-2 rounded-full bg-[#27D66B] px-7 text-sm font-semibold uppercase tracking-wider text-black transition enabled:hover:bg-[#45e27f] disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            {step === 2
                                ? "Hesapla"
                                : "Devam et"}
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={reset}
                            className="inline-flex h-12 items-center gap-2 rounded-full border border-[#27D66B]/40 px-7 text-sm font-semibold uppercase tracking-wider text-[#27D66B] transition hover:bg-[#27D66B]/10"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Yeniden hesapla
                        </button>
                    )}
                </div>
            </div>

            <aside className="h-fit space-y-6 rounded-3xl border border-white/10 bg-[#111111] p-7 md:p-9">
                <h2 className="text-2xl font-bold">
                    Nasıl hesaplıyoruz?
                </h2>

                <div className="space-y-5 text-sm leading-7 text-white/50">
                    <p>
                        <strong className="text-white">
                            1. BMR
                        </strong>{" "}
                        — Vücudunun dinlenirken yaktığı enerji,
                        Mifflin-St Jeor formülüyle
                        hesaplanır. Bilimsel olarak en güncel
                        ve güvenilir yaklaşımdır.
                    </p>

                    <p>
                        <strong className="text-white">
                            2. TDEE
                        </strong>{" "}
                        — BMR, günlük hareketlilik katsayınla
                        çarpılarak gerçek hayattaki toplam
                        enerji harcaman bulunur.
                    </p>

                    <p>
                        <strong className="text-white">
                            3. Hedef ve makrolar
                        </strong>{" "}
                        — Hedefine göre kalori eklenir veya
                        azaltılır; protein kilo başına 2 g
                        olacak şekilde sabitlenir, yağ 0.9
                        g/kg ayarlanır, kalan kalori
                        karbonhidrata verilir.
                    </p>
                </div>

                <p className="border-t border-white/10 pt-5 text-xs leading-6 text-white/30">
                    Bu araç genel bilgilendirme amaçlıdır;
                    tıbbi tavsiye yerine geçmez. Sağlık
                    durumunla ilgili kararlar için bir uzmana
                    danış.
                </p>
            </aside>
        </div>
    );
}
