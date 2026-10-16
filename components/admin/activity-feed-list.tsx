"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { loadMoreActivity } from "@/app/admin/actions";
import {
    ACTIVITY_PAGE_SIZE,
    ActivityFeedRow,
    type ActivityItem,
} from "@/components/admin/activity-feed-view";

/*
 * Bildirim akışı listesi + "Daha fazla göster".
 *
 * İlk sayfa (5 kayıt) sunucudan gelir; sonraki sayfalar server action
 * üzerinden 5'erli alınır. Kayıtlar `key` üzerinden birleştirildiği için
 * aynı bildirim iki kez listelenmez.
 */
export default function ActivityFeedList({
    initialItems,
    initialHasMore,
}: {
    initialItems: ActivityItem[];
    initialHasMore: boolean;
}) {
    const [items, setItems] = useState<ActivityItem[]>(initialItems);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleLoadMore() {
        if (loading) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await loadMoreActivity(items.length);

            if (result.error) {
                setError(result.error);
                return;
            }

            setItems((previous) => {
                const seen = new Set(
                    previous.map((item) => item.key),
                );

                return [
                    ...previous,
                    ...result.items.filter(
                        (item) => !seen.has(item.key),
                    ),
                ];
            });

            setHasMore(result.hasMore);
        } catch {
            setError(
                "Yeni bildirimler yüklenemedi. Lütfen tekrar dene.",
            );
        } finally {
            setLoading(false);
        }
    }

    if (items.length === 0 && !error) {
        return (
            <div className="mt-6 rounded-2xl border border-dashed border-[#E5E8E3] px-6 py-12 text-center text-sm text-[#626862]">
                Henüz yeni bir aktivite yok.
            </div>
        );
    }

    return (
        <>
            <ol className="mt-6 space-y-3">
                {items.map((item) => (
                    <li key={item.key}>
                        <ActivityFeedRow item={item} />
                    </li>
                ))}
            </ol>

            {error && (
                <p
                    role="alert"
                    className="mt-4 text-sm text-red-700"
                >
                    {error}
                </p>
            )}

            {hasMore && (
                <div className="mt-6 flex justify-center">
                    <button
                        type="button"
                        onClick={handleLoadMore}
                        disabled={loading}
                        aria-busy={loading}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#E5E8E3] bg-white px-6 text-sm font-semibold text-[#171917] transition hover:border-[#c9cfc6] hover:bg-[#F7F8F6] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <Loader2
                                    aria-hidden="true"
                                    className="h-4 w-4 animate-spin"
                                />
                                Yükleniyor…
                            </>
                        ) : (
                            <>
                                <Plus
                                    aria-hidden="true"
                                    className="h-4 w-4"
                                />
                                Daha fazla göster
                            </>
                        )}
                    </button>
                </div>
            )}

            {!hasMore && items.length > ACTIVITY_PAGE_SIZE && (
                <p className="mt-6 text-center text-xs text-[#626862]">
                    Tüm son aktiviteler gösteriliyor.
                </p>
            )}
        </>
    );
}
