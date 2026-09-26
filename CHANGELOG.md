# Changelog — Holly Sport

Önemli değişiklikler tarih sırasıyla (en yeni üstte). Tarihler `git log` çıktısından alınmıştır.

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
