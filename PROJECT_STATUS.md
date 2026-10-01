# Proje Durumu — Holly Sport

Son güncelleme: 2026-10-01

## 2026-10-01: Admin — Bildirim Merkezi (Son Aktiviteler) + Üye Yönetimi

- `app/admin/page.tsx` → **Bildirim Merkezi** kartı: `custom_program_requests` (pending + son), `support_requests`, `individual_supporters`, `profiles` kayıtları paralel okunup `created_at`/`join_date` azalan sırayla tek zaman akışında birleştirilir (max 10 satır).
  - Satır: tür ikonu + başlık + kişi + detay + göreli zaman (`Intl.RelativeTimeFormat("tr")`), bekleyenlerde **Bekliyor** rozeti; başlıkta bekleyen talep/başvuru sayaçları.
  - Tüm satır linkli → `/admin/custom-training-requests`, `/admin/support-requests`, `/admin/supporters`, `/admin/users`.
  - Okuma service-role (`createAdminClient`); `PGRST204` (status kolonu yok) fallback'i mevcut sayfayla aynı; hatalar loglanır, kart hata mesajıyla görünür.
  - "Yönetim Araçları" gridine **Üyeler** kartı eklendi.
- `app/admin/users/page.tsx` → **yeni** üye listesi sayfası: `profiles` (son 500, `join_date` azalan), `?q=` ad/e-posta araması, üye/son 7 gün/yönetici sayaçları, kartlarda ad · e-posta · rol · üyelik tarihi · telefon · ilgi alanları (silme yok).
- tsc / eslint (0 hata) / build temiz; `/admin/users` dinamik route olarak üretildi.

## 2026-09-29: Navbar — kenarlıksız (borderless) yumuşatma

- `components/layout/navbar.tsx` içindeki **tüm** `border*` / `ring` / `outline` / `divide-*` sınıfları kaldırıldı (grep ile 0 eşleşme doğrulandı).
  - **Header:** `border-b border-white/10` + `md:border-transparent` silindi; mobilde alt ayracın yerine yumuşak `shadow-lg` (`md:shadow-none` — masaüstünde şeffaf başlıkta kutu gölgesi çizgi gibi görünürdü).
  - **Link kapsülü:** `border border-white/20` silindi → `bg-black/30 + shadow-lg + backdrop-blur-md`.
  - **Sağ blok (avatar · Giriş Yap · Topluluğa Katıl · Destek Ol · hamburger):** border yok; `bg-white/5` (Destek Ol `bg-[#27D66B]`) + `shadow-lg + backdrop-blur-md`, hover yalnızca zemin/metin rengiyle.
  - **Mobil menü paneli:** `border-t` ayraçları, kart `border`'ı ve buton `border`'ları kaldırıldı → `shadow-2xl` kart, `bg-white/5` / `bg-[#27D66B]/10` zeminli butonlar.
- tsc / eslint / build temiz; üretilen CSS'te `shadow-lg` ve `md:shadow-none` doğrulandı.

## 2026-09-29: Ana sayfa — Hero top-0'a alındı (navbar overlay)

- Navbar header'ı **tüm kırılma noktalarında `fixed inset-x-0 top-0 z-50`** (eski `sticky` kaldırıldı) → navbar hiçbir sayfada içerik akışını itmiyor. Yeni **`overlay`** prop'u (`overlay?: boolean`, varsayılan `false`) header'ın altındaki eş yükseklik boşluğunu basıyor.
- `app/page.tsx` → `<Navbar overlay />`: Hero **0'dan** başlıyor, siyah bant yok, navbar doğrudan hero görselinin üzerine biniyor.
- `components/sections/Hero.tsx`: `min-h-[100svh]` + `items-end` ile bölüm tam ekran; navbar'a ayrılan **`pt-40` kaldırıldı** — yerine sadece alçak ekranlarda (`@media(max-height:560px)`) `pt-28` güvenlik dolgusu kondu (içerik navbar'ın altında kaybolmasın diye).
- Diğer sayfalarda `overlay` yok → boşluk korunur (mobil `h-20`, md+ `h-24`, `bg-[#050505]`), düzenleri değişmedi.
- tsc / eslint / build temiz; üretilen CSS sınıfları (`.fixed`, `@media (max-height:560px)…pt-28`, `md:top-4`, `md:h-24`, `min-h-[100svh]`) doğrulandı.

## 2026-09-29: Ana sayfa — 3D tanıtım bölümü kaldırıldı

- `app/page.tsx` içindeki `<TrainingShowcase />` (ve import'u) silindi; `components/home/training-showcase.tsx` dosyası + boş klasörü tamamen kaldırıldı (başka kullanım yoktu). Hero → `About` bölümüne doğrudan geçiyor; bölüm kendi `border-t + bg-[#0a0a0a] + py-24` kabuğunu taşıdığı için ek boşluk gerekmedi.
- tsc / eslint / build temiz.

## 2026-09-29: Navbar → floating pill (yüzen kapsül) düzen

- `components/layout/navbar.tsx`: header **`fixed top-0 z-50`** (md+ `top-4`) — sonra tüm sayfalara eş yükseklik boşluğu, ana sayfaya `overlay` prop'u eklendi (bkz. yukarıdaki Hero maddesi). Masaüstünde header şeffaf + üstten yumuşak koyu degrade scrim (beyaz bölümlerde okunabilirlik).
- Orta: 9 link **tek cam kapsülde** (`rounded-full border-white/20 bg-black/30 backdrop-blur-md`), `flex-1 justify-center` ile tam ortalanır, `overflow-x-auto` ile taşmaz; aktif link yeşil pill. Kapsül `xl:flex` (1280px+), altında hamburger (`xl:hidden`) korunur; aksiyonlar `md:`'den itibaren görünür.
- Sağ blok: profil/Giriş Yap, Topluluğa Katıl, Destek Ol — hepsi `rounded-full` + `border-white/20 bg-white/5 backdrop-blur-md` (Destek Ol yeşil dolu + yeşil border).
- `Faq/Gallery/Sports`: `md:scroll-mt-28` eklendi (yüzen başlık payı).
- tsc / eslint / build temiz; üretilen CSS sınıfları doğrulandı.

## 2026-09-29: Admin — özel antrenman talebi silme

- `app/admin/custom-training-requests/actions.ts` → **`deleteProgramRequest(requestId)`**: `requireAdmin()` → service-role `delete().eq("id", …).select("id")` (kalıcı; RLS'e takılmaz, silinen satır yoksa ayrı hata döner) → **`revalidatePath("/admin/custom-training-requests")`**. Loglar `message/code/details/hint`; action throw atmaz.
- Yeni `delete-button.tsx`: kartın sağ üstünde kırmızı **Sil** (`Trash2`) butonu, iki adımlı onay (Evet, sil / Vazgeç), `useTransition` kilitli spinner, kart içi `role="alert"` hata; başarıda `router.refresh()`.
- `page.tsx`: buton mevcut `justify-between` üst satırına eklendi (rozet/tarihin sağında).
- tsc / eslint / build temiz.

## 2026-09-29: Profil kartı üst alan sadeleştirmesi

- `components/auth/profile-dashboard.tsx` kart başlığından **"Düzenle" butonu** (alt sekmede zaten var), **e-posta satırı** ve **telefon rozeti** kaldırıldı; sağ üstte yalnızca **Çıkış** butonu kaldı (`Pencil` import'u ve `displayEmail` değişkeni silindi).
- Kartta görünen veriler: avatar, **tam ad**, **Üyelik Süresi** rozeti, **yaş** rozeti, **cinsiyet** rozeti, **ilgili sporlar**.
- İsim satırı tek satır: `truncate + whitespace-nowrap` + `title` (kesilirse "…", imleçte tam metin); kapsayıcı `min-w-0 flex-1`, buton bloğu `shrink-0`.
- tsc / eslint / build temiz.

## 2026-09-29: Antrenman — 3 hedefte kas grubu adımı atlanıyor

- `components/training/WorkoutGenerator.tsx` içinde `MUSCLE_STEP_SKIPPED_GOALS = ["esneklik", "postur", "sicrama"]` (Esneklik / Mobilite, Postür Düzeltme, Dikey Sıçrama Geliştirme).
- **Atlanan hedeflerde:** cinsiyet seçimi + 3D kas haritası + "Seçimi temizle" ve filtrelerdeki **Antrenman Şablonu / Kas Grupları** gizlenir; yerine "kas grubu adımı atlandı" ve "tam vücut otomatik oluşturuldu" notları gelir. `readyToGenerate = muscleStepSkipped || hasSelection` sayesinde ortam/hedef seçilir seçilmez program üretilir (başlık: "Tam vücut programın").
- **Arka planda:** `FULL_BODY_MUSCLES` (9 bölgenin tamamı) sorgu/gruplama için kullanılır → boş `[]` gönderilmez; kayıtta `savedMuscles` üretilen programın gerçek bölgeleri, `templateName` `${Hedef} Programı` olur. Boş bölge blokları filtrelenir, hiç egzersiz yoksa "uygun egzersiz bulunamadı" boş durumu.
- **Korunan davranış:** Hacim ve Maksimum Kuvvet'te 3D seçim, şablon/kas filtreleri, bölge başı limit algoritması ve "Bu bölge için hareket bulunmuyor" blokları aynen çalışır.
- `app/training/page.tsx` bölüm metnine bu hedeflerde bölge seçimi gerekmediği eklendi.
- tsc / eslint / build temiz.

## 2026-09-29: Global form alanı okunabilirlik kuralı

- `app/globals.css`: `input/textarea/select { color: #18181b }` kuralı **kaldırıldı**, yerine `color: inherit` (Tailwind preflight). Eski kural koyu zeminli tüm formlarda yazılan metni koyulaştırıp okunmaz hale getiriyordu.
- **Renk kuralı (yeni):** her veri giriş alanı kendi sınıfını taşır → koyu zeminde `text-white`, açık (beyaz / `bg-zinc-50`) zeminde `text-zinc-950`. 113 alan taranıp doğrulandı; eksik renkli alanlar (`/admin/login`, `sponsor-manager`, `supporter-actions`) tamamlandı.
- **Placeholder kuralı:** global `#767680` (her iki zeminde ≈4.5:1, yazılan metinden ayrık); bileşen içi `placeholder:text-white/45` (koyu) / `placeholder:text-zinc-500` (açık) kullanılır. Tema sınıfları (`.form-field-dark`, `.admin-event-field`, `.registration-field`) placeholder opaklığı `0.45`.

## 2026-09-27 (devam): Kayıt artık Server Action + admin upsert

- Yeni `app/auth/actions.ts` → `registerUser`: SSR client ile `signUp` (captchaToken dahil) → `user.id` döner dönmez **service-role admin client ile `profiles.upsert({onConflict:'id'})`** (full_name, avatar_url, gender, birth_date, interested_sports, join_date=NOW/geçmiş ISO). SQL trigger bağımlılığı kaldırıldı; RLS bypass. Tüm hatalar try-catch + console.error (code/status dahil).
- `auth-dialog.tsx` handleRegister bu action'ı çağırır; Turnstile token hata durumunda sıfırlanır.
- tsc / eslint / build temiz.

## 2026-09-26 (devam 4): Profil → tam donanımlı üyelik paneli

- `components/auth/profile-dashboard.tsx` yeniden yazıldı: 3 sekmeli panel (Antrenmanlarım / Etkinliklerim / Ayarlar), üstte tüm üyelik bilgileri kartı (avatar, ad, e-posta, üyelik rozeti, doğumdan hesaplanan yaş, cinsiyet, ilgi sporları rozetleri).
- **Ayarlar**: `saveProfile` server action + profil düzenleme formu (ad, cinsiyet, max 3 spor chip'i, preset `AvatarSelector` — upload yok, `avatar_url` string). Şifre değiştirme bölümü (`updateUser`, tekrar kontrolü, yeşil bildirim). Danger Zone: şifre onaylı modal → `signInWithPassword` doğrulama → `deleteMyAccount` server action (service-role ile `auth.admin.deleteUser`, auth.users'tan kalıcı silme) → `signOut` + tam sayfa `/` yönlendirmesi.
- `app/profile/actions.ts`: `saveProfile` + `deleteMyAccount` (ikisi de cookie oturumuyla kimlik doğrular, admin client `lib/supabase/admin.ts`).
- Not: PowerShell Add-Content kaynaklı UTF-8 bozulması nedeniyle dashboard dosyası temiz şekilde yeniden yazıldı.
- tsc / eslint / build temiz.

## 2026-09-26 (devam 3): Auth modalına Turnstile koruması

- Kayıt ve Şifremi Unuttum formlarına mevcut `components/security/TurnstileWidget` entegre edildi (dark tema, dev test key fallback, `action` etiketli). Register'da widget şifre tekrarının altında; buton token'sız disabled. Forgot view'da e-postanın altında; aynı kural.
- Görünüm geçişlerinde `switchView` token'ı sıfırlar ve widget'ı resetKey ile yeniden kurar.
- Not: Token şu an client tarafında zorunlu; Supabase Auth'da CAPTCHA doğrulaması (Dashboard → Auth → Security → CAPTCHA = Turnstile) açılırsa token'ı `signUp({ captchaToken })` seçeneğiyle göndermek gerekir — eklememi ister misin?

## 2026-09-26 (devam 2): Ana sayfa Antrenman vitrini + SEO

- `layout.tsx` metadata güncellendi: title "Holly Sport | 3D Anatomi Destekli Yeni Nesil Antrenman", description ve OpenGraph/Twitter metinleri Antrenman Merkezi mesajıyla harmanlandı.
- Yeni `components/sections/TrainingShowcase.tsx`: mevcut landing korunarak Hero'nun hemen altına eklendi — `#0a0a0a` zemin, neon glow'lu "Hemen Başla" CTA (→/training), 3 kartlık özellikler (İnteraktif 3D Anatomi / Bilimsel Algoritma / Kişisel Kütüphane), hover lift + border geçişleri.
- Mevcut 11 bölümlük landing hiçbir şekilde silinmedi (kullanıcı onayıyla korundu).
- tsc / eslint / build temiz.

## 2026-09-26 (devam): WorkoutGenerator ↔ saved_workouts bağlantısı

- Oturum dinleme: `getUser()` + `onAuthStateChange` ile `userId` state'i.
- Program listelendikten sonra altta **Kaydet** butonu: girişsiz kullanıcıda "Kaydetmek İçin Giriş Yap" → WorkoutGenerator içine gömülü AuthDialog açılır; girişli kullanıcıda "Profilime Kaydet" → `saved_workouts` INSERT (`user_id, title [şablon adı], goal, environment, muscles[], exercises[{name,sets,reps,muscle}]`).
- Durum: `saving` spinner → `saved` ("Kaydedildi ✓", disabled) + profil linki yeşil bildirim; hata mesajı. Program değişince kayıt durumu sıfırlanır.

## 2026-09-26: Preset avatar sistemi + Profil sayfası

- `components/auth/avatar-selector.tsx`: 14 preset Lucide simgesi (dumbbell, flame, zap, trophy…), radyo-grid; seçim yeşil çerçeve. `AvatarIcon` export'u anahtar→ikon çözümleyici.
- AuthDialog kayıt formu: Yaş + Cinsiyet + Avatar seçici; `signUp` options.data = `{full_name, age, gender, avatar}`.
- `app/profile/page.tsx` (server, login yoksa `/`'ye redirect) + `components/auth/profile-dashboard.tsx` (client): avatar + profil bilgileri + Çıkış Yap; sekmeler: **Antrenmanlarım** (`saved_workouts` kart liste + accordion + DELETE + empty state → /training) ve **Etkinliklerim** (bilgi kartı).
- `database.types.ts`: profiles'e `age/gender/avatar_url`, yeni `saved_workouts` tablosu (kolonlar VARSAYILAN: title, goal, environment, muscles text[], exercises jsonb).
- Bekleyen DB işleri (kullanıcı dashboard'da): profiles kolonları SQL'i + `handle_new_user` trigger'ına age/gender/avatar eşlemesi + saved_workouts tablosu/RLS (user-owned select/delete). Aşağıda rapor notunda SQL öneriliyor.
- tsc / eslint / build temiz.

## 2026-09-25: Üyelik Auth Modalı

- Yeni `components/auth/auth-dialog.tsx`: 3 görünümlü modal (login / register / forgot_password), metin linkleriyle pürüzsüz geçiş. Register manuel doğrulama (e-posta formatı, e-posta+tekrar eşleşmesi, şifre ≥8 + tekrar eşleşmesi, alan altı kırmızı uyarılar); başarıda "Kayıt başarılı, giriş yapabilirsiniz" + login görünümü. Login başarıda modalı kapatır; forgot şifrede yeşil başarı mesajı. Supabase Auth: `signUp` / `signInWithPassword` / `resetPasswordForEmail`. Editoryal koyu-neon tema, Esc/backdrop kapanış, scroll kilidi, spinner'lı butonlar.
- `navbar.tsx`: masaüstüne "Giriş Yap" butonu (Topluluğa Katıl'ın solu), mobil menüye aynı buton; ikisi de modalı tetikler.
- tsc / eslint / build temiz.

## 2026-09-24 (FAZ 3.4): Filtreler dropdown mimarisine geçti

- Yeni `components/training/select-controls.tsx`: editoryal tema uyumlu `SingleSelect` / `MultiSelect` (dışarı tıklama + Esc kapanış, absolute panel, neon yeşil seçim durumu).
- **Antrenman Şablonu** (single-select): Özel Seçim, Fullbody (tüm gruplar), Üst Vücut (göğüs/sırt/omuz/kollar/karın), Alt Vücut (ön/arka bacak + kalça), Push, Pull — seçim `selectedMuscles`'ı anında günceller ve 3D etiketlerle senkron. Manuel bölge değişimi şablonu "Özel Seçim"e döndürür.
- **Kas Grupları**: harita altındaki rozet butonları kaldırıldı; checkbox'lı multi-select dropdown ile %100 senkron.
- **Antrenman Hedefi**: pill'ler kaldırıldı, single-select dropdown. Hedef açıklaması + set/tekrar özeti korundu.
- `lib/data/exercises.ts`'e `TemplateKey` + `TRAINING_TEMPLATES` eklendi.
- tsc / eslint / build temiz.

## 2026-09-24 (FAZ 3.3): Canlı veriye geçiş — mock havuz kaldırıldı

- **WorkoutGenerator**: `lib/data/exercises.ts` mock havuzu tamamen silindi (≈90 kayıt POOL + MOCK_EXERCISES); `buildProgram` yerini saf `groupExercises` aldı (bölge başı limit + hedef set/tekrar eşlemesi). Sorgu canlı: `exercises.in("target_muscle", …).eq("environment", …).contains("goals", [goal])`. Skeleton yükleme durumu (bölge başına pulse satırları) + hata durumu eklendi.
- **Admin egzersiz formu**: "Hedefler" checkbox grubu (5 hedef, en az biri zorunlu), `goals text[]` olarak insert; listede hedef rozetleri görünüyor.
- **ProgramRequestDialog**: form gönderimi artık sunucu action'ı üzerinden (`app/training/actions.ts` → `submitProgramRequest`): alan doğrulaması → honeypot → rate limit (`program_request`, 3/10 dk) → **service-role insert**. ✅ Gerçek kolon `contact_info` (PostgREST openapi ile doğrulandı); eski `contact` yazımı `PGRST204` üretip jenerik "Talebin gönderilemedi" hatasına yol açıyordu. Hatalarda `error.message`/`error.code` hem console'a loglanır hem kullanıcıya döner. Admin listesi: `/admin/custom-training-requests` (durum kolonu için SQL bkz. TODO).
- `database.types.ts`: `exercises.goals: string[]` + `custom_program_requests` tablosu eklendi.
- tsc / eslint / build temiz.

## 2026-09-24 (FAZ 3.2): Kalibrasyon kilitlendi + bilimsel algoritma

- **3D**: Leva kalibrasyon paneli kaldırıldı; model sabitlendi (`scale=0.13`, `position=[0, 0.85, 0]`). Otomatik `Box3`/`Center` mantığı tamamen silindi. Hitbox'lar tekrar görünmez (`visible={false}`).
- **Kalça bölgesi**: `MuscleGroup`'a `kalca` eklendi (label "Kalça"); hitbox `[0, 0.85, -0.15]`, etiket çapası `[0, 1.0, -0.15]`.
- **Bilimsel veri mimarisi**: `Exercise` tipine `goals: TrainingGoal[]` eklendi. Mock havuz hedefe göre ayrıştırıldı (Hacim/Kuvvet: Bench Press, Squat, Deadlift…; Esneklik: Pigeon Pose, Cat-Cow, Cobra…; Postür: Face Pull, Wall Angels, Bird-Dog, Prone Cobra…; Sıçrama: Box Jump, Depth Jump, Jump Squat…; Kalça: Hip Thrust, Glute Bridge vb.). 9 kas grubu × 2 ortam.
- **Akıllı filtreleme**: `buildProgram` kas + ortam + `goals.includes(goal)` üçlüsüyle filtreliyor; hedefe uygun hareketi olmayan bölge boş grup döner; UI grup bazında "Bu bölge için seçilen amaca uygun spesifik bir hareket bulunmuyor, farklı bir kombinasyon deneyin." mesajı gösterir.
- Not: Gerçek DB'ye geçişte `exercises` tablosuna `goals text[]` kolonu gerekecek.
- tsc temiz, eslint temiz, build başarılı.

## 2026-09-23 (FAZ 3.1): Hitbox mimarisi + gerçek 3D modeller

- `AnatomyMap3D.tsx` "Görünmez Zırh (Hitbox)" mimarisine geçti: yekpare `.glb` model (`public/models/male_anatomy.glb`, `female_anatomy.glb`) `useGLTF` ile yükleniyor, materyaline dokunulmuyor; tıklamalar `material.visible={false}` kutular (13 hitbox, 9 kas grubu) üzerinden yakalanıyor. Seçilen bölgeler model üzerinde `<Html>` neon yeşil "X Aktif" etiketleriyle işaretleniyor (`LABEL_ANCHORS`).
- `WorkoutGenerator.tsx`: Erkek/Kadın toggle'ı eklendi, `gender` prop'u 3D haritaya geçiliyor.
- Hata yönetimi: Suspense fallback ("3D Model Hazırlanıyor…") + `ModelErrorBoundary` (yükleme hatasında şık hata mesajı). `useGLTF.preload` ile iki model önden yükleniyor.
- Hitbox koordinatları ~1.9 birimlik silüete göre yazıldı; gerçek model ölçüsüne göre `HITBOXES`/`LABEL_ANCHORS` sabitlerinden ince ayar yapılabilir.
- tsc temiz, eslint (2 dosya) temiz, build başarılı.

## 2026-09-23: Antrenman Merkezi /training — FAZ 3 (3D + dinamik algoritma)

- **3D altyapı**: `three`, `@react-three/fiber`, `@react-three/drei` (+ dev `@types/three`) kuruldu. Yeni `components/training/AnatomyMap3D.tsx`: OrbitControls ile 360° döndürülebilir sahne; kas gruplarını stilize mesh'lerle temsil eden tıklanabilir yer tutucu harita (gerçek .glb gelene kadar). Çoklu bölge seçimi (Array). `next/dynamic` ile `ssr:false` yüklenir. Eski 2D `AnatomyMap.tsx` kaldırıldı.
- **Algoritma motoru**: `WorkoutGenerator.tsx` baştan yazıldı. Hedef seçimi (Hacim 3×12, Maks. Kuvvet 5×5, Esneklik 3×30sn, Postür 3×15, Dikey Sıçrama 4×6) + çoklu bölge; bölge başı hareket kuralı: 1 bölge→4, 2→3, 3+→2. Havuz: `lib/data/exercises.ts` içindeki MOCK_EXERCISES (8 kas grubu × Ev/Salon × 5 hareket); `buildProgram()` hedefe göre set/tekrar ezerek üretir. Supabase fetch kaldırıldı (şimdilik mock).
- **Kas grupları genişletildi**: `gogus/sirt/omuz/on_kol/arka_kol/on_bacak/arka_bacak/karin` (eski `kol`/`bacak` ayrıldı). Admin `exercise-manager` yeni union ile uyumlu.
- **"Kişisel Antrenman Programı İstiyorum" modalı**: `ProgramRequestDialog.tsx` — Ad Soyad, İletişim, Yaş/Boy/Kilo, Hedef select, Notlar; Esc/backdrop kapanış, scroll kilidi. Backend henüz YOK (yerel başarı durumu); ileride `api/forms` desenine bağlanacak.
- **Admin**: "Egzersiz Yönetimi" kartı + `/admin/exercises` (requireAdmin + client CRUD) önceki fazdan zaten mevcut; `exercises` tablosu + RLS Supabase'de kuruldu (kullanıcı onayladı).
- Doğrulama: `tsc --noEmit` temiz, `npm run lint` 0 hata (önceden var olan 6 uyarı), `npm run build` başarılı (`/training` statik prerender).

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
