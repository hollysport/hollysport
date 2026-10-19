# Changelog — Holly Sport

Önemli değişiklikler tarih sırasıyla (en yeni üstte). Tarihler `git log` çıktısından alınmıştır.

## 2026-10-19 — Ana sayfa Destekçiler: "Aktif Yatırımcılar / Tüm Zamanlar" butonları

- **İstek:** Destekçiler bölümünde başlığın altında yan yana iki basit buton (dropdown yok): **Aktif Yatırımcılar** (admin'de aktif işaretlenenler) ve **Tüm Zamanlar** (geçmişte veya hâlen destek vermiş aktif + pasif tüm kayıtlar); sayfa yenilenmeden liste değişimi.
- **Şema değişikliği YOK:** `is_active` kolonu zaten vardı — `individual_supporters` (`lib/supabase/database.types.ts:314`) ve `sponsors` (`:348`). Veri sıfırlanmadı, mevcut kayıtlar korundu.
- **RLS doğrulaması (salt-okunur):** anon (yayın) anahtarıyla pasif satırlar da okunabiliyor → "Tüm Zamanlar" gerçek veriyle çalışır. DB durumu: 33 bireysel destekçi (10 aktif / 23 pasif; kategoriler: individual 29, angel_investor 1, volunteer 3).
- **Admin paneli zaten hazırdı — değişiklik yapılmadı:** ekleme formunda "Yayın durumu" seçimi (`add-supporter-form.tsx:196–218`), mevcut kartlarda kategori + durum düzenleme ve silme (`supporter-actions.tsx:41–73`), listede Tümü/Aktif/Pasif filtresi + sayılar (`app/admin/supporters/page.tsx:88–96`). Pasife alınan kayıt silinmiyor; yalnızca `is_active=false` oluyor ve "Tüm Zamanlar"da geçmişiyle kalıyor.
- **Yeni bileşen:** `components/support/SupporterTickerPanel.tsx` (client) — "Destekçilerimiz" kartı başlığının hemen altında iki pill buton (`role="group"`, `aria-pressed`); seçili buton `bg-[#27D66B] text-ink`, diğeri `border-line bg-white text-ink-soft`; `flex-row flex-wrap` ile aynı satırda, sığmazsa sarar (mobil uyumlu). Mod değişince listenin "Daha fazla göster" katlanma durumu sıfırlanır.
- **`SupporterTicker.tsx`:** isteğe bağlı `toolbar` prop'u eklendi — başlık ile liste arasına render edilir; prop verilmezse eski görünüm aynen korunur (geriye dönük uyumlu).
- **`Supporters.tsx`:** `individual_supporters` sorgusundaki `.eq("is_active", true)` kaldırılıp `is_active` kolonu seçildi; tek sorgu sırayı (sort_order → created_at) koruyarak hem aktif hem tüm listeyi üretiyor. Kapsam kararı: kategori filtresi (`angel_investor` + `individual`) ve Kurumsal (sponsors) bölümü eskisi gibi yalnızca aktif — butonlar yalnızca bireysel **isim listesini** anahtarlar; statik veri yok, her iki liste de DB'den.
- **Kontroller:** `npx tsc --noEmit` exit 0; `npm run lint` 0 hata (5 önceden varan `<img>`); `npm run build` exit 0; `git diff --check` temiz. SSR HTML doğrulandı: butonlar kart içinde h3'ün altında, seçili buton yeşil sınıfıyla, isim listesi butonların altında, "Daha fazla göster" aktif (8+ isim).
- **Doğrulama sınırı:** masaüstü tarayıcı bu oturumda da bağlı değildi → buton tıklama etkileşimi ve mobil yerleşim ekran görüntüsüyle doğrulanamadı; TODO'ya manuel kontrol maddesi eklendi.
- **Production yayını (`612dc58`):** push → Vercel Git entegrasyonuyla canlıya alındı (~46 sn). **Canlı HTML doğrulandı** (`hollysport.net`): iki buton kart içinde başlığın altında, seçili buton yeşil / diğer beyaz kenarlı, `role="group"` + `aria-pressed` erişilebilirliği, isim listesi butonların altında, Kurumsal bölüm + CTA korunmuş.

## 2026-10-17 — Ana sayfa SEO: eski "3D anatomi" mesajı kaldırıldı, marka tanıtımı düzeltildi

- **İstek:** Google'da `hollysport.net` için eski "3D Anatomi Destekli Yeni Nesil Antrenman" mesajı yerine Holly Sport'un **bağımsız spor topluluğu** olarak tanıtılması.
- **Kök neden:** Tüm metadata tek kaynaktan geliyor — `app/layout.tsx` (ana sayfada `metadata` override'ı yok, tüm rotalar root layout'tan miras alıyor). Eski antrenman-odaklı mesaj üç alandaydı: `description`, `openGraph.description`, `twitter.description`.
- **Yeni SEO başlığı:** `Holly Sport | Bağımsız Spor Topluluğu` (root `title`, `og:title`, `twitter:title`).
- **Yeni meta açıklaması:** "Holly Sport; spor, sosyalleşme ve yeni deneyimler etrafında insanları bir araya getiren bağımsız bir spor topluluğudur. Etkinliklere katıl, yeni insanlarla tanış ve hareketin bir parçası ol." — `openGraph` ve `twitter` artık tek `siteDescription` sabitini paylaşıyor (üç ayrı metin tekrarı giderildi, ileride tek yerden güncellenir).
- **Antrenman sayfası korundu:** `/training` kendi metadata'sını ("Antrenman Merkezi" + kalori/metabolizma açıklaması) kullanmaya devam ediyor; 3D anatomi haritası gerçek bir antrenman özelliği (`AnatomyMap3D`) olarak sayfa içeriğinde duruyor — silinmedi, yalnızca genel marka metadata'sından eski cümle kaldırıldı.
- **Kontroller:** `npx tsc --noEmit` exit 0; `npm run lint` 0 hata (5 önceden varan `<img>`); `npm run build` exit 0 (dev durdurularak alındı); `git diff --check` temiz. Kodda "3D anatomi destekli / Yeni Nesil Antrenman" referansı kalmadı.
- **Doğrulama:** yerel dev sunucusunda `<title>`, `description`, `og:title`, `og:description`, `twitter:title`, `twitter:description` hepsi yeni değerlerle doğrulandı; eski "3D anatomi / yeni nesil" ifadesi ana sayfada yok.
- **Production yayını (`d9c36a4`):** push → Vercel Git entegrasyonu canlıya aldı. **Canlı HTML doğrulandı** (`hollysport.net`): `<title>` + `description` + `og:title`/`og:description` + `twitter:title`/`twitter:description` hepsi yeni değerlerle; eski "3D anatomi / Yeni Nesil Antrenman" ifadesi yok.
- **Not:** Google eski başlığı önbellekte tutabilir → ana sayfanın yeniden dizine eklenmesi için Search Console'dan **URL Denetimi** ile manuel "Tarayıcı olarak doğrula + Dizine ekle" gönderilmeli (bu işlem Google tarafında, otomatik yapılmaz).

## 2026-10-16 — Production yayını: 9 mantıklı commit push edildi, Vercel'e canlı alındı

- **Git:** `main` branch'ine, `origin` (github.com/hollysport/hollysport) üzerinden **9 mantıklı commit** push edildi (taban `bb26148` → `f5b68c9`). 198 dosya / +3817 / −2516. Çalışma ağacı push sonrası temiz. Gruplar: (1) görseller + `next/image`, (2) beyaz tema + global bağlantı renk katmanı, (3) admin paneli (sol menü/logo/aktivite akışı), (4) sayfa sadeleştirmeleri, (5) destek formu seçeneği, (6) navbar/footer/kimlik beyaz tema, (7) SEO metadata/manifest/sitemap/ikon, (8) kullanılmayan bölüm silmeleri, (9) dokümanlar + `.gitignore`. `.env*`, `.next/`, `.vercel`, derleme çıktıları ve geçici dosyalar commit edilmedi (önceden ignore).
- **Vercel:** push, Vercel'in Git entegrasyonuyla `main`'e otomatik production deployment tetikledi. Canlı kanıt: yeni CSS chunk'ı (`/_next/static/chunks/34d661z8w7whi.css`) ve `a{color:inherit;text-decoration:none}` kuralının `@layer base`'e taşındığı (index 12895 → `.text-white` index 55512'den önce → utilities kazanır). Geçici `.holly-hero-secondary-link` canlı CSS'te yok.
- **Canlı sayfa kontrolleri (HTTP 200):** `/`, `/faq`, `/events`, `/gallery`, `/admin/login`. Ana sayfa hero butonu "Etkinlikleri Keşfet" canlıda `<a href="/events">` içinde `text-white` + `border-white` + `bg-transparent` + `focus-visible:ring-white`, ok `stroke="currentColor"` olarak render ediliyor.
- **Doğrulama sınırı:** masaüstü tarayıcı oturumu bağlı değildi → ekran görüntülü/görsel kontrast teyidi yapılamadı; kontroller HTTP + servis edilen CSS kaskad kanıtı + render edilen HTML üzerinden. `npm run build` push'tan önce exit 0 (dev durdurularak alındı); Vercel kendi build'ini de başarıyla tamamlayıp yayına aldı (canlı sayfalar yeni chunk ile 200).

## 2026-10-16 — Genel bağlantı renkleri: `a { color: inherit }` katman sorunu küresel olarak giderildi

- **Kök neden (küresel düzeltme):** `app/globals.css` içindeki `a { color: inherit; text-decoration: none; }` kuralı **katmansız (unlayered)** yazıldığı için CSS katman önceliği gereği `@layer utilities`'taki `.text-white`, `.text-holly-ink`, `hover:text-*` gibi **tüm** renk yardımcı sınıflarını eziyordu → bağlantılarda renk sınıfları hiç uygulanmıyordu (bağlantılar daima `body`/üst rengi devralıyordu). Bu, tek bir hero butonunu değil, sitedeki bağlantı renk sistemini etkiliyordu.
- **Düzeltme:** kural `@layer base` katmanına taşındı (Tailwind preflight'inin yanına). `text-decoration: none` aynı katmanda korundu; `text-white`/`text-holly-ink`/diğer metin renkleri artık `utilities > base` önceliğiyle bağlantıları doğru şekilde etkiliyor. `!important`/inline style **kullanılmadı**. `button, a { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }` dokunma kuralı ve diğer tüm globals kuralları değişmedi.
- **Hero butonu (`components/sections/Hero.tsx`):** "Etkinlikleri Keşfet" butonunun şeffaf zemin (`bg-transparent`), tam beyaz kenarlık (`border-white`) ve beyaz metin (`text-white`) durumu korundu; geçici `.holly-hero-secondary-link` özel sınıfı (önceki ara çözüm) hem `globals.css`'ten hem JSX'ten **güvenle kaldırıldı** — katman düzeltmesi artık `text-white`'in kendisini uyguladığı için gereksizdi. Hedef (`/events`), boyut, hover/focus durumları ve yeşil "Topluluğa Katıl" CTA'sı değişmedi.
- **Etki denetimi (68 gerçek `<a>`/`<Link>`):** otomatik + manuel inceleme. **Beyaz zeminde `text-white` (görünmez metin riski) yok.** `text-holly-ink` + `bg-holly-ink/10` kombinasyonları (KVKK/privacy/terms mailto rozetleri) açık yeşil tint üzerine koyu yeşil metin → kontrast iyi. `text-ink` + dolu yeşil zemin (`bg-holly`/`bg-[#27D66B]`) bağlantıları (etkinlik katılım, "Ana sayfaya dön", profil aksiyonları, SSS/galeri/destek CTA'ları) koyu metin/yeşil zemin → kontrast iyi. Navbar, footer, etkinlik kartları, SSS ve admin bağlantılarında renk davranışında istenmeyen kayma yok. Renk yardımcı sınıfları artık eskisi gibi (tasarlandığı gibi) çalışıyor.
- **Doğrulama:** dev sunucusu `.next/dev` önbelleği (5.6 GB) temizlenip yeniden başlatıldı (CSS katman değişimi önbekte kaldığı için servis edilmiyordu). Servis edilen CSS kaskad kanıtı: `a{color:inherit;text-decoration:none}` → `@layer base` (index 16066), `.text-white`/`.text-holly-ink` → `@layer utilities` (70567/68493) → utilities > base. Render edilen hero butonunda `text-white` + `border-white` + `bg-transparent` + hover/focus sınıfları var, geçici sınıf hiç geçmiyor, ok ikonu `stroke="currentColor"`, yeşil CTA yerinde. `npx tsc --noEmit` exit 0; `npm run lint` 0 hata (5 önceden varan `<img>`); `npm run build` exit 0 (dev durdurularak alındı); `git diff --check` temiz.
- **Doğrulama sınırı:** masaüstü tarayıcı oturumu **bağlı değil** → ana sayfa, navbar, `/faq`, `/events`, `/gallery`, `/admin/login` ve buton kontrastı **ekran görüntüsüyle** teyit edilemedi (HTTP + servis edilen CSS kaskad kanıtı üzerinden değerlendirildi).

## 2026-10-16 — Sadeleştirme, etkinlik düzeni ve destek formu güncellemesi (commit bekliyor)

- **Ana sayfa Hero butonu (`components/sections/Hero.tsx`):** "Etkinlikleri Keşfet" (kullanıcının deyişiyle "Etkinlikleri Gör") butonu koyu zemin üzerinde soluk görünüyordu. Kenarlık `border-white/45` → `border-white`, zemin `bg-black/40` + `backdrop-blur-md` → `bg-transparent`, hover `hover:bg-black/60` → `hover:bg-white/10` (kenarlık hover'da tam beyaz). Metin ve ok ikonu `text-white` ile beyaz kaldı; boyut (`min-h-12`, `px-7`), hizalama ve tıklama hedefi değişmedi. Yeşil ana CTA ("Topluluğa Katıl") dokunulmadı. Opak beyaz zemin eklenmedi.
- **Etkinlikler (`app/events/page.tsx`):** geçmiş etkinlik kartları bilinçli olarak ayrı kart tipine alındı — yalnızca **kare** kapak/afiş (`aspect-square` + `object-cover`, esnetme yok), **etkinlik adı** ve **tarih**. Uzun açıklama, katılımcı sayısı, kategori/rozet gibi ikincil bilgiler geçmiş kartlardan kaldırıldı; yaklaşan etkinlik kartları mevcut zengin görünümünü korudu. Tüm kartlar mevcut `/events/[slug]` rotasına bağlı (yeni URL yok). Otomatik sınıflandırma (`ends_at` ↔ `getCurrentTimestamp()`, epoch kıyası — saat dilimi kaynaklı kayma yok) ve "Tamamlanan etkinlikler otomatik olarak bu bölüme taşınır" yardımcı metni mevcut davranışta korundu; `status = "published"` filtresi nedeniyle admin iptali (`cancelled`) etkinlikleri zaten bu bölüme düşmez, bu durum değiştirilmedi.
- **Etkinlik detayı (`app/events/[slug]/page.tsx`):** yalnızca **geçmiş** etkinliklerde açıklama (`short_description` hero paragrafı + "Bilmen gerekenler" gövdesi) ve **Katılımcı sayısı** satırı gizlendi; ad, kapak görseli, tarih/saat/konum/seviye/ücret ve "Etkinlik tamamlandı" durumu görünür kaldı. Geçmiş etkinlikte adres yoksa sol sütun tamamen boş kalmasın diye düzen otomatik tek sütuna düşer ve bilgi kartı ortalanır. Yaklaşan etkinliklerin detayları, katılım koşulları ve kayıt butonu (`QuickJoinButton` / `/join`) değişmedi.
- **Hakkımızda (`app/about/page.tsx`):** giriş metnin yanına gerçek topluluk fotoğrafı eklendi (`/images/about/about-commun.jpg`, 2160×1131 — projede zaten kullanılan görsel, stok görsel yok). `next/image` `fill` + `aspect-[19/10]` (görsel oranı korunur, esnetme/kırpma yok), `alt` + `figcaption` ("Holly Sport topluluğu"). Masaüstünde metin ve görsel `md:grid-cols-[1fr_320px]` ile yan yana; mobilde tek sütun, metin üstte görsel altta.
- **Antrenman (`app/training/page.tsx` + `components/training/MetabolismCalculator.tsx`):** "Nasıl hesaplıyoruz?" başlığı, BMR/TDEE/hedef açıklamaları ve yan sütun (`aside`) tamamen kaldırıldı; artık kullanılmayan boş 420px sütun düzeni de temizlendi (`lg:grid-cols-[1fr_420px]` → `max-w-4xl` tek kart). Tıbbi uyarı metni ("Bu araç genel bilgilendirme amaçlıdır…") başlığa ait olmadığı için korundu ve hesaplayıcı kartının altına taşındı. 3D harita açıklaması ("3D haritadan birden fazla kas grubu seç…") kaldırıldı; 3D anatomi haritası, kas seçimi ve program üretici (`WorkoutGenerator`) aynen duruyor.
- **Galeri (`components/gallery/GalleryGrid.tsx`):** "Tüm Branşlar kategorisinde 186 fotoğraf gösteriliyor." metni ve kategori değişince güncellenen sayaç kaldırıldı; yalnızca bu metinde kullanılan `selectedBranchName` değişkeni silindi. Filtre (select), "Tüm Branşlar", URL `?branch=` senkronu ve lightbox davranışı değişmedi.
- **SSS (`app/faq/page.tsx`):** giriş açıklaması ("Etkinlikler, katılım süreci ve Holly Sport topluluğu hakkında merak edilen soruların cevapları."), "Dönüş süreci" kartı (başlık + açıklaması) ve alttaki "Etkinlikleri İncele" CTA bölümü bütünüyle kaldırıldı; kullanılmayan `Link` importu temizlendi. Başlık, 12 soru-cevap ve "Bize doğrudan sor." form bölümü korundu. Navbar'daki `/faq` bağlantısı değişmedi.
- **Ana sayfa sadeleştirme:** yan yana iki `/events` bağlantısından "Etkinlik takvimi" kaldırıldı ("Tüm etkinlikler" başlıkta korundu; alttaki sayaç satırı sadeleştirildi). `components/sections/Faq.tsx` içindeki "Katılım süreci ve etkinlikler hakkında en çok sorulan soruların cevaplarını burada bulabilirsin." kaldırıldı (sorular ve "Tüm Soruları Gör" kaldı). `components/sections/Supporters.tsx` içindeki "İsimler, yatırımcıların seçtiği gizlilik tercihine göre gösterilmektedir." kaldırıldı (destekçi/sponsor verisi silinmedi).
- **Destek Ol formu (`components/support/SupportForm.tsx` + `app/api/forms/support/route.ts` + admin ekranları):** etiketler `financial_support` → **"Maddi destek"**, `social_media` → **"Sosyal medya"**; yeni seçenek **"Gönüllü öğrenci temsilcisi"** (`student_representative`) listeye eklendi. Yalnız etiket değil, akış da güncellendi: sunucu doğrulama listesi `allowedSupportTypes`'a `student_representative` eklendi (aksi halde gönderim "En az bir geçerli destek türü" hatasıyla reddedilirdi); `app/admin/support-requests/page.tsx` etiket haritası güncellendi (`financial_support: "Maddi destek"`), `app/admin/supporters/page.tsx` haritasına da aynı etiket eklendi (başvuru destekçiye dönüştürülürse etiket doğru görünsün). Eski değerler (`financial_support` vb.) aynen çalışmaya devam ediyor; Turnstile, rate limit, KVKK ve diğer doğrulamalar değişmedi. **DB şeması değiştirilmedi** — `support_types` el yazımı tiplerde `string[]`.
- **Destek Ol sayfası (`app/destek-ol/page.tsx`):** "Başvurudan sonra ne olacak?" kartı (başlık + 4 adım; `<ol>` içinde elle yazılmış "1. 2. 3. 4." nedeniyle çift numaralandırma görünüyordu) bütünüyle kaldırıldı. Form, gönder butonu, KVKK onayı ve başarı/hata durumları korundu.
- **Doğrulama:** `npx tsc --noEmit` exit 0; `npm run lint` 0 hata (5 önceden varan `<img>` uyarısı); `npm run build` ✓ Compiled successfully; `git diff --check` temiz. HTTP ile canlı teyit (dev sunucu): `/` Hero butonu `border border-white bg-transparent`, "Etkinlik takvimi" / SSS açıklaması / gizlilik cümlesi yok; `/training` "Nasıl hesaplıyoruz?" ve "3D haritadan" yok; `/gallery` sayaç yok (filtre başlığı duruyor); `/faq` giriş/Dönüş süreci/CTA yok; `/about` görsel + alt metin var; `/destek-ol` yeni 3 etiket var, eski 2 etiket ve "Başvurudan sonra ne olacak?" yok; `/events` kare geçmiş kartlar render oldu ve 3 geçmiş etkinlik detayında açıklama/Katılımcı satırı gizli, tarih görünür.
- **Doğrulama sınırı:** masaüstü tarayıcı oturumu **bağlı değil** → buton kontrastı, kare afişler, mobil hizalama ve lightbox **ekran görüntüsüyle** teyit edilemedi (kod + render edilen HTML üzerinden değerlendirildi). DB seviyesinde `support_types` CHECK/ENUM kısıtı salt-okunur yolla sorgulanamadı (`exec_sql` RPC yok); yeni değer için gerekiyorsa kullanıcı aşağıdaki SQL'i dashboard'dan çalıştırabilir:
  ```sql
  select column_name, data_type, udt_name from information_schema.columns
  where table_schema='public' and table_name='support_requests' and column_name='support_types';
  select conname, pg_get_constraintdef(oid) as definisyon from pg_constraint
  where conrelid='public.support_requests'::regclass
    and pg_get_constraintdef(oid) ilike '%support_types%';
  ```
  `udt_name` `text[]` ve ikinci sorgu boş dönerse ek işlem gerekmez.

## 2026-10-16 — Commit öncesi son temizlik: geçici görsel artıkları + .gitignore (commit bekliyor)

- **Silinen geçici dosyalar (yalnızca bu ikisi):** `public/images/gallery/diger/IMG_9448.jpeg.~tmp` (19.06 MB) ve `public/images/gallery/trekkinghiking/IMG_6266.jpg~RFa1d1972.TMP` (0 KB). Her ikisi de Windows gorsel editörü/indirme artığı (`.~tmp` / `~RF*.TMP`), **git HEAD'de commit'lenmiş** ve `public/` boyutunu +19 MB şişiriyordu. Kullanıcı ikinci dosya için `diger/` yazmıştı; **gerçek klasör `trekkinghiking/`** (audit raporundakiyle aynı) — tüm ağaçtaki tek RF artığı buydu. Başka hiçbir `.tmp`/`.jpg`/`.jpeg` dosyasına dokunulmadı; `git rm`/toplu silme **yapılmadı** (düz dosya silme; ikisi de `git status`'ta ` D` olarak kayıtlı, henüz commit edilmedi).
- **`.gitignore`:** mevcut kurallar korunarak `*.~tmp` ve `*~RF*.TMP` eklendi. `git check-ignore -v` ile doğrulandı: temp desenleri eşleşiyor (`.gitignore:80`/`:81`), normal galeri/ekip fotoğrafları (`.jpg`/`.jpeg`/`.JPG`) **ignore edilmiyor**. Silinen iki dosya zaten izlendiğinden `.gitignore` tek başına yeterli değildi; silme + kural birlikte, ileride aynı isimlendirmeyle oluşan artıkların takip edilmeyen olarak eklenmesini engeller.
- **Doğrulama:** `git status` D sayısı 5 → 7; `public/` altında kalan temp artık **0**; `npx tsc --noEmit` exit 0; `npm run lint` 0 hata (5 önceden varan `<img>`); `npm run build` başarılı.
- **Görsel doğrulama sınırı:** masaüstü tarayıcı oturumu **bağlı değil** → admin login/sidebar/etkinlik/bildirim ekranları **ekran görüntüsüyle teyit edilemedi**. Bunun yerine HTTP + kod incelemesi: `/admin/login` 200, HTML'de gerçek logo (`icon-512.png` via `next/image` optimizer) var, eski `>HS<` yok, sidebar/drawer yok (login dışında); `lib/admin/navigation.ts` 13 gerçek rota/5 grup + `matchPrefix` + çapa-asla-aktif; `admin-shell.tsx` aktif vurgu (`aria-current` + yeşil sol kenarlık + `bg-holly/10`) + mobil drawer (rota değişince kapanma, Escape, body scroll kilidi, odak tuzağı/geri dönüşü, `aria-modal`). Bu kod incelemesidir, görsel onay değildir.

## 2026-10-16 — Marka logosu, görsel optimizasyonu ve `next/image` geçişi (commit bekliyor)

- **Gerçek logo:** Admin panelindeki "HS" metin monogramı yerine projenin **gerçek Holly Sport logosu** (`public/icons/icon-512.png` — beyaz HS + yörünge çizgileri, koyu zemin) `next/image` ile kondu. `components/admin/admin-shell.tsx` (sidebar `BrandBlock`) ve `app/admin/login/page.tsx` güncellendi; oranlar korunuyor (kare kaynak + `object-cover` → esneme yok), anlamlı `alt` eklendi, kırık beyaz zemin üzerinde koyu yuvarlak karo olarak net görünüyor. Yeni logo dosyası veya kopya **eklenmedi**.
- **Görsel optimizasyonu (ölçümlü):** `public/` altındaki **3 MB'tan büyük 75 JPEG/PNG** kaynak (en kötüsü 8192×5464 / 35 MB) gerçek kullanım çözünürlüğüne indirildi (galeri 1600px, hero 2000px genişlik tavanı; format ve **dosya adları korundu**, asla büyütme yapılmadı, kalite 82). Toplam **683.7 MB → 30.6 MB** (≈653 MB kazanç); hero `9.2 MB → 0.67 MB`. `next/image` böylece devasa orijinal decode etmek zorunda kalmıyor.
- **`next/image` geçişi:** Etkinlik kapak/görselleri CSS `backgroundImage` yerine `next/image` + `fill` + gerçek `sizes` ile gösteriliyor: `app/events/page.tsx` (EventCard), `app/events/[slug]/page.tsx` (kapak `priority` + galeri), `components/sections/UpcomingEventsClient.tsx`. Uzak (Supabase Storage) optimizasyonu için `next.config.ts`'e `remotePatterns` eklendi (`ycxxopwtddzkmkjrwdii.supabase.co/storage/v1/object/public/**`).
- **Galeri deterministik:** `app/gallery/page.tsx`'ten sunucu tarafı `Math.random()` shuffle'ı kaldırıldı (build'de bir kez çalışıp sabitleniyordu, client zaten `GalleryGrid`'de karıştırıyordu → gereksiz iş + görsel atlama riski). Karıştırma tek yerde, istemcide.
- **Admin layout log temizliği:** `app/admin/layout.tsx`'teki `catch`, Next.js'in statik prerender çıkış sinyalini ("dynamic server usage") **yeniden fırlatıyor** (yutulmuyor) — böylece framework'ün dynamic işaretleme mekanizması bozulmuyor; yalnız gerçek hatalar loglanıyor, build çıktısındaki gürültü kalktı.
- **Doğrulama:** `npx tsc --noEmit` exit 0; `npm run lint` 0 hata (5 önceden varan `<img>` uyarısı); `npm run build` başarılı (41 route, tüm admin rotaları dynamic ƒ). HTTP smoke `/`, `/gallery`, `/events`, `/admin/login`, `/faq` → 200; SSR HTML'de hero referansı ve `/faq` linki var, eski `>HS<` monogramı yok; dev log'da **hydration uyarısı yok**. Görseller `sharp` metadata ile geçerli ve beklenen boyutta doğrulandı. Tarayıcı (görsel/konsol) oturumu bağlı olmadığından ekran görüntülü teyit yapılamadı.

## 2026-10-15 - Admin paneli: kalıcı sol menü (ortak layout + sidebar) (commit bekliyor)

- **Ortak kabuk:** `app/admin/layout.tsx` (sunucu) + `components/admin/admin-shell.tsx` (istemci) eklendi. Artık `/admin` altındaki **tüm iç rotalar** (login hariç) aynı sidebar'ı paylaşır; etkinlikten egzersize geçerken sol menü yerinde kalır, yalnızca sağdaki içerik değişir. Sidebar her sayfaya ayrı ayrı kopyalanmadı.
- **Menü verisi tek kaynak:** `lib/admin/navigation.ts` — projede **gerçekten var olan** 13 rota, 5 mantıklı grup altında (Genel / İçerik / İnsanlar / Antrenman / Destek). Sahte bağlantı yok; `matchPrefix` ile `/admin/events/new` ve `/admin/events/[id]/edit` "Etkinlikler" öğesini aktif tutar.
- **Güvenlik korundu:** Layout **yetkilendirme yapmaz** (`/admin/login` de bu layout'tan geçtiği için `requireAdmin` çağrılamaz; redirect döngüsü olurdu). Her rotanın kendi `requireAdmin` kontrolü (`lib/auth/require-admin.ts`) aynen çalışıyor; `proxy.ts`/RLS/rol kontrolüne dokunulmadı. Layout'taki oturum okuması yalnız sidebar'daki yönetici adı içindir.
- **Login hariç:** `AdminShell`, `usePathname() === "/admin/login"` olduğunda sidebar/drawer üretmeden children döner; giriş ekranı mevcut tasarımında ve oturum akışında kaldır.
- **Aktif durum + bildirim:** Aktif öğede sol kenarlık + hafif yeşil zemin (`#27D66B` kontrollü); hover/focus-visible görünür. Bildirim erişimi sidebar'dan; `Bildirimler` → `/admin#bildirim-merkezi` çapası, dashboard'daki mevcut Bildirim Merkezi bölümüne (`id="bildirim-merkezi"`, `scroll-mt`) bağlandı. Yeni bildirim sistemi/rote yok; okunmamış sayısı mevcut sistemde olmadığı için ek sorgu yapılmadı.
- **Mobil:** Hamburger + tam yükseklik drawer; arka plan tıklama, Escape, rota değişince kapanma, body scroll kilidi, odak kapat-m-butonuna/geri-dönüş ve odak tuzağı (Tab) uygulandı. Masaüstünde sidebar sabit (fixed) ve kendi içinde kaydırılır; içerik `lg:pl-[17rem]` ile hizalanır.
- **Sayfa sadeleştirme:** Sidebar geldikten sonra gereksiz tekrarlar kaldırıldı: "← Geri Dön"/"← Yönetim paneli"/"Panele Dön"/"Admin Paneline Dön" geri linkleri ve "Admin Paneli" eyebrow'ları (`exercises`, `reviews`, `questions`, `events`, `support-requests`, `supporters`, `sponsors`, `custom-training-requests`, `registrations`, `users`). h1 + açıklayıcı metin ve mevcut işlem butonları (ör. "Yeni Etkinlik Ekle") korundu; kullanılmayan `Link`/`logout`/ikon importları temizlendi.
- **Dashboard:** Header'daki mükerrer "Siteyi aç"/"Çıkış yap" kaldırıldı (sidebar alt bölümünde mevcut); hoş geldin metriği ve sayfa içi kartlar/ağlar aynen duruyor.
- **Doğrulama:** `npm run lint` 0 hata (5 önceden varan `<img>` uyarısı); `npm run build` başarılı (41 route; tüm admin rotaları dynamic ƒ — `cookies()` beklenen). HTTP smoke: `/admin/login` 200 (sidebar/nav/drawer yok, form var), `/admin` ve `/admin/events` 307 → auth yönlendirmesi çalışıyor. `npx tsc --noEmit` yalnız `.next/dev/types/validator.ts` içinde üretilmiş dosya yarışması hatası veriyor (dev sunucusu tip dosyalarını yeniden yazarken tsc bayat okuyor); kaynak kodda hata yok ve `npm run build`'in kendi type-check'i geçti.
- **Not:** Giriş yapılmış oturumla görsel/tarayıcı konsolu doğrulaması yapılamadı (masaüstü tarayıcı oturumu bağlı değil); sidebar'ın auth'lı sayfalarda görünmesi ve drawer davranışı ekran görüntüsüyle teyit edilmedi.

## 2026-10-15 - Türkçe karakter kodlama bozukluğu giderildi (app/faq/page.tsx) (commit bekliyor)

- **Belirti:** `/faq` sayfasında mojibake — `SÄ±kÃ§a sorulan sorular` yerine `Sıkça sorulan sorular` bekleniyordu; `YardÄ±m Merkezi`, `Ä°stanbulâ€™da`, `ÅŸekil` vb. 35 satır etkilenmişti.
- **Kök neden (kaynak doğrulandı):** Bozukluk **repoda değil, bu oturumdaki bir işlemde** oluştu. `app/faq/page.tsx`'e PowerShell `Get-Content` + `Set-Content -Encoding UTF8` ile girinti düzeltmesi yapılmıştı; `Get-Content` **BOM'suz** UTF-8 dosyayı sistem kod sayfası (ANSI/cp1254) okuyup `Set-Content` bunu UTF-8 olarak geri yazdı → **çift kodlama (UTF-8 baytları Latin-1 gibi yorumlandı)**. Kanıt: `git show HEAD:app/faq/page.tsx` dosyanın **doğru** olduğunu (`Sıkça Sorulan Sorular`) gösterdi; yani bozukluk commit'lenmiş kodda değil çalışma ağacındaydı.
- **Kapsam taraması:** Projenin tamamı (`.ts/.tsx/.js/.jsx/.json/.md/.css/.html/.txt/.sql`, `.git`/`node_modules`/`.next` hariç) **bayt seviyesinde** mojibake desenine (`Ã`/`Ä`/`Å` + devam baytı, `â€™`) karşı tarandı → **tek bozuk dosya `app/faq/page.tsx`** (213 mojibake dizisi). Yanlış pozitif görünen `app/auth/actions.ts` ve `lib/events/registration-status.ts` UTF-8 doğrulamasıyla temiz çıktı (konsol display kaynaklı).
- **Onarım:** Yalnız o dosya, ters dönüşümle onarıldı (mojibake string → cp1254 baytları → UTF-8 decode). Metinler orijinal anlamlarına döndü; **yalnızca string değerleri değişti**, kod yapısı/Navbar+Footer importları/section düzeni korundu. Yeni encoding katmanı veya dönüştürme fonksiyonu **eklenmedi**. Dış veri kaynağına (Supabase vb.) müdahale **gerekmedi** — sorun kod dosyasındaydı.
- **Doğrulama:** Bayt seviyesi mojibake taraması 0; `grep` mojibake desenleri 0 eşleşme; `/faq` HTTP 200 → UTF-8 HTML'de `Sıkça` ×7, `İstanbul` ×6, `katılabilir` ×6, `SÄ±kÃ§a` ×0; `npx tsc --noEmit` temiz; `npm run lint` 0 hata (5 önceden varan `<img>` uyarısı); `npm run build` başarılı.
- **Önleme notu:** Windows + PowerShell'de BOM'suz UTF-8 dosyalarda `Get-Content`/`Set-Content` **kullanılmamalı**; okuma/yazma için UTF-8'i açıkça ver (`Get-Content -Encoding UTF8` / `[System.IO.File]::ReadAllText/WriteAllText(..., UTF8Encoding($false))`) veya editör/code-mode araçlarını kullan.

## 2026-10-15 — Hydration mismatch: kök neden SSS link hot-reload uyuşmazlığı (kod tarafı tutarlı, commit bekliyor)

- **Teşhis (dev log stack trace'i):** `.next/dev/logs/next-development.log` içindeki React hydration uyarısının diff'i Net bir kanıt veriyordu: `+ href="/#faq"` (client'ın beklediği) − `href="/faq"` (sunucunun gönderdiği) + metin `SSS`. Uyarı yalnız `/` (HomePage) üzerinde, `HomePage → main → Navbar → header → nav → LinkComponent → SSS` yolunda idi. Yani uyuşmazlık **Navbar'daki SSS bağlantısının anchor `href`** değerindeydi.
- **Neden:** Aynı gün içinde SSS hedefi `/#faq` → `/faq` olarak değiştirilmişti (navbar + footer + contact). Sunucu tarafı dosyayı okuyup yeni değeri (`/faq`) üretti; buna karşılık tarayıcı tarafı bundle'ı bir sonraki hot-reload turunda tam güncellenmemiş olmalı ki eski değeri (`/#faq`) bekledi. Kodun kendisinde iki değer birlikte **bulunmuyor** (grep `href="/#faq"` = 0 eşleşme).
- **Doğrulama (fark edilip izole edilen):** dev sunucusu temiz `.next/dev` cache ile yeniden başlatıldı; SSR HTML'de `href="/faq"` 3, `href="/#faq"` **0**; ardından dev log'unda yeni hydration uyarısı **yok**. `npx tsc --noEmit` temiz, `npm run lint` 0 hata (5 önceden varan `<img>` uyarısı), `npm run build` başarılı (41 route).
- **Düzeltme (kod tarafında ek değişiklik gerekmedi):** Sunucu ve client ilk çıktısı `/faq` üzerinden hizalı. Gerekçesiyle `suppressHydrationWarning` **eklenmedi**; `typeof window`/`Date.now()`/`Math.random()` tabanlı başka bir hydration kaynağı taranıp bulunamadı (`GalleryGrid` shuffle `useEffect`+`requestAnimationFrame` içinde, tarih formatları sabit `timeZone: "Europe/Istanbul"`, `EventMarquee`'deki `window.innerWidth` yalnız olay dinleyicisinde).
- **Not:** Ekran görüntülü tarayıcı konsolu testi yapılamadı (masaüstü tarayıcı oturumu bağlı değildi); kanıt dev log + SSR HTML + grep üçlüsü. Kalıcı kalan ihtimaller: 3000 portundaki eski (02:28 tarihli) dev oturumunun bayat bundle'ı, olası tarayıcı eklentisi HTML müdahalesi (kanıt yok). Ayrık `scroll-behavior: smooth` uyarısı hydration ile ilgisiz, ayrı konu.

## 2026-10-15 — SSS navigasyonu `/faq`'ya yönlendirildi + SEO/erişilebilirlik düzeltmeleri (commit bekliyor)

- **SSS linkleri:** `components/layout/navbar.tsx` (masaüstü + mobil, ortak `navigation` dizisi) ve `components/layout/footer.tsx` içindeki SSS hedefi `/#faq` → **`/faq`** oldu (`next/link`). `app/contact/page.tsx` içindeki "Sıkça Sorulan Sorular" kartı da aynı şekilde `/faq`'ya düzeltildi (tutarlılık). Ana sayfa kısa SSS bölümü (`Faq.tsx`, `id="faq"`) ve `/faq` üzerindeki "Tüm Soruları Gör" butonu korundu; diğer navbar linkleri değiştirilmedi.
- **`/faq` artık tam sayfa:** `app/faq/page.tsx`'e `Navbar` + `Footer` eklendi (daha önce hiç yoktu); iç içe `section` yapısı kardeş `section`lara ayrıldı ve eksik fragment/parent düzeltildi. `/faq` hem linkten hem doğrudan yenilemede 200 döndürüyor.
- **Eksik metadata'lar eklendi:** `/events` (`title`/`description`), `/events/[slug]` (`generateMetadata`, bulunamayınca başlık), `/join`, `/team`.
- **Sitemap:** `app/sitemap.ts`'e `/faq`, `/training`, `/bir-hayalim-var` rotaları eklendi (önceden yoktu).
- **Testimonials N+1 giderildi:** `components/reviews/TestimonialsSection.tsx` — foto başına ayrı `createSignedUrl` yerine tek **`createSignedUrls`** batch çağrısı; onaylı yorum sayısı ve ortalama hesaplaması (tüm onaylı yorumlar) aynı kaldı, davranış değişmedi.
- **Doğrulama:** `npx tsc --noEmit` temiz; `npm run lint` 0 hata (yalnız önceden varan 5 `<img>` uyarısı); `npm run build` başarılı (41 route, `/faq` static ○). HTTP: `/faq` 200 + navbar/footer'da 2 `/faq` linki; `/` ve `/contact` 200, `/#faq` izi kalmadı (her üçünde de `href="/faq"` mevcut).
- **Not:** Ekran görüntülü görsel/tık denetimi yapılamadı (tarayıcı oturumu bağlı değildi); doğrulama HTTP/HTML üzerinden. Görsel performans bulguları (aşağıda) bu görevde **dokunulmadan** raporlandı.

## 2026-10-15 — İkonlar: şeklin tuvaldeki boşluğu azaltılıp büyük boyut netliği (commit bekliyor)

- **Teşhis (piksel analizi):** İkon PNG'leri tamamen opak **siyah** kare; içindeki açık gri amblem yatay (1.6:1) olduğu için dikeyde büyük boşluk bırakıyordu. 512×512'de şekil yalnızca 444×277 idi (**üst 124px / alt 111px** boş), 192×192'de 120×78 (**üst 73px** boş). Marka yeşili hiç yoktu (sadece siyah + gri). Şeffaf kenar değildi — bu yüzden kırpma/ölçekleme çözüm oldu. `app/icon.png`/`apple-icon.png` bunun kopyasıydı, aynı sorunu taşıyordu. `public/icon-192|512.png` (kök) ise zaten yok — manifest `/icons/` altını gösteriyor, yollar tutarlı.
- **Çözüm:** `public/icons/icon-512.png` içindeki şeklin içerik sınır kutusu (bbox) bulunup kırpıldı, **orantılı** olarak tuval genişliğinin %96'sına ölçeklendi (deformasyon yok), siyah zemine dikey ortalanarak yapıştırıldı. Dikey boşluk **124/111 → 103/103px**, şekil **444×277 → 490×306** (genişlik doluluğu %86,7 → **%95,7**). 192 varyantı aynı master'dan üretildi (şekil 120×78 → 156×115). `app/icon.png` ve `app/apple-icon.png` yeni 512 master'ın kopyası.
- **favicon.ico çok boyutlu yeniden üretildi:** Tek 64×64 yerine **64/48/32/16** dört PNG girişi (toplam 6.627 B) — küçük boyutta (16px sekme) netlik için. `app/manifest.ts` ve `layout.tsx` metadata'sına dokunulmadı.
- **Doğrulama:** HTTP 200 — `/icon.png` 74.204 B (disk ile birebir), `/favicon.ico` 6.627 B, `/apple-icon.png` 74.204 B, `/icons/icon-192|512.png` ve `/manifest.webmanifest`. HTML content-hash'leri değişti (`?icon.2so4e2tyjf58g`, `?favicon.0rl9rt39f06vo`). Yoğunluk haritaları şekil büyümesini doğruluyor. Yedek: `%TEMP%\opencode\icon-backup-20261015`.
- **Not:** Ekran görüntülü görsel doğrulama yapılamadı (tarayıcı bağlı değil); kanıt piksel/HTTP analizi. Şeklin en-boy oranı (1.6:1) korundu, yeni arka plan/çerçeve eklenmedi.

## 2026-10-15 — Site ikonları: sekme/Apple ikonları yeni PWA ikonuyla eşitlendi (commit bekliyor)

- **Teşhis:** Yeni ikonlar yalnızca `public/icons/icon-192.png` + `icon-512.png`'ye (manifest/PWA) yazılmıştı; git bunları `M` olarak gösteriyordu ve manifest yolları tutarlıydı. Ancak tarayıcı sekmesi ikonu Next.js convention dosyalarından gelir — `app/favicon.ico`, `app/icon.png`, `app/apple-icon.png` **hiç dokunulmamış** ve Temmuz 2026 hallerindeydi. Bu bir önbellek sorunu **değil** (hash sabitti çünkü dosya değişmemişti).
- **Çözüm:** `public/icons/icon-512.png` (512×512) esas alınarak `app/icon.png` ve `app/apple-icon.png` üzerine birebir kopyalandı; `app/favicon.ico` aynı görselden 64×64 PNG olarak üretilip geçerli ICO kabına (ICONDIR+ICONDIRENTRY, 32-bit, PNG imzalı payload) sarıldı. `app/manifest.ts` ve metadata referanslarına dokunulmadı — yollar zaten tutarlıydı.
- **Doğrulama:** HTTP 200 — `/icon.png` 65.950 B (disk ile birebir), `/favicon.ico` 2.584 B, `/apple-icon.png` 65.950 B, `/icons/icon-192|512.png` ve `/manifest.webmanifest` sorunsuz. HTML'deki content-hash'ler yeni içeriğe göre değişti (`?icon.2y8ko4xd1nl9_`, `?favicon.2__pschsqz3_x`, `?apple-icon.2y8ko4xd1nl9_`) → eski dosya cache'lenmiyordu. `apple-touch-icon` `sizes` değeri gerçek boyutla 1254×1254 → 512×512 oldu (Next görsel boyutunu okuyor). Git: üçü de `M`.
- Not: `admin/`, Supabase ve ilgisiz dosyalara dokunulmadı; ikon dosyaları yeniden adlandırılmadı.

## 2026-10-15 — Ana sayfa hero: buton düzeni + "Etkinlikleri Keşfet" görünürlüğü (commit bekliyor)

- `components/sections/Hero.tsx`: birkaç dakika önce eklenen **"Etkinliğe Katıl"** butonu (bkz. aşağıdaki giriş) tamamen kaldırıldı — başlık, açıklama, arka plan görseli ve diğer içerikler değişmedi; artık kullanılmayan kod/import yok (`Link` ve `ArrowRight` hâlâ kalan butonlarda kullanılıyor).
- Kalan iki butonun doğal sırası korundu: **"Topluluğa Katıl"** (WhatsApp, `bg-[#25D366] text-ink`, `target="_blank"`) birincil yeşil CTA olarak ilk sırada; **"Etkinlikleri Keşfet"** (`/events` hedefi değişmedi) ikincil buton olarak yanında. `flex-col gap-3` (mobil, tam genişlik üst üste) / `sm:flex-row` (yatay) yerleşimi kaldı; ilk buton kalkınca boşluk oluşmadı (flex doğal olarak daraldı).
- **"Etkinlikleri Keşfet" kontrast düzeltmesi:** `border-white/15 bg-white/5` (görsel üzerinde neredeyse görünmez) → **`border-white/45 bg-black/40`** + `text-white` + `backdrop-blur-md`; hover `border-white/80 bg-black/60`, focus `focus-visible:ring-2 ring-white/70` (+ global `:focus-visible` outline). Artık hero fotoğrafının parlak bölgelerinde de net görünüyor; hafif yarı saydam koyu yüzey hissi korundu.
- Doğrulama: `npx tsc --noEmit` ✓, `npm run lint` 0 hata (5 önceden varan `<img>` uyarısı); localhost:3000 render'ında hero CTA satırı yalnız iki buton (WhatsApp + `/events`, yeni sınıflarıyla) ve hero bölgesinde "Etkinliğe Katıl" / `/join` izi kalmadığı doğrulandı. Ekran görüntülü mobil/masaüstü denetimi yapılamadı (tarayıcı bağlı değil).

## 2026-10-15 — Form ağırlıklı sayfalar: koyu tema → beyaz tema (commit bekliyor)

- Rehberdeki (`holly-theme-guide.md`) token/eşleme kurallarıyla **form ağırlıklı sayfa ve bileşenler** beyaz temaya geçirildi; mantık (Turnstile, rate limit, Supabase, server action, handler, animasyon) hiç değişmedi.
- Dönüşen dosyalar: `/training` (+ `MetabolismCalculator`, `WorkoutGenerator`, `ProgramRequestDialog`, `select-controls`, `AnatomyMap3D`), `/join` (+ `registration-form`), `/destek-ol` (+ `SupportForm`), `/bir-hayalim-var` (+ `DreamForm`), `ReviewForm`, `/profile` (+ `profile-dashboard`, `avatar-selector`), `auth-dialog`, `/update-password`, `/kvkk`, `/privacy`, `/terms`, `app/loading|error|not-found`.
- Form alanları `bg-white text-ink border-line placeholder:text-ink-soft` + `focus:border-holly-ink` halkası; `form-field`/`registration-field` sınıf adları korunup üzerlerindeki inline koyu sınıflar temizlendi. Hata mesajları `border-red-200 bg-red-50 text-red-700`; başarı/uyarı kutuları `border-holly-ink/30 bg-holly-ink/10 text-holly-ink`.
- Birincil butonlar `bg-holly text-ink hover:bg-[#1fc461]`; yeşil metin beyaz zeminde `text-holly-ink` (AA). Modeller/dropdown `bg-white border-line` + overlay `bg-black/40`; `shadow-lg` → `shadow-sm`.
- Turnstile çağrılarına görsel `theme="light"` (doğrulama akışına dokunulmadı); `destek-ol`/`SupportForm` turuncu vurgusu korunup koyu tonlara çekildi (`bg-orange-700 text-white`).
- Bilinçli bırakılan koyu kullanımlar: `AnatomyMap3D` WebGL sahne zemini (`bg-[#0a0a0a]`, comment'li), fotoğraf üstü scrim'ler (`ReviewForm` foto kaldırma butonu `bg-black/60`), silme onay modalindeki `bg-red-600 text-white` butonu.
- Ek: `profile-dashboard.tsx` cp1254 (Windows-1252 TR) kodlamasından **UTF-8'e geri alındı** (230 Türkçe karakter, 0 veri kaybı — önceki oturumdan kalan kodlama bozulması; semantic diff 334 → 144 satır).
- Doğrulama: `npm run lint` 0 hata (yalnızca önceden mevcut 5 `<img>` uyarısı), `npx tsc --noEmit` temiz, `npm run build` temiz (41 route).

## 2026-10-15 — Ana sayfa hero: "Etkinliğe Katıl" CTA'sı eklendi → **ertesi görevde kaldırıldı** (commit bekliyor)

- `components/sections/Hero.tsx`: giriş bölümüne (hero) etkinlik katılım birincil CTA'sı **"Etkinliğe Katıl"** eklendi. İnceleme sonucu: buton kırık beyaz tema geçişi sırasında **kaldırılmamış** — hero'da hiçbir commit'te hiç bulunmamış (`git log -S "Etkinliğe Katıl"` yalnızca `QuickJoinButton`'ı ekleyen `cd5fa31`'i buluyor; `Hero.tsx`'e dokunmuyor). Canlı sitedeki (eski koyu tema) hero'da da aynı iki buton vardı: "Topluluğa Katıl" (WhatsApp) + "Etkinlikleri Keşfet" (/events).
- **Hedef:** `/join` — mevcut katılım akışının giriş noktası ("Bir etkinlik seç, aramıza katıl."; açık etkinlikleri listeler ve her kartta `QuickJoinButton` = "Etkinliğe Katıl" çalıştırır; `/events/[slug]`'daki aynı butonun kaynağı da burası). Yeni URL uydurulmadı.
- **Stil:** `bg-holly` (#27D66B) dolgu + `text-ink` (#171917) metin (AA kontrast, koyu hero zemininde öne çıkan prim buton deseni), `ArrowRight` ikonu `text-ink` ile miras; hover `#1fc461` + `-translate-y-0.5`; `min-h-12` (48px) dokunma alanı.
- **Sıra/konum:** CTA satırının ilk elemanı (birincil), ardından mevcut WhatsApp ve "Etkinlikleri Keşfet" butonları aynen korundu — hiçbirinin hedefi, metni veya tıklama davranışı değişmedi. Mobilde `flex-col` ile tam genişlik üst üste, `sm:` ve üzerinde yatay sıralı; navbar fixed + `h-20` eş yükseklik boşluğuyla çakışmıyor, hero `items-end` + `pb-16/20/24` ile alt hizalı.
- Not: `/join` şu an "Şu anda başvuruya açık etkinlik bulunmuyor." boş durumunu gösteriyor (veri durumu, akışın mevcut davranışı); etkinlik yayınlandığında aynı sayfa "Etkinliğe Katıl" butonlarını listeler.
- Doğrulama: `npx tsc --noEmit` ✓, `npm run lint` 0 hata (5 önceden varan `<img>` uyarısı); `localhost:3000` render'ında buton `href="/join"`, `bg-holly text-ink` ve ikonuyla doğrulandı; `/join` 200 dönüyor. Ekran görüntülü mobil/masaüstü denetimi yapılamadı (tarayıcı bağlı değil).

## 2026-10-15 — Görünürlük denetimi: beyaz zeminde kaybolan ikon/butonlar (commit bekliyor)

- **Mobil hamburger menü ikonu:** üç çizgi `bg-[#171917]` (hard-coded) yerine tema token'ı **`bg-ink`** ile yeniden yazıldı + `shrink-0` eklendi (esneme durumunda çizgi kalınlığı korunur). Kaynak, `localhost:3000` üzerinden render edilen HTML'de (`<span class="... bg-ink">`) ve üretilen CSS'te (`.bg-ink`) doğrulandı — mevcut koddа ikon zaten koyuydu, raporlanan "görünmezlik" büyük olasılıkla eski build/tarayıcı cache'inden geliyordu (bkz. rapor).
- **EventMarquee ok butonları:** beyaz zeminde `disabled:opacity-25` → **`disabled:opacity-40`** (sol ok + sağ ok). Disabled durum artık tamamen kaybolmuyor, yine de pasif olarak okunuyor.
- **Genel tarama:** navbar (masaüstü + mobil menü + kapatma animasyonu), footer bağlantıları, primer/CTA/outline butonlar, lucide ikonlar (`currentColor` mirası), galeri lightbox kontrolleri (`bg-white text-ink`), select okları (`text-ink-soft`), etkinlik kartı aksiyonları, admin "Daha fazla göster" + bildirim satırları ve form kontrolleri tek tek denetlendi; beyaz zemin üzerinde beyaz metin/ikon hatası bulunamadı. Fotoğraf üstü scrim'lerdeki beyaz metinler ve koyu dolgu butonlardaki beyaz ikonlar bilinçli olarak korundu.
- Doğrulama: `npx tsc --noEmit` ✓, `npm run lint` 0 hata (yalnızca önceden mevcut 5 `<img>` uyarısı). Ekran görüntülü görsel denetim bu oturumda yapılamadı (masaüstü tarayıcı bağlı değil); doğrulama sunucudan render edilen HTML + üretilen CSS üzerinden yapıldı.

## 2026-10-15 — Genel site sayfaları: koyu tema → beyaz tema (commit bekliyor)

- Halka açık **genel sayfalar** beyaz temaya geçirildi (token'lar: `bg-white`/`bg-shell`, `text-ink`, `text-ink-soft`, `border-line`, `text-holly-ink`, `bg-holly`); yapı, veri, handler ve animasyonlara dokunulmadı.
- Dönüşen sayfalar: `/about` (+ `MissionVision`, `CommunityValues`), `/team` (`FounderTeam`), `/events`, `/events/[slug]`, `/gallery` (`GalleryGrid`), `/faq`, `/sports` (içerik/veri korunur), `/contact` (`QuestionForm`) ve `quick-join-button`.
- Koyu kartlar `bg-shell`/`bg-white` + `border-line` kartlara; bölüm zeminleri beyaz ↔ `bg-shell` dönüşümlü; yeşil metinler beyaz zeminde `text-holly-ink`, yeşil dolgu üzerinde metin `text-ink` (buton hover'ı `#1fc461`).
- Fotoğraf üstü alanlar bilinçli bırakıldı: etkinlik kartı/kapak scrimsi (`bg-gradient-to-t from-black`), kapak/kart rozetleri (`bg-black/70`, `bg-white/15`), `FounderPhoto` scrim'i ve galeri lightbox karartması (`bg-black/95`) — metin okunurluğu için korundu.
- Form: `QuestionForm` alanları `bg-white text-ink border-line placeholder:text-ink-soft`; hata (`border-red-200 bg-red-50 text-red-700` + ikon) ve başarı (`bg-green-50 text-green-700`) mesajları okunur; KVKK checkbox `accent-[#27D66B]`, Turnstile'a dokunulmadı.
- Doğrulama: `npx tsc --noEmit` ✓, `npm run lint` 0 hata (yalnızca önceden mevcut 5 `<img>` uyarısı), `npm run build` ✓.

## 2026-10-15 — Admin paneli: koyu tema → beyaz tema (commit bekliyor)

- Yönetim panelinin **tüm** sayfa ve bileşenleri beyaz temaya geçirildi (token'lar: `bg-shell`, `text-ink`, `text-ink-soft`, `border-line`, `text-holly-ink`); glow/efekt eklenmedi, hiyerarşi kenarlık + boşluk + tipografiyle kuruldu.
- Dönüşen sayfalar: `/admin/login`, `/admin/events` (+ yeni/düzenle), `/admin/registrations`, `/admin/users`, `/admin/questions`, `/admin/dreams`, `/admin/reviews`, `/admin/custom-training-requests` (sayfa + `status-buttons` + `delete-button`).
- Dönüşen bileşenler: `event-form`, `reviews-manager`, `review-actions`, `registration-actions`, `question-actions`, `add-supporter-form`, `delete-event-button`, `SupportAdminLinks`, `seed-exercises-button`, `exercise-manager`.
- Durum rozetleri anlam korunarak açık zemin + koyu metne çevrildi (ör. `bg-yellow-50 text-yellow-700 border-yellow-200`); tehlikeli eylemler `border-red-200 bg-white text-red-700 hover:bg-red-50`; hata/başarı/boş durum mesajları beyaz temada okunur.
- Etkinlik formu alanları beyaz zeminli (`admin-event-field`/inline koyu sınıflar temizlendi); seçili görsel önizlemeleri ve lightbox scrim'leri (`bg-black/*`, `from-black/65`) bilinçli bırakıldı.
- Zaten beyaz olan `/admin/sponsors`, `/admin/supporters`, `/admin/support-requests`, `/admin/exercises` sadece eyebrow etiketleri `text-holly-ink` ile hizalandı; `sponsor-manager`'daki kullanılmayan `Save` importu kaldırıldı.
- Doğrulama: değişen dosyalarda eslint 0 hata; `tsc`/build type-check hatası yalnızca WIP `lib/admin/activity-feed.ts` (diğer ajanın çalışması, ilgisiz) — derleme başarılı.
## 2026-10-01 — Admin: Bildirim Merkezi (Son Aktiviteler) + Üye Yönetimi sayfası (commit bekliyor)

- `app/admin/page.tsx` — **Bildirim Merkezi** kartı eklendi (istatistik bloğunun hemen altında, "Yönetim Araçları" bölümünden önce):
  - **Aggregation:** `custom_program_requests` (önce `status='pending'` olanlar + son talepler), `support_requests`, `individual_supporters` ve `profiles` (son kayıtlar) paralel okunur; `created_at` / `join_date` azalan sırayla birleştirilir, `id` ile dedupe edilir ve en yeni en üstte 10 satırlık tek akışa indirgenir.
  - **Zaman akışı (timeline) UI:** her satırda tür ikonu + başlık + kişi + detay + göreli zaman (`Intl.RelativeTimeFormat("tr")` → "2 saat önce"); bekleyen taleplerde sarı **Bekliyor** rozeti. Kart başlığında "N bekleyen özel antrenman talebi" / "N bekleyen destek başvurusu" rozetleri.
  - **Hızlı yönlendirme:** satırın tamamı tıklanabilir → özel antrenman talepleri `/admin/custom-training-requests`, destek başvuruları `/admin/support-requests`, destekçiler `/admin/supporters`, yeni kullanıcılar `/admin/users`.
  - `status` kolonu henüz yoksa (`PGRST204`) kolonsuz fallback ile devam eder (mevcut `/admin/custom-training-requests` deseni); bir kaynak okunamazsa kart hata mesajıyla görünür, sayfa çökmez. Okuma service-role ile (`createAdminClient`) — `requireAdmin` oturumu doğrular.
  - Aynı dosyada "Yönetim Araçları" gridine **Üyeler** kartı eklendi (`/admin/users`).
- `app/admin/users/page.tsx` — **yeni** Üye Yönetimi sayfası: `profiles` tablosundan son 500 profil (`join_date` azalan), `?q=` ile sunucu tarafında ad/e-posta araması, toplam üye / son 7 günde kayıt / yönetici sayaçları, kartlarda görünen ad, e-posta (mailto), rol rozeti, üyelik tarihi, telefon (tel) ve ilgi alanları. Silme işlemi yok.
- Doğrulama: `npx tsc --noEmit` ✓, `npm run lint` 0 hata (mevcut 6 uyarı dosyada değişiklik yok), `npm run build` ✓ (`/admin/users` route'u dinamik olarak üretildi).

## 2026-09-29 — Navbar: kenarlıksız (borderless) yumuşatma (commit bekliyor)

- `components/layout/navbar.tsx` içindeki **tüm** kenarlık sınıfları (`border`, `border-white/20`, `border-gray-*`, `border-t/b`, `hover:border-*`, `ring`, `outline`, `divide-x`) kaldırıldı — grep ile 0 eşleşme doğrulandı.
  - **Header:** `border-b border-white/10` + `md:border-transparent` silindi. Mobilde alttaki ayracın yerine yumuşak **`shadow-lg`** kondu, masaüstünde `md:shadow-none` ile kapatıldı (şeffaf başlıkta kutu gölgesi çizgi gibi görünürdü).
  - **Orta link kapsülü:** `border border-white/20` silindi → **`bg-black/30` + `shadow-lg` + `backdrop-blur-md`**. "Yüzen" his artık zemin + gölge + bulanıklıkla veriliyor.
  - **Sağ blok (profil avatarı · Giriş Yap · Topluluğa Katıl · Destek Ol · hamburger):** border ve `hover:border-*` yok; hepsi `bg-white/5` (Destek Ol `bg-[#27D66B]`) + `shadow-lg` + `backdrop-blur-md`. Hover geçişleri yalnızca zemin/metin rengiyle (`hover:bg-white/10`, `hover:text-[#27D66B]`, Destek Ol `hover:bg-[#45e27f]`).
  - **Mobil menü paneli:** dış `border-t` ayracı, kart `border border-white/10` ve buton `border`'ları da kaldırıldı → kart `shadow-2xl` kaldı, butonlar `bg-white/5` / `bg-[#27D66B]/10` zeminine geçti.
- Sonuç: navbar'da hiçbir elemanın etrafında sert çizgi kalmadı; hiçbir `outline`/`ring` kullanılmıyor.
- Doğrulama: `npx tsc --noEmit` ✓, `npm run lint` 0 hata, `npm run build` ✓; üretilen CSS'te `shadow-lg` ve `md:shadow-none` sınıflarının gerçekten üretildiği doğrulandı.

## 2026-09-29 — Ana sayfa: Hero navbar'ın altına giriyor (top-0) (commit bekliyor)

Sorun: navbar `fixed` yapıldıktan sonra arkasındaki eş yükseklik boşluğu (`h-24 bg-[#050505]`) yüzünden Hero 96px aşağıda başlıyor, navbar'ın arkası siyah kalıyordu.

- `components/layout/navbar.tsx`:
  - Header **her kırılma noktasında `fixed inset-x-0 top-0 z-50`** (eski `sticky` kaldırıldı) → navbar artık hiçbir sayfada içerik akışını itmez.
  - Yeni **`overlay`** prop'u (`overlay?: boolean`, varsayılan `false`): true verilince altındaki eş yükseklik boşluğu hiç render edilmez. Varsayılanda boşluk korunur (mobil `h-20`, md+ `h-24`, `bg-[#050505]`) → diğer 18 sayfada düzen hiç değişmiyor.
- `app/page.tsx`: `<Navbar overlay />` → Hero **0'dan** (top-0) başlıyor; siyah bant yok, navbar doğrudan hero görselinin üzerine biniyor.
- `components/sections/Hero.tsx`:
  - `<section ... min-h-[100svh]>` zaten tam ekran (100svh, `items-end` ile içerik alt hizalı) — kaldırılan boşluk sayesinde bölüm artık viewport'un tepesinden başlıyor.
  - Navbar'a ayrılan üst dolgu **`pt-40` kaldırıldı** (içerik alt hizalı olduğu için normal ekranlarda zaten görünmüyordu). Bunun yerine sadece alçak ekranlarda (yatay telefon/pencere, `max-height:560px`) `pt-28` güvenlik dolgusu eklendi — içerik hero görselindeki koyu degrade + navbar scrim'inin altında kaybolmasın diye.
- Doğrulama: `npx tsc --noEmit` ✓, `npm run lint` 0 hata, `npm run build` ✓; üretilen CSS'te `.fixed{position:fixed}`, `@media (max-height:560px){…pt-28}`, `md:top-4`, `md:h-24`, `min-h-[100svh]` doğrulandı.

## 2026-09-29 — Ana sayfa: 3D antrenman tanıtım bölümü kaldırıldı (commit bekliyor)

- `app/page.tsx`: `<TrainingShowcase />` ve import'u tamamen silindi — Hero'nun hemen altındaki **"YENİ NESİL ANTRENMAN"** üst başlığı, **"3D Anatomi Destekli Antrenman Merkezi."** ana başlığı, **"Hemen Ücretsiz Başla"** yeşil CTA butonu ve altındaki **3 özellik kartı** (İnteraktif 3D Anatomi / Bilimsel Algoritma / Kişisel Kütüphane) artık sayfada yok.
- `components/home/training-showcase.tsx` dosyası (bileşenin tamamı) ve boşalan `components/home/` klasörü silindi; proje genelinde başka kullanım yoktu.
- **Boşluk ayarı:** bölüm kendi `border-t border-white/10 bg-[#0a0a0a] py-24` kabuğunu taşıdığı için silinmesiyle boşluk da kalktı; Hero → doğrudan `About` (`bg-[#050505] py-20 sm:py-28`) geçiyor, kendi üst dolgusuyla hizalı — ekstra margin/padding gerekmedi.
- Doğrulama: `npx tsc --noEmit` ✓, `npm run lint` 0 hata, `npm run build` ✓.

## 2026-09-29 — Navbar: floating pill (yüzen kapsül) düzeni (commit bekliyor)

- `components/layout/navbar.tsx`:
  - **Yüzen kapsül düzeni:** header `sticky inset-x-0 top-0` → **`fixed` (tüm kırılma noktalarında) + `md:top-4`** (`z-50`); header akıştan çıktığı için hemen ardına **eş yükseklik boşluk** kondu → yüzen kapsülün alt kenarı (mobil 80px / md+ 16+80 = 96px) içerikle çakışmaz, sayfa içeriği yukarı kaymaz. (Sonraki adımda ana sayfada `overlay` prop'u ile bu boşluk kaldırıldı → bkz. "Hero navbar'ın altına giriyor".)
  - **Mobil (md altı) korundu:** koyu cam zemin (`bg-[#050505]/95 backdrop-blur-xl border-b`) + tam genişlik + hamburger menü aynen. Masaüstünde header şeffaflaşır (`md:bg-transparent md:border-transparent md:backdrop-blur-none`) ve **yumuşak koyu degrade scrim** eklenir (`md:bg-gradient-to-b from-black/70 via-black/30 to-transparent`); böylece beyaz bölümler (Hakkımızda / Sporlar / Galeri / SSS) altından geçerken logo ve kapsül okunur kalır.
  - **Merkezi link kapsülü:** 9 link tek bir kapsülde — `rounded-full border border-white/20 bg-black/30 backdrop-blur-md`; dış kapsayıcı `hidden min-w-0 flex-1 items-center justify-center xl:flex` ile **tam ortalanır**, `max-w-full + overflow-x-auto` (scrollbar gizli) taşmayı engeller. Linkler `rounded-full px-2.5 py-2` pill, **aktif** hedef `bg-[#27D66B]/15 text-[#27D66B]` (eski alt çizgi kaldırıldı), hover `bg-white/10`.
  - **Kırılma noktaları:** kapsül **`xl:flex` (1280px+)** — 9 link ~680px yer kaplıyor, altında logo + 3 aksiyon + kapsül sığmadığı için hamburger menü korunur (`xl:hidden`); aksiyonlar **`md:`'den itibaren** görünür (768px'te logo + aksiyonlar + hamburger sığıyor). Mobil menü paneli `lg:hidden` → `xl:hidden`.
  - **Sağ blok:** profil avatarı / Giriş Yap / **Topluluğa Katıl** / **Destek Ol** hepsi `rounded-full`; ince `border-white/20` + `bg-white/5 backdrop-blur-md` cam detay, Destek Ol yeşil dolu + `border-[#27D66B]/60`; hamburger `border-white/20 bg-white/5 backdrop-blur-md`. Logo serbest (sadece masaüstünde `drop-shadow` ile okunabilirlik).
  - `components/sections/{Faq,Gallery,Sports}.tsx`: `scroll-mt-20` → + **`md:scroll-mt-28`** (yüzen kapsül kadar kaydırma payı; `/#faq` linki başlığı örtmüyor).
- Doğrulama: `npx tsc --noEmit` ✓, `npm run lint` 0 hata, `npm run build` ✓; üretilen CSS'te `fixed`, `md:top-4`, `md:bg-transparent`, `md:bg-gradient-to-b`, `md:from-black/70`, `xl:flex`, `scrollbar-width:none` sınıflarının gerçekten üretildiği doğrulandı.

## 2026-09-29 — Antrenman: 3 hedefte kas grubu adımı atlama (commit bekliyor)

- `components/training/WorkoutGenerator.tsx`:
  - **Adım atlama mantığı:** `MUSCLE_STEP_SKIPPED_GOALS = ["esneklik", "postur", "sicrama"]` (Esneklik/Mobilite, Postür Düzeltme, Dikey Sıçrama Geliştirme). Bu hedeflerde cinsiyet seçimi + **3D kas haritası + "Seçimi temizle"** ve filtrelerdeki **Antrenman Şablonu / Kas Grupları** seçicileri tamamen gizlenir; yerlerine "kas grubu adımı atlandı / tam vücut otomatik oluşturuldu" bilgi notları gelir. `Antrenman Hedefi` ve ortam (Ev/Spor Salonu) seçimi her zaman yerinde.
  - **Doğrudan üretim:** `readyToGenerate = muscleStepSkipped || hasSelection` — bu 3 hedefte ortam/hedef değiştiği anda mevcut canlı üretim akışı sorguyu çalıştırır (ayrı bir butona gerek yok). Başlık "Tam vücut programın" olur.
  - **Arka plan verisi:** `FULL_BODY_MUSCLES` = `MUSCLE_GROUPS` tamamı (9 bölge) sorgu ve gruplama için kullanılır; bu yüzden `[]` gönderilmez (sunucudaki `saveWorkout` bölge listesi boşsa kayıt yapmaz). Kayıtta `savedMuscles` normal hedefte kullanıcı seçimi, atlanan hedefte **üretilen programın gerçek bölgeleri** olarak yazılır; `templateName` atlanan hedefte `${Hedef} Programı` olur.
  - **Görsel temizlik:** atlanan hedefte boş bölge blokları filtrelenir (tam vücutta "Bu bölge için hareket bulunmuyor" yığını çıkmaz) ve hiç egzersiz yoksa "ortam/hedef için uygun egzersiz bulunamadı" boş durumu gösterilir. Yükleme iskeleti `effectiveMuscles` ile çizilir.
  - **Diğer hedefler (Hacim, Kuvvet)** için 3D seçim, şablon/kas filtreleri ve mevcut grup/bölge davranışı **değişmedi**.
- `app/training/page.tsx`: bölüm metnine "Esneklik, postür ve sıçrama hedeflerinde bölge seçimi gerekmez" eklendi.
- Doğrulama: `npx tsc --noEmit` ✓, `npm run lint` 0 hata, `npm run build` ✓.

## 2026-09-29 — Admin: özel antrenman talebi silme (commit bekliyor)

- `app/admin/custom-training-requests/actions.ts`: **`deleteProgramRequest(requestId)`** server action eklendi — `requireAdmin()` → boş ID kontrolü → **service-role** `delete().eq("id", …).select("id")` (kalıcı silme; tabloda DELETE politikası olmasa da engellenmez) → silinen satır 0 ise "kayıt zaten silinmiş olabilir" hatası → hata `message/code/details/hint` loglanır → başarılıysa **`revalidatePath("/admin/custom-training-requests")`** ile liste anında yenilenir (silinen öğe ekrandan kaybolur). Beklenmeyen tüm hatalar try-catch ile döner, action throw atmaz.
- Yeni `delete-button.tsx` (client): her talep kartının sağ üstünde kırmızı **Sil** butonu (`Trash2` ikonu, `border-red-500/30 bg-red-500/10 text-red-300`), **iki adımlı onay** ("Silinsin mi?" → **Evet, sil** / **Vazgeç**), `useTransition` ile pending spinner + buton kilidi, hata mesajı kartta `role="alert"`; başarılı olunca `router.refresh()` ile görünüm tazelenir (sunucuda `revalidatePath` zaten çalışıyor). Butonun `aria-label`'ında silinen kişinin adı geçer.
- `page.tsx`: buton kartın üst satırındaki mevcut `justify-between` flex yapısına eklendi (rozet + tarihin sağında, `shrink-0`); sayfa açıklamasına "veya gerekiyorsa sil" eklendi.
- Doğrulama: `npx tsc --noEmit` ✓, `npm run lint` 0 hata, `npm run build` ✓.

## 2026-09-29 — Profil kartı üst alan sadeleştirmesi (commit bekliyor)

- `components/auth/profile-dashboard.tsx` profil kartı başlığı sadeleştirildi:
  - **"Düzenle" butonu kaldırıldı** (düzenleme zaten alttaki "Düzenle" sekmesinde); sağ üstte yalnızca **Çıkış** butonu kaldı, artık kullanılmayan `Pencil` import'u da silindi.
  - İsim altındaki **e-posta satırı** ve rozetler arasındaki **telefon rozeti** arayüzden tamamen silindi (`displayEmail` değişkeni kaldırıldı).
  - Kartta kalan veriler: avatar + **tam ad**, **Üyelik Süresi** rozeti, **yaş** rozeti, **cinsiyet** rozeti ve **ilgili sporlar** (yaş `birth_date`'ten, rozet metni `membershipBadge`).
  - **İsim tek satır:** `truncate + whitespace-nowrap` (önceki `break-words`/`break-all` sarma yaklaşımının yerine) — isim asla alt alta kırılmaz, sığmazsa "…" ile kesilir; `title` imleçte tam metni gösterir. Kapsayıcı `min-w-0 flex-1`, buton bloğu `shrink-0` olduğundan isim için kalan tüm genişlik kullanılır.
- Doğrulama: `npx tsc --noEmit` ✓, `npm run lint` 0 hata, `npm run build` ✓.

## 2026-09-29 — Global form alanı okunabilirlik düzeltmesi (commit bekliyor)

- **Kök neden:** `app/globals.css` içinde `input/textarea/select { color: #18181b }` vardı — tüm veri giriş alanlarına **zorla koyu metin** veriyordu. Koyu zeminli formlarda (giriş, profil düzenleme, özel antrenman, etkinlik başvurusu, admin girişi, antrenman hesaplayıcı…) yazılan yazı okunmazdı. Kural `color: inherit` yapıldı; renk artık bileşenin kendi sınıfından gelir, hiçbir yerde koyu zorlaması yok.
- **Alan taraması:** 113 alan (input/textarea/select) tek tek denetlendi; paylaşılan sabitler (`inputClass`, `fieldClass`, `normalFieldClass` …) çözülerek doğrulandı — **111 alan renk/tema sınıfına sahip**, 2 alan `sr-only` (gizli file input). Koyu zemindekiler `text-white`; açık paneller (`/admin/sponsors`, `/admin/supporters`, `/admin/exercises`, `/destek-ol`, `/contact`, `/gallery`) `text-zinc-950`. Renk sınıfı **eksik olan tek yerler** eklendi: `app/admin/login` (2 input → `text-white`), `sponsor-manager` (6), `supporter-actions` (2); ayrıca `text-white/45` olan etkinlik kapak dosya input'u `text-white`, honeypot alanları da sınıflandırıldı.
- **Placeholder:** global ton `#a1a1aa` → `#767680` (koyu zeminde ≈4.2:1, beyazda ≈4.8:1 — yazılan metinden net ayrışır). Okunmayan `placeholder:text-white/20` (admin girişi, etkinlik formu) ve `placeholder:text-white/25` (auth, profil, şifre, hesaplayıcı, program talebi) değerleri `/45`'e; `.form-field-dark`/`.admin-event-field`/`.registration-field` placeholder opaklığı `0.28`–`0.35` → `0.45`; açık panellerde `placeholder:text-zinc-400` → `placeholder:text-zinc-500`.
- `components/ui/input.tsx` yok; `components/ui/Input.tsx` **boş ve kullanılmıyor** (gerçek mekanizma global CSS + bileşen sınıfları). `textarea.tsx`/`select.tsx` hiç yok.
- Doğrulama: `npx tsc --noEmit` ✓, `npm run lint` 0 hata, `npm run build` ✓.

## 2026-09-29 — Program talebi + admin + profil ismi (commit bekliyor)

- **Özel antrenman formu düzeltendi (kök neden):** gerçek kolon `contact_info` imiş (`contact` → `PGRST204`), tarayıcı insert'i doğrudan tabloya gidiyordu. Artık **server action `submitProgramRequest()`** (`app/training/actions.ts`): honeypot → alan doğrulaması (ad 2-100, iletişim 5-120, hedef GOALS içinde, yaş 10-99 / boy 100-230 / kilo 30-250, not ≤500) → rate limit (`program_request`, 3 istek/10 dk) → **service-role insert** (env yoksa oturum client'ına düşer). `catch`/insert hatalarında `error.message` + `error.code` + `details`/`hint` loglanıyor, kullanıcıya `Talebin gönderilemedi. … (CODE) message` dönüyor. `database.types.ts` `contact_info` ile hizalandı.
- **Admin sayfası:** `/admin/custom-training-requests` — talep sahibi (ad, iletişim linki), form detayları (hedef/yaş/boy/kilo/notlar), tarih ve **Bekliyor / İncelendi** durumu; durum değiştirme server action'ı (`setProgramRequestStatus`, requireAdmin + service-role). `status` kolonu DB'de yoksa sayfa kolonsuz sarımla açılır ve SQL bandı gösterir. Ana admin menüsüne "Özel Antrenman Talepleri" kartı eklendi.
- **Profil isim UI:** başlık `displayName` değişkenine alındı; `<h1>` ve e-posta satırı `truncate` + `title` → boşluksuz uzun isimler ("aaaa…") tek satırda kalır, kartı bozmaz.

## 2026-09-29 — UX / mobil düzeltmeler (commit bekliyor)

- **Etkinlik kayıt mesajı:** `joinEvent()` artık yalnızca DB'de gerçekten aktif (pending/approved/waitlist) bir kayıt varsa `already` döndürür; başarılı ilk kayıtta `message: "Kaydınız tamamlanmıştır."` döner. İptal/ret sonrası başvurular `pending`'e çekilerek yeniden açılabilir (artık yanlış "zaten kayıtlısın" yok). `QuickJoinButton` "yeni kayıt" (`joined`) ve `existing` durumlarını ayrı ayrı görselleştiriyor; sunucu logu (`23505`/`mevcut kayıt`) teşhis için duruyor.
- **Telefon validasyonu:** yeni `lib/validation/phone.ts` (`isValidPhone`, ayraçları temizleyip 10-15 rakam zorunlu; boş = opsiyonel). Kayıt formu (`fieldErrors.phone`, input hatalıkken temizlenir), profil düzenleme (`formError`) ve **sunucu tarafı** (`registerUser`, `saveProfile`) aynı kuralı uyguluyor.
- **Profil mobil:** sekme adı "Ayarlar" → **"Düzenle"**; sekme barı `overflow-x-auto + whitespace-nowrap + shrink-0` (mobilde tamamen kaydırılabilir), profil kartı başlığı/avatır/aksiyon butonları `flex-wrap` + kırılabilir metin, sayfa iç dolgusu mobilde azaltıldı.
- **Admin destekçiler:** başlığa "← Panele Dön" butonu (`/admin`).
- **3D model etiketleri:** kas etiketleri `text-[11px] font-medium`, daha ince çerçeve/parlaklık, `pointer-events-none`; hata ve hover etiketleri de küçültüldü (tıklamayı bloklamıyor).

## 2026-09-29 (commit bekliyor)

- **Profil kartı — doğum tarihi gizlendi:** karttaki "Doğum: …" rozeti arayüzden kaldırıldı (yaş `birth_date`'ten hesaplanmaya devam eder, tarih kendisi gösterilmez).
- **Telefon numarası:** `profiles.phone` kolonu `database.types.ts`'e eklendi; kayıt formuna doğrulamasız, opsiyonel telefon alanı eklendi (`registerUser` → `user_metadata` + `profiles`), profil düzenleme formuna telefon input'u ve header'a telefon rozeti eklendi (`saveProfile`).
- **Akıllı etkinlik kaydı:** `app/join/actions.ts` → `joinEvent()` server action (oturum + uygunluk kuralları public API ile aynı, `pending` başvuru, mükerrer kontrol). `/join?event=…` ve `/events/[slug]` sayfalarında **giriş yapmış üye** için uzun başvuru formu gizlenip tek tuşlu "Etkinliğe Katıl" butonu (`components/events/quick-join-button.tsx`, `card`/`inline` varyant) gösteriliyor; **misafir kullanıcıda uzun form olduğu gibi çalışıyor.**
- **Katılımı iptal:** `cancelEventRegistration()` server action (sahiplik kontrolü, onaylı kayıtta önce RPC/`participant_count` düzeltmesi, sonra silme). Profil sayfası "Etkinliklerim" sekmesi artık gerçek başvuruları listeliyor ve "Katılımı İptal Et" butonu taşıyor.
- **Admin katılımcı listesi:** adın hemen altında vurgulu **E-posta** ve **Telefon** bağlantıları (boşsa "belirtilmemiş" yedeğiyle).
- **Admin destekçi filtresi:** `/admin/supporters` sayfasına "Tümü / Aktif / Pasif" filtre grubu (`?durum=` searchParams, sayı rozetleriyle).

## 2026-09-29 — Şema/hizalama düzeltmeleri (commit bekliyor)

- **Veri bütünlüğü — gerçek şema ile hizalama:** PostgREST openapi çıktısı üzerinden `saved_workouts` gerçek kolonları (`user_id, template_name, target_goal, exercises`) doğrulandı; kodun kullandığı `title/goal/environment/muscles` ve `profiles.age` kolonları tabloda yoktu (PGRST204). `app/training/actions.ts`, `app/profile/page.tsx`, `profile-dashboard.tsx` ve `database.types.ts` gerçek şemaya göre düzeltildi. `environment`/`muscles` bilgisi artık jsonb `exercises` içine gömülüyor.
- **`saveWorkout` yeniden yazıldı:** whitelist payload + `JSON.parse(JSON.stringify())` JSONB normalizasyonu, `.select()`siz insert (RLS'te SELECT politikası yoksa oluşan PGRST116 sahte hatası önlenir), ilk hatada service-role fallback (`SUPABASE_SECRET_KEY ?? SUPABASE_SERVICE_ROLE_KEY`), arayüze gerçek `code + message` dönen hata metni.
- **`registerUser` mühürleme + doğrulama:** upsert sonrası satır geri okunup `gender` / `interested_sports` / `join_date` gönderilen değerlerle karşılaştırılır; eşleşmezse bir kez daha yazılır, hâlâ eşleşmezse kayıt geri alınır (auth user + profil satırı silinir). Kayıt payload'ı hem istemcide (`[registerUser] gönderilen payload`) hem sunucuda loglanıyor.
- **Env anahtarı hizası:** `.env.local`'da yalnız `SUPABASE_SECRET_KEY` var; `auth/actions.ts`, `profile/actions.ts`, `training/actions.ts` artık `SUPABASE_SECRET_KEY ?? SUPABASE_SERVICE_ROLE_KEY` okuyor (eski tekil okuma fallback'i kırıyordu).
- Profil kartı: yaş yalnızca `birth_date`'ten hesaplanır, hedef etiketi `GOALS`'tan gelir; teşhis script'leri repo'dan temizlendi.

## 2026-09-23 (commit bekliyor)

- Antrenman Merkezi FAZ 3: 3D kas haritası (`AnatomyMap3D`, three/r3f/drei, çoklu bölge seçimi), dinamik program algoritması (`buildProgram`, hedef bazlı set/tekrar, 1→4 / 2→3 / 3+→2 kuralı), kişisel program talebi modalı. Kas grupları 8'e genişledi; mock egzersiz havuzu `lib/data/exercises.ts`'te. Eski 2D `AnatomyMap.tsx` kaldırıldı.

## 2025-09-16 (commit bekliyor)

- Kayıt formu sunucuya taşındı: `POST /api/forms/registration` (Turnstile + honeypot + rate limit + KVKK + etkinlik uygunluk kontrolü); client'tan doğrudan Supabase insert kaldırıldı. Forma Turnstile widget'ı ve gizli honeypot alanı eklendi.
- Admin rotalarına proxy seviyesinde ek koruma: `lib/supabase/proxy.ts` oturum + `profiles.role === "admin"` kontrolü yapıyor (`/admin/login` hariç).
- `lib/supabase/database.types.ts` eklendi ve tüm Supabase client'ları (server/client/admin/proxy) tiplendi. Eksik kalan `review_event_registration` RPC tipi ve `events.created_by` alanı tiplere eklendi.
- Kök `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx` eklendi (mevcut tasarım diliyle).
- `.env.example` oluşturuldu (gerçek değer içermez).
- Tip hatası düzeltmeleri: sponsor `logo_path` nullable, support-request `name_visibility` cast, proxy `getClaims` sonucu null-safe.
- Dokümantasyon: `AGENTS.md` genişletildi, `PROJECT_STATUS.md`, `TODO.md`, `CHANGELOG.md` oluşturuldu.

## 2026-07-24

- `f04d8a1` Eray Unsal görseli güncellendi.
- `f33ed5b` Etkinlik formuna galeriden görsel seçimi eklendi.
- `4897427` Destek formuna spam koruması (Turnstile + honeypot + rate limit).
- `5a7a846` Hayal formuna Turnstile ve spam koruması.

## 2026-07-23

- `90df9cf` "Bir Hayalim Var" sayfası ve form güvenlik altyapısı (`lib/security`, `TurnstileWidget`).
- `51c77f6`, `c5b0dbc` Etkinlik galerisine manuel kaydırma kontrolleri.
- `e8a5d90` Galeri filtreleri, form hataları ve etkinlik kartları güncellendi.
- `e1fbaae` Site ikonları netleştirildi.
- `320a627` Yaklaşan etkinlikler mobil animasyonları yenilendi.
- `509a183` Bireysel destekçi kategori filtresi düzeltildi.
- `cadd44d` Ana sayfa destekçi verileri dinamik hale getirildi.
- `847efb1` Bireysel destekçilerin ana sayfada görünmesi düzeltildi.
- `6035bac` DNG dosyası kaldırıldı ve ignore edildi.
- `91909a5` İlk commit: Holly Sport proje dosyaları.
