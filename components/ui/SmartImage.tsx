"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type SmartImageProps = Omit<ImageProps, "src"> & {
    src: string;
};

const extensions = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

export default function SmartImage({
    src,
    alt,
    ...props
}: SmartImageProps) {
    const hasExtension = /\.(jpg|jpeg|png|webp|avif)$/i.test(src);

    const candidates = hasExtension
        ? [src]
        : extensions.map((extension) => `${src}${extension}`);

    const [currentIndex, setCurrentIndex] = useState(0);

    function handleError() {
        setCurrentIndex((previousIndex) => {
            if (previousIndex >= candidates.length - 1) {
                return previousIndex;
            }

            return previousIndex + 1;
        });
    }

    return (
        <Image
            {...props}
            src={candidates[currentIndex]}
            alt={alt}
            onError={handleError}
        />
    );
}