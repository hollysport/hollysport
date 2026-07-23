import Image from "next/image";
import Link from "next/link";

import { sports } from "@/data/sports";

const featuredSlugs = [
  "kosu",
  "voleybol",
  "halisaha",
  "kamp",
  "trekkinghiking",
];

export default function Gallery() {
  const featuredImages = featuredSlugs
    .map((slug) => sports.find((sport) => sport.slug === slug))
    .filter(
      (sport): sport is (typeof sports)[number] =>
        sport !== undefined,
    );

  return (
    <section
      id="gallery"
      className="scroll-mt-20 bg-white py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
              Bizden Kareler
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
              Spor, enerji ve gerçek dostluklar.
            </h2>

            <p className="mt-4 text-base leading-7 text-zinc-600 sm:text-lg">
              Holly Sport etkinliklerinde yalnızca spor yapmıyor, birlikte
              unutulmaz anılar biriktiriyoruz.
            </p>
          </div>

          <Link
            href="/gallery"
            className="inline-flex min-h-12 w-fit shrink-0 items-center justify-center rounded-full bg-[#27D66B] px-6 text-sm font-bold text-[#050505] transition hover:bg-[#45e27f]"
          >
            Tüm Galeriyi Gör
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
          {featuredImages.map((sport, index) => (
            <Link
              key={sport.slug}
              href={`/gallery?branch=${sport.slug}`}
              className={`group relative min-h-[240px] overflow-hidden rounded-2xl bg-zinc-200 ${index === 0
                  ? "sm:col-span-2 lg:col-span-2 lg:row-span-2 lg:min-h-[540px]"
                  : "lg:min-h-0"
                }`}
            >
              <Image
                src={sport.cover}
                alt={`${sport.name} etkinlikleri`}
                fill
                sizes={
                  index === 0
                    ? "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 50vw"
                    : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                }
                className="object-cover transition duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

              <span className="absolute bottom-5 left-5 text-xl font-bold text-white">
                {sport.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}