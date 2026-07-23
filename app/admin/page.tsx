import Link from "next/link";
import {
    ArrowUpRight,
    CalendarDays,
    ClipboardList,
    ExternalLink,
    Lightbulb,
    LogOut,
    MessageCircleQuestion,
    MessageSquareQuote,
} from "lucide-react";

import SupportAdminLinks from "@/components/admin/SupportAdminLinks";
import { requireAdmin } from "@/lib/auth/require-admin";

import { logout } from "./actions";

export default async function AdminPage() {
    const { supabase, profile } = await requireAdmin();

    const now = new Date().toISOString();

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
            .eq("supporter_category", "angel_investor"),

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
                            {profile.full_name || profile.email}.
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