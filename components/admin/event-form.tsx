"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Images, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sports } from "@/data/sports";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_GALLERY_IMAGES = 12;

const allowedImageTypes: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
};

type EventStatus = "draft" | "published" | "cancelled";

export type GalleryLibraryImage = {
    src: string;
    alt: string;
    branch: string;
    branchName: string;
};

export type EventFormInitialData = {
    id: string;
    slug: string;
    title: string;
    category: string;
    short_description: string | null;
    description: string | null;
    location: string;
    address: string | null;
    starts_at: string;
    ends_at: string;
    registration_deadline: string | null;
    capacity: number | null;
    participant_count: number;
    level: string | null;
    is_free: boolean;
    fee_amount: number;
    currency: string;
    price_note: string | null;
    cover_image_path: string | null;
    registration_open: boolean;
    featured: boolean;
    status: EventStatus;
    published_at: string | null;
};

type EventFormProps = {
    initialEvent?: EventFormInitialData;
    initialGalleryCount?: number;
    galleryLibraryImages?: GalleryLibraryImage[];
};

function slugify(value: string) {
    const slug = value
        .trim()
        .toLocaleLowerCase("tr-TR")
        .replaceAll("ı", "i")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return slug || `etkinlik-${Date.now()}`;
}

function toIstanbulIso(value: string) {
    if (!value) {
        return null;
    }

    const valueWithSeconds = value.length === 16 ? `${value}:00` : value;
    const date = new Date(`${valueWithSeconds}+03:00`);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString();
}

function toDateTimeLocal(value: string | null) {
    if (!value) {
        return "";
    }

    const formatter = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Europe/Istanbul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    });

    const parts = formatter.formatToParts(new Date(value));

    const values = Object.fromEntries(
        parts.map((part) => [part.type, part.value]),
    );

    return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

function validateImage(file: File) {
    if (!allowedImageTypes[file.type]) {
        return `${file.name}: Yalnızca JPG, PNG, WEBP veya AVIF yükleyebilirsin.`;
    }

    if (file.size > MAX_FILE_SIZE) {
        return `${file.name}: Görsel boyutu 5 MB'dan büyük olamaz.`;
    }

    return null;
}

export default function EventForm({
    initialEvent,
    initialGalleryCount = 0,
    galleryLibraryImages = [],
}: EventFormProps) {
    const router = useRouter();

    const isEditing = Boolean(initialEvent);

    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isGalleryPickerOpen, setIsGalleryPickerOpen] = useState(false);
    const [galleryBranch, setGalleryBranch] = useState("all");
    const [galleryFileCount, setGalleryFileCount] = useState(0);
    const [selectedGalleryImages, setSelectedGalleryImages] = useState<
        GalleryLibraryImage[]
    >([]);

    const filteredGalleryLibraryImages = useMemo(() => {
        const supportedImages = galleryLibraryImages.filter((image) =>
            /\.(avif|jpe?g|png|webp)$/i.test(image.src),
        );

        if (galleryBranch === "all") {
            return supportedImages;
        }

        return supportedImages.filter(
            (image) => image.branch === galleryBranch,
        );
    }, [galleryBranch, galleryLibraryImages]);

    const galleryBranches = useMemo(
        () =>
            sports.filter((sport) =>
                galleryLibraryImages.some(
                    (image) => image.branch === sport.slug,
                ),
            ),
        [galleryLibraryImages],
    );

    const selectedGallerySources = useMemo(
        () => new Set(selectedGalleryImages.map((image) => image.src)),
        [selectedGalleryImages],
    );

    const newGalleryCount =
        galleryFileCount + selectedGalleryImages.length;

    const remainingGallerySlots = Math.max(
        0,
        MAX_GALLERY_IMAGES - initialGalleryCount - newGalleryCount,
    );

    useEffect(() => {
        if (!isGalleryPickerOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsGalleryPickerOpen(false);
            }
        }

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isGalleryPickerOpen]);

    function toggleGalleryLibraryImage(image: GalleryLibraryImage) {
        setSelectedGalleryImages((currentImages) => {
            const isSelected = currentImages.some(
                (currentImage) => currentImage.src === image.src,
            );

            if (isSelected) {
                return currentImages.filter(
                    (currentImage) => currentImage.src !== image.src,
                );
            }

            if (
                initialGalleryCount +
                    galleryFileCount +
                    currentImages.length >=
                MAX_GALLERY_IMAGES
            ) {
                setErrorMessage(
                    `Galeride toplam en fazla ${MAX_GALLERY_IMAGES} görsel bulunabilir.`,
                );
                return currentImages;
            }

            setErrorMessage("");
            return [...currentImages, image];
        });
    }

    function removeSelectedGalleryImage(src: string) {
        setSelectedGalleryImages((currentImages) =>
            currentImages.filter((image) => image.src !== src),
        );
    }

    function handleGalleryFileChange(
        event: React.ChangeEvent<HTMLInputElement>,
    ) {
        const selectedFileCount = event.target.files?.length ?? 0;

        if (
            initialGalleryCount +
                selectedGalleryImages.length +
                selectedFileCount >
            MAX_GALLERY_IMAGES
        ) {
            event.target.value = "";
            setGalleryFileCount(0);
            setErrorMessage(
                `Galeride toplam en fazla ${MAX_GALLERY_IMAGES} görsel bulunabilir.`,
            );
            return;
        }

        setGalleryFileCount(selectedFileCount);
        setErrorMessage("");
    }

    const inputClass =
        "mt-2 h-14 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#27D66B]";

    const textareaClass =
        "mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#27D66B]";

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        setErrorMessage("");
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);

        const title = String(formData.get("title") ?? "").trim();
        const requestedSlug = String(formData.get("slug") ?? "").trim();
        const category = String(formData.get("category") ?? "").trim();

        const shortDescription = String(
            formData.get("short_description") ?? "",
        ).trim();

        const description = String(formData.get("description") ?? "").trim();
        const location = String(formData.get("location") ?? "").trim();
        const address = String(formData.get("address") ?? "").trim();
        const level = String(formData.get("level") ?? "").trim();
        const priceNote = String(formData.get("price_note") ?? "").trim();

        const startsAt = toIstanbulIso(
            String(formData.get("starts_at") ?? ""),
        );

        const endsAt = toIstanbulIso(
            String(formData.get("ends_at") ?? ""),
        );

        const deadlineValue = String(
            formData.get("registration_deadline") ?? "",
        );

        const registrationDeadline = deadlineValue
            ? toIstanbulIso(deadlineValue)
            : null;

        const capacityValue = String(formData.get("capacity") ?? "").trim();

        const participantValue = String(
            formData.get("participant_count") ?? "0",
        ).trim();

        const capacity = capacityValue === "" ? null : Number(capacityValue);
        const participantCount = Number(participantValue || 0);

        const isFree = formData.get("is_free") === "on";

        const feeValue = String(formData.get("fee_amount") ?? "0").trim();
        const feeAmount = isFree ? 0 : Number(feeValue || 0);

        const registrationRequested =
            formData.get("registration_open") === "on";

        const featured = formData.get("featured") === "on";

        const statusValue = String(formData.get("status") ?? "draft");

        const status: EventStatus =
            statusValue === "published" || statusValue === "cancelled"
                ? statusValue
                : "draft";

        const coverValue = formData.get("cover_image");

        const coverFile =
            coverValue instanceof File && coverValue.size > 0 ? coverValue : null;

        const galleryFiles = formData
            .getAll("gallery_images")
            .filter(
                (value): value is File =>
                    value instanceof File && value.size > 0,
            );

        if (
            !title ||
            !category ||
            !shortDescription ||
            !description ||
            !location
        ) {
            setErrorMessage("Zorunlu metin alanlarını doldur.");
            setIsSubmitting(false);
            return;
        }

        if (!startsAt || !endsAt) {
            setErrorMessage("Başlangıç ve bitiş tarihlerini doğru gir.");
            setIsSubmitting(false);
            return;
        }

        if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
            setErrorMessage("Bitiş tarihi başlangıç tarihinden sonra olmalı.");
            setIsSubmitting(false);
            return;
        }

        if (
            registrationDeadline &&
            new Date(registrationDeadline).getTime() >=
            new Date(startsAt).getTime()
        ) {
            setErrorMessage(
                "Son başvuru tarihi etkinlik başlangıcından önce olmalı.",
            );
            setIsSubmitting(false);
            return;
        }

        if (
            capacity !== null &&
            (!Number.isInteger(capacity) || capacity < 0)
        ) {
            setErrorMessage("Kontenjan sıfır veya pozitif tam sayı olmalı.");
            setIsSubmitting(false);
            return;
        }

        if (!Number.isInteger(participantCount) || participantCount < 0) {
            setErrorMessage(
                "Katılımcı sayısı sıfır veya pozitif tam sayı olmalı.",
            );
            setIsSubmitting(false);
            return;
        }

        if (capacity !== null && participantCount > capacity) {
            setErrorMessage(
                "Katılımcı sayısı etkinlik kontenjanından fazla olamaz.",
            );
            setIsSubmitting(false);
            return;
        }

        if (!Number.isFinite(feeAmount) || feeAmount < 0) {
            setErrorMessage("Ücret bilgisi geçerli değil.");
            setIsSubmitting(false);
            return;
        }

        if (
            status === "published" &&
            !coverFile &&
            !initialEvent?.cover_image_path
        ) {
            setErrorMessage(
                "Yayınlanacak etkinlik için kapak görseli yüklemelisin.",
            );
            setIsSubmitting(false);
            return;
        }

        if (
            initialGalleryCount +
                galleryFiles.length +
                selectedGalleryImages.length >
            MAX_GALLERY_IMAGES
        ) {
            setErrorMessage(
                `Galeride toplam en fazla ${MAX_GALLERY_IMAGES} görsel bulunabilir. Şu anda ${initialGalleryCount} görsel var.`,
            );
            setIsSubmitting(false);
            return;
        }

        const allImages = [
            ...(coverFile ? [coverFile] : []),
            ...galleryFiles,
        ];

        for (const image of allImages) {
            const imageError = validateImage(image);

            if (imageError) {
                setErrorMessage(imageError);
                setIsSubmitting(false);
                return;
            }
        }

        const supabase = createClient();

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            setErrorMessage(
                "Admin oturumu bulunamadı. Tekrar giriş yapmalısın.",
            );
            setIsSubmitting(false);
            return;
        }

        const baseSlug = slugify(requestedSlug || title);

        let finalSlug = baseSlug;
        let suffix = 2;

        while (true) {
            let slugQuery = supabase
                .from("events")
                .select("id")
                .eq("slug", finalSlug);

            if (initialEvent) {
                slugQuery = slugQuery.neq("id", initialEvent.id);
            }

            const { data: existingEvent, error: slugError } =
                await slugQuery.maybeSingle();

            if (slugError) {
                setErrorMessage(`Slug kontrol edilemedi: ${slugError.message}`);
                setIsSubmitting(false);
                return;
            }

            if (!existingEvent) {
                break;
            }

            finalSlug = `${baseSlug}-${suffix}`;
            suffix += 1;

            if (suffix > 100) {
                finalSlug = `${baseSlug}-${Date.now()}`;
                break;
            }
        }

        const eventId = initialEvent?.id ?? crypto.randomUUID();

        const uploadedPaths: string[] = [];
        const galleryPaths: string[] = [];

        let coverImagePath = initialEvent?.cover_image_path ?? null;
        let newCoverPath: string | null = null;

        let eventInserted = false;
        let galleryRowsInserted = false;

        async function removeUploadedImages(paths: string[]) {
            if (paths.length === 0) {
                return;
            }

            await supabase.storage.from("event-media").remove(paths);
        }

        try {
            if (coverFile) {
                const extension = allowedImageTypes[coverFile.type];

                newCoverPath =
                    `${eventId}/cover-` +
                    `${crypto.randomUUID()}.${extension}`;

                const { error: coverUploadError } = await supabase.storage
                    .from("event-media")
                    .upload(newCoverPath, coverFile, {
                        cacheControl: "3600",
                        contentType: coverFile.type,
                        upsert: false,
                    });

                if (coverUploadError) {
                    throw new Error(
                        `Kapak görseli yüklenemedi: ${coverUploadError.message}`,
                    );
                }

                coverImagePath = newCoverPath;
                uploadedPaths.push(newCoverPath);
            }

            for (const [index, galleryFile] of galleryFiles.entries()) {
                const extension = allowedImageTypes[galleryFile.type];

                const imageNumber = initialGalleryCount + index + 1;

                const galleryPath =
                    `${eventId}/gallery/` +
                    `${String(imageNumber).padStart(2, "0")}-` +
                    `${crypto.randomUUID()}.${extension}`;

                const { error: galleryUploadError } = await supabase.storage
                    .from("event-media")
                    .upload(galleryPath, galleryFile, {
                        cacheControl: "3600",
                        contentType: galleryFile.type,
                        upsert: false,
                    });

                if (galleryUploadError) {
                    throw new Error(
                        `Galeri görseli yüklenemedi: ${galleryUploadError.message}`,
                    );
                }

                uploadedPaths.push(galleryPath);
                galleryPaths.push(galleryPath);
            }

            for (const galleryImage of selectedGalleryImages) {
                const response = await fetch(galleryImage.src, {
                    cache: "no-store",
                });

                if (!response.ok) {
                    throw new Error(
                        `Galerideki görsel alınamadı: ${galleryImage.alt}`,
                    );
                }

                const imageBlob = await response.blob();
                const extension = allowedImageTypes[imageBlob.type];

                if (!extension) {
                    throw new Error(
                        `Galerideki görsel desteklenmeyen bir formatta: ${galleryImage.alt}`,
                    );
                }

                if (imageBlob.size > MAX_FILE_SIZE) {
                    throw new Error(
                        `Galerideki görsel 5 MB'dan büyük: ${galleryImage.alt}`,
                    );
                }

                const imageNumber =
                    initialGalleryCount + galleryPaths.length + 1;

                const galleryPath =
                    `${eventId}/gallery/` +
                    `${String(imageNumber).padStart(2, "0")}-` +
                    `${crypto.randomUUID()}.${extension}`;

                const { error: galleryUploadError } = await supabase.storage
                    .from("event-media")
                    .upload(galleryPath, imageBlob, {
                        cacheControl: "3600",
                        contentType: imageBlob.type,
                        upsert: false,
                    });

                if (galleryUploadError) {
                    throw new Error(
                        `Galeriden seçilen görsel yüklenemedi: ${galleryUploadError.message}`,
                    );
                }

                uploadedPaths.push(galleryPath);
                galleryPaths.push(galleryPath);
            }

            const eventIsFinished =
                new Date(endsAt).getTime() < Date.now();

            const deadlineHasPassed =
                registrationDeadline !== null &&
                new Date(registrationDeadline).getTime() <= Date.now();

            const capacityIsFull =
                capacity !== null && participantCount >= capacity;

            const registrationOpen =
                status === "published" &&
                !eventIsFinished &&
                !deadlineHasPassed &&
                !capacityIsFull &&
                registrationRequested;

            const publishedAt =
                status === "published"
                    ? initialEvent?.published_at ?? new Date().toISOString()
                    : null;

            const eventPayload = {
                slug: finalSlug,
                title,
                category,
                short_description: shortDescription,
                description,
                location,
                address: address || null,
                starts_at: startsAt,
                ends_at: endsAt,
                registration_deadline: registrationDeadline,
                capacity,
                participant_count: participantCount,
                level: level || null,
                is_free: isFree,
                fee_amount: feeAmount,
                currency: "TRY",
                price_note: priceNote || null,
                cover_image_path: coverImagePath,
                registration_open: registrationOpen,
                featured,
                status,
                published_at: publishedAt,
                updated_by: user.id,
            };

            const galleryRows = galleryPaths.map((storagePath, index) => ({
                event_id: eventId,
                storage_path: storagePath,
                alt_text: `${title} etkinlik fotoğrafı ${initialGalleryCount + index + 1
                    }`,
                sort_order: initialGalleryCount + index,
            }));

            if (initialEvent) {
                if (galleryRows.length > 0) {
                    const { error: galleryInsertError } = await supabase
                        .from("event_images")
                        .insert(galleryRows);

                    if (galleryInsertError) {
                        throw new Error(
                            `Galeri kaydedilemedi: ${galleryInsertError.message}`,
                        );
                    }

                    galleryRowsInserted = true;
                }

                const { error: updateError } = await supabase
                    .from("events")
                    .update(eventPayload)
                    .eq("id", eventId);

                if (updateError) {
                    throw new Error(
                        `Etkinlik güncellenemedi: ${updateError.message}`,
                    );
                }
            } else {
                const { error: insertEventError } = await supabase
                    .from("events")
                    .insert({
                        id: eventId,
                        ...eventPayload,
                        created_by: user.id,
                    });

                if (insertEventError) {
                    throw new Error(
                        `Etkinlik kaydedilemedi: ${insertEventError.message}`,
                    );
                }

                eventInserted = true;

                if (galleryRows.length > 0) {
                    const { error: galleryInsertError } = await supabase
                        .from("event_images")
                        .insert(galleryRows);

                    if (galleryInsertError) {
                        throw new Error(
                            `Galeri kaydedilemedi: ${galleryInsertError.message}`,
                        );
                    }

                    galleryRowsInserted = true;
                }
            }

            if (
                newCoverPath &&
                initialEvent?.cover_image_path &&
                initialEvent.cover_image_path !== newCoverPath
            ) {
                await supabase.storage
                    .from("event-media")
                    .remove([initialEvent.cover_image_path]);
            }

            router.push("/admin/events");
            router.refresh();
        } catch (error) {
            if (
                initialEvent &&
                galleryRowsInserted &&
                galleryPaths.length > 0
            ) {
                await supabase
                    .from("event_images")
                    .delete()
                    .eq("event_id", eventId)
                    .in("storage_path", galleryPaths);
            }

            if (!initialEvent && eventInserted) {
                await supabase.from("events").delete().eq("id", eventId);
            }

            await removeUploadedImages(uploadedPaths);

            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Etkinlik kaydedilirken bilinmeyen bir hata oluştu.",
            );

            setIsSubmitting(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="mt-12 space-y-10"
        >
            {errorMessage && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm leading-6 text-red-300">
                    {errorMessage}
                </div>
            )}

            <section className="rounded-3xl border border-white/10 bg-[#111111] p-6 md:p-9">
                <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#27D66B]">
                    01 · Temel bilgiler
                </span>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <label className="block md:col-span-2">
                        <span className="text-sm text-white/60">Etkinlik adı *</span>

                        <input
                            name="title"
                            type="text"
                            required
                            defaultValue={initialEvent?.title ?? ""}
                            placeholder="Holly Football Night"
                            className={inputClass}
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm text-white/60">Branş *</span>

                        <select
                            name="category"
                            required
                            defaultValue={initialEvent?.category ?? ""}
                            className={inputClass}
                        >
                            <option value="" disabled>
                                Branş seç
                            </option>

                            {sports.map((sport) => (
                                <option key={sport.slug} value={sport.name}>
                                    {sport.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block">
                        <span className="text-sm text-white/60">URL adı</span>

                        <input
                            name="slug"
                            type="text"
                            defaultValue={initialEvent?.slug ?? ""}
                            placeholder="Boş bırakırsan otomatik oluşur"
                            className={inputClass}
                        />
                    </label>

                    <label className="block md:col-span-2">
                        <span className="text-sm text-white/60">
                            Kısa açıklama *
                        </span>

                        <textarea
                            name="short_description"
                            required
                            rows={3}
                            maxLength={300}
                            defaultValue={initialEvent?.short_description ?? ""}
                            placeholder="Etkinlik kartında görünecek kısa açıklama."
                            className={textareaClass}
                        />
                    </label>

                    <label className="block md:col-span-2">
                        <span className="text-sm text-white/60">
                            Etkinlik detayları *
                        </span>

                        <textarea
                            name="description"
                            required
                            rows={8}
                            defaultValue={initialEvent?.description ?? ""}
                            placeholder="Etkinliğin içeriği, gerekli ekipmanlar ve katılımcıların bilmesi gerekenler..."
                            className={textareaClass}
                        />
                    </label>
                </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-[#111111] p-6 md:p-9">
                <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#27D66B]">
                    02 · Tarih ve konum
                </span>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <label className="block">
                        <span className="text-sm text-white/60">
                            Başlangıç tarihi *
                        </span>

                        <input
                            name="starts_at"
                            type="datetime-local"
                            required
                            defaultValue={toDateTimeLocal(
                                initialEvent?.starts_at ?? null,
                            )}
                            className={inputClass}
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm text-white/60">
                            Bitiş tarihi *
                        </span>

                        <input
                            name="ends_at"
                            type="datetime-local"
                            required
                            defaultValue={toDateTimeLocal(
                                initialEvent?.ends_at ?? null,
                            )}
                            className={inputClass}
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm text-white/60">
                            Son başvuru tarihi
                        </span>

                        <input
                            name="registration_deadline"
                            type="datetime-local"
                            defaultValue={toDateTimeLocal(
                                initialEvent?.registration_deadline ?? null,
                            )}
                            className={inputClass}
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm text-white/60">Konum *</span>

                        <input
                            name="location"
                            type="text"
                            required
                            defaultValue={initialEvent?.location ?? ""}
                            placeholder="Caddebostan Sahili"
                            className={inputClass}
                        />
                    </label>

                    <label className="block md:col-span-2">
                        <span className="text-sm text-white/60">Açık adres</span>

                        <input
                            name="address"
                            type="text"
                            defaultValue={initialEvent?.address ?? ""}
                            placeholder="Haritada veya açıklamada gösterilecek tam adres"
                            className={inputClass}
                        />
                    </label>
                </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-[#111111] p-6 md:p-9">
                <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#27D66B]">
                    03 · Katılım bilgileri
                </span>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <label className="block">
                        <span className="text-sm text-white/60">Kontenjan</span>

                        <input
                            name="capacity"
                            type="number"
                            min="0"
                            step="1"
                            defaultValue={initialEvent?.capacity ?? ""}
                            placeholder="Boş bırakırsan sınırsız"
                            className={inputClass}
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm text-white/60">
                            Katılımcı sayısı
                        </span>

                        <input
                            name="participant_count"
                            type="number"
                            min="0"
                            step="1"
                            defaultValue={initialEvent?.participant_count ?? 0}
                            className={inputClass}
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm text-white/60">
                            Katılım seviyesi
                        </span>

                        <select
                            name="level"
                            defaultValue={initialEvent?.level ?? "Tüm seviyeler"}
                            className={inputClass}
                        >
                            <option value="Tüm seviyeler">Tüm seviyeler</option>
                            <option value="Başlangıç">Başlangıç</option>
                            <option value="Başlangıç ve orta">
                                Başlangıç ve orta
                            </option>
                            <option value="Orta">Orta</option>
                            <option value="Orta ve ileri">Orta ve ileri</option>
                            <option value="İleri">İleri</option>
                        </select>
                    </label>

                    <label className="block">
                        <span className="text-sm text-white/60">Ücret</span>

                        <input
                            name="fee_amount"
                            type="number"
                            min="0"
                            step="0.01"
                            defaultValue={initialEvent?.fee_amount ?? 0}
                            className={inputClass}
                        />
                    </label>

                    <label className="block md:col-span-2">
                        <span className="text-sm text-white/60">
                            Ücret açıklaması
                        </span>

                        <input
                            name="price_note"
                            type="text"
                            defaultValue={initialEvent?.price_note ?? ""}
                            placeholder="Saha ücreti katılımcılar arasında paylaşılacaktır."
                            className={inputClass}
                        />
                    </label>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 p-4">
                        <input
                            name="is_free"
                            type="checkbox"
                            defaultChecked={initialEvent?.is_free ?? true}
                            className="h-5 w-5 accent-[#27D66B]"
                        />

                        <span className="text-sm">Ücretsiz etkinlik</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 p-4">
                        <input
                            name="registration_open"
                            type="checkbox"
                            defaultChecked={initialEvent?.registration_open ?? false}
                            className="h-5 w-5 accent-[#27D66B]"
                        />

                        <span className="text-sm">Kayıtları aç</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 p-4">
                        <input
                            name="featured"
                            type="checkbox"
                            defaultChecked={initialEvent?.featured ?? false}
                            className="h-5 w-5 accent-[#27D66B]"
                        />

                        <span className="text-sm">Öne çıkar</span>
                    </label>
                </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-[#111111] p-6 md:p-9">
                <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#27D66B]">
                    04 · Görseller
                </span>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <label className="block rounded-2xl border border-dashed border-white/15 p-6">
                        <span className="block text-sm font-semibold">
                            Kapak görseli
                        </span>

                        <span className="mt-2 block text-xs leading-5 text-white/35">
                            {initialEvent?.cover_image_path
                                ? "Yeni görsel seçmezsen mevcut kapak korunur."
                                : "Yayınlanan etkinliklerde zorunludur."}{" "}
                            En fazla 5 MB.
                        </span>

                        {initialEvent?.cover_image_path && (
                            <span className="mt-3 block truncate text-xs text-[#27D66B]">
                                Mevcut kapak: {initialEvent.cover_image_path}
                            </span>
                        )}

                        <input
                            name="cover_image"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            className="mt-5 block w-full text-sm text-white/45 file:mr-4 file:rounded-full file:border-0 file:bg-[#27D66B] file:px-5 file:py-3 file:font-semibold file:text-black"
                        />
                    </label>

                    <div className="block rounded-2xl border border-dashed border-white/15 p-6">
                        <span className="block text-sm font-semibold">
                            Galeri görselleri
                        </span>

                        <span className="mt-2 block text-xs leading-5 text-white/35">
                            Etkinlikte şu anda {initialGalleryCount} görsel bulunuyor.
                            Toplam en fazla {MAX_GALLERY_IMAGES} görsel olabilir.
                            Mevcut Holly Sport galerisinden seçebilir veya bilgisayardan
                            yeni görsel yükleyebilirsin.
                        </span>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={() => setIsGalleryPickerOpen(true)}
                                disabled={
                                    galleryLibraryImages.length === 0 ||
                                    remainingGallerySlots === 0
                                }
                                className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#27D66B] px-5 text-sm font-semibold text-black transition hover:bg-[#45e27f] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Images className="h-4 w-4" />
                                Galeriden seç
                            </button>

                            <label className="flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10">
                                Bilgisayardan yükle

                                <input
                                    name="gallery_images"
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/webp,image/avif"
                                    onChange={handleGalleryFileChange}
                                    className="sr-only"
                                />
                            </label>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full bg-white/5 px-3 py-2 text-white/45">
                                Galeriden seçilen: {selectedGalleryImages.length}
                            </span>

                            <span className="rounded-full bg-white/5 px-3 py-2 text-white/45">
                                Bilgisayardan seçilen: {galleryFileCount}
                            </span>

                            <span className="rounded-full bg-[#27D66B]/10 px-3 py-2 text-[#27D66B]">
                                Kalan hak: {remainingGallerySlots}
                            </span>
                        </div>

                        {selectedGalleryImages.length > 0 && (
                            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {selectedGalleryImages.map((image) => (
                                    <div
                                        key={image.src}
                                        className="relative aspect-[4/3] overflow-hidden rounded-xl bg-white/5"
                                    >
                                        <Image
                                            src={image.src}
                                            alt={image.alt}
                                            fill
                                            sizes="(max-width: 640px) 50vw, 220px"
                                            className="object-cover"
                                        />

                                        <button
                                            type="button"
                                            aria-label="Seçilen görseli kaldır"
                                            onClick={() =>
                                                removeSelectedGalleryImage(image.src)
                                            }
                                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/75 text-white transition hover:bg-red-500"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {galleryLibraryImages.length === 0 && (
                            <p className="mt-4 text-xs leading-5 text-amber-300/80">
                                Site galerisinde seçilebilir görsel bulunamadı.
                            </p>
                        )}
                    </div>
                </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-[#111111] p-6 md:p-9">
                <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#27D66B]">
                    05 · Yayın durumu
                </span>

                <label className="mt-7 block">
                    <span className="text-sm text-white/60">
                        Etkinlik durumu
                    </span>

                    <select
                        name="status"
                        defaultValue={initialEvent?.status ?? "draft"}
                        className={inputClass}
                    >
                        <option value="draft">Taslak olarak kaydet</option>
                        <option value="published">Yayınla</option>

                        {isEditing && (
                            <option value="cancelled">Etkinliği iptal et</option>
                        )}
                    </select>
                </label>
            </section>

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-8 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={() => router.push("/admin/events")}
                    disabled={isSubmitting}
                    className="flex h-14 items-center justify-center rounded-full border border-white/15 px-8 text-sm font-semibold uppercase tracking-wider disabled:opacity-40"
                >
                    Vazgeç
                </button>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex h-14 items-center justify-center rounded-full bg-[#27D66B] px-9 text-sm font-semibold uppercase tracking-wider text-black transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting
                        ? isEditing
                            ? "Güncelleniyor..."
                            : "Kaydediliyor..."
                        : isEditing
                            ? "Değişiklikleri kaydet"
                            : "Etkinliği kaydet"}
                </button>
            </div>


            {isGalleryPickerOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Holly Sport galerisinden görsel seç"
                    className="fixed inset-0 z-[150] bg-black/90 p-4 backdrop-blur-sm sm:p-6"
                    onClick={() => setIsGalleryPickerOpen(false)}
                >
                    <div
                        className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0B0B0B]"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex flex-col gap-5 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#27D66B]">
                                    Holly Sport Galeri
                                </p>

                                <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                                    Etkinlik fotoğraflarını seç
                                </h2>

                                <p className="mt-2 text-sm text-white/40">
                                    {selectedGalleryImages.length} fotoğraf seçildi ·
                                    {" "}
                                    {remainingGallerySlots} seçim hakkın kaldı.
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <select
                                    value={galleryBranch}
                                    onChange={(event) =>
                                        setGalleryBranch(event.target.value)
                                    }
                                    className="form-field-dark h-12 min-w-48 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white outline-none focus:border-[#27D66B]"
                                >
                                    <option value="all">Tüm branşlar</option>

                                    {galleryBranches.map((sport) => (
                                        <option key={sport.slug} value={sport.slug}>
                                            {sport.name}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    aria-label="Galeriyi kapat"
                                    onClick={() => setIsGalleryPickerOpen(false)}
                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:scale-105"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
                            {filteredGalleryLibraryImages.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                    {filteredGalleryLibraryImages.map((image) => {
                                        const isSelected =
                                            selectedGallerySources.has(image.src);

                                        return (
                                            <button
                                                key={image.src}
                                                type="button"
                                                onClick={() =>
                                                    toggleGalleryLibraryImage(image)
                                                }
                                                className={`group relative aspect-[4/3] overflow-hidden rounded-2xl border text-left transition ${
                                                    isSelected
                                                        ? "border-[#27D66B] ring-2 ring-[#27D66B]/30"
                                                        : "border-white/10 hover:border-white/30"
                                                }`}
                                            >
                                                <Image
                                                    src={image.src}
                                                    alt={image.alt}
                                                    fill
                                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                                    className="object-cover transition duration-500 group-hover:scale-105"
                                                />

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

                                                <span className="absolute bottom-3 left-3 right-12 truncate text-xs font-semibold text-white">
                                                    {image.branchName}
                                                </span>

                                                <span
                                                    className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border transition ${
                                                        isSelected
                                                            ? "border-[#27D66B] bg-[#27D66B] text-black"
                                                            : "border-white/30 bg-black/50 text-transparent"
                                                    }`}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-white/35">
                                    Bu branşta galeride fotoğraf bulunamadı.
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 border-t border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                            <p className="text-sm text-white/40">
                                Seçtiğin fotoğraflar etkinlik kaydedilirken
                                etkinliğin galerisine kopyalanacak.
                            </p>

                            <button
                                type="button"
                                onClick={() => setIsGalleryPickerOpen(false)}
                                className="flex h-12 items-center justify-center rounded-full bg-[#27D66B] px-7 text-sm font-bold text-black transition hover:bg-[#45e27f]"
                            >
                                Seçimi tamamla ({selectedGalleryImages.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}