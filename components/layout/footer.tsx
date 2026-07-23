import Link from "next/link";

const navigationLinks = [
    { label: "Ana Sayfa", href: "/" },
    { label: "Hakkımızda", href: "/about" },
    { label: "Ekibimiz", href: "/team" },
    { label: "Etkinlikler", href: "/events" },
    { label: "Branşlar", href: "/sports" },
    { label: "Galeri", href: "/gallery" },
    { label: "Sıkça Sorulan Sorular", href: "/#faq" },
    { label: "İletişim", href: "/contact" },
    { label: "Topluluğa Katıl", href: "/join" },
    { label: "Destek Ol", href: "/destek-ol" },
];

const socialLinks = [
    {
        label: "Instagram",
        href: "https://www.instagram.com/hollysprt",
    },
];

const legalLinks = [
    { label: "KVKK", href: "/kvkk" },
    { label: "Gizlilik Politikası", href: "/privacy" },
    { label: "Kullanım Koşulları", href: "/terms" },
];

export default function Footer() {
    return (
        <footer className="bg-[#050505] px-6 pb-8 pt-20 text-white md:px-10 lg:px-16">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-14 border-b border-white/10 pb-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
                    <div>
                        <Link
                            href="/"
                            className="inline-block text-3xl font-bold uppercase tracking-tight"
                        >
                            Holly
                            <span className="text-[#27D66B]">
                                Sport
                            </span>
                        </Link>

                        <p className="mt-6 max-w-sm text-base leading-7 text-white/50">
                            Sporun birleştirici gücüyle insanları aynı
                            sahada buluşturan bağımsız ve gönüllülük
                            esaslı spor topluluğu.
                        </p>

                        <a
                            href="mailto:iletisim@hollysport.net"
                            className="mt-6 inline-block text-sm font-semibold text-[#27D66B] transition hover:text-[#45e27f]"
                        >
                            iletisim@hollysport.net
                        </a>
                    </div>

                    <div>
                        <h3 className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-white/35">
                            Menü
                        </h3>

                        <nav className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-1">
                            {navigationLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="text-sm text-white/65 transition-colors hover:text-[#27D66B]"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div>
                        <h3 className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-white/35">
                            Sosyal
                        </h3>

                        <div className="flex flex-col items-start gap-4">
                            {socialLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-2 text-base text-white/65 transition-colors hover:text-[#27D66B]"
                                >
                                    {link.label}

                                    <span className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                                        ↗
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-5 pt-8 text-sm text-white/30 lg:flex-row lg:items-center lg:justify-between">
                    <p>
                        © {new Date().getFullYear()} Holly Sport. Tüm
                        hakları saklıdır.
                    </p>

                    <div className="flex flex-wrap gap-x-6 gap-y-3">
                        {legalLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="transition-colors hover:text-white"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}