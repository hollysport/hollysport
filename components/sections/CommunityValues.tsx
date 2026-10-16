import { Heart, ShieldCheck, Sparkles, Users } from "lucide-react";

const values = [
    {
        icon: Users,
        title: "Kapsayıcılık",
        description:
            "Yaş, deneyim veya spor seviyesi fark etmeksizin herkes için ulaşılabilir bir topluluk oluşturuyoruz.",
    },
    {
        icon: Heart,
        title: "Gönüllülük",
        description:
            "Topluluğumuzu dayanışma, paylaşım ve birlikte üretme kültürüyle büyütüyoruz.",
    },
    {
        icon: ShieldCheck,
        title: "Güvenli Alan",
        description:
            "Herkesin kendini rahat, değerli ve topluluğun bir parçası hissedebileceği ortamlar kuruyoruz.",
    },
    {
        icon: Sparkles,
        title: "Yeni Deneyimler",
        description:
            "İnsanları farklı sporlarla, yeni insanlarla ve unutulmaz deneyimlerle buluşturuyoruz.",
    },
];

export default function CommunityValues() {
    return (
        <section className="bg-shell py-20 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-700">
                        Bizi Biz Yapan
                    </p>

                    <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-5xl">
                        Spordan daha fazlasını birlikte oluşturuyoruz.
                    </h2>

                    <p className="mt-5 text-base leading-7 text-ink-soft sm:text-lg">
                        Holly Sport; hareket etmenin yanında yeni insanlarla tanışmayı,
                        dayanışmayı ve güçlü bağlar kurmayı önemser.
                    </p>
                </div>

                <div className="mt-12 grid gap-px overflow-hidden rounded-3xl bg-line md:grid-cols-2 lg:grid-cols-4">
                    {values.map((value) => {
                        const Icon = value.icon;

                        return (
                            <div
                                key={value.title}
                                className="bg-shell p-7 transition hover:bg-white sm:p-8"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
                                    <Icon className="h-6 w-6" />
                                </div>

                                <h3 className="mt-7 text-xl font-bold text-ink">
                                    {value.title}
                                </h3>

                                <p className="mt-3 leading-7 text-ink-soft">
                                    {value.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}