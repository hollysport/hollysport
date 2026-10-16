import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import type { UpcomingEventView } from "@/components/sections/UpcomingEvents";

type UpcomingEventsClientProps = {
    events: UpcomingEventView[];
    errorMessage: string | null;
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

export default function UpcomingEventsClient({
    events,
    errorMessage,
}: UpcomingEventsClientProps) {
    return (
        <section className="overflow-hidden bg-white px-6 py-24 text-ink md:px-10 lg:px-16">
            <div className="mx-auto max-w-7xl">
                <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <span className="mb-4 block text-sm font-bold uppercase tracking-[0.24em] text-holly-ink">
                            Takvime Katıl
                        </span>

                        <h2 className="max-w-3xl text-4xl font-extrabold tracking-tight md:text-6xl">
                            Sıradaki etkinliklerde
                            <span className="text-holly-ink">
                                {" "}
                                yerini al.
                            </span>
                        </h2>
                    </div>

                    <div className="w-fit">
                        <Link
                            href="/events"
                            className="group inline-flex min-h-11 items-center gap-3 text-sm font-semibold uppercase tracking-wider text-ink transition hover:text-holly-ink"
                        >
                            Tüm etkinlikler

                            <ArrowRight
                                aria-hidden="true"
                                strokeWidth={2.2}
                                className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-1"
                            />
                        </Link>
                    </div>
                </div>

                {errorMessage && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                        {errorMessage}
                    </div>
                )}

                {!errorMessage && events.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-line bg-shell px-6 py-16 text-center">
                        <h3 className="text-2xl font-semibold">
                            Yeni etkinlik hazırlanıyor.
                        </h3>

                        <p className="mt-3 text-ink-soft">
                            Yaklaşan etkinlikler yayınlandığında burada
                            görünecek.
                        </p>
                    </div>
                )}

                {events.length > 0 && (
                    <div className="space-y-4">
                        {events.map((event) => {
                            const isFull =
                                event.capacity !== null &&
                                event.participant_count >=
                                    event.capacity;

                            const registrationLabel = isFull
                                ? "Kontenjan dolu"
                                : event.registration_open
                                  ? "Kayıt açık"
                                  : "Kayıt kapalı";

                            return (
                                <div
                                    key={event.id}
                                    className="overflow-hidden rounded-[1.75rem] border border-line bg-shell transition duration-300 md:hover:-translate-y-1 md:hover:border-[#27D66B]/45"
                                >
                                    <Link
                                        href={`/events/${event.slug}`}
                                        className="group grid gap-6 p-6 md:grid-cols-[100px_120px_1fr_auto] md:items-center md:px-7 md:py-6"
                                    >
                                        <div className="flex items-center gap-4 md:items-end md:gap-3">
                                            <div className="flex h-16 min-w-16 items-center justify-center rounded-2xl border border-[#27D66B]/20 bg-[#27D66B]/10 md:h-auto md:min-w-0 md:rounded-none md:border-0 md:bg-transparent">
                                                <span className="text-4xl font-bold leading-none text-holly-ink md:text-5xl">
                                                    {getDay(
                                                        event.starts_at,
                                                    )}
                                                </span>
                                            </div>

                                            <span className="text-sm font-semibold uppercase tracking-wider text-ink-soft md:pb-1">
                                                {getMonth(
                                                    event.starts_at,
                                                )}
                                            </span>
                                        </div>

                                        <div className="relative hidden h-20 overflow-hidden rounded-2xl border border-line bg-white md:block">
                                            {event.image_url ? (
                                                <Image
                                                    src={event.image_url}
                                                    alt={`${event.title} etkinlik görseli`}
                                                    fill
                                                    sizes="120px"
                                                    className="object-cover transition-transform duration-700 ease-out will-change-transform md:group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-br from-[#27D66B]/30 via-white to-line" />
                                            )}

                                            <div className="absolute inset-0 bg-black/10 transition-colors duration-300 md:group-hover:bg-black/0" />
                                        </div>

                                        <div>
                                            <div className="mb-3 flex flex-wrap gap-2">
                                                <span className="rounded-full border border-line bg-white px-3 py-1 text-xs uppercase tracking-wider text-ink-soft">
                                                    {event.category}
                                                </span>

                                                <span className="rounded-full border border-line bg-white px-3 py-1 text-xs uppercase tracking-wider text-ink-soft">
                                                    {getTime(
                                                        event.starts_at,
                                                    )}
                                                </span>

                                                <span
                                                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                                                        event.registration_open &&
                                                        !isFull
                                                            ? "border-[#27D66B]/20 bg-[#27D66B]/15 text-holly-ink"
                                                            : "border-line bg-white text-ink-soft"
                                                    }`}
                                                >
                                                    {registrationLabel}
                                                </span>
                                            </div>

                                            <h3 className="text-2xl font-semibold transition-colors duration-300 md:text-3xl md:group-hover:text-holly-ink">
                                                {event.title}
                                            </h3>

                                            <p className="mt-2 text-sm leading-6 text-ink-soft">
                                                {event.location} ·{" "}
                                                {getFullDate(
                                                    event.starts_at,
                                                )}
                                            </p>
                                        </div>

                                        <span className="holly-arrow-button flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink md:group-hover:border-[#27D66B] md:group-hover:bg-[#27D66B] md:group-hover:text-ink">
                                            <ArrowUpRight
                                                aria-hidden="true"
                                                strokeWidth={2.2}
                                                className="holly-arrow-icon h-5 w-5"
                                            />
                                        </span>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}

                <p className="mt-8 text-sm text-ink-soft">
                    {events.length} yaklaşan etkinlik gösteriliyor
                </p>
            </div>
        </section>
    );
}
