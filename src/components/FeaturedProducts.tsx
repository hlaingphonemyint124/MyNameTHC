import { useState, useEffect, useRef, useCallback } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Star,
  ShieldCheck,
  Leaf,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import indicaImg from '@/assets/product-indica.jpg';
import sativaImg from '@/assets/product-sativa.jpg';
import hybridImg from '@/assets/product-hybrid.jpg';

const imageMap: Record<string, string> = {
  indica: indicaImg,
  sativa: sativaImg,
  hybrid: hybridImg,
};

const categoryConfig: Record<string, {
  badge: string;
  dot: string;
  bar: string;
  topLine: string;
  glow: string;
  accentText: string;
  glowBg: string;
}> = {
  indica: {
    badge: 'bg-purple-500/10 text-purple-200 ring-1 ring-purple-400/20',
    dot: 'bg-purple-400',
    bar: 'bg-purple-400',
    topLine: 'from-purple-500/0 via-purple-400/70 to-purple-500/0',
    glow: 'shadow-[0_0_60px_-10px_hsl(270_60%_40%/0.5)]',
    accentText: 'text-purple-300',
    glowBg: 'hsl(270 60% 35% / 0.12)',
  },
  sativa: {
    badge: 'bg-emerald-500/10 text-emerald-200 ring-1 ring-emerald-400/20',
    dot: 'bg-emerald-400',
    bar: 'bg-emerald-400',
    topLine: 'from-emerald-500/0 via-emerald-400/70 to-emerald-500/0',
    glow: 'shadow-[0_0_60px_-10px_hsl(145_50%_35%/0.5)]',
    accentText: 'text-emerald-300',
    glowBg: 'hsl(145 50% 25% / 0.12)',
  },
  hybrid: {
    badge: 'bg-[hsl(45_88%_55%/0.12)] text-[hsl(45_88%_82%)] ring-1 ring-[hsl(45_88%_55%/0.2)]',
    dot: 'bg-[hsl(var(--accent))]',
    bar: 'bg-[hsl(var(--accent))]',
    topLine: 'from-[hsl(45_88%_55%/0)] via-[hsl(45_88%_55%/0.7)] to-[hsl(45_88%_55%/0)]',
    glow: 'shadow-[0_0_60px_-10px_hsl(45_88%_55%/0.4)]',
    accentText: 'text-[hsl(var(--accent))]',
    glowBg: 'hsl(45 88% 55% / 0.08)',
  },
};

export const FeaturedProducts = () => {
  const { products, loading } = useProducts({ featured: true, limit: 6, realtime: true });
  const navigate = useNavigate();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isFlipped, setIsFlipped]     = useState(false);
  const [activeBg, setActiveBg]       = useState('');

  const sectionRef = useRef<HTMLElement>(null);
  const touchStart = useRef<number | null>(null);

  // Scroll reveal
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => e.target.classList.toggle('in-view', e.isIntersecting)),
      { threshold: 0.15 }
    );
    el.querySelectorAll('.reveal').forEach(node => obs.observe(node));
    return () => obs.disconnect();
  }, [loading]);

  // Sync ambient glow color
  useEffect(() => {
    if (!products[activeIndex]) return;
    const cat = products[activeIndex].category.toLowerCase();
    setActiveBg((categoryConfig[cat] || categoryConfig.hybrid).glowBg);
  }, [activeIndex, products]);

  const goTo = useCallback((index: number) => {
    setIsFlipped(false);
    setActiveIndex(index);
  }, []);

  const goNext = useCallback(() => {
    goTo((activeIndex + 1) % products.length);
  }, [activeIndex, products.length, goTo]);

  const goPrev = useCallback(() => {
    goTo((activeIndex - 1 + products.length) % products.length);
  }, [activeIndex, products.length, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="py-20 md:py-28 bg-[hsl(var(--surface-deep))]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-14 flex justify-between items-end">
            <div className="space-y-3">
              <div className="h-3 w-28 skeleton rounded-full" />
              <div className="h-10 w-52 skeleton rounded-xl" />
            </div>
            <div className="h-9 w-20 skeleton rounded-xl" />
          </div>
          <div className="flex justify-center gap-6 overflow-hidden py-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-[318px] h-[500px] skeleton rounded-3xl shrink-0 border border-[hsl(var(--border))]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-28 relative overflow-hidden bg-[hsl(var(--surface-deep))] text-[hsl(var(--foreground))]"
    >
      <style>{`
        .fp-perspective { perspective: 1400px; }
        .fp-card-wrap   { perspective: 1200px; transform-style: preserve-3d; }
        .fp-inner {
          transform-style: preserve-3d;
          transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .fp-inner.flipped { transform: rotateY(180deg); }
        .fp-face {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          position: absolute;
          inset: 0;
          border-radius: 1.5rem;
          overflow: hidden;
        }
        .fp-back { transform: rotateY(180deg); }
        .fp-bar-animated {
          transition: width 0.9s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .fp-desaturate {
          filter: saturate(0.35) blur(0.5px);
          transition: filter 0.4s ease;
        }
      `}</style>

      {/* Dynamic ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 60%, ${activeBg}, transparent 70%)`,
        }}
      />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full bg-[hsl(var(--accent)/0.03)] blur-[100px]" />
      </div>
      <div className="absolute inset-0 bg-noise opacity-[0.025] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">

        {/* Section header */}
        <div className="flex items-end justify-between mb-14 md:mb-20 gap-6 reveal">
          <div className="space-y-2.5">
            <p className="eyebrow text-[11px] tracking-[0.3em] flex items-center gap-2">
              <Leaf className="h-3 w-3 opacity-70" />
              Curated Selection
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] font-normal leading-[1.05] tracking-tight">
              Featured{' '}
              <span className="italic text-[hsl(var(--accent))]">Strains</span>
            </h2>
          </div>

          <Button
            variant="ghost"
            onClick={() => navigate('/products')}
            className="group text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.5)] shrink-0 text-sm font-medium tracking-wide rounded-xl border border-[hsl(var(--border)/0.6)] hover:border-[hsl(var(--border))] transition-all"
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* 3D Carousel */}
        <div
          className="fp-perspective relative w-full h-[520px] md:h-[560px] flex items-center justify-center select-none overflow-visible reveal"
          style={{ transitionDelay: '120ms' }}
          onTouchStart={e => { touchStart.current = e.touches[0].clientX; }}
          onTouchEnd={e => {
            if (touchStart.current === null) return;
            const delta = e.changedTouches[0].clientX - touchStart.current;
            if (Math.abs(delta) > 50) delta < 0 ? goNext() : goPrev();
            touchStart.current = null;
          }}
        >
          {products.map((product, index) => {
            const category = product.category.toLowerCase();
            const cfg = categoryConfig[category] || categoryConfig.hybrid;
            const price = 800 + Math.round(product.thc * 30);
            const fallback = imageMap[category] || indicaImg;

            let offset = index - activeIndex;
            if (offset < -Math.floor(products.length / 2)) offset += products.length;
            if (offset > Math.floor(products.length / 2)) offset -= products.length;

            const isCenter  = offset === 0;
            const isVisible = Math.abs(offset) <= 2;
            if (!isVisible) return null;

            type PosKey = 0 | 1 | -1 | 2 | -2;
            const posMap: Record<PosKey, { tx: string; scale: number; ry: number; z: number; op: number }> = {
               0: { tx: '0%',     scale: 1.04, ry:   0, z: 30, op: 1    },
               1: { tx: '106%',   scale: 0.87, ry: -10, z: 20, op: 0.55 },
              [-1]:{ tx: '-106%', scale: 0.87, ry:  10, z: 20, op: 0.55 },
               2: { tx: '205%',   scale: 0.74, ry: -18, z: 10, op: 0.15 },
              [-2]:{ tx: '-205%', scale: 0.74, ry:  18, z: 10, op: 0.15 },
            };
            const p = posMap[offset as PosKey] ?? posMap[0];

            return (
              <div
                key={product.id}
                className="absolute w-[290px] sm:w-[318px] md:w-[348px] h-[470px] sm:h-[500px] md:h-[530px] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
                style={{
                  transform: `translateX(${p.tx}) scale(${p.scale}) rotateY(${p.ry}deg)`,
                  zIndex: p.z,
                  opacity: p.op,
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  if (isCenter) {
                    setIsFlipped(prev => !prev);
                  } else {
                    if (offset > 0) goNext();
                    else goPrev();
                  }
                }}
              >
                {/* Depth-of-field desaturation on side cards */}
                {!isCenter && (
                  <div className="absolute inset-0 rounded-3xl fp-desaturate pointer-events-none z-40" style={{ borderRadius: '1.5rem' }} />
                )}

                <div className="fp-card-wrap w-full h-full">
                  <div className={`fp-inner w-full h-full relative ${isCenter && isFlipped ? 'flipped' : ''}`}>

                    {/* ══ CARD FRONT ══ */}
                    <div className={`fp-face border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))] ${isCenter ? cfg.glow : ''}`}>
                      <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${cfg.topLine} z-20`} />

                      <img
                        src={product.image_url || fallback}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover img-treatment"
                        loading="lazy"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/10 pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-transparent pointer-events-none" />

                      {/* Top row */}
                      <div className="relative z-10 p-5 flex items-start justify-between">
                        <div className="flex flex-col gap-1.5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1.5 backdrop-blur-md ${cfg.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
                            {product.category}
                          </span>
                          {product.is_new && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] text-[10px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 shadow-sm">
                              <Sparkles className="h-3 w-3" />New
                            </span>
                          )}
                          {product.is_popular && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 text-black text-[10px] font-bold uppercase tracking-[0.18em] px-2.5 py-1">
                              <Star className="h-3 w-3 fill-current" />Popular
                            </span>
                          )}
                        </div>
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full ring-1 ring-white/10 bg-black/40 backdrop-blur-md" title="Lab Certified">
                          <ShieldCheck className="h-4 w-4 text-[hsl(var(--accent))]" strokeWidth={2.5} />
                        </span>
                      </div>

                      {/* Bottom info */}
                      <div className="absolute bottom-0 inset-x-0 z-10 p-5 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">THC</span>
                          <span className={`text-xs font-mono font-bold ${cfg.accentText}`}>{product.thc}%</span>
                          <div className="flex-1 h-px bg-white/10" />
                        </div>
                        <div className="flex items-end justify-between gap-3">
                          <h3 className="font-display text-xl md:text-2xl font-normal tracking-tight text-white leading-tight line-clamp-2 flex-1">
                            {product.name}
                          </h3>
                          <span className="shrink-0 rounded-lg bg-black/70 backdrop-blur-md text-[hsl(var(--accent))] font-display text-sm font-bold px-3 py-1.5 ring-1 ring-white/10">
                            ฿{price.toLocaleString()}
                          </span>
                        </div>
                        {isCenter && (
                          <p className="text-[9px] uppercase tracking-[0.22em] text-white/30 text-center pt-1">
                            Tap to flip
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ══ CARD BACK ══ */}
                    <div className={`fp-face fp-back border border-[hsl(var(--border)/0.6)] bg-gradient-to-b from-[hsl(var(--card))] to-[hsl(var(--surface-deep))] p-6 flex flex-col justify-between ${isCenter ? cfg.glow : ''}`}>
                      <div className="absolute inset-0 opacity-[0.025] pointer-events-none bg-[radial-gradient(hsl(var(--foreground))_1px,transparent_1px)] [background-size:18px_18px]" />
                      <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${cfg.topLine} z-20`} />

                      {/* Header */}
                      <div className="relative z-10 flex flex-col gap-3">
                        <div className="flex items-center justify-between pt-1">
                          <span className={`text-[10px] font-bold uppercase tracking-[0.22em] ${cfg.accentText}`}>
                            {product.category} Strain
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
                            className="text-[9px] uppercase font-bold tracking-[0.18em] text-[hsl(var(--muted-foreground)/0.6)] bg-[hsl(var(--muted)/0.5)] px-2 py-0.5 rounded border border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--muted))] transition-colors"
                          >
                            ← Back
                          </button>
                        </div>

                        <div>
                          <h3 className="font-display text-2xl font-normal text-[hsl(var(--foreground))] leading-tight line-clamp-1 mb-1">
                            {product.name}
                          </h3>
                          <p className="text-[13px] text-[hsl(var(--muted-foreground))] leading-relaxed line-clamp-4">
                            {product.description}
                          </p>
                        </div>

                        {/* Effect tags */}
                        {'effects' in product && Array.isArray((product as any).effects) && (product as any).effects.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {((product as any).effects as string[]).slice(0, 3).map((effect: string) => (
                              <span
                                key={effect}
                                className="rounded-full bg-[hsl(var(--muted)/0.7)] border border-[hsl(var(--border)/0.6)] text-[hsl(var(--muted-foreground))] text-[10px] font-medium tracking-wide px-2.5 py-0.5"
                              >
                                {effect}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Cannabinoid bars */}
                      <div className="relative z-10 space-y-2.5">
                        <div className="rounded-xl bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border)/0.5)] px-3.5 py-2.5">
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] mb-1.5">
                            <span className={cfg.accentText}>THC</span>
                            <span className="text-[hsl(var(--foreground))] font-mono">{product.thc}%</span>
                          </div>
                          <div className="h-1 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                            <div
                              className={`fp-bar-animated h-full rounded-full ${cfg.bar}`}
                              style={{ width: (isCenter && isFlipped) ? `${Math.min(product.thc * 3.3, 100)}%` : '0%' }}
                            />
                          </div>
                        </div>

                        <div className="rounded-xl bg-[hsl(var(--muted)/0.25)] border border-[hsl(var(--border)/0.4)] px-3.5 py-2.5">
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] mb-1.5">
                            <span className="text-[hsl(var(--muted-foreground))]">CBD</span>
                            <span className="text-[hsl(var(--foreground))] font-mono">{product.cbd}%</span>
                          </div>
                          <div className="h-1 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                            <div
                              className="fp-bar-animated h-full rounded-full bg-[hsl(var(--muted-foreground)/0.45)]"
                              style={{ width: (isCenter && isFlipped) ? `${Math.min(product.cbd * 10, 100)}%` : '0%' }}
                            />
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              </div>
            );
          })}

          {/* Prev / Next arrows */}
          <button
            onClick={goPrev}
            aria-label="Previous strain"
            className="absolute left-0 md:-left-4 z-40 h-10 w-10 rounded-full bg-[hsl(var(--card)/0.8)] backdrop-blur-md border border-[hsl(var(--border)/0.6)] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--accent)/0.5)] hover:bg-[hsl(var(--card))] transition-all flex items-center justify-center shadow-lg"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goNext}
            aria-label="Next strain"
            className="absolute right-0 md:-right-4 z-40 h-10 w-10 rounded-full bg-[hsl(var(--card)/0.8)] backdrop-blur-md border border-[hsl(var(--border)/0.6)] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--accent)/0.5)] hover:bg-[hsl(var(--card))] transition-all flex items-center justify-center shadow-lg"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="mt-8 flex justify-center relative z-20 reveal" style={{ transitionDelay: '200ms' }}>
          <div className="flex items-center gap-2">
            {products.map((p, i) => (
              <button
                key={p.id}
                onClick={() => goTo(i)}
                aria-label={`Go to ${p.name}`}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'w-8 h-1.5 bg-[hsl(var(--accent))]'
                    : 'w-1.5 h-1.5 bg-[hsl(var(--border))] hover:bg-[hsl(var(--muted-foreground)/0.5)]'
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};