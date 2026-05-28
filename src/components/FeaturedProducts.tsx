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
   FEATURE 1 — Floating Particles (smoke wisps per category)
───────────────────────────────────────────────────────────────── */
interface Particle { id:number; x:number; size:number; dur:number; delay:number; drift:number }

function FloatingParticles({ glowRgb, accent }: { glowRgb: string; accent: string }) {
  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: 14 }, (_, i) => ({
      id:    i,
      x:     10 + Math.random() * 80,        // % across image width
      size:  3  + Math.random() * 6,
      dur:   3.5 + Math.random() * 3,
      delay: Math.random() * 4,
      drift: (Math.random() - 0.5) * 30,
    }))
  , [glowRgb]);

  return (
    <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="fp-particle absolute rounded-full"
          style={{
            left:     `${p.x}%`,
            bottom:   '-10px',
            width:    p.size,
            height:   p.size,
            background: `radial-gradient(circle, rgba(${glowRgb},0.9) 0%, rgba(${glowRgb},0.2) 60%, transparent 100%)`,
            boxShadow:  `0 0 ${p.size * 2}px rgba(${glowRgb},0.6)`,
            animationDuration: `${p.dur}s`,
            animationDelay:    `${p.delay}s`,
            '--drift':         `${p.drift}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   FEATURE 2 — Animated number flip (strain counter)
───────────────────────────────────────────────────────────────── */
function FlipNumber({ value, pad = 2 }: { value: number; pad?: number }) {
  const [displayed, setDisplayed] = useState(value);
  const [flipping,  setFlipping]  = useState(false);

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
        transform:  flipping ? 'translateY(-100%) scaleY(0.4)' : 'translateY(0) scaleY(1)',
        opacity:    flipping ? 0 : 1,
        transition: 'transform 0.22s cubic-bezier(.25,1,.5,1), opacity 0.18s ease',
        display:    'inline-block',
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
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    el.style.transform = `perspective(1100px) rotateX(${y*9}deg) rotateY(${-x*9}deg) scale3d(1.018,1.018,1.018)`;
    const shine = el.querySelector<HTMLElement>('.fp-shine');
    if (shine) {
      shine.style.opacity    = '1';
      shine.style.background = `radial-gradient(circle at ${(x+.5)*100}% ${(y+.5)*100}%, rgba(255,255,255,0.10) 0%, transparent 65%)`;
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
   FEATURE 3 — Directional slide transition
───────────────────────────────────────────────────────────────── */
function SlideTransition({
  id, direction, children, className = '',
}: { id: string|number; direction: 'next'|'prev'; children: React.ReactNode; className?: string }) {
  const [phase, setPhase] = useState<'enter'|'visible'>('visible');
  const prevId  = useRef(id);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    if (id === prevId.current) return;
    prevId.current = id;
    setPhase('enter');
    const t = setTimeout(() => setPhase('visible'), 30);
    return () => clearTimeout(t);
  }, [id]);

  const enterX = direction === 'next' ? 32 : -32;
  return (
    <div
      className={className}
      style={{
        opacity:    phase === 'enter' ? 0 : 1,
        transform:  phase === 'enter' ? `translateX(${enterX}px) scale(0.98)` : 'translateX(0) scale(1)',
        transition: 'opacity 0.42s cubic-bezier(.25,1,.5,1), transform 0.42s cubic-bezier(.25,1,.5,1)',
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   FEATURE 4 — THC/CBD bar with shimmer sweep
───────────────────────────────────────────────────────────────── */
function ShimmerBar({
  pct, barClass, glowRgb, delay = 0,
}: { pct: number; barClass: string; glowRgb: string; delay?: number }) {
  return (
    <div className="relative h-2 rounded-full overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.08)' }}>
      <div
        className={`fp-bar h-full rounded-full ${barClass} relative overflow-hidden`}
        style={{
          width:            `${Math.min(pct, 100)}%`,
          boxShadow:        `0 0 14px rgba(${glowRgb},0.75)`,
          animationDelay:   `${delay}s`,
        }}
      >
        {/* Shimmer sweep — plays once after bar fills */}
        <div
          className="fp-shimmer absolute inset-y-0 left-0 w-[60%]"
          style={{ animationDelay: `${delay + 1.1}s` }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   FEATURE 5 — Thumbnail strip
───────────────────────────────────────────────────────────────── */
function ThumbnailStrip({
  products, currentIndex, onSelect,
}: {
  products: any[];
  currentIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-3">
      {products.map((p, idx) => {
        const isActive = idx === currentIndex;
        const tCat  = p.category.toLowerCase();
        const tCfg  = getCfg(tCat);
        const tImg  = p.image_url || IMAGE_MAP[tCat] || indicaImg;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(idx)}
            aria-label={`Go to ${p.name}`}
            className="relative rounded-2xl overflow-hidden flex-shrink-0 transition-all duration-350"
            style={{
              width:      isActive ? 56 : 40,
              height:     isActive ? 56 : 40,
              outline:    isActive ? `2px solid ${tCfg.accent}` : '2px solid rgba(255,255,255,0.1)',
              outlineOffset: isActive ? '3px' : '2px',
              boxShadow:  isActive ? `0 0 18px 2px rgba(${tCfg.glowRgb},0.6)` : 'none',
              transform:  isActive ? 'scale(1.08)' : 'scale(1)',
              transition: 'all 0.35s cubic-bezier(.25,1,.5,1)',
              opacity:    isActive ? 1 : 0.55,
            }}
          >
            <img
              src={tImg}
              alt={p.name}
              className="w-full h-full object-cover"
              draggable={false}
            />
            {/* Active glow ring pulse */}
            {isActive && (
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none fp-thumb-ring"
                style={{ border: `1.5px solid rgba(${tCfg.glowRgb},0.7)` }}
              />
            )}
          </button>
        );
      })}
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
  const [direction,    setDirection]    = useState<'next'|'prev'>('next');
  const [autoPlay,     setAutoPlay]     = useState(true);
  const autoRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const touchStartX = useRef(0);

  /* ── navigation helpers ── */
  const navigate_ = useCallback((dir: 'next'|'prev') => {
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

  /* ── swipe ── */
  const onTouchStart = useCallback((e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; }, []);
  const onTouchEnd   = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 44) dx < 0 ? handleNext() : handlePrev();
  }, [handleNext, handlePrev]);

  /* ── keyboard nav ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft')  handlePrev();
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
      { threshold: 0.05 },
    );
    el.querySelectorAll('.fp-reveal').forEach(n => obs.observe(n));
    return () => obs.disconnect();
  }, [loading]);

  /* ── loading ── */
  if (loading) {
    return (
      <section className="relative overflow-hidden min-h-[560px] flex items-center justify-center">
        <GalaxyCanvas />
        <div className="relative z-10 flex flex-col items-center gap-5">
          <div className="w-14 h-14 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'rgba(16,185,129,0.6)', borderTopColor: 'transparent' }} />
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/30">Loading strains…</p>
        </div>
      </section>
    );
  }
  if (products.length === 0) return null;

  const product  = products[currentIndex];
  const cat      = product.category.toLowerCase();
  const cfg      = getCfg(cat);
  const fallback = IMAGE_MAP[cat] ?? indicaImg;
  const imgSrc   = product.image_url || fallback;
  const price    = 800 + Math.round(product.thc * 30);
  const total    = products.length;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden text-white py-14 md:py-20 w-full"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ══ Global styles ══════════════════════════════════════ */}
      <style>{`
        /* ── Scroll reveal ── */
        .fp-reveal {
          opacity:0; transform:translateY(26px);
          transition: opacity .7s cubic-bezier(.25,1,.5,1), transform .7s cubic-bezier(.25,1,.5,1);
        }
        .fp-reveal.fp-in { opacity:1; transform:translateY(0); }

        /* ── THC/CBD bar fill ── */
        @keyframes fp-bar { from { width:0% } }
        .fp-bar { animation: fp-bar 1.1s cubic-bezier(.25,1,.5,1) forwards; }

        /* ── Bar shimmer sweep ── */
        @keyframes fp-shimmer-sweep {
          0%   { transform: translateX(-100%) skewX(-15deg); opacity: 0; }
          20%  { opacity: 1; }
          100% { transform: translateX(250%) skewX(-15deg); opacity: 0; }
        }
        .fp-shimmer {
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.55), transparent);
          animation: fp-shimmer-sweep 0.9s cubic-bezier(.25,1,.5,1) 1 forwards;
          pointer-events: none;
        }

        /* ── Image Ken Burns zoom ── */
        @keyframes fp-kenburns {
          from { transform: scale(1.08) translateX(1%);  }
          to   { transform: scale(1.0)  translateX(0%); }
        }
        .fp-kenburns { animation: fp-kenburns 6s cubic-bezier(.25,1,.5,1) forwards; }

        /* ── Floating particles ── */
        @keyframes fp-float {
          0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 0.6; }
          100% { transform: translateY(-220px) translateX(var(--drift)) scale(0.3); opacity: 0; }
        }
        .fp-particle { animation: fp-float var(--dur,4s) ease-in-out infinite; }

        /* ── Card border breathing glow ── */
        @keyframes fp-glow-pulse {
          0%,100% { opacity: 0.30; }
          50%     { opacity: 0.65; }
        }
        .fp-glow-border { animation: fp-glow-pulse 3s ease-in-out infinite; }

        /* ── Thumbnail pulse ring ── */
        @keyframes fp-thumb-pulse {
          0%   { transform: scale(1);   opacity: 0.7; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .fp-thumb-ring { animation: fp-thumb-pulse 2.2s ease-out infinite; }

        /* ── Staggered content entrance ── */
        .fp-stagger > * {
          opacity: 0;
          transform: translateY(12px);
          animation: fp-stagger-in 0.48s cubic-bezier(.25,1,.5,1) forwards;
        }
        @keyframes fp-stagger-in {
          to { opacity:1; transform:translateY(0); }
        }
        .fp-stagger > *:nth-child(1) { animation-delay: 0.04s; }
        .fp-stagger > *:nth-child(2) { animation-delay: 0.11s; }
        .fp-stagger > *:nth-child(3) { animation-delay: 0.18s; }
        .fp-stagger > *:nth-child(4) { animation-delay: 0.25s; }
        .fp-stagger > *:nth-child(5) { animation-delay: 0.32s; }
        .fp-stagger > *:nth-child(6) { animation-delay: 0.39s; }

        /* ── Nav button ── */
        .fp-nav-btn {
          background: rgba(0,0,0,0.65);
          border: 1px solid rgba(255,255,255,0.14);
          transition: all 0.22s ease;
        }
        .fp-nav-btn:hover {
          background: rgba(16,185,129,0.15);
          border-color: rgba(16,185,129,0.5);
          box-shadow: 0 0 22px rgba(16,185,129,0.3);
          transform: scale(1.1);
        }
        .fp-nav-btn:active { transform: scale(0.92); }

        /* ── Autoplay progress bar ── */
        @keyframes fp-progress { from { transform:scaleX(0) } to { transform:scaleX(1) } }
        .fp-progress { animation: fp-progress 5.5s linear forwards; transform-origin: left; }

        /* ── Spotlight behind image ── */
        @keyframes fp-spotlight {
          0%,100% { opacity: 0.55; transform: scale(1);   }
          50%      { opacity: 0.80; transform: scale(1.08); }
        }
        .fp-spotlight { animation: fp-spotlight 4s ease-in-out infinite; }
      `}</style>

      {/* ══ Background ═══════════════════════════════════════ */}
      <div className="absolute inset-0">
        <GalaxyCanvas />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 115% 95% at 50% 50%, transparent 28%, rgba(0,0,0,0.68) 100%)' }} />
        {/* Dynamic category spotlight */}
        <div
          key={cat + '-spotlight'}
          className="fp-spotlight absolute pointer-events-none rounded-full"
          style={{
            width: '55vw', height: '55vw',
            left: '10%', top: '5%',
            background: `radial-gradient(circle, rgba(${cfg.glowRgb},0.07) 0%, transparent 70%)`,
            transition: 'background 1.2s ease',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">

        {/* ══ Header ════════════════════════════════════════ */}
        <div className="fp-reveal flex items-end justify-between mb-10 md:mb-14 gap-4">
          <div className="space-y-2">
            <p className="text-[10px] tracking-[0.35em] uppercase flex items-center gap-2"
              style={{ color: 'rgba(16,185,129,0.75)' }}>
              <Leaf className="h-3 w-3" />Curated Selection
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-normal leading-[1.05] tracking-tight text-white">
              Featured{' '}
              <span className="italic" style={{ color: 'hsl(var(--accent))' }}>Strains</span>
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* ── FEATURE: strain counter ── */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="text-sm" style={{ color: cfg.accent }}>
                <FlipNumber value={currentIndex + 1} />
              </span>
              <span className="text-[11px] text-white/30">/</span>
              <span className="text-sm text-white/40 font-mono">{String(total).padStart(2,'0')}</span>
            </div>

            {!autoPlay && (
              <button onClick={() => setAutoPlay(true)} title="Resume auto-play"
                className="fp-nav-btn flex items-center justify-center h-9 w-9 rounded-full">
                <RotateCcw className="h-3.5 w-3.5 text-white/60" />
              </button>
            )}
            <Button variant="ghost" onClick={() => navigate('/products')}
              className="group text-sm font-medium tracking-wide rounded-xl
                border border-white/15 hover:border-white/35
                text-white/55 hover:text-white transition-all hover:bg-white/5">
              View All
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* ══ DESKTOP + TABLET LAYOUT ═══════════════════════ */}
        <div className="fp-reveal hidden md:block" style={{ transitionDelay: '80ms' }}>
          <div className="flex items-center relative">

            {/* ── Image — z-0 (behind card) ── */}
            <div
              className="flex-shrink-0 relative rounded-3xl overflow-hidden"
              style={{ width: 'clamp(300px,40vw,460px)', aspectRatio:'1/1', zIndex:0 }}
            >
              {/* Outer glow — no border-inset on right edge */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none z-20"
                style={{ boxShadow: `0 0 80px -8px rgba(${cfg.glowRgb},0.45)`, transition: 'box-shadow 0.8s ease' }} />

              {/* Right-edge dissolve into card */}
              <div className="absolute inset-y-0 right-0 z-20 pointer-events-none"
                style={{ width:'48%', background:'linear-gradient(to right, transparent 0%, #050a06 100%)' }} />

              {/* FEATURE: Ken Burns image */}
              <SlideTransition id={product.id} direction={direction} className="absolute inset-0 w-full h-full">
                <img
                  key={product.id}
                  src={imgSrc}
                  alt={product.name}
                  className="fp-kenburns w-full h-full object-cover"
                  draggable={false}
                />
              </SlideTransition>

              <div className="absolute inset-0 z-[2] pointer-events-none"
                style={{ background:'linear-gradient(to top,rgba(0,0,0,0.6) 0%,rgba(0,0,0,0.08) 50%,transparent 100%)' }} />

              {/* FEATURE: Floating particles */}
              <FloatingParticles glowRgb={cfg.glowRgb} accent={cfg.accent} />

              {/* Badges */}
              <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.14em] px-3 py-1.5 backdrop-blur-md ${cfg.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${cfg.dotClass}`} />
                  {product.category}
                </span>
                {product.is_new && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--accent))] text-black text-[8px] font-bold uppercase tracking-[0.1em] px-2.5 py-1">
                    <Sparkles className="h-2.5 w-2.5" />New Arrival
                  </span>
                )}
                {product.is_popular && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/92 text-black text-[8px] font-bold uppercase tracking-[0.1em] px-2.5 py-1">
                    <Star className="h-2.5 w-2.5 fill-current" />Popular
                  </span>
                )}
              </div>

              {/* Shield */}
              <div className="absolute top-4 right-4 z-30">
                <div className="relative">
                  <div className="fp-glow-border absolute inset-0 rounded-full pointer-events-none"
                    style={{ border:`1px solid rgba(${cfg.glowRgb},0.6)`, borderRadius:'50%' }} />
                  <span className="relative flex items-center justify-center h-9 w-9 rounded-full"
                    style={{ background:'rgba(0,0,0,0.75)', border:`1px solid rgba(${cfg.glowRgb},0.4)` }}>
                    <ShieldCheck className="h-4 w-4" style={{ color: cfg.accent }} strokeWidth={2.5} />
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              {autoPlay && (
                <div className="absolute bottom-0 inset-x-0 z-30 h-[3px] overflow-hidden rounded-b-3xl"
                  style={{ background:'rgba(0,0,0,0.3)' }}>
                  <div key={currentIndex+'-prog'} className="fp-progress h-full rounded-full"
                    style={{ background:`linear-gradient(to right, ${cfg.accent}, rgba(${cfg.glowRgb},0.5))` }} />
                </div>
              )}
            </div>

            {/* ── Info Card — z-10 (in front of image) ── */}
            <TiltCard
              key={product.id+'-tilt'}
              className="fp-slide-right flex-1 min-w-0"
              style={{ marginLeft:'-80px', position:'relative', zIndex:10 }}
            >
              <div className="relative rounded-3xl overflow-hidden"
                style={{
                  background: '#050a06',
                  borderTop:    `1.5px solid rgba(${cfg.glowRgb},0.35)`,
                  borderRight:  `1.5px solid rgba(${cfg.glowRgb},0.35)`,
                  borderBottom: `1.5px solid rgba(${cfg.glowRgb},0.35)`,
                  borderLeft:   'none',
                  boxShadow:    `0 0 65px -12px rgba(${cfg.glowRgb},0.55),
                                 0 32px 80px -8px rgba(0,0,0,0.92),
                                 inset 0 1px 0 rgba(255,255,255,0.07)`,
                  transition:   'border-color 0.8s ease, box-shadow 0.8s ease',
                }}
              >
                {/* Breathing glow border overlay */}
                <div
                  className="fp-glow-border absolute inset-0 rounded-3xl pointer-events-none z-0"
                  style={{
                    background: `radial-gradient(ellipse 80% 60% at 80% 50%, rgba(${cfg.glowRgb},0.06) 0%, transparent 70%)`,
                    transition: 'background 0.8s ease',
                  }}
                />

                {/* Top accent line */}
                <div className="absolute top-0 inset-x-0 h-[2px] z-10"
                  style={{ background:`linear-gradient(to right, rgba(${cfg.glowRgb},0) 0%, ${cfg.accent} 25%, ${cfg.accent} 75%, transparent 100%)`, transition:'background 0.8s ease' }} />

                {/* FEATURE: Staggered content entrance */}
                <div className="relative z-[2] p-7 lg:p-9 pl-14 lg:pl-16">
                  <SlideTransition id={product.id+'-info'} direction={direction}>
                    <div className="fp-stagger" key={product.id+'-stagger'}>

                      {/* Name + desc */}
                      <div className="mb-6">
                        <h3 className="text-2xl lg:text-[1.9rem] font-display font-normal leading-tight mb-2.5"
                          style={{ textShadow:`0 0 40px rgba(${cfg.glowRgb},0.35)`, transition:'text-shadow 0.8s ease' }}>
                          {product.name}
                        </h3>
                        <p className="text-sm leading-relaxed" style={{ color:'rgba(255,255,255,0.5)' }}>
                          {product.description}
                        </p>
                      </div>

                      {/* FEATURE: Shimmer bars */}
                      <div className="space-y-2.5 mb-6">
                        <div className="rounded-2xl px-4 py-3.5"
                          style={{ background:'rgba(255,255,255,0.04)', border:`1px solid rgba(${cfg.glowRgb},0.2)` }}>
                          <div className="flex justify-between items-center mb-2.5">
                            <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color:cfg.accent }}>THC</span>
                            <span className="text-sm font-mono font-bold text-white">{product.thc}%</span>
                          </div>
                          <ShimmerBar pct={product.thc * 3.3} barClass={cfg.barClass} glowRgb={cfg.glowRgb} delay={0.3} />
                        </div>
                        <div className="rounded-2xl px-4 py-3.5"
                          style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)' }}>
                          <div className="flex justify-between items-center mb-2.5">
                            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">CBD</span>
                            <span className="text-sm font-mono font-bold text-white/70">{product.cbd}%</span>
                          </div>
                          <ShimmerBar pct={product.cbd * 10} barClass="bg-white/35" glowRgb="255,255,255" delay={0.5} />
                        </div>
                      </div>

                      {/* Effects */}
                      {'effects' in product && Array.isArray((product as any).effects) && (product as any).effects.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {((product as any).effects as string[]).slice(0,5).map((fx:string) => (
                            <span key={fx} className="rounded-full text-[9px] font-medium tracking-wide px-3 py-1"
                              style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.6)' }}>
                              {fx}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Price + CTAs */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-0.5">Price</span>
                          <span className="text-xl font-mono font-bold"
                            style={{ color:cfg.accent, textShadow:`0 0 20px rgba(${cfg.glowRgb},0.55)` }}>
                            ฿{price.toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => navigate(`/products/${product.id}`)}
                          className="flex-1 min-w-[120px] h-11 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.96]"
                          style={{
                            background:`linear-gradient(135deg,${cfg.accent} 0%,rgba(${cfg.glowRgb},0.72) 100%)`,
                            color:'#000',
                            boxShadow:`0 4px 24px -4px rgba(${cfg.glowRgb},0.72), 0 1px 0 rgba(255,255,255,0.18) inset`,
                          }}
                          onMouseEnter={e => (e.currentTarget.style.filter='brightness(1.14)')}
                          onMouseLeave={e => (e.currentTarget.style.filter='')}
                        >
                          View Details
                          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                        <a
                          href="https://line.me/R/ti/p/@674dxgnq"
                          target="_blank" rel="noopener noreferrer"
                          className="flex-1 min-w-[100px] h-11 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.96]"
                          style={{ background:'rgba(0,185,0,0.1)', border:'1.5px solid rgba(0,185,0,0.45)', color:'#00B900' }}
                          onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.background='#00B900'; el.style.color='#fff'; el.style.boxShadow='0 4px 22px -4px rgba(0,185,0,0.65)'; }}
                          onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.background='rgba(0,185,0,0.1)'; el.style.color='#00B900'; el.style.boxShadow=''; }}
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

        {/* ══ MOBILE LAYOUT ════════════════════════════════ */}
        <div className="fp-reveal md:hidden" style={{ transitionDelay:'80ms' }}>
          <div className="max-w-[420px] mx-auto">

            {/* Image */}
            <div className="relative rounded-3xl overflow-hidden mb-5 w-full" style={{ aspectRatio:'1/1' }}>
              <div className="absolute inset-0 rounded-3xl pointer-events-none z-20"
                style={{ boxShadow:`inset 0 0 0 1.5px rgba(${cfg.glowRgb},0.4)`, transition:'box-shadow 0.8s ease' }} />
              <SlideTransition id={product.id+'-mob'} direction={direction} className="absolute inset-0 w-full h-full">
                <img src={imgSrc} alt={product.name}
                  className="fp-kenburns w-full h-full object-cover" draggable={false} />
              </SlideTransition>
              <div className="absolute inset-0 z-[2]"
                style={{ background:'linear-gradient(to top,rgba(0,0,0,0.55) 0%,transparent 60%)' }} />
              <FloatingParticles glowRgb={cfg.glowRgb} accent={cfg.accent} />

              <div className="absolute top-3.5 left-3.5 z-30 flex flex-col gap-1.5">
                <span className={`inline-flex items-center gap-1 rounded-full text-[8px] font-bold uppercase tracking-[0.13em] px-2.5 py-1 backdrop-blur-md ${cfg.badge}`}>
                  <span className={`w-1 h-1 rounded-full animate-pulse ${cfg.dotClass}`} />{product.category}
                </span>
                {product.is_new && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-[hsl(var(--accent))] text-black text-[7.5px] font-bold uppercase tracking-[0.1em] px-2 py-0.5">
                    <Sparkles className="h-2 w-2" />New
                  </span>
                )}
              </div>
              <div className="absolute top-3.5 right-3.5 z-30">
                <span className="flex items-center justify-center h-8 w-8 rounded-full"
                  style={{ background:'rgba(0,0,0,0.75)', border:`1px solid rgba(${cfg.glowRgb},0.4)` }}>
                  <ShieldCheck className="h-3.5 w-3.5" style={{ color:cfg.accent }} strokeWidth={2.5} />
                </span>
              </div>
              {autoPlay && (
                <div className="absolute bottom-0 inset-x-0 z-30 h-[3px] overflow-hidden rounded-b-3xl"
                  style={{ background:'rgba(0,0,0,0.3)' }}>
                  <div key={currentIndex+'-mob-prog'} className="fp-progress h-full rounded-full"
                    style={{ background:`linear-gradient(to right,${cfg.accent},rgba(${cfg.glowRgb},0.5))` }} />
                </div>
              )}
            </div>

            {/* Card */}
            <div className="rounded-3xl overflow-hidden relative"
              style={{
                background:'#050a06',
                border:`1.5px solid rgba(${cfg.glowRgb},0.32)`,
                boxShadow:`0 0 50px -12px rgba(${cfg.glowRgb},0.5), 0 20px 60px rgba(0,0,0,0.85)`,
                transition:'border-color 0.8s ease, box-shadow 0.8s ease',
              }}>
              <div className="absolute top-0 inset-x-0 h-[2px]"
                style={{ background:`linear-gradient(to right,transparent,${cfg.accent},transparent)`, transition:'background 0.8s ease' }} />
              <div className="relative p-5">
                <SlideTransition id={product.id+'-mob-info'} direction={direction}>
                  <div className="fp-stagger" key={product.id+'-mob-stagger'}>
                    <div className="mb-4">
                      <h3 className="text-xl font-display font-normal text-white leading-tight mb-1.5">{product.name}</h3>
                      <p className="text-xs leading-relaxed line-clamp-2" style={{ color:'rgba(255,255,255,0.48)' }}>{product.description}</p>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="rounded-xl px-3.5 py-2.5"
                        style={{ background:'rgba(255,255,255,0.04)', border:`1px solid rgba(${cfg.glowRgb},0.2)` }}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color:cfg.accent }}>THC</span>
                          <span className="text-xs font-mono font-bold text-white">{product.thc}%</span>
                        </div>
                        <ShimmerBar pct={product.thc*3.3} barClass={cfg.barClass} glowRgb={cfg.glowRgb} delay={0.3} />
                      </div>
                      <div className="rounded-xl px-3.5 py-2.5"
                        style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)' }}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/38">CBD</span>
                          <span className="text-xs font-mono font-bold text-white/65">{product.cbd}%</span>
                        </div>
                        <ShimmerBar pct={product.cbd*10} barClass="bg-white/35" glowRgb="255,255,255" delay={0.5} />
                      </div>
                    </div>
                    {'effects' in product && Array.isArray((product as any).effects) && (product as any).effects.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {((product as any).effects as string[]).slice(0,4).map((fx:string) => (
                          <span key={fx} className="rounded-full text-[8.5px] font-medium tracking-wide px-2.5 py-0.5"
                            style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.55)' }}>{fx}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="text-base font-mono font-bold" style={{ color:cfg.accent }}>฿{price.toLocaleString()}</span>
                      {product.is_popular && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-white/90 text-black text-[7.5px] font-bold uppercase tracking-[0.1em] px-2 py-0.5">
                          <Star className="h-2 w-2 fill-current" />Popular
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2.5">
                      <button onClick={() => navigate(`/products/${product.id}`)}
                        className="flex-1 h-10 rounded-xl text-[10px] font-bold uppercase tracking-[0.18em] flex items-center justify-center gap-1.5 transition-all active:scale-[0.96]"
                        style={{ background:`linear-gradient(135deg,${cfg.accent},rgba(${cfg.glowRgb},0.72))`, color:'#000', boxShadow:`0 4px 20px -4px rgba(${cfg.glowRgb},0.65)` }}>
                        View Details<ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </button>
                      <a href="https://line.me/R/ti/p/@674dxgnq" target="_blank" rel="noopener noreferrer"
                        className="flex-1 h-10 rounded-xl text-[10px] font-bold uppercase tracking-[0.18em] flex items-center justify-center gap-1.5 transition-all active:scale-[0.96]"
                        style={{ background:'rgba(0,185,0,0.1)', border:'1.5px solid rgba(0,185,0,0.4)', color:'#00B900' }}>
                        LINE Order
                      </a>
                    </div>
                  </div>
                </SlideTransition>
              </div>
            </div>

          </div>
        </div>

        {/* ══ Bottom Navigation — thumbnail strip + counter + arrows ══ */}
<div className="fp-reveal flex flex-col items-center gap-4 mt-10"
  style={{ transitionDelay:'160ms' }}>

  {/* Strip + arrows row — safe on all mobile widths */}
  <div
    className="flex items-center gap-2 w-full"
    style={{ maxWidth: '100%', padding: '0 4px' }}
  >
    {/* Prev arrow */}
    <button
      onClick={handlePrev}
      aria-label="Previous strain"
      className="fp-nav-btn flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
    >
      <ChevronLeft className="w-4 h-4 text-white/70" />
    </button>

    {/* Scrollable thumbnail strip */}
    <div
      className="flex-1 overflow-x-auto"
      style={{
        scrollbarWidth: 'none',          /* Firefox */
        msOverflowStyle: 'none',         /* IE */
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <style>{`.fp-thumb-scroll::-webkit-scrollbar { display: none; }`}</style>
      <div
        className="fp-thumb-scroll flex items-center justify-start gap-2.5 py-1"
        style={{
          minWidth: 'max-content',
          paddingLeft: '4px',
          paddingRight: '4px',
        }}
      >
        {products.map((p, idx) => {
          const isActive = idx === currentIndex;
          const tCat  = p.category.toLowerCase();
          const tCfg  = getCfg(tCat);
          const tImg  = p.image_url || IMAGE_MAP[tCat] || indicaImg;
          return (
            <button
              key={p.id}
              onClick={() => goTo(idx)}
              aria-label={`Go to ${p.name}`}
              className="relative rounded-2xl overflow-hidden flex-shrink-0 transition-all duration-350"
              style={{
                width:         isActive ? 52 : 38,
                height:        isActive ? 52 : 38,
                outline:       isActive ? `2px solid ${tCfg.accent}` : '2px solid rgba(255,255,255,0.1)',
                outlineOffset: isActive ? '3px' : '2px',
                boxShadow:     isActive ? `0 0 18px 2px rgba(${tCfg.glowRgb},0.6)` : 'none',
                transform:     isActive ? 'scale(1.08)' : 'scale(1)',
                transition:    'all 0.35s cubic-bezier(.25,1,.5,1)',
                opacity:       isActive ? 1 : 0.55,
              }}
            >
              <img
                src={tImg}
                alt={p.name}
                className="w-full h-full object-cover"
                draggable={false}
              />
              {isActive && (
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none fp-thumb-ring"
                  style={{ border: `1.5px solid rgba(${tCfg.glowRgb},0.7)` }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>

    {/* Next arrow */}
    <button
      onClick={handleNext}
      aria-label="Next strain"
      className="fp-nav-btn flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
      style={{
        background:  `rgba(${cfg.glowRgb},0.18)`,
        border:      `1px solid rgba(${cfg.glowRgb},0.45)`,
        boxShadow:   `0 0 22px rgba(${cfg.glowRgb},0.28)`,
        transition:  'all 0.35s ease',
      }}
    >
      <ChevronRight className="w-4 h-4 text-white" />
    </button>
  </div>

  {/* Active strain name label */}
  <p className="text-[10px] uppercase tracking-[0.28em] text-white/35 transition-all duration-300">
    {product.name}
  </p>
</div>

      </div>
    </section>
  );
};