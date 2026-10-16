import type { Metadata } from "next";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import SupportForm from "@/components/support/SupportForm";

export const metadata: Metadata = {
    title: "Destek Ol | Holly Sport",
    description:
        "Holly Sport topluluğuna gönüllü, kurumsal veya bireysel destek ver.",
};

export default function SupportPage() {
    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-shell">
                <section className="bg-white py-20 text-ink sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-700">
                            Holly Sport’a Destek Ol
                        </p>

                        <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
                            Birlikte daha güçlü bir spor topluluğu
                            oluşturalım.
                        </h1>

                        <p className="mt-6 max-w-2xl text-base leading-7 text-ink-soft sm:text-lg">
                            Gönüllü emeğin, uzmanlığın, ekipmanın veya
                            kurumsal desteğinle Holly Sport’un daha
                            fazla insana ulaşmasına katkı
                            sağlayabilirsin.
                        </p>
                    </div>
                </section>

                <section className="py-16 sm:py-20">
                    <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
                                Destek Başvurusu
                            </p>

                            <h2 className="mt-3 text-3xl font-bold text-ink">
                                Sana uygun destek türünü seç.
                            </h2>

                            <p className="mt-5 leading-7 text-ink-soft">
                                Başvurun gönderildikten sonra Holly
                                Sport ekibi bilgilerini inceleyecek ve
                                seninle iletişime geçecek.
                            </p>
                        </div>

                        <SupportForm />
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}