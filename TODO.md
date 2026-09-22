# TODO — Holly Sport

## Kritik güvenlik

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

## Özellik geliştirme

- [ ] `<img>` kullanımlarını `next/image`'e taşımayı değerlendir (performans; düşük öncelik).
- [ ] Admin paneli için route-seviyesinde `loading.tsx` / `error.tsx` eklenebilir (şu an kök seviye dosyalar yeterli).
