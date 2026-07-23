"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

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
        const randomIndex = Math.floor(Math.random() * (index + 1));

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
    const [selectedBranch, setSelectedBranch] = useState("all");
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

        window.addEventListener("popstate", readBranchFromUrl);

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
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedImage]);

    const filteredImages = useMemo(() => {
        if (selectedBranch === "all") {
            return shuffledImages;
        }

        return images.filter(
            (image) => image.branch === selectedBranch,
        );
    }, [images, selectedBranch, shuffledImages]);

    function changeBranch(branch: string) {
        setSelectedBranch(branch);

        if (branch === "all") {
            setShuffledImages(shuffleImages(images));
        }

        const newAddress =
            branch === "all"
                ? "/gallery"
                : `/gallery?branch=${branch}`;

        window.history.replaceState(null, "", newAddress);
    }

    return (
        <>
            <div className="mb-10 flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={() => changeBranch("all")}
                    className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${selectedBranch === "all"
                            ? "bg-[#27D66B] text-[#050505]"
                            : "border border-zinc-300 bg-white text-zinc-700 hover:border-zinc-950"
                        }`}
                >
                    Tümü
                </button>

                {sports.map((sport) => (
                    <button
                        key={sport.slug}
                        type="button"
                        onClick={() => changeBranch(sport.slug)}
                        className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${selectedBranch === sport.slug
                                ? "bg-[#27D66B] text-[#050505]"
                                : "border border-zinc-300 bg-white text-zinc-700 hover:border-zinc-950"
                            }`}
                    >
                        {sport.name}
                    </button>
                ))}
            </div>

            {filteredImages.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredImages.map((image) => (
                        <button
                            key={image.src}
                            type="button"
                            onClick={() => setSelectedImage(image)}
                            className="group relative h-80 overflow-hidden rounded-3xl bg-zinc-200"
                        >
                            <Image
                                src={image.src}
                                alt={image.alt}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover transition duration-500 group-hover:scale-105"
                            />

                            <div className="absolute inset-0 bg-black/10 transition group-hover:bg-black/25" />
                        </button>
                    ))}
                </div>
            ) : (
                <div className="rounded-3xl bg-zinc-100 px-6 py-16 text-center text-zinc-500">
                    Bu kategoriye henüz fotoğraf eklenmedi.
                </div>
            )}

            {selectedImage && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Galeri görseli"
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        type="button"
                        aria-label="Görseli kapat"
                        onClick={() => setSelectedImage(null)}
                        className="absolute right-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-black"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    <div
                        className="relative h-[85vh] w-full max-w-6xl"
                        onClick={(event) => event.stopPropagation()}
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