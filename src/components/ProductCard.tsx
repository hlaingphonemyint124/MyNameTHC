import { Link } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";
type Product = Database["public"]["Tables"]["products"]["Row"];
import indicaImg from "@/assets/product-indica.jpg";
import sativaImg from "@/assets/product-sativa.jpg";
import hybridImg from "@/assets/product-hybrid.jpg";
import { Sparkles, Star, ShieldCheck, ArrowUpRight } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

const imageMap: Record<string, string> = {
  indica: indicaImg,
  sativa: sativaImg,
  hybrid: hybridImg,
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const getFallbackImage = () => {
    const category = product.category.toLowerCase();
    return imageMap[category] || indicaImg;
  };

  const price = 800 + Math.round(product.thc * 30);

  const categoryColor =
    product.category.toLowerCase() === "indica"
      ? "bg-purple-500/20 text-purple-200 ring-purple-400/30"
      : product.category.toLowerCase() === "sativa"
      ? "bg-emerald-500/20 text-emerald-200 ring-emerald-400/30"
      : "bg-amber-500/20 text-amber-200 ring-amber-400/30";

  return (
    <Link
      to={`/products/${product.id}`}
      className="group relative overflow-hidden rounded-2xl bg-gradient-card border border-border/60 hover:border-accent/40 flex flex-col h-full transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_hsl(var(--accent)/0.45)]"
    >
      {/* Portrait 4:5 image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-deep">
        <img
          src={product.image_url || getFallbackImage()}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
        />
        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className={`inline-flex items-center gap-1 rounded-pill text-[10px] font-semibold uppercase tracking-[0.14em] px-2.5 py-1 ring-1 backdrop-blur-md ${categoryColor}`}>
            {product.category}
          </span>
          {product.is_new && (
            <span className="inline-flex items-center gap-1 rounded-pill bg-accent text-accent-foreground text-[10px] font-semibold uppercase tracking-[0.14em] px-2.5 py-1 shadow-sm">
              <Sparkles className="h-3 w-3" strokeWidth={2.5} />New
            </span>
          )}
          {product.is_popular && (
            <span className="inline-flex items-center gap-1 rounded-pill bg-foreground/90 text-background text-[10px] font-semibold uppercase tracking-[0.14em] px-2.5 py-1 shadow-sm">
              <Star className="h-3 w-3" strokeWidth={2.5} />Popular
            </span>
          )}
        </div>

        {/* Lab tested */}
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center justify-center rounded-full bg-background/70 backdrop-blur-md h-7 w-7 ring-1 ring-border/60" title="Lab Tested">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" strokeWidth={2.25} />
          </span>
        </div>

        {/* Price + view */}
        <div className="absolute inset-x-3 bottom-3 z-10 flex items-end justify-between gap-2">
          <span className="rounded-pill bg-background/85 backdrop-blur-md text-accent font-display text-base font-bold px-3 py-1 ring-1 ring-border/60">
            ฿{price.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1 rounded-pill bg-accent text-accent-foreground text-[10px] font-semibold uppercase tracking-[0.14em] px-2.5 py-1 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            View <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} />
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2.5 p-3 sm:p-5 flex-1">
        <h3 className="font-display text-sm sm:text-base md:text-lg font-semibold leading-tight text-foreground group-hover:text-accent transition-colors">
          {product.name}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* THC / CBD bars */}
        <div className="flex gap-2 pt-1 mt-auto">
          <div className="flex-1 rounded-lg bg-accent/10 ring-1 ring-accent/20 px-3 py-1.5">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em]">
              <span className="text-accent">THC</span>
              <span className="text-foreground tabular-nums">{product.thc}%</span>
            </div>
            <div className="mt-1 h-1 rounded-pill bg-foreground/10 overflow-hidden">
              <div className="h-full bg-accent rounded-pill" style={{ width: `${Math.min(product.thc * 3, 100)}%` }} />
            </div>
          </div>
          <div className="flex-1 rounded-lg bg-primary/15 ring-1 ring-primary/25 px-3 py-1.5">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em]">
              <span className="text-primary-foreground/80">CBD</span>
              <span className="text-foreground tabular-nums">{product.cbd}%</span>
            </div>
            <div className="mt-1 h-1 rounded-pill bg-foreground/10 overflow-hidden">
              <div className="h-full bg-primary rounded-pill" style={{ width: `${Math.min(product.cbd * 10, 100)}%` }} />
            </div>
          </div>
        </div>

        {/* LINE button — stops propagation so it doesn't trigger the Link */}
        <a
          href="https://line.me/R/ti/p/@674dxgnq"
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          aria-label="Contact on LINE"
          className="inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-[#00B900]/10 text-[#00B900] hover:bg-[#00B900] hover:text-white text-xs font-semibold uppercase tracking-[0.14em] transition-colors ring-1 ring-[#00B900]/30"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
          </svg>
          Inquire on LINE
        </a>
      </div>
    </Link>
  );
};
