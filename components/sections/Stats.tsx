"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 500, suffix: "+", label: "Aktif Sporcu" },
  { value: 200, suffix: "+", label: "Etkinlik" },
  { value: 15, suffix: "+", label: "Branş" },
  { value: 1000, suffix: "+", label: "Katılım" },
];

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

export default function Stats() {
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

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[28px] border border-white/10 bg-white/10 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex min-h-48 flex-col justify-between bg-[#111111] p-6 sm:min-h-56 sm:p-8"
            >
              <p className="text-sm font-medium text-white/50">{stat.label}</p>

              <p className="text-5xl font-extrabold tracking-[-0.06em] text-white sm:text-6xl">
                <Counter value={stat.value} />
                <span className="text-[#27D66B]">{stat.suffix}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}