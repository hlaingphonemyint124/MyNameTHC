import { Link } from "react-router-dom";
import { MapPin, Phone, Clock, Leaf, Facebook } from "lucide-react";
import logo from "@/assets/logo.png";

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16 border-t border-border/60 bg-surface-deep/80 backdrop-blur-sm">
      <div className="container py-12 md:py-16">

        {/* Main grid — stacks on mobile, 3 cols on md+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-10">

          {/* Brand — full width on mobile, 5 cols on md */}
          <div className="sm:col-span-2 md:col-span-5 space-y-5">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img src={logo} alt="My Name THC" className="h-10 w-auto" />
              <div className="flex flex-col -space-y-0.5">
                <span className="font-display text-lg font-semibold tracking-tight text-foreground">
                  My Name THC
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent/80">
                  มายเนมทีเอชซี
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Premium Thai cannabis, cultivated with intention in Bangkok. Curated strains,
              lab-tested quality, and a respect for the plant in every harvest.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://line.me/R/ti/p/@674dxgnq"
                target="_blank" rel="noreferrer" aria-label="LINE"
                className="h-10 w-10 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/50 transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.346 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
              </a>
              <a
                href="https://web.facebook.com/mynamethc"
                target="_blank" rel="noreferrer" aria-label="Facebook"
                className="h-10 w-10 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/50 transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Explore — 1 col on sm, 3 cols on md */}
          <div className="md:col-span-3">
            <p className="eyebrow mb-4">Explore</p>
            <ul className="space-y-3 text-sm">
              {[
                { to: "/", label: "Home" },
                { to: "/products", label: "Strains" },
                { to: "/about", label: "Our Story" },
                { to: "/contact", label: "Visit Us" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-foreground/85 hover:text-accent transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Visit — 1 col on sm, 4 cols on md */}
          <div className="md:col-span-4">
            <p className="eyebrow mb-4">Visit</p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {[
                {
                  icon: <MapPin className="h-4 w-4 text-accent mt-0.5 shrink-0" />,
                  content: "9/10 Hussadhisawee Rd, Chang Phueak, Mueang Chiang Mai 50300",
                },
                {
                  icon: <Phone className="h-4 w-4 text-accent mt-0.5 shrink-0" />,
                  content: "+66 97 359 5888",
                  href: "tel:+66973595888",
                },
                {
                  icon: <Clock className="h-4 w-4 text-accent mt-0.5 shrink-0" />,
                  content: "Daily · 11:00 — 23:00",
                },
                {
                  icon: <Leaf className="h-4 w-4 text-accent mt-0.5 shrink-0" />,
                  content: "Lab-tested · Adults 21+",
                },
              ].map(({ icon, content, href }, i) => (
                <li key={i} className="flex items-start gap-3">
                  {icon}
                  {href ? (
                    <a href={href} className="hover:text-accent transition-colors break-words">{content}</a>
                  ) : (
                    <span className="break-words">{content}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-xs text-muted-foreground">
            © {year} My Name THC. All rights reserved.
          </p>
          <p className="text-[11px] text-muted-foreground/80 uppercase tracking-[0.18em]">
            Compliant with Thai cannabis regulations · 21+
          </p>
        </div>
      </div>
    </footer>
  );
};
