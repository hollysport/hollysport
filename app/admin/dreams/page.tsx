import Link from "next/link";
import {
    ArrowLeft,
    CalendarDays,
    Mail,
    Phone,
    Save,
    Trash2,
} from "lucide-react";

import { requireAdmin } from "@/lib/auth/require-admin";

import {
    deleteDreamSubmission,
    updateDreamSubmission,
} from "./actions";

type DreamStatus =
    | "new"
    | "reviewing"
    | "contacted"
    | "completed"
    | "rejected";

type DreamSubmission = {
    id: string;
    full_name: string;
    phone: string;
    email: string;
    dream_title: string;
    dream_description: string;
    status: DreamStatus;
    admin_note: string | null;
    created_at: string;
};

const statusLabels: Record<DreamStatus, string> = {
    new: "Yeni başvuru",
    reviewing: "İnceleniyor",
    contacted: "İletişime geçildi",
    completed: "Gerçekleştirildi",
    rejected: "Uygun bulunmadı",
};

function formatDate(date: string) {
    return new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Istanbul",
    }).format(new Date(date));
}

function getStatusClass(status: DreamStatus) {
    if (status === "new") {
        return "border-violet-400/20 bg-violet-400/10 text-violet-300";
    }

    if (status === "reviewing") {
        return "border-blue-400/20 bg-blue-400/10 text-blue-300";
    }

    if (status === "contacted") {
        return "border-orange-400/20 bg-orange-400/10 text-orange-300";
    }

    if (status === "completed") {
        return "border-[#27D66B]/20 bg-[#27D66B]/10 text-[#27D66B]";
    }

    return "border-red-400/20 bg-red-400/10 text-red-300";
}

export default async function AdminDreamsPage() {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase
        .from("dream_submissions")
        .select(`
            id,
            full_name,
            phone,
            email,
            dream_title,
            dream_description,
            status,
            admin_note,
            created_at
        `)
        .order("created_at", {
            ascending: false,
        });

    const submissions =
        (data as DreamSubmission[] | null) ?? [];

    const newSubmissionCount = submissions.filter(
        (submission) => submission.status === "new",
    ).length;

    return (
        <main className="min-h-screen bg-[#050505] px-5 py-8 text-white sm:px-8 sm:py-10 lg:px-12">
            <div className="mx-auto max-w-7xl">
                <header className="border-b border-white/10 pb-8">
                    <Link
                        href="/admin"
                        className="group inline-flex items-center gap-2 text-sm font-semibold text-white/45 transition hover:text-[#27D66B]"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Yönetim paneline dön
                    </Link>

                    <div className="mt-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.25em] text-violet-300">
                                Bir Hayalim Var
                            </p>

                            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                                Hayal Başvuruları
                            </h1>

                            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/40">
                                İnsanların deneyimlemek veya ulaşmak
                                istediği bireysel hedefleri görüntüle,
                                değerlendir ve durumlarını güncelle.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <div className="rounded-2xl border border-white/10 bg-[#111111] px-5 py-4">
                                <span className="block text-xs uppercase tracking-wider text-white/35">
                                    Toplam
                                </span>

                                <strong className="mt-1 block text-2xl">
                                    {submissions.length}
                                </strong>
                            </div>

                            <div className="rounded-2xl border border-violet-400/20 bg-violet-400/10 px-5 py-4">
                                <span className="block text-xs uppercase tracking-wider text-violet-300/70">
                                    Yeni
                                </span>

                                <strong className="mt-1 block text-2xl text-violet-300">
                                    {newSubmissionCount}
                                </strong>
                            </div>
                        </div>
                    </div>
                </header>

                {error && (
                    <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                        Hayal başvuruları alınamadı. Supabase tablo ve
                        yetki ayarlarını kontrol et.
                    </div>
                )}

                {!error && submissions.length === 0 && (
                    <div className="mt-8 rounded-3xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-20 text-center">
                        <h2 className="text-2xl font-bold">
                            Henüz hayal başvurusu yok.
                        </h2>

                        <p className="mt-3 text-white/40">
                            Formdan gönderilen başvurular burada
                            görünecek.
                        </p>
                    </div>
                )}

                <section className="mt-8 space-y-6">
                    {submissions.map((submission) => (
                        <article
                            key={submission.id}
                            className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111]"
                        >
                            <div className="border-b border-white/10 p-6 sm:p-8">
                                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span
                                                className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${getStatusClass(
                                                    submission.status,
                                                )}`}
                                            >
                                                {
                                                    statusLabels[
                                                    submission.status
                                                    ]
                                                }
                                            </span>

                                            <span className="inline-flex items-center gap-2 text-xs text-white/35">
                                                <CalendarDays className="h-4 w-4" />
                                                {formatDate(
                                                    submission.created_at,
                                                )}
                                            </span>
                                        </div>

                                        <h2 className="mt-5 text-3xl font-bold tracking-tight">
                                            {submission.dream_title}
                                        </h2>

                                        <p className="mt-3 text-sm font-semibold text-white/60">
                                            {submission.full_name}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2 text-sm">
                                        <a
                                            href={`tel:${submission.phone}`}
                                            className="inline-flex items-center gap-2 text-white/50 transition hover:text-[#27D66B]"
                                        >
                                            <Phone className="h-4 w-4" />
                                            {submission.phone}
                                        </a>

                                        <a
                                            href={`mailto:${submission.email}`}
                                            className="inline-flex items-center gap-2 text-white/50 transition hover:text-[#27D66B]"
                                        >
                                            <Mail className="h-4 w-4" />
                                            {submission.email}
                                        </a>
                                    </div>
                                </div>

                                <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-5">
                                    <p className="whitespace-pre-line text-sm leading-7 text-white/60">
                                        {
                                            submission.dream_description
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 p-6 sm:p-8 lg:grid-cols-[1fr_auto]">
                                <form
                                    action={updateDreamSubmission}
                                    className="grid gap-4 md:grid-cols-[220px_1fr_auto] md:items-end"
                                >
                                    <input
                                        type="hidden"
                                        name="id"
                                        value={submission.id}
                                    />

                                    <label>
                                        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
                                            Durum
                                        </span>

                                        <select
                                            name="status"
                                            defaultValue={
                                                submission.status
                                            }
                                            className="form-field-dark min-h-12 w-full rounded-2xl border border-white/10 px-4 outline-none transition focus:border-[#27D66B]"
                                        >
                                            <option value="new">
                                                Yeni başvuru
                                            </option>

                                            <option value="reviewing">
                                                İnceleniyor
                                            </option>

                                            <option value="contacted">
                                                İletişime geçildi
                                            </option>

                                            <option value="completed">
                                                Gerçekleştirildi
                                            </option>

                                            <option value="rejected">
                                                Uygun bulunmadı
                                            </option>
                                        </select>
                                    </label>

                                    <label>
                                        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
                                            Yönetim notu
                                        </span>

                                        <textarea
                                            name="admin_note"
                                            rows={2}
                                            defaultValue={
                                                submission.admin_note ??
                                                ""
                                            }
                                            placeholder="Başvuru hakkında özel not..."
                                            className="form-field-dark min-h-12 w-full resize-y rounded-2xl border border-white/10 px-4 py-3 outline-none transition focus:border-[#27D66B]"
                                        />
                                    </label>

                                    <button
                                        type="submit"
                                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#27D66B] px-6 text-sm font-bold text-black transition hover:bg-[#45e27f]"
                                    >
                                        <Save className="h-4 w-4" />
                                        Kaydet
                                    </button>
                                </form>

                                <form
                                    action={deleteDreamSubmission}
                                    className="flex items-end"
                                >
                                    <input
                                        type="hidden"
                                        name="id"
                                        value={submission.id}
                                    />

                                    <button
                                        type="submit"
                                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-red-500/25 px-5 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Sil
                                    </button>
                                </form>
                            </div>
                        </article>
                    ))}
                </section>
            </div>
        </main>
    );
}