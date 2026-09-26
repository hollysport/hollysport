"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    CalendarDays,
    Camera,
    ChevronDown,
    Dumbbell,
    Loader2,
    LogOut,
    Pencil,
    Settings2,
    Trash2,
    X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/database.types";
import {
    deleteMyAccount,
    saveProfile,
} from "@/app/profile/actions";
import AvatarSelector, { AvatarIcon } from "./avatar-selector";

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

const GENDER_OPTIONS = [
    { value: "kadin", label: "Kadın" },
    { value: "erkek", label: "Erkek" },
    {
        value: "belirtmek-istemiyorum",
        label: "Belirtmek istemiyorum",
    },
];

const SPORT_OPTIONS = [
    "Vücut Geliştirme",
    "Fitness",
    "Yoga",
    "Pilates",
    "Koşu",
    "Yüzme",
    "Bisiklet",
    "CrossFit",
    "Boks",
    "Basketbol",
];

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

type Tab = "workouts" | "events" | "settings";

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

    const [tab, setTab] = useState<Tab>("workouts");
    const [openId, setOpenId] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState("");

    // Ayarlar formu
    const [editName, setEditName] = useState(
        profile?.full_name ?? "",
    );
    const [editGender, setEditGender] = useState(
        profile?.gender ?? "",
    );
    const [editSports, setEditSports] = useState<string[]>(
        profile?.interested_sports ?? [],
    );
    const [editAvatar, setEditAvatar] = useState<string | null>(
        profile?.avatar_url ?? null,
    );
    const [saving, setSaving] = useState(false);
    const [savedMessage, setSavedMessage] = useState("");
    const [formError, setFormError] = useState("");

    // Şifre değiştirme
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirm, setNewPasswordConfirm] =
        useState("");
    const [passwordBusy, setPasswordBusy] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");

    // Hesap silme modalı
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteBusy, setDeleteBusy] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const inputClass =
        "mt-2 w-full rounded-xl border border-white/15 bg-[#050505] px-4 py-3 text-sm font-medium text-white outline-none transition placeholder:text-white/25 focus:border-[#27D66B]";

    const labelClass =
        "text-xs font-semibold uppercase tracking-wider text-white/40";

    function toggleSport(sport: string) {
        setEditSports((current) =>
            current.includes(sport)
                ? current.filter((item) => item !== sport)
                : current.length >= 3
                  ? current
                  : [...current, sport],
        );
    }

    async function handleLogout() {
        setBusyId("logout");
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    }

    async function handleDeleteWorkout(workoutId: string) {
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

    async function handleSaveProfile(event: FormEvent) {
        event.preventDefault();
        setFormError("");
        setSavedMessage("");
        setSaving(true);

        const result = await saveProfile({
            fullName: editName.trim(),
            gender: editGender || null,
            sports: editSports,
            avatar: editAvatar,
        });

        setSaving(false);

        if (!result.success) {
            setFormError(
                result.error ?? "Bilgiler kaydedilemedi.",
            );
            return;
        }

        setSavedMessage("Bilgilerin güncellendi.");
        router.refresh();
    }

    async function handleChangePassword(event: FormEvent) {
        event.preventDefault();
        setPasswordMessage("");
        setPasswordError("");

        if (newPassword.length < 8) {
            setPasswordError(
                "Yeni şifre en az 8 karakter olmalıdır.",
            );
            return;
        }

        if (newPasswordConfirm !== newPassword) {
            setPasswordError("Şifreler eşleşmiyor.");
            return;
        }

        setPasswordBusy(true);

        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        setPasswordBusy(false);

        if (error) {
            setPasswordError(
                "Şifre güncellenemedi. Lütfen tekrar dene.",
            );
            return;
        }

        setNewPassword("");
        setNewPasswordConfirm("");
        setPasswordMessage("Şifren başarıyla güncellendi.");
    }

    async function handleDeleteAccount() {
        setDeleteError("");

        // 1) Şifre doğrulama
        const verify = await supabase.auth.signInWithPassword({
            email: profile?.email ?? email,
            password: deletePassword,
        });

        if (verify.error) {
            setDeleteError("Şifre hatalı. Lütfen tekrar dene.");
            return;
        }

        // 2) Admin (service-role) ile auth.users'tan kalıcı silme
        setDeleteBusy(true);
        const result = await deleteMyAccount();

        if (!result.success) {
            setDeleteBusy(false);
            setDeleteError(
                result.error ??
                    "Hesap silinemedi. Lütfen daha sonra tekrar dene.",
            );
            return;
        }

        // 3) Oturumu kapat ve ana sayfaya tam yönlendir
        await supabase.auth.signOut();
        window.location.href = "/";
    }

    const age = profile?.birth_date
        ? calculateAge(profile.birth_date)
        : (profile?.age ?? null);

    return (
        <div className="mx-auto max-w-5xl">
            {/* Profil bilgi kartı */}
            <header className="overflow-hidden rounded-3xl border border-white/10 bg-[#111111]">
                <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/10 p-7 md:p-9">
                    <div className="flex items-center gap-5">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#27D66B]/30 bg-[#27D66B]/10 text-[#27D66B]">
                            <AvatarIcon
                                avatar={editAvatar}
                                className="h-10 w-10"
                            />
                        </div>

                        <div>
                            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#27D66B]">
                                Profilim
                            </span>

                            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                                {editName || "İsimsiz Üye"}
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

                                {age !== null && (
                                    <span className="rounded-full border border-white/10 px-3 py-1 text-white/50">
                                        {age} yaş
                                    </span>
                                )}

                                {editGender && (
                                    <span className="rounded-full border border-white/10 px-3 py-1 text-white/50">
                                        {GENDER_LABELS[editGender] ??
                                            editGender}
                                    </span>
                                )}

                                {profile?.birth_date && (
                                    <span className="rounded-full border border-white/10 px-3 py-1 text-white/50">
                                        Doğum:{" "}
                                        {new Date(
                                            profile.birth_date,
                                        ).toLocaleDateString("tr-TR")}
                                    </span>
                                )}
                            </div>

                            {editSports.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {editSports.map((sport) => (
                                        <span
                                            key={sport}
                                            className="rounded-full border border-[#27D66B]/25 px-3 py-1 text-xs font-medium text-white/60"
                                        >
                                            {sport}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setTab("settings")}
                            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-semibold text-white/70 transition hover:border-[#27D66B]/50 hover:text-[#27D66B]"
                        >
                            <Pencil className="h-4 w-4" />
                            Düzenle
                        </button>

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
                            Çıkış
                        </button>
                    </div>
                </div>

                {/* Sekme barı */}
                <div className="flex gap-1 px-5 pt-4 sm:px-7">
                    {(
                        [
                            ["workouts", "Antrenmanlarım", Dumbbell],
                            ["events", "Etkinliklerim", CalendarDays],
                            ["settings", "Ayarlar", Settings2],
                        ] as const
                    ).map(([key, label, Icon]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setTab(key)}
                            aria-pressed={tab === key}
                            className={`relative inline-flex items-center gap-2 rounded-t-xl px-4 py-3 text-sm font-semibold transition ${
                                tab === key
                                    ? "bg-[#0a0a0a] text-[#27D66B] after:absolute after:inset-x-4 after:-bottom-px after:h-0.5 after:bg-[#27D66B]"
                                    : "text-white/50 hover:text-white"
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </button>
                    ))}
                </div>
            </header>

            {errorMessage && (
                <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {errorMessage}
                </p>
            )}

            {/* ANTRENMANLARIM */}
            {tab === "workouts" && (
                <div className="mt-8">
                    {workouts.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
                            <Dumbbell className="mx-auto h-10 w-10 text-white/20" />
                            <p className="mx-auto mt-4 max-w-md text-lg leading-8 text-white/45">
                                Henüz kayıtlı bir antrenman programın
                                yok.
                            </p>
                            <Link
                                href="/training"
                                className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#27D66B] px-8 text-sm font-bold text-[#050505] transition hover:bg-[#45e27f]"
                            >
                                Antrenman Merkezi&apos;ne Git
                            </Link>
                        </div>
                    ) : (
                        <ul className="space-y-4">
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
                                                    handleDeleteWorkout(
                                                        workout.id,
                                                    )
                                                }
                                                disabled={busyId !== null}
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
                    )}
                </div>
            )}

            {/* ETKİNLİKLERİM */}
            {tab === "events" && (
                <div className="mt-8 rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
                    <CalendarDays className="mx-auto h-10 w-10 text-white/20" />
                    <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/45">
                        Yaklaşan veya katıldığın etkinlikler yakında
                        burada listelenecektir.
                    </p>
                </div>
            )}

            {/* AYARLAR */}
            {tab === "settings" && (
                <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_400px]">
                    {/* Profil düzenleme */}
                    <form
                        onSubmit={handleSaveProfile}
                        className="rounded-3xl border border-white/10 bg-[#111111] p-7 sm:p-9"
                    >
                        <h2 className="flex items-center gap-2 text-xl font-bold">
                            <Camera className="h-5 w-5 text-[#27D66B]" />
                            Profilimi Düzenle
                        </h2>

                        <div className="mt-6 space-y-5">
                            <label className="block">
                                <span className={labelClass}>
                                    Ad Soyad
                                </span>
                                <input
                                    type="text"
                                    required
                                    maxLength={100}
                                    value={editName}
                                    onChange={(event) =>
                                        setEditName(
                                            event.target.value,
                                        )
                                    }
                                    className={inputClass}
                                />
                            </label>

                            <label className="block">
                                <span className={labelClass}>
                                    Cinsiyet
                                </span>
                                <select
                                    value={editGender}
                                    onChange={(event) =>
                                        setEditGender(
                                            event.target.value,
                                        )
                                    }
                                    className={`${inputClass} bg-[#050505]`}
                                >
                                    <option value="">Seçilmedi</option>
                                    {GENDER_OPTIONS.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div>
                                <span className={labelClass}>
                                    İlgilendiğin Sporlar{" "}
                                    <span className="text-white/30">
                                        (en fazla 3)
                                    </span>
                                </span>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {SPORT_OPTIONS.map((sport) => {
                                        const isSelected =
                                            editSports.includes(
                                                sport,
                                            );

                                        return (
                                            <button
                                                key={sport}
                                                type="button"
                                                onClick={() =>
                                                    toggleSport(sport)
                                                }
                                                aria-pressed={isSelected}
                                                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                                                    isSelected
                                                        ? "border-[#27D66B] bg-[#27D66B]/10 text-[#27D66B]"
                                                        : "border-white/10 text-white/50 hover:border-white/25 hover:text-white"
                                                }`}
                                            >
                                                {sport}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <span className={labelClass}>
                                    Avatar Seç
                                </span>
                                <AvatarSelector
                                    value={editAvatar}
                                    onChange={setEditAvatar}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#27D66B] text-sm font-bold text-[#050505] transition hover:bg-[#45e27f] disabled:opacity-50"
                            >
                                {saving && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                Kaydet
                            </button>

                            {formError && (
                                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                    {formError}
                                </p>
                            )}

                            {savedMessage && (
                                <p className="rounded-xl border border-[#27D66B]/30 bg-[#27D66B]/10 px-4 py-3 text-sm text-[#159447]">
                                    {savedMessage}
                                </p>
                            )}
                        </div>
                    </form>

                    <div className="space-y-6">
                        {/* Şifre değiştirme */}
                        <form
                            onSubmit={handleChangePassword}
                            className="rounded-3xl border border-white/10 bg-[#111111] p-7 sm:p-9"
                        >
                            <h2 className="text-xl font-bold">
                                Şifre Değiştir
                            </h2>

                            <div className="mt-6 space-y-5">
                                <label className="block">
                                    <span className={labelClass}>
                                        Yeni Şifre
                                    </span>
                                    <input
                                        type="password"
                                        required
                                        autoComplete="new-password"
                                        value={newPassword}
                                        onChange={(event) =>
                                            setNewPassword(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="En az 8 karakter"
                                        className={inputClass}
                                    />
                                </label>

                                <label className="block">
                                    <span className={labelClass}>
                                        Yeni Şifre (Tekrar)
                                    </span>
                                    <input
                                        type="password"
                                        required
                                        autoComplete="new-password"
                                        value={newPasswordConfirm}
                                        onChange={(event) =>
                                            setNewPasswordConfirm(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Şifreni tekrar gir"
                                        className={inputClass}
                                    />
                                </label>

                                <button
                                    type="submit"
                                    disabled={passwordBusy}
                                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#27D66B] text-sm font-bold text-[#050505] transition hover:bg-[#45e27f] disabled:opacity-50"
                                >
                                    {passwordBusy && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    Şifreyi Güncelle
                                </button>

                                {passwordMessage && (
                                    <p className="rounded-xl border border-[#27D66B]/30 bg-[#27D66B]/10 px-4 py-3 text-sm text-[#27D66B]">
                                        {passwordMessage}
                                    </p>
                                )}

                                {passwordError && (
                                    <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                        {passwordError}
                                    </p>
                                )}
                            </div>
                        </form>

                        {/* Tehlike bölgesi */}
                        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-7 sm:p-9">
                            <h2 className="text-xl font-bold text-red-400">
                                Tehlike Bölgesi
                            </h2>

                            <p className="mt-4 text-sm leading-6 text-white/40">
                                Hesabını ve tüm verilerini kalıcı
                                olarak sil. Bu işlem geri alınamaz.
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    setDeletePassword("");
                                    setDeleteError("");
                                    setDeleteOpen(true);
                                }}
                                className="mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-red-500/40 px-5 text-sm font-semibold text-red-300 transition hover:border-red-500 hover:text-red-200"
                            >
                                <Trash2 className="h-4 w-4" />
                                Hesabımı Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hesap silme onay modalı (şifre doğrulamalı) */}
            {deleteOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Hesap silme onayı"
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                    onClick={() => {
                        if (!deleteBusy) setDeleteOpen(false);
                    }}
                >
                    <div
                        className="w-full max-w-md rounded-3xl border border-red-500/25 bg-[#0a0a0a] p-7 sm:p-9"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
                                    Tehlike Bölgesi
                                </span>
                                <h2 className="mt-2 text-2xl font-bold text-white">
                                    Hesabını Sil
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-white/45">
                                    Bu işlem geri alınamaz. Güvenlik
                                    için mevcut şifreni gir.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setDeleteOpen(false)}
                                disabled={deleteBusy}
                                aria-label="Kapat"
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/50 transition hover:border-white/40 hover:text-white disabled:opacity-50"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mt-6 space-y-5">
                            <label className="block">
                                <span className={labelClass}>
                                    Mevcut Şifren
                                </span>
                                <input
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={deletePassword}
                                    onChange={(event) =>
                                        setDeletePassword(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="••••••••"
                                    className={inputClass}
                                />
                            </label>

                            <button
                                type="button"
                                onClick={handleDeleteAccount}
                                disabled={
                                    deleteBusy ||
                                    deletePassword.length === 0
                                }
                                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-red-500 text-sm font-bold text-white transition hover:bg-red-400 disabled:opacity-50"
                            >
                                {deleteBusy && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                Kalıcı Olarak Sil
                            </button>

                            {deleteError && (
                                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                    {deleteError}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
