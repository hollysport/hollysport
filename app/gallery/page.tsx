import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import GalleryGrid, {
    type GalleryImage,
} from "@/components/gallery/GalleryGrid";
import { sports } from "@/data/sports";

export const metadata: Metadata = {
    title: "Galeri | Holly Sport",
    description:
        "Holly Sport etkinliklerinden fotoğrafları branşlara göre keşfet.",
};

const imageExtensionPattern = /\.(avif|gif|jpe?g|png|webp)$/i;

function shuffleArray<T>(items: T[]): T[] {
    return [...items]
        .map((item) => ({
            item,
            sort: Math.random(),
        }))
        .sort((firstItem, secondItem) => {
            return firstItem.sort - secondItem.sort;
        })
        .map(({ item }) => item);
}

function getGalleryImages(): GalleryImage[] {
    const galleryRoot = path.join(
        process.cwd(),
        "public",
        "images",
        "gallery",
    );

    const images = sports.flatMap((sport) => {
        const branchFolder = path.join(galleryRoot, sport.slug);

        if (!fs.existsSync(branchFolder)) {
            return [];
        }

        const files = fs
            .readdirSync(branchFolder)
            .filter(
                (fileName) =>
                    imageExtensionPattern.test(fileName) &&
                    !/^kapak\.(avif|gif|jpe?g|png|webp)$/i.test(
                        fileName,
                    ),
            )
            .sort((firstFile, secondFile) =>
                firstFile.localeCompare(secondFile, "tr", {
                    numeric: true,
                }),
            );

        return files.map((fileName, index) => ({
            src: `/images/gallery/${sport.slug}/${fileName}`,
            alt: `Holly Sport ${sport.name} etkinliği ${index + 1}`,
            branch: sport.slug,
        }));
    });

    return shuffleArray(images);
}

export default function GalleryPage() {
    const galleryImages = getGalleryImages();

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <section className="bg-[#050505] py-20 text-white sm:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#27D66B]">
                        Holly Sport Galeri
                    </p>

                    <h1 className="mt-5 max-w-4xl text-4xl font-extrabold tracking-[-0.04em] sm:text-6xl">
                        Branşını seç, anıları keşfet.
                    </h1>

                    <p className="mt-6 max-w-2xl text-base leading-7 text-white/50 sm:text-lg">
                        Koşudan voleybola, doğa sporlarından
                        turnuvalara kadar topluluğumuzun birlikte
                        biriktirdiği anıları keşfet.
                    </p>
                </div>
            </section>

            <section className="bg-white py-16 sm:py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <GalleryGrid images={galleryImages} />
                </div>
            </section>

            <Footer />
        </main>
    );
}