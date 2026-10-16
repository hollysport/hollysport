"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
    ACTIVITY_PAGE_SIZE,
    fetchActivityFeed,
} from "@/lib/admin/activity-feed";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

import type { ActivityItem } from "@/components/admin/activity-feed-view";

export async function logout() {
    const supabase = await createClient();

    await supabase.auth.signOut();

    revalidatePath("/", "layout");
    redirect("/admin/login");
}

export type LoadMoreActivityResult = {
    items: ActivityItem[];
    hasMore: boolean;
    error?: string;
};

/*
 * Bildirim listesindeki "Daha fazla göster".
 *
 * Aynı yetkilendirme katmanından geçer (`requireAdmin`) ve akışı aynı
 * sunucu tarafı fonksiyondan (fetchActivityFeed) üretir; bu sayede
 * ilk yükleme ile sonraki sayfalar arasında mükerrer kayıt veya sıralama
 * kayması oluşmaz.
 */
export async function loadMoreActivity(
    offset: number,
): Promise<LoadMoreActivityResult> {
    await requireAdmin();

    if (!Number.isInteger(offset) || offset < 0 || offset > 500) {
        return {
            items: [],
            hasMore: false,
            error: "Geçersiz sayfalama isteği.",
        };
    }

    const { items, hasMore, loadError } = await fetchActivityFeed({
        offset,
        limit: ACTIVITY_PAGE_SIZE,
    });

    if (loadError) {
        return {
            items: [],
            hasMore: false,
            error: "Bildirimler yüklenemedi. Lütfen tekrar dene.",
        };
    }

    return { items, hasMore };
}
