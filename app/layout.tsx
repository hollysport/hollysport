import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";

import "./globals.css";

const siteUrl = "https://hollysport.net";

const siteDescription =
    "Holly Sport; spor, sosyalleşme ve yeni deneyimler etrafında insanları bir araya getiren bağımsız ve gönüllülük temelli bir spor topluluğudur.";

const manrope = Manrope({
    subsets: ["latin"],
    variable: "--font-manrope",
    display: "swap",
});

export const viewport: Viewport = {
    themeColor: "#050505",
    colorScheme: "dark",
};

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),

    title: "Holly Sport | Spor Topluluğu",

    description: siteDescription,

    applicationName: "Holly Sport",

    keywords: [
        "Holly Sport",
        "spor topluluğu",
        "İstanbul spor etkinlikleri",
        "ücretsiz spor etkinlikleri",
        "erişilebilir spor etkinlikleri",
        "koşu etkinlikleri",
        "voleybol etkinlikleri",
        "trekking",
        "hiking",
        "kamp",
        "halı saha",
        "spor organizasyonu",
        "sosyal spor topluluğu",
        "gönüllü spor topluluğu",
    ],

    authors: [
        {
            name: "Holly Sport",
            url: siteUrl,
        },
    ],

    creator: "Holly Sport",
    publisher: "Holly Sport",

    openGraph: {
        type: "website",
        locale: "tr_TR",
        url: "/",
        siteName: "Holly Sport",
        title: "Holly Sport | Spor Topluluğu",
        description:
            "Spor yap, yeni insanlarla tanış ve birlikte hareket et. Holly Sport topluluğunu keşfet.",
        images: [
            {
                url: "/images/seo/holly-sport-og.jpg",
                width: 1200,
                height: 630,
                alt: "Holly Sport spor topluluğu",
            },
        ],
    },

    twitter: {
        card: "summary_large_image",
        title: "Holly Sport | Spor Topluluğu",
        description:
            "Spor yap, yeni insanlarla tanış ve birlikte hareket et.",
        images: ["/images/seo/holly-sport-og.jpg"],
    },

    robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: false,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
        },
    },

    category: "sports",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="tr">
            <body
                className={`${manrope.className} ${manrope.variable} bg-[#050505] antialiased`}
            >
                {children}
            </body>
        </html>
    );
}