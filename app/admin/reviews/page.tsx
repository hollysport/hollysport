import Link from "next/link";

import ReviewsManager, {
    type AdminReview,
} from "@/components/admin/reviews-manager";
import { requireAdmin } from "@/lib/auth/require-admin";

type ReviewStatus = "pending" | "approved" | "rejected";

type CommunityReview = {
    id: string;
    full_name: string;
    rating: number;
    membership_duration: string;
    comment: string;
    photo_path: string | null;
    consent: boolean;
    status: ReviewStatus;
    created_at: string;
    approved_at: string | null;
};

export default async function AdminReviewsPage() {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase
        .from("community_reviews")
        .select(`
            id,
            full_name,
            rating,
            membership_duration,
            comment,
            photo_path,
            consent,
            status,
            created_at,
            approved_at
        `)
        .order("created_at", { ascending: false });

    const reviewRows = (data ?? []) as CommunityReview[];

    const reviews: AdminReview[] = await Promise.all(
        reviewRows.map(async (review) => {
            if (!review.photo_path) {
                return {
                    ...review,
                    photoUrl: null,
                };
            }

            const { data: signedPhoto } = await supabase.storage
                .from("review-photos")
                .createSignedUrl(review.photo_path, 60 * 60);

            return {
                ...review,
                photoUrl: signedPhoto?.signedUrl ?? null,
            };
        }),
    );

    const pendingCount = reviews.filter(
        (review) => review.status === "pending",
    ).length;

    const approvedReviews = reviews.filter(
        (review) => review.status === "approved",
    );

    const approvedCount = approvedReviews.length;

    const rejectedCount = reviews.filter(
        (review) => review.status === "rejected",
    ).length;

    const averageRating =
        approvedCount > 0
            ? (
                approvedReviews.reduce(
                    (total, review) =>
                        total + review.rating,
                    0,
                ) / approvedCount
            ).toFixed(1)
            : "—";

    return (
        <main className="min-h-screen bg-[#050505] px-5 py-8 text-white sm:px-8 lg:px-10">
            <div className="mx-auto max-w-7xl">
                <header className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-end">
                    <div>
                        <Link
                            href="/admin"
                            className="text-sm font-semibold uppercase tracking-wider text-white/40 transition hover:text-[#27D66B]"
                        >
                            ← Yönetim paneli
                        </Link>

                        <p className="mt-7 text-sm font-bold uppercase tracking-[0.24em] text-[#27D66B]">
                            Admin Paneli
                        </p>

                        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
                            Topluluk Görüşleri
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/45">
                            Gönderilen görüşleri ara, düzenle,
                            onayla, reddet veya kalıcı olarak sil.
                        </p>
                    </div>

                    <div className="rounded-full border border-white/10 px-5 py-3 text-sm text-white/45">
                        Toplam {reviews.length} görüş
                    </div>
                </header>

                <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <article className="rounded-2xl border border-white/10 bg-[#111111] p-5">
                        <p className="text-sm text-white/40">
                            Tüm görüşler
                        </p>

                        <strong className="mt-2 block text-3xl">
                            {reviews.length}
                        </strong>
                    </article>

                    <article className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
                        <p className="text-sm text-orange-300/70">
                            Onay bekleyen
                        </p>

                        <strong className="mt-2 block text-3xl text-orange-300">
                            {pendingCount}
                        </strong>
                    </article>

                    <article className="rounded-2xl border border-[#27D66B]/20 bg-[#27D66B]/5 p-5">
                        <p className="text-sm text-[#27D66B]/70">
                            Onaylanan
                        </p>

                        <strong className="mt-2 block text-3xl text-[#27D66B]">
                            {approvedCount}
                        </strong>
                    </article>

                    <article className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                        <p className="text-sm text-red-300/70">
                            Reddedilen
                        </p>

                        <strong className="mt-2 block text-3xl text-red-300">
                            {rejectedCount}
                        </strong>
                    </article>

                    <article className="rounded-2xl border border-[#FFD54A]/20 bg-[#FFD54A]/5 p-5">
                        <p className="text-sm text-[#FFD54A]/70">
                            Ortalama puan
                        </p>

                        <strong className="mt-2 block text-3xl text-[#FFD54A]">
                            {averageRating}
                        </strong>
                    </article>
                </section>

                {error && (
                    <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                        Görüşler yüklenemedi: {error.message}
                    </div>
                )}

                {!error && reviews.length === 0 ? (
                    <div className="mt-8 rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
                        <h2 className="text-2xl font-bold">
                            Henüz görüş gönderilmedi.
                        </h2>

                        <p className="mt-3 text-sm text-white/40">
                            Yeni görüşler burada onay bekleyen olarak
                            görünecek.
                        </p>
                    </div>
                ) : (
                    <ReviewsManager reviews={reviews} />
                )}
            </div>
        </main>
    );
}