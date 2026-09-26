import type { Metadata } from "next";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MetabolismCalculator from "@/components/training/MetabolismCalculator";
import WorkoutGenerator from "@/components/training/WorkoutGenerator";

export const metadata: Metadata = {
    title: "Antrenman Merkezi",
    description:
        "Kalori, metabolizma ve makro hesaplamalarını başka bir uygulamaya gerek kalmadan Holly Sport Antrenman Merkezi'nde yap.",
};

export default function TrainingPage() {
    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[#050505] text-white">
                <section className="px-6 pb-10 pt-36 md:px-10 lg:px-16">
                    <div className="mx-auto max-w-7xl">
                        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#27D66B]">
                            Holly Sport
                        </span>

                        <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
                            Antrenman
                            <span className="text-[#27D66B]"> Merkezi.</span>
                        </h1>

                        <p className="mt-8 max-w-2xl text-lg leading-8 text-white/50">
                            Kalori ve makro hesaplamalarını başka bir
                            uygulamaya gerek kalmadan burada yap. İlk araç:
                            metabolizma ve makro hesaplayıcı.
                        </p>
                    </div>
                </section>

                <section className="px-6 pb-24 md:px-10 lg:px-16">
                    <div className="mx-auto max-w-7xl">
                        <MetabolismCalculator />
                    </div>
                </section>

                <section className="border-t border-white/10 px-6 py-24 md:px-10 lg:px-16">
                    <div className="mx-auto max-w-7xl">
                        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#27D66B]">
                            Bölgesel Antrenman
                        </span>

                        <h2 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
                            Hangi bölgeleri çalıştırmak
                            istiyorsun?
                        </h2>

                        <p className="mt-5 max-w-2xl leading-7 text-white/50">
                            3D haritadan birden fazla kas grubu seç,
                            hedefini ve ortamını belirle; programın
                            set ve tekrarlarıyla otomatik hazırlansın.
                        </p>

                        <div className="mt-12">
                            <WorkoutGenerator />
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
