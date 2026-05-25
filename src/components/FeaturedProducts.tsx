import { useState, useEffect, useRef } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
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

const categoryColor: Record<string, { badge: string; dot: string; text: string }> = {
  indica:  { badge: 'bg-purple-500/20 text-purple-200 ring-purple-400/30', dot: 'bg-purple-400', text: 'text-purple-400' },
  sativa:  { badge: 'bg-emerald-500/20 text-emerald-200 ring-emerald-400/30', dot: 'bg-emerald-400', text: 'text-emerald-400' },
  hybrid:  { badge: 'bg-amber-500/20 text-amber-200 ring-amber-400/30', dot: 'bg-amber-400', text: 'text-amber-400' },
};

export const FeaturedProducts = () => {
  const { products, loading } = useProducts({ featured: true, limit: 6, realtime: true });
  const navigate = useNavigate();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const timelineRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchronized Multi-Stage Slideshow & Card Flip Engine
  useEffect(() => {
    if (products.length === 0) return;

    const runSlideshowCycle = () => {
      // Stage 1: Reset flip state to front for the incoming card
      setIsFlipped(false);

      // Stage 2: Wait 2.5 seconds showing the front before flipping it open
      timelineRef.current = setTimeout(() => {
        setIsFlipped(true);

        // Stage 3: Keep back panel details visible for 3.5 seconds, then move to next slide
        timelineRef.current = setTimeout(() => {
          setActiveIndex((prev) => (prev + 1) % products.length);
        }, 3500);

      }, 2500);
    };

    runSlideshowCycle();

    return () => {
      if (timelineRef.current) clearTimeout(timelineRef.current);
    };
  }, [activeIndex, products.length]);

  if (loading) {
    return (
      <section className="py-14 md:py-20 bg-[#060F0A]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-12 flex justify-between items-end">
            <div className="space-y-3">
              <div className="h-4 w-32 bg-zinc-900 animate-pulse rounded" />
              <div className="h-12 w-64 bg-zinc-900 animate-pulse rounded" />
            </div>
            <div className="h-10 w-24 bg-zinc-900 animate-pulse rounded" />
          </div>
          <div className="flex justify-center gap-6 overflow-hidden py-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-[320px] h-[480px] bg-zinc-900/50 border border-zinc-800 animate-pulse rounded-3xl shrink-0" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16 md:py-20 lg:py-24 relative overflow-hidden bg-[#060F0A] text-zinc-100">
      
      {/* Structural 3D Transforms CSS Injection */}
      <style>{`
        .carousel-perspective {
          perspective: 1400px;
        }
        .card-perspective-container {
          perspective: 1200px;
          transform-style: preserve-3d;
        }
        .flip-card-inner {
          transform-style: preserve-3d;
          transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .flip-card-inner.flipped {
          transform: rotateY(180deg);
        }
        .side-front, .side-back {
          backface-visibility: hidden;
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border-radius: 1.5rem;
        }
        .side-back {
          transform: rotateY(180deg);
        }
      `}</style>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Title and Header row */}
        <div className="flex items-end justify-between mb-12 md:mb-16 gap-6">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-500/90">Curated Selection</p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-white">
              Featured Strains
            </h2>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => navigate('/products')} 
            className="group text-zinc-300 hover:text-white hover:bg-zinc-900/40 shrink-0 text-sm font-medium tracking-wide"
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* 3D Multi-Card Carousel Track */}
        <div className="carousel-perspective relative w-full h-[520px] md:h-[560px] flex items-center justify-center select-none overflow-visible">
          <div className="relative w-full h-full flex items-center justify-center overflow-visible">
            {products.map((product, index) => {
              const category = product.category.toLowerCase();
              const colors = categoryColor[category] || categoryColor.indica;
              const price = 800 + Math.round(product.thc * 30);
              const fallback = imageMap[category] || indicaImg;

              // Infinite cyclical calculation mapping out left, center, and right neighbors
              let offset = index - activeIndex;
              if (offset < -Math.floor(products.length / 2)) offset += products.length;
              if (offset > Math.floor(products.length / 2)) offset -= products.length;

              const isCenter = offset === 0;
              const isVisible = Math.abs(offset) <= 2; // Only render immediate visible cluster

              if (!isVisible) return null;

              // Compute precise absolute spatial layouts based on current placement distance
              let translateX = '0%';
              let scale = 1;
              let rotateY = 0;
              let zIndex = 10;
              let opacity = 1;

              if (offset === 0) {
                translateX = '0%';
                scale = 1.05;
                rotateY = 0;
                zIndex = 30;
                opacity = 1;
              } else if (offset === 1) {
                translateX = '108%';
                scale = 0.88;
                rotateY = -12;
                zIndex = 20;
                opacity = 0.65;
              } else if (offset === -1) {
                translateX = '-108%';
                scale = 0.88;
                rotateY = 12;
                zIndex = 20;
                opacity = 0.65;
              } else if (offset === 2) {
                translateX = '210%';
                scale = 0.75;
                rotateY = -20;
                zIndex = 10;
                opacity = 0.2;
              } else if (offset === -2) {
                translateX = '-210%';
                scale = 0.75;
                rotateY = 20;
                zIndex = 10;
                opacity = 0.2;
              }

              return (
                <div
                  key={product.id}
                  className="absolute w-[290px] sm:w-[320px] md:w-[350px] h-[460px] sm:h-[490px] md:h-[520px] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                  style={{
                    transform: `translateX(${translateX}) scale(${scale}) rotateY(${rotateY}deg)`,
                    zIndex: zIndex,
                    opacity: opacity,
                    pointerEvents: isCenter ? 'auto' : 'none', // Block click actions on background slides
                  }}
                >
                  <div className="card-perspective-container w-full h-full">
                    <div className={`flip-card-inner w-full h-full relative rounded-3xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9)] ${isCenter && isFlipped ? 'flipped' : ''}`}>
                      
                      {/* ── CARD FRONT VIEW ── */}
                      <div className="side-front overflow-hidden border border-zinc-800/80 bg-zinc-950 flex flex-col justify-between p-5 relative">
                        {/* High-Resolution Product Asset Rendering */}
                        <img
                          src={product.image_url || fallback}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[4000ms] ease-out scale-100"
                          loading="lazy"
                        />
                        {/* High-Contrast Vignette Scrim Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/20 pointer-events-none" />

                        {/* Top Structural Information Row */}
                        <div className="relative z-10 flex flex-col gap-2 items-start">
                          <span className={`inline-flex items-center gap-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 ring-1 backdrop-blur-md ${colors.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                            {product.category}
                          </span>
                          
                          {product.is_new && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-zinc-950 text-[10px] font-bold uppercase tracking-widest px-3 py-1 shadow-md">
                              <Sparkles className="h-3 w-3 fill-current" /> New
                            </span>
                          )}
                          
                          {product.is_popular && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-bold uppercase tracking-widest px-3 py-1 shadow-md">
                              <Star className="h-3 w-3 fill-current" /> Popular
                            </span>
                          )}
                        </div>

                        {/* Quality Assurance Verification Emblem */}
                        <div className="absolute top-5 right-5 z-10">
                          <span className="inline-flex items-center justify-center rounded-full h-8 w-8 ring-1 ring-white/10 bg-black/40 backdrop-blur-md" title="Lab Certified">
                            <ShieldCheck className="h-4 w-4 text-emerald-400" strokeWidth={2.5} />
                          </span>
                        </div>

                        {/* Bottom Metric Stack */}
                        <div className="relative z-10 w-full mt-auto space-y-3.5">
                          <div className="flex justify-between items-center">
                            <span className="rounded-lg text-amber-400 font-mono text-xs font-semibold px-2.5 py-1 bg-black/70 backdrop-blur-sm ring-1 ring-white/10 shadow-sm">
                              ฿{price.toLocaleString()}
                            </span>
                          </div>
                          
                          <h3 className="font-serif text-2xl font-normal tracking-wide text-white line-clamp-1">
                            {product.name}
                          </h3>
                        </div>
                      </div>

                      {/* ── CARD BACK VIEW (Product Stats Deck) ── */}
                      <div className="side-back overflow-hidden border border-zinc-800/90 p-6 flex flex-col justify-between bg-[#07110B] relative shadow-inner">
                        {/* Structural mesh grid texture pattern background overlay */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                        
                        <div className="relative z-10">
                          <div className="flex justify-between items-center border-b border-zinc-800/80 pb-3 mb-4">
                            <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
                              {product.category} Strain
                            </span>
                            <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                              Overview
                            </span>
                          </div>

                          <h3 className="font-serif text-2xl font-normal text-white mb-2 line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-5 mb-4">
                            {product.description}
                          </p>

                          {/* Dynamic Strain Effect Badges */}
                          {'effects' in product && Array.isArray((product as any).effects) && (product as any).effects.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {((product as any).effects as string[]).slice(0, 3).map((effect: string) => (
                                <span
                                  key={effect}
                                  className="rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-medium tracking-wide px-2.5 py-0.5"
                                >
                                  {effect}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Cannabinoid Analytical Levels bars */}
                        <div className="relative z-10 space-y-2.5 my-2">
                          {/* THC Content Progress Grid Block */}
                          <div className="rounded-xl bg-emerald-500/[0.02] border border-emerald-500/10 px-3.5 py-2.5">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest mb-1.5">
                              <span className="text-emerald-400">THC Content</span>
                              <span className="text-white font-mono">{product.thc}%</span>
                            </div>
                            <div className="h-1 rounded-full bg-zinc-900 overflow-hidden">
                              <div
                                className="h-full bg-emerald-400 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: (isCenter && isFlipped) ? `${Math.min(product.thc * 3.3, 100)}%` : '0%' }}
                              />
                            </div>
                          </div>

                          {/* CBD Content Progress Grid Block */}
                          <div className="rounded-xl bg-zinc-900/40 border border-zinc-800/80 px-3.5 py-2.5">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest mb-1.5">
                              <span className="text-zinc-400">CBD Content</span>
                              <span className="text-white font-mono">{product.cbd}%</span>
                            </div>
                            <div className="h-1 rounded-full bg-zinc-900 overflow-hidden">
                              <div
                                className="h-full bg-zinc-400 rounded-full transition-all duration-1000 ease-out delay-100"
                                style={{ width: (isCenter && isFlipped) ? `${Math.min(product.cbd * 10, 100)}%` : '0%' }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Dynamic Conversion Call-to-Actions Row */}
                        <div className="relative z-10 flex gap-2 w-full pt-3.5 border-t border-zinc-800/60">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/products/${product.id}`);
                            }}
                            className="flex-1 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 active:scale-[0.96] font-bold uppercase tracking-wider text-[10px] h-10 gap-1.5 transition-all shadow-sm"
                          >
                            Details
                            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                          </Button>
                          
                          <a
                            href="https://line.me/R/ti/p/@674dxgnq"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-lg bg-[#00B900]/10 text-[#00B900] hover:bg-[#00B900] hover:text-white active:scale-[0.96] text-[10px] font-bold uppercase tracking-wider transition-all ring-1 ring-[#00B900]/30"
                          >
                            LINE
                          </a>
                        </div>

                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Pagination Matrix Dots Block */}
        <div className="w-full flex justify-center items-center gap-2 mt-4 relative z-20">
          {products.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === activeIndex ? 'w-8 bg-amber-500' : 'w-1.5 bg-zinc-800'
              }`}
            />
          ))}
        </div>
        
      </div>
    </section>
  );
};