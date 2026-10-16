"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
    ExternalLink,
    LogOut,
    Menu,
    ShieldCheck,
    X,
} from "lucide-react";

import {
    adminNavGroups,
    isAdminNavItemActive,
    type AdminNavItem,
} from "@/lib/admin/navigation";

import { logout } from "@/app/admin/actions";

/*
 * Admin ortak kabuğu — kalıcı sol menü (masaüstü) + mobil menü (drawer).
 *
 * Yerleşim:
 *   Sol  : marka, yönetim paneli başlığı, gruplu dikey navigasyon, hesap +
 *          çıkış alanı. Masaüstünde sabit (fixed) ve kendi içinde kaydırılabilir.
 *   Sağ  : seçilen yönetimin içeriği (sayfadan gelen `children`).
 *
 * Kapsam: yalnızca görsel gezinme katmanıdır. Her yönetim rotasının kendi
 * sunucu tarafı yetkilendirmesi (`requireAdmin`) sayfada bağımsız olarak
 * çalışmaya devam eder; buradaki menü erişim kapısı değildir.
 *
 * `/admin/login` bu kabuğun dışındadır: giriş ekranı sidebar olmadan, mevcut
 * tasarımında render edilir.
 */

type AdminShellProfile = {
    displayName: string | null;
    email: string | null;
};

type AdminShellProps = {
    children: React.ReactNode;
    profile: AdminShellProfile | null;
};

const LOGIN_PATH = "/admin/login";

/* ------------------------------------------------------------------ */
/* Navigasyon listesi (masaüstü ve mobil aynı kaynaktan)               */
/* ------------------------------------------------------------------ */

function NavItemLink({
    item,
    pathname,
    onNavigate,
}: {
    item: AdminNavItem;
    pathname: string;
    onNavigate?: () => void;
}) {
    const active = isAdminNavItemActive(item, pathname);
    const Icon = item.icon;

    const baseClasses =
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-holly/60 focus-visible:ring-offset-0";

    const stateClasses = active
        ? "bg-holly/10 text-holly-ink"
        : "text-ink-soft hover:bg-ink/[0.04] hover:text-ink";

    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`${baseClasses} ${stateClasses}`}
        >
            {/* Aktif öğede sol kenarlık vurgusu — yeşil kontrollü kullanım. */}
            <span
                aria-hidden="true"
                className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-holly transition-opacity duration-150 ${
                    active ? "opacity-100" : "opacity-0"
                }`}
            />

            <Icon
                aria-hidden="true"
                className={`h-[18px] w-[18px] shrink-0 transition-colors duration-150 ${
                    active
                        ? "text-holly"
                        : "text-ink-soft group-hover:text-ink"
                }`}
            />

            <span className="min-w-0 flex-1 truncate">{item.label}</span>
        </Link>
    );
}

/* ------------------------------------------------------------------ */
/* Marka bloğu (sidebar ve drawer başlığı)                             */
/* ------------------------------------------------------------------ */

function BrandBlock({ compact = false }: { compact?: boolean }) {
    return (
        <Link
            href="/admin"
            className="group flex min-w-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-holly/60"
        >
            {/*
             * Gerçek Holly Sport logosu (beyaz HS monogramı + yörünge
             * çizgileri, koyu zemin). Kırık beyaz sidebar üzerinde koyu
             * yuvarlak karo olarak net görünür; oranlar korunur (object-cover
             * + kare kaynak → esneme yok).
             */}
            <Image
                src="/icons/icon-512.png"
                alt="Holly Sport logosu"
                width={40}
                height={40}
                priority={false}
                className="h-10 w-10 shrink-0 rounded-xl object-cover shadow-[0_1px_2px_rgba(16,24,16,0.14)]"
            />

            <span className="min-w-0">
                <span className="block truncate text-[15px] font-bold leading-tight text-ink">
                    Holly Sport
                </span>
                {!compact && (
                    <span className="block truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                        Yönetim Paneli
                    </span>
                )}
            </span>
        </Link>
    );
}

/* ------------------------------------------------------------------ */
/* Hesap + çıkış bloğu                                                 */
/* ------------------------------------------------------------------ */

function AccountFooter({
    profile,
    onNavigate,
}: {
    profile: AdminShellProfile | null;
    onNavigate?: () => void;
}) {
    return (
        <div className="space-y-1 border-t border-line px-3 py-3">
            <div className="flex items-center gap-2.5 px-1.5 pb-2">
                <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-holly/12 text-holly"
                >
                    <ShieldCheck className="h-[18px] w-[18px]" />
                </span>

                <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold leading-tight text-ink">
                        {profile?.displayName ?? "Yönetici"}
                    </span>
                    <span className="block truncate text-[11px] leading-tight text-ink-soft">
                        {profile?.email ?? "Admin hesabı"}
                    </span>
                </span>
            </div>

            <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors duration-150 hover:bg-ink/[0.04] hover:text-ink focus-visible:ring-2 focus-visible:ring-holly/60 outline-none"
            >
                <ExternalLink
                    aria-hidden="true"
                    className="h-[18px] w-[18px] shrink-0"
                />
                Siteyi aç
            </a>

            <form action={logout}>
                <button
                    type="submit"
                    onClick={onNavigate}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors duration-150 hover:bg-ink/[0.04] hover:text-ink focus-visible:ring-2 focus-visible:ring-holly/60 outline-none"
                >
                    <LogOut
                        aria-hidden="true"
                        className="h-[18px] w-[18px] shrink-0"
                    />
                    Çıkış yap
                </button>
            </form>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Kabuk                                                                */
/* ------------------------------------------------------------------ */

export default function AdminShell({
    children,
    profile,
}: AdminShellProps) {
    const pathname = usePathname();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const drawerTitleId = useId();

    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const drawerRef = useRef<HTMLDivElement>(null);

    const closeDrawer = useCallback(() => {
        setDrawerOpen(false);
    }, []);

    /*
     * Rota değişince mobil menü kapansın.
     *
     * Etki (effect) içinde setState çağırmak yerine React'ın önerdiği
     * "render sırasında ayarla" deseni kullanılıyor: pathname değiştiğinde
     * render sırasında state sıfırlanır, böylece gereksiz ara render olmaz.
     */
    const [prevPathname, setPrevPathname] = useState(pathname);

    if (prevPathname !== pathname) {
        setPrevPathname(pathname);
        setDrawerOpen(false);
    }

    /* Açılışta odak kapat butonuna; kapatınca menü butonuna döner. */
    useEffect(() => {
        if (!drawerOpen) {
            return;
        }

        closeButtonRef.current?.focus();

        /* Odak dönüşü için düğümü effect başında sabitle (ref zamanlama uyarısı). */
        const menuButton = menuButtonRef.current;

        return () => {
            menuButton?.focus();
        };
    }, [drawerOpen]);

    /* Escape ile kapat + mobil menü açıkken arka plan kaydırmasın. */
    useEffect(() => {
        if (!drawerOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setDrawerOpen(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [drawerOpen]);

    /* Odak tuzağı: açık menünün içinde kal. */
    useEffect(() => {
        if (!drawerOpen) {
            return;
        }

        const drawer = drawerRef.current;
        if (!drawer) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Tab") {
                return;
            }

            const focusable = drawer.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
            );

            if (focusable.length === 0) {
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [drawerOpen]);

    /* Giriş ekranı: sidebar ve mobil kabuk olmadan mevcut tasarımıyla kalır. */
    if (pathname === LOGIN_PATH) {
        return <>{children}</>;
    }

    const navigationList = (
        <nav
            aria-label="Yönetim bölümleri"
            className="flex-1 space-y-5 overflow-y-auto px-3 py-4"
        >
            {adminNavGroups.map((group) => (
                <div key={group.label}>
                    <h2 className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-soft/80">
                        {group.label}
                    </h2>

                    <ul className="space-y-0.5">
                        {group.items.map((item) => (
                            <li key={item.href}>
                                <NavItemLink
                                    item={item}
                                    pathname={pathname}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </nav>
    );

    return (
        <div className="min-h-screen bg-shell">
            {/* ---------------- Masaüstü: kalıcı sol menü ---------------- */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-[17rem] flex-col border-r border-line bg-surface lg:flex">
                <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-4">
                    <BrandBlock />
                </div>

                {navigationList}

                <AccountFooter profile={profile} />
            </aside>

            {/* ---------------- Sağ: çalışma alanı ---------------- */}
            <div className="lg:pl-[17rem]">
                {/* Mobil üst bar — menü butonu açıkça görünür. */}
                <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 lg:hidden">
                    <BrandBlock compact />

                    <button
                        ref={menuButtonRef}
                        type="button"
                        onClick={() => setDrawerOpen(true)}
                        aria-expanded={drawerOpen}
                        aria-haspopup="dialog"
                        className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-ink/[0.04] focus-visible:ring-2 focus-visible:ring-holly/60 outline-none"
                    >
                        <Menu aria-hidden="true" className="h-[18px] w-[18px]" />
                        Menü
                    </button>
                </header>

                <div className="min-h-[calc(100vh-3.75rem)] lg:min-h-screen">
                    {children}
                </div>
            </div>

            {/* ---------------- Mobil: drawer ---------------- */}
            {drawerOpen && (
                <div
                    className="fixed inset-0 z-50 lg:hidden"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={drawerTitleId}
                >
                    {/* Arka plan — tıklayınca kapanır. */}
                    <button
                        type="button"
                        aria-label="Menüyü kapat"
                        onClick={closeDrawer}
                        className="absolute inset-0 h-full w-full cursor-default bg-ink/30 backdrop-blur-[2px]"
                    />

                    <div
                        ref={drawerRef}
                        className="absolute inset-y-0 left-0 flex w-[17rem] max-w-[85vw] flex-col border-r border-line bg-surface shadow-[0_0_40px_rgba(16,24,16,0.18)]"
                    >
                        <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3.5">
                            <h2 id={drawerTitleId} className="sr-only">
                                Yönetim menüsü
                            </h2>

                            <BrandBlock />

                            <button
                                ref={closeButtonRef}
                                type="button"
                                onClick={closeDrawer}
                                aria-label="Menüyü kapat"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line text-ink-soft transition-colors duration-150 hover:bg-ink/[0.04] hover:text-ink focus-visible:ring-2 focus-visible:ring-holly/60 outline-none"
                            >
                                <X aria-hidden="true" className="h-[18px] w-[18px]" />
                            </button>
                        </div>

                        {navigationList}

                        <AccountFooter
                            profile={profile}
                            onNavigate={closeDrawer}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
