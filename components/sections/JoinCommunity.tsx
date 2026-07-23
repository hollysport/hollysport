import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";

export default function JoinCommunity() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-zinc-950 px-6 py-16 sm:px-12 lg:px-16 lg:py-20">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white">
              <Users className="h-4 w-4 text-orange-500" />
              Herkese açık spor topluluğu
            </div>

            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Bir sonraki etkinlikte
              <span className="text-orange-500"> sen de aramıza katıl.</span>
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
              Seviyen, yaşın veya spor geçmişin önemli değil. Yeni insanlarla
              tanış, farklı sporları deneyimle ve birlikte hareket etmenin
              enerjisini keşfet.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/events"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3.5 font-semibold text-white transition hover:bg-orange-600"
            >
              Etkinlikleri İncele
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href="/join"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3.5 font-semibold text-white transition hover:bg-white hover:text-zinc-950"
            >
              Topluluğa Katıl
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}