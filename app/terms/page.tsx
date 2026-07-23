import type { Metadata } from "next";
import Link from "next/link";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export const metadata: Metadata = {
    title: "Kullanım Koşulları | Holly Sport",
    description:
        "Holly Sport internet sitesi, etkinlikleri ve topluluk hizmetlerine ilişkin kullanım koşulları.",
};

const sections = [
    {
        title: "1. Genel bilgiler",
        content: (
            <>
                <p>
                    Bu Kullanım Koşulları; Holly Sport internet
                    sitesini ziyaret eden, internet sitesindeki
                    formları kullanan veya Holly Sport etkinliklerine
                    başvuran kişiler için geçerlidir.
                </p>

                <p className="mt-4">
                    Holly Sport; herhangi bir şirket, dernek, vakıf,
                    kurum veya tüzel kişiliğe bağlı olmayan, bağımsız ve
                    gönüllülük esaslı bir spor topluluğudur.
                </p>

                <p className="mt-4">
                    İnternet sitesini kullanmanız veya etkinliklere
                    başvurmanız, ilgili kullanım koşullarını
                    okuduğunuz ve kabul ettiğiniz anlamına gelir.
                </p>
            </>
        ),
    },
    {
        title: "2. Topluluğun amacı",
        content: (
            <p>
                Holly Sport, insanların spor ve sosyal etkinlikler
                aracılığıyla bir araya gelmesini, aktif yaşama
                katılmasını ve yeni deneyimler edinmesini amaçlayan
                bağımsız bir topluluktur. Sunulan etkinlikler
                profesyonel spor hizmeti, sağlık hizmeti, terapi veya
                kişisel antrenörlük hizmeti niteliğinde değildir.
            </p>
        ),
    },
    {
        title: "3. İnternet sitesinin kullanımı",
        content: (
            <>
                <p>
                    Kullanıcılar internet sitesini yalnızca hukuka,
                    dürüstlük kurallarına ve diğer kişilerin haklarına
                    uygun şekilde kullanmalıdır.
                </p>

                <p className="mt-4">
                    Aşağıdaki davranışlara izin verilmez:
                </p>

                <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-[#27D66B]">
                    <li>
                        Yanlış, yanıltıcı veya başka bir kişiye ait
                        bilgiler paylaşmak
                    </li>
                    <li>
                        İnternet sitesinin güvenliğini veya çalışmasını
                        bozmak
                    </li>
                    <li>
                        Yetkisiz şekilde yönetim alanlarına erişmeye
                        çalışmak
                    </li>
                    <li>
                        Otomatik sistemlerle aşırı veya kötüye kullanım
                        amaçlı istek göndermek
                    </li>
                    <li>
                        Diğer katılımcıları rahatsız etmek, tehdit etmek
                        veya hedef göstermek
                    </li>
                    <li>
                        Hukuka aykırı, ayrımcı, saldırgan veya hakaret
                        içeren içerik paylaşmak
                    </li>
                    <li>
                        Holly Sport adını, logosunu veya içeriklerini
                        izinsiz ticari amaçlarla kullanmak
                    </li>
                </ul>
            </>
        ),
    },
    {
        title: "4. Etkinlik başvuruları",
        content: (
            <>
                <p>
                    Etkinlik başvuru formunun doldurulması, başvurunun
                    kesin olarak kabul edildiği anlamına gelmez.
                </p>

                <p className="mt-4">
                    Başvurular; etkinliğin kapasitesi, yaş veya seviye
                    şartları, organizasyon ihtiyaçları, etkinlik
                    kuralları ve güvenlik koşulları doğrultusunda
                    değerlendirilebilir.
                </p>

                <p className="mt-4">
                    Holly Sport, gerekli gördüğü durumlarda bir
                    başvuruyu kabul etmeme, bekleme listesine alma veya
                    katılımı sınırlandırma hakkını saklı tutar.
                </p>

                <p className="mt-4">
                    Başvuruda paylaşılan iletişim bilgilerinin doğru ve
                    güncel olması katılımcının sorumluluğundadır.
                </p>
            </>
        ),
    },
    {
        title: "5. Katılımcının sorumlulukları",
        content: (
            <>
                <p>Etkinliklere katılan kişiler:</p>

                <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-[#27D66B]">
                    <li>
                        Paylaştıkları bilgilerin doğru ve güncel
                        olduğunu kabul eder
                    </li>
                    <li>
                        Etkinlik kurallarına ve organizasyon ekibinin
                        yönlendirmelerine uyar
                    </li>
                    <li>
                        Diğer katılımcılara, çalışanlara, gönüllülere ve
                        çevreye saygılı davranır
                    </li>
                    <li>
                        Kendi sağlık ve fiziksel yeterlilik durumunu
                        değerlendirir
                    </li>
                    <li>
                        Etkinlik için gerekli kişisel ekipmanları yanında
                        bulundurur
                    </li>
                    <li>
                        Katılamayacağı durumda organizasyon ekibine
                        mümkün olan en kısa sürede bilgi verir
                    </li>
                    <li>
                        Kendi kişisel eşyalarının güvenliğinden
                        sorumludur
                    </li>
                    <li>
                        Etkinlik mekânının ve kullanılan ekipmanların
                        kurallarına uyar
                    </li>
                </ul>
            </>
        ),
    },
    {
        title: "6. Sağlık ve fiziksel uygunluk",
        content: (
            <>
                <p>
                    Spor faaliyetleri; yaralanma, düşme, çarpışma, kas
                    zorlanması ve benzeri riskler içerebilir.
                </p>

                <p className="mt-4">
                    Katılımcılar, etkinliğe katılmadan önce sağlık ve
                    fiziksel durumlarının ilgili spor faaliyetine uygun
                    olduğundan emin olmalıdır.
                </p>

                <p className="mt-4">
                    Sağlık problemi, sakatlık, düzenli ilaç kullanımı
                    veya fiziksel kısıtlılığı bulunan kişilerin etkinlik
                    öncesinde bir sağlık uzmanının görüşünü alması
                    önerilir.
                </p>

                <p className="mt-4">
                    Holly Sport internet sitesinde, sosyal medya
                    hesaplarında veya etkinlik duyurularında paylaşılan
                    bilgiler tıbbi tavsiye niteliğinde değildir.
                </p>
            </>
        ),
    },
    {
        title: "7. Etkinlik değişiklikleri ve iptaller",
        content: (
            <>
                <p>
                    Etkinliğin tarihi, saati, konumu, kapasitesi,
                    programı veya içeriği; hava koşulları, mekân durumu,
                    güvenlik, katılımcı sayısı veya organizasyonel
                    nedenlerle değiştirilebilir.
                </p>

                <p className="mt-4">
                    Gerekli durumlarda etkinlik ertelenebilir veya
                    tamamen iptal edilebilir. Değişiklikler mümkün
                    olduğu ölçüde katılımcılara bildirilecektir.
                </p>

                <p className="mt-4">
                    Mücbir sebepler, kamu otoritelerinin kararları,
                    doğal afetler veya topluluğun kontrolü dışındaki
                    nedenlerle gerçekleştirilemeyen etkinliklerde
                    ayrıca değerlendirme yapılabilir.
                </p>
            </>
        ),
    },
    {
        title: "8. Ücretli etkinlikler ve masraflar",
        content: (
            <>
                <p>
                    Holly Sport etkinliklerinin büyük bölümü ücretsiz
                    veya erişilebilir maliyetlerle düzenlenebilir.
                </p>

                <p className="mt-4">
                    Etkinliğin ücretli olması hâlinde ücret, kapsam,
                    ödeme yöntemi ve varsa iptal veya iade koşulları
                    etkinlik sayfasında ya da katılımcıya gönderilen
                    bilgilendirmede belirtilir.
                </p>

                <p className="mt-4">
                    Ulaşım, yemek, konaklama, kişisel ekipman ve benzeri
                    bireysel masraflar, aksi açıkça belirtilmediği
                    sürece katılımcıya aittir.
                </p>
            </>
        ),
    },
    {
        title: "9. Fotoğraf ve video çekimleri",
        content: (
            <>
                <p>
                    Etkinlikler sırasında topluluk faaliyetlerinin
                    tanıtılması, duyurulması, belgelenmesi ve
                    arşivlenmesi amacıyla fotoğraf veya video çekimleri
                    yapılabilir.
                </p>

                <p className="mt-4">
                    Çekilen görüntüler Holly Sport internet sitesinde,
                    sosyal medya hesaplarında ve topluluk
                    duyurularında paylaşılabilir.
                </p>

                <p className="mt-4">
                    Görüntüsünün kullanılmasını istemeyen
                    katılımcıların etkinlik öncesinde veya etkinlik
                    sırasında organizasyon ekibine bilgi vermesi
                    önerilir.
                </p>

                <p className="mt-4">
                    Yayımlanmış bir görüntünün kaldırılması için{" "}
                    <a
                        href="mailto:iletisim@hollysport.net"
                        className="font-semibold text-[#27D66B] underline decoration-[#27D66B]/40 underline-offset-4"
                    >
                        iletisim@hollysport.net
                    </a>{" "}
                    adresine başvuru yapılabilir.
                </p>
            </>
        ),
    },
    {
        title: "10. Topluluk görüşleri",
        content: (
            <>
                <p>
                    İnternet sitesi üzerinden gönderilen topluluk
                    görüşleri, puanlar, üyelik süresi bilgileri ve
                    fotoğraflar yalnızca gerekli izinlerin verilmesi ve
                    yönetim onayının ardından yayımlanabilir.
                </p>

                <p className="mt-4">
                    Holly Sport; hukuka, topluluk değerlerine veya
                    yayın politikasına uygun olmayan görüşleri
                    yayımlamama, düzenleme talep etme veya yayından
                    kaldırma hakkını saklı tutar.
                </p>
            </>
        ),
    },
    {
        title: "11. Gönüllüler, destekçiler ve iş birlikleri",
        content: (
            <>
                <p>
                    Gönüllülük, destek veya iş birliği formunun
                    doldurulması, başvurunun kabul edildiği veya
                    taraflar arasında bir sözleşme kurulduğu anlamına
                    gelmez.
                </p>

                <p className="mt-4">
                    Başvurular Holly Sport tarafından değerlendirilir.
                    Başvurunun kapsamı, tarafların sorumlulukları,
                    görünürlük koşulları ve kullanım hakları gerekli
                    durumlarda ayrıca yazılı olarak belirlenir.
                </p>

                <p className="mt-4">
                    Destekçi isimleri veya kurum logoları yalnızca
                    gerekli izinlerin bulunması hâlinde internet
                    sitesinde yayımlanır.
                </p>
            </>
        ),
    },
    {
        title: "12. Fikrî mülkiyet hakları",
        content: (
            <>
                <p>
                    Holly Sport adı, logosu, internet sitesi tasarımı,
                    özgün metinler, grafikler, fotoğraflar, videolar ve
                    diğer içerikler ilgili hak sahiplerine aittir.
                </p>

                <p className="mt-4">
                    Bu içerikler izin alınmadan ticari amaçlarla
                    kopyalanamaz, çoğaltılamaz, değiştirilemez,
                    dağıtılamaz veya başka bir marka adına
                    kullanılamaz.
                </p>

                <p className="mt-4">
                    Etkinliklere ilişkin içeriklerin kişisel ve ticari
                    olmayan amaçlarla sosyal medyada paylaşılması,
                    kaynak olarak Holly Sport&apos;un belirtilmesi
                    şartıyla mümkündür.
                </p>
            </>
        ),
    },
    {
        title: "13. Üçüncü taraf bağlantıları",
        content: (
            <p>
                İnternet sitesinde başka internet sitelerine, harita
                hizmetlerine, mesajlaşma servislerine veya sosyal medya
                platformlarına bağlantılar bulunabilir. Bu
                platformların içerikleri, güvenliği, kullanım
                koşulları ve gizlilik uygulamalarından Holly Sport
                sorumlu değildir.
            </p>
        ),
    },
    {
        title: "14. Sorumluluğun sınırlandırılması",
        content: (
            <>
                <p>
                    Holly Sport, etkinliklerin güvenli ve düzenli
                    şekilde yürütülmesi için makul çabayı gösterir.
                </p>

                <p className="mt-4">
                    Ancak katılımcının kendi davranışından, sağlık
                    durumundan, kurallara uymamasından, kişisel
                    eşyalarının kaybolmasından veya üçüncü kişilerin
                    eylemlerinden kaynaklanan zararlardan, yürürlükteki
                    mevzuatın izin verdiği ölçüde Holly Sport sorumlu
                    tutulamaz.
                </p>

                <p className="mt-4">
                    Bu hüküm, yürürlükteki hukuk kapsamında
                    sınırlandırılması veya kaldırılması mümkün olmayan
                    sorumlulukları ortadan kaldırmaz.
                </p>
            </>
        ),
    },
    {
        title: "15. Katılımın sonlandırılması",
        content: (
            <>
                <p>
                    Etkinlik düzenini veya güvenliğini bozan, diğer
                    kişileri rahatsız eden, ayrımcı, saldırgan veya
                    tehditkâr davranışlarda bulunan katılımcıların
                    etkinliğe katılımı sonlandırılabilir.
                </p>

                <p className="mt-4">
                    Ciddi veya tekrarlanan ihlallerde kişinin gelecekte
                    düzenlenecek Holly Sport etkinliklerine başvurusu
                    sınırlandırılabilir veya kabul edilmeyebilir.
                </p>
            </>
        ),
    },
    {
        title: "16. Kişisel veriler",
        content: (
            <>
                <p>
                    İnternet sitesi üzerinden toplanan kişisel
                    verilerin işlenmesine ilişkin ayrıntılı bilgiler
                    KVKK Aydınlatma Metni ve Gizlilik Politikası
                    sayfalarında açıklanmaktadır.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                        href="/kvkk"
                        className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold transition hover:border-[#27D66B]/50 hover:text-[#27D66B]"
                    >
                        KVKK Metni
                    </Link>

                    <Link
                        href="/privacy"
                        className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold transition hover:border-[#27D66B]/50 hover:text-[#27D66B]"
                    >
                        Gizlilik Politikası
                    </Link>
                </div>
            </>
        ),
    },
    {
        title: "17. Koşullarda yapılabilecek değişiklikler",
        content: (
            <p>
                Bu Kullanım Koşulları; internet sitesinin,
                etkinliklerin, topluluk yapısının veya yürürlükteki
                mevzuatın değişmesi durumunda güncellenebilir. Güncel
                koşullar her zaman bu sayfada yayımlanır.
            </p>
        ),
    },
    {
        title: "18. İletişim",
        content: (
            <p>
                Bu koşullarla ilgili soru ve taleplerinizi{" "}
                <a
                    href="mailto:iletisim@hollysport.net"
                    className="font-semibold text-[#27D66B] underline decoration-[#27D66B]/40 underline-offset-4"
                >
                    iletisim@hollysport.net
                </a>{" "}
                adresine iletebilirsiniz.
            </p>
        ),
    },
];

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-white">
            <Navbar />

            <section className="border-b border-white/10 px-6 py-20 sm:py-28 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#27D66B]">
                        Yasal Bilgilendirme
                    </p>

                    <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.05em] sm:text-6xl">
                        Kullanım Koşulları
                    </h1>

                    <p className="mt-6 max-w-3xl text-base leading-8 text-white/50 sm:text-lg">
                        Holly Sport internet sitesini ve topluluk
                        etkinliklerini kullanırken geçerli olan temel
                        kurallar, haklar ve sorumluluklar.
                    </p>

                    <div className="mt-7 flex flex-wrap gap-3 text-sm">
                        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/50">
                            Topluluk yöneticisi: Umut Küçük
                        </span>

                        <a
                            href="mailto:iletisim@hollysport.net"
                            className="rounded-full border border-[#27D66B]/20 bg-[#27D66B]/5 px-4 py-2 text-[#27D66B] transition hover:bg-[#27D66B]/10"
                        >
                            iletisim@hollysport.net
                        </a>
                    </div>

                    <p className="mt-5 text-sm text-white/30">
                        Son güncelleme: 23 Temmuz 2026
                    </p>
                </div>
            </section>

            <section className="px-6 py-16 sm:py-20 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <div className="space-y-5">
                        {sections.map((section) => (
                            <article
                                key={section.title}
                                className="rounded-3xl border border-white/10 bg-[#111111] p-6 sm:p-8"
                            >
                                <h2 className="text-xl font-bold sm:text-2xl">
                                    {section.title}
                                </h2>

                                <div className="mt-5 text-sm leading-7 text-white/55 sm:text-base">
                                    {section.content}
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="mt-10 rounded-3xl border border-[#27D66B]/20 bg-[#27D66B]/5 p-6 sm:p-8">
                        <h2 className="text-xl font-bold">
                            Sorun veya talebin mi var?
                        </h2>

                        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">
                            Kullanım koşulları, etkinlik kuralları veya
                            katılım süreciyle ilgili bize
                            ulaşabilirsin.
                        </p>

                        <Link
                            href="/contact"
                            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#27D66B] px-7 text-sm font-bold text-[#050505] transition hover:bg-[#45e27f]"
                        >
                            İletişime Geç
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}