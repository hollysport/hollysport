import type { LucideIcon } from "lucide-react";
import {
    Bell,
    Building2,
    CalendarDays,
    ClipboardList,
    Dumbbell,
    HandHeart,
    LayoutDashboard,
    Lightbulb,
    ListChecks,
    MessageCircleQuestion,
    MessageSquareQuote,
    UserRoundCheck,
    UsersRound,
} from "lucide-react";

/*
 * Admin sidebar navigasyonu — tek kaynak.
 *
 * Yalnızca projede gerçekten var olan rotalar listelenir (sahte bağlantı yok).
 * Menüde olmayan bir sayfa bu listede de olmamalı; yeni admin rotası eklenince
 * buraya da eklenmelidir. Güvenlik bu listenin işi DEĞİLDİR: her yönetim
 * rotasının kendi `requireAdmin` kontrolü (`lib/auth/require-admin.ts`)
 * sunucu tarafında bağımsız olarak çalışır.
 */

export type AdminNavItem = {
    label: string;
    href: string;
    icon: LucideIcon;
    /**
     * true → alt rotalar da aktif sayılır (ör. /admin/events/new ve
     * /admin/events/[id]/edit, "Etkinlikler" öğesini aktif tutar).
     */
    matchPrefix?: boolean;
};

export type AdminNavGroup = {
    label: string;
    items: AdminNavItem[];
};

export const ADMIN_HOME_HREF = "/admin";

/** Bildirim Merkezi — ana sayfadaki (dashboard) mevcut bölüme çapa. */
export const ADMIN_NOTIFICATIONS_HREF = "/admin#bildirim-merkezi";

export const adminNavGroups: AdminNavGroup[] = [
    {
        label: "Genel",
        items: [
            {
                label: "Genel Bakış",
                href: ADMIN_HOME_HREF,
                icon: LayoutDashboard,
            },
            {
                label: "Bildirimler",
                href: ADMIN_NOTIFICATIONS_HREF,
                icon: Bell,
            },
        ],
    },
    {
        label: "İçerik",
        items: [
            {
                label: "Etkinlikler",
                href: "/admin/events",
                icon: CalendarDays,
                matchPrefix: true,
            },
            {
                label: "Gelen Sorular",
                href: "/admin/questions",
                icon: MessageCircleQuestion,
            },
            {
                label: "Hayal Başvuruları",
                href: "/admin/dreams",
                icon: Lightbulb,
            },
            {
                label: "Topluluk Görüşleri",
                href: "/admin/reviews",
                icon: MessageSquareQuote,
            },
        ],
    },
    {
        label: "İnsanlar",
        items: [
            {
                label: "Etkinlik Başvuruları",
                href: "/admin/registrations",
                icon: ClipboardList,
            },
            {
                label: "Üyeler",
                href: "/admin/users",
                icon: UsersRound,
            },
        ],
    },
    {
        label: "Antrenman",
        items: [
            {
                label: "Egzersizler",
                href: "/admin/exercises",
                icon: Dumbbell,
            },
            {
                label: "Özel Program Talepleri",
                href: "/admin/custom-training-requests",
                icon: ListChecks,
            },
        ],
    },
    {
        label: "Destek",
        items: [
            {
                label: "Destek Başvuruları",
                href: "/admin/support-requests",
                icon: HandHeart,
            },
            {
                label: "Destekçiler",
                href: "/admin/supporters",
                icon: UserRoundCheck,
            },
            {
                label: "Sponsorlar",
                href: "/admin/sponsors",
                icon: Building2,
            },
        ],
    },
];

/**
 * Öğenin verilen yolda aktif olup olmadığını söyler.
 *
 * - Çapalı (`#`) bağlantılar hiçbir zaman aktif sayılmaz: "Bildirimler"
 *   dashboard'a (Genel Bakış) götürür, iki öğenin birden aktif olmaması için
 *   Genel Bakış tek aktif öğedir.
 * - `matchPrefix` öğelerinde alt rotalar da aktiftir.
 */
export function isAdminNavItemActive(
    item: AdminNavItem,
    pathname: string,
): boolean {
    if (item.href.includes("#")) {
        return false;
    }

    if (item.matchPrefix) {
        return (
            pathname === item.href || pathname.startsWith(`${item.href}/`)
        );
    }

    return pathname === item.href;
}
