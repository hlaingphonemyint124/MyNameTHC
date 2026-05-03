import { MapPin, Clock, Phone, MessageCircle, ArrowUpRight } from "lucide-react";

export const VisitUs = () => {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Soft gold radial background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          background:
            "radial-gradient(60% 60% at 80% 20%, hsl(var(--accent) / 0.45), transparent 70%), radial-gradient(50% 50% at 10% 90%, hsl(var(--primary) / 0.4), transparent 70%)",
        }}
      />

      <div className="container relative">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14 items-stretch">
          {/* Left: copy + details */}
          <div className="lg:col-span-5 flex flex-col justify-center reveal">
            <p className="eyebrow mb-4 inline-flex items-center gap-3 before:content-[''] before:w-8 before:h-px before:bg-accent">
              Visit Our Store
            </p>
            <h2 className="font-display text-display-lg text-foreground mb-5 leading-[1.05]">
              Come find us in <span className="text-accent">Bangkok</span>.
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-10 max-w-md">
              Step inside My Name THC for a guided tour of our curated strains.
              Our team is here to help you discover the perfect match.
            </p>

            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <span className="shrink-0 h-11 w-11 rounded-full bg-accent/10 ring-1 ring-accent/25 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-accent" strokeWidth={2.25} />
                </span>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-0.5">
                    Address
                  </p>
                  <p className="text-foreground font-medium">9/10 Hussadhisawee Rd, Chang Phueak, Mueang Chiang Mai, Chiang Mai 50300</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="shrink-0 h-11 w-11 rounded-full bg-accent/10 ring-1 ring-accent/25 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-accent" strokeWidth={2.25} />
                </span>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-0.5">
                    Hours
                  </p>
                  <p className="text-foreground font-medium">Daily · 11:00 — 23:00</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="shrink-0 h-11 w-11 rounded-full bg-accent/10 ring-1 ring-accent/25 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-accent" strokeWidth={2.25} />
                </span>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-0.5">
                    Phone
                  </p>
                  <a href="tel:+66973595888" className="text-foreground font-medium hover:text-accent transition-colors">
                    +66 97 359 5888
                  </a>
                </div>
              </li>
            </ul>

            <div className="flex flex-wrap gap-3 mt-10">
              <a
                href="https://line.me/R/ti/p/@674dxgnq"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-[#00B900] text-white font-semibold text-sm hover:bg-[#00a300] transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Chat on LINE
              </a>
              <a
                href="https://maps.app.goo.gl/ovTDkuM2YpU1w7aa7"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border border-border hover:border-accent text-foreground hover:text-accent font-semibold text-sm transition-colors"
              >
                Get Directions
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Right: map */}
          <div className="lg:col-span-7 reveal">
            <div className="relative rounded-2xl overflow-hidden border border-border/60 shadow-2xl aspect-[4/3] lg:aspect-auto lg:h-full min-h-[420px] bg-surface">
              <iframe
                title="My Name THC Chiang Mai Location"
                src="https://maps.google.com/maps?q=9/10+Hussadhisawee+Rd,+Chang+Phueak,+Mueang+Chiang+Mai,+Chiang+Mai+50300&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "grayscale(0.35) contrast(1.05)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              />
              {/* Subtle frame glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-accent/20"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};