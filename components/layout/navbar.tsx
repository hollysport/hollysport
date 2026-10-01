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

const navigation = [
    {
        label: "Hakkımızda",
        href: "/about",
    },
    {
        label: "Ekibimiz",
        href: "/team",
    },
    {
        label: "Branşlar",
        href: "/sports",
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
        label: "Bir Hayalim Var",
        href: "/bir-hayalim-var",
    },
    {
        label: "Galeri",
        href: "/gallery",
    },
    {
        label: "SSS",
        href: "/#faq",
    },
    {
        label: "İletişim",
        href: "/contact",
    },
];

/**
 * `overlay`: header'ın altındaki eş yükseklik boşluğunu basar —
 * ana sayfa gibi içeriğin (Hero) 0'dan başıp navbar'ın altına girdiği
 * sayfalarda kullanılır. Varsayılan (false) diğer sayfalarda içerik
 * navbar'ın altında kalmasın diye boşluğu korur.
 */
export default function Navbar({
    overlay = false,
}: {
    overlay?: boolean;
}) {
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
        {/*
          Yüzen kapsül düzeni: header her kırılma noktasında `fixed z-50`
          (içerik akışını itmez). Mobilde (md altı) koyu cam zemin +
          tam genişlik, masaüstünde header şeffaflaşır ve üstten/alttan
          yumuşak koyu degrade (scrim) eklenir — beyaz bölümler
          (Hakkımızda/Spor/Galeri) altından geçerken de logo ve kapsül
          okunur kalır.
        */}
        <header className="fixed inset-x-0 top-0 z-50 bg-[#050505]/95 text-white shadow-lg backdrop-blur-xl md:top-4 md:bg-transparent md:bg-gradient-to-b md:from-black/70 md:via-black/30 md:to-transparent md:backdrop-blur-none md:shadow-none">
            <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-6 lg:px-8">
                <Link
                    href="/"
                    onClick={() => setIsOpen(false)}
                    className="shrink-0 text-lg font-extrabold tracking-[0.12em] text-white md:drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)]"
                >
                    HOLLY SPORT
                </Link>

                {/*
                  Orta: tüm linkler tek bir cam kapsülde.
                  `flex-1` + `justify-center` kapsülü tam ortalar,
                  `min-w-0` + `overflow-x-auto` taşmayı engeller
                  (sığmazsa içeriden kayar). 9 link ~680px yer
                  istediği için 1280px (xl) altında hamburger menü
                  korunur.
                */}
                <div className="hidden min-w-0 flex-1 items-center justify-center xl:flex">
                    <div className="flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full bg-black/30 px-2 py-1.5 shadow-lg backdrop-blur-md [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                                            ? "bg-[#27D66B]/15 text-[#27D66B]"
                                            : isDreamLink
                                                ? "text-[#27D66B]/80 hover:bg-white/10 hover:text-[#27D66B]"
                                                : "text-white/70 hover:bg-white/10 hover:text-white"
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
                            className="hidden h-11 w-11 items-center justify-center rounded-full bg-white/5 text-white/70 shadow-lg backdrop-blur-md transition hover:bg-white/10 hover:text-[#27D66B] md:flex"
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
                            className="hidden min-h-11 items-center justify-center rounded-full bg-white/5 px-5 text-sm font-semibold text-white/80 shadow-lg backdrop-blur-md transition hover:bg-white/10 hover:text-[#27D66B] md:inline-flex"
                        >
                            Giriş Yap
                        </button>
                    )}

                    <a
                        href={whatsappGroupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden min-h-11 items-center justify-center rounded-full bg-white/5 px-5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-white/10 hover:text-[#27D66B] md:inline-flex"
                    >
                        Topluluğa Katıl
                    </a>

                    <Link
                        href="/destek-ol"
                        className="hidden min-h-11 items-center justify-center rounded-full bg-[#27D66B] px-5 text-sm font-bold text-[#050505] shadow-lg backdrop-blur-md transition hover:bg-[#45e27f] md:inline-flex"
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
                        className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full bg-white/5 shadow-lg backdrop-blur-md transition hover:bg-white/10 xl:hidden"
                    >
                        <span
                            className={`h-0.5 w-5 rounded-full bg-white transition ${isOpen
                                    ? "translate-y-2 rotate-45"
                                    : ""
                                }`}
                        />

                        <span
                            className={`h-0.5 w-5 rounded-full bg-white transition ${isOpen ? "opacity-0" : ""
                                }`}
                        />

                        <span
                            className={`h-0.5 w-5 rounded-full bg-white transition ${isOpen
                                    ? "-translate-y-2 -rotate-45"
                                    : ""
                                }`}
                        />
                    </button>
                </div>
            </nav>

            {isOpen && (
                <div className="bg-[#0a0a0a] px-4 pb-6 pt-4 xl:hidden">
                    <div className="mx-auto flex max-w-7xl flex-col rounded-3xl bg-[#111111] p-5 shadow-2xl">
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
                                        className={`rounded-2xl px-4 py-3 text-base font-semibold transition ${active
                                                ? "bg-[#27D66B]/10 text-[#27D66B]"
                                                : isDreamLink
                                                    ? "text-[#27D66B] hover:bg-[#27D66B]/10"
                                                    : "text-white/75 hover:bg-white/5 hover:text-white"
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="mt-5 grid gap-3 pt-5 sm:grid-cols-2">
                            {isLoggedIn ? (
                                <Link
                                    href="/profile"
                                    onClick={() => setIsOpen(false)}
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#27D66B]/10 px-6 text-sm font-semibold text-[#27D66B] transition hover:bg-[#27D66B]/20"
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
                                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-[#27D66B]"
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
                                className="inline-flex min-h-12 items-center justify-center rounded-full bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-[#27D66B]"
                            >
                                Topluluğa Katıl
                            </a>

                            <Link
                                href="/destek-ol"
                                onClick={() =>
                                    setIsOpen(false)
                                }
                                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#27D66B] px-6 text-sm font-bold text-[#050505]"
                            >
                                Destek Ol
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>

        {!overlay && (
            /*
              Header `fixed` olduğu için içerik yukarı kaymasın diye
              eş yükseklikte boşluk: mobil 80px (h-20), md+ 96px
              (top-4 + h-20 = yüzen kapsülün alt kenarı).
              `overlay` verilen sayfalarda (ana sayfa) bu blok yok:
              Hero zaten 0'dan başlar ve navbar'ın altına girer.
            */
            <div
                className="h-20 bg-[#050505] md:h-24"
                aria-hidden="true"
            />
        )}

        <AuthDialog
            open={authOpen}
            onClose={() => setAuthOpen(false)}
        />
        </>
    );
}