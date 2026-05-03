import { Sprout, FlaskConical, ShieldCheck, Award } from "lucide-react";

const steps = [
  {
    icon: Sprout,
    title: "Hand-Cultivated",
    desc: "Small-batch indoor grows in Bangkok with strict environmental controls.",
  },
  {
    icon: Award,
    title: "Slow-Cured",
    desc: "Traditional curing for 21+ days to preserve terpenes and aroma.",
  },
  {
    icon: FlaskConical,
    title: "Lab Tested",
    desc: "Third-party potency and purity testing on every harvest.",
  },
  {
    icon: ShieldCheck,
    title: "Compliant",
    desc: "Fully licensed under Thai Ministry of Public Health regulations.",
  },
];

export const ProcessStrip = () => {
  return (
    <section className="relative py-20 md:py-28 border-y border-border/40 bg-surface/30">
      <div className="absolute inset-0 bg-noise opacity-[0.04] pointer-events-none" />
      {/* Soft gold radial glow */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-accent/[0.04] blur-3xl" />
      </div>
      <div className="container relative">
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20 reveal">
          <span className="text-eyebrow text-accent">Our Process</span>
          <h2 className="font-display text-display-lg mt-4 text-foreground">
            From <span className="italic text-accent">seed</span> to shelf
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
            Every flower is grown, cured, and tested with intention — so what reaches you is consistently exceptional.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border/40 rounded-2xl overflow-hidden border border-border/40 shadow-[0_20px_60px_-30px_hsl(var(--accent)/0.25)]">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="process-step group relative bg-background hover:bg-surface/60 transition-colors duration-500 p-6 md:p-8 reveal"
                style={{ transitionDelay: `${i * 120}ms`, animationDelay: `${i * 120}ms` }}
              >
                {/* Hover gold sweep */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.04] to-transparent" />
                </div>

                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="process-icon flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 group-hover:bg-accent/20 group-hover:border-accent/50 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                      <Icon className="h-5 w-5 text-accent transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground/60 tracking-widest group-hover:text-accent/80 transition-colors duration-500">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-2 group-hover:text-accent transition-colors duration-500">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>

                  {/* Animated connector dot bottom */}
                  <div className="mt-5 flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="h-px w-6 bg-accent/40 group-hover:w-10 transition-all duration-500" />
                    <span className="h-1.5 w-1.5 rounded-full bg-accent/60 group-hover:bg-accent group-hover:shadow-[0_0_10px_hsl(var(--accent))] transition-all duration-500" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};