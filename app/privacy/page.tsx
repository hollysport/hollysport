import type { Metadata } from "next";
import Link from "next/link";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export const metadata: Metadata = {
    title: "Gizlilik Politikası | Holly Sport",
    description:
        "Holly Sport internet sitesinin gizlilik, veri kullanımı ve güvenlik politikası.",
};

const sections = [
    {
        title: "1. Politikanın kapsamı",
        content: (
            <>
                <p>
                    Bu Gizlilik Politikası, Holly Sport internet
                    sitesini ziyaret eden veya internet sitesindeki
                    hizmetleri kullanan kişilere ait bilgilerin nasıl
                    toplandığını, kullanıldığını, saklandığını,
                    aktarıldığını ve korunduğunu açıklar.
                </p>

                <p className="mt-4">
                    Holly Sport; herhangi bir şirket, dernek, vakıf
                    veya kuruma bağlı olmayan, bağımsız ve gönüllülük
                    esaslı bir spor topluluğudur.
                </p>
            </>
        ),
    },
    {
        title: "2. Toplanan bilgiler",
        content: (
            <>
                <p>
                    Kullandığınız hizmete ve doldurduğunuz forma bağlı
                    olarak aşağıdaki bilgiler toplanabilir:
                </p>

                <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-[#27D66B]">
                    <li>Ad ve soyad</li>
                    <li>E-posta adresi</li>
                    <li>Telefon numarası</li>
                    <li>Yaş veya doğum tarihi</li>
                    <li>
                        Formda talep edilmesi hâlinde cinsiyet bilgisi
                    </li>
                    <li>Şehir veya konum bilgisi</li>
                    <li>Spor branşı ve etkinlik tercihleri</li>
                    <li>Etkinlik başvuru ve katılım bilgileri</li>
                    <li>İletişim, soru ve mesaj içerikleri</li>
                    <li>Gönüllülük ve destek başvurusu bilgileri</li>
                    <li>Kurum veya firma bilgileri</li>
                    <li>
                        Topluluk görüşleri ve kullanıcı tarafından
                        yüklenen fotoğraflar
                    </li>
                    <li>
                        IP adresi, tarayıcı bilgisi ve sistem
                        güvenliğiyle ilgili teknik kayıtlar
                    </li>
                </ul>
            </>
        ),
    },
    {
        title: "3. Bilgilerin kullanım amaçları",
        content: (
            <>
                <p>
                    Toplanan bilgiler aşağıdaki amaçlarla
                    kullanılabilir:
                </p>

                <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-[#27D66B]">
                    <li>
                        Etkinlik başvurularını almak ve değerlendirmek
                    </li>
                    <li>
                        Etkinlik katılımcılarıyla iletişim kurmak
                    </li>
                    <li>
                        Etkinlik bilgilerini ve olası değişiklikleri
                        bildirmek
                    </li>
                    <li>
                        Katılımcı sayısını ve etkinlik kapasitesini
                        yönetmek
                    </li>
                    <li>Topluluk faaliyetlerini planlamak</li>
                    <li>
                        Gönüllülük ve destek başvurularını
                        değerlendirmek
                    </li>
                    <li>
                        Bireysel ve kurumsal iş birliği taleplerini
                        incelemek
                    </li>
                    <li>
                        Kullanıcı izni bulunması hâlinde topluluk
                        görüşlerini yayımlamak
                    </li>
                    <li>Soru ve mesajlara cevap vermek</li>
                    <li>
                        İnternet sitesinin işleyişini ve kullanıcı
                        deneyimini geliştirmek
                    </li>
                    <li>
                        Güvenliği sağlamak ve kötüye kullanımı önlemek
                    </li>
                    <li>
                        Hukuki yükümlülükleri yerine getirmek
                    </li>
                </ul>
            </>
        ),
    },
    {
        title: "4. Bilgilerin paylaşılması",
        content: (
            <>
                <p>
                    Kişisel bilgileriniz ticari amaçlarla satılmaz veya
                    kiralanmaz.
                </p>

                <p className="mt-4">
                    Bilgileriniz yalnızca ilgili sürecin yürütülmesi
                    için gerekli ve ölçülü olması hâlinde aşağıdaki
                    taraflarla paylaşılabilir:
                </p>

                <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-[#27D66B]">
                    <li>
                        Yetkili Holly Sport ekip üyeleri ve gönüllüleri
                    </li>
                    <li>
                        Etkinliğin gerçekleştirilmesinde görev alan
                        mekân, ulaşım, ekipman ve organizasyon iş
                        ortakları
                    </li>
                    <li>
                        Teknik altyapı ve barındırma hizmeti
                        sağlayıcıları
                    </li>
                    <li>
                        Veri tabanı, kimlik doğrulama ve dosya depolama
                        hizmeti sağlayıcıları
                    </li>
                    <li>
                        E-posta ve iletişim hizmeti sağlayıcıları
                    </li>
                    <li>
                        Kanunen yetkili kamu kurumları ve adli makamlar
                    </li>
                </ul>
            </>
        ),
    },
    {
        title: "5. Kullanılan altyapı hizmetleri",
        content: (
            <>
                <p>
                    Holly Sport internet sitesinin çalışabilmesi için
                    üçüncü taraf teknik hizmetlerden
                    yararlanılmaktadır.
                </p>

                <ul className="mt-4 list-disc space-y-3 pl-5 marker:text-[#27D66B]">
                    <li>
                        <strong className="text-white">
                            Vercel:
                        </strong>{" "}
                        İnternet sitesinin barındırılması ve
                        yayınlanması
                    </li>

                    <li>
                        <strong className="text-white">
                            Supabase:
                        </strong>{" "}
                        Veri tabanı, kimlik doğrulama ve dosya depolama
                        işlemleri
                    </li>
                </ul>

                <p className="mt-4">
                    Bu hizmet sağlayıcıların teknik altyapıları ve
                    sunucuları Türkiye dışında bulunabilir. Bu nedenle
                    bazı bilgiler, hizmetlerin çalışması kapsamında
                    yurt dışında saklanabilir veya işlenebilir.
                </p>

                <p className="mt-4">
                    Yurt dışına kişisel veri aktarımı söz konusu
                    olduğunda yürürlükteki mevzuatta düzenlenen aktarım
                    şartları ve uygun güvence yöntemleri dikkate alınır.
                </p>
            </>
        ),
    },
    {
        title: "6. Çerezler ve benzeri teknolojiler",
        content: (
            <>
                <p>
                    İnternet sitesinin düzgün çalışması, oturum
                    güvenliğinin sağlanması ve kullanıcı tercihlerinin
                    korunması amacıyla zorunlu çerezler veya benzeri
                    teknik kayıtlar kullanılabilir.
                </p>

                <p className="mt-4">
                    Zorunlu olmayan analiz, reklam veya takip
                    teknolojilerinin kullanılmaya başlanması hâlinde
                    kullanıcılara ayrıca bilgi verilir ve gerekli
                    durumlarda tercihlerini yönetme imkânı sunulur.
                </p>
            </>
        ),
    },
    {
        title: "7. Bilgilerin saklanması",
        content: (
            <>
                <p>
                    Kişisel bilgileriniz yalnızca toplandıkları amaç
                    için gerekli olan süre boyunca ve ilgili hukuki
                    yükümlülüklerin gerektirdiği ölçüde saklanır.
                </p>

                <p className="mt-4">
                    Etkinlik, iletişim, görüş ve destek kayıtları;
                    ilgili sürecin tamamlanması, olası uyuşmazlıkların
                    çözülmesi, güvenliğin sağlanması ve hukuki
                    yükümlülüklerin yerine getirilmesi amacıyla makul
                    bir süre muhafaza edilebilir.
                </p>

                <p className="mt-4">
                    Verilerin işlenmesini gerektiren sebepler ortadan
                    kalktığında veriler, mevzuata uygun şekilde
                    silinir, yok edilir veya anonim hâle getirilir.
                </p>
            </>
        ),
    },
    {
        title: "8. Bilgi güvenliği",
        content: (
            <>
                <p>
                    Kişisel bilgilere yetkisiz erişilmesini,
                    bilgilerin değiştirilmesini, açıklanmasını,
                    kaybolmasını veya hukuka aykırı biçimde
                    kullanılmasını önlemek amacıyla makul teknik ve
                    idari güvenlik tedbirleri uygulanır.
                </p>

                <p className="mt-4">
                    Yönetim sayfalarına erişim yetkili kullanıcılarla
                    sınırlandırılır. Veri tabanı ve dosya erişimleri
                    rol tabanlı erişim kurallarıyla korunur.
                </p>

                <p className="mt-4">
                    Bununla birlikte internet üzerinden yapılan hiçbir
                    veri aktarımının veya elektronik saklama yönteminin
                    tamamen güvenli olduğu garanti edilemez.
                </p>
            </>
        ),
    },
    {
        title: "9. Etkinlik fotoğrafları ve görüntüler",
        content: (
            <>
                <p>
                    Holly Sport etkinlikleri sırasında topluluk
                    faaliyetlerinin tanıtılması, duyurulması ve
                    belgelenmesi amacıyla fotoğraf ve video çekimleri
                    yapılabilir.
                </p>

                <p className="mt-4">
                    Bu görüntüler Holly Sport internet sitesinde,
                    sosyal medya hesaplarında veya topluluk
                    duyurularında paylaşılabilir.
                </p>

                <p className="mt-4">
                    Bulunduğunuz bir görüntünün kaldırılmasını talep
                    etmek için{" "}
                    <a
                        href="mailto:iletisim@hollysport.net"
                        className="font-semibold text-[#27D66B] underline decoration-[#27D66B]/40 underline-offset-4"
                    >
                        iletisim@hollysport.net
                    </a>{" "}
                    adresinden iletişime geçebilirsiniz.
                </p>
            </>
        ),
    },
    {
        title: "10. Topluluk görüşleri ve profil fotoğrafları",
        content: (
            <>
                <p>
                    Kullanıcıların gönderdiği topluluk görüşleri,
                    yıldız puanları, üyelik süresi bilgileri ve profil
                    fotoğrafları yalnızca gerekli izinlerin verilmesi
                    ve yönetim onayının ardından internet sitesinde
                    yayımlanabilir.
                </p>

                <p className="mt-4">
                    Yayımlanmış bir görüşün veya fotoğrafın
                    kaldırılmasını talep etmek için bizimle iletişime
                    geçebilirsiniz.
                </p>
            </>
        ),
    },
    {
        title: "11. Diğer internet siteleri",
        content: (
            <p>
                Holly Sport internet sitesi başka internet sitelerine,
                mesajlaşma servislerine veya sosyal medya
                platformlarına bağlantılar içerebilir. Bu
                platformların gizlilik uygulamalarından Holly Sport
                sorumlu değildir. Ziyaret ettiğiniz platformların
                kendi gizlilik metinlerini incelemeniz önerilir.
            </p>
        ),
    },
    {
        title: "12. Haklarınız ve iletişim",
        content: (
            <>
                <p>
                    Kişisel verileriniz hakkında bilgi alma, düzeltme,
                    silme veya işlemeye itiraz etme gibi taleplerinizi{" "}
                    <a
                        href="mailto:iletisim@hollysport.net"
                        className="font-semibold text-[#27D66B] underline decoration-[#27D66B]/40 underline-offset-4"
                    >
                        iletisim@hollysport.net
                    </a>{" "}
                    adresine gönderebilirsiniz.
                </p>

                <p className="mt-4">
                    Kişisel verilerin işlenmesine ilişkin ayrıntılı
                    bilgi için KVKK Aydınlatma Metni&apos;ni
                    inceleyebilirsiniz.
                </p>
            </>
        ),
    },
    {
        title: "13. Politika değişiklikleri",
        content: (
            <p>
                Bu politika; internet sitesinde sunulan hizmetlerin,
                kullanılan altyapının veya yürürlükteki mevzuatın
                değişmesi durumunda güncellenebilir. Politikanın
                güncel sürümü her zaman bu sayfada yayımlanır.
            </p>
        ),
    },
];

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-white">
            <Navbar />

            <section className="border-b border-white/10 px-6 py-20 sm:py-28 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#27D66B]">
                        Yasal Bilgilendirme
                    </p>

                    <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.05em] sm:text-6xl">
                        Gizlilik Politikası
                    </h1>

                    <p className="mt-6 max-w-3xl text-base leading-8 text-white/50 sm:text-lg">
                        Holly Sport internet sitesini kullanırken
                        bilgilerinizin nasıl toplandığını,
                        kullanıldığını, saklandığını ve korunduğunu
                        açıklayan politikadır.
                    </p>

                    <div className="mt-7 flex flex-wrap gap-3 text-sm">
                        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/50">
                            Sorumlu: Umut Küçük
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
                            Daha ayrıntılı bilgi
                        </h2>

                        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">
                            Kişisel verilerin işlenme şartları ve
                            haklarınla ilgili ayrıntıları KVKK
                            Aydınlatma Metni&apos;nde inceleyebilirsin.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                href="/kvkk"
                                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#27D66B] px-7 text-sm font-bold text-[#050505] transition hover:bg-[#45e27f]"
                            >
                                KVKK Metnini İncele
                            </Link>

                            <Link
                                href="/contact"
                                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-7 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
                            >
                                İletişime Geç
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}