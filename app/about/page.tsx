import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Users } from "lucide-react";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MissionVision from "@/components/sections/MissionVision";
import CommunityValues from "@/components/sections/CommunityValues";

export const metadata: Metadata = {
    title: "Hakkımızda | Holly Sport",
    description:
        "Holly Sport’un hikâyesini, misyonunu, vizyonunu ve topluluk değerlerini keşfet.",
};

export default function AboutPage() {
    return (
        <main>
            <Navbar />

            <section className="bg-shell py-20 text-ink sm:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-700">
                        Hakkımızda
                    </p>

                    <h1 className="mt-5 max-w-5xl text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                        Spor aracılığıyla insanları bir araya
                        getiriyoruz.
                    </h1>

                    <div className="mt-8 grid items-center gap-8 md:grid-cols-[1fr_320px] lg:gap-12">
                        <p className="max-w-3xl text-base leading-8 text-ink-soft sm:text-xl">
                            Holly Sport, her yaştan insanın fiziksel, mental
                            ve sosyal açıdan daha aktif bir yaşam sürmesini
                            amaçlayan, gönüllülük esasına dayanan bağımsız
                            bir spor topluluğudur.
                        </p>

                        <figure className="rounded-3xl border border-line bg-white p-2">
                            <div className="relative aspect-[19/10] overflow-hidden rounded-2xl">
                                <Image
                                    src="/images/about/about-commun.jpg"
                                    alt="Holly Sport topluluğu bir etkinlikte bir arada"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 320px"
                                    className="object-cover"
                                />
                            </div>

                            <figcaption className="px-3 pb-1 pt-3 text-xs leading-5 text-ink-soft">
                                Holly Sport topluluğu
                            </figcaption>
                        </figure>
                    </div>
                </div>
            </section>

            <section className="bg-white py-20 sm:py-24">
                <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-700">
                            Hikâyemiz
                        </p>

                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-5xl">
                            Küçük bir arkadaş grubundan güçlü bir
                            topluluğa.
                        </h2>
                    </div>

                    <div className="space-y-6 text-base leading-8 text-ink/70 sm:text-lg">
                        <p>
                            Holly Sport, birlikte spor yapmak isteyen
                            küçük bir arkadaş grubuyla başladı. Zamanla
                            her katılımcının başka insanları topluluğa
                            dahil etmesiyle büyüdü ve farklı spor
                            branşlarında yüzlerce insanı bir araya
                            getiren bir yapıya dönüştü.
                        </p>

                        <p>
                            Amacımız yalnızca etkinlik düzenlemek değil;
                            insanların yeni insanlarla tanıştığı, farklı
                            sporları deneyimlediği, dostluklar kurduğu ve
                            kendini ait hissettiği güvenli bir topluluk
                            oluşturmaktır.
                        </p>

                        <p>
                            Yıl boyunca koşu, futbol, basketbol,
                            voleybol, doğa sporları ve farklı branşlarda
                            ücretsiz veya erişilebilir etkinlikler
                            düzenliyoruz.
                        </p>
                    </div>
                </div>
            </section>

            <section className="bg-shell py-20 sm:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-5 md:grid-cols-2">
                        <article className="rounded-3xl border border-line bg-white p-7 sm:p-9">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-ink">
                                <Users className="h-6 w-6" />
                            </div>

                            <h2 className="mt-7 text-2xl font-bold text-ink">
                                Nasıl çalışıyoruz?
                            </h2>

                            <p className="mt-4 leading-7 text-ink/70">
                                Etkinlikler gönüllü organizatörler,
                                topluluk üyeleri ve destekçilerle
                                birlikte planlanır. Her etkinlikte
                                güvenli, kapsayıcı ve sosyal bir ortam
                                oluşturmayı hedefleriz.
                            </p>
                        </article>

                        <article className="rounded-3xl border border-line bg-white p-7 sm:p-9">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-ink">
                                <Heart className="h-6 w-6" />
                            </div>

                            <h2 className="mt-7 text-2xl font-bold text-ink">
                                Gönüllülük kültürü
                            </h2>

                            <p className="mt-4 leading-7 text-ink/70">
                                Holly Sport’un büyümesinde gönüllü emeğin
                                önemli bir yeri vardır. Etkinliklerden
                                sosyal medyaya, tasarımdan teknik desteğe
                                kadar herkes kendi becerisiyle katkı
                                sağlayabilir.
                            </p>
                        </article>
                    </div>
                </div>
            </section>

            <MissionVision />

            <CommunityValues />

            <section className="bg-white py-20 sm:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-start justify-between gap-8 rounded-[2rem] bg-orange-500 p-8 text-ink sm:p-12 lg:flex-row lg:items-center">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/70">
                                Birlikte büyüyelim
                            </p>

                            <h2 className="mt-3 max-w-2xl text-3xl font-bold sm:text-4xl">
                                Sen de Holly Sport topluluğunun bir
                                parçası ol.
                            </h2>
                        </div>

                        <Link
                            href="/events"
                            className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-ink transition hover:bg-shell"
                        >
                            Etkinlikleri İncele

                            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}