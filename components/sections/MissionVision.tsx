import { Eye, Target } from "lucide-react";

const items = [
    {
        icon: Target,
        label: "Misyonumuz",
        title: "Herkes için daha aktif ve sosyal bir yaşam.",
        description:
            "Sporun birleştirici gücünü kullanarak; bireylerin sosyal statüleri, ekonomik durumları, etnik kökenleri, fiziksel ya da zihinsel engelleri ne olursa olsun, spora erişim hakkını eşit ve kapsayıcı bir biçimde savunur ve herkes için sporu daha ulaşılabilir hâle getirmek."+
            "İnsanların spor yapmasının önündeki ekonomik, sosyal ve psikolojik engelleri azaltmak; farklı branşlarda ücretsiz ve erişilebilir etkinlikler düzenleyerek bireylerin fiziksel, mental ve sosyal gelişimine katkı sağlamak.",
    },
    {
        icon: Eye,
        label: "Vizyonumuz",
        title: "Türkiye’nin en kapsayıcı gönüllü spor topluluğu olmak.",
        description:
            "Sporun yalnızca profesyoneller için değil herkes için ulaşılabilir olduğu bir kültür oluşturmayı; farklı şehirlerde faaliyet gösteren, sosyal etkisi yüksek ve insanlara ilham veren güçlü bir topluluk hâline gelmeyi hedefliyoruz.",
    },
];

export default function MissionVision() {
    return (
        <section className="bg-white py-20 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
                        Amacımız ve Geleceğimiz
                    </p>

                    <h2 className="mt-4 text-3xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
                        Birlikte hareket ediyor, birlikte büyüyoruz.
                    </h2>

                    <p className="mt-5 text-base leading-7 text-zinc-600 sm:text-lg">
                        Holly Sport yalnızca spor etkinlikleri düzenleyen bir yapı değil;
                        insanların tanıştığı, geliştiği ve kendini ait hissettiği bir
                        topluluktur.
                    </p>
                </div>

                <div className="mt-12 grid gap-6 lg:grid-cols-2">
                    {items.map((item) => {
                        const Icon = item.icon;

                        return (
                            <article
                                key={item.label}
                                className="rounded-3xl border border-zinc-200 bg-zinc-50 p-7 sm:p-9"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white">
                                    <Icon className="h-6 w-6" />
                                </div>

                                <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
                                    {item.label}
                                </p>

                                <h3 className="mt-3 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
                                    {item.title}
                                </h3>

                                <p className="mt-5 leading-7 text-zinc-600">
                                    {item.description}
                                </p>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}