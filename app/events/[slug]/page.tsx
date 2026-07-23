import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";

type EventDetailPageProps = {
    params: Promise<{
        slug: string;
    }>;
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

export default async function EventDetailPage({
    params,
}: EventDetailPageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: event, error } = await supabase
        .from("events")
        .select(`
      id,
      slug,
      title,
      category,
      short_description,
      description,
      location,
      address,
      starts_at,
      ends_at,
      registration_deadline,
      capacity,
      participant_count,
      level,
      is_free,
      fee_amount,
      currency,
      price_note,
      cover_image_path,
      registration_open,
      featured
    `)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

    if (error || !event) {
        notFound();
    }

    const { data: galleryData } = await supabase
        .from("event_images")
        .select("id, storage_path, alt_text, caption, sort_order")
        .eq("event_id", event.id)
        .order("sort_order", { ascending: true });

    function getImageUrl(path: string | null) {
        if (!path) {
            return null;
        }

        return supabase.storage
            .from("event-media")
            .getPublicUrl(path).data.publicUrl;
    }

    const coverImageUrl = getImageUrl(event.cover_image_path);

    const galleryImages = (galleryData ?? []).map((image) => ({
        ...image,
        url: getImageUrl(image.storage_path),
    }));

    const currentTime = Date.now();
    const isPast = new Date(event.ends_at).getTime() < currentTime;

    const deadlinePassed =
        event.registration_deadline !== null &&
        new Date(event.registration_deadline).getTime() < currentTime;

    const isFull =
        event.capacity !== null &&
        event.participant_count >= event.capacity;

    const canRegister =
        !isPast &&
        event.registration_open &&
        !deadlinePassed &&
        !isFull;

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[#050505] text-white">
                <section className="px-6 pb-20 pt-32 md:px-10 lg:px-16">
                    <div className="mx-auto max-w-7xl">
                        <Link
                            href="/events"
                            className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-white/40 transition-colors hover:text-[#27D66B]"
                        >
                            ← Etkinliklere dön
                        </Link>

                        <div className="mt-10 overflow-hidden rounded-3xl border border-white/10">
                            <div className="relative min-h-[520px]">
                                {coverImageUrl ? (
                                    <div
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{
                                            backgroundImage: `url("${coverImageUrl}")`,
                                        }}
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#27D66B]/40 via-[#111111] to-black" />
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />

                                <div className="relative flex min-h-[520px] flex-col justify-end p-7 md:p-12">
                                    <div className="flex flex-wrap gap-3">
                                        <span className="rounded-full bg-[#27D66B] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black">
                                            {event.category}
                                        </span>

                                        <span className="rounded-full bg-black/60 px-4 py-2 text-xs font-semibold uppercase tracking-wider backdrop-blur">
                                            {isPast ? "Etkinlik tamamlandı" : "Yaklaşan etkinlik"}
                                        </span>

                                        {event.featured && (
                                            <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider backdrop-blur">
                                                Öne çıkan
                                            </span>
                                        )}
                                    </div>

                                    <h1 className="mt-7 max-w-5xl text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
                                        {event.title}
                                    </h1>

                                    {event.short_description && (
                                        <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 md:text-lg">
                                            {event.short_description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="px-6 pb-24 md:px-10 lg:px-16">
                    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_380px]">
                        <div>
                            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#27D66B]">
                                Etkinlik Hakkında
                            </span>

                            <h2 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
                                Bilmen gerekenler
                            </h2>

                            <div className="mt-8 max-w-3xl whitespace-pre-line text-base leading-8 text-white/50 md:text-lg">
                                {event.description}
                            </div>

                            {event.address && (
                                <div className="mt-12 rounded-2xl border border-white/10 bg-[#111111] p-6">
                                    <span className="text-xs uppercase tracking-wider text-white/30">
                                        Açık adres
                                    </span>

                                    <p className="mt-3 text-lg font-semibold">{event.address}</p>
                                </div>
                            )}
                        </div>

                        <aside className="h-fit rounded-3xl bg-[#111111] p-7 md:p-9">
                            <h2 className="text-2xl font-bold">Etkinlik bilgileri</h2>

                            <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
                                <div className="py-5">
                                    <span className="block text-xs uppercase tracking-wider text-white/30">
                                        Tarih
                                    </span>

                                    <strong className="mt-2 block">
                                        {formatDate(event.starts_at)}
                                    </strong>
                                </div>

                                <div className="py-5">
                                    <span className="block text-xs uppercase tracking-wider text-white/30">
                                        Saat
                                    </span>

                                    <strong className="mt-2 block text-[#27D66B]">
                                        {formatTime(event.starts_at)} –{" "}
                                        {formatTime(event.ends_at)}
                                    </strong>
                                </div>

                                <div className="py-5">
                                    <span className="block text-xs uppercase tracking-wider text-white/30">
                                        Konum
                                    </span>

                                    <strong className="mt-2 block">{event.location}</strong>
                                </div>

                                <div className="py-5">
                                    <span className="block text-xs uppercase tracking-wider text-white/30">
                                        Katılım seviyesi
                                    </span>

                                    <strong className="mt-2 block">
                                        {event.level || "Tüm seviyeler"}
                                    </strong>
                                </div>

                                <div className="py-5">
                                    <span className="block text-xs uppercase tracking-wider text-white/30">
                                        Katılımcı
                                    </span>

                                    <strong className="mt-2 block">
                                        {event.participant_count}
                                        {event.capacity !== null
                                            ? ` / ${event.capacity}`
                                            : " kişi"}
                                    </strong>
                                </div>

                                <div className="py-5">
                                    <span className="block text-xs uppercase tracking-wider text-white/30">
                                        Ücret
                                    </span>

                                    <strong className="mt-2 block">
                                        {event.is_free
                                            ? "Ücretsiz"
                                            : `${event.fee_amount} ${event.currency}`}
                                    </strong>

                                    {event.price_note && (
                                        <p className="mt-2 text-sm leading-6 text-white/40">
                                            {event.price_note}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {canRegister ? (
                                <Link
                                    href={`/join?event=${event.slug}`}
                                    className="mt-8 flex h-14 w-full items-center justify-center rounded-full bg-[#27D66B] text-sm font-semibold uppercase tracking-wider text-black transition-transform hover:scale-[1.02]"
                                >
                                    Etkinliğe katıl
                                </Link>
                            ) : (
                                <div className="mt-8 rounded-2xl bg-white/5 px-5 py-4 text-center text-sm text-white/45">
                                    {isPast
                                        ? "Bu etkinlik tamamlandı."
                                        : isFull
                                            ? "Etkinlik kontenjanı doldu."
                                            : deadlinePassed
                                                ? "Başvuru süresi sona erdi."
                                                : "Etkinlik kayıtları kapalı."}
                                </div>
                            )}
                        </aside>
                    </div>
                </section>

                {galleryImages.length > 0 && (
                    <section className="bg-[#F3F1EB] px-6 py-24 text-black md:px-10 lg:px-16">
                        <div className="mx-auto max-w-7xl">
                            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#159447]">
                                Etkinlik Galerisi
                            </span>

                            <h2 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
                                Etkinlikten kareler
                            </h2>

                            <div className="mt-12 grid auto-rows-[300px] gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {galleryImages.map((image, index) => (
                                    <article
                                        key={image.id}
                                        className={`relative overflow-hidden rounded-2xl ${index === 0 ? "lg:col-span-2 lg:row-span-2" : ""
                                            }`}
                                    >
                                        {image.url && (
                                            <div
                                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                                                style={{
                                                    backgroundImage: `url("${image.url}")`,
                                                }}
                                            />
                                        )}

                                        {image.caption && (
                                            <>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                                                <p className="absolute inset-x-0 bottom-0 p-5 text-sm text-white">
                                                    {image.caption}
                                                </p>
                                            </>
                                        )}
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {!isPast && (
                    <section className="bg-[#27D66B] px-6 py-20 text-black md:px-10 lg:px-16">
                        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 lg:flex-row lg:items-center">
                            <div>
                                <span className="text-sm font-semibold uppercase tracking-[0.3em]">
                                    Holly Sport
                                </span>

                                <h2 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
                                    Bu deneyimin bir parçası ol.
                                </h2>
                            </div>

                            {canRegister && (
                                <Link
                                    href={`/join?event=${event.slug}`}
                                    className="flex h-16 shrink-0 items-center justify-center rounded-full bg-black px-10 text-sm font-semibold uppercase tracking-wider text-white transition-transform hover:scale-105"
                                >
                                    Şimdi katıl
                                </Link>
                            )}
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </>
    );
}