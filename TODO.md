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

- [ ] Bekleyen değişiklikleri commit'le (registration API route, proxy guard, database.types, loading/error/not-found, .env.example, AGENTS/PROJECT_STATUS/TODO/CHANGELOG).
- [ ] Supabase CLI kurulumu istersen: `npx supabase gen types typescript --project-id <id>` ile `database.types.ts`'i otomatik üretmeye geç.
- [ ] `supabase/` migration klasörü yok; şema/RLS değişikliklerini ileride migration olarak takip etmeyi değerlendir.

## Test

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

- [ ] **Ana sayfa:** 3D tanıtım bloğu ("YENİ NESİL ANTRENMAN" / "3D Anatomi Destekli Antrenman Merkezi." / "Hemen Ücretsiz Başla" / 3 özellik kartı) artık görünmemeli; Hero'nun hemen altında doğrudan Hakkımızda bölümü başlamalı, arada gereksiz boşluk veya kaymalı kenar olmamalı.
- [ ] **Navbar kenarlıksız görünüm:** masaüstünde kapsülün, linklerin, Giriş Yap / Topluluğa Katıl / Destek Ol / avatar / hamburger'ın etrafında **hiç çizgi (border/outline/ring) olmamalı** — sadece yumuşak zemin + gölge + blur; hover'da da çizgi çıkmamalı (sadece zemin/metin rengi değişmeli). Mobil menü panelinde de ayraç/border kalmamalı.
- [ ] **Ana sayfa hero + navbar overlay:** hero görseli ekranın 0 px'inden başlamalı (navbar arkasında siyah bant olmamalı); navbar hem mobilde hem masaüstünde görselin üzerinde yüzerken okunur kalmalı; hero metni navbar'ın altında kalmamalı; pencere yüksekliği < 560px (yatay ekran) olduğunda hero metni navbar'ın altında kaybolmamalı. Diğer sayfalarda (ör. /events, /gallery, /contact) `overlay` verilmediği için üst boşluk korunmalı — ilk bölüm başlıkları navbar'ın altına girmemeli.
- [ ] **Navbar floating pill (masaüstü):** ≥1280px'te ortada tek cam kapsül (tam ortalanmış, taşmayan, aktif link yeşil pill), solda serbest logo, sağda yuvarlak aksiyon butonları (Giriş/Profil · Topluluğa Katıl · Destek Ol); 1024–1279px ve mobilde hamburger menü tüm link + aksiyonlara erişim vermeli; md+ header üstten 16px boşluklu sabit ve içerik ilk 96px'te başlamalı (hero'lar kaymamalı); beyaz bölümlerde (Hakkımızda / Sporlar / Galeri / SSS) logo ile kapsül okunur kalmalı; `/#faq` kaydırmasında başlık altında kalan bölüm örtülmemeli; mobilde (<768px) eski sticky tam genişlik görünüm değişmemeli.

## Özellik geliştirme

- [ ] `<img>` kullanımlarını `next/image`'e taşımayı değerlendir (performans; düşük öncelik).
- [ ] Admin paneli için route-seviyesinde `loading.tsx` / `error.tsx` eklenebilir (şu an kök seviye dosyalar yeterli).
- [ ] `/admin/users` sayfası için silme / rol değiştirme aksiyonları (şu an salt liste + arama; silme bilinçli olarak eklenmedi).
- [ ] Bildirim Merkezi'ne "son X gün" filtresi veya temizleme aksiyonu (şu an sabit son 10 kayıt, kaynak başına limitli sorgular).
