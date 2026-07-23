import Link from "next/link";

const faqs = [
    {
        question: "Etkinliklere herkes katılabilir mi?",
        answer:
            "Evet. Etkinlik detaylarında özel bir yaş, seviye veya deneyim şartı belirtilmediği sürece herkes başvuru yapabilir.",
    },
    {
        question: "Etkinlikler ücretli mi?",
        answer:
            "Etkinliklerin büyük bölümü ücretsiz veya erişilebilir ücretlerle düzenlenir. Varsa katılım ücreti etkinlik sayfasında açıkça belirtilir.",
    },
    {
        question: "Profesyonel sporcu olmam gerekiyor mu?",
        answer:
            "Hayır. Holly Sport, farklı seviyelerden insanların birlikte spor yapabilmesi için oluşturulmuş bir topluluktur.",
    },
    {
        question: "Başvurum hemen onaylanır mı?",
        answer:
            "Başvurular etkinlik kapasitesi ve gerekli koşullar dikkate alınarak ekip tarafından değerlendirilir.",
    },
    {
        question: "Etkinlik bilgileri bana nasıl ulaşır?",
        answer:
            "Başvurun onaylandıktan sonra etkinlik yeri, saati ve gerekli bilgiler kayıt sırasında verdiğin iletişim kanalları üzerinden paylaşılır.",
    },
];

export default function Faq() {
    return (
        <section id="faq" className="scroll-mt-20 bg-white py-20 sm:py-24">
            <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
                        Merak Ettiklerin
                    </p>

                    <h2 className="mt-4 text-3xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
                        Sık sorulan sorular.
                    </h2>

                    <p className="mt-5 max-w-lg text-base leading-7 text-zinc-600 sm:text-lg">
                        Katılım süreci ve etkinlikler hakkında en çok sorulan soruların
                        cevaplarını burada bulabilirsin.
                    </p>
                </div>

                <div className="divide-y divide-zinc-200 border-y border-zinc-200">
                    {faqs.slice(0, 5).map((faq) => (
                        <details key={faq.question} className="group py-6">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left text-lg font-semibold text-zinc-950">
                                {faq.question}

                                <span className="relative h-5 w-5 shrink-0">
                                    <span className="absolute left-0 top-1/2 h-0.5 w-5 -translate-y-1/2 bg-zinc-950" />
                                    <span className="absolute left-1/2 top-0 h-5 w-0.5 -translate-x-1/2 bg-zinc-950 transition group-open:rotate-90 group-open:opacity-0" />
                                </span>
                            </summary>

                            <p className="mt-4 max-w-2xl pr-10 leading-7 text-zinc-600">
                                {faq.answer}
                            </p>
                        </details>
                    ))}
                </div>
                <div className="mt-10 flex justify-center">
                    <Link
                        href="/faq"
                        className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#27D66B] px-7 text-sm font-bold text-[#050505] transition hover:bg-[#45e27f]"
                    >
                        Tüm Soruları Gör
                    </Link>
                </div>
            </div>
        </section>
    );
}