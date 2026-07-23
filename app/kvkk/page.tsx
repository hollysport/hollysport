import type { Metadata } from "next";
import Link from "next/link";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export const metadata: Metadata = {
    title: "KVKK Aydınlatma Metni | Holly Sport",
    description:
        "Holly Sport internet sitesi üzerinden işlenen kişisel verilere ilişkin KVKK aydınlatma metni.",
};

const sections = [
    {
        title: "1. Veri sorumlusu",
        content: (
            <>
                <p>
                    Holly Sport; herhangi bir şirket, dernek, vakıf veya
                    başka bir tüzel kişiliğe bağlı olmayan, bağımsız ve
                    gönüllülük esaslı bir spor topluluğudur.
                </p>

                <p className="mt-4">
                    6698 sayılı Kişisel Verilerin Korunması Kanunu
                    kapsamında, Holly Sport internet sitesi üzerinden
                    gerçekleştirilen kişisel veri işleme faaliyetleri
                    bakımından veri sorumlusu Umut Küçük&apos;tür.
                </p>

                <p className="mt-4">
                    Kişisel verilerinizle ilgili sorularınız ve KVKK
                    kapsamındaki başvurularınız için{" "}
                    <a
                        href="mailto:iletisim@hollysport.net"
                        className="font-semibold text-[#27D66B] underline decoration-[#27D66B]/40 underline-offset-4"
                    >
                        iletisim@hollysport.net
                    </a>{" "}
                    adresi üzerinden iletişime geçebilirsiniz.
                </p>
            </>
        ),
    },
    {
        title: "2. İşlenen kişisel veriler",
        content: (
            <>
                <p>
                    Kullandığınız sayfa, form veya hizmete bağlı olarak
                    aşağıdaki kişisel verileriniz işlenebilir:
                </p>

                <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-[#27D66B]">
                    <li>Ad ve soyad bilgisi</li>
                    <li>E-posta adresi</li>
                    <li>Telefon numarası</li>
                    <li>Doğum tarihi veya yaş bilgisi</li>
                    <li>
                        Formda talep edilmesi hâlinde cinsiyet bilgisi
                    </li>
                    <li>Şehir veya konum bilgisi</li>
                    <li>Etkinlik ve spor branşı tercihleri</li>
                    <li>Etkinlik başvuru ve katılım bilgileri</li>
                    <li>Soru, talep, öneri ve mesaj içerikleri</li>
                    <li>Gönüllülük ve destek başvurusu bilgileri</li>
                    <li>Kurum, firma veya organizasyon bilgileri</li>
                    <li>
                        Kullanıcı tarafından yüklenen fotoğraf ve dosyalar
                    </li>
                    <li>
                        IP adresi, tarayıcı bilgileri ve güvenlik kayıtları
                        gibi teknik işlem bilgileri
                    </li>
                </ul>
            </>
        ),
    },
    {
        title: "3. Kişisel verilerin işlenme amaçları",
        content: (
            <>
                <p>
                    Kişisel verileriniz aşağıdaki amaçlarla işlenebilir:
                </p>

                <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-[#27D66B]">
                    <li>
                        Etkinlik başvurularının alınması ve
                        değerlendirilmesi
                    </li>
                    <li>Katılımcılarla iletişim kurulması</li>
                    <li>
                        Etkinlik yeri, tarihi, saati ve olası
                        değişikliklerin bildirilmesi
                    </li>
                    <li>
                        Etkinlik kapasitesi ve katılımcı süreçlerinin
                        yönetilmesi
                    </li>
                    <li>
                        Topluluk faaliyetlerinin planlanması ve
                        yürütülmesi
                    </li>
                    <li>
                        Gönüllülük ve destek başvurularının
                        değerlendirilmesi
                    </li>
                    <li>
                        Bireysel ve kurumsal iş birliği süreçlerinin
                        yürütülmesi
                    </li>
                    <li>
                        Topluluk görüşlerinin, izin verilmesi hâlinde
                        yayımlanması
                    </li>
                    <li>
                        Soru, talep, öneri ve şikâyetlerin
                        cevaplandırılması
                    </li>
                    <li>
                        İnternet sitesinin ve kullanıcı deneyiminin
                        geliştirilmesi
                    </li>
                    <li>
                        Bilgi güvenliği ve internet sitesi güvenliğinin
                        sağlanması
                    </li>
                    <li>
                        Hukuki yükümlülüklerin yerine getirilmesi ve
                        hakların korunması
                    </li>
                </ul>
            </>
        ),
    },
    {
        title: "4. Kişisel verilerin toplanma yöntemi",
        content: (
            <>
                <p>
                    Kişisel verileriniz; Holly Sport internet sitesinde
                    bulunan etkinlik başvurusu, topluluğa katılım,
                    destek, gönüllülük, görüş ve iletişim formları
                    üzerinden elektronik ortamda toplanır.
                </p>

                <p className="mt-4">
                    Tarafınızca iletişim kurulması hâlinde e-posta,
                    telefon, WhatsApp, sosyal medya ve diğer topluluk
                    iletişim kanalları üzerinden de kişisel veri elde
                    edilebilir.
                </p>
            </>
        ),
    },
    {
        title: "5. Kişisel verilerin işlenmesinin hukuki sebepleri",
        content: (
            <>
                <p>
                    Kişisel verileriniz, 6698 sayılı Kanun&apos;un 5.
                    maddesinde düzenlenen kişisel veri işleme şartlarına
                    dayanılarak işlenir.
                </p>

                <p className="mt-4">
                    Veri işleme faaliyetinin niteliğine göre aşağıdaki
                    hukuki sebeplerden biri veya birkaçı uygulanabilir:
                </p>

                <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-[#27D66B]">
                    <li>Açık rızanızın bulunması</li>
                    <li>
                        Bir sözleşmenin kurulması veya ifasıyla doğrudan
                        ilgili olması
                    </li>
                    <li>
                        Veri sorumlusunun hukuki yükümlülüğünü yerine
                        getirebilmesi
                    </li>
                    <li>
                        Bir hakkın tesisi, kullanılması veya korunması
                        için veri işlemenin zorunlu olması
                    </li>
                    <li>
                        Temel hak ve özgürlüklerinize zarar vermemek
                        kaydıyla meşru menfaatler için veri işlemenin
                        zorunlu olması
                    </li>
                </ul>
            </>
        ),
    },
    {
        title: "6. Kişisel verilerin aktarılması",
        content: (
            <>
                <p>
                    Kişisel verileriniz, yalnızca hizmetlerin
                    yürütülmesi için gerekli ve ölçülü olduğu durumlarda
                    aşağıdaki kişi ve hizmet sağlayıcılarla
                    paylaşılabilir:
                </p>

                <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-[#27D66B]">
                    <li>
                        Holly Sport etkinliklerinin yürütülmesinde görev
                        alan yetkili ekip üyeleri ve gönüllüler
                    </li>
                    <li>
                        Etkinlik mekânı, ulaşım, ekipman veya organizasyon
                        hizmeti sunan iş ortakları
                    </li>
                    <li>
                        İnternet sitesi barındırma ve yayın hizmeti
                        sağlayan Vercel
                    </li>
                    <li>
                        Veri tabanı, kimlik doğrulama ve dosya depolama
                        hizmeti sağlayan Supabase
                    </li>
                    <li>
                        Teknik destek, e-posta ve iletişim hizmeti
                        sağlayıcıları
                    </li>
                    <li>
                        Kanunen yetkili kamu kurumları ve adli makamlar
                    </li>
                </ul>

                <p className="mt-4">
                    Kişisel verileriniz ticari amaçlarla üçüncü kişilere
                    satılmaz. Paylaşım yalnızca belirtilen amaçların
                    gerçekleştirilmesi için gerekli olduğu ölçüde
                    yapılır.
                </p>
            </>
        ),
    },
    {
        title: "7. Yurt dışına kişisel veri aktarımı",
        content: (
            <>
                <p>
                    Holly Sport internet sitesinde kullanılan barındırma,
                    veri tabanı, dosya depolama ve benzeri teknoloji
                    hizmetlerinin altyapıları Türkiye dışında
                    bulunabilir.
                </p>

                <p className="mt-4">
                    Bu hizmetlerin kullanılması nedeniyle kişisel
                    verilerin yurt dışında bulunan sunucularda
                    saklanması veya işlenmesi söz konusu olabilir.
                </p>

                <p className="mt-4">
                    Yurt dışına kişisel veri aktarımı gerçekleştirilmesi
                    hâlinde, 6698 sayılı Kanun&apos;un 9. maddesi ve
                    ilgili mevzuatta düzenlenen yeterlilik kararı, uygun
                    güvenceler veya kanunda belirtilen diğer aktarım
                    şartları dikkate alınır.
                </p>
            </>
        ),
    },
    {
        title: "8. Kişisel verilerin saklanma süresi",
        content: (
            <>
                <p>
                    Kişisel verileriniz, toplandıkları amaç için gerekli
                    olan süre boyunca ve ilgili hukuki yükümlülüklerin
                    gerektirdiği ölçüde saklanır.
                </p>

                <p className="mt-4">
                    Etkinlik başvuruları, iletişim talepleri, destek
                    başvuruları ve benzeri kayıtlar; ilgili sürecin
                    tamamlanması, olası uyuşmazlıkların çözülmesi ve
                    gerekli kayıtların tutulması amacıyla makul bir süre
                    boyunca muhafaza edilebilir.
                </p>

                <p className="mt-4">
                    Kişisel verilerin işlenmesini gerektiren sebeplerin
                    ortadan kalkması hâlinde veriler, mevzuata uygun
                    şekilde silinir, yok edilir veya anonim hâle
                    getirilir.
                </p>
            </>
        ),
    },
    {
        title: "9. Kişisel verilerin güvenliği",
        content: (
            <>
                <p>
                    Kişisel verilerin hukuka aykırı olarak işlenmesini,
                    kaybolmasını, değiştirilmesini ve verilere yetkisiz
                    erişilmesini önlemek amacıyla makul teknik ve idari
                    güvenlik tedbirleri uygulanır.
                </p>

                <p className="mt-4">
                    Yönetim ekranlarına erişim yetkilendirilmiş
                    hesaplarla sınırlandırılır. Veri tabanı ve dosya
                    erişimleri rol ve yetki kurallarıyla korunur.
                </p>

                <p className="mt-4">
                    Bununla birlikte, internet üzerinden
                    gerçekleştirilen hiçbir veri aktarımı veya
                    elektronik saklama yönteminin tamamen risksiz olduğu
                    garanti edilemez.
                </p>
            </>
        ),
    },
    {
        title: "10. İlgili kişinin hakları",
        content: (
            <>
                <p>
                    6698 sayılı Kanun&apos;un 11. maddesi kapsamında,
                    kişisel verilerinizle ilgili olarak aşağıdaki
                    haklara sahipsiniz:
                </p>

                <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-[#27D66B]">
                    <li>
                        Kişisel verilerinizin işlenip işlenmediğini
                        öğrenme
                    </li>
                    <li>
                        Kişisel verileriniz işlenmişse buna ilişkin bilgi
                        talep etme
                    </li>
                    <li>
                        Verilerin işlenme amacını ve amacına uygun
                        kullanılıp kullanılmadığını öğrenme
                    </li>
                    <li>
                        Verilerin aktarıldığı üçüncü kişileri öğrenme
                    </li>
                    <li>
                        Eksik veya yanlış işlenen verilerin
                        düzeltilmesini isteme
                    </li>
                    <li>
                        Kanunda belirtilen şartların oluşması hâlinde
                        verilerin silinmesini veya yok edilmesini isteme
                    </li>
                    <li>
                        Düzeltme, silme veya yok etme işlemlerinin
                        verilerin aktarıldığı üçüncü kişilere
                        bildirilmesini isteme
                    </li>
                    <li>
                        Otomatik sistemler aracılığıyla yapılan analizler
                        sonucunda aleyhinize bir durum ortaya çıkmasına
                        itiraz etme
                    </li>
                    <li>
                        Kanuna aykırı veri işlenmesi nedeniyle zarara
                        uğramanız hâlinde zararın giderilmesini talep
                        etme
                    </li>
                </ul>
            </>
        ),
    },
    {
        title: "11. Başvuru yöntemi",
        content: (
            <>
                <p>
                    KVKK kapsamındaki taleplerinizi{" "}
                    <a
                        href="mailto:iletisim@hollysport.net"
                        className="font-semibold text-[#27D66B] underline decoration-[#27D66B]/40 underline-offset-4"
                    >
                        iletisim@hollysport.net
                    </a>{" "}
                    adresine e-posta göndererek iletebilirsiniz.
                </p>

                <p className="mt-4">
                    Başvurunuzda adınızın, soyadınızın, iletişim
                    bilgilerinizin, talebinizin konusu ve açıklamasının
                    bulunması gerekir. Talebin size ait olduğunun
                    doğrulanması amacıyla ek bilgi veya belge
                    istenebilir.
                </p>

                <p className="mt-4">
                    Başvurular, talebin niteliğine göre mümkün olan en
                    kısa sürede ve en geç 30 gün içerisinde
                    sonuçlandırılır.
                </p>
            </>
        ),
    },
    {
        title: "12. Metinde yapılabilecek değişiklikler",
        content: (
            <p>
                Bu aydınlatma metni; internet sitesinde sunulan
                hizmetlerin, kullanılan altyapının veya yürürlükteki
                mevzuatın değişmesi durumunda güncellenebilir. Güncel
                metin her zaman bu sayfada yayımlanır.
            </p>
        ),
    },
];

export default function KvkkPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-white">
            <Navbar />

            <section className="border-b border-white/10 px-6 py-20 sm:py-28 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#27D66B]">
                        Yasal Bilgilendirme
                    </p>

                    <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.05em] sm:text-6xl">
                        KVKK Aydınlatma Metni
                    </h1>

                    <p className="mt-6 max-w-3xl text-base leading-8 text-white/50 sm:text-lg">
                        Holly Sport internet sitesi üzerinden toplanan
                        kişisel verilerin hangi amaçlarla işlendiğini,
                        saklandığını, aktarıldığını ve korunduğunu
                        açıklayan bilgilendirme metnidir.
                    </p>

                    <div className="mt-7 flex flex-wrap gap-3 text-sm">
                        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/50">
                            Veri sorumlusu: Umut Küçük
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
                                <h2 className="text-xl font-bold text-white sm:text-2xl">
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
                            Kişisel verilerinle ilgili bir talebin mi
                            var?
                        </h2>

                        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">
                            Bilgi alma, düzeltme, silme veya diğer KVKK
                            taleplerini bize e-posta yoluyla
                            ulaştırabilirsin.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <a
                                href="mailto:iletisim@hollysport.net?subject=KVKK%20Başvurusu"
                                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#27D66B] px-7 text-sm font-bold text-[#050505] transition hover:bg-[#45e27f]"
                            >
                                KVKK Başvurusu Gönder
                            </a>

                            <Link
                                href="/contact"
                                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-7 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
                            >
                                İletişim Sayfası
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}