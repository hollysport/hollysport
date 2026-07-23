import Image from "next/image";

const managementTeam = [
    {
        name: "İdris Dirican",
        roles: [
            "Genel Topluluk Yöneticisi",
            "Ulaşım ve Lojistik",
            "Etkinlik ve Operasyon Koordinatörü",
            "Finans ve Kaynak Geliştirme Sorumlusu",
        ],
        description:
            "Topluluk akışını, ulaşım ve lojistik süreçlerini, etkinlik operasyonlarını ve kaynak geliştirme çalışmalarını koordine eder.",
        image: "/images/team/idris-dirican.jpg",
        instagram: "idris_dirican",
    },
    {
        name: "İlayda Nur Kaynak",
        roles: [
            "Genel Topluluk Yöneticisi",
            "Etkinlik ve Operasyon Koordinatörü",
            "Sosyal Medya",
            "Fotoğraf ve Video Sorumlusu",
        ],
        description:
            "Etkinlik operasyonları, topluluk iletişimi, sosyal medya içerikleri ve fotoğraf-video süreçlerinde aktif rol alır.",
        image: "/images/team/ilayda-nur-kaynak.jpg",
        instagram: "ilaydanurkaynak",
    },
    {
        name: "Mert Coşkun",
        roles: [
            "Etkinlik ve Operasyon Koordinatörü",
            "Topluluk Yöneticisi",
            "Sponsorluk ve İş Birlikleri",
        ],
        description:
            "Etkinlik süreçlerinin yürütülmesi, topluluk koordinasyonu ve sponsorluk iş birliklerinin geliştirilmesinde görev alır.",
        image: "/images/team/mert-coskun.jpg",
        instagram: "mertcoskun.13",
    },
    {
        name: "Alper Tunga",
        roles: [
            "Etkinlik ve Operasyon Koordinatörü",
            "Topluluk Yöneticisi",
            "Sponsorluk ve İş Birlikleri",
        ],
        description:
            "Etkinlik organizasyonu, topluluk yönetimi ve iş birliği süreçlerinin yürütülmesine katkı sağlar.",
        image: "/images/team/alper-tunga.jpg",
        instagram: "alpertungakr",
    },
    {
        name: "Özgü Öncül",
        roles: [
            "Etkinlik ve Operasyon Koordinatörü",
            "Topluluk Yöneticisi",
            "İletişim ve Sosyal Medya",
            "Öğrenci Temsilcisi",
        ],
        description:
            "Topluluk iletişimi, sosyal medya süreçleri, etkinlik operasyonları ve öğrenci bağlantılarında aktif sorumluluk üstlenir.",
        image: "/images/team/ozgu-oncul.jpg",
        instagram: "o.oncl",
    },
    {
        name: "Ahmet Ali",
        roles: [
            "Topluluk Yöneticisi",
            "Etkinlik ve Operasyon Koordinatörü",
            "Öğrenci Temsilcisi",
        ],
        description:
            "Topluluk yönetimi, etkinlik operasyonları ve öğrenci katılım süreçlerinde görev alır.",
        image: "/images/team/ahmet-ali.jpg",
        instagram: "ahmetali_2727",
    },
    {
        name: "Kerem Özer",
        roles: [
            "Topluluk Yöneticisi",
            "Etkinlik ve Operasyon Koordinatörü",
            "Müzik ve Eğlence Koordinatörü",
        ],
        description:
            "Etkinlik akışı, topluluk koordinasyonu ve müzik-eğlence deneyiminin planlanmasında görev üstlenir.",
        image: "/images/team/kerem-ozer.jpg",
        instagram: "keremozerist",
    },
    {
        name: "Eray Ünsal",
        roles: [
            "Topluluk Yöneticisi",
            "Etkinlik ve Operasyon Koordinatörü",
            "Sponsorluk ve İş Birlikleri",
        ],
        description:
            "Topluluk yönetimi, etkinlik operasyonları ve sponsorluk ilişkilerinin geliştirilmesinde destek verir.",
        image: "/images/team/eray-unsal.jpg",
        instagram: "eraypluss",
    },
];

function InstagramIcon({
    className = "h-5 w-5",
}: {
    className?: string;
}) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect
                width="18"
                height="18"
                x="3"
                y="3"
                rx="5"
                ry="5"
            />

            <circle cx="12" cy="12" r="4" />

            <circle
                cx="17.5"
                cy="6.5"
                r="1"
                fill="currentColor"
                stroke="none"
            />
        </svg>
    );
}

export default function FounderTeam() {
    return (
        <section className="overflow-hidden bg-[#050505] px-6 pb-24 pt-16 text-white lg:px-8 lg:pb-32 lg:pt-24">
            <div className="mx-auto max-w-7xl">
                <header className="mb-16 max-w-3xl lg:mb-24">
                    <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#27D66B]">
                        Ekibimiz
                    </p>

                    <h1 className="mt-5 text-5xl font-extrabold tracking-[-0.05em] sm:text-6xl lg:text-7xl">
                        Holly Sport’u birlikte büyütüyoruz.
                    </h1>

                    <p className="mt-6 text-lg leading-8 text-white/50 sm:text-xl">
                        Topluluğun kuruluş hikâyesini ve etkinliklerden
                        iletişime kadar tüm süreçleri gönüllülük ruhuyla
                        yürüten yönetim kadromuzu tanıyın.
                    </p>
                </header>

                <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
                    <div className="relative">
                        <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#111111]">
                            <Image
                                src="/images/team/umut-kucuk.jpg"
                                alt="Holly Sport kurucusu Umut Küçük"
                                fill
                                priority
                                sizes="(max-width: 1024px) 100vw, 45vw"
                                className="object-cover"
                            />

                            <div
                                aria-hidden="true"
                                className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"
                            />

                            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                                <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#27D66B]">
                                    Holly Sport
                                </p>

                                <p className="mt-2 text-xl font-bold text-white">
                                    Kurucu
                                </p>
                            </div>
                        </div>

                        <div
                            aria-hidden="true"
                            className="absolute -bottom-8 -right-8 -z-10 h-48 w-48 rounded-full bg-[#27D66B]/15 blur-3xl"
                        />
                    </div>

                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#27D66B]">
                            Kurucumuz
                        </p>

                        <h2 className="mt-5 text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                            Umut Küçük
                        </h2>

                        <p className="mt-3 text-lg font-semibold text-white/45">
                            Holly Sport Kurucusu
                        </p>

                        <div className="mt-8 space-y-5 text-base leading-8 text-white/60 sm:text-lg">
                            <p>
                                Holly Sport’u kurma yolculuğum, spor
                                aracılığıyla kendi sosyal çevremi oluşturma
                                fikriyle başladı. Küçük bir arkadaş grubuyla
                                birlikte antrenman yaparken paylaşımlarımız
                                arttı, dostluklarımız güçlendi ve zamanla
                                aramıza yeni insanlar katıldı. Böylece sporun
                                yalnızca fiziksel bir aktivite değil,
                                insanları bir araya getiren güçlü bir bağ
                                olduğunu daha iyi gördüm.
                            </p>

                            <p>
                                Bugün Holly Sport ile daha fazla insanı
                                hareket etmeye teşvik etmeyi, spor kültürünü
                                erişilebilir hâle getirmeyi ve insanların
                                yalnızca fiziksel değil, mental ve sosyal
                                açıdan da güçlenmesine katkı sağlamayı
                                amaçlıyorum.
                            </p>

                            <p>
                                Ülkemizde gençlere ve sporculara yeni
                                imkânlar sunmak, güçlü iş birlikleri kurmak
                                ve daha fazla hayata dokunmak en büyük
                                motivasyonum.
                            </p>
                        </div>

                        <blockquote className="mt-9 border-l-2 border-[#27D66B] pl-6 text-xl font-semibold leading-9 text-white sm:text-2xl">
                            “Sporun insanları dönüştüren ve bir araya
                            getiren gücüne inanıyorum.”
                        </blockquote>

                        <div className="mt-8">
                            <a
                                href="https://www.instagram.com/umutzip"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Umut Küçük Instagram"
                                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:border-[#27D66B]/40 hover:bg-[#27D66B]/10 hover:text-[#27D66B]"
                            >
                                <InstagramIcon />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-28 border-t border-white/10 pt-20">
                    <div className="max-w-3xl">
                        <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#27D66B]">
                            Yönetim Kadromuz
                        </p>

                        <h2 className="mt-5 text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl">
                            Birlikte hareket eden ekip
                        </h2>

                        <p className="mt-5 text-lg leading-8 text-white/45">
                            Holly Sport’un etkinlik, iletişim, operasyon ve
                            topluluk süreçlerini birlikte yürüten yönetim
                            ekibimiz.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {managementTeam.map((member) => (
                            <article
                                key={member.name}
                                className="group flex h-full flex-col rounded-[2rem] border border-white/10 bg-[#111111] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#27D66B]/30"
                            >
                                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-white/[0.04]">
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                                        className="object-cover transition duration-500 group-hover:scale-105"
                                    />
                                </div>

                                <div className="flex flex-1 flex-col px-1 pb-2 pt-6">
                                    <h3 className="text-xl font-bold">
                                        {member.name}
                                    </h3>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {member.roles.map((role) => (
                                            <span
                                                key={role}
                                                className="rounded-full border border-[#27D66B]/20 bg-[#27D66B]/10 px-3 py-1 text-xs font-semibold leading-5 text-[#27D66B]"
                                            >
                                                {role}
                                            </span>
                                        ))}
                                    </div>

                                    <p className="mt-5 flex-1 text-sm leading-7 text-white/45">
                                        {member.description}
                                    </p>

                                    <div className="mt-6">
                                        <a
                                            href={`https://www.instagram.com/${member.instagram}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={`${member.name} Instagram`}
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/45 transition hover:border-[#27D66B]/40 hover:bg-[#27D66B]/10 hover:text-[#27D66B]"
                                        >
                                            <InstagramIcon className="h-4 w-4" />
                                        </a>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}