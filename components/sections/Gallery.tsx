"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";

import { sports } from "@/data/sports";

const featuredSlugs = [
  "kosu",
  "voleybol",
  "halisaha",
  "kamp",
  "trekkinghiking",
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function Gallery() {
  const shouldReduceMotion = useReducedMotion();

  const featuredImages = featuredSlugs
    .map((slug) =>
      sports.find((sport) => sport.slug === slug),
    )
    .filter(
      (sport): sport is (typeof sports)[number] =>
        sport !== undefined,
    );

  return (
    <section
      id="gallery"
      className="scroll-mt-20 overflow-hidden bg-white py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={
            shouldReduceMotion
              ? false
              : {
                opacity: 0,
                y: 24,
              }
          }
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end"
        >
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
              Bizden Kareler
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
              Spor, enerji ve gerçek dostluklar.
            </h2>

            <p className="mt-4 text-base leading-7 text-zinc-600 sm:text-lg">
              Holly Sport etkinliklerinde yalnızca spor
              yapmıyor, birlikte unutulmaz anılar
              biriktiriyoruz.
            </p>
          </div>

          <motion.div
            whileTap={{
              scale: 0.96,
            }}
            className="w-fit shrink-0"
          >
            <Link
              href="/gallery"
              className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-[#27D66B] px-6 text-sm font-bold text-[#050505] transition duration-300 hover:-translate-y-0.5 hover:bg-[#45e27f]"
            >
              Tüm Galeriyi Gör

              <ArrowRight
                aria-hidden="true"
                strokeWidth={2.2}
                className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.08,
          }}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2"
        >
          {featuredImages.map((sport, index) => (
            <motion.div
              key={sport.slug}
              variants={cardVariants}
              whileTap={{
                scale: 0.98,
              }}
              className={
                index === 0
                  ? "sm:col-span-2 lg:col-span-2 lg:row-span-2"
                  : ""
              }
            >
              <Link
                href={`/gallery?branch=${sport.slug}`}
                className={`group relative block min-h-[240px] overflow-hidden rounded-2xl bg-zinc-200 ${index === 0
                    ? "lg:min-h-[540px]"
                    : "lg:h-full lg:min-h-0"
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
                  className="object-cover transition-transform duration-700 ease-out will-change-transform md:group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent transition duration-500 md:group-hover:via-black/30" />

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                      Etkinlik Galerisi
                    </p>

                    <h3
                      className={`mt-2 font-extrabold tracking-[-0.04em] text-white ${index === 0
                          ? "text-3xl sm:text-4xl"
                          : "text-2xl"
                        }`}
                    >
                      {sport.name}
                    </h3>
                  </div>

                  <span className="holly-arrow-button flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md md:group-hover:border-white md:group-hover:bg-white md:group-hover:text-black">
                    <ArrowUpRight
                      aria-hidden="true"
                      strokeWidth={2.2}
                      className="holly-arrow-icon h-5 w-5"
                    />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}