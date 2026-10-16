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
        <main className="min-h-screen bg-white px-5 py-8 text-ink sm:px-8 lg:px-10">
            <div className="mx-auto max-w-7xl">
                <header className="flex flex-col justify-between gap-6 border-b border-line pb-8 sm:flex-row sm:items-end">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
                            Topluluk Görüşleri
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-soft">
                            Gönderilen görüşleri ara, düzenle,
                            onayla, reddet veya kalıcı olarak sil.
                        </p>
                    </div>

                    <div className="rounded-full border border-line px-5 py-3 text-sm text-ink-soft">
                        Toplam {reviews.length} görüş
                    </div>
                </header>

                <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <article className="rounded-2xl border border-line bg-shell p-5">
                        <p className="text-sm text-ink-soft">
                            Tüm görüşler
                        </p>

                        <strong className="mt-2 block text-3xl">
                            {reviews.length}
                        </strong>
                    </article>

                    <article className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
                        <p className="text-sm text-orange-700">
                            Onay bekleyen
                        </p>

                        <strong className="mt-2 block text-3xl text-orange-700">
                            {pendingCount}
                        </strong>
                    </article>

                    <article className="rounded-2xl border border-green-200 bg-green-50 p-5">
                        <p className="text-sm text-holly-ink/70">
                            Onaylanan
                        </p>

                        <strong className="mt-2 block text-3xl text-holly-ink">
                            {approvedCount}
                        </strong>
                    </article>

                    <article className="rounded-2xl border border-red-200 bg-red-50 p-5">
                        <p className="text-sm text-red-700">
                            Reddedilen
                        </p>

                        <strong className="mt-2 block text-3xl text-red-700">
                            {rejectedCount}
                        </strong>
                    </article>

                    <article className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
                        <p className="text-sm text-yellow-700">
                            Ortalama puan
                        </p>

                        <strong className="mt-2 block text-3xl text-yellow-700">
                            {averageRating}
                        </strong>
                    </article>
                </section>

                {error && (
                    <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                        Görüşler yüklenemedi: {error.message}
                    </div>
                )}

                {!error && reviews.length === 0 ? (
                    <div className="mt-8 rounded-3xl border border-dashed border-line px-6 py-16 text-center">
                        <h2 className="text-2xl font-bold">
                            Henüz görüş gönderilmedi.
                        </h2>

                        <p className="mt-3 text-sm text-ink-soft">
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