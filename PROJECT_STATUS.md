# Proje Durumu — Holly Sport

Son güncelleme: 2026-09-20

## 2026-09-20 (Düzeltme): Stats → tarihsel toplamlar

- `Stats.tsx`: Supabase count kaldırıldı; topluluğun kümülatif resmi rakamları: **300+ Etkinlik, 1000+ Sporcu** + canlı `sports.length` Branş. Üç metrik yeni editorial kompozisyonda.
- `StatsClient.tsx`: grid 3 kolona çevrildi, sayı boyutu 3 kolona optimize edildi (`lg:text-7xl`). Header/çizgi/yeşil aksanlar aynı.

## 2026-09-20 (Faz 6): Motion sistemi sadeleştirildi

- **Gallery / UpcomingEventsClient / Sports** → framer-motion whileInView/stagger/reveal kaldırıldı; üçü de statik server component oldu. Kart hover'ları sade border/renk geçişi + kontrollü `scale-105` (≤300ms); tap feedback'i globals.css `tap-scale` ile sağlanıyor.
- **Supporters** → logo kartlarındaki `hover:-translate-y-1` lift kaldırıldı, sade border hover (`hover:border-white/30`, 300ms).
- Sitede kalan bilinçli motion: Hero giriş stagger + Stats Counter + CSS marquee/hover mikro-etkileşimleri; `prefers-reduced-motion` kuralına dokunulmadı.
- tsc/eslint temiz (Supporters'ta önceden var olan `<img>` uyarısı kapsam dışı); `npm run build` başarılı.

## 2026-09-20 (Faz 5): Stats gerçek veride

- `components/sections/Stats.tsx` → server component; `events` tablosundan `status='published'` exact count (server Supabase client, `count:"exact", head:true`) + `data/sports.ts` `sports.length` (=10). Hardcoded `500+/200+/15+/1000+` kaldırıldı (Aktif Sporcu ve Katılım metrikleri kaynaksız/RLS belirsiz olduğu için çıkarıldı).
- Yeni `components/sections/StatsClient.tsx`: mevcut Counter (IntersectionObserver) animasyonu aynen korunarak client'a taşındı. 4'lü kart grid yerine 2 editorial metrik: ince yeşil sol çizgi + büyük sayılar. Sorgu hatasında sayı yerine "—" (fallback, sayfa kırılmaz).
- tsc/eslint temiz; `npm run build` başarılı (`/` route'u build çıktısında mevcut).

## 2026-09-20 (Faz 4): About editorial

- `components/sections/About.tsx`: "yan yana metin+görsel kart" kalıbı kaldırıldı. Editorial layout: tam genişlik başlık + `max-w-2xl` yüksek leading paragraf + sade ok-linki (`/about`) + altta tam genişlik, hafif sade gradient+figcaption'a sahip topluluk fotoğrafı. İçerik/URL/veri değişmedi.

## 2026-09-20 (Faz 3): HowItWorks artık adım listesi

- `components/sections/HowItWorks.tsx`: 3 eş kart kaldırıldı; editorial iki kolon (sol başlık + sağ dikey numaralı süreç, ince çizgi + yeşil numara yuvarlakları, küçük yeşil ikon). İçerik/veri değişmedi. `tsc`/`eslint` temiz.

## 2026-09-20 (Faz 2): Testimonials artık koyu temada

- `components/reviews/TestimonialsClient.tsx`: yeşil full-bleed `#27D66B` zemin kaldırıldı → `bg-[#050505]`; kart/veri kutuları `bg-[#111111] border-white/10`; metinler white/white-55; yıldızlar yeşil, CTA "Görüşünü Paylaş" yeşil pill. Veri ve yapı değişmedi. Önceden var olan `<img>` uyarısı korundu (kapsam dışı).

## 2026-09-20 (Faz 1): Gallery / HowItWorks / JoinCommunity / Supporters marka uyumu

- Dört bölüm turuncu/açık temadan koyu-yeşil Holly Sport diline taşındı (`bg-[#050505]`, `text-white`, `text-white/55`, `border-white/10`, vurgu `#27D66B`).
- JoinCommunity: beyaz zemin + siyah kutu + turuncu glow blob'ları kaldırıldı; sade `#111111` kutu + sol yeşil şerit ile güçlü CTA korundu.
- HowItWorks: kart-lift/shadow efekti kaldırıldı; 3 kart yapısı korundu (redesign Faz 3'te).
- Supporters: logo kartları okunabilirlik için beyaz yüzeyde korundu; etiket/CTA/alt blok yeşil-koyu dile alındı. `<img>` uyarısı önceden var, bilinçli bırakıldı.
- tsc + eslint: hata yok.

## 2026-09-20: Ana sayfa FAQ tema uyumu

- `components/sections/Faq.tsx`: bölüm beyaz/turuncu temadan koyu temaya (`bg-[#050505]`, beyaz metin, `#27D66B` etiket, `white/10` ayraçlar) alındı; sayfanın geri kalanıyla görsel tutarlılık sağlandı.
- Accordion `<summary>` satırında `items-start` + ikon `mt-1` ile uzun sorularda hizalama düzeltildi; iOS tap highlight giderildi.
- FAQ içeriği, `<details>` davranışı, CTA ve `id="faq"` anchor'ı değişmedi. `tsc --noEmit` ve ESLint temiz. TODO'daki "turuncu bölümler" konusunda `HowItWorks` ve `JoinCommunity` hâlâ turuncu/beyaz; istenirse aynı uyarlama yapılabilir (kullanıcı onayı gerekli).

> Not: Tarihler Windows saatine göredir; repo commit geçmişi 2026-07 olarak işaretli (sistem saati ileride).

## Tamamlanmış özellikler

- Public site: anasayfa, hakkımızda, branşlar, etkinlik liste/detay, galeri (filtre + shuffle), takım, SSS, iletişim, KVKK/gizlilik/şartlar.
- Üç public form sunucuya taşındı ve spam korumalı:
  - `/destek-ol` (support) — Turnstile + honeypot (`companyFax`) + rate limit
  - `/bir-hayalim-var` (dream) — Turnstile + honeypot (`website`) + rate limit
  - `/join` (registration) — `POST /api/forms/registration`; Turnstile + honeypot (`website`) + rate limit + KVKK onayı; client tarafındaki doğrudan Supabase insert kaldırıldı. Etkinlik uygunluk kontrolü (durum, kapasite, son başvuru, `registration_open`) sunucuda yapılıyor.
- Admin paneli: dashboard, etkinlikler (CRUD + galeri), başvurular (RPC `review_event_registration` ile onay/red/sil), destek talepleri, bireysel destekçiler, sponsorlar, hayaller, sorular, yorumlar.
- Kök seviye `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx` eklendi.

## Mevcut mimari

- Next.js 16 (App Router, Turbopack), React 19, Tailwind 4, Supabase (`@supabase/ssr`).
- Formlar: tek güvenlik deseni → origin kontrolü → honeypot → validasyon → Turnstile → rate limit (RPC) → service-role insert.
- Auth: cookie tabanlı oturum; `lib/auth/require-admin.ts` (sayfa/action) + `lib/supabase/proxy.ts` (proxy guard) çift katman admin koruması.
- Tipler: `lib/supabase/database.types.ts` tüm client'lara bağlı (server/client/admin/proxy).

## Güvenlik durumu

- Public formlarda client-side Supabase insert yok; yazma sadece service-role API route'larında.
- Turnstile secret ve Supabase secret sadece sunucuda; `.env*` `.gitignore` içinde, repo geçmişinde secret bulunmadı (kontrol edildi).
- `.env.example` oluşturuldu (gerçek değer içermez).
- Admin rotaları hem proxy hem sayfa seviyesinde korunuyor.

## Bilinen problemler

- ESLint'te önceden var olan 5 hata (bu oturumda dokunulmadı):
  - `app/events/page.tsx`, `app/events/[slug]/page.tsx`, `app/join/page.tsx` — render içinde `Date.now()` (react-hooks/purity)
  - `components/gallery/GalleryGrid.tsx` — effect içinde senkron setState
- `components/admin/sponsor-manager.tsx` — kullanılmayan `Save` importu (uyarı), `<img>` kullanımı (uyarı).
- RLS: kayıt formu artık service-role yazdığı için `event_registrations` üzerindeki anon insert politikası gereksiz; dashboard'dan gözden geçirilmeli (bkz. TODO ve SQL önerisi).

## Devam eden işler

- Bu oturumdaki değişiklikler henüz commit'lenmedi (registration API route, proxy guard, database.types, loading/error/not-found, .env.example, dokümanlar).

## Sıradaki önerilen görev

1. Değişiklikleri commit'le (kullanıcı onayıyla).
2. RLS temizliği SQL'ini Supabase dashboard'da çalıştır (SQL aşağıda / TODO'da).
3. Canlıda formların uçtan uca testi (Turnstile prod anahtarlarıyla).

## Bugünkü çalışma için başlangıç noktası

- `git status` ile bekleyen değişiklikleri kontrol et; `PROJECT_STATUS.md` ve `TODO.md`yi oku.
- Doğrulama: `npx tsc --noEmit` ve `npm run build` temiz durumda (2025-09-16 itibarıyla).
