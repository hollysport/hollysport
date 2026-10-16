"use client";

import { useState } from "react";
import {
    ChevronDown,
    MessageSquareQuote,
    Star,
    X,
} from "lucide-react";

import ReviewForm from "./ReviewForm";
import type { Review } from "./TestimonialsSection";

type TestimonialsClientProps = {
    reviews: Review[];
    averageRating: number;
    hasError: boolean;
};

function getInitials(fullName: string) {
    return fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toLocaleUpperCase("tr-TR"))
        .join("");
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Europe/Istanbul",
    }).format(new Date(date));
}

function RatingStars({
    rating,
    size = "small",
}: {
    rating: number;
    size?: "small" | "large";
}) {
    return (
        <div
            className="flex items-center gap-1"
            aria-label={`${rating} yıldız`}
        >
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${size === "large"
                            ? "h-6 w-6 sm:h-7 sm:w-7"
                            : "h-4 w-4"
                        } ${star <= Math.round(rating)
                            ? "fill-holly-ink text-holly-ink"
                            : "fill-transparent text-line"
                        }`}
                />
            ))}
        </div>
    );
}

export default function TestimonialsClient({
    reviews,
    averageRating,
    hasError,
}: TestimonialsClientProps) {
    const [visibleReviewCount, setVisibleReviewCount] = useState(3);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const visibleReviews = reviews.slice(0, visibleReviewCount);
    const hasMoreReviews = visibleReviewCount < reviews.length;

    function showMoreReviews() {
        setVisibleReviewCount((currentCount) =>
            Math.min(currentCount + 3, reviews.length),
        );
    }

    return (
        <>
            <section className="bg-shell px-6 py-16 text-ink sm:py-20 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.24em] text-holly-ink">
                                Topluluğun Sesi
                            </p>

                            <h2 className="mt-4 max-w-4xl text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                                Gerçek deneyimler,
                                <br />
                                gerçek dostluklar.
                            </h2>

                            <p className="mt-5 max-w-2xl text-base leading-7 text-ink-soft sm:text-lg">
                                Holly Sport üyelerinin topluluk, etkinlikler ve
                                birlikte yaşadıkları deneyimler hakkındaki
                                görüşleri.
                            </p>
                        </div>

                        <div className="w-full rounded-[2rem] border border-line bg-white p-7 text-ink sm:w-auto sm:min-w-80">
                            <div className="flex items-end gap-3">
                                <strong className="text-5xl font-extrabold tracking-[-0.05em]">
                                    {reviews.length > 0
                                        ? averageRating.toFixed(1)
                                        : "—"}
                                </strong>

                                <span className="pb-1 text-sm text-ink-soft">
                                    / 5
                                </span>
                            </div>

                            <div className="mt-4">
                                <RatingStars
                                    rating={averageRating}
                                    size="large"
                                />
                            </div>

                            <p className="mt-4 text-sm text-ink-soft">
                                {reviews.length > 0
                                    ? `${reviews.length} onaylı görüşün ortalaması`
                                    : "Henüz onaylanmış görüş bulunmuyor"}
                            </p>
                        </div>
                    </div>

                    {hasError && (
                        <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                            Görüşler yüklenirken bir hata oluştu.
                        </div>
                    )}

                    {!hasError && reviews.length === 0 && (
                        <div className="mt-10 rounded-[2rem] border border-dashed border-line bg-white px-6 py-12 text-center">
                            <MessageSquareQuote className="mx-auto h-9 w-9 text-ink-soft" />

                            <h3 className="mt-5 text-2xl font-extrabold">
                                İlk görüşü sen paylaş.
                            </h3>

                            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-ink-soft">
                                Holly Sport deneyimini anlat. Görüşün yönetim
                                onayından sonra burada yayınlansın.
                            </p>
                        </div>
                    )}

                    {visibleReviews.length > 0 && (
                        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {visibleReviews.map((review) => (
                                <article
                                    key={review.id}
                                    className="flex min-h-80 flex-col rounded-[2rem] border border-line bg-white p-6 sm:p-7"
                                >
                                    <div className="flex items-center gap-4">
                                        {review.photo_url ? (
                                            <img
                                                src={review.photo_url}
                                                alt={`${review.full_name} profil fotoğrafı`}
                                                className="h-14 w-14 shrink-0 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div                                                 className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-line bg-shell text-sm font-extrabold text-holly-ink">
                                                {getInitials(
                                                    review.full_name,
                                                )}
                                            </div>
                                        )}

                                        <div className="min-w-0">
                                            <h3 className="truncate text-lg font-extrabold">
                                                {review.full_name}
                                            </h3>

                                            <p className="mt-1 text-xs font-semibold text-ink-soft">
                                                {review.membership_duration} üye
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between gap-4">
                                        <RatingStars
                                            rating={review.rating}
                                        />

                                        <span className="text-xs text-ink-soft">
                                            {formatDate(review.created_at)}
                                        </span>
                                    </div>

                                    <blockquote className="mt-6 flex-1 text-base leading-7 text-ink/70">
                                        “{review.comment}”
                                    </blockquote>

                                    <div className="mt-6 border-t border-line pt-5">
                                        <span className="text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">
                                            Onaylı topluluk görüşü
                                        </span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        {hasMoreReviews && (
                            <button
                                type="button"
                                onClick={showMoreReviews}
                                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-line px-7 text-sm font-extrabold text-ink transition hover:border-ink-soft hover:bg-white sm:w-auto"
                            >
                                Daha Fazla Gör
                                <ChevronDown className="h-4 w-4" />
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => setIsFormOpen(true)}
                            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#27D66B] px-7 text-sm font-bold text-ink transition hover:bg-[#1fc461] sm:w-auto"
                        >
                            Görüşünü Paylaş
                        </button>
                    </div>
                </div>
            </section>

            {isFormOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm sm:py-12"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Görüşünü paylaş"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setIsFormOpen(false);
                        }
                    }}
                >
                    <div className="relative w-full max-w-2xl">
                        <button
                            type="button"
                            onClick={() => setIsFormOpen(false)}
                            aria-label="Formu kapat"
                            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:bg-shell"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <ReviewForm />
                    </div>
                </div>
            )}
        </>
    );
}