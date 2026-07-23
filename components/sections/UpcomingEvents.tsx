import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type UpcomingEvent = {
    id: string;
    slug: string;
    title: string;
    category: string;
    location: string;
    starts_at: string;
    ends_at: string;
    cover_image_path: string | null;
    registration_open: boolean;
    participant_count: number;
    capacity: number | null;
};

function getDay(date: string) {
    return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        timeZone: "Europe/Istanbul",
    }).format(new Date(date));
}

function getMonth(date: string) {
    return new Intl.DateTimeFormat("tr-TR", {
        month: "short",
        timeZone: "Europe/Istanbul",
    })
        .format(new Date(date))
        .replace(".", "")
        .toLocaleUpperCase("tr-TR");
}

function getTime(date: string) {
    return new Intl.DateTimeFormat("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Istanbul",
    }).format(new Date(date));
}

function getFullDate(date: string) {
    return new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Europe/Istanbul",
    }).format(new Date(date));
}

export default async function UpcomingEvents() {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("events")
        .select(`
            id,
            slug,
            title,
            category,
            location,
            starts_at,
            ends_at,
            cover_image_path,
            registration_open,
            participant_count,
            capacity
        `)
        .eq("status", "published")
        .gte("ends_at", now)
        .order("starts_at", { ascending: true })
        .limit(3);

    const events = (data ?? []) as UpcomingEvent[];

    function getImageUrl(path: string | null) {
        if (!path) {
            return null;
        }

        return supabase.storage
            .from("event-media")
            .getPublicUrl(path).data.publicUrl;
    }

    return (
        <section className="bg-[#050505] px-6 py-24 text-[#F5F5F5] md:px-10 lg:px-16">
            <div className="mx-auto max-w-7xl">
                <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <span className="mb-4 block text-sm font-semibold uppercase tracking-[0.3em] text-[#27D66B]">
                            Takvime Katıl
                        </span>

                        <h2 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
                            Sıradaki etkinliklerde
                            <span className="text-[#27D66B]"> yerini al.</span>
                        </h2>
                    </div>

                    <Link
                        href="/events"
                        className="group flex items-center gap-3 text-sm font-semibold uppercase tracking-wider"
                    >
                        Tüm etkinlikler

                        <span className="transition-transform duration-300 group-hover:translate-x-2">
                            →
                        </span>
                    </Link>
                </div>

                {error && (
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                        Etkinlikler yüklenirken hata oluştu: {error.message}
                    </div>
                )}

                {!error && events.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
                        <h3 className="text-2xl font-semibold">
                            Yeni etkinlik hazırlanıyor.
                        </h3>

                        <p className="mt-3 text-white/40">
                            Yaklaşan etkinlikler yayınlandığında burada görünecek.
                        </p>
                    </div>
                )}

                {events.length > 0 && (
                    <div className="divide-y divide-white/10 border-y border-white/10">
                        {events.map((event) => {
                            const imageUrl = getImageUrl(event.cover_image_path);

                            const isFull =
                                event.capacity !== null &&
                                event.participant_count >= event.capacity;

                            const registrationLabel = isFull
                                ? "Kontenjan dolu"
                                : event.registration_open
                                    ? "Kayıt açık"
                                    : "Kayıt kapalı";

                            return (
                                <Link
                                    key={event.id}
                                    href={`/events/${event.slug}`}
                                    className="group grid gap-6 py-8 transition-colors duration-300 hover:bg-[#111111] md:grid-cols-[100px_120px_1fr_auto] md:items-center md:px-6"
                                >
                                    <div className="flex items-end gap-3">
                                        <span className="text-5xl font-bold leading-none text-[#27D66B]">
                                            {getDay(event.starts_at)}
                                        </span>

                                        <span className="pb-1 text-sm font-semibold uppercase tracking-wider text-white/50">
                                            {getMonth(event.starts_at)}
                                        </span>
                                    </div>

                                    <div className="relative hidden h-20 overflow-hidden rounded-xl md:block">
                                        {imageUrl ? (
                                            <div
                                                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                                style={{
                                                    backgroundImage: `url("${imageUrl}")`,
                                                }}
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#27D66B]/30 to-black" />
                                        )}
                                    </div>

                                    <div>
                                        <div className="mb-3 flex flex-wrap gap-2">
                                            <span className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-wider text-white/60">
                                                {event.category}
                                            </span>

                                            <span className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-wider text-white/60">
                                                {getTime(event.starts_at)}
                                            </span>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${event.registration_open && !isFull
                                                        ? "bg-[#27D66B]/15 text-[#27D66B]"
                                                        : "bg-white/10 text-white/40"
                                                    }`}
                                            >
                                                {registrationLabel}
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-semibold transition-colors duration-300 group-hover:text-[#27D66B] md:text-3xl">
                                            {event.title}
                                        </h3>

                                        <p className="mt-2 text-sm text-white/50">
                                            {event.location} ·{" "}
                                            {getFullDate(event.starts_at)}
                                        </p>
                                    </div>

                                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-xl transition-all duration-300 group-hover:border-[#27D66B] group-hover:bg-[#27D66B] group-hover:text-black">
                                        ↗
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                <div className="mt-8 flex items-center justify-between text-sm">
                    <span className="text-white/30">
                        {events.length} yaklaşan etkinlik gösteriliyor
                    </span>

                    <Link
                        href="/events"
                        className="font-semibold uppercase tracking-wider text-white/60 transition-colors hover:text-[#27D66B]"
                    >
                        Etkinlik takvimi →
                    </Link>
                </div>
            </div>
        </section>
    );
}