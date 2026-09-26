"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Dumbbell, Home, Loader2, Save, Sparkles, Target } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import AuthDialog from "@/components/auth/auth-dialog";
import type {
    Environment,
    Exercise,
    MuscleGroup,
    ProgramGroup,
    TemplateKey,
    TrainingGoal,
} from "@/lib/data/exercises";
import {
    GOALS,
    groupExercises,
    MUSCLE_GROUPS,
    TRAINING_TEMPLATES,
} from "@/lib/data/exercises";
import ProgramRequestDialog from "./ProgramRequestDialog";
import { MultiSelect, SingleSelect } from "./select-controls";
import type { Gender } from "./AnatomyMap3D";

const AnatomyMap3D = dynamic(() => import("./AnatomyMap3D"), {
    ssr: false,
    loading: () => (
        <div className="flex h-[420px] items-center justify-center rounded-2xl border border-white/10 bg-[#0a0a0a] text-sm text-white/40">
            3D harita yükleniyor…
        </div>
    ),
});

export default function WorkoutGenerator() {
    const supabase = useMemo(() => createClient(), []);

    const [environment, setEnvironment] =
        useState<Environment>("home");
    const [goal, setGoal] = useState<TrainingGoal>("hacim");
    const [gender, setGender] = useState<Gender>("male");
    const [selectedMuscles, setSelectedMuscles] = useState<
        MuscleGroup[]
    >([]);
    const [template, setTemplate] = useState<TemplateKey>("custom");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);

    const [userId, setUserId] = useState<string | null>(null);
    const [saveState, setSaveState] = useState<
        "idle" | "saving" | "saved"
    >("idle");
    const [saveError, setSaveError] = useState("");

    const [program, setProgram] = useState<ProgramGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState(false);

    // Aktif oturumu dinle (Kaydet butonu davranışı buna bağlı)
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUserId(data.user?.id ?? null);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user.id ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const currentGoal = GOALS.find((item) => item.key === goal);
    const hasSelection = selectedMuscles.length > 0;

    /*
     * Canlı veri: seçim/ortam/hedef değişiminde exercises tablosu
     * sorgulanır. Hedef uyumluluğu `goals text[]` üzerinde
     * contains filtresiyle sunucuda çözülür; bölge başı limit
     * ve set/tekrar eşlemesi istemcide groupExercises ile yapılır.
     */
    useEffect(() => {
        // Seçim yoksa liste arayüzde zaten boş durumda; sorgu yapma
        if (selectedMuscles.length === 0) return;

        let cancelled = false;

        (async () => {
            // setState çağrıları asenkron gövdede (effect senkron kuralı)
            setLoading(true);
            setLoadError(false);
            setSaveState("idle");
            setSaveError("");

            const { data, error } = await supabase
                .from("exercises")
                .select(
                    "id, name, target_muscle, environment, sets, reps, description, goals, created_at",
                )
                .in("target_muscle", selectedMuscles)
                .eq("environment", environment)
                .contains("goals", [goal])
                .order("name", { ascending: true });

            if (cancelled) return;

            if (error) {
                console.error(error);
                setLoadError(true);
                setLoading(false);
                return;
            }

            setProgram(
                groupExercises(
                    (data ?? []) as Exercise[],
                    selectedMuscles,
                    goal,
                ),
            );
            setLoading(false);
        })();

        return () => {
            cancelled = true;
        };
    }, [supabase, selectedMuscles, environment, goal]);

    function handleToggle(muscle: MuscleGroup) {
        setTemplate("custom");
        setSelectedMuscles((current) =>
            current.includes(muscle)
                ? current.filter((item) => item !== muscle)
                : [...current, muscle],
        );
    }

    function handleTemplate(key: TemplateKey) {
        setTemplate(key);
        setSelectedMuscles(
            TRAINING_TEMPLATES.find((item) => item.key === key)
                ?.muscles ?? [],
        );
    }

    async function handleSave() {
        if (!userId || saveState !== "idle") return;

        setSaveError("");
        setSaveState("saving");

        const templateInfo = TRAINING_TEMPLATES.find(
            (item) => item.key === template,
        );

        const flatExercises = program.flatMap((group) =>
            group.exercises.map((exercise) => ({
                name: exercise.name,
                sets: exercise.sets,
                reps: exercise.reps,
                muscle: group.muscle,
            })),
        );

        const { error } = await supabase
            .from("saved_workouts")
            .insert({
                user_id: userId,
                title:
                    template !== "custom" && templateInfo
                        ? `${templateInfo.label} Programı`
                        : "Antrenman Programı",
                goal,
                environment,
                muscles: selectedMuscles,
                exercises: flatExercises,
            });

        if (error) {
            console.error(error);
            setSaveState("idle");
            setSaveError(
                "Program kaydedilemedi. Lütfen tekrar dene.",
            );
            return;
        }

        setSaveState("saved");
    }

    const programHasContent = program.some(
        (group) => group.exercises.length > 0,
    );

    return (
        <div className="grid gap-12 lg:grid-cols-[420px_1fr]">
            <div className="h-fit rounded-3xl border border-white/10 bg-[#111111] p-7 md:p-9">
                <div
                    role="group"
                    aria-label="Cinsiyet seçimi"
                    className="mb-5 flex rounded-full border border-white/15 p-1"
                >
                    {(
                        [
                            ["male", "Erkek"],
                            ["female", "Kadın"],
                        ] as const
                    ).map(([value, label]) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setGender(value)}
                            aria-pressed={gender === value}
                            className={`h-10 flex-1 rounded-full text-sm font-semibold transition ${
                                gender === value
                                    ? "bg-[#27D66B] text-black"
                                    : "text-white/55 hover:text-white"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <AnatomyMap3D
                    gender={gender}
                    selected={selectedMuscles}
                    onToggle={handleToggle}
                />

                {hasSelection && (
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedMuscles([]);
                            setTemplate("custom");
                        }}
                        className="mt-5 w-full rounded-full border border-white/15 py-2.5 text-xs font-semibold uppercase tracking-wider text-white/50 transition hover:border-white/30 hover:text-white"
                    >
                        Seçimi temizle ({selectedMuscles.length}{" "}
                        bölge)
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => setDialogOpen(true)}
                    className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#27D66B] text-sm font-bold text-[#050505] transition hover:bg-[#45e27f]"
                >
                    <Sparkles className="h-4 w-4" />
                    Kişisel Antrenman Programı İstiyorum
                </button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111111] p-7 md:p-9">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold">
                        {hasSelection
                            ? `${selectedMuscles.length} bölgelik programın`
                            : "Antrenman programın"}
                    </h2>

                    <div
                        role="group"
                        aria-label="Ortam seçimi"
                        className="flex rounded-full border border-white/15 p-1"
                    >
                        {(
                            [
                                ["home", "Ev", Home],
                                ["gym", "Spor Salonu", Dumbbell],
                            ] as const
                        ).map(([value, label, Icon]) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setEnvironment(value)}
                                aria-pressed={environment === value}
                                className={`inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold transition ${
                                    environment === value
                                        ? "bg-[#27D66B] text-black"
                                        : "text-white/55 hover:text-white"
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-6">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#27D66B]">
                        <Target className="h-4 w-4" />
                        Filtreler
                    </div>

                    <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <SingleSelect
                            label="Antrenman Şablonu"
                            options={TRAINING_TEMPLATES.map(
                                (item) => ({
                                    value: item.key,
                                    label: item.label,
                                }),
                            )}
                            value={template}
                            onChange={(value) =>
                                handleTemplate(value as TemplateKey)
                            }
                        />

                        <MultiSelect
                            label="Kas Grupları"
                            options={MUSCLE_GROUPS.map((group) => ({
                                value: group.key,
                                label: group.label,
                            }))}
                            values={selectedMuscles}
                            onToggle={(value) =>
                                handleToggle(value as MuscleGroup)
                            }
                        />

                        <SingleSelect
                            label="Antrenman Hedefi"
                            options={GOALS.map((item) => ({
                                value: item.key,
                                label: item.label,
                            }))}
                            value={goal}
                            onChange={(value) =>
                                setGoal(value as TrainingGoal)
                            }
                        />
                    </div>

                    {currentGoal && (
                        <p className="mt-3 text-xs leading-5 text-white/35">
                            {currentGoal.description} Set/tekrar:{" "}
                            <span className="font-semibold text-[#27D66B]">
                                {currentGoal.sets} × {currentGoal.reps}
                            </span>
                        </p>
                    )}
                </div>

                {!hasSelection ? (
                    <div className="mt-8 rounded-2xl border border-dashed border-white/15 px-6 py-14 text-center">
                        <p className="mx-auto max-w-md text-lg leading-8 text-white/45">
                            Antrenman programını görmek için 3D
                            haritadan bir veya daha fazla kas grubu
                            seç.
                        </p>

                        <p className="mt-3 text-sm text-white/30">
                            Hedefini belirlediğinde set ve tekrarlar
                            otomatik ayarlanır; çoklu bölge seçiminde
                            program dengelenir.
                        </p>
                    </div>
                ) : loading ? (
                    <div
                        role="status"
                        aria-label="Program yükleniyor"
                        className="mt-8 space-y-8"
                    >
                        {selectedMuscles.map((muscle) => (
                            <div key={muscle} className="animate-pulse">
                                <div className="h-4 w-28 rounded-full bg-white/10" />
                                <div className="mt-3 space-y-3 border-y border-white/10 py-4">
                                    {[0, 1, 2].map((row) => (
                                        <div
                                            key={row}
                                            className="flex items-center gap-5"
                                        >
                                            <span className="h-9 w-9 rounded-full bg-white/10" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 w-2/5 rounded bg-white/10" />
                                                <div className="h-3 w-3/5 rounded bg-white/5" />
                                            </div>
                                            <div className="h-6 w-14 rounded bg-white/10" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : loadError ? (
                    <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-5 text-red-300">
                        Egzersizler yüklenemedi. Lütfen daha sonra
                        tekrar dene.
                    </div>
                ) : (
                    <div className="mt-8 space-y-8">
                        {program.map((group) =>
                            group.exercises.length === 0 ? (
                                <div key={group.muscle}>
                                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#27D66B]">
                                        {group.label}
                                    </h3>

                                    <p className="mt-3 rounded-2xl border border-dashed border-white/15 px-6 py-6 text-sm leading-6 text-white/45">
                                        Bu bölge için seçilen amaca
                                        uygun spesifik bir hareket
                                        bulunmuyor, farklı bir
                                        kombinasyon deneyin.
                                    </p>
                                </div>
                            ) : (
                            <div key={group.muscle}>
                                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#27D66B]">
                                    {group.label}
                                </h3>

                                <div className="mt-3 divide-y divide-white/10 border-y border-white/10">
                                    {group.exercises.map(
                                        (exercise, index) => (
                                            <div
                                                key={exercise.id}
                                                className="flex items-start gap-5 py-5"
                                            >
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#27D66B]/10 text-sm font-bold tabular-nums text-[#27D66B]">
                                                    {index + 1}
                                                </span>

                                                <div className="flex-1">
                                                    <h4 className="text-lg font-semibold">
                                                        {exercise.name}
                                                    </h4>

                                                    {exercise.description && (
                                                        <p className="mt-1 text-sm leading-6 text-white/45">
                                                            {
                                                                exercise.description
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="shrink-0 text-right">
                                                    <span className="block text-[11px] uppercase tracking-wider text-white/30">
                                                        Set × Tekrar
                                                    </span>

                                                    <span className="mt-1 block text-lg font-bold tabular-nums text-[#27D66B]">
                                                        {exercise.sets}{" "}
                                                        × {exercise.reps}
                                                    </span>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                            ),
                        )}

                        {programHasContent && (
                            <div className="border-t border-white/10 pt-5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (userId) {
                                            handleSave();
                                        } else {
                                            setAuthOpen(true);
                                        }
                                    }}
                                    disabled={saveState !== "idle"}
                                    className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-bold transition ${
                                        saveState === "saved"
                                            ? "cursor-default border border-[#27D66B]/40 bg-[#27D66B]/10 text-[#27D66B]"
                                            : "bg-[#27D66B] text-[#050505] hover:bg-[#45e27f] disabled:opacity-50"
                                    }`}
                                >
                                    {saveState === "saving" ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Kaydediliyor…
                                        </>
                                    ) : saveState === "saved" ? (
                                        "Kaydedildi ✓"
                                    ) : userId ? (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Profilime Kaydet
                                        </>
                                    ) : (
                                        "Kaydetmek İçin Giriş Yap"
                                    )}
                                </button>

                                {saveState === "saved" && (
                                    <p className="mt-3 text-center text-sm text-[#27D66B]">
                                        Programın profiline kaydedildi.{" "}
                                        <a
                                            href="/profile"
                                            className="font-semibold underline underline-offset-4"
                                        >
                                            Profilinde görüntüle
                                        </a>
                                    </p>
                                )}

                                {saveError && (
                                    <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                        {saveError}
                                    </p>
                                )}
                            </div>
                        )}

                        <p className="text-xs leading-6 text-white/30">
                            Hareketleri kendi seviyene göre adapte et;
                            ağrı hissedersen bırak. Bu program genel
                            bilgilendirme amaçlıdır, kişiye özel plan
                            için koç ekibimizle iletişime geç.
                        </p>
                    </div>
                )}
            </div>

            <ProgramRequestDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
            />

            <AuthDialog
                open={authOpen}
                onClose={() => setAuthOpen(false)}
            />
        </div>
    );
}
