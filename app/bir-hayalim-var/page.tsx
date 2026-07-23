import type { Metadata } from "next";
import {
    HeartHandshake,
    Sparkles,
    Target,
} from "lucide-react";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import DreamForm from "@/components/dreams/DreamForm";

export const metadata: Metadata = {
    title: "Bir Hayalim Var | Holly Sport",
    description:
        "Deneyimlemek veya ulaşmak istediğin hayalini Holly Sport ile paylaş. Belki birlikte ilk adımı atabiliriz.",
};

export default function DreamPage() {
    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[#050505] text-white">
                <section className="relative overflow-hidden border-b border-white/10 px-6 pb-20 pt-24 sm:pb-28 sm:pt-32 lg:px-8">
                    <div className="pointer-events-none absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-[#27D66B]/10 blur-[120px]" />

                    <div className="relative mx-auto max-w-7xl">
                        <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#27D66B]">
                            Bir Hayalim Var
                        </p>

                        <h1 className="mt-5 max-w-5xl text-5xl font-extrabold leading-[0.95] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
                            Siz isteyin,
                            <span className="block text-[#27D66B]">
                                birlikte yapalım.
                            </span>
                        </h1>

                        <p className="mt-8 max-w-3xl text-base leading-8 text-white/55 sm:text-xl sm:leading-9">
                            Deneyimlemek, başarmak veya ulaşmak
                            istediğin bireysel bir hedefin mi var?
                            Hayalini bizimle paylaş. Holly Sport olarak
                            bireysel hedeflerine yaklaşabilmen için
                            topluluk gücümüz, deneyimlerimiz ve
                            imkânlarımızla yanında olmaya çalışıyoruz.
                        </p>
                    </div>
                </section>

                <section className="px-6 py-20 sm:py-28 lg:px-8">
                    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                        <div className="lg:sticky lg:top-28">
                            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#27D66B]">
                                Hayaline ilk adım
                            </p>

                            <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl">
                                Belki de ihtiyacın olan şey birlikte
                                atılacak ilk adımdır.
                            </h2>

                            <p className="mt-6 max-w-xl text-base leading-8 text-white/50">
                                Likya Yolu’nu yürümek, Ağrı Dağı’na
                                tırmanmak, ilk yarışına katılmak veya
                                uzun zamandır ertelediğin başka bir
                                hedefe ulaşmak istiyor olabilirsin.
                                Hayalini kısaca anlat, birlikte neler
                                yapabileceğimize bakalım.
                            </p>

                            <div className="mt-10 space-y-4">
                                <InfoCard
                                    icon={Sparkles}
                                    title="Hayalini paylaş"
                                    description="Büyük veya küçük olması önemli değil. Gerçekten istediğin hedefi bize anlat."
                                />

                                <InfoCard
                                    icon={Target}
                                    title="Hedefini anlayalım"
                                    description="Hayalini ve bu hayale yaklaşmak için nasıl bir desteğe ihtiyaç duyduğunu değerlendirelim."
                                />

                                <InfoCard
                                    icon={HeartHandshake}
                                    title="Birlikte yol arayalım"
                                    description="Uygun imkânlar oluştuğunda topluluk gücümüzle ilk adımı birlikte atalım."
                                />
                            </div>

                            <p className="mt-8 text-sm leading-7 text-white/35">
                                Her başvuruyu dikkatle inceliyoruz. Her
                                hayali gerçekleştirme garantisi
                                veremeyiz; ancak katkı sağlayabileceğimiz
                                başvurular için iletişime geçiyoruz.
                            </p>
                        </div>

                        <DreamForm />
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}

type InfoCardProps = {
    icon: typeof Sparkles;
    title: string;
    description: string;
};

function InfoCard({
    icon: Icon,
    title,
    description,
}: InfoCardProps) {
    return (
        <div className="flex gap-4 rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#27D66B]/10 text-[#27D66B]">
                <Icon className="h-6 w-6" />
            </div>

            <div>
                <h3 className="font-bold text-white">
                    {title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-white/45">
                    {description}
                </p>
            </div>
        </div>
    );
}