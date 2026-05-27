"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Sprout, FlaskConical, ShieldCheck, Award } from "lucide-react";

// ─── PHOTO ROUTES ────────────────────────────────────────────────────────────
// The paths below assume you have moved your images into the "public" folder.
// A leading slash "/" points directly to the root of the "public" folder.
// ─────────────────────────────────────────────────────────────────────────────

const steps = [
  {
    icon: Sprout,
    title: "Hand-Cultivated",
    desc: "Small-batch indoor grows in Bangkok with strict environmental controls.",
    photo:"src/assets/hand_cultivated_no_text.png",
  },
  {
    icon: Award,
    title: "Slow-Cured",
    desc: "Traditional curing for 21+ days to preserve terpenes and aroma.",
    photo: "src/assets/slow_cured_3.png", 
  },
  {
    icon: FlaskConical,
    title: "Lab Tested",
    desc: "Third-party potency and purity testing on every harvest.",
    photo: "src/assets/lab_tested_3.png", 
  },
  {
    icon: ShieldCheck,
    title: "Compliant",
    desc: "Fully licensed under Thai Ministry of Public Health regulations.",
    photo: "src/assets/compliant_no_text.png", 
  },
];

const SLIDE_DURATION = 4000; // ms per photo before advancing

export const ProcessStrip = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  const goToStep = useCallback((step: number) => {
    cancelAnimationFrame(rafRef.current);
    setActiveStep(step);
    setProgress(0);
    startTimeRef.current = null;
  }, []);

  useEffect(() => {
    const animate = (ts: number) => {
      if (!startTimeRef.current) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current;
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(pct);

      if (elapsed >= SLIDE_DURATION) {
        startTimeRef.current = null;
        // Advance to the next main step
        setActiveStep((prevStep) => (prevStep + 1) % steps.length);
        return;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [activeStep]); 

  return (
    <section className="relative py-20 md:py-28 border-y border-border/40 bg-surface/30">
      {/* Background glow */}
      <div className="absolute inset-0 bg-noise opacity-[0.04] pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-accent/[0.04] blur-3xl" />
      </div>

      <div className="container relative">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20 reveal">
          <span className="text-eyebrow text-accent">Our Process</span>
          <h2 className="font-display text-display-lg mt-4 text-foreground">
            From <span className="italic text-accent">seed</span> to shelf
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
            Every flower is grown, cured, and tested with intention — so what
            reaches you is consistently exceptional.
          </p>
        </div>

        {/* Carousel wrapper */}
        <div className="rounded-2xl overflow-hidden border border-border/40 shadow-[0_20px_60px_-30px_hsl(var(--accent)/0.25)]">

          {/* ── Photo area ── */}
          <div className="relative w-full h-[340px] md:h-[420px] bg-black overflow-hidden">
            {steps.map((step, si) => (
              <img
                key={si}
                src={step.photo}
                alt={`${step.title} process photo`}
                className={[
                  "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
                  activeStep === si ? "opacity-100" : "opacity-0",
                ].join(" ")}
              />
            ))}

            {/* Subtle dark overlay at bottom for tab readability */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
          </div>

          {/* ── Tabs ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 divide-border/40 bg-border/40 gap-px">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isActive = activeStep === i;

              return (
                <button
                  key={step.title}
                  onClick={() => goToStep(i)}
                  className={[
                    "process-step group relative text-left bg-background transition-colors duration-500 p-5 sm:p-6 md:p-8",
                    isActive ? "bg-surface/60" : "hover:bg-surface/60",
                  ].join(" ")}
                >
                  {/* Progress bar on top edge */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-border/30">
                    <div
                      className="h-full bg-accent transition-none"
                      style={{ width: isActive ? `${progress}%` : "0%" }}
                    />
                  </div>

                  {/* Hover gold sweep */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.04] to-transparent" />
                  </div>

                  <div className="flex flex-col h-full">
                    {/* Icon + number row */}
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className={[
                          "process-icon flex items-center justify-center w-12 h-12 rounded-xl border transition-all duration-500",
                          isActive
                            ? "bg-accent/20 border-accent/50 scale-110 -rotate-6"
                            : "bg-accent/10 border-accent/20 group-hover:bg-accent/20 group-hover:border-accent/50 group-hover:scale-110 group-hover:-rotate-6",
                        ].join(" ")}
                      >
                        <Icon
                          className={[
                            "h-5 w-5 text-accent transition-transform duration-500",
                            isActive ? "scale-110" : "",
                          ].join(" ")}
                        />
                      </div>
                      <span
                        className={[
                          "text-xs font-mono tracking-widest transition-colors duration-500",
                          isActive
                            ? "text-accent/80"
                            : "text-muted-foreground/60 group-hover:text-accent/80",
                        ].join(" ")}
                      >
                        0{i + 1}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className={[
                        "font-display text-xl md:text-2xl font-semibold mb-2 transition-colors duration-500",
                        isActive
                          ? "text-accent"
                          : "text-foreground group-hover:text-accent",
                      ].join(" ")}
                    >
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {step.desc}
                    </p>

                    {/* Connector dot */}
                    <div
                      className={[
                        "mt-5 flex items-center gap-2 transition-opacity duration-500",
                        isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "h-px bg-accent/40 transition-all duration-500",
                          isActive ? "w-10" : "w-6 group-hover:w-10",
                        ].join(" ")}
                      />
                      <span
                        className={[
                          "h-1.5 w-1.5 rounded-full bg-accent/60 transition-all duration-500",
                          isActive
                            ? "bg-accent shadow-[0_0_10px_hsl(var(--accent))]"
                            : "group-hover:bg-accent group-hover:shadow-[0_0_10px_hsl(var(--accent))]",
                        ].join(" ")}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};