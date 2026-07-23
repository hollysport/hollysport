import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart, Users } from "lucide-react";

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
            <section className="bg-zinc-950 py-20 text-white sm:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
                        Hakkımızda
                    </p>

                    <h1 className="mt-5 max-w-5xl text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                        Spor aracılığıyla insanları bir araya getiriyoruz.
                    </h1>

                    <p className="mt-7 max-w-3xl text-base leading-8 text-zinc-400 sm:text-xl">
                        Holly Sport, her yaştan insanın fiziksel, mental ve sosyal
                        açıdan daha aktif bir yaşam sürmesini amaçlayan, gönüllülük
                        esasına dayanan bağımsız bir spor topluluğudur.
                    </p>
                </div>
            </section>

            <section className="bg-white py-20 sm:py-24">
                <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
                            Hikâyemiz
                        </p>

                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
                            Küçük bir arkadaş grubundan güçlü bir topluluğa.
                        </h2>
                    </div>

                    <div className="space-y-6 text-base leading-8 text-zinc-600 sm:text-lg">
                        <p>
                            Holly Sport, birlikte spor yapmak isteyen küçük bir arkadaş
                            grubuyla başladı. Zamanla her katılımcının başka insanları
                            topluluğa dahil etmesiyle büyüdü ve farklı spor branşlarında
                            yüzlerce insanı bir araya getiren bir yapıya dönüştü.
                        </p>

                        <p>
                            Amacımız yalnızca etkinlik düzenlemek değil; insanların yeni
                            insanlarla tanıştığı, farklı sporları deneyimlediği, dostluklar
                            kurduğu ve kendini ait hissettiği güvenli bir topluluk
                            oluşturmaktır.
                        </p>

                        <p>
                            Yıl boyunca koşu, futbol, basketbol, voleybol, doğa sporları
                            ve farklı branşlarda ücretsiz veya erişilebilir etkinlikler
                            düzenliyoruz.
                        </p>
                    </div>
                </div>
            </section>

            <section className="bg-zinc-50 py-20 sm:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-5 md:grid-cols-2">
                        <article className="rounded-3xl border border-zinc-200 bg-white p-7 sm:p-9">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white">
                                <Users className="h-6 w-6" />
                            </div>

                            <h2 className="mt-7 text-2xl font-bold text-zinc-950">
                                Nasıl çalışıyoruz?
                            </h2>

                            <p className="mt-4 leading-7 text-zinc-600">
                                Etkinlikler gönüllü organizatörler, topluluk üyeleri ve
                                destekçilerle birlikte planlanır. Her etkinlikte güvenli,
                                kapsayıcı ve sosyal bir ortam oluşturmayı hedefleriz.
                            </p>
                        </article>

                        <article className="rounded-3xl border border-zinc-200 bg-white p-7 sm:p-9">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white">
                                <Heart className="h-6 w-6" />
                            </div>

                            <h2 className="mt-7 text-2xl font-bold text-zinc-950">
                                Gönüllülük kültürü
                            </h2>

                            <p className="mt-4 leading-7 text-zinc-600">
                                Holly Sport’un büyümesinde gönüllü emeğin önemli bir yeri
                                vardır. Etkinliklerden sosyal medyaya, tasarımdan teknik
                                desteğe kadar herkes kendi becerisiyle katkı sağlayabilir.
                            </p>
                        </article>
                    </div>
                </div>
            </section>

            <MissionVision />

            <CommunityValues />

            <section className="bg-white py-20 sm:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-start justify-between gap-8 rounded-[2rem] bg-orange-500 p-8 text-white sm:p-12 lg:flex-row lg:items-center">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                                Birlikte büyüyelim
                            </p>

                            <h2 className="mt-3 max-w-2xl text-3xl font-bold sm:text-4xl">
                                Sen de Holly Sport topluluğunun bir parçası ol.
                            </h2>
                        </div>

                        <Link
                            href="/events"
                            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-zinc-950 px-6 py-3.5 font-semibold text-white transition hover:bg-zinc-800"
                        >
                            Etkinlikleri İncele
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}