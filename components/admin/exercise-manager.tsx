"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import type {
    Environment,
    Exercise,
    MuscleGroup,
    TrainingGoal,
} from "@/lib/data/exercises";
import { ENVIRONMENTS, GOALS, MUSCLE_GROUPS } from "@/lib/data/exercises";

type ExerciseManagerProps = {
    exercises: Exercise[];
};

function muscleLabel(value: string) {
    return (
        MUSCLE_GROUPS.find((group) => group.key === value)
            ?.label ?? value
    );
}

function environmentLabel(value: string) {
    return (
        ENVIRONMENTS.find((env) => env.key === value)?.label ??
        value
    );
}

function goalLabel(value: string) {
    return (
        GOALS.find((goal) => goal.key === value)?.label ?? value
    );
}

export default function ExerciseManager({
    exercises,
}: ExerciseManagerProps) {
    const router = useRouter();
    const supabase = createClient();

    const [name, setName] = useState("");
    const [targetMuscle, setTargetMuscle] =
        useState<MuscleGroup>("gogus");
    const [environment, setEnvironment] =
        useState<Environment>("home");
    const [sets, setSets] = useState("");
    const [reps, setReps] = useState("");
    const [description, setDescription] = useState("");
    const [goals, setGoals] = useState<TrainingGoal[]>(["hacim"]);

    function toggleGoal(goal: TrainingGoal) {
        setGoals((current) =>
            current.includes(goal)
                ? current.filter((item) => item !== goal)
                : [...current, goal],
        );
    }

    const [loadingAction, setLoadingAction] = useState<
        string | null
    >(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    async function handleCreate(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");

        if (goals.length === 0) {
            setErrorMessage(
                "En az bir hedef seçmelisin.",
            );
            return;
        }

        setLoadingAction("create");

        const { error } = await supabase.from("exercises").insert({
            name: name.trim(),
            target_muscle: targetMuscle,
            environment,
            sets: sets.trim(),
            reps: reps.trim(),
            description: description.trim() || null,
            goals,
        });

        setLoadingAction(null);

        if (error) {
            console.error(error);
            setErrorMessage(
                "Egzersiz eklenemedi. Lütfen tekrar dene.",
            );
            return;
        }

        setSuccessMessage("Egzersiz eklendi.");
        setName("");
        setSets("");
        setReps("");
        setDescription("");
        setGoals(["hacim"]);
        router.refresh();
    }

    async function handleDelete(exerciseId: string) {
        setErrorMessage("");
        setSuccessMessage("");
        setLoadingAction(exerciseId);

        const { error } = await supabase
            .from("exercises")
            .delete()
            .eq("id", exerciseId);

        setLoadingAction(null);

        if (error) {
            console.error(error);
            setErrorMessage(
                "Egzersiz silinemedi. Lütfen tekrar dene.",
            );
            return;
        }

        setSuccessMessage("Egzersiz silindi.");
        router.refresh();
    }

    return (
        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
            <form
                onSubmit={handleCreate}
                className="h-fit rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8"
            >
                <h2 className="text-xl font-bold text-zinc-950">
                    Yeni egzersiz ekle
                </h2>

                <div className="mt-6 space-y-5">
                    <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            Egzersiz adı
                        </span>

                        <input
                            type="text"
                            required
                            maxLength={120}
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            placeholder="Bench Press"
                            className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-950 outline-none transition focus:border-[#27D66B]"
                        />
                    </label>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                        <label className="block">
                            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                Kas grubu
                            </span>

                            <select
                                value={targetMuscle}
                                onChange={(event) =>
                                    setTargetMuscle(
                                        event.target
                                            .value as MuscleGroup,
                                    )
                                }
                                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-950 outline-none transition focus:border-[#27D66B]"
                            >
                                {MUSCLE_GROUPS.map(
                                    (group) => (
                                        <option
                                            key={group.key}
                                            value={group.key}
                                        >
                                            {group.label}
                                        </option>
                                    ),
                                )}
                            </select>
                        </label>

                        <label className="block">
                            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                Ortam
                            </span>

                            <select
                                value={environment}
                                onChange={(event) =>
                                    setEnvironment(
                                        event.target
                                            .value as Environment,
                                    )
                                }
                                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-950 outline-none transition focus:border-[#27D66B]"
                            >
                                {ENVIRONMENTS.map((env) => (
                                    <option
                                        key={env.key}
                                        value={env.key}
                                    >
                                        {env.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                        <label className="block">
                            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                Set
                            </span>

                            <input
                                type="text"
                                required
                                maxLength={20}
                                value={sets}
                                onChange={(event) =>
                                    setSets(
                                        event.target.value,
                                    )
                                }
                                placeholder="4"
                                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-950 outline-none transition focus:border-[#27D66B]"
                            />
                        </label>

                        <label className="block">
                            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                Tekrar
                            </span>

                            <input
                                type="text"
                                required
                                maxLength={30}
                                value={reps}
                                onChange={(event) =>
                                    setReps(
                                        event.target.value,
                                    )
                                }
                                placeholder="8-10"
                                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-950 outline-none transition focus:border-[#27D66B]"
                            />
                        </label>
                    </div>

                    <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            Açıklama (opsiyonel)
                        </span>

                        <textarea
                            rows={3}
                            maxLength={400}
                            value={description}
                            onChange={(event) =>
                                setDescription(
                                    event.target.value,
                                )
                            }
                            placeholder="Form ipucu, tempo notu…"
                            className="mt-2 w-full resize-none rounded-xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-950 outline-none transition focus:border-[#27D66B]"
                        />
                    </label>

                    <fieldset>
                        <legend className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            Hedefler
                        </legend>

                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            {GOALS.map((goal) => (
                                <label
                                    key={goal.key}
                                    className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-zinc-300 px-3.5 py-2.5 text-sm font-medium text-zinc-950 transition has-checked:border-[#27D66B] has-checked:bg-[#27D66B]/5"
                                >
                                    <input
                                        type="checkbox"
                                        checked={goals.includes(
                                            goal.key,
                                        )}
                                        onChange={() =>
                                            toggleGoal(goal.key)
                                        }
                                        className="h-4 w-4 accent-[#27D66B]"
                                    />
                                    {goal.label}
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <button
                        type="submit"
                        disabled={loadingAction !== null}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#27D66B] text-sm font-bold text-[#050505] transition hover:bg-[#45e27f] disabled:opacity-50"
                    >
                        {loadingAction === "create" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="h-4 w-4" />
                        )}
                        Egzersizi ekle
                    </button>

                    {errorMessage && (
                        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {errorMessage}
                        </p>
                    )}

                    {successMessage && (
                        <p className="rounded-xl border border-[#27D66B]/30 bg-[#27D66B]/10 px-4 py-3 text-sm text-[#159447]">
                            {successMessage}
                        </p>
                    )}
                </div>
            </form>

            <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8">
                <h2 className="text-xl font-bold text-zinc-950">
                    Kayıtlı egzersizler ({exercises.length})
                </h2>

                {exercises.length === 0 ? (
                    <p className="mt-6 rounded-2xl border border-dashed border-zinc-300 px-6 py-12 text-center text-sm text-zinc-500">
                        Henüz egzersiz eklenmedi.
                    </p>
                ) : (
                    <ul className="mt-6 divide-y divide-zinc-100">
                        {exercises.map((exercise) => (
                            <li
                                key={exercise.id}
                                className="flex items-start gap-4 py-4"
                            >
                                <div className="flex-1">
                                    <h3 className="font-semibold text-zinc-950">
                                        {exercise.name}
                                    </h3>

                                    {exercise.description && (
                                        <p className="mt-1 text-sm leading-6 text-zinc-500">
                                            {
                                                exercise.description
                                            }
                                        </p>
                                    )}

                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <span className="rounded-full bg-[#27D66B]/10 px-3 py-1 text-xs font-bold text-[#159447]">
                                            {muscleLabel(
                                                exercise.target_muscle,
                                            )}
                                        </span>

                                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                                            {environmentLabel(
                                                exercise.environment,
                                            )}
                                        </span>

                                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold tabular-nums text-zinc-600">
                                            {exercise.sets} ×{" "}
                                            {exercise.reps}
                                        </span>

                                        {exercise.goals?.map(
                                            (goal) => (
                                                <span
                                                    key={goal}
                                                    className="rounded-full border border-[#27D66B]/30 px-3 py-1 text-xs font-semibold text-[#159447]"
                                                >
                                                    {goalLabel(goal)}
                                                </span>
                                            ),
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDelete(
                                            exercise.id,
                                        )
                                    }
                                    disabled={
                                        loadingAction !==
                                        null
                                    }
                                    aria-label={`${exercise.name} egzersizini sil`}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-400 transition hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                                >
                                    {loadingAction ===
                                    exercise.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
