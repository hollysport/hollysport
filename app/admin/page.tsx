import Link from "next/link";
import {
    ArrowUpRight,
    Bell,
    CalendarDays,
    ClipboardList,
    Dumbbell,
    Lightbulb,
    ListChecks,
    MessageCircleQuestion,
    MessageSquareQuote,
    UsersRound,
} from "lucide-react";

import ActivityFeedList from "@/components/admin/activity-feed-list";
import SupportAdminLinks from "@/components/admin/SupportAdminLinks";
import { requireAdmin } from "@/lib/auth/require-admin";
import { resolveDisplayName } from "@/lib/auth/display";
import {
    ACTIVITY_PAGE_SIZE,
    fetchActivityFeed,
} from "@/lib/admin/activity-feed";

export default async function AdminPage() {
    const { supabase, profile } = await requireAdmin();

    const now = new Date().toISOString();

    /* Bildirim akışı sayaçlarla paralel çalışır. */
    const activityFeedPromise = fetchActivityFeed({
        offset: 0,
        limit: ACTIVITY_PAGE_SIZE,
    });

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

    return (
        <main className="min-h-screen bg-white px-5 py-8 text-[#171917] sm:px-8 sm:py-10 lg:px-12">
            <div className="mx-auto max-w-7xl">
                <header className="border-b border-[#E5E8E3] pb-8">
                    <div>
                        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0E7C3D]">
                            Holly Sport
                        </span>

                        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                            Yönetim paneli
                        </h1>

                        <p className="mt-3 text-sm text-[#626862]">
                            Hoş geldin,{" "}
                            {resolveDisplayName({
                                fullName: profile.full_name,
                                email: profile.email,
                            })}
                            .
                        </p>
                    </div>
                </header>

                <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <article className="rounded-2xl border border-[#E5E8E3] bg-[#F7F8F6] p-6">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#626862]">
                            Yaklaşan etkinlik
                        </span>

                        <strong className="mt-5 block text-5xl font-bold text-[#0E7C3D]">
                            {safeUpcomingCount}
                        </strong>
                    </article>

                    <article className="rounded-2xl border border-[#E5E8E3] bg-[#F7F8F6] p-6">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#626862]">
                            Geçmiş etkinlik
                        </span>

                        <strong className="mt-5 block text-5xl font-bold">
                            {safePastCount}
                        </strong>
                    </article>

                    <article className="rounded-2xl border border-[#E5E8E3] bg-[#F7F8F6] p-6">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#626862]">
                            Toplam başvuru
                        </span>

                        <strong className="mt-5 block text-5xl font-bold">
                            {safeRegistrationCount}
                        </strong>
                    </article>

                    <article className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                            Bekleyen başvuru
                        </span>

                        <strong className="mt-5 block text-5xl font-bold text-blue-700">
                            {safePendingRegistrationCount}
                        </strong>
                    </article>
                </section>

                {/* Bildirim Merkezi — Son Aktiviteler (sidebar'daki "Bildirimler" çapası) */}
                <section
                    id="bildirim-merkezi"
                    className="mt-12 scroll-mt-24 rounded-3xl border border-[#E5E8E3] bg-[#F7F8F6] p-6 sm:p-8"
                >
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div className="flex items-start gap-4">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F9EE] text-[#0E7C3D]">
                                <Bell className="h-6 w-6" />
                            </span>

                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0E7C3D]">
                                    Bildirim Merkezi
                                </p>

                                <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                                    Son Aktiviteler
                                </h2>

                                <p className="mt-2 max-w-xl text-sm leading-6 text-[#626862]">
                                    Sisteme düşen son talepler, başvurular
                                    ve kayıtlar tek zaman akışında.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {activityFeed.pendingProgramCount > 0 && (
                                <span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-bold text-sky-700">
                                    {activityFeed.pendingProgramCount}{" "}
                                    bekleyen özel antrenman talebi
                                </span>
                            )}

                            {safePendingSupportCount > 0 && (
                                <span className="rounded-full border border-[#bfe8cf] bg-[#E8F9EE] px-4 py-2 text-xs font-bold text-[#0E7C3D]">
                                    {safePendingSupportCount} bekleyen
                                    destek başvurusu
                                </span>
                            )}
                        </div>
                    </div>

                    {activityFeed.loadError ? (
                        <div
                            role="alert"
                            className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
                        >
                            Aktivite akışı yüklenemedi:{" "}
                            {activityFeed.loadError}
                        </div>
                    ) : (
                        <ActivityFeedList
                            initialItems={activityFeed.items}
                            initialHasMore={activityFeed.hasMore}
                        />
                    )}
                </section>

                <section className="mt-12">
                    <div className="mb-6">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0E7C3D]">
                            Yönetim Araçları
                        </p>

                        <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                            İçerik ve başvuruları yönet.
                        </h2>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-2">
                        <Link
                            href="/admin/events"
                            className="group flex min-h-80 flex-col justify-between rounded-[2rem] bg-[#27D66B] p-8 transition duration-300 hover:-translate-y-1 hover:bg-[#1fc461] md:p-10"
                        >
                            <div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/10">
                                    <CalendarDays className="h-7 w-7" />
                                </div>

                                <span className="mt-8 block text-sm font-semibold uppercase tracking-[0.3em] text-[#171917]">
                                    Etkinlik Yönetimi
                                </span>

                                <h3 className="mt-5 max-w-lg text-4xl font-bold tracking-tight text-[#171917] md:text-5xl">
                                    Etkinlikleri görüntüle ve yönet.
                                </h3>

                                <p className="mt-5 text-sm font-medium text-[#171917]/70">
                                    {safeUpcomingCount} yaklaşan,{" "}
                                    {safePastCount} geçmiş etkinlik
                                </p>
                            </div>

                            <span className="mt-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#171917] text-2xl text-white transition-transform group-hover:translate-x-1">
                                →
                            </span>
                        </Link>

                        <Link
                            href="/admin/registrations"
                            className="group flex min-h-80 flex-col justify-between rounded-[2rem] border border-[#E5E8E3] bg-white p-8 transition duration-300 hover:-translate-y-1 hover:border-[#bfe8cf] md:p-10"
                        >
                            <div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F9EE] text-[#0E7C3D]">
                                    <ClipboardList className="h-7 w-7" />
                                </div>

                                <span className="mt-8 block text-sm font-semibold uppercase tracking-[0.3em] text-[#0E7C3D]">
                                    Başvuru Yönetimi
                                </span>

                                <h3 className="mt-5 max-w-lg text-4xl font-bold tracking-tight text-[#171917] md:text-5xl">
                                    Katılımcı başvurularını değerlendir.
                                </h3>

                                <p className="mt-5 text-sm text-[#626862]">
                                    {safePendingRegistrationCount} başvuru
                                    değerlendirme bekliyor.
                                </p>
                            </div>

                            <span className="mt-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#27D66B] text-2xl text-[#171917] transition-transform group-hover:translate-x-1">
                                →
                            </span>
                        </Link>
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                        <Link
                            href="/admin/questions"
                            className="group flex min-h-56 flex-col justify-between rounded-[2rem] border border-[#E5E8E3] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#bfe8cf] sm:p-8"
                        >
                            <div className="flex items-start justify-between gap-5">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F9EE] text-[#0E7C3D]">
                                    <MessageCircleQuestion className="h-7 w-7" />
                                </div>

                                <ArrowUpRight className="h-6 w-6 text-[#626862] transition group-hover:text-[#0E7C3D]" />
                            </div>

                            <div className="mt-8">
                                <h3 className="text-2xl font-bold text-[#171917]">
                                    Gelen Sorular
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-[#626862]">
                                    Soru formundan gönderilen mesajları
                                    görüntüle ve yönet.
                                </p>

                                <div className="mt-5 inline-flex rounded-full bg-[#E8F9EE] px-4 py-2 text-sm font-bold text-[#0E7C3D]">
                                    {safePendingQuestionCount} bekleyen soru
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/admin/dreams"
                            className="group flex min-h-56 flex-col justify-between rounded-[2rem] border border-[#E5E8E3] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-violet-200 sm:p-8"
                        >
                            <div className="flex items-start justify-between gap-5">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                                    <Lightbulb className="h-7 w-7" />
                                </div>

                                <ArrowUpRight className="h-6 w-6 text-[#626862] transition group-hover:text-violet-700" />
                            </div>

                            <div className="mt-8">
                                <h3 className="text-2xl font-bold text-[#171917]">
                                    Hayal Başvuruları
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-[#626862]">
                                    Bir Hayalim Var formundan gönderilen
                                    bireysel hedefleri incele.
                                </p>

                                <div className="mt-5 inline-flex rounded-full bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700">
                                    {safeNewDreamCount} yeni hayal
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/admin/reviews"
                            className="group flex min-h-56 flex-col justify-between rounded-[2rem] border border-[#E5E8E3] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-amber-200 sm:p-8"
                        >
                            <div className="flex items-start justify-between gap-5">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                                    <MessageSquareQuote className="h-7 w-7" />
                                </div>

                                <ArrowUpRight className="h-6 w-6 text-[#626862] transition group-hover:text-amber-700" />
                            </div>

                            <div className="mt-8">
                                <h3 className="text-2xl font-bold text-[#171917]">
                                    Topluluk Görüşleri
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-[#626862]">
                                    Üyelerin gönderdiği yorumları incele,
                                    onayla veya reddet.
                                </p>

                                <div className="mt-5 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700">
                                        {safePendingReviewCount} onay bekliyor
                                    </span>

                                    <span className="rounded-full bg-[#E8F9EE] px-4 py-2 text-sm font-bold text-[#0E7C3D]">
                                        {safeApprovedReviewCount} yayında
                                    </span>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/admin/exercises"
                            className="group flex min-h-56 flex-col justify-between rounded-[2rem] border border-[#E5E8E3] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#bfe8cf] sm:p-8"
                        >
                            <div className="flex items-start justify-between gap-5">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F9EE] text-[#0E7C3D]">
                                    <Dumbbell className="h-7 w-7" />
                                </div>

                                <ArrowUpRight className="h-6 w-6 text-[#626862] transition group-hover:text-[#0E7C3D]" />
                            </div>

                            <div className="mt-8">
                                <h3 className="text-2xl font-bold text-[#171917]">
                                    Egzersiz Yönetimi
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-[#626862]">
                                    Antrenman Merkezi&apos;ndeki
                                    bölgesel egzersizleri ekle,
                                    düzenle veya sil.
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/admin/custom-training-requests"
                            className="group flex min-h-56 flex-col justify-between rounded-[2rem] border border-[#E5E8E3] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-sky-200 sm:p-8"
                        >
                            <div className="flex items-start justify-between gap-5">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                                    <ListChecks className="h-7 w-7" />
                                </div>

                                <ArrowUpRight className="h-6 w-6 text-[#626862] transition group-hover:text-sky-700" />
                            </div>

                            <div className="mt-8">
                                <h3 className="text-2xl font-bold text-[#171917]">
                                    Özel Antrenman Talepleri
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-[#626862]">
                                    Kişiye özel program formundan gelen
                                    talepleri görüntüle ve durumlarını
                                    güncelle.
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/admin/users"
                            className="group flex min-h-56 flex-col justify-between rounded-[2rem] border border-[#E5E8E3] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#bfe8cf] sm:p-8"
                        >
                            <div className="flex items-start justify-between gap-5">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F9EE] text-[#0E7C3D]">
                                    <UsersRound className="h-7 w-7" />
                                </div>

                                <ArrowUpRight className="h-6 w-6 text-[#626862] transition group-hover:text-[#0E7C3D]" />
                            </div>

                            <div className="mt-8">
                                <h3 className="text-2xl font-bold text-[#171917]">
                                    Üyeler
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-[#626862]">
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
