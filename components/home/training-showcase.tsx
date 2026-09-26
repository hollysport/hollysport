import Link from "next/link";
import { ArrowRight, Bookmark, FlaskConical, Orbit } from "lucide-react";

/*
 * Ana sayfa vitrini — 3D Antrenman Merkezi tanıtımı.
 * Mevcut landing bölümlerine dokunulmadan Hero altına enjekte edilir.
 */

const FEATURES = [
    {
        Icon: Orbit,
        title: "İnteraktif 3D Anatomi",
        description:
            "Seçtiğin kas grubuna göre hedeflenen bölgeleri anında gör; programın harita üzerinde canlansın.",
    },
    {
        Icon: FlaskConical,
        title: "Bilimsel Algoritma",
        description:
            "Hedefine özel filtrelenmiş hareket havuzu: hacim, kuvvet, esneklik, postür veya sıçrama; set ve tekrarlar otomatik.",
    },
    {
        Icon: Bookmark,
        title: "Kişisel Kütüphane",
        description:
            "Kendi antrenmanlarını kaydet ve yönet; koçlarımızdan kişiye özel program talep et.",
    },
];

export default function TrainingShowcase() {
    return (
        <section className="border-t border-white/10 bg-[#0a0a0a] px-6 py-24 md:px-10 lg:px-16">
            <div className="mx-auto max-w-7xl">
                <div className="mx-auto max-w-4xl text-center">
                    <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#27D66B]">
                        Yeni Nesil Antrenman
                    </span>

                    <h2 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl">
                        3D Anatomi Destekli
                        <br />
                        <span className="text-[#27D66B]">
                            Antrenman Merkezi.
                        </span>
                    </h2>

                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/50">
                        İnteraktif 3D vücut haritasında bölgelerini
                        seç, hedefini belirle; programın saniyeler
                        içinde hazır.
                    </p>

                    <Link
                        href="/training"
                        className="mt-10 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#27D66B] px-10 text-base font-bold text-[#050505] shadow-[0_0_40px_rgba(39,214,107,0.35)] transition hover:bg-[#45e27f] hover:shadow-[0_0_60px_rgba(39,214,107,0.5)]"
                    >
                        Hemen Ücretsiz Başla
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>

                <div className="mt-20 grid gap-6 md:grid-cols-3">
                    {FEATURES.map((feature) => (
                        <div
                            key={feature.title}
                            className="group rounded-3xl border border-white/10 bg-[#111111] p-8 transition duration-300 hover:-translate-y-1 hover:border-[#27D66B]/40 hover:shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#27D66B]/10 text-[#27D66B] transition group-hover:bg-[#27D66B]/20">
                                <feature.Icon className="h-6 w-6" />
                            </div>

                            <h3 className="mt-6 text-xl font-bold text-white">
                                {feature.title}
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-white/45">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
