"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

const events = [
    {
        title: "At Binme Etkinliği",
        category: "Binicilik",
        location: "İstanbul",
        image: "/images/home-events/at-binme.JPG",
        href: "/gallery",
    },
    {
        title: "Ballıkayalar Tırmanış Etkinliği",
        category: "Tırmanış",
        location: "Gebze",
        image: "/images/home-events/ballikayalar-tirmanis.jpeg",
        href: "/gallery",
    },
    {
        title: "Büyükada Gezisi",
        category: "Gezi",
        location: "Büyükada",
        image: "/images/home-events/buyukada-gezi.jpg",
        href: "/gallery",
    },
    {
        title: "Şile Doğa Yürüyüşü",
        category: "Hiking",
        location: "Şile",
        image: "/images/home-events/hiking.jpg",
        href: "/gallery?branch=trekkinghiking",
    },
    {
        title: "Kâğıt Yapım Atölyesi",
        category: "Atölye",
        location: "İstanbul",
        image: "/images/home-events/kagit-yapim-atolyesi.jpg",
        href: "/gallery",
    },
    {
        title: "Uludağ Kayak Etkinliği",
        category: "Kayak",
        location: "Uludağ",
        image: "/images/home-events/kayak-etkinligi.jpg",
        href: "/gallery?branch=kayak",
    },
    {
        title: "Koşamayanlar İçin Koştuk",
        category: "Wings for Life World Run",
        location: "Kuruçeşme Sahili",
        image: "/images/home-events/kosamayanlar-icin-kostuk.jpeg",
        href: "/gallery?branch=kosu",
    },
    {
        title: "Bursa Safari Etkinliği",
        category: "Safari",
        location: "Bursa",
        image: "/images/home-events/bursa-safari.jpeg",
        href: "/gallery",
    },
    {
        title: "Voleybol Turnuvası",
        category: "Voleybol",
        location: "Ataköy",
        image: "/images/home-events/voleybol-turnuvasi.jpg",
        href: "/gallery?branch=turnuvalar",
    },
    {
        title: "Yamaç Paraşütü",
        category: "Macera",
        location: "Çatalca",
        image: "/images/home-events/yamac-parasutu.jpeg",
        href: "/gallery",
    },
];

export default function EventMarquee() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const updateScrollButtons = useCallback(() => {
        const container = scrollContainerRef.current;

        if (!container) {
            return;
        }

        const maximumScroll =
            container.scrollWidth - container.clientWidth;

        setCanScrollLeft(container.scrollLeft > 8);
        setCanScrollRight(
            container.scrollLeft < maximumScroll - 8,
        );
    }, []);

    useEffect(() => {
        const container = scrollContainerRef.current;

        if (!container) {
            return;
        }

        updateScrollButtons();

        container.addEventListener(
            "scroll",
            updateScrollButtons,
            {
                passive: true,
            },
        );

        window.addEventListener(
            "resize",
            updateScrollButtons,
        );

        return () => {
            container.removeEventListener(
                "scroll",
                updateScrollButtons,
            );

            window.removeEventListener(
                "resize",
                updateScrollButtons,
            );
        };
    }, [updateScrollButtons]);

    function scrollCards(direction: "left" | "right") {
        const container = scrollContainerRef.current;

        if (!container) {
            return;
        }

        const cardWidth =
            window.innerWidth < 640 ? 266 : 306;

        container.scrollBy({
            left:
                direction === "right"
                    ? cardWidth
                    : -cardWidth,
            behavior: "smooth",
        });
    }

    return (
        <section className="overflow-hidden bg-[#050505] py-16 sm:py-20">
            <div className="mx-auto mb-10 flex max-w-7xl flex-col justify-between gap-6 px-6 md:flex-row md:items-end lg:px-8">
                <div>
                    <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#27D66B]">
                        Holly Sport deneyimleri
                    </p>

                    <h2 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-5xl">
                        Her hafta yeni bir hareket.
                    </h2>
                </div>

                <Link
                    href="/gallery"
                    className="inline-flex min-h-12 w-fit items-center justify-center rounded-full border border-white/15 px-6 text-sm font-semibold text-white transition hover:border-[#27D66B] hover:text-[#27D66B]"
                >
                    Tüm Galeriyi Gör
                </Link>
            </div>

            <div className="relative">
                <button
                    type="button"
                    onClick={() => scrollCards("left")}
                    disabled={!canScrollLeft}
                    aria-label="Önceki etkinlikleri göster"
                    className="absolute left-3 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/80 text-white shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-md transition hover:border-[#27D66B] hover:bg-[#27D66B] hover:text-black active:scale-95 disabled:pointer-events-none disabled:opacity-25 sm:left-6 sm:h-14 sm:w-14"
                >
                    <ChevronLeft
                        aria-hidden="true"
                        strokeWidth={2.5}
                        className="h-6 w-6 sm:h-7 sm:w-7"
                    />
                </button>

                <div
                    ref={scrollContainerRef}
                    className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-6 pb-4 touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:px-[max(2rem,calc((100vw-80rem)/2))]"
                >
                    {events.map((event) => (
                        <Link
                            key={event.title}
                            href={event.href}
                            className="group relative flex h-[290px] w-[250px] shrink-0 snap-start overflow-hidden rounded-[26px] border border-white/10 bg-[#111111] shadow-[0_16px_45px_rgba(0,0,0,0.35)] transition active:scale-[0.98] sm:h-[330px] sm:w-[290px] md:hover:-translate-y-1 md:hover:border-[#27D66B]/50"
                        >
                            <Image
                                src={event.image}
                                alt={`${event.title} etkinliği`}
                                fill
                                sizes="(max-width: 640px) 250px, 290px"
                                className="object-cover transition-transform duration-700 md:group-hover:scale-105"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/5 transition duration-500 md:group-hover:via-black/35" />

                            <div className="relative z-10 flex w-full flex-col justify-between p-5">
                                <span className="w-fit rounded-full border border-white/15 bg-black/30 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                                    {event.category}
                                </span>

                                <div>
                                    <p className="text-sm text-white/65">
                                        {event.location}
                                    </p>

                                    <h3 className="mt-2 text-2xl font-extrabold leading-tight tracking-[-0.04em] text-white sm:text-3xl">
                                        {event.title}
                                    </h3>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => scrollCards("right")}
                    disabled={!canScrollRight}
                    aria-label="Sonraki etkinlikleri göster"
                    className="absolute right-3 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/80 text-white shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-md transition hover:border-[#27D66B] hover:bg-[#27D66B] hover:text-black active:scale-95 disabled:pointer-events-none disabled:opacity-25 sm:right-6 sm:h-14 sm:w-14"
                >
                    <ChevronRight
                        aria-hidden="true"
                        strokeWidth={2.5}
                        className="h-6 w-6 sm:h-7 sm:w-7"
                    />
                </button>
            </div>
        </section>
    );
}