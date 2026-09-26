"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    CalendarDays,
    ChevronDown,
    Dumbbell,
    Loader2,
    LogOut,
    Trash2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/database.types";
import { AvatarIcon } from "./avatar-selector";

type Profile = {
    id: string;
    email: string | null;
    full_name: string | null;
    age: number | null;
    gender: string | null;
    avatar_url: string | null;
    birth_date: string | null;
    join_date: string | null;
    interested_sports: string[] | null;
};

type SavedExercise = {
    name: string;
    sets: string;
    reps: string;
    muscle?: string;
};

type SavedWorkout = {
    id: string;
    user_id: string;
    title: string;
    goal: string | null;
    environment: string | null;
    muscles: string[];
    exercises: Json;
    created_at: string;
};

const ENVIRONMENT_LABELS: Record<string, string> = {
    home: "Ev",
    gym: "Spor Salonu",
};

const GENDER_LABELS: Record<string, string> = {
    kadin: "Kadın",
    erkek: "Erkek",
    "belirtmek-istemiyorum": "Belirtilmedi",
};

function calculateAge(birthDate: string): number | null {
    const birth = new Date(birthDate);
    if (Number.isNaN(birth.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
        age -= 1;
    }

    return age >= 0 ? age : null;
}

function membershipLabel(joinDate: string | null): string {
    if (!joinDate) return "Yeni Üye";

    const join = new Date(joinDate).getTime();
    if (Number.isNaN(join)) return "Yeni Üye";

    const months =
        (Date.now() - join) / (1000 * 60 * 60 * 24 * 30.44);

    if (months < 3) return "Yeni / 1-3 Aylık Üye";
    if (months < 6) return "3-6 Aylık Üye";
    if (months < 12) return "6-12 Aylık Üye";
    if (months < 24) return "1-2 Yıllık Üye";
    return "2+ Yıllık Üye";
}

function parseExercises(exercises: Json): SavedExercise[] {
    if (!Array.isArray(exercises)) return [];

    return exercises.filter(
        (item): item is SavedExercise =>
            typeof item === "object" &&
            item !== null &&
            "name" in item &&
            "sets" in item &&
            "reps" in item,
    );
}

export default function ProfileDashboard({
    email,
    profile,
    workouts,
}: {
    email: string;
    profile: Profile | null;
    workouts: SavedWorkout[];
}) {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);

    const [tab, setTab] = useState<"workouts" | "events">(
        "workouts",
    );
    const [openId, setOpenId] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState("");

    async function handleLogout() {
        setBusyId("logout");
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    }

    async function handleDelete(workoutId: string) {
        setErrorMessage("");
        setBusyId(workoutId);

        const { error } = await supabase
            .from("saved_workouts")
            .delete()
            .eq("id", workoutId);

        setBusyId(null);

        if (error) {
            console.error(error);
            setErrorMessage(
                "Kayıt silinemedi. Lütfen tekrar dene.",
            );
            return;
        }

        router.refresh();
    }

    return (
        <div className="mx-auto max-w-5xl">
            {/* Profil başlığı */}
            <header className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-white/10 bg-[#111111] p-7 md:p-9">
                <div className="flex items-center gap-5">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#27D66B]/30 bg-[#27D66B]/10 text-[#27D66B]">
                        <AvatarIcon
                            avatar={profile?.avatar_url ?? null}
                            className="h-10 w-10"
                        />
                    </div>

                    <div>
                        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#27D66B]">
                            Profilim
                        </span>

                        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                            {profile?.full_name || "İsimsiz Üye"}
                        </h1>

                        <p className="mt-1 text-sm text-white/45">
                            {profile?.email || email}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
                            <span className="rounded-full border border-[#27D66B]/40 bg-[#27D66B]/10 px-3 py-1 text-[#27D66B]">
                                {membershipLabel(
                                    profile?.join_date ?? null,
                                )}
                            </span>

                            {(() => {
                                const computed =
                                    profile?.birth_date
                                        ? calculateAge(
                                              profile.birth_date,
                                          )
                                        : null;
                                const displayAge =
                                    computed ?? profile?.age;

                                return displayAge ? (
                                    <span className="rounded-full border border-white/10 px-3 py-1 text-white/50">
                                        {displayAge} yaş
                                    </span>
                                ) : null;
                            })()}

                            {profile?.gender && (
                                <span className="rounded-full border border-white/10 px-3 py-1 text-white/50">
                                    {GENDER_LABELS[profile.gender] ??
                                        profile.gender}
                                </span>
                            )}
                        </div>

                        {profile?.interested_sports &&
                            profile.interested_sports.length >
                                0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {profile.interested_sports.map(
                                        (sport) => (
                                            <span
                                                key={sport}
                                                className="rounded-full border border-[#27D66B]/25 px-3 py-1 text-xs font-medium text-white/60"
                                            >
                                                {sport}
                                            </span>
                                        ),
                                    )}
                                </div>
                            )}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={busyId !== null}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-semibold text-white/70 transition hover:border-red-400/40 hover:text-red-300 disabled:opacity-50"
                >
                    {busyId === "logout" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <LogOut className="h-4 w-4" />
                    )}
                    Çıkış Yap
                </button>
            </header>

            {/* Sekmeler */}
            <div className="mt-8 flex gap-2">
                {(
                    [
                        ["workouts", "Antrenmanlarım", Dumbbell],
                        ["events", "Etkinliklerim", CalendarDays],
                    ] as const
                ).map(([key, label, Icon]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setTab(key)}
                        aria-pressed={tab === key}
                        className={`inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm font-semibold transition ${
                            tab === key
                                ? "border-[#27D66B] bg-[#27D66B]/10 text-[#27D66B]"
                                : "border-white/10 text-white/50 hover:border-white/25 hover:text-white"
                        }`}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </button>
                ))}
            </div>

            {errorMessage && (
                <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {errorMessage}
                </p>
            )}

            {tab === "workouts" &&
                (workouts.length === 0 ? (
                    <div className="mt-8 rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
                        <Dumbbell className="mx-auto h-10 w-10 text-white/20" />
                        <p className="mx-auto mt-4 max-w-md text-lg leading-8 text-white/45">
                            Henüz kayıtlı bir antrenman programın
                            yok.
                        </p>
                        <p className="mt-2 text-sm text-white/30">
                            Antrenman Merkezi&apos;nde programını
                            oluştur, kaydet; burada listelensin.
                        </p>
                        <Link
                            href="/training"
                            className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#27D66B] px-8 text-sm font-bold text-[#050505] transition hover:bg-[#45e27f]"
                        >
                            Antrenman Merkezi&apos;ne Git
                        </Link>
                    </div>
                ) : (
                    <ul className="mt-8 space-y-4">
                        {workouts.map((workout) => {
                            const isOpen = openId === workout.id;
                            const exercises = parseExercises(
                                workout.exercises,
                            );

                            return (
                                <li
                                    key={workout.id}
                                    className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]"
                                >
                                    <div className="flex items-center gap-3 p-5">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOpenId(
                                                    isOpen
                                                        ? null
                                                        : workout.id,
                                                )
                                            }
                                            aria-expanded={isOpen}
                                            className="flex flex-1 items-center justify-between gap-4 text-left"
                                        >
                                            <div>
                                                <h3 className="font-semibold">
                                                    {workout.title}
                                                </h3>

                                                <p className="mt-1 text-xs text-white/40">
                                                    {[
                                                        workout.environment
                                                            ? (ENVIRONMENT_LABELS[
                                                                  workout
                                                                      .environment
                                                              ] ??
                                                              workout.environment)
                                                            : null,
                                                        workout.muscles
                                                            ?.length
                                                            ? `${workout.muscles.length} bölge`
                                                            : null,
                                                        new Date(
                                                            workout.created_at,
                                                        ).toLocaleDateString(
                                                            "tr-TR",
                                                        ),
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" · ")}
                                                </p>
                                            </div>

                                            <ChevronDown
                                                className={`h-5 w-5 shrink-0 text-white/40 transition-transform ${
                                                    isOpen
                                                        ? "rotate-180 text-[#27D66B]"
                                                        : ""
                                                }`}
                                            />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(
                                                    workout.id,
                                                )
                                            }
                                            disabled={
                                                busyId !== null
                                            }
                                            aria-label="Programı sil"
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/30 transition hover:border-red-400/40 hover:text-red-300 disabled:opacity-50"
                                        >
                                            {busyId === workout.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>

                                    {isOpen && (
                                        <div className="border-t border-white/10 px-5 py-4">
                                            <ul className="divide-y divide-white/5">
                                                {exercises.map(
                                                    (
                                                        exercise,
                                                        index,
                                                    ) => (
                                                        <li
                                                            key={`${workout.id}-${index}`}
                                                            className="flex items-center justify-between gap-4 py-3 text-sm"
                                                        >
                                                            <span className="font-medium text-white/85">
                                                                {
                                                                    exercise.name
                                                                }
                                                            </span>
                                                            <span className="shrink-0 font-bold tabular-nums text-[#27D66B]">
                                                                {
                                                                    exercise.sets
                                                                }{" "}
                                                                ×{" "}
                                                                {
                                                                    exercise.reps
                                                                }
                                                            </span>
                                                        </li>
                                                    ),
                                                )}

                                                {exercises.length ===
                                                    0 && (
                                                    <li className="py-3 text-sm text-white/40">
                                                        Program detayı
                                                        okunamadı.
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                ))}

            {tab === "events" && (
                <div className="mt-8 rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
                    <CalendarDays className="mx-auto h-10 w-10 text-white/20" />
                    <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/45">
                        Yaklaşan veya katıldığın etkinlikler yakında
                        burada listelenecektir.
                    </p>
                </div>
            )}
        </div>
    );
}
