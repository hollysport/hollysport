import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";
import RegistrationForm from "./registration-form";

type JoinPageProps = {
    searchParams: Promise<{
        event?: string | string[];
    }>;
};

type EventItem = {
    id: string;
    slug: string;
    title: string;
    category: string;
    short_description: string | null;
    location: string;
    starts_at: string;
    ends_at: string;
    registration_deadline: string | null;
    capacity: number | null;
    participant_count: number;
    registration_open: boolean;
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

export default async function JoinPage({
    searchParams,
}: JoinPageProps) {
    const parameters = await searchParams;

    const selectedSlug =
        typeof parameters.event === "string"
            ? parameters.event
            : null;

    const supabase = await createClient();
    const now = new Date().toISOString();

    if (!selectedSlug) {
        const { data: availableEvents, error } = await supabase
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
        registration_deadline,
        capacity,
        participant_count,
        registration_open
      `)
            .eq("status", "published")
            .eq("registration_open", true)
            .gte("ends_at", now)
            .order("starts_at", { ascending: true });

        const events = (availableEvents ?? []) as EventItem[];

        const selectableEvents = events.filter((event) => {
            const deadlinePassed =
                event.registration_deadline !== null &&
                new Date(event.registration_deadline).getTime() <= Date.now();

            const isFull =
                event.capacity !== null &&
                event.participant_count >= event.capacity;

            return !deadlinePassed && !isFull;
        });

        return (
            <>
                <Navbar />

                <main className="min-h-screen bg-[#050505] px-6 pb-24 pt-36 text-white md:px-10 lg:px-16">
                    <div className="mx-auto max-w-7xl">
                        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#27D66B]">
                            Holly Sport
                        </span>

                        <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
                            Bir etkinlik seç,
                            <span className="text-[#27D66B]"> aramıza katıl.</span>
                        </h1>

                        <p className="mt-8 max-w-2xl text-lg leading-8 text-white/50">
                            Katılmak istediğin etkinliği seç. Etkinlik sayfasındaki başvuru
                            butonu da seni doğrudan ilgili forma yönlendirir.
                        </p>

                        {error && (
                            <div className="mt-10 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-300">
                                Etkinlikler yüklenemedi: {error.message}
                            </div>
                        )}

                        {selectableEvents.length === 0 ? (
                            <div className="mt-16 rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
                                <h2 className="text-2xl font-semibold">
                                    Şu anda başvuruya açık etkinlik bulunmuyor.
                                </h2>

                                <p className="mt-3 text-white/40">
                                    Yeni etkinlikler yayınlandığında burada görünecek.
                                </p>

                                <Link
                                    href="/events"
                                    className="mt-8 inline-flex h-13 items-center justify-center rounded-full bg-[#27D66B] px-7 text-sm font-semibold uppercase tracking-wider text-black"
                                >
                                    Etkinlikleri incele
                                </Link>
                            </div>
                        ) : (
                            <div className="mt-16 grid gap-5 md:grid-cols-2">
                                {selectableEvents.map((event) => (
                                    <Link
                                        key={event.id}
                                        href={`/join?event=${event.slug}`}
                                        className="group rounded-3xl border border-white/10 bg-[#111111] p-7 transition-colors hover:border-[#27D66B]/50"
                                    >
                                        <div className="flex flex-wrap gap-2">
                                            <span className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-wider text-white/50">
                                                {event.category}
                                            </span>

                                            <span className="rounded-full bg-[#27D66B]/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#27D66B]">
                                                Kayıt açık
                                            </span>
                                        </div>

                                        <h2 className="mt-6 text-3xl font-bold">
                                            {event.title}
                                        </h2>

                                        <p className="mt-3 line-clamp-2 leading-7 text-white/45">
                                            {event.short_description}
                                        </p>

                                        <div className="mt-8 flex items-end justify-between gap-5 border-t border-white/10 pt-5">
                                            <div>
                                                <p className="text-sm font-semibold text-[#27D66B]">
                                                    {formatDate(event.starts_at)}
                                                </p>

                                                <p className="mt-2 text-sm text-white/40">
                                                    {event.location}
                                                </p>
                                            </div>

                                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#27D66B] text-xl text-black transition-transform group-hover:translate-x-1">
                                                →
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </main>

                <Footer />
            </>
        );
    }

    const { data: selectedEvent, error } = await supabase
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
      registration_deadline,
      capacity,
      participant_count,
      registration_open
    `)
        .eq("slug", selectedSlug)
        .eq("status", "published")
        .maybeSingle();

    if (error || !selectedEvent) {
        return (
            <>
                <Navbar />

                <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-center text-white">
                    <div>
                        <h1 className="text-4xl font-bold">
                            Etkinlik bulunamadı.
                        </h1>

                        <p className="mt-4 text-white/45">
                            Etkinlik kaldırılmış veya henüz yayınlanmamış olabilir.
                        </p>

                        <Link
                            href="/join"
                            className="mt-8 inline-flex h-13 items-center justify-center rounded-full bg-[#27D66B] px-7 text-sm font-semibold uppercase tracking-wider text-black"
                        >
                            Etkinlik seç
                        </Link>
                    </div>
                </main>

                <Footer />
            </>
        );
    }

    const event = selectedEvent as EventItem;
    const currentTime = Date.now();

    const isPast =
        new Date(event.ends_at).getTime() <= currentTime;

    const deadlinePassed =
        event.registration_deadline !== null &&
        new Date(event.registration_deadline).getTime() <= currentTime;

    const isFull =
        event.capacity !== null &&
        event.participant_count >= event.capacity;

    const canRegister =
        event.registration_open &&
        !isPast &&
        !deadlinePassed &&
        !isFull;

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[#050505] px-6 pb-24 pt-36 text-white md:px-10 lg:px-16">
                <div className="mx-auto max-w-7xl">
                    <Link
                        href="/join"
                        className="text-sm font-semibold uppercase tracking-wider text-white/40 transition-colors hover:text-[#27D66B]"
                    >
                        ← Başka etkinlik seç
                    </Link>

                    <div className="mt-12 grid gap-14 lg:grid-cols-[1fr_520px]">
                        <div>
                            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#27D66B]">
                                {event.category}
                            </span>

                            <h1 className="mt-6 text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl">
                                {event.title}
                            </h1>

                            <p className="mt-8 max-w-xl text-lg leading-8 text-white/50">
                                {event.short_description}
                            </p>

                            <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
                                <div className="py-5">
                                    <span className="text-xs uppercase tracking-wider text-white/30">
                                        Tarih
                                    </span>

                                    <p className="mt-2 text-lg font-semibold">
                                        {formatDate(event.starts_at)}
                                    </p>
                                </div>

                                <div className="py-5">
                                    <span className="text-xs uppercase tracking-wider text-white/30">
                                        Konum
                                    </span>

                                    <p className="mt-2 text-lg font-semibold">
                                        {event.location}
                                    </p>
                                </div>

                                <div className="py-5">
                                    <span className="text-xs uppercase tracking-wider text-white/30">
                                        Kontenjan
                                    </span>

                                    <p className="mt-2 text-lg font-semibold">
                                        {event.participant_count}
                                        {event.capacity !== null
                                            ? ` / ${event.capacity}`
                                            : " katılımcı"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {canRegister ? (
                            <RegistrationForm
                                eventId={event.id}
                                eventTitle={event.title}
                                eventSlug={event.slug}
                            />
                        ) : (
                            <div className="h-fit rounded-3xl border border-white/10 bg-[#111111] p-8 text-center">
                                <h2 className="text-3xl font-bold">Başvuru yapılamıyor</h2>

                                <p className="mt-4 leading-7 text-white/45">
                                    {isPast
                                        ? "Bu etkinlik tamamlandı."
                                        : isFull
                                            ? "Etkinlik kontenjanı doldu."
                                            : deadlinePassed
                                                ? "Etkinliğin başvuru süresi sona erdi."
                                                : "Etkinliğin kayıtları şu anda kapalı."}
                                </p>

                                <Link
                                    href="/join"
                                    className="mt-8 inline-flex h-13 items-center justify-center rounded-full bg-[#27D66B] px-7 text-sm font-semibold uppercase tracking-wider text-black"
                                >
                                    Başka etkinlik seç
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}