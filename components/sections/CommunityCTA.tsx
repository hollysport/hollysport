import Link from "next/link";

export default function CommunityCTA() {
    return (
        <section className="bg-[#27D66B] px-6 py-24 text-black md:px-10 lg:px-16">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div>
                        <span className="mb-6 block text-sm font-semibold uppercase tracking-[0.3em]">
                            Holly Sport Topluluğu
                        </span>

                        <h2 className="max-w-5xl text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
                            Oyunun dışında
                            <br />
                            kalma.
                        </h2>

                        <p className="mt-8 max-w-xl text-base leading-7 text-black/65 md:text-lg">
                            Etkinliklere katıl, yeni insanlarla tanış ve sporun birleştirici
                            gücünü Holly Sport topluluğuyla birlikte yaşa.
                        </p>
                    </div>

                    <Link
                        href="/join"
                        className="group flex h-40 w-40 shrink-0 items-center justify-center rounded-full bg-black text-center text-sm font-semibold uppercase tracking-wider text-white transition-transform duration-300 hover:scale-105 md:h-48 md:w-48"
                    >
                        <span>
                            Topluluğa
                            <br />
                            Katıl
                            <span className="mt-2 block text-xl transition-transform duration-300 group-hover:translate-x-2">
                                ↗
                            </span>
                        </span>
                    </Link>
                </div>


            </div>
        </section>
    );
}