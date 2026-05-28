"use client";

import {
  useState, useEffect, useRef, useCallback, useMemo,
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
    badge:    'bg-purple-500/20 text-purple-200 ring-1 ring-purple-400/40',
    barClass: 'bg-gradient-to-r from-purple-600 to-purple-400',
    dotClass: 'bg-purple-400',
  },
  sativa: {
    accent:   '#10b981',
    glowRgb:  '16,185,129',
    badge:    'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/40',
    barClass: 'bg-gradient-to-r from-emerald-600 to-emerald-400',
    dotClass: 'bg-emerald-400',
  },
  hybrid: {
    accent:   '#f59e0b',
    glowRgb:  '245,158,11',
    badge:    'bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/40',
    barClass: 'bg-gradient-to-r from-amber-600 to-amber-400',
    dotClass: 'bg-amber-400',
  },
};
const getCfg = (cat: string): CatCfg =>
  CAT_CFG[cat.toLowerCase()] ?? CAT_CFG.hybrid;

/* ─────────────────────────────────────────────────────────────────
   Green Galaxy Canvas
───────────────────────────────────────────────────────────────── */
interface StarP   { x:number; y:number; r:number; a:number; tw:number; drift:number; hue:number }
interface NebulaP { x:number; y:number; rx:number; ry:number; col:string; alpha:number; speed:number }

function GalaxyCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf = 0, t = 0, W = 0, H = 0;
    let stars: StarP[] = [], nebulae: NebulaP[] = [];
    const NEBULA_COLS = [
      'rgba(16,185,129,','rgba(5,150,105,','rgba(20,184,166,',
      'rgba(6,182,212,', 'rgba(16,185,129,','rgba(52,211,153,',
      'rgba(245,158,11,','rgba(20,184,166,','rgba(16,185,129,',
    ];
    const build = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      stars = Array.from({ length: 340 }, () => ({
        x: Math.random()*W, y: Math.random()*H,
        r: Math.random()*1.6+0.15, a: Math.random()*0.6+0.15,
        tw: Math.random()*Math.PI*2, drift: Math.random()*0.05+0.008,
        hue: Math.random() > 0.82 ? 1 : 0,
      }));
      nebulae = Array.from({ length: 9 }, (_, i) => ({
        x: W*(0.04+Math.random()*0.92), y: H*(0.04+Math.random()*0.92),
        rx: 100+Math.random()*250, ry: 80+Math.random()*190,
        col: NEBULA_COLS[i%NEBULA_COLS.length],
        alpha: 0.030+Math.random()*0.055,
        speed: 0.16+Math.random()*0.24,
      }));
    };
    const frame = () => {
      t += 0.0025;
      ctx.clearRect(0,0,W,H);
      const bg = ctx.createRadialGradient(W*.5,H*.42,0,W*.5,H*.42,Math.hypot(W,H)*.65);
      bg.addColorStop(0,'#030d08'); bg.addColorStop(0.4,'#020a06');
      bg.addColorStop(0.75,'#010604'); bg.addColorStop(1,'#010302');
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
      nebulae.forEach((n,i) => {
        const ox=Math.sin(t*n.speed+i*1.3)*30, oy=Math.cos(t*n.speed*.7+i*.9)*20;
        const cx=n.x+ox, cy=n.y+oy;
        ctx.save(); ctx.scale(1,n.ry/n.rx);
        const g=ctx.createRadialGradient(cx,cy*(n.rx/n.ry),0,cx,cy*(n.rx/n.ry),n.rx);
        g.addColorStop(0,n.col+(n.alpha*2.2).toFixed(3)+')');
        g.addColorStop(0.4,n.col+(n.alpha*1.1).toFixed(3)+')');
        g.addColorStop(0.75,n.col+(n.alpha*0.4).toFixed(3)+')');
        g.addColorStop(1,n.col+'0)');
        ctx.beginPath(); ctx.arc(cx,cy*(n.rx/n.ry),n.rx,0,Math.PI*2);
        ctx.fillStyle=g; ctx.fill(); ctx.restore();
      });
      const mw=ctx.createLinearGradient(0,H*.1,W,H*.9);
      mw.addColorStop(0,'rgba(16,185,129,0)'); mw.addColorStop(0.3,'rgba(16,185,129,0.018)');
      mw.addColorStop(0.5,'rgba(52,211,153,0.034)'); mw.addColorStop(0.7,'rgba(16,185,129,0.018)');
      mw.addColorStop(1,'rgba(16,185,129,0)');
      ctx.fillStyle=mw; ctx.fillRect(0,0,W,H);
      stars.forEach(s => {
        const tw=Math.sin(t*2.1+s.tw)*.4+.6;
        const al=(s.a*tw).toFixed(3);
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle=s.hue?`rgba(180,255,210,${al})`:`rgba(255,255,255,${al})`; ctx.fill();
        if (s.r>1.2) {
          ctx.strokeStyle=s.hue?`rgba(100,255,180,${(s.a*tw*.28).toFixed(3)})`:`rgba(255,255,255,${(s.a*tw*.22).toFixed(3)})`;
          ctx.lineWidth=.5;
          ctx.beginPath();
          ctx.moveTo(s.x-s.r*3.5,s.y); ctx.lineTo(s.x+s.r*3.5,s.y);
          ctx.moveTo(s.x,s.y-s.r*3.5); ctx.lineTo(s.x,s.y+s.r*3.5);
          ctx.stroke();
        }
        s.y+=s.drift;
        if (s.y>H+2) { s.y=-2; s.x=Math.random()*W; }
      });
      raf=requestAnimationFrame(frame);
    };
    const ro=new ResizeObserver(build);
    ro.observe(canvas); build(); raf=requestAnimationFrame(frame);
    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden />;
}

/* ─────────────────────────────────────────────────────────────────
   Floating Particles
───────────────────────────────────────────────────────────────── */
interface Particle { id:number; x:number; size:number; dur:number; delay:number; drift:number }

function FloatingParticles({ glowRgb }: { glowRgb: string }) {
  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      size: 3 + Math.random() * 5,
      dur: 3.5 + Math.random() * 3,
      delay: Math.random() * 4,
      drift: (Math.random() - 0.5) * 28,
    }))
  , [glowRgb]);

  return (
    <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="fp-particle absolute rounded-full"
          style={{
            left: `${p.x}%`,
            bottom: '-8px',
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, rgba(${glowRgb},0.9) 0%, rgba(${glowRgb},0.2) 60%, transparent 100%)`,
            boxShadow: `0 0 ${p.size * 2}px rgba(${glowRgb},0.6)`,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            '--drift': `${p.drift}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Flip Number
───────────────────────────────────────────────────────────────── */
function FlipNumber({ value, pad = 2 }: { value: number; pad?: number }) {
  const [displayed, setDisplayed] = useState(value);
  const [flipping, setFlipping] = useState(false);
  useEffect(() => {
    if (value === displayed) return;
    setFlipping(true);
    const t = setTimeout(() => { setDisplayed(value); setFlipping(false); }, 220);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <span
      className="fp-flip-num inline-block font-mono font-bold tabular-nums"
      style={{
        transform: flipping ? 'translateY(-100%) scaleY(0.4)' : 'translateY(0) scaleY(1)',
        opacity: flipping ? 0 : 1,
        transition: 'transform 0.22s cubic-bezier(.25,1,.5,1), opacity 0.18s ease',
        display: 'inline-block',
      }}
    >
      {String(displayed).padStart(pad, '0')}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────
   3D Tilt Card
───────────────────────────────────────────────────────────────── */
function TiltCard({
  children, className = '', style = {},
}: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1100px) rotateX(${y * 7}deg) rotateY(${-x * 7}deg) scale3d(1.015,1.015,1.015)`;
    const shine = el.querySelector<HTMLElement>('.fp-shine');
    if (shine) {
      shine.style.opacity = '1';
      shine.style.background = `radial-gradient(circle at ${(x + .5) * 100}% ${(y + .5) * 100}%, rgba(255,255,255,0.09) 0%, transparent 65%)`;
    }
  }, []);
  const onMouseLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    const shine = el.querySelector<HTMLElement>('.fp-shine');
    if (shine) shine.style.opacity = '0';
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{ ...style, transition: 'transform 0.2s cubic-bezier(.25,1,.5,1)', transformStyle: 'preserve-3d', willChange: 'transform' }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div className="fp-shine absolute inset-0 rounded-3xl pointer-events-none z-[1]"
        style={{ opacity: 0, transition: 'opacity 0.2s ease' }} />
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Slide Transition
───────────────────────────────────────────────────────────────── */
function SlideTransition({
  id, direction, children, className = '',
}: { id: string | number; direction: 'next' | 'prev'; children: React.ReactNode; className?: string }) {
  const [phase, setPhase] = useState<'enter' | 'visible'>('visible');
  const prevId = useRef(id);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    if (id === prevId.current) return;
    prevId.current = id;
    setPhase('enter');
    const t = setTimeout(() => setPhase('visible'), 30);
    return () => clearTimeout(t);
  }, [id]);
  const enterX = direction === 'next' ? 28 : -28;
  return (
    <div
      className={className}
      style={{
        opacity: phase === 'enter' ? 0 : 1,
        transform: phase === 'enter' ? `translateX(${enterX}px) scale(0.98)` : 'translateX(0) scale(1)',
        transition: 'opacity 0.4s cubic-bezier(.25,1,.5,1), transform 0.4s cubic-bezier(.25,1,.5,1)',
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Shimmer Bar
───────────────────────────────────────────────────────────────── */
function ShimmerBar({
  pct, barClass, glowRgb, delay = 0,
}: { pct: number; barClass: string; glowRgb: string; delay?: number }) {
  return (
    <div className="relative h-1.5 rounded-full overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.07)' }}>
      <div
        className={`fp-bar h-full rounded-full ${barClass} relative overflow-hidden`}
        style={{
          width: `${Math.min(pct, 100)}%`,
          boxShadow: `0 0 12px rgba(${glowRgb},0.7)`,
          animationDelay: `${delay}s`,
        }}
      >
        <div className="fp-shimmer absolute inset-y-0 left-0 w-[60%]"
          style={{ animationDelay: `${delay + 1.0}s` }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Skeleton Loading
───────────────────────────────────────────────────────────────── */
function SkeletonLoader() {
  return (
    <section className="relative overflow-hidden min-h-[600px] flex items-center">
      <GalaxyCanvas />
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10 w-full">
        {/* Header skeleton */}
        <div className="flex items-end justify-between mb-10 gap-4">
          <div className="space-y-3">
            <div className="fp-skeleton h-3 w-28 rounded-full" />
            <div className="fp-skeleton h-10 w-56 rounded-xl" />
          </div>
          <div className="fp-skeleton h-9 w-24 rounded-xl" />
        </div>
        {/* Desktop card skeleton */}
        <div className="hidden md:flex items-center gap-0">
          <div className="fp-skeleton rounded-3xl flex-shrink-0"
            style={{ width: 'clamp(280px,36vw,420px)', aspectRatio: '1/1' }} />
          <div className="flex-1 rounded-3xl fp-skeleton ml-[-60px] h-[320px]" />
        </div>
        {/* Mobile skeleton */}
        <div className="md:hidden max-w-[420px] mx-auto space-y-4">
          <div className="fp-skeleton rounded-3xl w-full" style={{ aspectRatio: '4/3' }} />
          <div className="fp-skeleton rounded-3xl h-[280px] w-full" />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────────── */
export const FeaturedProducts = () => {
  const { products, loading } = useProducts({ featured: true, limit: 6, realtime: true });
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [autoPlay, setAutoPlay] = useState(true);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  /* ── navigation ── */
  const navigate_ = useCallback((dir: 'next' | 'prev') => {
    setDirection(dir);
    setCurrentIndex(i =>
      dir === 'next'
        ? (i + 1) % products.length
        : (i - 1 + products.length) % products.length
    );
  }, [products.length]);

  const startAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => navigate_('next'), 5500);
  }, [navigate_]);

  const stopAuto = useCallback(() => {
    if (autoRef.current) { clearInterval(autoRef.current); autoRef.current = null; }
    setAutoPlay(false);
  }, []);

  useEffect(() => {
    if (autoPlay && products.length > 0) startAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [autoPlay, products.length, startAuto]);

  const handleNext = useCallback(() => { stopAuto(); navigate_('next'); }, [stopAuto, navigate_]);
  const handlePrev = useCallback(() => { stopAuto(); navigate_('prev'); }, [stopAuto, navigate_]);
  const goTo = useCallback((idx: number) => {
    stopAuto();
    setDirection(idx > currentIndex ? 'next' : 'prev');
    setCurrentIndex(idx);
  }, [currentIndex, stopAuto]);

  /* ── swipe — only horizontal, ignore vertical scroll ── */
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 44) {
      dx < 0 ? handleNext() : handlePrev();
    }
  }, [handleNext, handlePrev]);

  /* ── keyboard ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNext, handlePrev]);

  /* ── scroll reveal ── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || loading) return;
    const obs = new IntersectionObserver(
      es => es.forEach(e => e.target.classList.toggle('fp-in', e.isIntersecting)),
      { threshold: 0.04 },
    );
    el.querySelectorAll('.fp-reveal').forEach(n => obs.observe(n));
    return () => obs.disconnect();
  }, [loading]);

  if (loading) return <SkeletonLoader />;
  if (products.length === 0) return null;

  const product = products[currentIndex];
  const cat = product.category.toLowerCase();
  const cfg = getCfg(cat);
  const fallback = IMAGE_MAP[cat] ?? indicaImg;
  const imgSrc = product.image_url || fallback;
  const price = 800 + Math.round(product.thc * 30);
  const total = products.length;
  const effects: string[] = Array.isArray((product as any).effects) ? (product as any).effects : [];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden text-white py-12 md:py-20 w-full"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ══ Global Styles ══ */}
      <style>{`
        /* Scroll reveal */
        .fp-reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity .65s cubic-bezier(.25,1,.5,1), transform .65s cubic-bezier(.25,1,.5,1);
        }
        .fp-reveal.fp-in { opacity: 1; transform: translateY(0); }

        /* Bar fill */
        @keyframes fp-bar { from { width: 0% } }
        .fp-bar { animation: fp-bar 1.1s cubic-bezier(.25,1,.5,1) forwards; }

        /* Shimmer sweep */
        @keyframes fp-shimmer-sweep {
          0%   { transform: translateX(-100%) skewX(-15deg); opacity: 0; }
          20%  { opacity: 1; }
          100% { transform: translateX(250%) skewX(-15deg); opacity: 0; }
        }
        .fp-shimmer {
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.5), transparent);
          animation: fp-shimmer-sweep 0.85s cubic-bezier(.25,1,.5,1) 1 forwards;
          pointer-events: none;
        }

        /* Ken Burns */
        @keyframes fp-kenburns {
          from { transform: scale(1.07) translateX(1%); }
          to   { transform: scale(1.0) translateX(0%); }
        }
        .fp-kenburns { animation: fp-kenburns 6s cubic-bezier(.25,1,.5,1) forwards; }

        /* Floating particles */
        @keyframes fp-float {
          0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 0.5; }
          100% { transform: translateY(-200px) translateX(var(--drift)) scale(0.2); opacity: 0; }
        }
        .fp-particle { animation: fp-float var(--dur, 4s) ease-in-out infinite; }

        /* Glow pulse */
        @keyframes fp-glow-pulse {
          0%, 100% { opacity: 0.28; }
          50%       { opacity: 0.60; }
        }
        .fp-glow-border { animation: fp-glow-pulse 3s ease-in-out infinite; }

        /* Thumb ring pulse */
        @keyframes fp-thumb-pulse {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .fp-thumb-ring { animation: fp-thumb-pulse 2.2s ease-out infinite; }

        /* Staggered content */
        .fp-stagger > * {
          opacity: 0;
          transform: translateY(10px);
          animation: fp-stagger-in 0.45s cubic-bezier(.25,1,.5,1) forwards;
        }
        @keyframes fp-stagger-in { to { opacity: 1; transform: translateY(0); } }
        .fp-stagger > *:nth-child(1) { animation-delay: 0.04s; }
        .fp-stagger > *:nth-child(2) { animation-delay: 0.10s; }
        .fp-stagger > *:nth-child(3) { animation-delay: 0.16s; }
        .fp-stagger > *:nth-child(4) { animation-delay: 0.22s; }
        .fp-stagger > *:nth-child(5) { animation-delay: 0.28s; }
        .fp-stagger > *:nth-child(6) { animation-delay: 0.34s; }

        /* Nav button */
        .fp-nav-btn {
          background: rgba(0,0,0,0.60);
          border: 1px solid rgba(255,255,255,0.13);
          transition: all 0.22s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .fp-nav-btn:hover {
          background: rgba(16,185,129,0.14);
          border-color: rgba(16,185,129,0.48);
          box-shadow: 0 0 20px rgba(16,185,129,0.28);
        }
        .fp-nav-btn:active { transform: scale(0.90); }

        /* Autoplay progress */
        @keyframes fp-progress { from { transform: scaleX(0) } to { transform: scaleX(1) } }
        .fp-progress { animation: fp-progress 5.5s linear forwards; transform-origin: left; }

        /* Spotlight */
        @keyframes fp-spotlight {
          0%, 100% { opacity: 0.50; transform: scale(1); }
          50%       { opacity: 0.75; transform: scale(1.08); }
        }
        .fp-spotlight { animation: fp-spotlight 4s ease-in-out infinite; }

        /* Skeleton shimmer */
        @keyframes fp-skel {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .fp-skeleton {
          background: linear-gradient(90deg,
            rgba(255,255,255,0.04) 25%,
            rgba(255,255,255,0.10) 50%,
            rgba(255,255,255,0.04) 75%
          );
          background-size: 200% 100%;
          animation: fp-skel 1.6s ease-in-out infinite;
        }

        /* Hide scrollbar cross-browser */
        .fp-strip-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .fp-strip-scroll::-webkit-scrollbar { display: none; }

        /* Effects pill overflow clamp */
        .fp-effects { display: flex; flex-wrap: wrap; gap: 6px; }
        .fp-effects-mob { display: flex; flex-wrap: nowrap; overflow: hidden; gap: 6px; }
      `}</style>

      {/* ══ Background ══ */}
      <div className="absolute inset-0">
        <GalaxyCanvas />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 25%, rgba(0,0,0,0.65) 100%)' }} />
        <div
          key={cat + '-spotlight'}
          className="fp-spotlight absolute pointer-events-none rounded-full"
          style={{
            width: '55vw', height: '55vw',
            left: '8%', top: '4%',
            background: `radial-gradient(circle, rgba(${cfg.glowRgb},0.065) 0%, transparent 70%)`,
            transition: 'background 1.1s ease',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">

        {/* ══ Header ══ */}
        <div className="fp-reveal flex items-end justify-between mb-8 md:mb-12 gap-4">
          <div className="space-y-2">
            <p className="text-[10px] tracking-[0.34em] uppercase flex items-center gap-2"
              style={{ color: 'rgba(16,185,129,0.72)' }}>
              <Leaf className="h-3 w-3" />Curated Selection
            </p>
            <h2 className="font-display leading-[1.05] tracking-tight text-white"
              style={{ fontSize: 'clamp(1.9rem, 5vw, 3.2rem)', fontWeight: 400 }}>
              Featured{' '}
              <span className="italic" style={{ color: 'hsl(var(--accent))' }}>Strains</span>
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
              <span className="text-sm" style={{ color: cfg.accent }}>
                <FlipNumber value={currentIndex + 1} />
              </span>
              <span className="text-[11px] text-white/25">/</span>
              <span className="text-sm text-white/35 font-mono">{String(total).padStart(2, '0')}</span>
            </div>
            {!autoPlay && (
              <button onClick={() => setAutoPlay(true)} title="Resume auto-play"
                className="fp-nav-btn flex items-center justify-center h-9 w-9 rounded-full">
                <RotateCcw className="h-3.5 w-3.5 text-white/55" />
              </button>
            )}
            <Button variant="ghost" onClick={() => navigate('/products')}
              className="group text-sm font-medium tracking-wide rounded-xl
                border border-white/12 hover:border-white/30
                text-white/50 hover:text-white transition-all hover:bg-white/5">
              View All
              <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* ══ DESKTOP LAYOUT (md+) ══ */}
        <div className="fp-reveal hidden md:block" style={{ transitionDelay: '70ms' }}>
          <div className="flex items-stretch relative">

            {/* Image */}
            <div
              className="flex-shrink-0 relative rounded-3xl overflow-hidden"
              style={{
                width: 'clamp(260px, 36vw, 420px)',
                aspectRatio: '1/1',
                zIndex: 0,
              }}
            >
              <div className="absolute inset-0 rounded-3xl pointer-events-none z-20"
                style={{ boxShadow: `0 0 70px -10px rgba(${cfg.glowRgb},0.42)`, transition: 'box-shadow 0.8s ease' }} />
              {/* Right dissolve */}
              <div className="absolute inset-y-0 right-0 z-20 pointer-events-none"
                style={{ width: '46%', background: 'linear-gradient(to right, transparent 0%, #050a06 100%)' }} />

              <SlideTransition id={product.id} direction={direction} className="absolute inset-0 w-full h-full">
                <img key={product.id} src={imgSrc} alt={product.name}
                  className="fp-kenburns w-full h-full object-cover" draggable={false} />
              </SlideTransition>

              <div className="absolute inset-0 z-[2] pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 50%, transparent 100%)' }} />

              <FloatingParticles glowRgb={cfg.glowRgb} />

              {/* Badges */}
              <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.13em] px-3 py-1.5 backdrop-blur-md ${cfg.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${cfg.dotClass}`} />
                  {product.category}
                </span>
                {product.is_new && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--accent))] text-black text-[8px] font-bold uppercase tracking-[0.1em] px-2.5 py-1">
                    <Sparkles className="h-2.5 w-2.5" />New Arrival
                  </span>
                )}
                {product.is_popular && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/90 text-black text-[8px] font-bold uppercase tracking-[0.1em] px-2.5 py-1">
                    <Star className="h-2.5 w-2.5 fill-current" />Popular
                  </span>
                )}
              </div>

              {/* Shield */}
              <div className="absolute top-4 right-4 z-30">
                <div className="relative">
                  <div className="fp-glow-border absolute inset-0 rounded-full pointer-events-none"
                    style={{ border: `1px solid rgba(${cfg.glowRgb},0.55)`, borderRadius: '50%' }} />
                  <span className="relative flex items-center justify-center h-9 w-9 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.72)', border: `1px solid rgba(${cfg.glowRgb},0.35)` }}>
                    <ShieldCheck className="h-4 w-4" style={{ color: cfg.accent }} strokeWidth={2.5} />
                  </span>
                </div>
              </div>

              {/* Progress */}
              {autoPlay && (
                <div className="absolute bottom-0 inset-x-0 z-30 h-[2.5px] overflow-hidden rounded-b-3xl"
                  style={{ background: 'rgba(0,0,0,0.28)' }}>
                  <div key={currentIndex + '-prog'} className="fp-progress h-full rounded-full"
                    style={{ background: `linear-gradient(to right, ${cfg.accent}, rgba(${cfg.glowRgb},0.45))` }} />
                </div>
              )}
            </div>

            {/* Info Card */}
            <TiltCard
              key={product.id + '-tilt'}
              className="flex-1 min-w-0"
              style={{ marginLeft: 'clamp(-50px, -5vw, -80px)', position: 'relative', zIndex: 10 }}
            >
              <div className="relative rounded-3xl overflow-hidden h-full"
                style={{
                  background: '#050a06',
                  borderTop: `1.5px solid rgba(${cfg.glowRgb},0.32)`,
                  borderRight: `1.5px solid rgba(${cfg.glowRgb},0.32)`,
                  borderBottom: `1.5px solid rgba(${cfg.glowRgb},0.32)`,
                  borderLeft: 'none',
                  boxShadow: `0 0 60px -14px rgba(${cfg.glowRgb},0.5), 0 30px 70px -8px rgba(0,0,0,0.88), inset 0 1px 0 rgba(255,255,255,0.06)`,
                  transition: 'border-color 0.8s ease, box-shadow 0.8s ease',
                }}
              >
                <div className="fp-glow-border absolute inset-0 rounded-3xl pointer-events-none z-0"
                  style={{ background: `radial-gradient(ellipse 80% 60% at 80% 50%, rgba(${cfg.glowRgb},0.055) 0%, transparent 70%)`, transition: 'background 0.8s ease' }} />
                <div className="absolute top-0 inset-x-0 h-[2px] z-10"
                  style={{ background: `linear-gradient(to right, rgba(${cfg.glowRgb},0) 0%, ${cfg.accent} 30%, ${cfg.accent} 70%, transparent 100%)`, transition: 'background 0.8s ease' }} />

                <div className="relative z-[2] p-6 lg:p-8 pl-12 lg:pl-14">
                  <SlideTransition id={product.id + '-info'} direction={direction}>
                    <div className="fp-stagger" key={product.id + '-stagger'}>

                      {/* Name + desc */}
                      <div className="mb-5">
                        <h3 className="font-display font-normal leading-tight mb-2"
                          style={{
                            fontSize: 'clamp(1.3rem, 2.4vw, 1.85rem)',
                            textShadow: `0 0 36px rgba(${cfg.glowRgb},0.32)`,
                            transition: 'text-shadow 0.8s ease',
                          }}>
                          {product.name}
                        </h3>
                        <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.48)' }}>
                          {product.description}
                        </p>
                      </div>

                      {/* THC / CBD */}
                      <div className="space-y-2 mb-5">
                        <div className="rounded-2xl px-4 py-3"
                          style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(${cfg.glowRgb},0.18)` }}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.17em]" style={{ color: cfg.accent }}>THC</span>
                            <span className="text-sm font-mono font-bold text-white">{product.thc}%</span>
                          </div>
                          <ShimmerBar pct={product.thc * 3.3} barClass={cfg.barClass} glowRgb={cfg.glowRgb} delay={0.3} />
                        </div>
                        <div className="rounded-2xl px-4 py-3"
                          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-white/38">CBD</span>
                            <span className="text-sm font-mono font-bold text-white/65">{product.cbd}%</span>
                          </div>
                          <ShimmerBar pct={product.cbd * 10} barClass="bg-white/32" glowRgb="255,255,255" delay={0.5} />
                        </div>
                      </div>

                      {/* Effects */}
                      {effects.length > 0 && (
                        <div className="fp-effects mb-5">
                          {effects.slice(0, 5).map((fx: string) => (
                            <span key={fx} className="rounded-full text-[9px] font-medium tracking-wide px-3 py-1"
                              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.11)', color: 'rgba(255,255,255,0.58)' }}>
                              {fx}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Price + CTAs */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase tracking-[0.2em] text-white/28 mb-0.5">Price</span>
                          <span className="text-xl font-mono font-bold"
                            style={{ color: cfg.accent, textShadow: `0 0 18px rgba(${cfg.glowRgb},0.5)` }}>
                            ฿{price.toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => navigate(`/products/${product.id}`)}
                          className="flex-1 min-w-[120px] h-11 rounded-2xl text-[11px] font-bold uppercase tracking-[0.18em] flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.96]"
                          style={{
                            background: `linear-gradient(135deg, ${cfg.accent} 0%, rgba(${cfg.glowRgb},0.70) 100%)`,
                            color: '#000',
                            boxShadow: `0 4px 22px -4px rgba(${cfg.glowRgb},0.68), 0 1px 0 rgba(255,255,255,0.16) inset`,
                          }}
                          onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.12)')}
                          onMouseLeave={e => (e.currentTarget.style.filter = '')}
                        >
                          View Details <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                        <a
                          href="https://line.me/R/ti/p/@674dxgnq"
                          target="_blank" rel="noopener noreferrer"
                          className="flex-1 min-w-[100px] h-11 rounded-2xl text-[11px] font-bold uppercase tracking-[0.18em] flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.96]"
                          style={{ background: 'rgba(0,185,0,0.09)', border: '1.5px solid rgba(0,185,0,0.42)', color: '#00B900' }}
                          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#00B900'; el.style.color = '#fff'; el.style.boxShadow = '0 4px 20px -4px rgba(0,185,0,0.60)'; }}
                          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(0,185,0,0.09)'; el.style.color = '#00B900'; el.style.boxShadow = ''; }}
                        >
                          LINE Order
                        </a>
                      </div>

                    </div>
                  </SlideTransition>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>

        {/* ══ MOBILE LAYOUT ══ */}
        <div className="fp-reveal md:hidden" style={{ transitionDelay: '70ms' }}>
          <div className="mx-auto" style={{ maxWidth: 'min(420px, 100%)' }}>

            {/* Image — 4:3 on mobile for better content ratio */}
            <div className="relative rounded-3xl overflow-hidden mb-4 w-full" style={{ aspectRatio: '4/3' }}>
              <div className="absolute inset-0 rounded-3xl pointer-events-none z-20"
                style={{ boxShadow: `inset 0 0 0 1.5px rgba(${cfg.glowRgb},0.38)`, transition: 'box-shadow 0.8s ease' }} />
              <SlideTransition id={product.id + '-mob'} direction={direction} className="absolute inset-0 w-full h-full">
                <img src={imgSrc} alt={product.name}
                  className="fp-kenburns w-full h-full object-cover" draggable={false} />
              </SlideTransition>
              <div className="absolute inset-0 z-[2]"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.52) 0%, transparent 55%)' }} />
              <FloatingParticles glowRgb={cfg.glowRgb} />

              <div className="absolute top-3 left-3 z-30 flex flex-col gap-1.5">
                <span className={`inline-flex items-center gap-1 rounded-full text-[8.5px] font-bold uppercase tracking-[0.12em] px-2.5 py-1.5 backdrop-blur-md ${cfg.badge}`}>
                  <span className={`w-1 h-1 rounded-full animate-pulse ${cfg.dotClass}`} />{product.category}
                </span>
                {product.is_new && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-[hsl(var(--accent))] text-black text-[7.5px] font-bold uppercase tracking-[0.1em] px-2 py-1">
                    <Sparkles className="h-2 w-2" />New
                  </span>
                )}
              </div>
              <div className="absolute top-3 right-3 z-30">
                <span className="flex items-center justify-center h-8 w-8 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.72)', border: `1px solid rgba(${cfg.glowRgb},0.38)` }}>
                  <ShieldCheck className="h-3.5 w-3.5" style={{ color: cfg.accent }} strokeWidth={2.5} />
                </span>
              </div>

              {/* Progress inside image */}
              {autoPlay && (
                <div className="absolute bottom-0 inset-x-0 z-30 h-[2.5px] overflow-hidden rounded-b-3xl"
                  style={{ background: 'rgba(0,0,0,0.28)' }}>
                  <div key={currentIndex + '-mob-prog'} className="fp-progress h-full rounded-full"
                    style={{ background: `linear-gradient(to right, ${cfg.accent}, rgba(${cfg.glowRgb},0.45))` }} />
                </div>
              )}
            </div>

            {/* Card */}
            <div className="rounded-3xl overflow-hidden relative"
              style={{
                background: '#050a06',
                border: `1.5px solid rgba(${cfg.glowRgb},0.30)`,
                boxShadow: `0 0 44px -12px rgba(${cfg.glowRgb},0.45), 0 18px 50px rgba(0,0,0,0.82)`,
                transition: 'border-color 0.8s ease, box-shadow 0.8s ease',
              }}>
              <div className="absolute top-0 inset-x-0 h-[2px]"
                style={{ background: `linear-gradient(to right, transparent, ${cfg.accent}, transparent)`, transition: 'background 0.8s ease' }} />

              <div className="relative p-5">
                <SlideTransition id={product.id + '-mob-info'} direction={direction}>
                  <div className="fp-stagger" key={product.id + '-mob-stagger'}>

                    <div className="mb-4">
                      <h3 className="font-display font-normal text-white leading-tight mb-1.5"
                        style={{ fontSize: 'clamp(1.2rem, 5.5vw, 1.5rem)' }}>
                        {product.name}
                      </h3>
                      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.46)' }}>
                        {product.description}
                      </p>
                    </div>

                    {/* THC / CBD */}
                    <div className="space-y-2 mb-4">
                      <div className="rounded-xl px-3.5 py-2.5"
                        style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(${cfg.glowRgb},0.18)` }}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: cfg.accent }}>THC</span>
                          <span className="text-xs font-mono font-bold text-white">{product.thc}%</span>
                        </div>
                        <ShimmerBar pct={product.thc * 3.3} barClass={cfg.barClass} glowRgb={cfg.glowRgb} delay={0.3} />
                      </div>
                      <div className="rounded-xl px-3.5 py-2.5"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/36">CBD</span>
                          <span className="text-xs font-mono font-bold text-white/62">{product.cbd}%</span>
                        </div>
                        <ShimmerBar pct={product.cbd * 10} barClass="bg-white/32" glowRgb="255,255,255" delay={0.5} />
                      </div>
                    </div>

                    {/* Effects — max 3 on mobile, +N overflow pill */}
                    {effects.length > 0 && (
                      <div className="fp-effects-mob mb-4" style={{ maxWidth: '100%' }}>
                        {effects.slice(0, 3).map((fx: string) => (
                          <span key={fx} className="flex-shrink-0 rounded-full text-[8.5px] font-medium tracking-wide px-2.5 py-1"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.54)' }}>
                            {fx}
                          </span>
                        ))}
                        {effects.length > 3 && (
                          <span className="flex-shrink-0 rounded-full text-[8.5px] font-medium px-2.5 py-1"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.35)' }}>
                            +{effects.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Price row */}
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="font-mono font-bold" style={{ fontSize: 'clamp(1rem, 4.5vw, 1.2rem)', color: cfg.accent }}>
                        ฿{price.toLocaleString()}
                      </span>
                      {product.is_popular && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-white/88 text-black text-[7.5px] font-bold uppercase tracking-[0.1em] px-2 py-1">
                          <Star className="h-2 w-2 fill-current" />Popular
                        </span>
                      )}
                    </div>

                    {/* CTAs */}
                    <div className="flex gap-2.5">
                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="flex-1 rounded-xl text-[10px] font-bold uppercase tracking-[0.16em] flex items-center justify-center gap-1.5 transition-all active:scale-[0.95]"
                        style={{
                          height: '44px',
                          background: `linear-gradient(135deg, ${cfg.accent}, rgba(${cfg.glowRgb},0.70))`,
                          color: '#000',
                          boxShadow: `0 4px 18px -4px rgba(${cfg.glowRgb},0.62)`,
                        }}>
                        View Details <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </button>
                      <a
                        href="https://line.me/R/ti/p/@674dxgnq"
                        target="_blank" rel="noopener noreferrer"
                        className="flex-1 rounded-xl text-[10px] font-bold uppercase tracking-[0.16em] flex items-center justify-center gap-1.5 transition-all active:scale-[0.95]"
                        style={{ height: '44px', background: 'rgba(0,185,0,0.09)', border: '1.5px solid rgba(0,185,0,0.38)', color: '#00B900' }}>
                        LINE Order
                      </a>
                    </div>

                  </div>
                </SlideTransition>
              </div>
            </div>

          </div>
        </div>

        {/* ══ Bottom Navigation — FIXED: always contained in max-w-6xl, never bleeds full-width ══ */}
        <div className="fp-reveal mt-8 md:mt-10" style={{ transitionDelay: '140ms' }}>

          {/* Single contained row: prev | thumbnails | next */}
          <div className="flex items-center gap-3" style={{ maxWidth: '100%' }}>

            {/* Prev — always visible, never clipped */}
            <button
              onClick={handlePrev}
              aria-label="Previous strain"
              className="fp-nav-btn flex-shrink-0 rounded-full flex items-center justify-center"
              style={{ width: 44, height: 44, minWidth: 44 }}
            >
              <ChevronLeft className="w-5 h-5 text-white/65" />
            </button>

            {/* Scrollable thumbnail strip — fills remaining space */}
            <div
              className="fp-strip-scroll flex-1 overflow-x-auto"
              style={{ WebkitOverflowScrolling: 'touch' as any }}
            >
              <div className="flex items-center gap-2.5 py-1" style={{ width: 'max-content', paddingLeft: 2, paddingRight: 2 }}>
                {products.map((p, idx) => {
                  const isActive = idx === currentIndex;
                  const tCat = p.category.toLowerCase();
                  const tCfg = getCfg(tCat);
                  const tImg = p.image_url || IMAGE_MAP[tCat] || indicaImg;
                  /* 44px inactive meets iOS HIG minimum tap target */
                  const size = isActive ? 52 : 44;
                  return (
                    <button
                      key={p.id}
                      onClick={() => goTo(idx)}
                      aria-label={`Go to ${p.name}`}
                      className="relative rounded-2xl overflow-hidden flex-shrink-0"
                      style={{
                        width: size,
                        height: size,
                        outline: isActive ? `2px solid ${tCfg.accent}` : '2px solid rgba(255,255,255,0.09)',
                        outlineOffset: isActive ? '3px' : '2px',
                        boxShadow: isActive ? `0 0 16px 2px rgba(${tCfg.glowRgb},0.55)` : 'none',
                        transform: isActive ? 'scale(1.07)' : 'scale(1)',
                        opacity: isActive ? 1 : 0.50,
                        transition: 'all 0.32s cubic-bezier(.25,1,.5,1)',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <img src={tImg} alt={p.name}
                        className="w-full h-full object-cover" draggable={false} />
                      {isActive && (
                        <div
                          className="absolute inset-0 rounded-2xl pointer-events-none fp-thumb-ring"
                          style={{ border: `1.5px solid rgba(${tCfg.glowRgb},0.65)` }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Next — always visible, accented */}
            <button
              onClick={handleNext}
              aria-label="Next strain"
              className="fp-nav-btn flex-shrink-0 rounded-full flex items-center justify-center"
              style={{
                width: 44,
                height: 44,
                minWidth: 44,
                background: `rgba(${cfg.glowRgb}, 0.16)`,
                border: `1px solid rgba(${cfg.glowRgb}, 0.42)`,
                boxShadow: `0 0 20px rgba(${cfg.glowRgb}, 0.25)`,
                transition: 'all 0.32s ease',
              }}
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Active strain label */}
          <p className="text-center text-[9.5px] uppercase tracking-[0.28em] text-white/30 mt-3 transition-all duration-300">
            {product.name}
          </p>
        </div>

      </div>
    </section>
  );
};