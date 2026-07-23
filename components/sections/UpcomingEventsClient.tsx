"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import {
    motion,
    useReducedMotion,
    type Variants,
} from "framer-motion";

import type { UpcomingEventView } from "@/components/sections/UpcomingEvents";

type UpcomingEventsClientProps = {
    events: UpcomingEventView[];
    errorMessage: string | null;
};

const sectionVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 26,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

const listVariants: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12,
        },
    },
};

const eventVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 24,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
        },
    },
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
    const shouldReduceMotion = useReducedMotion();

    return (
        <section className="overflow-hidden bg-[#050505] px-6 py-24 text-[#F5F5F5] md:px-10 lg:px-16">
            <div className="mx-auto max-w-7xl">
                <motion.div
                    variants={sectionVariants}
                    initial={shouldReduceMotion ? false : "hidden"}
                    whileInView="visible"
                    viewport={{
                        once: true,
                        amount: 0.25,
                    }}
                    className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end"
                >
                    <div>
                        <span className="mb-4 block text-sm font-semibold uppercase tracking-[0.3em] text-[#27D66B]">
                            Takvime Katıl
                        </span>

                        <h2 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
                            Sıradaki etkinliklerde
                            <span className="text-[#27D66B]">
                                {" "}
                                yerini al.
                            </span>
                        </h2>
                    </div>

                    <motion.div
                        whileTap={{
                            scale: 0.96,
                        }}
                        className="w-fit"
                    >
                        <Link
                            href="/events"
                            className="group inline-flex min-h-11 items-center gap-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:text-[#27D66B]"
                        >
                            Tüm etkinlikler

                            <ArrowRight
                                aria-hidden="true"
                                strokeWidth={2.2}
                                className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-1"
                            />
                        </Link>
                    </motion.div>
                </motion.div>

                {errorMessage && (
                    <motion.div
                        initial={
                            shouldReduceMotion
                                ? false
                                : {
                                    opacity: 0,
                                    y: 16,
                                }
                        }
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300"
                    >
                        {errorMessage}
                    </motion.div>
                )}

                {!errorMessage && events.length === 0 && (
                    <motion.div
                        initial={
                            shouldReduceMotion
                                ? false
                                : {
                                    opacity: 0,
                                    y: 20,
                                }
                        }
                        whileInView={{
                            opacity: 1,
                            y: 0,
                        }}
                        viewport={{
                            once: true,
                            amount: 0.4,
                        }}
                        transition={{
                            duration: 0.65,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center"
                    >
                        <h3 className="text-2xl font-semibold">
                            Yeni etkinlik hazırlanıyor.
                        </h3>

                        <p className="mt-3 text-white/40">
                            Yaklaşan etkinlikler yayınlandığında burada
                            görünecek.
                        </p>
                    </motion.div>
                )}

                {events.length > 0 && (
                    <motion.div
                        variants={listVariants}
                        initial={shouldReduceMotion ? false : "hidden"}
                        whileInView="visible"
                        viewport={{
                            once: true,
                            amount: 0.08,
                        }}
                        className="divide-y divide-white/10 border-y border-white/10"
                    >
                        {events.map((event) => {
                            const isFull =
                                event.capacity !== null &&
                                event.participant_count >= event.capacity;

                            const registrationLabel = isFull
                                ? "Kontenjan dolu"
                                : event.registration_open
                                    ? "Kayıt açık"
                                    : "Kayıt kapalı";

                            return (
                                <motion.div
                                    key={event.id}
                                    variants={eventVariants}
                                    whileTap={{
                                        scale: 0.985,
                                    }}
                                >
                                    <Link
                                        href={`/events/${event.slug}`}
                                        className="group grid gap-6 py-8 transition-colors duration-300 md:grid-cols-[100px_120px_1fr_auto] md:items-center md:px-6 md:hover:bg-[#111111]"
                                    >
                                        <div className="flex items-end gap-3">
                                            <span className="text-5xl font-bold leading-none text-[#27D66B]">
                                                {getDay(event.starts_at)}
                                            </span>

                                            <span className="pb-1 text-sm font-semibold uppercase tracking-wider text-white/50">
                                                {getMonth(event.starts_at)}
                                            </span>
                                        </div>

                                        <div className="relative hidden h-20 overflow-hidden rounded-xl bg-white/5 md:block">
                                            {event.image_url ? (
                                                <div
                                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out will-change-transform md:group-hover:scale-110"
                                                    style={{
                                                        backgroundImage: `url("${event.image_url}")`,
                                                    }}
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-br from-[#27D66B]/30 to-black" />
                                            )}

                                            <div className="absolute inset-0 bg-black/10" />
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
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${event.registration_open &&
                                                            !isFull
                                                            ? "bg-[#27D66B]/15 text-[#27D66B]"
                                                            : "bg-white/10 text-white/40"
                                                        }`}
                                                >
                                                    {registrationLabel}
                                                </span>
                                            </div>

                                            <h3 className="text-2xl font-semibold transition-colors duration-300 md:text-3xl md:group-hover:text-[#27D66B]">
                                                {event.title}
                                            </h3>

                                            <p className="mt-2 text-sm leading-6 text-white/50">
                                                {event.location} ·{" "}
                                                {getFullDate(
                                                    event.starts_at,
                                                )}
                                            </p>
                                        </div>

                                        <span className="holly-arrow-button flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white md:group-hover:border-[#27D66B] md:group-hover:bg-[#27D66B] md:group-hover:text-black">
                                            <ArrowUpRight
                                                aria-hidden="true"
                                                strokeWidth={2.2}
                                                className="holly-arrow-icon h-5 w-5"
                                            />
                                        </span>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}

                <motion.div
                    initial={
                        shouldReduceMotion
                            ? false
                            : {
                                opacity: 0,
                                y: 16,
                            }
                    }
                    whileInView={{
                        opacity: 1,
                        y: 0,
                    }}
                    viewport={{
                        once: true,
                        amount: 0.5,
                    }}
                    transition={{
                        duration: 0.6,
                        delay: 0.15,
                    }}
                    className="mt-8 flex flex-col gap-5 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                    <span className="text-white/30">
                        {events.length} yaklaşan etkinlik gösteriliyor
                    </span>

                    <Link
                        href="/events"
                        className="group inline-flex w-fit items-center gap-2 font-semibold uppercase tracking-wider text-white/60 transition-colors hover:text-[#27D66B]"
                    >
                        Etkinlik takvimi

                        <ArrowRight
                            aria-hidden="true"
                            strokeWidth={2.2}
                            className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-1"
                        />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}