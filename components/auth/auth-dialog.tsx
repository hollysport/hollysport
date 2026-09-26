"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import AvatarSelector from "./avatar-selector";

type AuthView = "login" | "register" | "forgot_password";

type AuthDialogProps = {
    open: boolean;
    onClose: () => void;
};

/*
 * Üyelik modalı: Giriş / Kayıt / Şifre Sıfırlama görünümleri.
 * Manuel state + anlık alan doğrulaması (e-posta formatı,
 * şifre >= 8, tekrar eşleşmeleri). Supabase Auth kullanır.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INTERESTED_SPORTS = [
    "Vücut Geliştirme",
    "Fitness",
    "Pilates",
    "Yoga",
    "Yüzme",
    "Koşu",
    "Boks",
    "Voleybol",
    "Basketbol",
    "Yürüyüş",
];

const MEMBERSHIP_DURATIONS: {
    key: string;
    label: string;
    monthsBack: number;
}[] = [
    { key: "1-3", label: "1-3 Ay", monthsBack: 2 },
    { key: "3-6", label: "3-6 Ay", monthsBack: 4.5 },
    { key: "6-12", label: "6-12 Ay", monthsBack: 9 },
    { key: "12-24", label: "1-2 Yıl", monthsBack: 18 },
    { key: "24+", label: "2 Yıldan Fazla", monthsBack: 30 },
];

function computeJoinDate(monthsBack: number): string {
    const date = new Date();
    date.setMonth(
        date.getMonth() - Math.floor(monthsBack),
        date.getDate() -
            Math.round(
                (monthsBack % 1) * 30,
            ),
    );
    return date.toISOString();
}

const inputClass =
    "mt-2 w-full rounded-xl border border-white/15 bg-[#050505] px-4 py-3 text-sm font-medium text-white outline-none transition placeholder:text-white/25 focus:border-[#27D66B]";

const labelClass =
    "text-xs font-semibold uppercase tracking-wider text-white/40";

function FieldError({ children }: { children: string | null }) {
    if (!children) return null;

    return (
        <p role="alert" className="mt-2 text-xs leading-5 text-red-400">
            {children}
        </p>
    );
}

export default function AuthDialog({ open, onClose }: AuthDialogProps) {
    const supabase = useMemo(() => createClient(), []);

    const [view, setView] = useState<AuthView>("login");

    // Register alanları
    const [fullName, setFullName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerEmailConfirm, setRegisterEmailConfirm] =
        useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [registerPasswordConfirm, setRegisterPasswordConfirm] =
        useState("");
    const [birthDate, setBirthDate] = useState("");
    const [gender, setGender] = useState("");
    const [avatar, setAvatar] = useState<string | null>(null);
    const [interestedSports, setInterestedSports] = useState<
        string[]
    >([]);
    const [customSport, setCustomSport] = useState("");
    const [sportsError, setSportsError] = useState("");
    const [isVeteran, setIsVeteran] = useState(false);
    const [membershipDuration, setMembershipDuration] =
        useState("");

    const MAX_SPORTS = 3;

    function toggleSport(sport: string) {
        setSportsError("");

        setInterestedSports((current) => {
            if (current.includes(sport)) {
                return current.filter((item) => item !== sport);
            }

            if (current.length >= MAX_SPORTS) {
                setSportsError(
                    `En fazla ${MAX_SPORTS} spor seçebilirsin.`,
                );
                return current;
            }

            return [...current, sport];
        });
    }

    // Login alanları
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Forgot password
    const [resetEmail, setResetEmail] = useState("");

    const [fieldErrors, setFieldErrors] = useState<
        Record<string, string>
    >({});
    const [turnstileToken, setTurnstileToken] =
        useState<string | null>(null);
    const [turnstileResetKey, setTurnstileResetKey] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Esc ile kapat + arka plan kaydırmayı kilitle
    useEffect(() => {
        if (!open) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") onClose();
        }

        document.addEventListener("keydown", handleKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [open, onClose]);

    if (!open) return null;

    function switchView(next: AuthView) {
        setView(next);
        setFieldErrors({});
        setErrorMessage("");
        setSuccessMessage("");
        // Her yeni görünümde güvenlik testi baştan çalışsın
        setTurnstileToken(null);
        setTurnstileResetKey((current) => current + 1);
    }

    function validateRegister(): boolean {
        const errors: Record<string, string> = {};

        if (!fullName.trim()) {
            errors.fullName = "Ad soyad zorunludur.";
        }

        if (!EMAIL_PATTERN.test(registerEmail.trim())) {
            errors.email = "Geçerli bir e-posta adresi girin.";
        }

        if (registerEmailConfirm.trim() !== registerEmail.trim()) {
            errors.emailConfirm = "E-posta adresleri eşleşmiyor.";
        }

        if (registerPassword.length < 8) {
            errors.password = "Şifre en az 8 karakter olmalıdır.";
        }

        if (registerPasswordConfirm !== registerPassword) {
            errors.passwordConfirm = "Şifreler eşleşmiyor.";
        }

        if (!avatar) {
            errors.avatar = "Bir avatar simgesi seç.";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }

    async function handleRegister(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        if (!validateRegister()) return;

        setLoading(true);

        const sports = [
            ...interestedSports.filter((sport) => sport !== "Diğer"),
            ...(interestedSports.includes("Diğer") &&
            customSport.trim()
                ? [customSport.trim()]
                : []),
        ];

        const duration = MEMBERSHIP_DURATIONS.find(
            (item) => item.key === membershipDuration,
        );

        const joinDate =
            isVeteran && duration
                ? computeJoinDate(duration.monthsBack)
                : undefined;

        const { error } = await supabase.auth.signUp({
            email: registerEmail.trim(),
            password: registerPassword,
            options: {
                captchaToken: turnstileToken ?? undefined,
                data: {
                    full_name: fullName.trim(),
                    birth_date: birthDate || null,
                    gender: gender || null,
                    avatar,
                    interested_sports: sports,
                    join_date: joinDate,
                },
            },
        });

        setLoading(false);

        if (error) {
            setErrorMessage(
                error.message.includes("already registered")
                    ? "Bu e-posta adresiyle zaten bir hesap var."
                    : `Kayıt tamamlanamadı: ${error.message}`,
            );

            // Turnstile token tek kullanımlıktır; yeniden üret
            setTurnstileToken(null);
            setTurnstileResetKey((current) => current + 1);
            return;
        }

        setLoginEmail(registerEmail.trim());
        switchView("login");
        setSuccessMessage("Kayıt başarılı, giriş yapabilirsiniz.");
    }

    async function handleLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email: loginEmail.trim(),
            password: loginPassword,
        });

        setLoading(false);

        if (error) {
            setErrorMessage(
                "E-posta veya şifre hatalı. Lütfen tekrar deneyin.",
            );
            return;
        }

        /*
         * Çerezlerin istemciye kesin yazılması ve tüm istemci
         * oturum durumunun (Navbar dahil) senkronlanması için
         * tam sayfa geçişi (client-side router değil).
         */
        window.location.href = "/profile";
    }

    async function handleReset(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        if (!EMAIL_PATTERN.test(resetEmail.trim())) {
            setFieldErrors({
                resetEmail: "Geçerli bir e-posta adresi girin.",
            });
            return;
        }

        setFieldErrors({});
        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(
            resetEmail.trim(),
            {
                redirectTo: `${window.location.origin}/update-password`,
                captchaToken: turnstileToken ?? undefined,
            },
        );

        setLoading(false);

        if (error) {
            setErrorMessage(
                `Bağlantı gönderilemedi: ${error.message}`,
            );

            // Turnstile token tek kullanımlıktır; yeniden üret
            setTurnstileToken(null);
            setTurnstileResetKey((current) => current + 1);
            return;
        }

        setSuccessMessage(
            "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
        );

        // Token tek kullanımlıktır; yeni gönderim için widget sıfırlanır
        setTurnstileToken(null);
        setTurnstileResetKey((current) => current + 1);
    }

    const titles: Record<AuthView, { title: string; hint: string }> =
        {
            login: {
                title: "Giriş Yap",
                hint: "Holly Sport üyelik hesabına eriş.",
            },
            register: {
                title: "Kayıt Ol",
                hint: "Topluluğa katılmak için hesap oluştur.",
            },
            forgot_password: {
                title: "Şifremi Unuttum",
                hint: "Sıfırlama bağlantısını e-postana gönderelim.",
            },
        };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={titles[view].title}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-[#0a0a0a] p-7 sm:p-9"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#27D66B]">
                            Üyelik
                        </span>
                        <h2 className="mt-2 text-2xl font-bold text-white">
                            {titles[view].title}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-white/45">
                            {titles[view].hint}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Kapat"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/50 transition hover:border-white/40 hover:text-white"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {successMessage && (
                    <p className="mt-6 flex items-start gap-2.5 rounded-xl border border-[#27D66B]/30 bg-[#27D66B]/10 px-4 py-3 text-sm leading-6 text-[#27D66B]">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                        {successMessage}
                    </p>
                )}

                {view === "login" && (
                    <form onSubmit={handleLogin} className="mt-8 space-y-5">
                        <label className="block">
                            <span className={labelClass}>E-posta</span>
                            <input
                                type="email"
                                required
                                autoComplete="email"
                                value={loginEmail}
                                onChange={(event) =>
                                    setLoginEmail(event.target.value)
                                }
                                placeholder="ornek@mail.com"
                                className={inputClass}
                            />
                        </label>

                        <label className="block">
                            <span className={labelClass}>Şifre</span>
                            <input
                                type="password"
                                required
                                autoComplete="current-password"
                                value={loginPassword}
                                onChange={(event) =>
                                    setLoginPassword(
                                        event.target.value,
                                    )
                                }
                                placeholder="••••••••"
                                className={inputClass}
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#27D66B] text-sm font-bold text-[#050505] transition hover:bg-[#45e27f] disabled:opacity-50"
                        >
                            {loading && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            Giriş yap
                        </button>

                        {errorMessage && (
                            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                {errorMessage}
                            </p>
                        )}

                        <div className="space-y-2 pt-1 text-center text-sm text-white/45">
                            <p>
                                <button
                                    type="button"
                                    onClick={() =>
                                        switchView("forgot_password")
                                    }
                                    className="font-semibold text-[#27D66B] underline-offset-4 transition hover:underline"
                                >
                                    Şifremi unuttum
                                </button>
                            </p>
                            <p>
                                Hesabın yok mu?{" "}
                                <button
                                    type="button"
                                    onClick={() =>
                                        switchView("register")
                                    }
                                    className="font-semibold text-[#27D66B] underline-offset-4 transition hover:underline"
                                >
                                    Kayıt ol
                                </button>
                            </p>
                        </div>
                    </form>
                )}

                {view === "register" && (
                    <form
                        onSubmit={handleRegister}
                        noValidate
                        className="mt-8 space-y-5"
                    >
                        <label className="block">
                            <span className={labelClass}>Ad Soyad</span>
                            <input
                                type="text"
                                required
                                maxLength={100}
                                autoComplete="name"
                                value={fullName}
                                onChange={(event) =>
                                    setFullName(event.target.value)
                                }
                                placeholder="Adın Soyadın"
                                className={inputClass}
                            />
                            <FieldError>
                                {fieldErrors.fullName ?? null}
                            </FieldError>
                        </label>

                        <label className="block">
                            <span className={labelClass}>E-posta</span>
                            <input
                                type="email"
                                required
                                autoComplete="email"
                                value={registerEmail}
                                onChange={(event) =>
                                    setRegisterEmail(
                                        event.target.value,
                                    )
                                }
                                placeholder="ornek@mail.com"
                                className={inputClass}
                            />
                            <FieldError>
                                {fieldErrors.email ?? null}
                            </FieldError>
                        </label>

                        <label className="block">
                            <span className={labelClass}>
                                E-posta (Tekrar)
                            </span>
                            <input
                                type="email"
                                required
                                autoComplete="email"
                                value={registerEmailConfirm}
                                onChange={(event) =>
                                    setRegisterEmailConfirm(
                                        event.target.value,
                                    )
                                }
                                placeholder="ornek@mail.com"
                                className={inputClass}
                            />
                            <FieldError>
                                {fieldErrors.emailConfirm ?? null}
                            </FieldError>
                        </label>

                        <label className="block">
                            <span className={labelClass}>Şifre</span>
                            <input
                                type="password"
                                required
                                autoComplete="new-password"
                                value={registerPassword}
                                onChange={(event) =>
                                    setRegisterPassword(
                                        event.target.value,
                                    )
                                }
                                placeholder="En az 8 karakter"
                                className={inputClass}
                            />
                            <FieldError>
                                {fieldErrors.password ?? null}
                            </FieldError>
                        </label>

                        <label className="block">
                            <span className={labelClass}>
                                Şifre (Tekrar)
                            </span>
                            <input
                                type="password"
                                required
                                autoComplete="new-password"
                                value={registerPasswordConfirm}
                                onChange={(event) =>
                                    setRegisterPasswordConfirm(
                                        event.target.value,
                                    )
                                }
                                placeholder="Şifreni tekrar gir"
                                className={inputClass}
                            />
                            <FieldError>
                                {fieldErrors.passwordConfirm ?? null}
                            </FieldError>
                        </label>

                        <TurnstileWidget
                            action="register"
                            onTokenChange={setTurnstileToken}
                            resetKey={turnstileResetKey}
                        />

                        <div className="grid gap-5 sm:grid-cols-2">
                            <label className="block">
                                <span className={labelClass}>
                                    Doğum Tarihi
                                </span>
                                <input
                                    type="date"
                                    max={
                                        new Date()
                                            .toISOString()
                                            .split("T")[0]
                                    }
                                    value={birthDate}
                                    onChange={(event) =>
                                        setBirthDate(
                                            event.target.value,
                                        )
                                    }
                                    className={inputClass}
                                />
                            </label>

                            <label className="block">
                                <span className={labelClass}>
                                    Cinsiyet (opsiyonel)
                                </span>
                                <select
                                    value={gender}
                                    onChange={(event) =>
                                        setGender(event.target.value)
                                    }
                                    className={`${inputClass} bg-[#050505]`}
                                >
                                    <option value="">Seçilmedi</option>
                                    <option value="kadin">
                                        Kadın
                                    </option>
                                    <option value="erkek">
                                        Erkek
                                    </option>
                                    <option value="belirtmek-istemiyorum">
                                        Belirtmek istemiyorum
                                    </option>
                                </select>
                            </label>
                        </div>

                        <div>
                            <span className={labelClass}>
                                İlgilendiğin Sporlar (en fazla 3)
                            </span>

                            <div className="mt-2 grid grid-cols-2 gap-2">
                                {[
                                    ...INTERESTED_SPORTS,
                                    "Diğer",
                                ].map((sport) => {
                                    const isPicked =
                                        interestedSports.includes(
                                            sport,
                                        );

                                    return (
                                        <button
                                            key={sport}
                                            type="button"
                                            onClick={() =>
                                                toggleSport(sport)
                                            }
                                            aria-pressed={isPicked}
                                            className={`rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition ${
                                                isPicked
                                                    ? "border-[#27D66B] bg-[#27D66B]/10 text-[#27D66B]"
                                                    : "border-white/10 text-white/50 hover:border-white/25 hover:text-white"
                                            }`}
                                        >
                                            {sport}
                                        </button>
                                    );
                                })}
                            </div>

                            {interestedSports.includes("Diğer") && (
                                <input
                                    type="text"
                                    maxLength={50}
                                    value={customSport}
                                    onChange={(event) =>
                                        setCustomSport(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Diğer sporu yaz (örn. CrossFit)"
                                    className={inputClass}
                                />
                            )}

                            {sportsError && (
                                <p
                                    role="alert"
                                    className="mt-2 text-xs leading-5 text-red-400"
                                >
                                    {sportsError}
                                </p>
                            )}
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-[#050505] p-4">
                            <label className="flex cursor-pointer items-center justify-between gap-4">
                                <span className="text-sm font-semibold text-white/70">
                                    Eski bir üyemiz misiniz?
                                </span>

                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={isVeteran}
                                    onClick={() => {
                                        setIsVeteran(
                                            (current) => !current,
                                        );
                                        setMembershipDuration("");
                                    }}
                                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                                        isVeteran
                                            ? "bg-[#27D66B]"
                                            : "bg-white/15"
                                    }`}
                                >
                                    <span
                                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                                            isVeteran
                                                ? "left-[1.4rem]"
                                                : "left-0.5"
                                        }`}
                                    />
                                </button>
                            </label>

                            {isVeteran && (
                                <label className="mt-3 block">
                                    <span className={labelClass}>
                                        Ne kadar süredir üyesin?
                                    </span>
                                    <select
                                        required
                                        value={membershipDuration}
                                        onChange={(event) =>
                                            setMembershipDuration(
                                                event.target.value,
                                            )
                                        }
                                        className={`${inputClass} bg-[#050505]`}
                                    >
                                        <option value="">
                                            Süre seç
                                        </option>
                                        {MEMBERSHIP_DURATIONS.map(
                                            (item) => (
                                                <option
                                                    key={item.key}
                                                    value={item.key}
                                                >
                                                    {item.label}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </label>
                            )}
                        </div>

                        <div>
                            <span className={labelClass}>Avatar *</span>
                            <AvatarSelector
                                value={avatar}
                                onChange={(key) => {
                                    setAvatar(key);
                                    setFieldErrors((current) => {
                                        if (!current.avatar)
                                            return current;
                                        const next = { ...current };
                                        delete next.avatar;
                                        return next;
                                    });
                                }}
                            />
                            <FieldError>
                                {fieldErrors.avatar ?? null}
                            </FieldError>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !turnstileToken}
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#27D66B] text-sm font-bold text-[#050505] transition hover:bg-[#45e27f] disabled:opacity-50"
                        >
                            {loading && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            Hesap oluştur
                        </button>

                        {errorMessage && (
                            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                {errorMessage}
                            </p>
                        )}

                        <p className="pt-1 text-center text-sm text-white/45">
                            Zaten hesabın var mı?{" "}
                            <button
                                type="button"
                                onClick={() => switchView("login")}
                                className="font-semibold text-[#27D66B] underline-offset-4 transition hover:underline"
                            >
                                Giriş yap
                            </button>
                        </p>
                    </form>
                )}

                {view === "forgot_password" && (
                    <form onSubmit={handleReset} className="mt-8 space-y-5">
                        <label className="block">
                            <span className={labelClass}>E-posta</span>
                            <input
                                type="email"
                                required
                                autoComplete="email"
                                value={resetEmail}
                                onChange={(event) =>
                                    setResetEmail(event.target.value)
                                }
                                placeholder="ornek@mail.com"
                                className={inputClass}
                            />
                            <FieldError>
                                {fieldErrors.resetEmail ?? null}
                            </FieldError>
                        </label>

                        <TurnstileWidget
                            action="reset_password"
                            onTokenChange={setTurnstileToken}
                            resetKey={turnstileResetKey}
                        />

                        <button
                            type="submit"
                            disabled={loading || !turnstileToken}
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#27D66B] text-sm font-bold text-[#050505] transition hover:bg-[#45e27f] disabled:opacity-50"
                        >
                            {loading && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            Sıfırlama bağlantısı gönder
                        </button>

                        {errorMessage && (
                            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                {errorMessage}
                            </p>
                        )}

                        <p className="pt-1 text-center text-sm text-white/45">
                            Şifreni hatırladın mı?{" "}
                            <button
                                type="button"
                                onClick={() => switchView("login")}
                                className="font-semibold text-[#27D66B] underline-offset-4 transition hover:underline"
                            >
                                Giriş yap
                            </button>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
