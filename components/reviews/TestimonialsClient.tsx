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
                            ? "fill-[#FFD54A] text-[#FFD54A]"
                            : "fill-transparent text-black/20"
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
            <section className="bg-[#27D66B] px-6 py-16 text-black sm:py-20 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
                        <div>
                            <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-black/55">
                                Topluluğun Sesi
                            </p>

                            <h2 className="mt-4 max-w-4xl text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                                Gerçek deneyimler,
                                <br />
                                gerçek dostluklar.
                            </h2>

                            <p className="mt-5 max-w-2xl text-base leading-7 text-black/60 sm:text-lg">
                                Holly Sport üyelerinin topluluk, etkinlikler ve
                                birlikte yaşadıkları deneyimler hakkındaki
                                görüşleri.
                            </p>
                        </div>

                        <div className="w-full rounded-[2rem] border border-black/10 bg-black p-7 text-white sm:w-auto sm:min-w-80">
                            <div className="flex items-end gap-3">
                                <strong className="text-5xl font-extrabold tracking-[-0.05em]">
                                    {reviews.length > 0
                                        ? averageRating.toFixed(1)
                                        : "—"}
                                </strong>

                                <span className="pb-1 text-sm text-white/45">
                                    / 5
                                </span>
                            </div>

                            <div className="mt-4">
                                <RatingStars
                                    rating={averageRating}
                                    size="large"
                                />
                            </div>

                            <p className="mt-4 text-sm text-white/45">
                                {reviews.length > 0
                                    ? `${reviews.length} onaylı görüşün ortalaması`
                                    : "Henüz onaylanmış görüş bulunmuyor"}
                            </p>
                        </div>
                    </div>

                    {hasError && (
                        <div className="mt-10 rounded-2xl border border-red-900/20 bg-red-950/10 px-5 py-4 text-sm text-red-950">
                            Görüşler yüklenirken bir hata oluştu.
                        </div>
                    )}

                    {!hasError && reviews.length === 0 && (
                        <div className="mt-10 rounded-[2rem] border border-dashed border-black/20 bg-black/[0.04] px-6 py-12 text-center">
                            <MessageSquareQuote className="mx-auto h-9 w-9 text-black/45" />

                            <h3 className="mt-5 text-2xl font-extrabold">
                                İlk görüşü sen paylaş.
                            </h3>

                            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-black/55">
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
                                    className="flex min-h-80 flex-col rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-7"
                                >
                                    <div className="flex items-center gap-4">
                                        {review.photo_url ? (
                                            <img
                                                src={review.photo_url}
                                                alt={`${review.full_name} profil fotoğrafı`}
                                                className="h-14 w-14 shrink-0 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-black text-sm font-extrabold text-[#27D66B]">
                                                {getInitials(
                                                    review.full_name,
                                                )}
                                            </div>
                                        )}

                                        <div className="min-w-0">
                                            <h3 className="truncate text-lg font-extrabold">
                                                {review.full_name}
                                            </h3>

                                            <p className="mt-1 text-xs font-semibold text-black/45">
                                                {review.membership_duration} üye
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between gap-4">
                                        <RatingStars
                                            rating={review.rating}
                                        />

                                        <span className="text-xs text-black/35">
                                            {formatDate(review.created_at)}
                                        </span>
                                    </div>

                                    <blockquote className="mt-6 flex-1 text-base leading-7 text-black/65">
                                        “{review.comment}”
                                    </blockquote>

                                    <div className="mt-6 border-t border-black/10 pt-5">
                                        <span className="text-xs font-bold uppercase tracking-[0.18em] text-black/35">
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
                                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-black/20 px-7 text-sm font-extrabold transition hover:border-black hover:bg-black hover:text-white sm:w-auto"
                            >
                                Daha Fazla Gör
                                <ChevronDown className="h-4 w-4" />
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => setIsFormOpen(true)}
                            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-black px-7 text-sm font-extrabold text-white transition hover:scale-[1.02] hover:bg-[#151515] sm:w-auto"
                        >
                            Görüşünü Paylaş
                        </button>
                    </div>
                </div>
            </section>

            {isFormOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/80 px-4 py-8 backdrop-blur-sm sm:py-12"
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
                            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black text-white transition hover:bg-white hover:text-black"
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