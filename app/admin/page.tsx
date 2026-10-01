import Link from "next/link";
import {
    ArrowUpRight,
    Bell,
    CalendarDays,
    ClipboardList,
    Dumbbell,
    ExternalLink,
    HandHeart,
    HeartHandshake,
    Lightbulb,
    ListChecks,
    LogOut,
    MessageCircleQuestion,
    MessageSquareQuote,
    UserRoundPlus,
    UsersRound,
} from "lucide-react";

import SupportAdminLinks from "@/components/admin/SupportAdminLinks";
import { requireAdmin } from "@/lib/auth/require-admin";
import { resolveDisplayName } from "@/lib/auth/display";
import { createAdminClient } from "@/lib/supabase/admin";
import { GOALS } from "@/lib/data/exercises";
import { getCurrentTimestamp } from "@/lib/time";

import { logout } from "./actions";

/* ---------------------------------------------------------------------------
 * Bildirim Merkezi (Son Aktiviteler)
 *
 * Farklı tablolardaki son kayıtlar tek bir zaman akışında toplanır.
 * Okuma service-role ile yapılır (requireAdmin oturumu doğrular); RLS'te
 * SELECT politikası olmayan `custom_program_requests` böylece görünür kalır.
 * ------------------------------------------------------------------------- */

type ActivityKind =
    | "program-request"
    | "support-request"
    | "supporter"
    | "new-user";

type ActivityItem = {
    key: string;
    kind: ActivityKind;
    title: string;
    person: string;
    detail: string;
    href: string;
    createdAt: string;
    pending: boolean;
};

type AdminClient = ReturnType<typeof createAdminClient>;

const ACTIVITY_META: Record<
    ActivityKind,
    { icon: typeof Bell; iconClass: string; href: string }
> = {
    "program-request": {
        icon: ListChecks,
        iconClass: "bg-sky-400/10 text-sky-300",
        href: "/admin/custom-training-requests",
    },
    "support-request": {
        icon: HandHeart,
        iconClass: "bg-[#27D66B]/10 text-[#27D66B]",
        href: "/admin/support-requests",
    },
    supporter: {
        icon: HeartHandshake,
        iconClass: "bg-[#FFD54A]/10 text-[#FFD54A]",
        href: "/admin/supporters",
    },
    "new-user": {
        icon: UserRoundPlus,
        iconClass: "bg-violet-400/10 text-violet-300",
        href: "/admin/users",
    },
};

const SUPPORT_STATUS_LABELS: Record<string, string> = {
    pending: "Bekliyor",
    contacted: "İletişime geçildi",
    approved: "Onaylandı",
    rejected: "Reddedildi",
};

const SUPPORTER_CATEGORY_LABELS: Record<string, string> = {
    individual: "Bireysel destekçi",
    volunteer: "Gönüllü destekçi",
    angel_investor: "Stratejik yatırımcı",
};

const ACTIVITY_FEED_LIMIT = 10;

const RELATIVE_TIME_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["second", 1000],
    ["minute", 60 * 1000],
    ["hour", 60 * 60 * 1000],
    ["day", 24 * 60 * 60 * 1000],
    ["week", 7 * 24 * 60 * 60 * 1000],
    ["month", 30 * 24 * 60 * 60 * 1000],
    ["year", 365 * 24 * 60 * 60 * 1000],
];

/** "2026-09-29T10:00:00Z" -> "2 saat önce" (tr-TR). Geçersiz tarih "" döner. */
function formatRelativeTime(date: string, now: number): string {
    const timestamp = new Date(date).getTime();

    if (Number.isNaN(timestamp)) {
        return "";
    }

    const elapsed = timestamp - now;
    let unit: Intl.RelativeTimeFormatUnit = "second";
    let divisor = 1000;

    for (const [nextUnit, nextDivisor] of RELATIVE_TIME_UNITS) {
        if (Math.abs(elapsed) >= nextDivisor) {
            unit = nextUnit;
            divisor = nextDivisor;
        }
    }

    return new Intl.RelativeTimeFormat("tr", { numeric: "auto" }).format(
        Math.round(elapsed / divisor),
        unit,
    );
}

type ProgramRequestFeedRow = {
    id: string;
    full_name: string;
    goal?: string;
    status?: string;
    created_at: string;
};

/*
 * `custom_program_requests` son talepleri.
 * `status` kolonu henüz eklenmemişse (PGRST204) sorgu kolonsuz
 * tekrarlanır — /admin/custom-training-requests ile aynı desen.
 */
async function fetchProgramRequests(
    admin: AdminClient,
    pendingOnly: boolean,
): Promise<ProgramRequestFeedRow[]> {
    const limit = pendingOnly ? 5 : 6;

    const run = async (select: string, filterPending: boolean) => {
        let query = admin
            .from("custom_program_requests")
            .select(select)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (filterPending) {
            query = query.eq("status", "pending");
        }

        return await query;
    };

    const { data, error } = await run(
        "id, full_name, goal, status, created_at",
        pendingOnly,
    );

    if (error?.code === "PGRST204") {
        const fallback = await run(
            "id, full_name, goal, created_at",
            false,
        );

        if (fallback.error) {
            console.error(
                "Bildirim Merkezi: özel antrenman talepleri okunamadı:",
                {
                    message: fallback.error.message,
                    code: fallback.error.code,
                },
            );

            return [];
        }

        return (fallback.data ??
            []) as unknown as ProgramRequestFeedRow[];
    }

    if (error) {
        console.error(
            "Bildirim Merkezi: özel antrenman talepleri okunamadı:",
            { message: error.message, code: error.code },
        );

        return [];
    }

    return (data ?? []) as unknown as ProgramRequestFeedRow[];
}

type ActivityFeedResult = {
    items: ActivityItem[];
    pendingProgramCount: number;
    loadError: string | null;
};

async function loadActivityFeed(): Promise<ActivityFeedResult> {
    let admin: AdminClient;

    try {
        admin = createAdminClient();
    } catch (clientError) {
        const message =
            clientError instanceof Error
                ? clientError.message
                : String(clientError);

        console.error(
            "Bildirim Merkezi: admin istemcisi oluşturulamadı:",
            { message },
        );

        return { items: [], pendingProgramCount: 0, loadError: message };
    }

    const [
        pendingProgramRows,
        recentProgramRows,
        supportRequests,
        supporters,
        newUsers,
        pendingProgramCountResult,
    ] = await Promise.all([
        fetchProgramRequests(admin, true),
        fetchProgramRequests(admin, false),

        admin
            .from("support_requests")
            .select("id, full_name, status, created_at")
            .order("created_at", { ascending: false })
            .limit(4),

        admin
            .from("individual_supporters")
            .select(
                "id, display_name, supporter_category, created_at",
            )
            .order("created_at", { ascending: false })
            .limit(3),

        admin
            .from("profiles")
            .select("id, full_name, email, join_date")
            .order("join_date", {
                ascending: false,
                nullsFirst: false,
            })
            .limit(5),

        admin
            .from("custom_program_requests")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending"),
    ]);

    if (supportRequests.error) {
        console.error(
            "Bildirim Merkezi: destek başvuruları okunamadı:",
            {
                message: supportRequests.error.message,
                code: supportRequests.error.code,
            },
        );
    }

    if (supporters.error) {
        console.error(
            "Bildirim Merkezi: destekçiler okunamadı:",
            {
                message: supporters.error.message,
                code: supporters.error.code,
            },
        );
    }

    if (newUsers.error) {
        console.error(
            "Bildirim Merkezi: yeni kullanıcılar okunamadı:",
            { message: newUsers.error.message, code: newUsers.error.code },
        );
    }

    const items: ActivityItem[] = [];
    const seenProgramIds = new Set<string>();

    for (const row of [
        ...pendingProgramRows,
        ...recentProgramRows,
    ]) {
        if (seenProgramIds.has(row.id)) {
            continue;
        }

        seenProgramIds.add(row.id);

        items.push({
            key: `program-${row.id}`,
            kind: "program-request",
            title: "Yeni Özel Antrenman Talebi",
            person: row.full_name,
            detail: row.goal
                ? (GOALS.find((goal) => goal.key === row.goal)
                      ?.label ?? row.goal)
                : "Hedef belirtilmedi",
            href: ACTIVITY_META["program-request"].href,
            createdAt: row.created_at,
            pending: (row.status ?? "pending") === "pending",
        });
    }

    for (const row of supportRequests.data ?? []) {
        items.push({
            key: `support-${row.id}`,
            kind: "support-request",
            title: "Yeni Destek Başvurusu",
            person: row.full_name,
            detail:
                SUPPORT_STATUS_LABELS[row.status] ?? row.status,
            href: ACTIVITY_META["support-request"].href,
            createdAt: row.created_at,
            pending: row.status === "pending",
        });
    }

    for (const row of supporters.data ?? []) {
        items.push({
            key: `supporter-${row.id}`,
            kind: "supporter",
            title: "Yeni Destekçi / Yatırımcı",
            person: row.display_name,
            detail:
                SUPPORTER_CATEGORY_LABELS[
                    row.supporter_category
                ] ?? row.supporter_category,
            href: ACTIVITY_META.supporter.href,
            createdAt: row.created_at,
            pending: false,
        });
    }

    for (const row of newUsers.data ?? []) {
        items.push({
            key: `user-${row.id}`,
            kind: "new-user",
            title: "Yeni Kullanıcı Kaydı",
            person: resolveDisplayName({
                fullName: row.full_name,
                email: row.email,
            }),
            detail: row.email ?? "E-posta belirtilmedi",
            href: ACTIVITY_META["new-user"].href,
            createdAt: row.join_date ?? "",
            pending: false,
        });
    }

    /* En yeni en üstte; tarihi okunamayanlar en sona düşer. */
    items.sort((a, b) => {
        const aTime = Date.parse(a.createdAt) || 0;
        const bTime = Date.parse(b.createdAt) || 0;

        return bTime - aTime;
    });

    const pendingProgramCount = pendingProgramCountResult.error
        ? pendingProgramRows.length
        : (pendingProgramCountResult.count ?? 0);

    return {
        items: items.slice(0, ACTIVITY_FEED_LIMIT),
        pendingProgramCount,
        loadError: null,
    };
}

export default async function AdminPage() {
    const { supabase, profile } = await requireAdmin();

    const now = new Date().toISOString();

    /* Bildirim akışı sayaçlarla paralel çalışır. */
    const activityFeedPromise = loadActivityFeed();

    const [
        { count: upcomingCount },
        { count: pastCount },
        { count: registrationCount },
        { count: pendingRegistrationCount },
        { count: pendingSupportCount },
        { count: activeInvestorCount },
        { count: activeSponsorCount },
        { count: pendingQuestionCount },
        { count: newDreamCount },
        { count: pendingReviewCount },
        { count: approvedReviewCount },
    ] = await Promise.all([
        supabase
            .from("events")
            .select("id", { count: "exact", head: true })
            .eq("status", "published")
            .gte("ends_at", now),

        supabase
            .from("events")
            .select("id", { count: "exact", head: true })
            .eq("status", "published")
            .lt("ends_at", now),

        supabase
            .from("event_registrations")
            .select("id", { count: "exact", head: true }),

        supabase
            .from("event_registrations")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending"),

        supabase
            .from("support_requests")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending"),

        supabase
            .from("individual_supporters")
            .select("id", { count: "exact", head: true })
            .eq("is_active", true)
            .in("supporter_category", ["angel_investor", "individual"]),

        supabase
            .from("sponsors")
            .select("id", { count: "exact", head: true })
            .eq("is_active", true),

        supabase
            .from("contact_questions")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending"),

        supabase
            .from("dream_submissions")
            .select("id", { count: "exact", head: true })
            .eq("status", "new"),

        supabase
            .from("community_reviews")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending"),

        supabase
            .from("community_reviews")
            .select("id", { count: "exact", head: true })
            .eq("status", "approved"),
    ]);

    const safeUpcomingCount = upcomingCount ?? 0;
    const safePastCount = pastCount ?? 0;
    const safeRegistrationCount = registrationCount ?? 0;
    const safePendingRegistrationCount =
        pendingRegistrationCount ?? 0;
    const safePendingQuestionCount =
        pendingQuestionCount ?? 0;
    const safeNewDreamCount = newDreamCount ?? 0;
    const safePendingReviewCount =
        pendingReviewCount ?? 0;
    const safeApprovedReviewCount =
        approvedReviewCount ?? 0;
    const safePendingSupportCount =
        pendingSupportCount ?? 0;

    const activityFeed = await activityFeedPromise;
    const activityTimestamp = getCurrentTimestamp();

    return (
        <main className="min-h-screen bg-[#050505] px-5 py-8 text-white sm:px-8 sm:py-10 lg:px-12">
            <div className="mx-auto max-w-7xl">
                <header className="flex flex-col justify-between gap-7 border-b border-white/10 pb-8 sm:flex-row sm:items-center">
                    <div>
                        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#27D66B]">
                            Holly Sport
                        </span>

                        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                            Yönetim paneli
                        </h1>

                        <p className="mt-3 text-sm text-white/40">
                            Hoş geldin,{" "}
                            {resolveDisplayName({
                                fullName: profile.full_name,
                                email: profile.email,
                            })}
                            .
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/"
                            target="_blank"
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-6 text-sm font-semibold uppercase tracking-wider transition hover:border-white/40 hover:bg-white/5"
                        >
                            <ExternalLink className="h-4 w-4" />
                            Siteyi aç
                        </Link>

                        <form action={logout}>
                            <button
                                type="submit"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-6 text-sm font-semibold uppercase tracking-wider transition hover:border-[#27D66B] hover:text-[#27D66B]"
                            >
                                <LogOut className="h-4 w-4" />
                                Çıkış yap
                            </button>
                        </form>
                    </div>
                </header>

                <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <article className="rounded-3xl border border-white/10 bg-[#111111] p-6">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
                            Yaklaşan etkinlik
                        </span>

                        <strong className="mt-5 block text-5xl font-bold text-[#27D66B]">
                            {safeUpcomingCount}
                        </strong>
                    </article>

                    <article className="rounded-3xl border border-white/10 bg-[#111111] p-6">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
                            Geçmiş etkinlik
                        </span>

                        <strong className="mt-5 block text-5xl font-bold">
                            {safePastCount}
                        </strong>
                    </article>

                    <article className="rounded-3xl border border-white/10 bg-[#111111] p-6">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
                            Toplam başvuru
                        </span>

                        <strong className="mt-5 block text-5xl font-bold">
                            {safeRegistrationCount}
                        </strong>
                    </article>

                    <article className="rounded-3xl border border-blue-500/20 bg-blue-500/[0.07] p-6">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300/70">
                            Bekleyen başvuru
                        </span>

                        <strong className="mt-5 block text-5xl font-bold text-blue-300">
                            {safePendingRegistrationCount}
                        </strong>
                    </article>
                </section>

                {/* Bildirim Merkezi — Son Aktiviteler */}
                <section className="mt-12 rounded-3xl border border-white/10 bg-[#111111] p-6 sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div className="flex items-start gap-4">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#27D66B]/10 text-[#27D66B]">
                                <Bell className="h-6 w-6" />
                            </span>

                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#27D66B]">
                                    Bildirim Merkezi
                                </p>

                                <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                                    Son Aktiviteler
                                </h2>

                                <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
                                    Sisteme düşen son talepler, başvurular
                                    ve kayıtlar tek zaman akışında.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {activityFeed.pendingProgramCount > 0 && (
                                <span className="rounded-full border border-sky-400/25 bg-sky-400/10 px-4 py-2 text-xs font-bold text-sky-300">
                                    {activityFeed.pendingProgramCount}{" "}
                                    bekleyen özel antrenman talebi
                                </span>
                            )}

                            {safePendingSupportCount > 0 && (
                                <span className="rounded-full border border-[#27D66B]/25 bg-[#27D66B]/10 px-4 py-2 text-xs font-bold text-[#27D66B]">
                                    {safePendingSupportCount} bekleyen
                                    destek başvurusu
                                </span>
                            )}
                        </div>
                    </div>

                    {activityFeed.loadError && (
                        <div
                            role="alert"
                            className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm leading-6 text-red-300"
                        >
                            Aktivite akışı yüklenemedi:{" "}
                            {activityFeed.loadError}
                        </div>
                    )}

                    {!activityFeed.loadError &&
                        activityFeed.items.length === 0 && (
                            <div className="mt-6 rounded-2xl border border-dashed border-white/15 px-6 py-12 text-center text-sm text-white/45">
                                Henüz yeni bir aktivite yok.
                            </div>
                        )}

                    {activityFeed.items.length > 0 && (
                        <ol className="mt-6 space-y-3">
                            {activityFeed.items.map((item) => {
                                const meta = ACTIVITY_META[item.kind];
                                const Icon = meta.icon;

                                return (
                                    <li key={item.key}>
                                        <Link
                                            href={item.href}
                                            className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-[#050505]/70 p-4 transition hover:border-[#27D66B]/40 hover:bg-white/[0.03] sm:gap-4 sm:p-5"
                                        >
                                            <span
                                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.iconClass}`}
                                            >
                                                <Icon className="h-5 w-5" />
                                            </span>

                                            <span className="min-w-0 flex-1">
                                                <span className="flex flex-wrap items-center gap-2">
                                                    <span className="text-sm font-semibold text-white sm:text-base">
                                                        {item.title}
                                                    </span>

                                                    {item.pending && (
                                                        <span className="rounded-full border border-yellow-500/25 bg-yellow-500/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-yellow-300">
                                                            Bekliyor
                                                        </span>
                                                    )}
                                                </span>

                                                <span className="mt-1 block truncate text-sm text-white/55">
                                                    <span className="font-semibold text-white/85">
                                                        {item.person}
                                                    </span>
                                                    {item.detail
                                                        ? ` — ${item.detail}`
                                                        : ""}
                                                </span>

                                                <span className="mt-1.5 block text-xs text-white/35">
                                                    {formatRelativeTime(
                                                        item.createdAt,
                                                        activityTimestamp,
                                                    )}
                                                </span>
                                            </span>

                                            <span className="mt-1 hidden shrink-0 items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/50 transition group-hover:border-[#27D66B]/50 group-hover:text-[#27D66B] sm:inline-flex">
                                                Detay
                                                <ArrowUpRight className="h-3.5 w-3.5" />
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ol>
                    )}
                </section>

                <section className="mt-12">
                    <div className="mb-6">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#27D66B]">
                            Yönetim Araçları
                        </p>

                        <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                            İçerik ve başvuruları yönet.
                        </h2>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-2">
                        <Link
                            href="/admin/events"
                            className="group flex min-h-80 flex-col justify-between rounded-[2rem] bg-[#27D66B] p-8 text-black transition duration-300 hover:-translate-y-1 md:p-10"
                        >
                            <div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/10">
                                    <CalendarDays className="h-7 w-7" />
                                </div>

                                <span className="mt-8 block text-sm font-semibold uppercase tracking-[0.3em]">
                                    Etkinlik Yönetimi
                                </span>

                                <h3 className="mt-5 max-w-lg text-4xl font-bold tracking-tight md:text-5xl">
                                    Etkinlikleri görüntüle ve yönet.
                                </h3>

                                <p className="mt-5 text-sm font-medium text-black/55">
                                    {safeUpcomingCount} yaklaşan,{" "}
                                    {safePastCount} geçmiş etkinlik
                                </p>
                            </div>

                            <span className="mt-10 flex h-16 w-16 items-center justify-center rounded-full bg-black text-2xl text-white transition-transform group-hover:translate-x-1">
                                →
                            </span>
                        </Link>

                        <Link
                            href="/admin/registrations"
                            className="group flex min-h-80 flex-col justify-between rounded-[2rem] border border-white/10 bg-[#111111] p-8 transition duration-300 hover:-translate-y-1 hover:border-[#27D66B]/50 md:p-10"
                        >
                            <div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#27D66B]/10 text-[#27D66B]">
                                    <ClipboardList className="h-7 w-7" />
                                </div>

                                <span className="mt-8 block text-sm font-semibold uppercase tracking-[0.3em] text-[#27D66B]">
                                    Başvuru Yönetimi
                                </span>

                                <h3 className="mt-5 max-w-lg text-4xl font-bold tracking-tight md:text-5xl">
                                    Katılımcı başvurularını değerlendir.
                                </h3>

                                <p className="mt-5 text-sm text-white/40">
                                    {safePendingRegistrationCount} başvuru
                                    değerlendirme bekliyor.
                                </p>
                            </div>

                            <span className="mt-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#27D66B] text-2xl text-black transition-transform group-hover:translate-x-1">
                                →
                            </span>
                        </Link>
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                        <Link
                            href="/admin/questions"
                            className="group flex min-h-56 flex-col justify-between rounded-[2rem] border border-white/10 bg-[#111111] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#27D66B]/40 sm:p-8"
                        >
                            <div className="flex items-start justify-between gap-5">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#27D66B]/10 text-[#27D66B]">
                                    <MessageCircleQuestion className="h-7 w-7" />
                                </div>

                                <ArrowUpRight className="h-6 w-6 text-white/25 transition group-hover:text-[#27D66B]" />
                            </div>

                            <div className="mt-8">
                                <h3 className="text-2xl font-bold">
                                    Gelen Sorular
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-white/40">
                                    Soru formundan gönderilen mesajları
                                    görüntüle ve yönet.
                                </p>

                                <div className="mt-5 inline-flex rounded-full bg-[#27D66B]/10 px-4 py-2 text-sm font-bold text-[#27D66B]">
                                    {safePendingQuestionCount} bekleyen soru
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/admin/dreams"
                            className="group flex min-h-56 flex-col justify-between rounded-[2rem] border border-white/10 bg-[#111111] p-7 transition duration-300 hover:-translate-y-1 hover:border-violet-400/45 sm:p-8"
                        >
                            <div className="flex items-start justify-between gap-5">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-400/10 text-violet-300">
                                    <Lightbulb className="h-7 w-7" />
                                </div>

                                <ArrowUpRight className="h-6 w-6 text-white/25 transition group-hover:text-violet-300" />
                            </div>

                            <div className="mt-8">
                                <h3 className="text-2xl font-bold">
                                    Hayal Başvuruları
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-white/40">
                                    Bir Hayalim Var formundan gönderilen
                                    bireysel hedefleri incele.
                                </p>

                                <div className="mt-5 inline-flex rounded-full bg-violet-400/10 px-4 py-2 text-sm font-bold text-violet-300">
                                    {safeNewDreamCount} yeni hayal
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/admin/reviews"
                            className="group flex min-h-56 flex-col justify-between rounded-[2rem] border border-white/10 bg-[#111111] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#FFD54A]/45 sm:p-8"
                        >
                            <div className="flex items-start justify-between gap-5">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFD54A]/10 text-[#FFD54A]">
                                    <MessageSquareQuote className="h-7 w-7" />
                                </div>

                                <ArrowUpRight className="h-6 w-6 text-white/25 transition group-hover:text-[#FFD54A]" />
                            </div>

                            <div className="mt-8">
                                <h3 className="text-2xl font-bold">
                                    Topluluk Görüşleri
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-white/40">
                                    Üyelerin gönderdiği yorumları incele,
                                    onayla veya reddet.
                                </p>

                                <div className="mt-5 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-300">
                                        {safePendingReviewCount} onay bekliyor
                                    </span>

                                    <span className="rounded-full bg-[#27D66B]/10 px-4 py-2 text-sm font-bold text-[#27D66B]">
                                        {safeApprovedReviewCount} yayında
                                    </span>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/admin/exercises"
                            className="group flex min-h-56 flex-col justify-between rounded-[2rem] border border-white/10 bg-[#111111] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#27D66B]/40 sm:p-8"
                        >
                            <div className="flex items-start justify-between gap-5">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#27D66B]/10 text-[#27D66B]">
                                    <Dumbbell className="h-7 w-7" />
                                </div>

                                <ArrowUpRight className="h-6 w-6 text-white/25 transition group-hover:text-[#27D66B]" />
                            </div>

                            <div className="mt-8">
                                <h3 className="text-2xl font-bold">
                                    Egzersiz Yönetimi
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-white/40">
                                    Antrenman Merkezi&apos;ndeki
                                    bölgesel egzersizleri ekle,
                                    düzenle veya sil.
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/admin/custom-training-requests"
                            className="group flex min-h-56 flex-col justify-between rounded-[2rem] border border-white/10 bg-[#111111] p-7 transition duration-300 hover:-translate-y-1 hover:border-sky-400/45 sm:p-8"
                        >
                            <div className="flex items-start justify-between gap-5">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300">
                                    <ListChecks className="h-7 w-7" />
                                </div>

                                <ArrowUpRight className="h-6 w-6 text-white/25 transition group-hover:text-sky-300" />
                            </div>

                            <div className="mt-8">
                                <h3 className="text-2xl font-bold">
                                    Özel Antrenman Talepleri
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-white/40">
                                    Kişiye özel program formundan gelen
                                    talepleri görüntüle ve durumlarını
                                    güncelle.
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/admin/users"
                            className="group flex min-h-56 flex-col justify-between rounded-[2rem] border border-white/10 bg-[#111111] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#27D66B]/40 sm:p-8"
                        >
                            <div className="flex items-start justify-between gap-5">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#27D66B]/10 text-[#27D66B]">
                                    <UsersRound className="h-7 w-7" />
                                </div>

                                <ArrowUpRight className="h-6 w-6 text-white/25 transition group-hover:text-[#27D66B]" />
                            </div>

                            <div className="mt-8">
                                <h3 className="text-2xl font-bold">
                                    Üyeler
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-white/40">
                                    Sisteme yeni kayıt olan kullanıcıları
                                    listele ve üyelik bilgilerini incele.
                                </p>
                            </div>
                        </Link>
                    </div>
                </section>

                <div className="mt-12">
                    <SupportAdminLinks
                        pendingSupportCount={pendingSupportCount ?? 0}
                        activeInvestorCount={activeInvestorCount ?? 0}
                        activeSponsorCount={activeSponsorCount ?? 0}
                    />
                </div>
            </div>
        </main>
    );
}