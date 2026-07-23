"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import {
    CheckCircle2,
    ImagePlus,
    Loader2,
    Star,
    X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

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

const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

const maximumImageSize = 1024 * 1024;

export default function ReviewForm() {
    const supabase = createClient();

    const [fullName, setFullName] = useState("");
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [membershipDuration, setMembershipDuration] = useState("");
    const [comment, setComment] = useState("");
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [consent, setConsent] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
        const selectedFile = event.target.files?.[0];

        setErrorMessage("");

        if (!selectedFile) {
            return;
        }

        if (!allowedImageTypes.includes(selectedFile.type)) {
            event.target.value = "";
            setErrorMessage(
                "Fotoğraf JPG, PNG veya WEBP formatında olmalıdır.",
            );
            return;
        }

        if (selectedFile.size > maximumImageSize) {
            event.target.value = "";
            setErrorMessage("Fotoğraf boyutu en fazla 1 MB olabilir.");
            return;
        }

        if (photoPreview) {
            URL.revokeObjectURL(photoPreview);
        }

        setPhoto(selectedFile);
        setPhotoPreview(URL.createObjectURL(selectedFile));
    }

    function removePhoto() {
        if (photoPreview) {
            URL.revokeObjectURL(photoPreview);
        }

        setPhoto(null);
        setPhotoPreview(null);
    }

    function resetForm() {
        if (photoPreview) {
            URL.revokeObjectURL(photoPreview);
        }

        setFullName("");
        setRating(0);
        setHoveredRating(0);
        setMembershipDuration("");
        setComment("");
        setPhoto(null);
        setPhotoPreview(null);
        setConsent(false);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");

        const cleanFullName = fullName.trim();
        const cleanComment = comment.trim();

        if (cleanFullName.length < 2) {
            setErrorMessage("Lütfen adını ve soyadını yaz.");
            return;
        }

        if (rating < 1 || rating > 5) {
            setErrorMessage("Lütfen 1 ile 5 arasında bir puan seç.");
            return;
        }

        if (!membershipDuration) {
            setErrorMessage("Lütfen ne zamandır üye olduğunu seç.");
            return;
        }

        if (cleanComment.length < 10) {
            setErrorMessage("Görüşün en az 10 karakter olmalıdır.");
            return;
        }

        if (cleanComment.length > 1000) {
            setErrorMessage("Görüşün en fazla 1000 karakter olabilir.");
            return;
        }

        if (!consent) {
            setErrorMessage(
                "Yayınlama ve veri işleme onayını vermelisin.",
            );
            return;
        }

        setIsSubmitting(true);

        let uploadedPhotoPath: string | null = null;

        try {
            if (photo) {
                const extension = photo.name
                    .split(".")
                    .pop()
                    ?.toLocaleLowerCase("tr-TR");

                if (!extension) {
                    throw new Error(
                        "Fotoğraf uzantısı belirlenemedi.",
                    );
                }

                uploadedPhotoPath = `${crypto.randomUUID()}.${extension}`;

                const { error: uploadError } = await supabase.storage
                    .from("review-photos")
                    .upload(uploadedPhotoPath, photo, {
                        cacheControl: "3600",
                        upsert: false,
                        contentType: photo.type,
                    });

                if (uploadError) {
                    throw new Error(
                        `Fotoğraf yüklenemedi: ${uploadError.message}`,
                    );
                }
            }

            const { error: insertError } = await supabase
                .from("community_reviews")
                .insert({
                    full_name: cleanFullName,
                    rating,
                    membership_duration: membershipDuration,
                    comment: cleanComment,
                    photo_path: uploadedPhotoPath,
                    consent: true,
                    status: "pending",
                    approved_at: null,
                });

            if (insertError) {
                throw new Error(
                    `Görüş gönderilemedi: ${insertError.message}`,
                );
            }

            resetForm();

            setSuccessMessage(
                "Görüşün incelemeye gönderildi. Admin onayından sonra yayınlanacaktır.",
            );
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Beklenmeyen bir hata oluştu.",
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-white/10 bg-[#111111] p-6 sm:p-8"
        >
            <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#27D66B]">
                    Görüşünü paylaş
                </p>

                <h3 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] text-white sm:text-3xl">
                    Holly Sport deneyimini anlat.
                </h3>

                <p className="mt-3 text-sm leading-7 text-white/45">
                    Görüşün yayınlanmadan önce yönetim ekibi tarafından
                    incelenecektir.
                </p>
            </div>

            <div className="mt-8 grid gap-6">
                <div>
                    <label
                        htmlFor="review-full-name"
                        className="mb-2 block text-sm font-semibold text-white"
                    >
                        Ad soyad
                    </label>

                    <input
                        id="review-full-name"
                        type="text"
                        value={fullName}
                        onChange={(event) =>
                            setFullName(event.target.value)
                        }
                        placeholder="Umut Küçük"
                        maxLength={80}
                        required
                        className="form-field-dark min-h-13 w-full rounded-2xl border border-white/10 bg-white/5 px-4 outline-none transition focus:border-[#27D66B]"
                    />
                </div>

                <div>
                    <span className="mb-3 block text-sm font-semibold text-white">
                        Memnuniyet puanı
                    </span>

                    <div
                        className="flex items-center gap-2"
                        onMouseLeave={() => setHoveredRating(0)}
                    >
                        {[1, 2, 3, 4, 5].map((star) => {
                            const isActive =
                                star <= (hoveredRating || rating);

                            return (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() =>
                                        setHoveredRating(star)
                                    }
                                    aria-label={`${star} yıldız`}
                                    className="rounded-lg p-1 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#27D66B]"
                                >
                                    <Star
                                        className={`h-8 w-8 transition ${isActive
                                                ? "fill-[#FFD54A] text-[#FFD54A]"
                                                : "text-white/20"
                                            }`}
                                    />
                                </button>
                            );
                        })}

                        <span className="ml-2 text-sm text-white/45">
                            {rating > 0
                                ? `${rating} / 5`
                                : "Puan seç"}
                        </span>
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="review-membership-duration"
                        className="mb-2 block text-sm font-semibold text-white"
                    >
                        Ne zamandır Holly Sport üyesisin?
                    </label>

                    <select
                        id="review-membership-duration"
                        value={membershipDuration}
                        onChange={(event) =>
                            setMembershipDuration(
                                event.target.value,
                            )
                        }
                        required
                        className="form-field-dark min-h-13 w-full rounded-2xl border border-white/10 bg-[#181818] px-4 outline-none transition focus:border-[#27D66B]"
                    >
                        <option value="">
                            Üyelik süresini seç
                        </option>

                        {membershipOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <div className="mb-2 flex items-center justify-between gap-4">
                        <label
                            htmlFor="review-comment"
                            className="block text-sm font-semibold text-white"
                        >
                            Görüşün
                        </label>

                        <span className="text-xs text-white/35">
                            {comment.length}/1000
                        </span>
                    </div>

                    <textarea
                        id="review-comment"
                        value={comment}
                        onChange={(event) =>
                            setComment(event.target.value)
                        }
                        placeholder="Holly Sport ile yaşadığın deneyimi paylaş..."
                        minLength={10}
                        maxLength={1000}
                        rows={6}
                        required
                        className="form-field-dark w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-4 outline-none transition focus:border-[#27D66B]"
                    />
                </div>

                <div>
                    <span className="mb-2 block text-sm font-semibold text-white">
                        Fotoğraf
                        <span className="ml-2 font-normal text-white/35">
                            isteğe bağlı
                        </span>
                    </span>

                    {photoPreview ? (
                        <div className="relative h-32 w-32 overflow-hidden rounded-2xl border border-white/10">
                            <img
                                src={photoPreview}
                                alt="Seçilen profil fotoğrafı"
                                className="h-full w-full object-cover"
                            />

                            <button
                                type="button"
                                onClick={removePhoto}
                                aria-label="Fotoğrafı kaldır"
                                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-500"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <label
                            htmlFor="review-photo"
                            className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-5 text-center transition hover:border-[#27D66B]/60 hover:bg-[#27D66B]/5"
                        >
                            <ImagePlus className="h-7 w-7 text-[#27D66B]" />

                            <span className="mt-3 text-sm font-semibold text-white">
                                Fotoğraf ekle
                            </span>

                            <span className="mt-1 text-xs text-white/35">
                                JPG, PNG veya WEBP · En fazla 1 MB
                            </span>
                        </label>
                    )}

                    <input
                        id="review-photo"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoChange}
                        className="sr-only"
                    />
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <input
                        type="checkbox"
                        checked={consent}
                        onChange={(event) =>
                            setConsent(event.target.checked)
                        }
                        required
                        className="mt-1 h-4 w-4 accent-[#27D66B]"
                    />

                    <span className="text-sm leading-6 text-white/50">
                        Adımın, görüşümün ve eklediğim fotoğrafın
                        Holly Sport internet sitesinde yayınlanmasını
                        kabul ediyorum.
                    </span>
                </label>
            </div>

            {errorMessage && (
                <div className="mt-6 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {errorMessage}
                </div>
            )}

            {successMessage && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#27D66B]/25 bg-[#27D66B]/10 px-4 py-4 text-sm text-[#67eb9b]">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                    <span>{successMessage}</span>
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-7 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#27D66B] px-7 text-sm font-extrabold text-black transition hover:bg-[#45e27f] disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Gönderiliyor
                    </>
                ) : (
                    "Görüşümü Gönder"
                )}
            </button>
        </form>
    );
}