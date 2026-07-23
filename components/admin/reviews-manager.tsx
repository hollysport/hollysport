"use client";

import { useMemo, useState } from "react";
import { Search, Star } from "lucide-react";

import ReviewActions from "@/components/admin/review-actions";

type ReviewStatus = "pending" | "approved" | "rejected";

export type AdminReview = {
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
    photoUrl: string | null;
};

type ReviewsManagerProps = {
    reviews: AdminReview[];
};

function formatDate(date: string) {
    return new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Istanbul",
    }).format(new Date(date));
}

function getInitials(fullName: string) {
    return fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) =>
            part.charAt(0).toLocaleUpperCase("tr-TR"),
        )
        .join("");
}

function getStatusLabel(status: ReviewStatus) {
    if (status === "approved") {
        return "Onaylandı";
    }

    if (status === "rejected") {
        return "Reddedildi";
    }

    return "Onay bekliyor";
}

function getStatusClass(status: ReviewStatus) {
    if (status === "approved") {
        return "bg-[#27D66B]/10 text-[#27D66B]";
    }

    if (status === "rejected") {
        return "bg-red-500/10 text-red-300";
    }

    return "bg-orange-500/10 text-orange-300";
}

export default function ReviewsManager({
    reviews,
}: ReviewsManagerProps) {
    const [activeFilter, setActiveFilter] = useState<
        "all" | ReviewStatus
    >("all");

    const [searchTerm, setSearchTerm] = useState("");

    const filteredReviews = useMemo(() => {
        const normalizedSearch = searchTerm
            .trim()
            .toLocaleLowerCase("tr-TR");

        return reviews.filter((review) => {
            const matchesStatus =
                activeFilter === "all" ||
                review.status === activeFilter;

            const matchesSearch =
                !normalizedSearch ||
                review.full_name
                    .toLocaleLowerCase("tr-TR")
                    .includes(normalizedSearch) ||
                review.comment
                    .toLocaleLowerCase("tr-TR")
                    .includes(normalizedSearch) ||
                review.membership_duration
                    .toLocaleLowerCase("tr-TR")
                    .includes(normalizedSearch);

            return matchesStatus && matchesSearch;
        });
    }, [activeFilter, reviews, searchTerm]);

    const filters = [
        {
            value: "all" as const,
            label: "Tümü",
            count: reviews.length,
        },
        {
            value: "pending" as const,
            label: "Onay bekleyen",
            count: reviews.filter(
                (review) => review.status === "pending",
            ).length,
        },
        {
            value: "approved" as const,
            label: "Onaylanan",
            count: reviews.filter(
                (review) => review.status === "approved",
            ).length,
        },
        {
            value: "rejected" as const,
            label: "Reddedilen",
            count: reviews.filter(
                (review) => review.status === "rejected",
            ).length,
        },
    ];

    return (
        <div className="mt-8">
            <div className="rounded-[2rem] border border-white/10 bg-[#111111] p-5 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {filters.map((filter) => {
                            const isActive =
                                activeFilter === filter.value;

                            return (
                                <button
                                    key={filter.value}
                                    type="button"
                                    onClick={() =>
                                        setActiveFilter(filter.value)
                                    }
                                    className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-xs font-bold transition ${isActive
                                            ? "border-[#27D66B] bg-[#27D66B] text-black"
                                            : "border-white/10 text-white/55 hover:border-white/30 hover:text-white"
                                        }`}
                                >
                                    {filter.label}

                                    <span
                                        className={`rounded-full px-2 py-0.5 ${isActive
                                                ? "bg-black/10"
                                                : "bg-white/5"
                                            }`}
                                    >
                                        {filter.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <label className="relative block w-full lg:max-w-sm">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            placeholder="İsim veya yorum ara..."
                            className="form-field-dark min-h-12 w-full rounded-full border border-white/10 bg-[#1a1a1a] pl-11 pr-4 outline-none transition focus:border-[#27D66B]"
                        />
                    </label>
                </div>

                <p className="mt-4 text-xs text-white/35">
                    {filteredReviews.length} görüş gösteriliyor
                </p>
            </div>

            {filteredReviews.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
                    <h2 className="text-2xl font-bold">
                        Eşleşen görüş bulunamadı.
                    </h2>

                    <p className="mt-3 text-sm text-white/40">
                        Arama kelimesini veya seçili filtreyi değiştir.
                    </p>
                </div>
            ) : (
                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                    {filteredReviews.map((review) => (
                        <article
                            key={review.id}
                            className="rounded-[2rem] border border-white/10 bg-[#111111] p-6"
                        >
                            <div className="flex items-start justify-between gap-5">
                                <div className="flex min-w-0 items-center gap-4">
                                    {review.photoUrl ? (
                                        <img
                                            src={review.photoUrl}
                                            alt={`${review.full_name} profil fotoğrafı`}
                                            className="h-14 w-14 shrink-0 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#27D66B]/10 text-sm font-extrabold text-[#27D66B]">
                                            {getInitials(
                                                review.full_name,
                                            )}
                                        </div>
                                    )}

                                    <div className="min-w-0">
                                        <h2 className="truncate text-lg font-bold">
                                            {review.full_name}
                                        </h2>

                                        <p className="mt-1 text-xs text-white/40">
                                            {review.membership_duration} üye
                                        </p>
                                    </div>
                                </div>

                                <span
                                    className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${getStatusClass(
                                        review.status,
                                    )}`}
                                >
                                    {getStatusLabel(review.status)}
                                </span>
                            </div>

                            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                                <div
                                    className="flex gap-1"
                                    aria-label={`${review.rating} yıldız`}
                                >
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-5 w-5 ${star <= review.rating
                                                    ? "fill-[#FFD54A] text-[#FFD54A]"
                                                    : "text-white/15"
                                                }`}
                                        />
                                    ))}
                                </div>

                                <span className="text-xs text-white/35">
                                    {formatDate(review.created_at)}
                                </span>
                            </div>

                            <blockquote className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-white/65">
                                “{review.comment}”
                            </blockquote>

                            <div className="mt-6 border-t border-white/10 pt-5">
                                <ReviewActions
                                    review={{
                                        id: review.id,
                                        full_name:
                                            review.full_name,
                                        rating: review.rating,
                                        membership_duration:
                                            review.membership_duration,
                                        comment: review.comment,
                                        photo_path:
                                            review.photo_path,
                                        status: review.status,
                                    }}
                                />
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}