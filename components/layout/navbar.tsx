"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    useEffect,
    useMemo,
    useState,
    type MouseEvent,
} from "react";
import { UserRound } from "lucide-react";

import AuthDialog from "@/components/auth/auth-dialog";
import { AvatarIcon } from "@/components/auth/avatar-selector";
import {
    resolveAvatarKey,
    resolveDisplayName,
} from "@/lib/auth/display";
import { createClient } from "@/lib/supabase/client";

const whatsappGroupUrl =
    "https://chat.whatsapp.com/LEHiMPxVmsC7lGB0zvjoJK";

/*
 * Ana navigasyon sırası. Branşlar (/sports) bağlantısı bu menüden
 * çıkarıldı; sayfa varlığını korur (sitemap + doğrudan erişim).
 * "Bir Hayalim Var" menünün sonunda ayrı bir vurgu bağlantısı olarak
 * durur (menü sırasını bozmamak için sona alındı).
 */
const navigation = [
    {
        label: "Hakkımızda",
        href: "/about",
    },
    {
        label: "Etkinlikler",
        href: "/events",
    },
    {
        label: "Antrenman",
        href: "/training",
    },
    {
        label: "Galeri",
        href: "/gallery",
    },
    {
        label: "Ekibimiz",
        href: "/team",
    },
    {
        label: "SSS",
        href: "/faq",
    },
    {
        label: "İletişim",
        href: "/contact",
    },
    {
        label: "Bir Hayalim Var",
        href: "/bir-hayalim-var",
    },
];

/**
 * Navbar beyaz, sabit (fixed) bir üst bar olarak durur: içerik akışını
 * itmediği için altına eş yükseklikte boşluk basılır.
 */
export default function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    /* Navbar'da görünen ad/.avatar — profiles satırı + user_metadata */
    const [displayName, setDisplayName] = useState<string | null>(
        null,
    );
    const [avatarKey, setAvatarKey] = useState<string | null>(null);

    const supabase = useMemo(() => createClient(), []);

    /*
     * Kimlik bilgileri iki kaynaktan birleştirilir:
     * 1) auth.user_metadata (kayıt anında yazılır)
     * 2) profiles satırı (profil sayfasından güncellenmiş olabilir)
     * Eksik olan her alan diğer kaynaktan tamamlanır.
     */
    async function applyIdentity(user: {
        id?: string;
        email?: string | null;
        user_metadata?: Record<string, unknown> | null;
    } | null) {
        if (!user) {
            setDisplayName(null);
            setAvatarKey(null);
            return;
        }

        const metadata = user.user_metadata ?? null;

        setDisplayName(
            resolveDisplayName({
                email: user.email,
                metadata,
            }),
        );
        setAvatarKey(
            resolveAvatarKey({ metadata }),
        );

        if (!user.id) return;

        try {
            const { data } = await supabase
                .from("profiles")
                .select("full_name, email, avatar_url")
                .eq("id", user.id)
                .maybeSingle();

            if (!data) return;

            setDisplayName(
                resolveDisplayName({
                    fullName: data.full_name,
                    email: data.email ?? user.email,
                    metadata,
                }),
            );
            setAvatarKey(
                resolveAvatarKey({
                    avatarUrl: data.avatar_url,
                    metadata,
                }) ?? resolveAvatarKey({ metadata }),
            );
        } catch (error) {
            console.error(
                "Navbar profil bilgisi alınamadı:",
                error,
            );
        }
    }

    // Oturum durumunu başlangıçta al ve değişiklikleri canlı dinle
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            const user = data.session?.user ?? null;
            setIsLoggedIn(Boolean(user));
            applyIdentity(user);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            const user = session?.user ?? null;
            setIsLoggedIn(Boolean(user));
            applyIdentity(user);
        });

        return () => subscription.unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supabase]);

    function isActive(href: string) {
        if (href.includes("#")) {
            return false;
        }

        return pathname === href;
    }

    /*
     * Hash linkleri (örn. "/#faq"): kullanıcı zaten ana sayfadaysa
     * Next.js'in sayfayı başa kaydırmasını engeller ve hedefe
     * pürüzsüz kaydırma yapar. Mobil menü açıksa kapatılır.
     */
    function handleNavClick(
        event: MouseEvent<HTMLAnchorElement>,
        href: string,
    ) {
        const hashIndex = href.indexOf("#");

        if (hashIndex === -1) {
            setIsOpen(false);
            return;
        }

        const targetPath = href.slice(0, hashIndex) || "/";
        const targetId = href.slice(hashIndex + 1);

        if (pathname === targetPath) {
            event.preventDefault();
            document
                .getElementById(targetId)
                ?.scrollIntoView({ behavior: "smooth" });
        }

        setIsOpen(false);
    }

    return (
        <>
        <header className="fixed inset-x-0 top-0 z-50 border-b border-[#E5E8E3] bg-white/90 text-[#171917] backdrop-blur-xl">
            <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-5 sm:px-6 lg:px-8">
                <Link
                    href="/"
                    onClick={() => setIsOpen(false)}
                    className="shrink-0 text-lg font-extrabold tracking-[0.12em]"
                >
                    HOLLY&nbsp;SPORT
                </Link>

                {/*
                  Orta: tüm linkler tek bir kapsülde. `flex-1` +
                  `justify-center` kapsülü ortalar; `min-w-0` +
                  `overflow-x-auto` taşmayı engeller (sığmazsa
                  içeriden kayar).
                */}
                <div className="hidden min-w-0 flex-1 items-center justify-center xl:flex">
                    <div className="flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full bg-[#F7F8F6] px-2 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {navigation.map((item) => {
                            const active = isActive(item.href);
                            const isDreamLink =
                                item.href === "/bir-hayalim-var";

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={(event) =>
                                        handleNavClick(
                                            event,
                                            item.href,
                                        )
                                    }
                                    className={`whitespace-nowrap rounded-full px-2.5 py-2 text-xs font-medium transition-colors 2xl:text-[13px] ${
                                        active
                                            ? "bg-white text-[#0E7C3D] shadow-[0_1px_2px_rgba(23,25,23,0.06)]"
                                            : isDreamLink
                                                ? "text-[#0E7C3D] hover:bg-white hover:text-[#0b6531]"
                                                : "text-[#626862] hover:bg-white hover:text-[#171917]"
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                    {isLoggedIn ? (
                        <Link
                            href="/profile"
                            aria-label={
                                displayName
                                    ? `${displayName} — Profilim`
                                    : "Profilim"
                            }
                            title={
                                displayName ?? "Profilim"
                            }
                            className="hidden h-11 w-11 items-center justify-center rounded-full border border-[#E5E8E3] bg-white text-[#626862] transition hover:border-[#c9cfc6] hover:bg-[#F7F8F6] hover:text-[#0E7C3D] md:flex"
                        >
                            {avatarKey ? (
                                <AvatarIcon
                                    avatar={avatarKey}
                                    className="h-5 w-5"
                                />
                            ) : (
                                <UserRound className="h-5 w-5" />
                            )}
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setAuthOpen(true)}
                            className="hidden min-h-11 items-center justify-center rounded-full border border-[#E5E8E3] bg-white px-5 text-sm font-semibold text-[#171917] transition hover:border-[#c9cfc6] hover:bg-[#F7F8F6] md:inline-flex"
                        >
                            Giriş Yap
                        </button>
                    )}

                    <a
                        href={whatsappGroupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden min-h-11 items-center justify-center rounded-full border border-[#E5E8E3] bg-white px-5 text-sm font-semibold text-[#171917] transition hover:border-[#c9cfc6] hover:bg-[#F7F8F6] md:inline-flex"
                    >
                        Topluluğa Katıl
                    </a>

                    <Link
                        href="/destek-ol"
                        className="hidden min-h-11 items-center justify-center rounded-full bg-[#27D66B] px-5 text-sm font-bold text-[#171917] transition hover:bg-[#1fc461] md:inline-flex"
                    >
                        Destek Ol
                    </Link>

                    <button
                        type="button"
                        aria-label={
                            isOpen ? "Menüyü kapat" : "Menüyü aç"
                        }
                        aria-expanded={isOpen}
                        onClick={() =>
                            setIsOpen((current) => !current)
                        }
                        className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-[#E5E8E3] bg-white transition hover:bg-[#F7F8F6] xl:hidden"
                    >
                        <span
                            className={`h-0.5 w-5 shrink-0 rounded-full bg-ink transition ${isOpen
                                    ? "translate-y-2 rotate-45"
                                    : ""
                                }`}
                        />

                        <span
                            className={`h-0.5 w-5 shrink-0 rounded-full bg-ink transition ${isOpen ? "opacity-0" : ""
                                }`}
                        />

                        <span
                            className={`h-0.5 w-5 shrink-0 rounded-full bg-ink transition ${isOpen
                                    ? "-translate-y-2 -rotate-45"
                                    : ""
                                }`}
                        />
                    </button>
                </div>
            </nav>

            {isOpen && (
                <div className="border-t border-[#E5E8E3] bg-white px-4 pb-6 pt-4 xl:hidden">
                    <div className="mx-auto flex max-w-7xl flex-col rounded-2xl border border-[#E5E8E3] bg-white p-3">
                        <div className="flex flex-col">
                            {navigation.map((item) => {
                                const active = isActive(
                                    item.href,
                                );

                                const isDreamLink =
                                    item.href ===
                                    "/bir-hayalim-var";

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={(event) =>
                                            handleNavClick(
                                                event,
                                                item.href,
                                            )
                                        }
                                        className={`rounded-xl px-4 py-3 text-base font-semibold transition ${active
                                                ? "bg-[#F7F8F6] text-[#0E7C3D]"
                                                : isDreamLink
                                                    ? "text-[#0E7C3D] hover:bg-[#F7F8F6]"
                                                    : "text-[#171917] hover:bg-[#F7F8F6]"
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="mt-5 grid gap-3 border-t border-[#E5E8E3] pt-5 sm:grid-cols-2">
                            {isLoggedIn ? (
                                <Link
                                    href="/profile"
                                    onClick={() => setIsOpen(false)}
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#E5E8E3] bg-white px-6 text-sm font-semibold text-[#171917] transition hover:bg-[#F7F8F6]"
                                >
                                    {avatarKey && (
                                        <AvatarIcon
                                            avatar={avatarKey}
                                            className="h-4 w-4"
                                        />
                                    )}
                                    {displayName
                                        ? `${displayName}`
                                        : "Profilim"}
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsOpen(false);
                                        setAuthOpen(true);
                                    }}
                                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#E5E8E3] bg-white px-6 text-sm font-semibold text-[#171917] transition hover:bg-[#F7F8F6]"
                                >
                                    Giriş Yap
                                </button>
                            )}

                            <a
                                href={whatsappGroupUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() =>
                                    setIsOpen(false)
                                }
                                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#E5E8E3] bg-white px-6 text-sm font-semibold text-[#171917] transition hover:bg-[#F7F8F6]"
                            >
                                Topluluğa Katıl
                            </a>

                            <Link
                                href="/destek-ol"
                                onClick={() =>
                                    setIsOpen(false)
                                }
                                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#27D66B] px-6 text-sm font-bold text-[#171917]"
                            >
                                Destek Ol
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>

        {/*
          Header `fixed` olduğu için içerik yukarı kaymasın diye eş
          yükseklikte boşluk (mobil 80px).
        */}
        <div
            className="h-20 bg-white"
            aria-hidden="true"
        />

        <AuthDialog
            open={authOpen}
            onClose={() => setAuthOpen(false)}
        />
        </>
    );
}
