import "server-only";

import fs from "node:fs";
import path from "node:path";

import { sports } from "@/data/sports";

export type GalleryLibraryImage = {
    src: string;
    alt: string;
    branch: string;
    branchName: string;
};

const imageExtensionPattern =
    /\.(avif|gif|jpe?g|png|webp)$/i;

export function getLocalGalleryImages(): GalleryLibraryImage[] {
    const galleryRoot = path.join(
        process.cwd(),
        "public",
        "images",
        "gallery",
    );

    return sports.flatMap((sport) => {
        const branchFolder = path.join(
            galleryRoot,
            sport.slug,
        );

        if (!fs.existsSync(branchFolder)) {
            return [];
        }

        const files = fs
            .readdirSync(branchFolder)
            .filter(
                (fileName) =>
                    imageExtensionPattern.test(
                        fileName,
                    ) &&
                    !/^kapak\.(avif|gif|jpe?g|png|webp)$/i.test(
                        fileName,
                    ),
            )
            .sort((firstFile, secondFile) =>
                firstFile.localeCompare(
                    secondFile,
                    "tr",
                    {
                        numeric: true,
                    },
                ),
            );

        return files.map(
            (fileName, index) => ({
                src: `/images/gallery/${sport.slug}/${fileName}`,
                alt: `Holly Sport ${sport.name} etkinliği ${
                    index + 1
                }`,
                branch: sport.slug,
                branchName: sport.name,
            }),
        );
    });
}