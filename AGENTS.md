<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Holly Sport — Proje Kuralları

## Proje

Holly Sport topluluğunun resmi web sitesi (https://hollysport.net). Türkçe içerik.

## Teknolojiler

- Next.js 16.2.10 (App Router, Turbopack, middleware yerine kök `proxy.ts`)
- React 19, TypeScript, Tailwind CSS 4
- Supabase (Postgres + Auth + Storage) — `@supabase/ssr`, `@supabase/supabase-js`
- Cloudflare Turnstile (form spam koruması)
- framer-motion, lucide-react, clsx

## Mimari

- `app/` route'lar: public sayfalar (/, /events, /gallery, /join, /destek-ol, /bir-hayalim-var, /contact, ...) ve `/admin/*` paneli.
- `app/api/forms/{registration,support,dream}/route.ts` — tüm formlar sunucu route'ları üzerinden, service-role client (`lib/supabase/admin.ts`) ile yazar. Client'tan doğrudan Supabase insert YOK.
- Form güvenlik deseni (hepsi aynı sırayla): Content-Length limiti → Origin/Host doğrulaması → JSON parse → honeypot (sahte başarı) → alan doğrulama → Turnstile token doğrulama (`lib/security/turnstile.ts`, `expectedAction` = form key) → rate limit (`lib/security/form-rate-limit.ts`, RPC `check_and_record_form_rate_limit`, 3 istek / 10 dk) → admin client insert. `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx` kökte mevcut.
- `lib/supabase/database.types.ts` — elle yazılmış `Database` tipleri; şema değişince güncellenir. CLI kurulursa `npx supabase gen types typescript --project-id <id>` ile üretilir.
- Auth: cookie tabanlı (`@supabase/ssr`); `lib/supabase/server.ts` (server), `client.ts` (browser), `proxy.ts` (session refresh + admin route guard).

## Supabase / RLS kuralları

- Veritabanı şeması ve RLS politikaları repoda tutulmaz; Supabase dashboard'da yönetilir (migration'lar yok). Şema değiştirme; gerekirse SQL'i kullanıcıya göster, kendin çalıştırma.
- Public formlar anon değil, service-role route üzerinden yazar; RLS'i bypass eden tek nokta bu route'lardır.
- Yeni form eklerken mevcut api/forms desenini kopyala.

## Admin yetkilendirme

- `lib/auth/require-admin.ts`: oturum + `profiles.role === "admin"` kontrolü; tüm `/admin/*` sayfaları ve server action'larda kullanılır (login hariç).
- Ek savunma derinliği: `lib/supabase/proxy.ts` içinde `updateSession()` `/admin/*` için aynı kontrolü proxy seviyesinde yapar; `/admin/login` daima erişilebilir.
- Bu iki katmanı bozma.

## Tasarım kuralları

- Koyu tema: arka plan `#050505`, yüzey `#111111`, birincil renk `#27D66B` (yeşil), metin `text-white`/`text-white/50`.
- Font: Manrope. Sayfalar Türkçe.
- Tasarımı değiştirme; yeni UI'ı mevcut sınıflarla ve desenlerle yaz.

## Mobil uyumluluk

- Tüm sayfalar mobil öncelikli; mevcut responsive sınıfları (sm/md/lg) koru.

## Kod değiştirme kuralları

- Kod değiştirmeden önce ilgili dosyaları ve etkilenen çağıranları incele.
- Gereksiz dependency ekleme, gereksiz refactor yapma, çalışan özellikleri kaldırma.
- Minimum müdahale; büyük değişikliklerde önce plan çıkar.
- Doğrulama: `npm run lint`, `npx tsc --noEmit`, `npm run build`.
- Durum takibi: `PROJECT_STATUS.md`, `TODO.md`, `CHANGELOG.md` dosyalarını güncel tut.
