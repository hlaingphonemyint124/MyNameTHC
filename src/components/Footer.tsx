import { Link } from "react-router-dom";
import { MapPin, Phone, Clock, Leaf, Facebook } from "lucide-react";
import logo from "@/assets/logo.png";

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16 border-t border-border/60 bg-surface-deep/80 backdrop-blur-sm">
      <div className="container py-14 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-5 space-y-5">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img src={logo} alt="My Name THC" className="h-11 w-auto" />
              <div className="flex flex-col -space-y-0.5">
                <span className="font-display text-xl font-semibold tracking-tight text-foreground">
                  My Name THC
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent/80">
                  มายเนมทีเอชซี
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              Premium Thai cannabis, cultivated with intention in Bangkok. Curated strains, lab-tested quality, and a respect for the plant in every harvest.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://line.me/R/ti/p/@674dxgnq"
                target="_blank"
                rel="noreferrer"
                aria-label="LINE"
                className="h-10 w-10 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/50 transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.346 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
              </a>
              <a
                href="https://web.facebook.com/mynamethc"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="h-10 w-10 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/50 transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div className="md:col-span-3">
            <p className="eyebrow mb-5">Explore</p>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="text-foreground/85 hover:text-accent transition-colors">Home</Link></li>
              <li><Link to="/products" className="text-foreground/85 hover:text-accent transition-colors">Strains</Link></li>
              <li><Link to="/about" className="text-foreground/85 hover:text-accent transition-colors">Our Story</Link></li>
              <li><Link to="/contact" className="text-foreground/85 hover:text-accent transition-colors">Visit Us</Link></li>
            </ul>
          </div>

          {/* Visit */}
          <div className="md:col-span-4">
            <p className="eyebrow mb-5">Visit</p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <span>9/10 Hussadhisawee Rd, Chang Phueak, Mueang Chiang Mai, Chiang Mai 50300</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <a href="tel:+66973595888" className="hover:text-accent transition-colors">+66 97 359 5888</a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <span>Daily · 11:00 — 23:00</span>
              </li>
              <li className="flex items-start gap-3">
                <Leaf className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <span>Lab-tested · Adults 21+</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
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