# TODO — Holly Sport

## Kritik güvenlik

- [ ] `custom_program_requests` durum kolonu (Supabase dashboard — SQL'i sen çalıştır, bana gösterme):
  ```sql
  -- Mevcut kolonları kontrol:
  select column_name from information_schema.columns
  where table_schema = 'public' and table_name = 'custom_program_requests';

  -- Durum kolonu (Bekliyor / İncelendi):
  alter table public.custom_program_requests
    add column if not exists status text not null default 'pending';
  ```
  Not: SQL çalışana kadar admin sayfası (`/admin/custom-training-requests`) kolonsuz sarmalayla açılır ve SQL bandını gösterir; durum değiştirme butonları `PGRST204` hatasını aynen döner.
- [ ] Özel antrenman talebi formuna Turnstile da ekle (şu an honeypot + rate limit var; kayıt formundaki `TurnstileWidget` deseni `action="program_request"` ile kopyalanabilir).

- [ ] RLS gözden geçirme (Supabase dashboard): kayıt formu service-role'a taşındığı için `event_registrations` tablosundaki anon/authenticated INSERT politikası artık gerekli değil. İlgili policy adlarını kontrol edip kaldır:
  ```sql
  -- Önce mevcut politikaları listele:
  select policyname, cmd, roles
  from pg_policies
  where tablename = 'event_registrations';

  -- Anon insert politikasını kaldır (adı sende farklı olabilir):
  -- drop policy if exists "<policy_adi>" on public.event_registrations;
  ```
  Not: admin paneli `review_event_registration` RPC'sini kullanıyor; bu RPC'nin varlığını ve yetkilerini de dashboard'dan doğrula.
- [ ] `saved_workouts` RLS politikası (Supabase dashboard — SQL'i sen çalıştır, bana gösterme):
  ```sql
  -- Önce mevcut politikaları listele:
  select policyname, cmd, roles from pg_policies where tablename = 'saved_workouts';

  -- Girişli kullanıcı kendi programını yazabilsin (service-role fallback'ini gereksiz kılar):
  create policy "saved_workouts_insert_own" on public.saved_workouts
    for insert to authenticated with check (auth.uid() = user_id);

  -- Okuma / silme (profil sayfası ve karttaki sil butonu için):
  create policy "saved_workouts_select_own" on public.saved_workouts
    for select to authenticated using (auth.uid() = user_id);
  create policy "saved_workouts_delete_own" on public.saved_workouts
    for delete to authenticated using (auth.uid() = user_id);
  ```
  Not: şu an insert `42501` ile engelleniyor ve `saveWorkout` service-role fallback'e düşüyor; politika eklenirse normal yol çalışır.
- [ ] `.env.local` değerlerinin canlı (Vercel/hosting) ortam değişkenleriyle birebir tanımlı olduğunu doğrula (`SUPABASE_SECRET_KEY`, `TURNSTILE_SECRET_KEY`, `FORM_RATE_LIMIT_SALT`).
- [ ] Production Turnstile anahtarlarıyla üç formu canlıda test et.

## Altyapı

- [x] **Geçici görsel artıkları temizlendi (2026-10-16):** commit'lenmiş iki Windows editör artığı silindi — `public/images/gallery/diger/IMG_9448.jpeg.~tmp` (19.06 MB) ve `public/images/gallery/trekkinghiking/IMG_6266.jpg~RFa1d1972.TMP` (0 KB; kullanıcı "diger/" yazmıştı, gerçek klasör `trekkinghiking/`). `.gitignore`'a `*.~tmp` ve `*~RF*.TMP` eklendi (`git check-ignore` ile doğrulandı; normal `.jpg`/`.jpeg`/`.JPG` fotoğraflar ignore edilmiyor). Her iki silme `git status`'ta ` D` olarak kayıtlı, henüz commit edilmedi.
- [ ] **Kodlama önleme:** BOM'suz UTF-8 dosyalarda PowerShell `Get-Content`/`Set-Content` kullanma (2026-10-15 `app/faq/page.tsx` mojibake olayının kaynağı). Okuma/yazmada UTF-8'i açıkça belirt: `Get-Content -Encoding UTF8` veya `[System.IO.File]::ReadAllText/WriteAllText($p, $t, [System.Text.UTF8Encoding]::new($false))`. Yeni bir Türkçe metin girerken kayıt sonrası bayt seviyesi doğrulama yap.

- [ ] Bekleyen değişiklikleri commit'le (registration API route, proxy guard, database.types, loading/error/not-found, .env.example, AGENTS/PROJECT_STATUS/TODO/CHANGELOG).
- [ ] Supabase CLI kurulumu istersen: `npx supabase gen types typescript --project-id <id>` ile `database.types.ts`'i otomatik üretmeye geç.
- [ ] `supabase/` migration klasörü yok; şema/RLS değişikliklerini ileride migration olarak takip etmeyi değerlendir.

## Test

- [x] **Production yayını (tamamlandı, 2026-10-16):** 9 mantıklı commit `main` → `origin` push edildi (`bb26148` → `f5b68c9`, 198 dosya), Vercel Git entegrasyonuyla otomatik production deployment canlıya alındı. **Canlı kanıt:** yeni CSS chunk + `a{color:inherit;text-decoration:none}` kuralı `@layer base`'te, geçici `.holly-hero-secondary-link` canlıda yok; `/`, `/faq`, `/events`, `/gallery`, `/admin/login` HTTP 200; hero "Etkinlikleri Keşfet" butonu canlıda `text-white`+`border-white`+`bg-transparent`, hedef `/events`. Ekran görüntülü/görsel teyit yapılamadı (tarayıcı bağlı değildi) — aşağıdaki manuel maddeler canlıda elle kontrol edilmeli.
- [x] **Global bağlantı renk katmanı (uygulandı, 2026-10-16):** `app/globals.css` içindeki katmansız `a { color: inherit; text-decoration: none; }` kuralı `@layer base` katmanına taşındı → `text-white`, `text-holly-ink`, `hover:text-*` gibi renk yardımcı sınıfları artık bağlantıları doğru şekilde etkiliyor (`utilities > base`). `text-decoration: none` aynı katmanda korundu, `!important`/inline style yok. 68 gerçek `<a>`/`<Link>` denetlendi: beyaz zeminde `text-white` (görünmez metin) yok, `text-holly-ink` + açık yeşil tint ve `text-ink` + yeşil zemin kombinasyonları kontrastlı. Navbar, footer, etkinlik kartları, SSS, admin bağlantılarında istenmeyen renk kayması yok. Geçici `.holly-hero-secondary-link` sınıfı hem `globals.css`'ten hem `Hero.tsx`'ten kaldırıldı. Doğrulama: `tsc`/`lint`/`build`/`diff-check` temiz, servis edilen CSS kaskad kanıtı alındı; ekran görüntüsü tarayıcı bağlı olmadığından yapılamadı (aşağıda manuel kontrol maddesi).
- [ ] **Dev/build etkileşim notu:** `next dev` açıkken `next build` çalıştırmak `.next/dev/types/validator.ts` dosyasını yırtık yazabiliyor (tip kontrolü önbellek artığında hata verir). Build almadan önce dev'i durdur; oluşursa `.next/dev/types` silinir, dev yeniden başlayınca üretilir.
- [ ] **Bağlantı renkleri + Hero butonu görsel doğrulaması (tarayıcı gerekli, 2026-10-16):** `a { color: inherit }` kuralı `@layer base`'e taşındı ve geçici `.holly-hero-secondary-link` sınıfı kaldırıldı; `text-white`/`text-holly-ink`/`hover:text-*` artık bağlantıları etkiliyor. HTTP + servis edilen CSS kaskad kanıtı alındı, ekran görüntüsü yok (tarayıcı bağlı değildi). Manuel kontrol: ana sayfada "Etkinlikleri Keşfet" metni **kesin beyaz**, ok ikonu beyaz, kenarlık beyaz, zemin şeffaf (koyu hero görseli üzerinde net okunmalı); hover'da `bg-white/10`, focus'ta beyaz halka; yeşil "Topluluğa Katıl" CTA'sı değişmemeli. Ayrıca navbar, footer, etkinlik kartları, `/faq`, `/events`, `/gallery`, `/admin/login` bağlantılarında renklerin tasarımlandığı gibi olduğunu ve beyaz zeminde kaybolan / koyu zeminde kaybolan metin olmadığını kontrol et.
- [ ] **Destek formu yeni seçeneği uçtan uca:** "Gönüllü öğrenci temsilcisi" seçiliyken gönderim başarılı olmalı; admin → Destek Başvuruları'nda etiket "Gönüllü öğrenci temsilcisi" görünmeli; destekçiye dönüştürülürse `app/admin/supporters` listesinde de doğru etiket görünmeli. Eski kayıtlar (`financial_support`, `social_media`…) yeni etiketlerle okunmaya devam etmeli. Canlı test Turnstile + rate limit gerektirdiği için bu oturumda yapılamadı.
- [ ] **`support_types` DB kısıtı (sen çalıştıracak, salt-okunur):** yeni değer gönderimde DB kısıtına takılırsa 400/500 alırsın. Dashboard'dan:
  ```sql
  select column_name, data_type, udt_name from information_schema.columns
  where table_schema='public' and table_name='support_requests' and column_name='support_types';
  select conname, pg_get_constraintdef(oid) as definisyon from pg_constraint
  where conrelid='public.support_requests'::regclass
    and pg_get_constraintdef(oid) ilike '%support_types%';
  ```
  `udt_name` `text[]` ve ikinci sorgu boşsa ek işlem gerekmez; ENUM/CHECK çıkarsa `student_representative` değerini o tanıma eklemen gerekir (bana göster, ben uygulamam).
- [ ] **Yaklaşan etkinlik kartı yolu:** DB'de şu an yayındaki 5 etkinlik de geçmiş durumda → yaklaşan kartın zengin görünümü (kategori/kayıt rozeti/Katılım-Katılımcı satırı) bu turda ekranda doğrulanamadı; yeni bir yaklaşan etkinlik yayınlandığında kontrol edilmeli.
- [ ] **Admin sidebar görsel doğrulaması (tarayıcı gerekli):** giriş yapılmış bir admin oturumunda `/admin` altındaki sayfalar arasında gezin; sol menü her sayfada yerinde kalmalı, aktif öğe yeşil sol kenarlık + zeminle işaretlenmeli (`/admin/events` → `/admin/events/new` → `/admin/events/[id]/edit` "Etkinlikler" aktif kalmalı); tüm bağlantılar doğru sayfayı açmalı; mobilde hamburger → drawer açılıp kapanmalı (arka plan tıklama, Escape, odak tuzağı); konsolda yeni React/hydration hatası olmamalı. Bu oturumda tarayıcı bağlı olmadığından yapılamadı (yalnız HTTP smoke: login 200 sidebar yok, `/admin` 307 auth korunuyor).
- [ ] **Logo + görsel optimizasyonu görsel doğrulaması (tarayıcı gerekli):** admin sidebar üstünde ve login kartında gerçek Holly Sport logosunun (`icon-512.png`, koyu yuvarlak karo) net ve oranlı göründüğünü; hero'nun (`hero-background-v2.jpg`, 0.67 MB) ve etkinlik kartı kapaklarının (artık `next/image` ile) bozulmadan/sığmadan yüklendiğini; galeri aydınlatıcısının (lightbox) büyük görselleri net gösterdiğini kontrol et. Ekran görüntüsüyle teyit edilmedi (tarayıcı bağlı değildi).

- [ ] **Hydration doğrulaması (tarayıcı gerekli):** düzeltmeden sonra `/` ve temel sayfaları temiz/gizli sekmede (eklentisiz) açıp konsolda hydration uyarısının tekrarlamadığını masaüstü + mobilde gör; olmazsa `/#faq` eski bundle bayatlığı veya eklenti ihtimali için ayrıca kanıt topla (bu oturumda tarayıcı bağlı olmadığından yapılamadı).

- [ ] ESLint hatalarını temizle (önceden var, bu oturumda dokunulmadı):
  - `app/events/page.tsx`, `app/events/[slug]/page.tsx`, `app/join/page.tsx` → render içinde `Date.now()` kullanımı (purity kuralı).
  - `components/gallery/GalleryGrid.tsx` → effect içinde senkron `setShuffledImages`.
- [ ] Form rate-limit RPC'sinin (`check_and_record_form_rate_limit`) davranışını yük altında test et.
- [ ] Registration akışı uçtan uca: doluluk, son başvuru geçmiş, kapalı kayıt, mükerrer e-posta (409) senaryoları.
- [ ] Tek tuşla etkinlik katılım uçtan uca (üye): ilk kayıtta **"Kaydınız tamamlanmıştır"**, ikinci denemede yalnızca gerçek kayıt varsa "zaten kayıtlısın"; iptal/ret sonrası yeniden katılım `pending` olarak açılmalı.
- [ ] Telefon validasyonu: kayıt formu + profil (9 haneli, 16 haneli, harf içeren numaralar reddedilmeli; boş bırakılabilir).
- [ ] Mobil görünüm: profil sekme barı (Antrenmanlarım / Etkinliklerim / **Düzenle**) dar ekranda yatay kaydırılabilmeli; 3D model etiketleri kas seçiminin tıklamasını engellememeli.
- [ ] Kişiye özel program talebi uçtan uca: modal → "Talebin alındı!" → `/admin/custom-training-requests` listesinde görünmeli; 10 dakikada 4. gönderimde rate-limit hatası; honeypot dolduğunda kayıt yazılmamalı. `status` SQL'i sonrası Bekliyor/İncelendi değişimi çalışmalı.
- [ ] **Profil kartı üst alan (sadeleştirme sonrası):** kartta yalnızca avatar, tam ad, **Üyelik Süresi** rozeti, **yaş** rozeti, **cinsiyet** rozeti ve ilgili sporlar görünmeli; e-posta satırı ve telefon rozeti olmamalı, sağ üstte yalnızca **Çıkış** butonu kalmalı ("Düzenle" yok — düzenleme alt sekmede). İsim **tek satırda** kalmalı (uzun adda "…" ile kesilir, `title` tam metni gösterir), alt alta kırılmamalı; mobilde kart taşmamalı.
- [ ] **Form alanı okunabilirlik (global düzeltme sonrası):** koyu zeminde yazılan metin beyaz olmalı — admin girişi, profil düzenleme, kişiye özel antrenman modalı, etkinlik başvurusu, iletişim/destek formları, metabolizma hesaplayıcı; açık admin panellerinde (`/admin/sponsors`, `/admin/supporters`, `/admin/exercises`) metin koyu kalmalı; placeholder her yerde okunabilir ama yazılan metinden ayrık görünmeli. Ayrıca tarayıcı otomatik doldurma (autofill) ile girilen yazıları da kontrol et.
- [ ] **Admin → Özel Antrenman Talepleri silme:** karttaki kırmızı **Sil** → "Silinsin mi?" onayı → kayıt listeden anında kaybolmalı (`revalidatePath`); **Vazgeç** hiçbir şey yapmamalı; hata durumunda kart altında kırmızı mesaj, sayfa çökmemeli; iki sekmede aynı kayıt silinmeye çalışılınca "kayıt zaten silinmiş olabilir" hatası görünmeli. `status` SQL'i silme işlemini etkilememeli (silme `status` kolonuna bağlı değil).
- [ ] **Antrenman → hedefe göre adım atlama:** "Esneklik / Mobilite", "Postür Düzeltme" ve "Dikey Sıçrama Geliştirme" seçilince cinsiyet+3D harita ve şablon/kas filtreleri gizlenmeli, ortam (Ev/Spor Salonu) seçiminden hemen sonra program otomatik üretilmeli ("Tam vücut programın" başlığı); "Hacim" ve "Maksimum Kuvvet" hedeflerinde 3D kas seçimi normal akışta kalmalı. Atlanan hedefte "Bu bölge için hareket bulunmuyor" blokları sıfırlanmamalı, hiç egzersiz yoksa "uygun egzersiz bulunamadı" boş durumu görünmeli; Profilime Kaydet → `Esneklik / Mobilite Programı` adıyla ve üretilen bölgelerle kaydedilmeli, profilde `N bölge` doğru görünmeli.

- [ ] **Beyaz tema görünürlük denetimi (görsel):** ekran görüntüsüyle doğrulanamadı (tarayıcı bağlı değildi); kod/HTML/CSS üzerinden tamamlandı. Manuel kontrol: 375/390/768/1440 px genişliklerde hamburger ikonu + mobil menü + kapatma (X) animasyonu görünür ve çalışır olmalı; beyaz zeminde kaybolan ikon/metin kalmamalı. `EventMarquee` disabled okları %40 opaklıkta hâlâ soluk hissedilirse artırılabilir.
- [ ] **Ana sayfa 3D tanıtım bloğu (tamamlandı, kod/HTML ile):** 3D tanıtım bloğu ("YENİ NESİL ANTRENMAN" / "3D Anatomi Destekli Antrenman Merkezi." / "Hemen Ücretsiz Başla" / 3 özellik kartı) artık görünmemeli; Hero'nun hemen altında doğrudan Hakkımızda bölümü başlamalı, arada gereksiz boşluk veya kaymalı kenar olmamalı.
- [x] **Ana sayfa SEO metadata (uygulandı, 2026-10-17):** `app/layout.tsx` içindeki eski antrenman-odaklı mesaj ("3D anatomi destekli antrenman platformu" / "İnteraktif 3D anatomi haritası…") `description`, `og:description`, `twitter:description` alanlarından kaldırıldı. Yeni başlık `Holly Sport | Bağımsız Spor Topluluğu`, yeni açıklama "…bağımsız bir spor topluluğudur. Etkinliklere katıl…". `og`/`twitter` tek `siteDescription` sabitini paylaşıyor. `/training` kendi metadata'sı ve 3D harita özelliği korundu. tsc/lint/build/diff-check temiz; yerel `<title>`+meta doğrulandı.
- [x] **SEO — production canlı doğrulama (tamamlandı, 2026-10-17, `d9c36a4`):** canlı `https://hollysport.net/` HTML'inde `<title>` = `Holly Sport | Bağımsız Spor Topluluğu`, `description` yeni topluluk metni, `og`/`twitter` title+description tutarlı; eski "3D anatomi / Yeni Nesil Antrenman" yok.
- [ ] **Google yeniden dizin (manuel, sen yapacaksın):** Google eski başlığı önbellekte tutabilir → Search Console'da **URL Denetimi**'nden ana sayfayı ("Tarayıcı olarak doğrula") yeniden tara/incele talebi gönder. Site içeriğinde SEO metni düzeltildi; dizin yenileme Google tarafında elle tetiklenir.
- [ ] **Destekçiler bölümü etkileşim kontrolü (manuel, 2026-10-19):** kod/SSR HTML ile tamamlandı, tarayıcı bağlı olmadığından ekran görüntüsüyle doğrulanamadı. Kontrol: "Destekçilerimiz" kartının başlığı altında yan yana iki buton — "Aktif Yatırımcılar" (seçili: yeşil `#27D66B` pill) ve "Tüm Zamanlar" (beyaz, kenarlı); aynı satırda, mobilde (375px) taşmadan sığmalı. "Tüm Zamanlar"a basınca sayfa yenilenmeden listede pasif destekçiler de görünmeli (33 kayıt: 10 aktif / 23 pasif); "Daha fazla göster" her iki modda da çalışmalı. Admin → Destekçiler'den bir kaydı "Ana sayfada gizle" yapıp kaydettiğinde ana sayfada "Aktif Yatırımcılar" listesinden çıkmalı, "Tüm Zamanlar"da kalmalı.
- [ ] **Navbar kenarlıksız görünüm:** masaüstünde kapsülün, linklerin, Giriş Yap / Topluluğa Katıl / Destek Ol / avatar / hamburger'ın etrafında **hiç çizgi (border/outline/ring) olmamalı** — sadece yumuşak zemin + gölge + blur; hover'da da çizgi çıkmamalı (sadece zemin/metin rengi değişmeli). Mobil menü panelinde de ayraç/border kalmamalı.
- [ ] **Ana sayfa hero + navbar overlay:** hero görseli ekranın 0 px'inden başlamalı (navbar arkasında siyah bant olmamalı); navbar hem mobilde hem masaüstünde görselin üzerinde yüzerken okunur kalmalı; hero metni navbar'ın altında kalmamalı; pencere yüksekliği < 560px (yatay ekran) olduğunda hero metni navbar'ın altında kaybolmamalı. Diğer sayfalarda (ör. /events, /gallery, /contact) `overlay` verilmediği için üst boşluk korunmalı — ilk bölüm başlıkları navbar'ın altına girmemeli.
- [ ] **Navbar floating pill (masaüstü):** ≥1280px'te ortada tek cam kapsül (tam ortalanmış, taşmayan, aktif link yeşil pill), solda serbest logo, sağda yuvarlak aksiyon butonları (Giriş/Profil · Topluluğa Katıl · Destek Ol); 1024–1279px ve mobilde hamburger menü tüm link + aksiyonlara erişim vermeli; md+ header üstten 16px boşluklu sabit ve içerik ilk 96px'te başlamalı (hero'lar kaymamalı); beyaz bölümlerde (Hakkımızda / Sporlar / Galeri / SSS) logo ile kapsül okunur kalmalı; `/#faq` kaydırmasında başlık altında kalan bölüm örtülmemeli; mobilde (<768px) eski sticky tam genişlik görünüm değişmemeli.

## Performans (2026-10-16 bir kısmı uygulandı)

- [x] **Görsel boyutları (uygulandı):** `public/` içindeki 3 MB üstü **75 JPEG/PNG** kaynak gerçek kullanım çözünürlüğüne indirildi (galeri 1600px, hero 2000px tavan; format + dosya adları korundu, asla büyütmme, kalite 82). Toplam **683.7 MB → 30.6 MB** (≈653 MB kazanç); `hero-background-v2.jpg` 9.2 → 0.67 MB. Kalan küçük dosyalara dokunulmadı.
- [x] **Etkinlik kartı görselleri (uygulandı):** `app/events/page.tsx` (`EventCard`), `app/events/[slug]/page.tsx` (kapak `priority` + galeri) ve `components/sections/UpcomingEventsClient.tsx` CSS `backgroundImage` → `next/image` `fill` + gerçek `sizes`; `next.config.ts`'e Supabase `remotePatterns` eklendi → Vercel optimizer devrede.
- [ ] **`/events` sayfası:** `force-dynamic` + limitsiz sorgu; ileride limit/sayfalama değerlendirilebilir (davranış değişikliği olacağı için bu görevde bırakıldı).
- [x] **Testimonials sorgusu:** batch `createSignedUrls`'a geçirildi (N+1 giderildi); limitsiz sorgu bilinçli bırakıldı (ortalama tüm onaylı yorumlar üzerinden).

## Özellik geliştirme

- [ ] `<img>` kullanımlarını `next/image`'e taşımayı değerlendir (performans; düşük öncelik).
- [ ] Admin paneli için route-seviyesinde `loading.tsx` / `error.tsx` eklenebilir (şu an kök seviye dosyalar yeterli).
- [ ] `/admin/users` sayfası için silme / rol değiştirme aksiyonları (şu an salt liste + arama; silme bilinçli olarak eklenmedi).
- [ ] Bildirim Merkezi'ne "son X gün" filtresi veya temizleme aksiyonu (şu an sabit son 10 kayıt, kaynak başına limitli sorgular).
