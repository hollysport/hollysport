# Changelog — Holly Sport

Önemli değişiklikler tarih sırasıyla (en yeni üstte). Tarihler `git log` çıktısından alınmıştır.

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
