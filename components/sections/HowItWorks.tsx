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
        <section className="bg-[#050505] py-20 sm:py-24">
            <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-8">
                <div className="max-w-xl">
                    <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#27D66B]">
                        Nasıl Katılırım?
                    </p>

                    <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                        Üç adımda harekete geç.
                    </h2>

                    <p className="mt-6 max-w-lg text-base leading-8 text-white/55 sm:text-lg sm:leading-8">
                        Holly Sport etkinliklerine katılmak için üyelik veya
                        profesyonel spor geçmişi gerekmiyor.
                    </p>
                </div>

                <div className="relative">
                    <div className="absolute bottom-6 left-4 top-6 hidden w-px bg-white/10 sm:block" aria-hidden="true" />

                    <div className="flex flex-col gap-12 sm:gap-14">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isLast = index === steps.length - 1;

                            return (
                                <div
                                    key={step.number}
                                    className="flex items-start gap-6"
                                >
                                    <div className="relative hidden shrink-0 flex-col items-center sm:flex">
                                        <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#27D66B]/40 bg-[#050505]">
                                            <span className="text-xs font-bold text-[#27D66B]">
                                                {step.number}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-[#27D66B] sm:hidden">
                                                {step.number}
                                            </span>

                                            <Icon
                                                aria-hidden="true"
                                                className="h-4.5 w-4.5 text-[#27D66B]"
                                                strokeWidth={2}
                                            />

                                            <h3 className="text-xl font-bold text-white sm:text-2xl">
                                                {step.title}
                                            </h3>
                                        </div>

                                        <p className="mt-3 max-w-md text-base leading-7 text-white/55">
                                            {step.description}
                                        </p>

                                        {!isLast && (
                                            <div className="mt-8 h-px w-full bg-white/5 sm:hidden" aria-hidden="true" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
