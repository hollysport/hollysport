# Changelog — Holly Sport

Önemli değişiklikler tarih sırasıyla (en yeni üstte). Tarihler `git log` çıktısından alınmıştır.

## 2026-09-29 — Antrenman: 3 hedefte kas grubu adımı atlama (commit bekliyor)

- `components/training/WorkoutGenerator.tsx`:
  - **Adım atlama mantığı:** `MUSCLE_STEP_SKIPPED_GOALS = ["esneklik", "postur", "sicrama"]` (Esneklik/Mobilite, Postür Düzeltme, Dikey Sıçrama Geliştirme). Bu hedeflerde cinsiyet seçimi + **3D kas haritası + "Seçimi temizle"** ve filtrelerdeki **Antrenman Şablonu / Kas Grupları** seçicileri tamamen gizlenir; yerlerine "kas grubu adımı atlandı / tam vücut otomatik oluşturuldu" bilgi notları gelir. `Antrenman Hedefi` ve ortam (Ev/Spor Salonu) seçimi her zaman yerinde.
  - **Doğrudan üretim:** `readyToGenerate = muscleStepSkipped || hasSelection` — bu 3 hedefte ortam/hedef değiştiği anda mevcut canlı üretim akışı sorguyu çalıştırır (ayrı bir butona gerek yok). Başlık "Tam vücut programın" olur.
  - **Arka plan verisi:** `FULL_BODY_MUSCLES` = `MUSCLE_GROUPS` tamamı (9 bölge) sorgu ve gruplama için kullanılır; bu yüzden `[]` gönderilmez (sunucudaki `saveWorkout` bölge listesi boşsa kayıt yapmaz). Kayıtta `savedMuscles` normal hedefte kullanıcı seçimi, atlanan hedefte **üretilen programın gerçek bölgeleri** olarak yazılır; `templateName` atlanan hedefte `${Hedef} Programı` olur.
  - **Görsel temizlik:** atlanan hedefte boş bölge blokları filtrelenir (tam vücutta "Bu bölge için hareket bulunmuyor" yığını çıkmaz) ve hiç egzersiz yoksa "ortam/hedef için uygun egzersiz bulunamadı" boş durumu gösterilir. Yükleme iskeleti `effectiveMuscles` ile çizilir.
  - **Diğer hedefler (Hacim, Kuvvet)** için 3D seçim, şablon/kas filtreleri ve mevcut grup/bölge davranışı **değişmedi**.
- `app/training/page.tsx`: bölüm metnine "Esneklik, postür ve sıçrama hedeflerinde bölge seçimi gerekmez" eklendi.
- Doğrulama: `npx tsc --noEmit` ✓, `npm run lint` 0 hata, `npm run build` ✓.

## 2026-09-29 — Profil isim/e-posta sarma düzeltmesi (commit bekliyor)

- `components/auth/profile-dashboard.tsx` profil başlığındaki `truncate` kaldırıldı (çok erken kesip "u…" gibi gösteriyordu):
  - İsim (`displayName`) → **`break-words`**, e-posta (`displayEmail`) → **`break-all`**: metin sığabildiği kadar yan yana yazılır (15-20+ karakter), sığmayan kısım doğal olarak alt satıra kırılır; `...` ile kesme yok. `title` korundu (imleçte tam metin).
  - Metni saran kapsayıcı `min-w-0` → **`min-w-0 flex-1`** (avatarın yanındaki kalan tüm genişliği kullanır) ve yanındaki Düzenle/Çıkış buton bloğuna **`shrink-0`** eklendi; butonlar artık metin alanını daraltmıyor, satıra sığmazsa altta sarılıyor (`flex-wrap`).
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
