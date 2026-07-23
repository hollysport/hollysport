"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Images, X } from "lucide-react";

import { sports } from "@/data/sports";

export type GalleryImage = {
    src: string;
    alt: string;
    branch: string;
};

type GalleryGridProps = {
    images: GalleryImage[];
};

function shuffleImages(items: GalleryImage[]) {
    const copiedImages = [...items];

    for (let index = copiedImages.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(
            Math.random() * (index + 1),
        );

        [copiedImages[index], copiedImages[randomIndex]] = [
            copiedImages[randomIndex],
            copiedImages[index],
        ];
    }

    return copiedImages;
}

export default function GalleryGrid({
    images,
}: GalleryGridProps) {
    const [selectedBranch, setSelectedBranch] =
        useState("all");

    const [selectedImage, setSelectedImage] =
        useState<GalleryImage | null>(null);

    const [shuffledImages, setShuffledImages] =
        useState<GalleryImage[]>(images);

    useEffect(() => {
        setShuffledImages(shuffleImages(images));
    }, [images]);

    useEffect(() => {
        function readBranchFromUrl() {
            const branch = new URLSearchParams(
                window.location.search,
            ).get("branch");

            const validBranch = sports.some(
                (sport) => sport.slug === branch,
            );

            setSelectedBranch(
                branch && validBranch ? branch : "all",
            );
        }

        readBranchFromUrl();

        window.addEventListener(
            "popstate",
            readBranchFromUrl,
        );

        return () => {
            window.removeEventListener(
                "popstate",
                readBranchFromUrl,
            );
        };
    }, []);

    useEffect(() => {
        if (!selectedImage) {
            return;
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setSelectedImage(null);
            }
        }

        document.body.style.overflow = "hidden";
        window.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [selectedImage]);

    const filteredImages = useMemo(() => {
        if (selectedBranch === "all") {
            return shuffledImages;
        }

        return images.filter(
            (image) =>
                image.branch === selectedBranch,
        );
    }, [
        images,
        selectedBranch,
        shuffledImages,
    ]);

    const selectedBranchName =
        selectedBranch === "all"
            ? "Tüm Branşlar"
            : sports.find(
                (sport) =>
                    sport.slug === selectedBranch,
            )?.name ?? "Tüm Branşlar";

    function changeBranch(branch: string) {
        setSelectedBranch(branch);

        if (branch === "all") {
            setShuffledImages(
                shuffleImages(images),
            );
        }

        const newAddress =
            branch === "all"
                ? "/gallery"
                : `/gallery?branch=${branch}`;

        window.history.replaceState(
            null,
            "",
            newAddress,
        );
    }

    return (
        <>
            <div className="mb-10 flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-zinc-50 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#159447]">
                        Galeriyi Filtrele
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-zinc-950 sm:text-2xl">
                        Görmek istediğin branşı seç.
                    </h2>

                    <p className="mt-2 text-sm text-zinc-500">
                        {selectedBranchName} kategorisinde{" "}
                        {filteredImages.length} fotoğraf
                        gösteriliyor.
                    </p>
                </div>

                <div className="relative w-full sm:w-72">
                    <Images
                        aria-hidden="true"
                        className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-zinc-500"
                    />

                    <select
                        value={selectedBranch}
                        onChange={(event) =>
                            changeBranch(
                                event.target.value,
                            )
                        }
                        aria-label="Galeri branşı seç"
                        className="min-h-14 w-full cursor-pointer appearance-none rounded-2xl border border-zinc-300 bg-white py-3 pl-12 pr-12 text-sm font-bold text-zinc-950 outline-none transition focus:border-[#27D66B] focus:ring-4 focus:ring-[#27D66B]/10"
                    >
                        <option value="all">
                            Tüm Branşlar
                        </option>

                        {sports.map((sport) => (
                            <option
                                key={sport.slug}
                                value={sport.slug}
                            >
                                {sport.name}
                            </option>
                        ))}
                    </select>

                    <ChevronDown
                        aria-hidden="true"
                        className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
                    />
                </div>
            </div>

            {filteredImages.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredImages.map((image) => (
                        <button
                            key={image.src}
                            type="button"
                            onClick={() =>
                                setSelectedImage(image)
                            }
                            className="group relative h-80 overflow-hidden rounded-3xl bg-zinc-200 text-left transition-transform duration-200 active:scale-[0.985]"
                        >
                            <Image
                                src={image.src}
                                alt={image.alt}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover transition-transform duration-700 ease-out md:group-hover:scale-105"
                            />

                            <div className="absolute inset-0 bg-black/10 transition duration-300 md:group-hover:bg-black/25" />
                        </button>
                    ))}
                </div>
            ) : (
                <div className="rounded-3xl bg-zinc-100 px-6 py-16 text-center text-zinc-500">
                    Bu kategoriye henüz fotoğraf
                    eklenmedi.
                </div>
            )}

            {selectedImage && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Galeri görseli"
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
                    onClick={() =>
                        setSelectedImage(null)
                    }
                >
                    <button
                        type="button"
                        aria-label="Görseli kapat"
                        onClick={() =>
                            setSelectedImage(null)
                        }
                        className="absolute right-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-black transition active:scale-95"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    <div
                        className="relative h-[85svh] w-full max-w-6xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <Image
                            src={selectedImage.src}
                            alt={selectedImage.alt}
                            fill
                            sizes="100vw"
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>
            )}
        </>
    );
}