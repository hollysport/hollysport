import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";

export default function JoinCommunity() {
  return (
    <section className="bg-[#050505] px-4 py-20 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111] px-6 py-16 sm:px-12 lg:px-16 lg:py-20">
        <div className="absolute inset-y-0 left-0 w-1 bg-[#27D66B]" aria-hidden="true" />

        <div className="relative z-10 flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white">
              <Users className="h-4 w-4 text-[#27D66B]" />
              Herkese açık spor topluluğu
            </div>

            <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Bir sonraki etkinlikte
              <span className="text-[#27D66B]"> sen de aramıza katıl.</span>
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/55 sm:text-lg">
              Seviyen, yaşın veya spor geçmişin önemli değil. Yeni insanlarla
              tanış, farklı sporları deneyimle ve birlikte hareket etmenin
              enerjisini keşfet.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/events"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#27D66B] px-6 py-3.5 text-sm font-bold text-[#050505] transition hover:bg-[#45e27f]"
            >
              Etkinlikleri İncele
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href="/join"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
            >
              Topluluğa Katıl
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
