"use client";

import { useState } from "react";
import {
    Check,
    EyeOff,
    Loader2,
    Pencil,
    Save,
    Trash2,
    X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type ReviewStatus = "pending" | "approved" | "rejected";

type ReviewActionsProps = {
    review: {
        id: string;
        full_name: string;
        rating: number;
        membership_duration: string;
        comment: string;
        photo_path: string | null;
        status: ReviewStatus;
    };
};

const membershipOptions = [
    "1 aydan kısa süredir",
    "1–3 aydır",
    "3–6 aydır",
    "6–12 aydır",
    "1 yıldır",
    "2 yıldır",
    "3 yıldır",
    "4 yıldır",
    "5 yıl ve üzeri",
];

export default function ReviewActions({
    review,
}: ReviewActionsProps) {
    const router = useRouter();
    const supabase = createClient();

    const [isEditing, setIsEditing] = useState(false);

    const [fullName, setFullName] = useState(review.full_name);
    const [rating, setRating] = useState(review.rating);
    const [membershipDuration, setMembershipDuration] = useState(
        review.membership_duration,
    );
    const [comment, setComment] = useState(review.comment);

    const [loadingAction, setLoadingAction] = useState<
        | "approve"
        | "reject"
        | "hide"
        | "save"
        | "delete"
        | null
    >(null);

    const [errorMessage, setErrorMessage] = useState("");

    async function updateStatus(newStatus: ReviewStatus) {
        setErrorMessage("");

        if (newStatus === "approved") {
            setLoadingAction("approve");
        } else if (newStatus === "rejected") {
            setLoadingAction("reject");
        } else {
            setLoadingAction("hide");
        }

        const { error } = await supabase
            .from("community_reviews")
            .update({
                status: newStatus,
                approved_at:
                    newStatus === "approved"
                        ? new Date().toISOString()
                        : null,
            })
            .eq("id", review.id);

        setLoadingAction(null);

        if (error) {
            setErrorMessage(
                `Görüş durumu güncellenemedi: ${error.message}`,
            );
            return;
        }

        router.refresh();
    }

    async function saveReview() {
        setErrorMessage("");

        const cleanFullName = fullName.trim();
        const cleanComment = comment.trim();

        if (cleanFullName.length < 2) {
            setErrorMessage("Ad soyad en az 2 karakter olmalıdır.");
            return;
        }

        if (rating < 1 || rating > 5) {
            setErrorMessage("Puan 1 ile 5 arasında olmalıdır.");
            return;
        }

        if (!membershipDuration) {
            setErrorMessage("Üyelik süresini seçmelisin.");
            return;
        }

        if (cleanComment.length < 10) {
            setErrorMessage("Görüş en az 10 karakter olmalıdır.");
            return;
        }

        if (cleanComment.length > 1000) {
            setErrorMessage("Görüş en fazla 1000 karakter olabilir.");
            return;
        }

        setLoadingAction("save");

        const { error } = await supabase
            .from("community_reviews")
            .update({
                full_name: cleanFullName,
                rating,
                membership_duration: membershipDuration,
                comment: cleanComment,
            })
            .eq("id", review.id);

        setLoadingAction(null);

        if (error) {
            setErrorMessage(
                `Görüş güncellenemedi: ${error.message}`,
            );
            return;
        }

        setIsEditing(false);
        router.refresh();
    }

    async function deleteReview() {
        const confirmed = window.confirm(
            "Bu görüş kalıcı olarak silinsin mi?",
        );

        if (!confirmed) {
            return;
        }

        setErrorMessage("");
        setLoadingAction("delete");

        if (review.photo_path) {
            const { error: photoError } = await supabase.storage
                .from("review-photos")
                .remove([review.photo_path]);

            if (photoError) {
                setLoadingAction(null);
                setErrorMessage(
                    `Fotoğraf silinemedi: ${photoError.message}`,
                );
                return;
            }
        }

        const { error } = await supabase
            .from("community_reviews")
            .delete()
            .eq("id", review.id);

        setLoadingAction(null);

        if (error) {
            setErrorMessage(
                `Görüş silinemedi: ${error.message}`,
            );
            return;
        }

        router.refresh();
    }

    function cancelEditing() {
        setFullName(review.full_name);
        setRating(review.rating);
        setMembershipDuration(review.membership_duration);
        setComment(review.comment);
        setErrorMessage("");
        setIsEditing(false);
    }

    return (
        <div>
            {isEditing && (
                <div className="mb-6 grid gap-5 rounded-3xl border border-white/10 bg-black/30 p-5">
                    <label>
                        <span className="mb-2 block text-sm font-semibold text-white">
                            Ad soyad
                        </span>

                        <input
                            type="text"
                            value={fullName}
                            onChange={(event) =>
                                setFullName(event.target.value)
                            }
                            maxLength={80}
                            className="form-field-dark min-h-12 w-full rounded-2xl border border-white/10 bg-[#1a1a1a] px-4 outline-none transition focus:border-[#27D66B]"
                        />
                    </label>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <label>
                            <span className="mb-2 block text-sm font-semibold text-white">
                                Yıldız
                            </span>

                            <select
                                value={rating}
                                onChange={(event) =>
                                    setRating(
                                        Number(event.target.value),
                                    )
                                }
                                className="form-field-dark min-h-12 w-full rounded-2xl border border-white/10 bg-[#1a1a1a] px-4 outline-none transition focus:border-[#27D66B]"
                            >
                                <option value={1}>1 yıldız</option>
                                <option value={2}>2 yıldız</option>
                                <option value={3}>3 yıldız</option>
                                <option value={4}>4 yıldız</option>
                                <option value={5}>5 yıldız</option>
                            </select>
                        </label>

                        <label>
                            <span className="mb-2 block text-sm font-semibold text-white">
                                Üyelik süresi
                            </span>

                            <select
                                value={membershipDuration}
                                onChange={(event) =>
                                    setMembershipDuration(
                                        event.target.value,
                                    )
                                }
                                className="form-field-dark min-h-12 w-full rounded-2xl border border-white/10 bg-[#1a1a1a] px-4 outline-none transition focus:border-[#27D66B]"
                            >
                                {membershipOptions.map((option) => (
                                    <option
                                        key={option}
                                        value={option}
                                    >
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <label>
                        <div className="mb-2 flex items-center justify-between gap-4">
                            <span className="text-sm font-semibold text-white">
                                Görüş
                            </span>

                            <span className="text-xs text-white/35">
                                {comment.length}/1000
                            </span>
                        </div>

                        <textarea
                            value={comment}
                            onChange={(event) =>
                                setComment(event.target.value)
                            }
                            rows={5}
                            minLength={10}
                            maxLength={1000}
                            className="form-field-dark w-full resize-none rounded-2xl border border-white/10 bg-[#1a1a1a] px-4 py-4 outline-none transition focus:border-[#27D66B]"
                        />
                    </label>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={saveReview}
                            disabled={loadingAction !== null}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#27D66B] px-5 text-xs font-bold text-black transition hover:bg-[#45e27f] disabled:opacity-50"
                        >
                            {loadingAction === "save" ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}

                            Değişiklikleri Kaydet
                        </button>

                        <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={loadingAction !== null}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-xs font-bold text-white transition hover:bg-white/5 disabled:opacity-50"
                        >
                            <X className="h-4 w-4" />
                            Vazgeç
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                {!isEditing && (
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        disabled={loadingAction !== null}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-blue-400/30 px-4 text-xs font-bold text-blue-300 transition hover:bg-blue-500/10 disabled:opacity-50"
                    >
                        <Pencil className="h-4 w-4" />
                        Düzenle
                    </button>
                )}

                {review.status !== "approved" && (
                    <button
                        type="button"
                        onClick={() => updateStatus("approved")}
                        disabled={loadingAction !== null}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#27D66B] px-4 text-xs font-bold text-black transition hover:bg-[#45e27f] disabled:opacity-50"
                    >
                        {loadingAction === "approve" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Check className="h-4 w-4" />
                        )}

                        Onayla
                    </button>
                )}

                {review.status === "approved" && (
                    <button
                        type="button"
                        onClick={() => updateStatus("pending")}
                        disabled={loadingAction !== null}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-orange-400/30 px-4 text-xs font-bold text-orange-300 transition hover:bg-orange-500/10 disabled:opacity-50"
                    >
                        {loadingAction === "hide" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <EyeOff className="h-4 w-4" />
                        )}

                        Yayından Kaldır
                    </button>
                )}

                {review.status !== "rejected" && (
                    <button
                        type="button"
                        onClick={() => updateStatus("rejected")}
                        disabled={loadingAction !== null}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/15 px-4 text-xs font-bold text-white transition hover:border-orange-400 hover:text-orange-300 disabled:opacity-50"
                    >
                        {loadingAction === "reject" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <X className="h-4 w-4" />
                        )}

                        Reddet
                    </button>
                )}

                <button
                    type="button"
                    onClick={deleteReview}
                    disabled={loadingAction !== null}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-red-500/30 px-4 text-xs font-bold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                >
                    {loadingAction === "delete" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Trash2 className="h-4 w-4" />
                    )}

                    Sil
                </button>
            </div>

            {errorMessage && (
                <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                    {errorMessage}
                </p>
            )}
        </div>
    );
}