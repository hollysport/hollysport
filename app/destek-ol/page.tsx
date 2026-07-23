import type { Metadata } from "next";
import SupportForm from "@/components/support/SupportForm";

export const metadata: Metadata = {
    title: "Destek Ol | Holly Sport",
    description:
        "Holly Sport topluluğuna gönüllü, kurumsal veya bireysel destek ver.",
};

export default function SupportPage() {
    return (
        <main className="bg-zinc-50">
            <section className="bg-zinc-950 py-20 text-white sm:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
                        Holly Sport’a Destek Ol
                    </p>

                    <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
                        Birlikte daha güçlü bir spor topluluğu oluşturalım.
                    </h1>

                    <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
                        Gönüllü emeğin, uzmanlığın, ekipmanın veya kurumsal desteğinle
                        Holly Sport’un daha fazla insana ulaşmasına katkı sağlayabilirsin.
                    </p>
                </div>
            </section>

            <section className="py-16 sm:py-20">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
                            Destek Başvurusu
                        </p>

                        <h2 className="mt-3 text-3xl font-bold text-zinc-950">
                            Sana uygun destek türünü seç.
                        </h2>

                        <p className="mt-5 leading-7 text-zinc-600">
                            Başvurun gönderildikten sonra Holly Sport ekibi bilgilerini
                            inceleyecek ve seninle iletişime geçecek.
                        </p>

                        <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6">
                            <h3 className="font-bold text-zinc-950">
                                Başvurudan sonra ne olacak?
                            </h3>

                            <ol className="mt-5 space-y-4 text-sm leading-6 text-zinc-600">
                                <li>1. Başvurun ekibimize ulaşır.</li>
                                <li>2. Destek türü ve ihtiyaçlar değerlendirilir.</li>
                                <li>3. Uygun çalışma modeli için seninle iletişime geçilir.</li>
                                <li>4. Onayından sonra destekçi alanına eklenirsin.</li>
                            </ol>
                        </div>
                    </div>

                    <SupportForm />
                </div>
            </section>
        </main>
    );
}