import { createClient } from "@/lib/supabase/server";

import TestimonialsClient from "./TestimonialsClient";

type ReviewRow = {
    id: string;
    full_name: string;
    rating: number;
    membership_duration: string;
    comment: string;
    photo_path: string | null;
    created_at: string;
};

export type Review = ReviewRow & {
    photo_url: string | null;
};

export default async function TestimonialsSection() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("community_reviews")
        .select(`
            id,
            full_name,
            rating,
            membership_duration,
            comment,
            photo_path,
            created_at
        `)
        .eq("status", "approved")
        .order("approved_at", { ascending: false });

    const reviewRows = (data ?? []) as ReviewRow[];

    const photoPaths = reviewRows
        .map((review) => review.photo_path)
        .filter((path): path is string => Boolean(path));

    const signedUrlByPath = new Map<string, string>();

    if (photoPaths.length > 0) {
        const { data: signedPhotos } = await supabase.storage
            .from("review-photos")
            .createSignedUrls(photoPaths, 60 * 60);

        for (const signed of signedPhotos ?? []) {
            if (signed.path && signed.signedUrl) {
                signedUrlByPath.set(signed.path, signed.signedUrl);
            }
        }
    }

    const reviews: Review[] = reviewRows.map((review) => ({
        ...review,
        photo_url: review.photo_path
            ? (signedUrlByPath.get(review.photo_path) ?? null)
            : null,
    }));

    const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0,
    );

    const averageRating =
        reviews.length > 0
            ? Number((totalRating / reviews.length).toFixed(1))
            : 0;

    return (
        <TestimonialsClient
            reviews={reviews}
            averageRating={averageRating}
            hasError={Boolean(error)}
        />
    );
}