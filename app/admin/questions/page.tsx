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
    pending: "bg-orange-50 text-orange-700",
    answered: "bg-green-50 text-holly-ink",
    closed: "bg-blue-50 text-blue-700",
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
        <main className="min-h-screen bg-white px-6 py-10 text-ink md:px-10 lg:px-16">
            <div className="mx-auto max-w-7xl">
                <header className="flex flex-col justify-between gap-6 border-b border-line pb-8 sm:flex-row sm:items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                            Gelen Sorular
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
                            SSS sayfasından gönderilen soruları incele ve durumlarını
                            yönet.
                        </p>
                    </div>
                </header>

                {error && (
                    <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                        Sorular yüklenemedi: {error.message}
                    </div>
                )}

                {!error && (!questions || questions.length === 0) && (
                    <div className="mt-10 flex min-h-72 flex-col items-center justify-center rounded-3xl border border-line bg-shell px-6 text-center">
                        <MessageCircleQuestion className="h-10 w-10 text-holly-ink" />

                        <h2 className="mt-5 text-xl font-bold">
                            Henüz soru bulunmuyor
                        </h2>

                        <p className="mt-2 text-sm text-ink-soft">
                            SSS formundan gönderilen sorular burada görüntülenecek.
                        </p>
                    </div>
                )}

                {!error && questions && questions.length > 0 && (
                    <div className="mt-10 grid gap-6 lg:grid-cols-2">
                        {questions.map((item) => (
                            <article
                                key={item.id}
                                className="rounded-3xl border border-line bg-shell p-6"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-holly-ink">
                                            {categoryLabels[item.category] ?? item.category}
                                        </p>

                                        <h2 className="mt-3 text-2xl font-bold">
                                            {item.subject}
                                        </h2>

                                        <p className="mt-2 text-sm text-ink-soft">
                                            {item.full_name}
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusClasses[item.status] ??
                                            "bg-shell text-ink/70"
                                            }`}
                                    >
                                        {statusLabels[item.status] ?? item.status}
                                    </span>
                                </div>

                                <div className="mt-6 rounded-2xl border border-line bg-shell p-5">
                                    <p className="whitespace-pre-line text-sm leading-7 text-ink/70">
                                        {item.question}
                                    </p>
                                </div>

                                <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                                    <a
                                        href={`mailto:${item.email}?subject=${encodeURIComponent(
                                            `Holly Sport: ${item.subject}`,
                                        )}`}
                                        className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-ink/70 transition hover:border-green-300 hover:text-ink"
                                    >
                                        <Mail className="h-4 w-4 shrink-0 text-holly-ink" />

                                        <span className="truncate">{item.email}</span>
                                    </a>

                                    {item.phone ? (
                                        <a
                                            href={`tel:${item.phone.replace(/\s/g, "")}`}
                                            className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-ink/70 transition hover:border-green-300 hover:text-ink"
                                        >
                                            <Phone className="h-4 w-4 shrink-0 text-holly-ink" />

                                            <span>{item.phone}</span>
                                        </a>
                                    ) : (
                                        <div className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-ink-soft">
                                            <Phone className="h-4 w-4 shrink-0" />

                                            Telefon belirtilmedi
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex items-center gap-2 text-xs text-ink-soft">
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