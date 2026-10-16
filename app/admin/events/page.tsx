import Link from "next/link";
import {
    CalendarDays,
    MapPin,
    Pencil,
    Plus,
    Users,
} from "lucide-react";

import DeleteEventButton from "@/components/admin/delete-event-button";
import { requireAdmin } from "@/lib/auth/require-admin";

type EventRecord = {
    id: string;
    title?: string | null;
    name?: string | null;
    slug?: string | null;
    location?: string | null;
    event_date?: string | null;
    start_date?: string | null;
    date?: string | null;
    capacity?: number | null;
    participant_count?: number | null;
    is_published?: boolean | null;
    status?: string | null;
    created_at?: string | null;
};

function getEventTitle(event: EventRecord) {
    return event.title || event.name || "İsimsiz etkinlik";
}

function getEventDate(event: EventRecord) {
    const dateValue =
        event.event_date ||
        event.start_date ||
        event.date ||
        event.created_at;

    if (!dateValue) {
        return "Tarih belirtilmedi";
    }

    const parsedDate = new Date(dateValue);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Tarih belirtilmedi";
    }

    return new Intl.DateTimeFormat("tr-TR", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "Europe/Istanbul",
    }).format(parsedDate);
}

function isEventPublished(event: EventRecord) {
    if (typeof event.is_published === "boolean") {
        return event.is_published;
    }

    return event.status === "published";
}

export default async function EventsAdminPage() {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

    const events = (data ?? []) as EventRecord[];

    return (
        <main className="min-h-screen bg-white px-6 py-10 text-ink md:px-10 lg:px-16">
            <div className="mx-auto max-w-7xl">
                <header className="flex flex-col justify-between gap-6 border-b border-line pb-8 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-holly-ink">
                            Etkinlik Yönetimi
                        </p>

                        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                            Etkinlikleri görüntüle ve yönet
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
                            Mevcut etkinlikleri düzenleyebilir, yayından
                            kaldırabilir veya tamamen silebilirsin.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/admin/events/new"
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#27D66B] px-6 text-sm font-bold text-ink transition hover:bg-[#1fc461]"
                        >
                            <Plus className="h-5 w-5" />
                            Yeni Etkinlik Ekle
                        </Link>
                    </div>
                </header>

                {error && (
                    <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                        Etkinlikler yüklenemedi: {error.message}
                    </div>
                )}

                {!error && events.length === 0 && (
                    <div className="mt-10 flex min-h-80 flex-col items-center justify-center rounded-3xl border border-line bg-shell px-6 text-center">
                        <CalendarDays className="h-11 w-11 text-holly-ink" />

                        <h2 className="mt-5 text-xl font-bold">
                            Henüz etkinlik bulunmuyor
                        </h2>

                        <p className="mt-2 max-w-md text-sm leading-6 text-ink-soft">
                            İlk etkinliği oluşturarak etkinlik yönetimine
                            başlayabilirsin.
                        </p>

                        <Link
                            href="/admin/events/new"
                            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#27D66B] px-6 text-sm font-bold text-black"
                        >
                            <Plus className="h-5 w-5" />
                            Etkinlik Ekle
                        </Link>
                    </div>
                )}

                {!error && events.length > 0 && (
                    <>
                        <div className="mt-8 flex items-center justify-between">
                            <p className="text-sm text-ink-soft">
                                Toplam{" "}
                                <span className="font-bold text-ink">
                                    {events.length}
                                </span>{" "}
                                etkinlik
                            </p>
                        </div>

                        <div className="mt-5 grid gap-5 lg:grid-cols-2">
                            {events.map((event) => {
                                const published = isEventPublished(event);

                                return (
                                    <article
                                        key={event.id}
                                        className="rounded-3xl border border-line bg-shell p-6"
                                    >
                                        <div className="flex items-start justify-between gap-5">
                                            <div className="min-w-0">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                                                        published
                                                            ? "bg-green-50 text-holly-ink"
                                                            : "bg-orange-50 text-orange-700"
                                                    }`}
                                                >
                                                    {published
                                                        ? "Yayında"
                                                        : "Taslak"}
                                                </span>

                                                <h2 className="mt-4 break-words text-2xl font-bold">
                                                    {getEventTitle(event)}
                                                </h2>

                                                {event.slug && (
                                                    <p className="mt-2 truncate text-sm text-ink-soft">
                                                        /events/{event.slug}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                            <div className="flex items-start gap-3 rounded-2xl border border-line bg-shell p-4">
                                                <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-holly-ink" />

                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                                                        Tarih
                                                    </p>

                                                    <p className="mt-1 text-sm leading-6 text-ink/70">
                                                        {getEventDate(event)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 rounded-2xl border border-line bg-shell p-4">
                                                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-holly-ink" />

                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                                                        Konum
                                                    </p>

                                                    <p className="mt-1 break-words text-sm leading-6 text-ink/70">
                                                        {event.location ||
                                                            "Konum belirtilmedi"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 rounded-2xl border border-line bg-shell p-4 sm:col-span-2">
                                                <Users className="mt-0.5 h-5 w-5 shrink-0 text-holly-ink" />

                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                                                        Katılım
                                                    </p>

                                                    <p className="mt-1 text-sm text-ink/70">
                                                        {event.participant_count ??
                                                            0}{" "}
                                                        katılımcı
                                                        {event.capacity
                                                            ? ` / ${event.capacity} kapasite`
                                                            : ""}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-5">
                                            <Link
                                                href={`/admin/events/${event.id}/edit`}
                                                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#27D66B] px-5 text-sm font-bold text-black transition hover:bg-[#1fc461] sm:flex-none"
                                            >
                                                <Pencil className="h-4 w-4" />
                                                Düzenle
                                            </Link>

                                            {event.slug && published && (
                                                <Link
                                                    href={`/events/${event.slug}`}
                                                    target="_blank"
                                                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-line px-5 text-sm font-semibold text-ink/70 transition hover:border-ink-soft hover:text-ink sm:flex-none"
                                                >
                                                    Sayfayı Gör
                                                </Link>
                                            )}

                                            <DeleteEventButton
                                                eventId={event.id}
                                                eventTitle={getEventTitle(event)}
                                            />
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}