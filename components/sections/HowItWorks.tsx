import { CalendarDays, CheckCircle2, Trophy } from "lucide-react";

const steps = [
    {
        number: "01",
        icon: CalendarDays,
        title: "Etkinliğini seç",
        description:
            "Yaklaşan etkinlikleri incele ve sana uygun spor deneyimini seç.",
    },
    {
        number: "02",
        icon: CheckCircle2,
        title: "Başvurunu tamamla",
        description:
            "Kısa katılım formunu doldur. Başvurun ekip tarafından değerlendirilsin.",
    },
    {
        number: "03",
        icon: Trophy,
        title: "Aramıza katıl",
        description:
            "Etkinlik detaylarını öğren, yeni insanlarla tanış ve birlikte spor yap.",
    },
];

export default function HowItWorks() {
    return (
        <section className="bg-zinc-50 py-20 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
                        Nasıl Katılırım?
                    </p>

                    <h2 className="mt-4 text-3xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
                        Üç adımda harekete geç.
                    </h2>

                    <p className="mt-5 text-base leading-7 text-zinc-600 sm:text-lg">
                        Holly Sport etkinliklerine katılmak için üyelik veya profesyonel
                        spor geçmişi gerekmiyor.
                    </p>
                </div>

                <div className="mt-12 grid gap-5 md:grid-cols-3">
                    {steps.map((step) => {
                        const Icon = step.icon;

                        return (
                            <div
                                key={step.number}
                                className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-200/60 sm:p-8"
                            >
                                <span className="absolute right-6 top-4 text-6xl font-black text-zinc-100 transition group-hover:text-orange-50">
                                    {step.number}
                                </span>

                                <div className="relative">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white">
                                        <Icon className="h-6 w-6" />
                                    </div>

                                    <h3 className="mt-8 text-xl font-bold text-zinc-950">
                                        {step.title}
                                    </h3>

                                    <p className="mt-3 leading-7 text-zinc-600">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}