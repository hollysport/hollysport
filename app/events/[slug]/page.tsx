import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isActiveRegistrationStatus } from "@/lib/events/registration-status";
import QuickJoinButton from "@/components/events/quick-join-button";
import { getCurrentTimestamp } from "@/lib/time";

type EventDetailPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

export async function generateMetadata({
    params,
}: EventDetailPageProps): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: event } = await supabase
        .from("events")
        .select("title, short_description")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

    if (!event) {
        return {
            title: "Etkinlik Bulunamadı | Holly Sport",
        };
    }

    return {
        title: `${event.title} | Holly Sport`,
        description:
            event.short_description ??
            `${event.title} — Holly Sport etkinliği.`,
    };
}

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
        .select(
            "id, storage_path, alt_text, caption, sort_order",
        )
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

    const currentTime = getCurrentTimestamp();
    const isPast =
        new Date(event.ends_at).getTime() < currentTime;

    const deadlinePassed =
        event.registration_deadline !== null &&
        new Date(event.registration_deadline).getTime() <
            currentTime;

    const isFull =
        event.capacity !== null &&
        event.participant_count >= event.capacity;

    const canRegister =
        !isPast &&
        event.registration_open &&
        !deadlinePassed &&
        !isFull;

    /*
     * Geçmiş etkinlik detayları sade tutulur: ad, tarih ve kapak
     * görseli ön planda kalır; açıklama metni ve katılımcı sayısı
     * gösterilmez. Yaklaşan etkinliklerin detayları, katılım
     * koşulları ve kayıt akışı bu gizlemeden etkilenmez.
     */
    const showEventText = !isPast;

    /*
     * Sol sütunda yalnız açıklama ve adres kutusu var. Geçmiş bir
     * etkinlikte açıklama gizli ve adres yoksa sol sütun tamamen
     * boş kalmasın diye tek sütunlu düzene geçilir.
     */
    const showInfoColumn = showEventText || Boolean(event.address);

    /*
     * Akıllı etkinlik kaydı: giriş yapmış üye için uzun başvuru
     * formuna yönlendirmek yerine tek tuşlu katılım butonu açılır;
     * misafir kullanıcı `/join` formuna yönlendirilmeye devam eder.
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
                "EventDetailPage: kayıt kontrolü başarısız:",
                lookupError,
            );
        }
    }

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-white text-ink">
                <section className="px-6 pb-20 pt-32 md:px-10 lg:px-16">
                    <div className="mx-auto max-w-7xl">
                        <Link
                            href="/events"
                            className="group inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-ink-soft transition-colors hover:text-holly-ink"
                        >
                            <ArrowLeft
                                aria-hidden="true"
                                className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
                            />

                            Etkinliklere dön
                        </Link>

                        <div className="mt-10 overflow-hidden rounded-3xl border border-line">
                            <div className="relative min-h-[520px]">
                                {coverImageUrl ? (
                                    <Image
                                        src={coverImageUrl}
                                        alt={`${event.title} etkinlik kapak görseli`}
                                        fill
                                        priority
                                        sizes="(max-width: 1024px) 100vw, 1200px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#27D66B]/40 via-[#111111] to-black" />
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />

                                <div className="relative flex min-h-[520px] flex-col justify-end p-7 md:p-12">
                                    <div className="flex flex-wrap gap-3">
                                        <span className="rounded-full bg-holly px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink">
                                            {event.category}
                                        </span>

                                        <span className="rounded-full bg-black/60 px-4 py-2 text-xs font-semibold uppercase tracking-wider backdrop-blur">
                                            {isPast
                                                ? "Etkinlik tamamlandı"
                                                : "Yaklaşan etkinlik"}
                                        </span>

                                        {event.featured && (
                                            <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider backdrop-blur">
                                                Öne çıkan
                                            </span>
                                        )}
                                    </div>

                                    <h1 className="mt-7 max-w-5xl text-5xl font-bold leading-[0.95] tracking-tight text-white md:text-7xl lg:text-8xl">
                                        {event.title}
                                    </h1>

                                    {showEventText &&
                                        event.short_description && (
                                            <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 md:text-lg">
                                                {
                                                    event.short_description
                                                }
                                            </p>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="px-6 pb-24 md:px-10 lg:px-16">
                    <div
                        className={`mx-auto grid max-w-7xl gap-12 ${showInfoColumn
                                ? "lg:grid-cols-[1fr_380px]"
                                : "lg:grid-cols-1"
                            }`}
                    >
                        {showInfoColumn && (
                            <div>
                                {showEventText && (
                                    <>
                                        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-holly-ink">
                                            Etkinlik Hakkında
                                        </span>

                                        <h2 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
                                            Bilmen gerekenler
                                        </h2>

                                        <div className="mt-8 max-w-3xl whitespace-pre-line text-base leading-8 text-ink/70 md:text-lg">
                                            {event.description}
                                        </div>
                                    </>
                                )}

                                {event.address && (
                                    <div
                                        className={`rounded-2xl border border-line bg-shell p-6 ${showEventText
                                                ? "mt-12"
                                                : ""
                                            }`}
                                    >
                                        <span className="text-xs uppercase tracking-wider text-ink-soft">
                                            Açık adres
                                        </span>

                                        <p className="mt-3 text-lg font-semibold">
                                            {event.address}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        <aside
                            className={`h-fit rounded-3xl bg-shell p-7 md:p-9 ${showInfoColumn
                                    ? ""
                                    : "mx-auto w-full max-w-2xl"
                                }`}
                        >
                            <h2 className="text-2xl font-bold">
                                Etkinlik bilgileri
                            </h2>

                            <div className="mt-8 divide-y divide-line border-y border-line">
                                <div className="py-5">
                                    <span className="block text-xs uppercase tracking-wider text-ink-soft">
                                        Tarih
                                    </span>

                                    <strong className="mt-2 block">
                                        {formatDate(
                                            event.starts_at,
                                        )}
                                    </strong>
                                </div>

                                <div className="py-5">
                                    <span className="block text-xs uppercase tracking-wider text-ink-soft">
                                        Saat
                                    </span>

                                    <strong className="mt-2 block text-holly-ink">
                                        {formatTime(
                                            event.starts_at,
                                        )}{" "}
                                        –{" "}
                                        {formatTime(event.ends_at)}
                                    </strong>
                                </div>

                                <div className="py-5">
                                    <span className="block text-xs uppercase tracking-wider text-ink-soft">
                                        Konum
                                    </span>

                                    <strong className="mt-2 block">
                                        {event.location}
                                    </strong>
                                </div>

                                <div className="py-5">
                                    <span className="block text-xs uppercase tracking-wider text-ink-soft">
                                        Katılım seviyesi
                                    </span>

                                    <strong className="mt-2 block">
                                        {event.level ||
                                            "Tüm seviyeler"}
                                    </strong>
                                </div>

                                {showEventText && (
                                    <div className="py-5">
                                        <span className="block text-xs uppercase tracking-wider text-ink-soft">
                                            Katılımcı
                                        </span>

                                        <strong className="mt-2 block">
                                            {event.participant_count}

                                            {event.capacity !== null
                                                ? ` / ${event.capacity}`
                                                : " kişi"}
                                        </strong>
                                    </div>
                                )}

                                <div className="py-5">
                                    <span className="block text-xs uppercase tracking-wider text-ink-soft">
                                        Ücret
                                    </span>

                                    <strong className="mt-2 block">
                                        {event.is_free
                                            ? "Ücretsiz"
                                            : `${event.fee_amount} ${event.currency}`}
                                    </strong>

                                    {event.price_note && (
                                        <p className="mt-2 text-sm leading-6 text-ink-soft">
                                            {event.price_note}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {canRegister ? (
                                user ? (
                                    <QuickJoinButton
                                        eventId={event.id}
                                        eventTitle={
                                            event.title
                                        }
                                        alreadyRegistered={
                                            alreadyRegistered
                                        }
                                        variant="inline"
                                    />
                                ) : (
                                    <Link
                                        href={`/join?event=${event.slug}`}
                                        className="mt-8 flex h-14 w-full items-center justify-center rounded-full bg-holly text-sm font-semibold uppercase tracking-wider text-ink transition active:scale-[0.98] hover:bg-[#1fc461]"
                                    >
                                        Etkinliğe katıl
                                    </Link>
                                )
                            ) : (
                                <div className="mt-8 rounded-2xl border border-line bg-white px-5 py-4 text-center text-sm text-ink-soft">
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
                    <section className="bg-shell px-6 py-24 text-ink md:px-10 lg:px-16">
                        <div className="mx-auto max-w-7xl">
                            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-holly-ink">
                                Etkinlik Galerisi
                            </span>

                            <h2 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
                                Etkinlikten kareler
                            </h2>

                            <div className="mt-12 grid auto-rows-[300px] gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {galleryImages.map(
                                    (image, index) => (
                                        <article
                                            key={image.id}
                                            className={`relative overflow-hidden rounded-2xl ${
                                                index === 0
                                                    ? "lg:col-span-2 lg:row-span-2"
                                                    : ""
                                            }`}
                                        >
                                            {image.url && (
                                                <Image
                                                    src={
                                                        image.url
                                                    }
                                                    alt={
                                                        image.alt_text ??
                                                        `${event.title} etkinlik fotoğrafı`
                                                    }
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                    className="object-cover transition-transform duration-700 hover:scale-105"
                                                />
                                            )}

                                            {image.caption && (
                                                <>
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                                                    <p className="absolute inset-x-0 bottom-0 p-5 text-sm text-white">
                                                        {
                                                            image.caption
                                                        }
                                                    </p>
                                                </>
                                            )}
                                        </article>
                                    ),
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {!isPast && (
                    <section className="bg-holly px-6 py-20 text-ink md:px-10 lg:px-16">
                        <div className="mx-auto max-w-7xl">
                            <span className="text-sm font-semibold uppercase tracking-[0.3em]">
                                Holly Sport
                            </span>

                            <h2 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
                                Bu deneyimin bir parçası ol.
                            </h2>
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </>
    );
}