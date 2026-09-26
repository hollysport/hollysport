# Proje Durumu — Holly Sport

Son güncelleme: 2026-09-23

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
- **ProgramRequestDialog**: canlı INSERT → `custom_program_requests` (full_name, contact, age, height, weight, goal, notes); loading + editoryal başarı ekranı + hata mesajı. ⚠️ Veritabanı kolon adları `full_name/contact/age/height/weight/goal/notes` olarak VARSAYILDI — Supabase'deki gerçek kolonlar farklıysa eşleştirilir. Not: Bu form AGENTS.md'deki service-role route deseninin dışında (client insert); Turnstile/rate-limit ile sertleştirme önerilir.
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
