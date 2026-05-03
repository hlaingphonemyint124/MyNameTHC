import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { PageTransition } from '@/components/PageTransition';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EffectIcon } from '@/components/EffectIcon';
import { ArrowLeft, ShieldCheck, Sparkles, Star } from 'lucide-react';
import indicaImg from '@/assets/product-indica.jpg';
import sativaImg from '@/assets/product-sativa.jpg';
import hybridImg from '@/assets/product-hybrid.jpg';
import { useProduct } from '@/hooks/useProducts';

const fallback: Record<string, string> = {
  indica: indicaImg,
  sativa: sativaImg,
  hybrid: hybridImg,
};

const ProductDetail = () => {
  const { id } = useParams();
  const { product, loading, error } = useProduct(id);

  /* ── Loading skeleton ─────────────────────────────────────── */
  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen">
          <Navbar />
          <div className="container pt-32 pb-20">
            <div className="grid md:grid-cols-2 gap-10 lg:gap-16 max-w-6xl mx-auto">
              <div className="aspect-[4/5] bg-muted animate-pulse rounded-2xl" />
              <div className="space-y-4 pt-4">
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                <div className="h-12 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
                <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  /* ── Not found ────────────────────────────────────────────── */
  if (error || !product) {
    return (
      <PageTransition>
        <div className="min-h-screen">
          <Navbar />
          <div className="container pt-32 pb-20 text-center">
            <p className="eyebrow mb-3">404</p>
            <h1 className="font-display text-display-lg mb-6">Product Not Found</h1>
            <Link to="/products">
              <Button variant="premium" size="lg">Back to Products</Button>
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  /* ── Derived values ───────────────────────────────────────── */
  const imgSrc   = product.image_url || fallback[product.category.toLowerCase()] || indicaImg;
  const price    = 800 + Math.round(product.thc * 30);
  const catLower = product.category.toLowerCase();

  // Static classes — Tailwind can see these at build time
  const categoryBadgeClass =
    catLower === 'indica' ? 'bg-purple-500/20 text-purple-200 ring-purple-400/30' :
    catLower === 'sativa' ? 'bg-emerald-500/20 text-emerald-200 ring-emerald-400/30' :
                            'bg-amber-500/20 text-amber-200 ring-amber-400/30';

  const thcBarWidth = `${Math.min(product.thc * 4, 100)}%`;
  const cbdBarWidth = `${Math.min(product.cbd * 10, 100)}%`;

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navbar />

        <div className="container pt-28 md:pt-32 pb-20">

          {/* Back link */}
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-8 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 max-w-6xl mx-auto">

            {/* ── Image ─────────────────────────────────────── */}
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-surface-deep">
              <img
                src={imgSrc}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {/* Top-left badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                <span className={`inline-flex items-center rounded-pill text-[10px] font-semibold uppercase tracking-[0.14em] px-2.5 py-1 ring-1 backdrop-blur-md ${categoryBadgeClass}`}>
                  {product.category}
                </span>
                {product.is_new && (
                  <span className="inline-flex items-center gap-1 rounded-pill bg-accent text-accent-foreground text-[10px] font-semibold uppercase tracking-[0.14em] px-2.5 py-1">
                    <Sparkles className="h-3 w-3" /> New
                  </span>
                )}
                {product.is_popular && (
                  <span className="inline-flex items-center gap-1 rounded-pill bg-foreground/90 text-background text-[10px] font-semibold uppercase tracking-[0.14em] px-2.5 py-1">
                    <Star className="h-3 w-3" /> Popular
                  </span>
                )}
              </div>

              {/* Lab tested */}
              <div className="absolute top-4 right-4 z-10">
                <span
                  className="inline-flex items-center justify-center rounded-full bg-background/70 backdrop-blur-md h-8 w-8 ring-1 ring-border/60"
                  title="Lab Tested"
                >
                  <ShieldCheck className="h-4 w-4 text-accent" />
                </span>
              </div>
            </div>

            {/* ── Info ──────────────────────────────────────── */}
            <div className="flex flex-col gap-6">

              {/* Name + description */}
              <div>
                <p className="eyebrow mb-2">Premium Cannabis</p>
                <h1 className="font-display text-display-lg text-foreground mb-3">
                  {product.name}
                </h1>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="font-display text-3xl font-bold text-accent">
                  ฿{price.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">per unit</span>
              </div>

              {/* THC / CBD — static classes only, no dynamic interpolation */}
              <div className="grid grid-cols-2 gap-4">
                {/* THC */}
                <div className="rounded-xl p-4 bg-accent/10 ring-1 ring-accent/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-accent">THC</span>
                    <span className="font-display text-xl font-bold text-foreground">{product.thc}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all" style={{ width: thcBarWidth }} />
                  </div>
                </div>

                {/* CBD */}
                <div className="rounded-xl p-4 bg-primary/15 ring-1 ring-primary/25">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary-foreground/80">CBD</span>
                    <span className="font-display text-xl font-bold text-foreground">{product.cbd}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: cbdBarWidth }} />
                  </div>
                </div>
              </div>

              {/* Effects */}
              {product.effects && product.effects.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                    Effects
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.effects.map(effect => (
                      <div
                        key={effect}
                        className="flex items-center gap-1.5 rounded-pill bg-card px-3 py-1.5 ring-1 ring-border/60 text-sm text-foreground"
                      >
                        <EffectIcon effect={effect} />
                        {effect}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Aroma */}
              {product.aroma && product.aroma.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                    Aroma
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.aroma.map(v => (
                      <Badge key={v} variant="secondary" className="rounded-pill">{v}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Flavor */}
              {product.flavor && product.flavor.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                    Flavor
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.flavor.map(v => (
                      <Badge key={v} variant="secondary" className="rounded-pill">{v}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* LINE CTA */}
              <div className="mt-auto pt-2">
                <a
                  href="https://line.me/R/ti/p/@674dxgnq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 h-12 w-full rounded-xl bg-[#00B900]/10 text-[#00B900] hover:bg-[#00B900] hover:text-white text-sm font-semibold transition-colors ring-1 ring-[#00B900]/30"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                  Inquire on LINE
                </a>
              </div>

            </div>
          </div>
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default ProductDetail;
