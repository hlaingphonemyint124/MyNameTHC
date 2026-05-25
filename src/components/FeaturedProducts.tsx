import { useState, useEffect, useRef, useCallback } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Star,
  ShieldCheck,
} from 'lucide-react';
import indicaImg from '@/assets/product-indica.jpg';
import sativaImg from '@/assets/product-sativa.jpg';
import hybridImg from '@/assets/product-hybrid.jpg';

const imageMap: Record<string, string> = {
  indica: indicaImg,
  sativa: sativaImg,
  hybrid: hybridImg,
};

const categoryColor: Record<string, { badge: string; dot: string }> = {
  indica:  { badge: 'bg-purple-500/20 text-purple-200 ring-purple-400/30', dot: 'bg-purple-400' },
  sativa:  { badge: 'bg-emerald-500/20 text-emerald-200 ring-emerald-400/30', dot: 'bg-emerald-400' },
  hybrid:  { badge: 'bg-amber-500/20 text-amber-200 ring-amber-400/30', dot: 'bg-amber-400' },
};

export const FeaturedProducts = () => {
  const { products, loading } = useProducts({ featured: true, limit: 6, realtime: true });
  const navigate = useNavigate();

  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex]     = useState<number | null>(null);
  const [direction, setDirection]     = useState<'next' | 'prev'>('next');
  const [animating, setAnimating]     = useState(false);
  const [textVisible, setTextVisible] = useState(true);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Touch / swipe state
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const stopAutoplay = () => { if (autoplayRef.current) clearInterval(autoplayRef.current); };

  const goTo = useCallback((next: number, dir: 'next' | 'prev') => {
    if (animating) return;
    setDirection(dir);
    setTextVisible(false);
    setTimeout(() => {
      setPrevIndex(activeIndex);
      setActiveIndex(next);
      setAnimating(true);
      setTimeout(() => { setAnimating(false); setPrevIndex(null); }, 650);
      setTimeout(() => setTextVisible(true), 80);
    }, 120);
  }, [animating, activeIndex]);

  const handleNext = useCallback(() => {
    stopAutoplay();
    goTo((activeIndex + 1) % products.length, 'next');
  }, [activeIndex, products.length, goTo]);

  const handlePrev = useCallback(() => {
    stopAutoplay();
    goTo((activeIndex - 1 + products.length) % products.length, 'prev');
  }, [activeIndex, products.length, goTo]);

  // Autoplay
  useEffect(() => {
    if (products.length < 2) return;
    autoplayRef.current = setInterval(() => {
      goTo((activeIndex + 1) % products.length, 'next');
    }, 5000);
    return () => stopAutoplay();
  }, [activeIndex, products.length, goTo]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlePrev, handleNext]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(dx) > 40 && dy < 60) {
      if (dx < 0) handleNext(); else handlePrev();
    }
  };

  if (loading) {
    return (
      <section className="py-14 md:py-20">
        <div className="container">
          <div className="mb-10">
            <div className="h-3 w-40 bg-muted animate-pulse rounded mb-4" />
            <div className="h-10 w-72 bg-muted animate-pulse rounded" />
          </div>
          <div className="rounded-3xl border border-border/60 overflow-hidden">
            <div className="grid md:grid-cols-2 min-h-[500px]">
              <div className="bg-muted animate-pulse" />
              <div className="p-10 flex flex-col gap-5">
                {[1,2,3,4,5].map(i => <div key={i} className="h-5 bg-muted animate-pulse rounded" />)}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  const product  = products[activeIndex];
  const category = product.category.toLowerCase();
  const colors   = categoryColor[category] || categoryColor.indica;
  const price    = 800 + Math.round(product.thc * 30);
  const fallback = imageMap[category] || indicaImg;

  // Outgoing image (for cross-fade)
  const prevProduct = prevIndex !== null ? products[prevIndex] : null;
  const prevFallback = prevProduct ? (imageMap[prevProduct.category.toLowerCase()] || indicaImg) : null;

  const slideIn  = direction === 'next' ? 'translate-x-full'  : '-translate-x-full';
  const slideOut = direction === 'next' ? '-translate-x-full' : 'translate-x-full';

  return (
    <section className="py-14 md:py-16 lg:py-20 relative">
      {/* Keyframes injected once */}
      <style>{`
        @keyframes fp-fade-up   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fp-fade-blur { from { opacity:0; filter:blur(8px); transform:translateY(6px); } to { opacity:1; filter:blur(0); transform:translateY(0); } }
        @keyframes fp-progress  { from { width:0%; } to { width:100%; } }
        .fp-fade-up   { animation: fp-fade-up   0.45s cubic-bezier(.22,1,.36,1) both; }
        .fp-fade-blur { animation: fp-fade-blur 0.5s  cubic-bezier(.22,1,.36,1) both; }
        .fp-name      { animation: fp-fade-up   0.5s  cubic-bezier(.22,1,.36,1) 0.05s both; }
        .fp-desc      { animation: fp-fade-blur 0.5s  cubic-bezier(.22,1,.36,1) 0.12s both; }
        .fp-tags      { animation: fp-fade-up   0.45s cubic-bezier(.22,1,.36,1) 0.18s both; }
        .fp-bars      { animation: fp-fade-up   0.45s cubic-bezier(.22,1,.36,1) 0.24s both; }
        .fp-ctas      { animation: fp-fade-up   0.45s cubic-bezier(.22,1,.36,1) 0.30s both; }
        .fp-progress-bar { animation: fp-progress 5s linear both; }
      `}</style>

      <div className="container">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 md:mb-10 gap-6 reveal">
          <div>
            <p className="eyebrow mb-3">Curated Selection</p>
            <h2 className="font-display text-display-lg text-foreground">Featured Strains</h2>
          </div>
          <Button variant="ghost" onClick={() => navigate('/products')} className="group text-foreground hover:text-accent shrink-0">
            View All
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Main card */}
        <div className="reveal rounded-3xl border border-border/60 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.6)] overflow-hidden">
          <div
            className="grid md:grid-cols-[1fr_1fr] lg:grid-cols-[5fr_6fr]"
            style={{ minHeight: 'clamp(420px, 60vw, 600px)' }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >

            {/* ── LEFT: Photo panel ── */}
            <div className="relative flex flex-col p-4 sm:p-5" style={{ background: 'hsl(var(--surface-deep))' }}>
              {/* Photo card with overflow clip */}
              <div className="relative flex-1 rounded-2xl overflow-hidden" style={{ minHeight: '320px' }}>

                {/* Outgoing image (slides out) */}
                {animating && prevProduct && (
                  <img
                    src={prevProduct.image_url || prevFallback || indicaImg}
                    alt=""
                    aria-hidden="true"
                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[650ms] ease-[cubic-bezier(.4,0,.2,1)] ${slideOut}`}
                  />
                )}

                {/* Active image (slides in) */}
                <img
                  key={`img-${product.id}`}
                  src={product.image_url || fallback}
                  alt={product.name}
                  className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[650ms] ease-[cubic-bezier(.4,0,.2,1)] ${animating ? slideIn : 'translate-x-0'}`}
                  style={{ transitionDelay: animating ? '0ms' : undefined }}
                  onLoad={e => { (e.target as HTMLImageElement).style.transform = 'translateX(0)'; }}
                />

                {/* Ken-Burns subtle zoom on active */}
                <div
                  key={`kb-${product.id}`}
                  className="absolute inset-0 w-full h-full"
                  style={{
                    backgroundImage: `url(${product.image_url || fallback})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    animation: 'kenburns 8s ease-out forwards',
                  }}
                />
                <style>{`@keyframes kenburns { from { transform:scale(1.06); } to { transform:scale(1); } }`}</style>

                {/* Bottom scrim */}
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                {/* Badges top-left */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  <span key={`cat-${product.id}`} className={`fp-fade-up inline-flex items-center gap-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.14em] px-3 py-1 ring-1 backdrop-blur-sm ${colors.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                    {product.category}
                  </span>
                  {product.is_new && (
                    <span key={`new-${product.id}`} className="fp-fade-up inline-flex items-center gap-1 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold uppercase tracking-[0.14em] px-3 py-1" style={{ animationDelay: '0.06s' }}>
                      <Sparkles className="h-3 w-3" strokeWidth={2.5} />New
                    </span>
                  )}
                  {product.is_popular && (
                    <span key={`pop-${product.id}`} className="fp-fade-up inline-flex items-center gap-1 rounded-full bg-foreground/90 text-background text-[10px] font-semibold uppercase tracking-[0.14em] px-3 py-1" style={{ animationDelay: '0.1s' }}>
                      <Star className="h-3 w-3" strokeWidth={2.5} />Popular
                    </span>
                  )}
                </div>

                {/* Shield top-right */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="inline-flex items-center justify-center rounded-full h-8 w-8 ring-1 ring-white/20" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }} title="Lab Tested">
                    <ShieldCheck className="h-4 w-4 text-accent" strokeWidth={2.25} />
                  </span>
                </div>

                {/* Price bottom-left */}
                <div className="absolute bottom-10 left-4 z-10">
                  <span key={`price-${product.id}`} className="fp-fade-up rounded-full text-accent font-display text-base font-bold px-4 py-1.5" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', animationDelay: '0.04s' }}>
                    ฿{price.toLocaleString()}
                  </span>
                </div>

                {/* Dots bottom-center */}
                <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-1.5">
                  {products.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { stopAutoplay(); goTo(i, i > activeIndex ? 'next' : 'prev'); }}
                      aria-label={`Go to product ${i + 1}`}
                      className={`rounded-full transition-all duration-400 ${i === activeIndex ? 'w-5 h-2 bg-accent' : 'w-2 h-2 bg-white/35 hover:bg-white/65'}`}
                    />
                  ))}
                </div>

                {/* Progress bar (autoplay indicator) */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-10 overflow-hidden rounded-b-2xl">
                  <div key={`prog-${activeIndex}`} className="h-full bg-accent/70 fp-progress-bar" />
                </div>
              </div>
            </div>

            {/* ── RIGHT: Details panel ── */}
            <div className="flex flex-col justify-between p-6 sm:p-8 md:p-10 lg:p-12" style={{ background: 'hsl(var(--surface))' }}>

              {/* Counter + nav */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
                  {String(activeIndex + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}
                </span>
                <div className="flex gap-2">
                  {[{ fn: handlePrev, icon: ChevronLeft, label: 'Previous' }, { fn: handleNext, icon: ChevronRight, label: 'Next' }].map(({ fn, icon: Icon, label }) => (
                    <button
                      key={label}
                      onClick={fn}
                      aria-label={label}
                      className="flex items-center justify-center w-9 h-9 rounded-full border border-border/60 text-foreground/60 hover:text-accent hover:border-accent/50 hover:bg-accent/5 active:scale-95 transition-all duration-200"
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Animated text block */}
              <div className="flex-1 flex flex-col justify-center gap-3 py-5">
                {textVisible && (
                  <>
                    <h3 key={`n-${product.id}`} className="fp-name font-display text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-foreground">
                      {product.name}
                    </h3>
                    <p key={`d-${product.id}`} className="fp-desc text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xs">
                      {product.description}
                    </p>
                    {'effects' in product && Array.isArray((product as any).effects) && (product as any).effects.length > 0 && (
                      <div key={`t-${product.id}`} className="fp-tags flex flex-wrap gap-2 pt-1">
                        {((product as any).effects as string[]).map((effect: string, ei: number) => (
                          <span
                            key={effect}
                            className="rounded-full border border-border/50 text-foreground/60 text-[11px] font-medium uppercase tracking-[0.12em] px-3 py-1 transition-colors hover:border-accent/40 hover:text-foreground/80"
                            style={{ background: 'hsl(var(--foreground) / 0.04)', animationDelay: `${0.18 + ei * 0.04}s` }}
                          >
                            {effect}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* THC / CBD bars */}
              {textVisible && (
                <div key={`b-${product.id}`} className="fp-bars flex gap-3 mb-5">
                  <div className="flex-1 rounded-xl bg-accent/10 ring-1 ring-accent/20 px-4 py-3">
                    <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] mb-2">
                      <span className="text-accent">THC</span>
                      <span className="text-foreground tabular-nums">{product.thc}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-foreground/10 overflow-hidden">
                      <div
                        key={`thc-${product.id}`}
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${Math.min(product.thc * 3, 100)}%`, transition: 'width 0.8s cubic-bezier(.4,0,.2,1) 0.3s' }}
                      />
                    </div>
                  </div>
                  <div className="flex-1 rounded-xl bg-primary/15 ring-1 ring-primary/25 px-4 py-3">
                    <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] mb-2">
                      <span className="text-primary-foreground/80">CBD</span>
                      <span className="text-foreground tabular-nums">{product.cbd}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-foreground/10 overflow-hidden">
                      <div
                        key={`cbd-${product.id}`}
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min(product.cbd * 10, 100)}%`, transition: 'width 0.8s cubic-bezier(.4,0,.2,1) 0.4s' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CTAs */}
              {textVisible && (
                <div key={`c-${product.id}`} className="fp-ctas flex gap-3 flex-wrap">
                  <Button
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="flex-1 min-w-[120px] bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.98] font-semibold uppercase tracking-[0.1em] text-xs gap-2 transition-all duration-200"
                  >
                    View Details
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </Button>
                  <a
                    href="https://line.me/R/ti/p/@674dxgnq"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-[#00B900]/10 text-[#00B900] hover:bg-[#00B900] hover:text-white active:scale-[0.98] text-xs font-semibold uppercase tracking-[0.1em] transition-all duration-200 ring-1 ring-[#00B900]/30"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                    </svg>
                    Inquire on LINE
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};