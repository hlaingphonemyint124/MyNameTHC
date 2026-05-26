"use client";

import {
  useState, useEffect, useRef, useCallback,
} from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Star, ShieldCheck, Leaf, ArrowRight,
  ChevronLeft, ChevronRight, RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import indicaImg from '@/assets/product-indica.jpg';
import sativaImg from '@/assets/product-sativa.jpg';
import hybridImg from '@/assets/product-hybrid.jpg';

/* ─────────────────────────────────────────────────────────────────
   Config
───────────────────────────────────────────────────────────────── */
const IMAGE_MAP: Record<string, string> = {
  indica: indicaImg,
  sativa: sativaImg,
  hybrid: hybridImg,
};

interface CatCfg {
  accent: string;
  glowRgb: string;
  badge: string;
  barClass: string;
  dotClass: string;
}
const CAT_CFG: Record<string, CatCfg> = {
  indica: {
    accent:   '#a855f7',
    glowRgb:  '168,85,247',
    badge:    'bg-purple-500/15 text-purple-200 ring-1 ring-purple-400/30',
    barClass: 'bg-purple-400',
    dotClass: 'bg-purple-400',
  },
  sativa: {
    accent:   '#10b981',
    glowRgb:  '16,185,129',
    badge:    'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30',
    barClass: 'bg-emerald-400',
    dotClass: 'bg-emerald-400',
  },
  hybrid: {
    accent:   '#f59e0b',
    glowRgb:  '245,158,11',
    badge:    'bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/30',
    barClass: 'bg-amber-400',
    dotClass: 'bg-amber-400',
  },
};
const getCfg = (cat: string): CatCfg =>
  CAT_CFG[cat.toLowerCase()] ?? CAT_CFG.hybrid;

/* ─────────────────────────────────────────────────────────────────
   Galaxy Canvas
───────────────────────────────────────────────────────────────── */
interface StarP  { x:number; y:number; r:number; a:number; tw:number; drift:number }
interface NebulaP { x:number; y:number; rx:number; ry:number; col:string; alpha:number }

function GalaxyCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf = 0, t = 0, W = 0, H = 0;
    let stars: StarP[] = [], nebulae: NebulaP[] = [];

    const NEBULA_COLS = [
      'rgba(245,158,11,', 'rgba(168,85,247,', 'rgba(16,185,129,',
      'rgba(59,130,246,', 'rgba(20,184,166,', 'rgba(236,72,153,',
    ];

    const build = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      stars = Array.from({ length: 260 }, () => ({
        x: Math.random()*W, y: Math.random()*H,
        r: Math.random()*1.5+0.2, a: Math.random()*0.55+0.2,
        tw: Math.random()*Math.PI*2, drift: Math.random()*0.06+0.01,
      }));
      nebulae = Array.from({ length: 8 }, (_, i) => ({
        x: W*(0.05+Math.random()*0.9), y: H*(0.05+Math.random()*0.9),
        rx: 90+Math.random()*200, ry: 70+Math.random()*150,
        col: NEBULA_COLS[i%NEBULA_COLS.length], alpha: 0.028+Math.random()*0.042,
      }));
    };

    const frame = () => {
      t += 0.003;
      ctx.clearRect(0,0,W,H);
      const bg = ctx.createRadialGradient(W*.5,H*.45,0,W*.5,H*.45,Math.hypot(W,H)*.6);
      bg.addColorStop(0,'#0a0f1e'); bg.addColorStop(.55,'#050810'); bg.addColorStop(1,'#020408');
      ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);
      nebulae.forEach((n,i) => {
        const ox=Math.sin(t*.28+i*1.1)*22, oy=Math.cos(t*.22+i*.8)*14;
        const cx=n.x+ox, cy=n.y+oy;
        ctx.save(); ctx.scale(1,n.ry/n.rx);
        const g=ctx.createRadialGradient(cx,cy*(n.rx/n.ry),0,cx,cy*(n.rx/n.ry),n.rx);
        g.addColorStop(0,n.col+(n.alpha*2).toFixed(3)+')');
        g.addColorStop(.45,n.col+(n.alpha).toFixed(3)+')');
        g.addColorStop(1,n.col+'0)');
        ctx.beginPath(); ctx.arc(cx,cy*(n.rx/n.ry),n.rx,0,Math.PI*2);
        ctx.fillStyle=g; ctx.fill(); ctx.restore();
      });
      stars.forEach(s => {
        const tw=Math.sin(t*1.9+s.tw)*.38+.62;
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,255,255,${(s.a*tw).toFixed(3)})`; ctx.fill();
        if (s.r>1.15) {
          ctx.strokeStyle=`rgba(255,255,255,${(s.a*tw*.3).toFixed(3)})`; ctx.lineWidth=.5;
          ctx.beginPath();
          ctx.moveTo(s.x-s.r*3,s.y); ctx.lineTo(s.x+s.r*3,s.y);
          ctx.moveTo(s.x,s.y-s.r*3); ctx.lineTo(s.x,s.y+s.r*3);
          ctx.stroke();
        }
        s.y+=s.drift;
        if (s.y>H+2) { s.y=-2; s.x=Math.random()*W; }
      });
      raf = requestAnimationFrame(frame);
    };

    const ro = new ResizeObserver(build);
    ro.observe(canvas); build();
    raf = requestAnimationFrame(frame);
    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden />;
}

/* ─────────────────────────────────────────────────────────────────
   Animated presence helper (no framer-motion dependency needed)
───────────────────────────────────────────────────────────────── */
function FadeSlide({
  id, children, className = '',
}: { id: string | number; children: React.ReactNode; className?: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, [id]);

  return (
    <div
      className={className}
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.38s ease, transform 0.38s ease',
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────────── */
export const FeaturedProducts = () => {
  const { products, loading } = useProducts({ featured: true, limit: 6, realtime: true });
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay]         = useState(true);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  /* ── auto-advance ── */
  const startAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setCurrentIndex(i => (i + 1) % products.length);
    }, 5000);
  }, [products.length]);

  const stopAuto = useCallback(() => {
    if (autoRef.current) { clearInterval(autoRef.current); autoRef.current = null; }
    setAutoPlay(false);
  }, []);

  useEffect(() => {
    if (autoPlay && products.length > 0) startAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [autoPlay, products.length, startAuto]);

  const handleNext = useCallback(() => {
    stopAuto();
    setCurrentIndex(i => (i + 1) % products.length);
  }, [products.length, stopAuto]);

  const handlePrevious = useCallback(() => {
    stopAuto();
    setCurrentIndex(i => (i - 1 + products.length) % products.length);
  }, [products.length, stopAuto]);

  const goTo = useCallback((idx: number) => {
    stopAuto();
    setCurrentIndex(idx);
  }, [stopAuto]);

  /* ── scroll reveal ── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || loading) return;
    const obs = new IntersectionObserver(
      es => es.forEach(e => e.target.classList.toggle('fp-in', e.isIntersecting)),
      { threshold: 0.06 },
    );
    el.querySelectorAll('.fp-reveal').forEach(n => obs.observe(n));
    return () => obs.disconnect();
  }, [loading]);

  /* ── Loading ── */
  if (loading) {
    return (
      <section className="relative overflow-hidden min-h-[520px] flex items-center justify-center">
        <GalaxyCanvas />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-[hsl(var(--accent))] border-t-transparent animate-spin" />
          <p className="text-[11px] uppercase tracking-[0.26em] text-white/30">Loading strains…</p>
        </div>
      </section>
    );
  }
  if (products.length === 0) return null;

  const product = products[currentIndex];
  const cat     = product.category.toLowerCase();
  const cfg     = getCfg(cat);
  const fallback = IMAGE_MAP[cat] ?? indicaImg;
  const imgSrc   = product.image_url || fallback;
  const price    = 800 + Math.round(product.thc * 30);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden text-[hsl(var(--foreground))] py-12 md:py-20 w-full"
    >
      {/* ── Styles ── */}
      <style>{`
        .fp-reveal { opacity:0; transform:translateY(22px);
          transition:opacity .65s ease,transform .65s ease; }
        .fp-reveal.fp-in { opacity:1; transform:translateY(0); }

        @keyframes fp-bar { from{width:0%} }
        .fp-bar { animation:fp-bar .95s cubic-bezier(.25,1,.5,1) forwards; }

        @keyframes fp-img-in {
          from { opacity:0; transform:scale(1.04); }
          to   { opacity:1; transform:scale(1); }
        }
        .fp-img-in { animation:fp-img-in .45s ease forwards; }

        @keyframes fp-card-in {
          from { opacity:0; transform:translateX(16px); }
          to   { opacity:1; transform:translateX(0); }
        }
        .fp-card-in { animation:fp-card-in .42s cubic-bezier(.25,1,.5,1) forwards; }
      `}</style>

      {/* ── Background ── */}
      <div className="absolute inset-0">
        <GalaxyCanvas />
        <div className="absolute inset-0 pointer-events-none
          bg-[radial-gradient(ellipse_110%_90%_at_50%_50%,transparent_35%,rgba(0,0,0,0.6)_100%)]" />
        <div className="absolute inset-0 pointer-events-none
          bg-[radial-gradient(ellipse_55%_45%_at_50%_55%,hsl(var(--accent)/0.08),transparent_70%)]" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">

        {/* ── Header ── */}
        <div className="fp-reveal flex items-end justify-between mb-10 md:mb-14 gap-4">
          <div className="space-y-2">
            <p className="text-[10px] tracking-[0.32em] uppercase flex items-center gap-2 text-white/40">
              <Leaf className="h-3 w-3 opacity-60" />
              Curated Selection
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-normal leading-[1.05] tracking-tight">
              Featured{' '}
              <span className="italic text-[hsl(var(--accent))]">Strains</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!autoPlay && (
              <button
                onClick={() => setAutoPlay(true)}
                title="Resume auto-play"
                className="flex items-center justify-center h-9 w-9 rounded-full
                  bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5 text-white/50" />
              </button>
            )}
            <Button
              variant="ghost"
              onClick={() => navigate('/products')}
              className="group text-sm font-medium tracking-wide rounded-xl
                border border-white/15 hover:border-white/30
                text-white/50 hover:text-white transition-all"
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* ── Card Carousel ── */}
        <div className="fp-reveal w-full" style={{ transitionDelay: '80ms' }}>

          {/* ── DESKTOP layout ── */}
          <div className="hidden md:flex relative items-center">

            {/* Left: Product Image */}
            <div
              className="w-[420px] lg:w-[480px] flex-shrink-0 rounded-3xl overflow-hidden relative"
              style={{ aspectRatio: '1 / 1' }}
            >
              {/* Glow border driven by category color */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none z-10"
                style={{ boxShadow: `inset 0 0 0 1.5px rgba(${cfg.glowRgb},0.35), 0 0 60px -10px rgba(${cfg.glowRgb},0.4)` }}
              />

              <FadeSlide id={product.id} className="absolute inset-0 w-full h-full">
                <img
                  key={product.id}
                  src={imgSrc}
                  alt={product.name}
                  className="fp-img-in w-full h-full object-cover"
                  draggable={false}
                />
              </FadeSlide>

              {/* Subtle bottom vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none z-[2]" />

              {/* Top-left badge */}
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5">
                <span className={`inline-flex items-center gap-1.5 rounded-full
                  text-[9px] font-bold uppercase tracking-[0.14em]
                  px-3 py-1.5 backdrop-blur-md ${cfg.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${cfg.dotClass}`} />
                  {product.category}
                </span>
                {product.is_new && (
                  <span className="inline-flex items-center gap-1 rounded-full
                    bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]
                    text-[8px] font-bold uppercase tracking-[0.1em] px-2.5 py-1">
                    <Sparkles className="h-2.5 w-2.5" />New Arrival
                  </span>
                )}
                {product.is_popular && (
                  <span className="inline-flex items-center gap-1 rounded-full
                    bg-white/90 text-black text-[8px] font-bold uppercase
                    tracking-[0.1em] px-2.5 py-1">
                    <Star className="h-2.5 w-2.5 fill-current" />Hot
                  </span>
                )}
              </div>

              {/* Verified badge */}
              <div className="absolute top-4 right-4 z-20">
                <span className="flex items-center justify-center h-8 w-8 rounded-full
                  ring-1 ring-white/15 bg-black/55 backdrop-blur-md">
                  <ShieldCheck className="h-4 w-4 text-[hsl(var(--accent))]" strokeWidth={2.5} />
                </span>
              </div>
            </div>

            {/* Right: Info Card — overlaps image by 60px */}
            <div
              className="fp-card-in relative z-10 flex-1 ml-[-60px]"
              key={product.id + '-card'}
            >
              <div
                className="rounded-3xl p-8 lg:p-10"
                style={{
                  background:     'rgba(6,10,20,0.88)',
                  backdropFilter: 'blur(32px) saturate(1.4)',
                  border:         `1.5px solid rgba(${cfg.glowRgb},0.28)`,
                  boxShadow:      `0 0 56px -16px rgba(${cfg.glowRgb},0.45), 0 24px 80px rgba(0,0,0,0.75)`,
                }}
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 inset-x-0 h-[2px] rounded-t-3xl"
                  style={{ background: `linear-gradient(to right,transparent,${cfg.accent},transparent)` }}
                />

                <FadeSlide id={product.id + '-info'}>
                  {/* Name & title */}
                  <div className="mb-6">
                    <h3 className="text-2xl lg:text-3xl font-display font-normal text-white leading-tight mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm font-medium text-white/45">
                      {product.description}
                    </p>
                  </div>

                  {/* THC / CBD bars */}
                  <div className="space-y-3 mb-7">
                    <div className="rounded-xl bg-white/5 border border-white/8 px-4 py-3">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.15em] mb-2">
                        <span style={{ color: cfg.accent }}>THC</span>
                        <span className="text-white font-mono">{product.thc}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`fp-bar h-full rounded-full ${cfg.barClass}`}
                          style={{ width: `${Math.min(product.thc * 3.3, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.15em] mb-2">
                        <span className="text-white/40">CBD</span>
                        <span className="text-white font-mono">{product.cbd}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="fp-bar h-full rounded-full bg-white/28"
                          style={{ width: `${Math.min(product.cbd * 10, 100)}%`, animationDelay: '.15s' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Effects chips */}
                  {'effects' in product &&
                    Array.isArray((product as any).effects) &&
                    (product as any).effects.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-7">
                      {((product as any).effects as string[]).slice(0, 5).map((fx: string) => (
                        <span key={fx}
                          className="rounded-full bg-white/5 border border-white/10
                            text-white/50 text-[9px] font-medium tracking-wide px-3 py-1">
                          {fx}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price + CTAs */}
                  <div className="flex items-center gap-3">
                    <span
                      className="rounded-xl bg-white/6 ring-1 ring-white/10
                        font-mono text-lg font-bold px-4 py-2"
                      style={{ color: cfg.accent }}
                    >
                      ฿{price.toLocaleString()}
                    </span>

                    <button
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="flex-1 h-11 rounded-xl text-[11px] font-bold uppercase
                        tracking-[0.18em] flex items-center justify-center gap-2
                        transition-all active:scale-[0.97] hover:brightness-110"
                      style={{
                        background: `linear-gradient(135deg,${cfg.accent},${cfg.accent}bb)`,
                        color:      '#000',
                        boxShadow:  `0 4px 22px -4px rgba(${cfg.glowRgb},0.65)`,
                      }}
                    >
                      View Details
                      <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                    </button>

                    <a
                      href="https://line.me/R/ti/p/@674dxgnq"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 h-11 rounded-xl text-[11px] font-bold uppercase
                        tracking-[0.18em] flex items-center justify-center gap-2
                        ring-1 ring-[#00B900]/40 bg-[#00B900]/10 text-[#00B900]
                        hover:bg-[#00B900] hover:text-white transition-all active:scale-[0.97]"
                    >
                      LINE Order
                    </a>
                  </div>
                </FadeSlide>
              </div>
            </div>
          </div>

          {/* ── MOBILE layout ── */}
          <div className="md:hidden max-w-sm mx-auto text-center">

            {/* Image */}
            <div className="w-full aspect-square rounded-3xl overflow-hidden mb-6 relative">
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none z-10"
                style={{ boxShadow: `inset 0 0 0 1.5px rgba(${cfg.glowRgb},0.35)` }}
              />
              <FadeSlide id={product.id} className="absolute inset-0 w-full h-full">
                <img
                  src={imgSrc}
                  alt={product.name}
                  className="fp-img-in w-full h-full object-cover"
                  draggable={false}
                />
              </FadeSlide>

              {/* Badge overlay */}
              <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
                <span className={`inline-flex items-center gap-1 rounded-full
                  text-[8px] font-bold uppercase tracking-[0.13em]
                  px-2 py-1 backdrop-blur-md ${cfg.badge}`}>
                  <span className={`w-1 h-1 rounded-full animate-pulse ${cfg.dotClass}`} />
                  {product.category}
                </span>
              </div>
              <div className="absolute top-3 right-3 z-20">
                <span className="flex items-center justify-center h-7 w-7 rounded-full
                  ring-1 ring-white/15 bg-black/55 backdrop-blur-md">
                  <ShieldCheck className="h-3.5 w-3.5 text-[hsl(var(--accent))]" strokeWidth={2.5} />
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="px-2">
              <FadeSlide id={product.id + '-mob'}>
                <h3 className="text-xl font-display font-normal text-white mb-1">
                  {product.name}
                </h3>
                <p className="text-xs text-white/45 mb-5 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>

                {/* THC / CBD */}
                <div className="space-y-2 mb-5 text-left">
                  <div className="rounded-xl bg-white/5 border border-white/8 px-3 py-2.5">
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-[0.15em] mb-1.5">
                      <span style={{ color: cfg.accent }}>THC</span>
                      <span className="text-white font-mono">{product.thc}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                      <div className={`fp-bar h-full rounded-full ${cfg.barClass}`}
                        style={{ width: `${Math.min(product.thc * 3.3, 100)}%` }} />
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2.5">
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-[0.15em] mb-1.5">
                      <span className="text-white/40">CBD</span>
                      <span className="text-white font-mono">{product.cbd}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                      <div className="fp-bar h-full rounded-full bg-white/28"
                        style={{ width: `${Math.min(product.cbd * 10, 100)}%`, animationDelay: '.15s' }} />
                    </div>
                  </div>
                </div>

                {/* Price row */}
                <div className="flex items-center justify-between mb-5">
                  <span className="font-mono text-base font-bold" style={{ color: cfg.accent }}>
                    ฿{price.toLocaleString()}
                  </span>
                  {product.is_new && (
                    <span className="inline-flex items-center gap-0.5 rounded-full
                      bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]
                      text-[8px] font-bold uppercase tracking-[0.1em] px-2 py-0.5">
                      <Sparkles className="h-2 w-2" />New
                    </span>
                  )}
                  {product.is_popular && (
                    <span className="inline-flex items-center gap-0.5 rounded-full
                      bg-white/90 text-black text-[8px] font-bold uppercase
                      tracking-[0.1em] px-2 py-0.5">
                      <Star className="h-2 w-2 fill-current" />Hot
                    </span>
                  )}
                </div>

                {/* CTAs */}
                <div className="flex gap-2.5">
                  <button
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="flex-1 h-10 rounded-xl text-[10px] font-bold uppercase
                      tracking-[0.18em] flex items-center justify-center gap-1.5
                      transition-all active:scale-[0.97] hover:brightness-110"
                    style={{
                      background: `linear-gradient(135deg,${cfg.accent},${cfg.accent}bb)`,
                      color: '#000',
                      boxShadow: `0 4px 22px -4px rgba(${cfg.glowRgb},0.65)`,
                    }}
                  >
                    View Details
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                  <a
                    href="https://line.me/R/ti/p/@674dxgnq"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-10 rounded-xl text-[10px] font-bold uppercase
                      tracking-[0.18em] flex items-center justify-center gap-1.5
                      ring-1 ring-[#00B900]/40 bg-[#00B900]/10 text-[#00B900]
                      hover:bg-[#00B900] hover:text-white transition-all active:scale-[0.97]"
                  >
                    LINE Order
                  </a>
                </div>
              </FadeSlide>
            </div>
          </div>

        </div>{/* end fp-reveal card block */}

        {/* ── Bottom Navigation ── */}
        <div className="fp-reveal flex justify-center items-center gap-6 mt-10"
          style={{ transitionDelay: '160ms' }}>

          {/* Previous */}
          <button
            onClick={handlePrevious}
            aria-label="Previous strain"
            className="w-12 h-12 rounded-full flex items-center justify-center
              transition-all hover:scale-105 active:scale-95"
            style={{
              background:  'rgba(255,255,255,0.05)',
              border:      '1px solid rgba(255,255,255,0.12)',
              boxShadow:   '0 4px 20px rgba(0,0,0,0.4)',
            }}
          >
            <ChevronLeft className="w-5 h-5 text-white/70" />
          </button>

          {/* Dot indicators */}
          <div className="flex gap-2 items-center">
            {products.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                aria-label={`Go to strain ${idx + 1}`}
                className="rounded-full transition-all duration-300"
                style={{
                  width:      idx === currentIndex ? 28 : 8,
                  height:     8,
                  background: idx === currentIndex
                    ? `hsl(var(--accent))`
                    : 'rgba(255,255,255,0.2)',
                  boxShadow:  idx === currentIndex
                    ? `0 0 10px 2px hsl(var(--accent)/0.5)`
                    : 'none',
                }}
              />
            ))}
          </div>

          {/* Next */}
          <button
            onClick={handleNext}
            aria-label="Next strain"
            className="w-12 h-12 rounded-full flex items-center justify-center
              transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border:     '1px solid rgba(255,255,255,0.12)',
              boxShadow:  '0 4px 20px rgba(0,0,0,0.4)',
            }}
          >
            <ChevronRight className="w-5 h-5 text-white/70" />
          </button>
        </div>

      </div>
    </section>
  );
};