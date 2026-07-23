import Link from "next/link";
import {
    CalendarDays,
    Mail,
    MessageCircleQuestion,
    Phone,
} from "lucide-react";

import QuestionActions from "@/components/admin/question-actions";
import { requireAdmin } from "@/lib/auth/require-admin";

const categoryLabels: Record<string, string> = {
    general: "Genel soru",
    event: "Etkinlikler",
    membership: "Topluluğa katılım",
    volunteer: "Gönüllülük",
    support: "Destek olmak",
    corporate: "Kurumsal iş birliği",
    other: "Diğer",
};

const statusLabels: Record<string, string> = {
    pending: "Bekliyor",
    answered: "Cevaplandı",
    closed: "Kapatıldı",
};

const statusClasses: Record<string, string> = {
    pending: "bg-orange-500/10 text-orange-300",
    answered: "bg-[#27D66B]/10 text-[#27D66B]",
    closed: "bg-blue-500/10 text-blue-300",
};

export default async function QuestionsAdminPage() {
    const { supabase } = await requireAdmin();

    const { data: questions, error } = await supabase
        .from("contact_questions")
        .select(
            `
        id,
        full_name,
        email,
        phone,
        category,
        subject,
        question,
        status,
        created_at
      `,
        )
        .order("created_at", { ascending: false });

    return (
        <main className="min-h-screen bg-[#050505] px-6 py-10 text-white md:px-10 lg:px-16">
            <div className="mx-auto max-w-7xl">
                <header className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#27D66B]">
                            Admin Paneli
                        </p>

                        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                            Gelen Sorular
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
                            SSS sayfasından gönderilen soruları incele ve durumlarını
                            yönet.
                        </p>
                    </div>

                    <Link
                        href="/admin"
                        className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-semibold transition hover:border-white/40"
                    >
                        Admin Paneline Dön
                    </Link>
                </header>

                {error && (
                    <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                        Sorular yüklenemedi: {error.message}
                    </div>
                )}

                {!error && (!questions || questions.length === 0) && (
                    <div className="mt-10 flex min-h-72 flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#111111] px-6 text-center">
                        <MessageCircleQuestion className="h-10 w-10 text-[#27D66B]" />

                        <h2 className="mt-5 text-xl font-bold">
                            Henüz soru bulunmuyor
                        </h2>

                        <p className="mt-2 text-sm text-white/40">
                            SSS formundan gönderilen sorular burada görüntülenecek.
                        </p>
                    </div>
                )}

                {!error && questions && questions.length > 0 && (
                    <div className="mt-10 grid gap-6 lg:grid-cols-2">
                        {questions.map((item) => (
                            <article
                                key={item.id}
                                className="rounded-3xl border border-white/10 bg-[#111111] p-6"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#27D66B]">
                                            {categoryLabels[item.category] ?? item.category}
                                        </p>

                                        <h2 className="mt-3 text-2xl font-bold">
                                            {item.subject}
                                        </h2>

                                        <p className="mt-2 text-sm text-white/50">
                                            {item.full_name}
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusClasses[item.status] ??
                                            "bg-white/10 text-white/60"
                                            }`}
                                    >
                                        {statusLabels[item.status] ?? item.status}
                                    </span>
                                </div>

                                <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
                                    <p className="whitespace-pre-line text-sm leading-7 text-white/70">
                                        {item.question}
                                    </p>
                                </div>

                                <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                                    <a
                                        href={`mailto:${item.email}?subject=${encodeURIComponent(
                                            `Holly Sport: ${item.subject}`,
                                        )}`}
                                        className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-white/60 transition hover:border-[#27D66B]/50 hover:text-white"
                                    >
                                        <Mail className="h-4 w-4 shrink-0 text-[#27D66B]" />

                                        <span className="truncate">{item.email}</span>
                                    </a>

                                    {item.phone ? (
                                        <a
                                            href={`tel:${item.phone.replace(/\s/g, "")}`}
                                            className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-white/60 transition hover:border-[#27D66B]/50 hover:text-white"
                                        >
                                            <Phone className="h-4 w-4 shrink-0 text-[#27D66B]" />

                                            <span>{item.phone}</span>
                                        </a>
                                    ) : (
                                        <div className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-white/30">
                                            <Phone className="h-4 w-4 shrink-0" />

                                            Telefon belirtilmedi
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex items-center gap-2 text-xs text-white/30">
                                    <CalendarDays className="h-4 w-4" />

                                    {new Intl.DateTimeFormat("tr-TR", {
                                        dateStyle: "long",
                                        timeStyle: "short",
                                        timeZone: "Europe/Istanbul",
                                    }).format(new Date(item.created_at))}
                                </div>

                                <QuestionActions
                                    question={{
                                        id: item.id,
                                        status: item.status,
                                    }}
                                />
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}