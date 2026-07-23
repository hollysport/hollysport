import Image from "next/image";
import Link from "next/link";

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

function EventCards({ hidden = false }: { hidden?: boolean }) {
    return (
        <div className="marquee-group" aria-hidden={hidden}>
            {events.map((event) => (
                <Link
                    key={`${event.title}-${hidden}`}
                    href={event.href}
                    tabIndex={hidden ? -1 : undefined}
                    className="group relative flex h-[290px] w-[250px] shrink-0 overflow-hidden rounded-[26px] border border-white/10 bg-[#111111] sm:h-[330px] sm:w-[290px]"
                >
                    <Image
                        src={event.image}
                        alt={`${event.title} etkinliği`}
                        fill
                        sizes="(max-width: 640px) 250px, 290px"
                        className="object-cover transition duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/5 transition duration-500 group-hover:via-black/35" />

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
    );
}

export default function EventMarquee() {
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

            <div className="marquee-row">
                <div className="marquee-track">
                    <EventCards />
                    <EventCards hidden />
                </div>
            </div>
        </section>
    );
}