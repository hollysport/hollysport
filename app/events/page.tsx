import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type EventItem = {
    id: string;
    slug: string;
    title: string;
    category: string;
    short_description: string | null;
    location: string;
    starts_at: string;
    ends_at: string;
    capacity: number | null;
    participant_count: number;
    is_free: boolean;
    fee_amount: number;
    currency: string;
    price_note: string | null;
    cover_image_path: string | null;
    registration_open: boolean;
};

function formatDate(date: string) {
    return new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Europe/Istanbul",
    }).format(new Date(date));
}

function formatTime(date: string) {
    return new Intl.DateTimeFormat("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Istanbul",
    }).format(new Date(date));
}

function EventCard({
    event,
    imageUrl,
    isPast,
}: {
    event: EventItem;
    imageUrl: string | null;
    isPast: boolean;
}) {
    const isFull =
        event.capacity !== null &&
        event.participant_count >= event.capacity;

    return (
        <article className="group overflow-hidden rounded-3xl border border-white/10 bg-[#111111]">
            <Link href={`/events/${event.slug}`} className="block">
                <div className="relative h-72 overflow-hidden">
                    {imageUrl ? (
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                            style={{
                                backgroundImage: `url("${imageUrl}")`,
                            }}
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#27D66B]/30 via-[#111111] to-black" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                        <span className="rounded-full bg-black/70 px-4 py-2 text-xs font-semibold uppercase tracking-wider backdrop-blur">
                            {event.category}
                        </span>

                        <span
                            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider ${isPast
                                    ? "bg-white/15 text-white"
                                    : event.registration_open && !isFull
                                        ? "bg-[#27D66B] text-black"
                                        : "bg-black/70 text-white/60"
                                }`}
                        >
                            {isPast
                                ? "Tamamlandı"
                                : isFull
                                    ? "Kontenjan dolu"
                                    : event.registration_open
                                        ? "Kayıt açık"
                                        : "Kayıt kapalı"}
                        </span>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-6">
                        <p className="text-sm font-semibold text-[#27D66B]">
                            {formatDate(event.starts_at)} · {formatTime(event.starts_at)}
                        </p>

                        <h2 className="mt-3 text-3xl font-bold tracking-tight">
                            {event.title}
                        </h2>

                        <p className="mt-2 text-sm text-white/55">
                            {event.location}
                        </p>
                    </div>
                </div>

                <div className="p-6">
                    <p className="line-clamp-3 min-h-[84px] leading-7 text-white/45">
                        {event.short_description ||
                            "Etkinlik detaylarını görüntülemek için incele."}
                    </p>

                    <div className="mt-7 flex items-end justify-between gap-5 border-t border-white/10 pt-5">
                        <div>
                            <span className="block text-xs uppercase tracking-wider text-white/30">
                                Katılım
                            </span>

                            <span className="mt-2 block text-sm font-semibold">
                                {event.is_free
                                    ? "Ücretsiz"
                                    : event.price_note ||
                                    `${Number(event.fee_amount)} ${event.currency}`}
                            </span>
                        </div>

                        <div>
                            <span className="block text-right text-xs uppercase tracking-wider text-white/30">
                                Katılımcı
                            </span>

                            <span className="mt-2 block text-right text-sm font-semibold">
                                {event.participant_count}
                                {event.capacity !== null
                                    ? ` / ${event.capacity}`
                                    : ""}
                            </span>
                        </div>

                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#27D66B] text-xl text-black transition-transform group-hover:translate-x-1">
                            →
                        </span>
                    </div>
                </div>
            </Link>
        </article>
    );
}

export default async function EventsPage() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("events")
        .select(`
      id,
      slug,
      title,
      category,
      short_description,
      location,
      starts_at,
      ends_at,
      capacity,
      participant_count,
      is_free,
      fee_amount,
      currency,
      price_note,
      cover_image_path,
      registration_open
    `)
        .eq("status", "published")
        .order("starts_at", { ascending: true });

    const allEvents = (data ?? []) as EventItem[];
    const currentTime = Date.now();

    const upcomingEvents = allEvents.filter(
        (event) =>
            new Date(event.ends_at).getTime() >= currentTime,
    );

    const pastEvents = allEvents
        .filter(
            (event) =>
                new Date(event.ends_at).getTime() < currentTime,
        )
        .sort(
            (firstEvent, secondEvent) =>
                new Date(secondEvent.starts_at).getTime() -
                new Date(firstEvent.starts_at).getTime(),
        );

    function getImageUrl(path: string | null) {
        if (!path) {
            return null;
        }

        return supabase.storage
            .from("event-media")
            .getPublicUrl(path).data.publicUrl;
    }

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[#050505] text-white">
                <section className="px-6 pb-20 pt-36 md:px-10 lg:px-16">
                    <div className="mx-auto max-w-7xl">
                        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#27D66B]">
                            Holly Sport Etkinlikleri
                        </span>

                        <h1 className="mt-6 max-w-6xl text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
                            Yeni deneyimlere
                            <span className="text-[#27D66B]">
                                {" "}
                                birlikte adım at.
                            </span>
                        </h1>

                        <div className="mt-12 flex flex-col justify-between gap-8 border-t border-white/10 pt-8 md:flex-row md:items-end">
                            <p className="max-w-2xl text-base leading-8 text-white/50 md:text-lg">
                                Yaklaşan etkinliklere katıl veya daha önce
                                gerçekleştirdiğimiz etkinlikleri keşfet.
                            </p>

                            <div className="flex gap-8">
                                <div>
                                    <strong className="block text-3xl text-[#27D66B]">
                                        {upcomingEvents.length}
                                    </strong>

                                    <span className="mt-1 block text-xs uppercase tracking-wider text-white/35">
                                        Yaklaşan
                                    </span>
                                </div>

                                <div>
                                    <strong className="block text-3xl">
                                        {pastEvents.length}
                                    </strong>

                                    <span className="mt-1 block text-xs uppercase tracking-wider text-white/35">
                                        Tamamlanan
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {error && (
                    <section className="px-6 pb-10 md:px-10 lg:px-16">
                        <div className="mx-auto max-w-7xl rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-5 text-red-300">
                            Etkinlikler yüklenemedi: {error.message}
                        </div>
                    </section>
                )}

                <section className="px-6 pb-24 md:px-10 lg:px-16">
                    <div className="mx-auto max-w-7xl">
                        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#27D66B]">
                            Sıradaki Buluşmalar
                        </span>

                        <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
                            Yaklaşan etkinlikler
                        </h2>

                        {upcomingEvents.length === 0 ? (
                            <div className="mt-10 rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
                                <h3 className="text-2xl font-semibold">
                                    Yaklaşan etkinlik bulunmuyor.
                                </h3>

                                <p className="mt-3 text-white/40">
                                    Admin panelinden yayınlanan ileri tarihli
                                    etkinlikler burada görünecek.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-10 grid gap-6 md:grid-cols-2">
                                {upcomingEvents.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        imageUrl={getImageUrl(
                                            event.cover_image_path,
                                        )}
                                        isPast={false}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section className="bg-[#F3F1EB] px-6 py-24 text-black md:px-10 lg:px-16">
                    <div className="mx-auto max-w-7xl">
                        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#159447]">
                            Holly Sport Anıları
                        </span>

                        <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
                            Geçmiş etkinlikler
                        </h2>

                        <p className="mt-5 max-w-2xl leading-7 text-black/50">
                            Tamamlanan etkinlikler otomatik olarak bu bölüme
                            taşınır.
                        </p>

                        {pastEvents.length === 0 ? (
                            <div className="mt-10 rounded-3xl border border-dashed border-black/15 px-6 py-16 text-center text-black/45">
                                Henüz geçmiş etkinlik bulunmuyor.
                            </div>
                        ) : (
                            <div className="mt-10 grid gap-6 md:grid-cols-2">
                                {pastEvents.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        imageUrl={getImageUrl(
                                            event.cover_image_path,
                                        )}
                                        isPast
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}