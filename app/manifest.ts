import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Holly Sport",
        short_name: "Holly Sport",
        description:
            "Spor, sosyalleşme ve yeni deneyimler etrafında insanları bir araya getiren bağımsız spor topluluğu.",
        start_url: "/",
        display: "standalone",
        background_color: "#050505",
        theme_color: "#27D66B",
        orientation: "portrait-primary",
        icons: [
            {
                src: "/icons/icon-192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/icons/icon-512.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    };
}