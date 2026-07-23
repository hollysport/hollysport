import Image from "next/image";
import Link from "next/link";

export default function Hero() {
    return (
        <section className="relative flex min-h-screen items-end overflow-hidden bg-[#050505]">
            <Image
                src="/images/hero-background.jpg"
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover object-center scale-[1.03]"
            />

            <div
                aria-hidden="true"
                className="absolute inset-0 bg-black/35"
            />

            <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/15"
            />

            <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/15"
            />

            <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(39,214,107,0.16),transparent_35%)]"
            />

            <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-16 pt-40 sm:pb-20 lg:px-8 lg:pb-24">
                <p className="mb-5 text-sm font-bold uppercase tracking-[0.24em] text-[#27D66B]">
                    Holly Sport Topluluğu
                </p>

                <h1 className="max-w-5xl text-5xl font-extrabold leading-[0.95] tracking-[-0.05em] text-white sm:text-6xl lg:text-8xl">
                    Engelleri kaldırıyoruz.
                </h1>

                <p className="mt-7 max-w-xl text-lg leading-8 text-white/70 sm:text-xl">
                    Holly varsa engel yok! Sporu herkes için ulaşılabilir hâle
                    getiriyor, hareketin birleştirici gücüyle güçlü bir topluluk
                    oluşturuyoruz.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                    <a
                        href="https://chat.whatsapp.com/LEHiMPxVmsC7lGB0zvjoJK"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-7 py-3 text-sm font-bold text-[#050505] transition hover:scale-[1.02] hover:bg-[#3be47a]"
                    >
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 32 32"
                            className="h-5 w-5 fill-current"
                        >
                            <path d="M16.04 3C8.86 3 3.02 8.8 3.02 15.94c0 2.28.6 4.51 1.74 6.47L3 29l6.77-1.75a13.07 13.07 0 0 0 6.26 1.59h.01c7.17 0 13.01-5.81 13.01-12.95C29.05 8.8 23.21 3 16.04 3Zm0 23.66h-.01a10.86 10.86 0 0 1-5.53-1.51l-.4-.24-4.02 1.04 1.07-3.9-.26-.4a10.72 10.72 0 0 1-1.67-5.71c0-5.94 4.85-10.77 10.82-10.77 5.96 0 10.81 4.83 10.81 10.77 0 5.95-4.85 10.72-10.81 10.72Zm5.93-8.07c-.32-.16-1.92-.94-2.22-1.05-.3-.11-.52-.16-.74.16-.21.32-.84 1.05-1.03 1.27-.19.21-.38.24-.7.08-.33-.16-1.38-.5-2.62-1.61a9.87 9.87 0 0 1-1.82-2.25c-.19-.32-.02-.5.14-.66.15-.14.33-.37.49-.56.16-.18.22-.32.33-.53.11-.21.05-.4-.03-.56-.08-.16-.73-1.75-1.01-2.39-.26-.63-.53-.54-.74-.55h-.63c-.22 0-.57.08-.87.4-.3.32-1.14 1.11-1.14 2.71 0 1.59 1.17 3.13 1.33 3.35.16.21 2.3 3.5 5.57 4.91.78.33 1.39.53 1.86.68.78.25 1.49.21 2.05.13.63-.09 1.92-.78 2.19-1.54.27-.75.27-1.39.19-1.53-.08-.13-.3-.21-.62-.37Z" />
                        </svg>

                        Topluluğa Katıl
                    </a>

                    <Link
                        href="/events"
                        className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/10"
                    >
                        Etkinlikleri Keşfet
                    </Link>
                </div>
            </div>
        </section>
    );
}