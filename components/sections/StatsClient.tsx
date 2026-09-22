"use client";

import { useEffect, useRef, useState } from "react";

export type StatItem = {
  label: string;
  value: number | null;
};

function Counter({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = counterRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        const duration = 1600;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
          const progress = Math.min((currentTime - startTime) / duration, 1);
          const easedProgress = 1 - Math.pow(1 - progress, 3);

          setCount(Math.floor(value * easedProgress));

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
        observer.disconnect();
      },
      { threshold: 0.4 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [value]);

  return <span ref={counterRef}>{count}</span>;
}

function StatValue({ value }: { value: number | null }) {
  if (value === null) {
    return <span aria-label="Veri şu anda görüntülenemiyor">—</span>;
  }

  return (
    <>
      <Counter value={value} />
      <span className="text-[#27D66B]">+</span>
    </>
  );
}

export default function StatsClient({ stats }: { stats: StatItem[] }) {
  return (
    <section className="bg-[#050505] px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-5 border-b border-white/10 pb-10 sm:mb-16">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#27D66B]">
            Rakamlarla Holly Sport
          </p>

          <h2 className="max-w-3xl text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-5xl">
            Her etkinlikte büyüyen bir topluluk.
          </h2>
        </div>

        <div className="grid gap-10 sm:grid-cols-3 sm:gap-10 lg:gap-16">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border-l-2 border-[#27D66B]/40 pl-6 sm:pl-8"
            >
              <p className="text-sm font-medium text-white/50">
                {stat.label}
              </p>

              <p className="mt-4 text-6xl font-extrabold tracking-[-0.06em] text-white lg:text-7xl">
                <StatValue value={stat.value} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
