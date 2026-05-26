import {
  useState, useEffect, useRef, useCallback, useMemo,
} from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Star, ShieldCheck, Leaf, ArrowRight, X, RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoImg   from '@/assets/logo.png';
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
   Orbit tilt angle — controls how "3D" the ring looks.
   Higher = more vertical depth, cards spread further up/down.
   Range: 0.25 (subtle) → 0.55 (dramatic). Default: 0.38
───────────────────────────────────────────────────────────────── */
const TILT_ANGLE = 0.38; // radians

/* ─────────────────────────────────────────────────────────────────
   Galaxy Canvas
───────────────────────────────────────────────────────────────── */
interface StarP { x:number; y:number; r:number; a:number; tw:number; drift:number }
interface NebulaP { x:number; y:number; rx:number; ry:number; col:string; alpha:number }

function GalaxyCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    let t   = 0;
    let W   = 0, H = 0;
    let stars:   StarP[]   = [];
    let nebulae: NebulaP[] = [];

    const NEBULA_COLS = [
      'rgba(245,158,11,',
      'rgba(168,85,247,',
      'rgba(16,185,129,',
      'rgba(59,130,246,',
      'rgba(20,184,166,',
      'rgba(236,72,153,',
    ];

    const build = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      stars = Array.from({ length: 260 }, () => ({
        x:     Math.random() * W,
        y:     Math.random() * H,
        r:     Math.random() * 1.5 + 0.2,
        a:     Math.random() * 0.55 + 0.2,
        tw:    Math.random() * Math.PI * 2,
        drift: Math.random() * 0.06 + 0.01,
      }));
      nebulae = Array.from({ length: 8 }, (_, i) => ({
        x:     W * (0.05 + Math.random() * 0.9),
        y:     H * (0.05 + Math.random() * 0.9),
        rx:    90  + Math.random() * 200,
        ry:    70  + Math.random() * 150,
        col:   NEBULA_COLS[i % NEBULA_COLS.length],
        alpha: 0.028 + Math.random() * 0.042,
      }));
    };

    const frame = () => {
      t += 0.003;
      ctx.clearRect(0, 0, W, H);

      const bg = ctx.createRadialGradient(W * .5, H * .45, 0, W * .5, H * .45, Math.hypot(W, H) * .6);
      bg.addColorStop(0,   '#0a0f1e');
      bg.addColorStop(.55, '#050810');
      bg.addColorStop(1,   '#020408');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      nebulae.forEach((n, i) => {
        const ox = Math.sin(t * .28 + i * 1.1) * 22;
        const oy = Math.cos(t * .22 + i * .8) * 14;
        const cx = n.x + ox, cy = n.y + oy;
        ctx.save();
        ctx.scale(1, n.ry / n.rx);
        const g = ctx.createRadialGradient(cx, cy * (n.rx / n.ry), 0, cx, cy * (n.rx / n.ry), n.rx);
        g.addColorStop(0,   n.col + (n.alpha * 2).toFixed(3) + ')');
        g.addColorStop(.45, n.col + (n.alpha).toFixed(3) + ')');
        g.addColorStop(1,   n.col + '0)');
        ctx.beginPath();
        ctx.arc(cx, cy * (n.rx / n.ry), n.rx, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.restore();
      });

      const mw = ctx.createLinearGradient(0, H * .15, W, H * .85);
      mw.addColorStop(0,   'rgba(160,140,255,0)');
      mw.addColorStop(.35, 'rgba(160,140,255,0.022)');
      mw.addColorStop(.5,  'rgba(180,160,255,0.038)');
      mw.addColorStop(.65, 'rgba(160,140,255,0.022)');
      mw.addColorStop(1,   'rgba(160,140,255,0)');
      ctx.fillStyle = mw;
      ctx.fillRect(0, 0, W, H);

      stars.forEach(s => {
        const tw = Math.sin(t * 1.9 + s.tw) * .38 + .62;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${(s.a * tw).toFixed(3)})`;
        ctx.fill();
        if (s.r > 1.15) {
          ctx.strokeStyle = `rgba(255,255,255,${(s.a * tw * .3).toFixed(3)})`;
          ctx.lineWidth = .5;
          ctx.beginPath();
          ctx.moveTo(s.x - s.r * 3, s.y); ctx.lineTo(s.x + s.r * 3, s.y);
          ctx.moveTo(s.x, s.y - s.r * 3); ctx.lineTo(s.x, s.y + s.r * 3);
          ctx.stroke();
        }
        s.y += s.drift;
        if (s.y > H + 2) { s.y = -2; s.x = Math.random() * W; }
      });

      raf = requestAnimationFrame(frame);
    };

    const ro = new ResizeObserver(build);
    ro.observe(canvas);
    build();
    raf = requestAnimationFrame(frame);
    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden />;
}

/* ─────────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────────── */
export const FeaturedProducts = () => {
  const { products, loading } = useProducts({ featured: true, limit: 6, realtime: true });
  const navigate = useNavigate();

  /* ── angle is now in RADIANS for smooth 3D orbit math ── */
  const [angle,    setAngle]    = useState(0);
  const [spinning, setSpinning] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [panelKey, setPanelKey] = useState(0);

  const [stageSize, setStageSize] = useState({ w: 800, h: 560 });

  const rafRef     = useRef<number>(0);
  const velRef     = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef   = useRef<HTMLDivElement>(null);

  const dragRef = useRef<{ x: number; time: number; active: boolean } | null>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.offsetWidth;
      const h = Math.max(480, Math.min(680, w * 0.65));
      setStageSize({ w, h });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, [loading, products.length]);

  /* ── RAF rotation + smooth momentum — angle in radians ── */
  useEffect(() => {
    const SPEED = 0.00042; // radians per ms — smooth, gentle spin
    let lastT = 0;
    const tick = (t: number) => {
      const dt = Math.min(t - lastT, 50);
      lastT = t;
      if (spinning) {
        setAngle(a => (a + SPEED * dt) % (Math.PI * 2));
      } else if (Math.abs(velRef.current) > 0.00005) {
        velRef.current *= 0.94; // slightly slower decay = longer glide
        setAngle(a => (a + velRef.current * dt) % (Math.PI * 2));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(t => {
      lastT = t;
      rafRef.current = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(rafRef.current);
  }, [spinning]);

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

  const openCard = useCallback((id: string) => {
    setActiveId(id);
    setSpinning(false);
    setPanelKey(k => k + 1);
    velRef.current = 0;
  }, []);

  const closeCard = useCallback(() => {
    setActiveId(null);
    setSpinning(true);
    velRef.current = 0;
  }, []);

  /* ── Mouse drag — delta converted to radians ── */
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (activeId) return;
    dragRef.current = { x: e.clientX, time: performance.now(), active: true };
    velRef.current  = 0;
    setSpinning(false);
  }, [activeId]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current?.active || activeId) return;
    const dx = e.clientX - dragRef.current.x;
    setAngle(a => (a + dx * 0.004) % (Math.PI * 2));
    dragRef.current.x = e.clientX;
  }, [activeId]);

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current?.active) return;
    const dx = e.clientX - dragRef.current.x;
    const dt = Math.max(performance.now() - dragRef.current.time, 1);
    velRef.current = (dx / dt) * 0.0018; // radians per ms
    dragRef.current = null;
  }, []);

  const onMouseLeave = useCallback(() => {
    if (dragRef.current?.active) dragRef.current = null;
    if (!activeId) setSpinning(true);
  }, [activeId]);

  /* ── Touch drag — radians ── */
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    dragRef.current = { x: e.touches[0].clientX, time: performance.now(), active: true };
    velRef.current  = 0;
    setSpinning(false);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragRef.current?.active || activeId) return;
    const dx = e.touches[0].clientX - dragRef.current.x;
    setAngle(a => (a + dx * 0.0035) % (Math.PI * 2));
    dragRef.current.x = e.touches[0].clientX;
  }, [activeId]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!dragRef.current?.active) return;
    const dx = e.changedTouches[0].clientX - dragRef.current.x;
    const dt = Math.max(performance.now() - dragRef.current.time, 1);
    if (!activeId) velRef.current = (dx / dt) * 0.0014;
    dragRef.current = null;
  }, [activeId]);

  const activeProduct = useMemo(
    () => products.find(p => p.id === activeId) ?? null,
    [products, activeId],
  );

  /* ── Geometry — orbit ring always clears the hub ── */
  const geo = useMemo(() => {
    const { w, h } = stageSize;
    const mobile = w < 500;
    const sm     = w < 768;

    /* radius = horizontal reach of the orbit ellipse */
    const maxR   = Math.min(w, h) * 0.5;
    const radius = Math.min(
      mobile ? maxR * 0.72 : sm ? maxR * 0.75 : maxR * 0.82,
      mobile ? 135 : sm ? 190 : 260,
    );

    const cardW = mobile ? 116 : sm ? 136 : 164;
    const cardH = mobile ? 154 : sm ? 180 : 216;
    const hubR  = mobile ? 46  : sm ? 56  : 68;

    /*
     * ── KEY FIX ──
     * ry is derived from a 3D tilt angle, NOT an arbitrary ratio.
     * This means at theta=PI/2 (top of orbit), py = cy + radius*sin(TILT)*sin(PI/2)
     *   = cy + radius*sin(TILT)
     * For radius=260 and TILT=0.38: ry = 260*sin(0.38) ≈ 260*0.371 ≈ 96px
     * Hub radius on desktop = 68px → clearance = 96 - 68 = 28px ✓
     * Cards never reach center because py_max = cy ± ry, and ry > hubR always.
     *
     * To increase clearance, raise TILT_ANGLE above.
     */
    const ry = radius * Math.sin(TILT_ANGLE);

    /* Safety assertion: ry must always exceed hubR + half card height */
    const minRy = hubR + cardH * 0.5 + 12;
    const safeRy = Math.max(ry, minRy);

    return {
      radius, cardW, cardH, hubR,
      ry: safeRy,
      cx: w / 2,
      cy: h / 2,
    };
  }, [stageSize]);

  /* ── Loading state ── */
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

  const { radius, cardW, cardH, hubR, ry, cx, cy } = geo;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden text-[hsl(var(--foreground))] py-12 md:py-18 w-full"
    >
      {/* ─── Styles ─────────────────────────────────────────── */}
      <style>{`
        .fp-reveal { opacity:0; transform:translateY(22px);
          transition:opacity .65s ease,transform .65s ease; }
        .fp-reveal.fp-in { opacity:1; transform:translateY(0); }

        @keyframes fp-dash { to { stroke-dashoffset:-56; } }
        .fp-orbit-dash { animation:fp-dash 9s linear infinite; }

        @keyframes fp-ping {
          0%   { transform:scale(.9);  opacity:.65; }
          100% { transform:scale(2.6); opacity:0;   }
        }
        .fp-ping   { animation:fp-ping 2.8s ease-out infinite; }
        .fp-ping-2 { animation:fp-ping 2.8s ease-out  .9s infinite; }
        .fp-ping-3 { animation:fp-ping 2.8s ease-out 1.7s infinite; }

        .fp-stage { cursor: grab; user-select: none; }
        .fp-stage:active { cursor: grabbing; }

        .fp-node { position:absolute; transform-origin:center;
          cursor:pointer; will-change:transform,opacity;
          -webkit-tap-highlight-color:transparent; }
        .fp-card-shell { width:100%; height:100%; border-radius:14px;
          overflow:hidden; position:relative;
          transition:border-color .3s ease,box-shadow .3s ease;
          border:1px solid rgba(255,255,255,0.1); }
        .fp-node:not(.fp-active):hover .fp-card-shell {
          border-color:rgba(255,255,255,0.22);
          box-shadow:0 6px 30px rgba(0,0,0,0.55); }

        @keyframes fp-active-pulse {
          0%,100% { transform:scale(1.06); }
          50%      { transform:scale(1.10); }
        }
        .fp-active { animation:fp-active-pulse 2s ease-in-out infinite; }

        @keyframes fp-panel {
          from { opacity:0; transform:translate(-50%,-47%) scale(.88); }
          to   { opacity:1; transform:translate(-50%,-50%) scale(1);   }
        }
        .fp-panel { animation:fp-panel .3s cubic-bezier(.34,1.5,.64,1) forwards; }

        @keyframes fp-bd { from{opacity:0} to{opacity:1} }
        .fp-bd { animation:fp-bd .22s ease forwards; }

        @keyframes fp-bar { from{width:0%} }
        .fp-bar { animation:fp-bar .95s cubic-bezier(.25,1,.5,1) forwards; }

        @keyframes fp-hint { 0%,100%{opacity:.28} 50%{opacity:.6} }
        .fp-hint { animation:fp-hint 3.2s ease-in-out infinite; }
      `}</style>

      {/* ─── Background ─────────────────────────────────────── */}
      <div className="absolute inset-0">
        <GalaxyCanvas />
        <div className="absolute inset-0 pointer-events-none
          bg-[radial-gradient(ellipse_110%_90%_at_50%_50%,transparent_35%,rgba(0,0,0,0.6)_100%)]" />
        <div className="absolute inset-0 pointer-events-none
          bg-[radial-gradient(ellipse_55%_45%_at_50%_55%,hsl(var(--accent)/0.08),transparent_70%)]" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">

        {/* ─── Header ─────────────────────────────────────────── */}
        <div className="fp-reveal flex items-end justify-between mb-6 md:mb-8 gap-4">
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
            {!spinning && !activeId && (
              <button
                onClick={() => { setSpinning(true); velRef.current = 0; }}
                title="Resume rotation"
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

        {/* ─── Orbital Stage ─── */}
        <div
          ref={stageRef}
          className="fp-reveal fp-stage relative w-full mx-auto overflow-visible"
          style={{
            height: stageSize.h,
            transitionDelay: '100ms',
            WebkitUserSelect: 'none',
            userSelect: 'none',
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* ── SVG orbit rings ── */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            {/* Outer solid glow ring */}
            <ellipse
              cx={cx} cy={cy} rx={radius} ry={ry}
              fill="none" stroke="hsl(var(--accent))"
              strokeWidth="2" opacity="0.06"
            />
            {/* Animated dashed orbit ring */}
            <ellipse
              cx={cx} cy={cy} rx={radius} ry={ry}
              fill="none" stroke="hsl(var(--accent))"
              strokeWidth="1"
              strokeDasharray="6 10"
              opacity="0.35"
              className="fp-orbit-dash"
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
            {/* Inner subtle ring */}
            <ellipse
              cx={cx} cy={cy}
              rx={radius * 0.55} ry={ry * 0.55}
              fill="none" stroke="white"
              strokeWidth="0.5" opacity="0.04"
            />
          </svg>

          {/* ── Hub Logo ── */}
          <div
            className="absolute z-30 flex items-center justify-center"
            style={{
              left:   cx - hubR,
              top:    cy - hubR,
              width:  hubR * 2,
              height: hubR * 2,
            }}
          >
            {['fp-ping', 'fp-ping-2', 'fp-ping-3'].map((c, i) => (
              <div
                key={i}
                className={`${c} absolute inset-0 rounded-full border`}
                style={{ borderColor: 'hsl(var(--accent)/0.38)' }}
              />
            ))}
            <div
              className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center cursor-pointer"
              style={{
                background: 'radial-gradient(circle at 38% 32%, rgba(255,255,255,0.14), rgba(0,0,0,0.85))',
                border:     '1.5px solid hsl(var(--accent)/0.45)',
                boxShadow:  '0 0 52px -10px hsl(var(--accent)/0.6), inset 0 0 28px -10px hsl(var(--accent)/0.18)',
              }}
              onClick={() => activeId && closeCard()}
            >
              <img
                src={logoImg}
                alt="My Name THC"
                className="w-[80%] h-[80%] object-contain"
                style={{ filter: 'brightness(1.1)' }}
              />
            </div>
          </div>

          {/* ── Product Nodes ──
           *
           * ORBIT MATH (3D ring):
           *   theta  = position on orbit in radians
           *   x3d    = cos(theta) → horizontal position (-1 left, +1 right)
           *   z3d    = sin(theta) → depth (-1 behind, +1 in front)
           *   px     = cx + radius * x3d
           *   py     = cy + ry * z3d   ← ry = radius*sin(TILT), always > hubR
           *
           * Because ry > hubR, py is always outside the hub circle.
           * depth drives scale (0.62→1.0) and opacity (0.35→1.0).
           */}
          {products.map((product, i) => {
            const total = products.length;

            /* theta in radians — angle is already in radians */
            const theta = ((i / total) * Math.PI * 2 + angle) % (Math.PI * 2);

            const x3d  = Math.cos(theta);
            const z3d  = Math.sin(theta);  // -1 = behind hub, +1 = in front

            const px = cx + radius * x3d;
            const py = cy + ry * z3d;      // ry > hubR → never crosses center

            /* depth: 0=back, 1=front */
            const depth = (z3d + 1) / 2;
            const scale = 0.62 + depth * 0.42;
            const opac  = 0.32 + depth * 0.68;
            const zIdx  = Math.round(5 + depth * 25);

            const isActive = product.id === activeId;
            const cat      = product.category.toLowerCase();
            const cfg      = getCfg(cat);
            const fallback = IMAGE_MAP[cat] ?? indicaImg;
            const price    = 800 + Math.round(product.thc * 30);

            return (
              <div
                key={product.id}
                className={`fp-node${isActive ? ' fp-active' : ''}`}
                style={{
                  width:     cardW,
                  height:    cardH,
                  left:      px - cardW / 2,
                  top:       py - cardH / 2,
                  zIndex:    isActive ? 60 : zIdx,
                  opacity:   isActive ? 1  : opac,
                  transform: `scale(${isActive ? 1.06 : scale})`,
                  transition: 'opacity .18s ease',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  isActive ? closeCard() : openCard(product.id);
                }}
                onMouseDown={e => e.stopPropagation()}
              >
                {isActive && (
                  <div
                    className="absolute -inset-2 rounded-2xl pointer-events-none"
                    style={{ boxShadow: `0 0 44px 6px rgba(${cfg.glowRgb},0.52)` }}
                  />
                )}

                <div
                  className="fp-card-shell"
                  style={isActive ? {
                    borderColor: cfg.accent + '80',
                    boxShadow:   `0 0 44px -6px rgba(${cfg.glowRgb},0.5)`,
                  } : {}}
                >
                  <div
                    className="absolute top-0 inset-x-0 h-[2px] z-10"
                    style={{ background: `linear-gradient(to right,transparent,${cfg.accent},transparent)` }}
                  />

                  <img
                    src={product.image_url || fallback}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/20 to-black/12" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/48 via-transparent to-transparent" />

                  <div className="relative z-10 p-2 flex flex-col gap-1">
                    <span className={`self-start inline-flex items-center gap-1 rounded-full
                      text-[8px] font-bold uppercase tracking-[0.13em]
                      px-2 py-[3px] backdrop-blur-md ${cfg.badge}`}>
                      <span className={`w-1 h-1 rounded-full animate-pulse ${cfg.dotClass}`} />
                      {product.category}
                    </span>
                    {product.is_new && (
                      <span className="self-start inline-flex items-center gap-0.5 rounded-full
                        bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]
                        text-[7px] font-bold uppercase tracking-[0.1em] px-1.5 py-[2px]">
                        <Sparkles className="h-2 w-2" />New
                      </span>
                    )}
                    {product.is_popular && (
                      <span className="self-start inline-flex items-center gap-0.5 rounded-full
                        bg-white/90 text-black text-[7px] font-bold uppercase
                        tracking-[0.1em] px-1.5 py-[2px]">
                        <Star className="h-2 w-2 fill-current" />Hot
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2 right-2 z-10">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full
                      ring-1 ring-white/15 bg-black/55 backdrop-blur-md">
                      <ShieldCheck className="h-3 w-3 text-[hsl(var(--accent))]" strokeWidth={2.5} />
                    </span>
                  </div>

                  <div className="absolute bottom-0 inset-x-0 z-10 p-2 space-y-0.5">
                    <div className="flex items-center gap-1">
                      <span className="text-[7px] font-bold uppercase tracking-[0.13em] text-white/38">THC</span>
                      <span className="text-[8px] font-mono font-bold" style={{ color: cfg.accent }}>
                        {product.thc}%
                      </span>
                    </div>
                    <div className="flex items-end justify-between gap-1">
                      <h3 className="font-display text-[11px] font-normal text-white
                        leading-snug line-clamp-2 flex-1">
                        {product.name}
                      </h3>
                      <span
                        className="shrink-0 rounded bg-black/78 backdrop-blur-md
                          font-mono text-[9px] font-bold px-1 py-0.5 ring-1 ring-white/10"
                        style={{ color: cfg.accent }}
                      >
                        ฿{price.toLocaleString()}
                      </span>
                    </div>
                    {isActive && (
                      <p className="text-[7px] uppercase tracking-[0.2em] text-white/28 text-center pt-0.5">
                        tap to close
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* ── Backdrop ── */}
          {activeProduct && (
            <div
              className="fp-bd absolute inset-0 z-[55] rounded-xl"
              style={{ background: 'rgba(0,0,0,0.48)', backdropFilter: 'blur(4px)' }}
              onClick={closeCard}
            />
          )}

          {/* ── Detail Panel ── */}
          {activeProduct && (() => {
            const cat      = activeProduct.category.toLowerCase();
            const cfg      = getCfg(cat);
            const fallback = IMAGE_MAP[cat] ?? indicaImg;
            const price    = 800 + Math.round(activeProduct.thc * 30);
            const panelW   = Math.min(stageSize.w - 32, 390);

            return (
              <div
                key={panelKey}
                className="fp-panel absolute z-[80] pointer-events-auto"
                style={{ width: panelW, top: '50%', left: '50%' }}
                onClick={e => e.stopPropagation()}
              >
                <div
                  className="relative rounded-2xl overflow-hidden border"
                  style={{
                    borderColor:    cfg.accent + '48',
                    background:     'rgba(6,10,18,0.94)',
                    backdropFilter: 'blur(28px) saturate(1.4)',
                    boxShadow:      `0 0 64px -14px rgba(${cfg.glowRgb},0.55),
                                     0 28px 80px rgba(0,0,0,0.8)`,
                  }}
                >
                  <div
                    className="absolute top-0 inset-x-0 h-[2px] z-20"
                    style={{ background: `linear-gradient(to right,transparent,${cfg.accent},transparent)` }}
                  />

                  <div className="relative h-36 sm:h-44 overflow-hidden">
                    <img
                      src={activeProduct.image_url || fallback}
                      alt={activeProduct.name}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                    <div className="absolute inset-0
                      bg-gradient-to-b from-transparent via-black/15 to-[rgba(6,10,18,0.95)]" />

                    <button
                      onClick={closeCard}
                      className="absolute top-2.5 right-2.5 z-20 flex items-center justify-center
                        h-7 w-7 rounded-full bg-black/65 backdrop-blur-md
                        ring-1 ring-white/15 hover:bg-black/85 transition-colors"
                      aria-label="Close"
                    >
                      <X className="h-3.5 w-3.5 text-white" />
                    </button>

                    <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-1 rounded-full
                        text-[9px] font-bold uppercase tracking-[0.14em]
                        px-2.5 py-1 backdrop-blur-md ${cfg.badge}`}>
                        <span className={`w-1 h-1 rounded-full animate-pulse ${cfg.dotClass}`} />
                        {activeProduct.category}
                      </span>
                      {activeProduct.is_new && (
                        <span className="inline-flex items-center gap-1 rounded-full
                          bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]
                          text-[8px] font-bold uppercase tracking-[0.1em] px-2 py-0.5">
                          <Sparkles className="h-2.5 w-2.5" />New Arrival
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-xl sm:text-2xl font-normal text-white leading-tight">
                          {activeProduct.name}
                        </h3>
                        <p className="text-[11px] text-white/45 mt-1 line-clamp-2 leading-relaxed">
                          {activeProduct.description}
                        </p>
                      </div>
                      <span
                        className="shrink-0 rounded-lg bg-white/6 ring-1 ring-white/10
                          font-mono text-base font-bold px-3 py-1"
                        style={{ color: cfg.accent }}
                      >
                        ฿{price.toLocaleString()}
                      </span>
                    </div>

                    {'effects' in activeProduct &&
                      Array.isArray((activeProduct as any).effects) &&
                      (activeProduct as any).effects.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {((activeProduct as any).effects as string[]).slice(0, 5).map((fx: string) => (
                          <span key={fx}
                            className="rounded-full bg-white/5 border border-white/10
                              text-white/55 text-[9px] font-medium tracking-wide px-2.5 py-0.5">
                            {fx}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="rounded-xl bg-white/5 border border-white/8 px-3 py-2.5">
                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-[0.15em] mb-2">
                          <span style={{ color: cfg.accent }}>THC</span>
                          <span className="text-white font-mono">{activeProduct.thc}%</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                          <div className={`fp-bar h-full rounded-full ${cfg.barClass}`}
                            style={{ width: `${Math.min(activeProduct.thc * 3.3, 100)}%` }} />
                        </div>
                      </div>
                      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2.5">
                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-[0.15em] mb-2">
                          <span className="text-white/45">CBD</span>
                          <span className="text-white font-mono">{activeProduct.cbd}%</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                          <div className="fp-bar h-full rounded-full bg-white/28"
                            style={{ width: `${Math.min(activeProduct.cbd * 10, 100)}%`, animationDelay: '.15s' }} />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-0.5">
                      <button
                        onClick={() => navigate(`/products/${activeProduct.id}`)}
                        className="flex-1 h-10 rounded-xl text-[10px] font-bold uppercase
                          tracking-[0.18em] flex items-center justify-center gap-1.5
                          transition-all active:scale-[0.97] hover:brightness-110"
                        style={{
                          background: `linear-gradient(135deg,${cfg.accent},${cfg.accent}bb)`,
                          color:      '#000',
                          boxShadow:  `0 4px 22px -4px rgba(${cfg.glowRgb},0.65)`,
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
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── Hint ── */}
          {!activeId && (
            <p className="fp-hint absolute bottom-3 left-1/2 -translate-x-1/2
              text-[9px] uppercase tracking-[0.28em] text-white/25
              whitespace-nowrap pointer-events-none select-none">
              Tap a strain · Drag to spin
            </p>
          )}
        </div>

        {/* ── Dot Indicators ── */}
        <div className="fp-reveal flex justify-center mt-5 gap-2"
          style={{ transitionDelay: '180ms' }}>
          {products.map((p, i) => {
            /* angle is in radians — use same theta formula as node positions */
            const theta = ((i / products.length) * Math.PI * 2 + angle) % (Math.PI * 2);
            const front = Math.sin(theta) > 0;
            return (
              <button
                key={p.id}
                aria-label={`Focus ${p.name}`}
                onClick={() => {
                  /* Snap this card to the front position (theta = PI/2) */
                  const targetTheta = Math.PI / 2 - (i / products.length) * Math.PI * 2;
                  setAngle(((targetTheta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2));
                  setSpinning(false);
                }}
                className="rounded-full transition-all duration-400"
                style={{
                  width:      front ? 28 : 6,
                  height:     6,
                  background: front
                    ? 'hsl(var(--accent))'
                    : 'rgba(255,255,255,0.2)',
                }}
              />
            );
          })}
        </div>

      </div>
    </section>
  );
};