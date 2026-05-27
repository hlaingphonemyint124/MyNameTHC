import { MapPin, Clock, Phone, MessageCircle, ArrowUpRight } from "lucide-react";

export const VisitUs = () => {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          background:
            "radial-gradient(60% 60% at 80% 20%, hsl(var(--accent) / 0.45), transparent 70%), radial-gradient(50% 50% at 10% 90%, hsl(var(--primary) / 0.4), transparent 70%)",
        }}
      />

      <div className="container relative">
        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-14 lg:items-stretch gap-8">

          {/* Left: copy + details */}
          <div className="lg:col-span-5 flex flex-col justify-center reveal">
            <p className="eyebrow mb-4 inline-flex items-center gap-3 before:content-[''] before:w-8 before:h-px before:bg-accent">
              Visit Our Store
            </p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-foreground mb-4 leading-[1.05]">
              Come find us in{" "}
              <span className="text-accent">Chiang Mai</span>.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-md">
              Step inside My Name THC for a guided tour of our curated strains.
              Our team is here to help you discover the perfect match.
            </p>

            <ul className="space-y-4">
              {[
                {
                  icon: <MapPin className="h-4 w-4 text-accent" strokeWidth={2.25} />,
                  label: "Address",
                  content: "9/10 Hussadhisawee Rd, Chang Phueak, Mueang Chiang Mai, Chiang Mai 50300",
                },
                {
                  icon: <Clock className="h-4 w-4 text-accent" strokeWidth={2.25} />,
                  label: "Hours",
                  content: "Daily · 11:00 — 23:00",
                },
                {
                  icon: <Phone className="h-4 w-4 text-accent" strokeWidth={2.25} />,
                  label: "Phone",
                  content: "+66 97 359 5888",
                  href: "tel:+66973595888",
                },
              ].map(({ icon, label, content, href }) => (
                <li key={label} className="flex items-start gap-3">
                  <span className="shrink-0 h-10 w-10 rounded-full bg-accent/10 ring-1 ring-accent/25 flex items-center justify-center mt-0.5">
                    {icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-0.5">
                      {label}
                    </p>
                    {href ? (
                      <a href={href} className="text-foreground font-medium hover:text-accent transition-colors break-words">
                        {content}
                      </a>
                    ) : (
                      <p className="text-foreground font-medium break-words">{content}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <a
                href="https://line.me/R/ti/p/@674dxgnq"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-[#00B900] text-white font-semibold text-sm hover:bg-[#00a300] transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Chat on LINE
              </a>
              <a
                href="https://maps.app.goo.gl/ovTDkuM2YpU1w7aa7"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg border border-border hover:border-accent text-foreground hover:text-accent font-semibold text-sm transition-colors"
              >
                Get Directions
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Right: map */}
          <div className="lg:col-span-7 reveal">
            <div className="relative rounded-2xl overflow-hidden border border-border/60 shadow-2xl w-full"
              style={{ aspectRatio: "4/3", minHeight: "280px" }}>
              <iframe
                title="My Name THC Chiang Mai Location"
                src="https://maps.google.com/maps?q=9/10+Hussadhisawee+Rd,+Chang+Phueak,+Mueang+Chiang+Mai,+Chiang+Mai+50300&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "grayscale(0.35) contrast(1.05)", position: "absolute", inset: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-accent/20" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
