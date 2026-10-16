import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isActiveRegistrationStatus } from "@/lib/events/registration-status";
import { getCurrentTimestamp } from "@/lib/time";
import RegistrationForm from "./registration-form";
import QuickJoinButton from "@/components/events/quick-join-button";

export const metadata: Metadata = {
    title: "Kayıt Ol | Holly Sport",
    description:
        "Holly Sport etkinliklerine ve topluluğa katılım kaydını oluştur.",
};

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
                new Date(event.registration_deadline).getTime() <=
                getCurrentTimestamp();

            const isFull =
                event.capacity !== null &&
                event.participant_count >= event.capacity;

            return !deadlinePassed && !isFull;
        });

        return (
            <>
                <Navbar />

                <main className="min-h-screen bg-white px-6 pb-24 pt-36 text-ink md:px-10 lg:px-16">
                    <div className="mx-auto max-w-7xl">
                        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-holly-ink">
                            Holly Sport
                        </span>

                        <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
                            Bir etkinlik seç,
                            <span className="text-holly-ink"> aramıza katıl.</span>
                        </h1>

                        <p className="mt-8 max-w-2xl text-lg leading-8 text-ink-soft">
                            Katılmak istediğin etkinliği seç. Etkinlik sayfasındaki başvuru
                            butonu da seni doğrudan ilgili forma yönlendirir.
                        </p>

                        {error && (
                            <div className="mt-10 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
                                Etkinlikler yüklenemedi: {error.message}
                            </div>
                        )}

                        {selectableEvents.length === 0 ? (
                            <div className="mt-16 rounded-3xl border border-dashed border-line bg-shell px-6 py-16 text-center">
                                <h2 className="text-2xl font-semibold">
                                    Şu anda başvuruya açık etkinlik bulunmuyor.
                                </h2>

                                <p className="mt-3 text-ink-soft">
                                    Yeni etkinlikler yayınlandığında burada görünecek.
                                </p>

                                <Link
                                    href="/events"
                                    className="mt-8 inline-flex h-13 items-center justify-center rounded-full bg-[#27D66B] px-7 text-sm font-semibold uppercase tracking-wider text-ink"
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
                                        className="group rounded-3xl border border-line bg-shell p-7 transition-colors hover:border-[#27D66B]/50"
                                    >
                                        <div className="flex flex-wrap gap-2">
                                            <span className="rounded-full border border-line bg-white px-3 py-1 text-xs uppercase tracking-wider text-ink-soft">
                                                {event.category}
                                            </span>

                                            <span className="rounded-full bg-[#27D66B]/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-holly-ink">
                                                Kayıt açık
                                            </span>
                                        </div>

                                        <h2 className="mt-6 text-3xl font-bold">
                                            {event.title}
                                        </h2>

                                        <p className="mt-3 line-clamp-2 leading-7 text-ink-soft">
                                            {event.short_description}
                                        </p>

                                        <div className="mt-8 flex items-end justify-between gap-5 border-t border-line pt-5">
                                            <div>
                                                <p className="text-sm font-semibold text-holly-ink">
                                                    {formatDate(event.starts_at)}
                                                </p>

                                                <p className="mt-2 text-sm text-ink-soft">
                                                    {event.location}
                                                </p>
                                            </div>

                                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#27D66B] text-xl text-ink transition-transform group-hover:translate-x-1">
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

                <main className="flex min-h-screen items-center justify-center bg-shell px-6 text-center text-ink">
                    <div>
                        <h1 className="text-4xl font-bold">
                            Etkinlik bulunamadı.
                        </h1>

                        <p className="mt-4 text-ink-soft">
                            Etkinlik kaldırılmış veya henüz yayınlanmamış olabilir.
                        </p>

                        <Link
                            href="/join"
                            className="mt-8 inline-flex h-13 items-center justify-center rounded-full bg-[#27D66B] px-7 text-sm font-semibold uppercase tracking-wider text-ink"
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
    const currentTime = getCurrentTimestamp();

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

    /*
     * Akıllı etkinlik kaydı:
     * - Giriş YAPMAMIŞ misafir → uzun başvuru formu (olduğu gibi).
     * - Giriş YAPMIŞ üye → uzun form gizlenir, tek tuşlu katılım
     *   butonu gösterilir (üye verileri profilden okunur).
     */
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let alreadyRegistered = false;

    if (user && canRegister) {
        try {
            const supabaseAdmin = createAdminClient();

            const { data: byUser } = await supabaseAdmin
                .from("event_registrations")
                .select("id, status")
                .eq("event_id", event.id)
                .eq("user_id", user.id)
                .maybeSingle();

            const { data: byEmail } = user.email
                ? await supabaseAdmin
                      .from("event_registrations")
                      .select("id, status")
                      .eq("event_id", event.id)
                      .eq("email", user.email)
                      .maybeSingle()
                : { data: null };

            /* Yalnızca aktif (onaylı/bekleyen) kayıt "zaten kayıtlı" sayılır */
            alreadyRegistered =
                isActiveRegistrationStatus(byUser?.status) ||
                isActiveRegistrationStatus(byEmail?.status);
        } catch (lookupError) {
            console.error(
                "JoinPage: kayıt kontrolü başarısız:",
                lookupError,
            );
        }
    }

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-white px-6 pb-24 pt-36 text-ink md:px-10 lg:px-16">
                <div className="mx-auto max-w-7xl">
                    <Link
                        href="/join"
                        className="text-sm font-semibold uppercase tracking-wider text-ink-soft transition-colors hover:text-holly-ink"
                    >
                        ← Başka etkinlik seç
                    </Link>

                    <div className="mt-12 grid gap-14 lg:grid-cols-[1fr_520px]">
                        <div>
                            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-holly-ink">
                                {event.category}
                            </span>

                            <h1 className="mt-6 text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl">
                                {event.title}
                            </h1>

                            <p className="mt-8 max-w-xl text-lg leading-8 text-ink-soft">
                                {event.short_description}
                            </p>

                            <div className="mt-12 divide-y divide-line border-y border-line">
                                <div className="py-5">
                                    <span className="text-xs uppercase tracking-wider text-ink-soft">
                                        Tarih
                                    </span>

                                    <p className="mt-2 text-lg font-semibold">
                                        {formatDate(event.starts_at)}
                                    </p>
                                </div>

                                <div className="py-5">
                                    <span className="text-xs uppercase tracking-wider text-ink-soft">
                                        Konum
                                    </span>

                                    <p className="mt-2 text-lg font-semibold">
                                        {event.location}
                                    </p>
                                </div>

                                <div className="py-5">
                                    <span className="text-xs uppercase tracking-wider text-ink-soft">
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
                            user ? (
                                <QuickJoinButton
                                    eventId={event.id}
                                    eventTitle={event.title}
                                    alreadyRegistered={
                                        alreadyRegistered
                                    }
                                />
                            ) : (
                                <RegistrationForm
                                    eventId={event.id}
                                    eventTitle={event.title}
                                    eventSlug={event.slug}
                                />
                            )
                        ) : (
                            <div className="h-fit rounded-3xl border border-line bg-shell p-8 text-center">
                                <h2 className="text-3xl font-bold">Başvuru yapılamıyor</h2>

                                <p className="mt-4 leading-7 text-ink-soft">
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
                                    className="mt-8 inline-flex h-13 items-center justify-center rounded-full bg-[#27D66B] px-7 text-sm font-semibold uppercase tracking-wider text-ink"
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