import type { Metadata } from "next";
import Link from "next/link";
import QuestionForm from "@/components/contact/QuestionForm";

export const metadata: Metadata = {
    title: "Sıkça Sorulan Sorular | Holly Sport",
    description:
        "Holly Sport etkinlikleri, başvurular ve topluluk hakkında sıkça sorulan sorular.",
};

const faqs = [
    {
        question: "Etkinliklere herkes katılabilir mi?",
        answer:
            "Etkinlik detaylarında özel bir yaş, deneyim veya seviye şartı belirtilmediği sürece herkes başvuru yapabilir.",
    },
    {
        question: "Etkinlikler ücretli mi?",
        answer:
            "Etkinliklerin büyük bölümü ücretsiz veya erişilebilir ücretlerle düzenlenir. Katılım ücreti bulunuyorsa etkinlik sayfasında açıkça belirtilir.",
    },
    {
        question: "Profesyonel sporcu olmam gerekiyor mu?",
        answer:
            "Hayır. Holly Sport farklı seviyelerden insanların birlikte spor yapabilmesi için oluşturulmuş kapsayıcı bir topluluktur.",
    },
    {
        question: "Başvurum hemen onaylanır mı?",
        answer:
            "Başvurular etkinlik kapasitesi, katılım koşulları ve organizasyon ihtiyaçları dikkate alınarak ekip tarafından değerlendirilir.",
    },
    {
        question: "Etkinlik bilgileri bana nasıl ulaşır?",
        answer:
            "Başvurun onaylandıktan sonra etkinlik yeri, saati ve gerekli bilgiler kayıt sırasında verdiğin iletişim bilgileri üzerinden paylaşılır.",
    },
    {
        question: "Etkinliğe tek başıma katılabilir miyim?",
        answer:
            "Evet. Katılımcılarımızın büyük bölümü etkinliklere tek başına katılır ve etkinlik sırasında yeni insanlarla tanışır.",
    },
    {
        question: "Etkinliğe katılmaktan vazgeçersem ne yapmalıyım?",
        answer:
            "Kontenjanın başka bir katılımcıya açılabilmesi için mümkün olduğunca erken organizasyon ekibine bilgi vermelisin.",
    },
    {
        question: "Gerekli ekipmanları Holly Sport sağlıyor mu?",
        answer:
            "Bu durum etkinliğe göre değişir. Katılımcının getirmesi gereken ekipmanlar etkinlik detaylarında belirtilir. Topluluğumuz, envanteri doğrultusunda ücretsiz ekipman desteği sağlar.",
    },
    {
        question: "Farklı şehirlerde etkinlik düzenliyor musunuz?",
        answer:
            "Etkinlikler şu anda ağırlıklı olarak İstanbul’da düzenlenmektedir. İstanbul dışı etkinliklerimiz de olmaktadır.",
    },
    {
        question: "Holly Sport’a gönüllü olarak destek olabilir miyim?",
        answer:
            "Evet. Organizasyon, sosyal medya, fotoğraf, video, tasarım, yazılım ve farklı alanlarda gönüllü destek verebilirsin.",
    },
    {
        question: "Kurumsal iş birliği yapabilir miyiz?",
        answer:
            "Evet. Etkinlik, mekân, ekipman, ürün, hizmet ve sponsorluk iş birlikleri için destek başvuru formunu kullanabilirsin.",
    },
    {
        question: "Etkinlik fotoğraflarına nereden ulaşabilirim?",
        answer:
            "Yayınlanan etkinlik fotoğraflarını Galeri sayfasından inceleyebilirsin.",
    },
];

export default function FaqPage() {
    return (
        <main>
            <section className="bg-[#050505] py-20 text-white sm:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#27D66B]">
                        Yardım Merkezi
                    </p>

                    <h1 className="mt-5 max-w-4xl text-4xl font-extrabold tracking-[-0.04em] sm:text-6xl">
                        Sıkça sorulan sorular.
                    </h1>

                    <p className="mt-6 max-w-2xl text-base leading-7 text-white/50 sm:text-lg">
                        Etkinlikler, katılım süreci ve Holly Sport topluluğu hakkında
                        merak edilen soruların cevapları.
                    </p>
                </div>
            </section>

            <section className="bg-white py-16 sm:py-20">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="divide-y divide-zinc-200 border-y border-zinc-200">
                        {faqs.map((faq) => (
                            <details key={faq.question} className="group py-6">
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left text-lg font-bold text-zinc-950">
                                    {faq.question}

                                    <span className="relative h-5 w-5 shrink-0">
                                        <span className="absolute left-0 top-1/2 h-0.5 w-5 -translate-y-1/2 bg-zinc-950" />

                                        <span className="absolute left-1/2 top-0 h-5 w-0.5 -translate-x-1/2 bg-zinc-950 transition group-open:rotate-90 group-open:opacity-0" />
                                    </span>
                                </summary>

                                <p className="mt-4 max-w-3xl pr-10 leading-7 text-zinc-600">
                                    {faq.answer}
                                </p>
                            </details>
                        ))}
                    </div>
                    <section className="bg-zinc-50 py-16 sm:py-20">
                        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#27D66B]">
                                    Sorunu Bulamadın mı?
                                </p>

                                <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-zinc-950 sm:text-5xl">
                                    Bize doğrudan sor.
                                </h2>

                                <p className="mt-5 max-w-lg leading-7 text-zinc-600">
                                    Aradığın cevap burada yoksa formu doldur. Holly Sport ekibi
                                    sorunu inceleyerek verdiğin iletişim bilgileri üzerinden sana
                                    dönüş yapacaktır.
                                </p>

                                <div className="mt-8 rounded-3xl bg-zinc-950 p-6 text-white">
                                    <p className="text-sm font-semibold text-[#27D66B]">
                                        Dönüş süreci
                                    </p>

                                    <p className="mt-3 text-sm leading-6 text-white/50">
                                        Sorular mümkün olan en kısa sürede incelenir. Etkinliğe yakın
                                        acil konular için başlık bölümünde etkinlik adını belirt.
                                    </p>
                                </div>
                            </div>

                            <QuestionForm />
                        </div>
                    </section>
                    <div className="mt-12 flex flex-col items-center rounded-3xl bg-zinc-950 px-6 py-10 text-center text-white">
                        <h2 className="text-2xl font-bold">
                            Etkinlikleri incelemeye hazır mısın?
                        </h2>

                        <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">
                            Yaklaşan etkinlikleri görüntüleyerek sana uygun deneyimi
                            seçebilirsin.
                        </p>


                        <Link
                            href="/events"
                            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#27D66B] px-7 text-sm font-bold text-[#050505] transition hover:bg-[#45e27f]"
                        >
                            Etkinlikleri İncele
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}