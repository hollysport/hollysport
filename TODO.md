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
- [ ] Profil: boşluksuz uzun isim ("aaaa…") başlıkta tek satır kalmalı (üzerine gelince `title` ile tam metin görünmeli).
- [ ] **Form alanı okunabilirlik (global düzeltme sonrası):** koyu zeminde yazılan metin beyaz olmalı — admin girişi, profil düzenleme, kişiye özel antrenman modalı, etkinlik başvurusu, iletişim/destek formları, metabolizma hesaplayıcı; açık admin panellerinde (`/admin/sponsors`, `/admin/supporters`, `/admin/exercises`) metin koyu kalmalı; placeholder her yerde okunabilir ama yazılan metinden ayrık görünmeli. Ayrıca tarayıcı otomatik doldurma (autofill) ile girilen yazıları da kontrol et.

## Özellik geliştirme

- [ ] `<img>` kullanımlarını `next/image`'e taşımayı değerlendir (performans; düşük öncelik).
- [ ] Admin paneli için route-seviyesinde `loading.tsx` / `error.tsx` eklenebilir (şu an kök seviye dosyalar yeterli).
