import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronDown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSlideshows } from '@/hooks/useSlideshows';

export const HeroSlideshow = () => {
  const { slideshows, loading } = useSlideshows(true); // real-time enabled
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Auto-advance
  useEffect(() => {
    if (slideshows.length <= 1) return;
    const id = setInterval(() => setCurrentIndex(i => (i + 1) % slideshows.length), 5000);
    return () => clearInterval(id);
  }, [slideshows.length]);

  const prev = useCallback(() =>
    setCurrentIndex(i => (i - 1 + slideshows.length) % slideshows.length), [slideshows.length]);
  const next = useCallback(() =>
    setCurrentIndex(i => (i + 1) % slideshows.length), [slideshows.length]);

  if (loading) {
    return (
      <section className="relative w-full h-[88svh] min-h-[560px] max-h-[860px] overflow-hidden bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </section>
    );
  }

  if (slideshows.length === 0) {
    return (
      <section className="relative w-full h-[88svh] min-h-[560px] max-h-[860px] overflow-hidden bg-gradient-hero flex items-center justify-center">
        <div className="absolute inset-0 bg-noise opacity-[0.04] pointer-events-none" />
        <div className="text-center animate-fade-in relative z-10 px-6">
          <p className="eyebrow mb-4">Premium Thai Cannabis</p>
          <h1 className="font-display text-display-2xl text-foreground mb-4">Welcome to My Name THC</h1>
          <p className="text-lg text-muted-foreground">Cultivated with care. Curated for you.</p>
          <Button variant="premium" size="lg" onClick={() => navigate('/products')} className="mt-8">
            Explore Strains <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    );
  }

  const current = slideshows[currentIndex];

  return (
    <section className="relative w-full h-[88svh] min-h-[560px] max-h-[860px] overflow-hidden">
      {/* Slides */}
      {slideshows.map((slide, i) => (
        <div
          key={slide.id}
          className="absolute inset-0"
          style={{
            opacity: i === currentIndex ? 1 : 0,
            zIndex: i === currentIndex ? 10 : 0,
            transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <img
            src={slide.image_url}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading={i === 0 ? 'eager' : 'lazy'}
            style={{
              transform: i === currentIndex ? 'scale(1.06)' : 'scale(1.0)',
              transition: 'transform 8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/15 to-black/40" />
          {/* Top shadow to keep nav text readable on any slide */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />
          {/* Vignette */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />
        </div>
      ))}

      {/* Content */}
      {current && (
        <div className="absolute inset-0 flex items-center z-20">
          <div className="container mx-auto text-center max-w-3xl px-6">
            <p
              key={`e-${currentIndex}`}
              className="eyebrow text-accent mb-6 inline-flex items-center gap-3 before:content-[''] before:w-8 before:h-px before:bg-accent after:content-[''] after:w-8 after:h-px after:bg-accent"
              style={{ animation: 'heroFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both' }}
            >
              Premium Thai Cannabis · Bangkok
            </p>
            <h1
              key={`t-${currentIndex}`}
              className="font-display text-display-2xl text-white mb-6 drop-shadow-2xl text-balance"
              style={{ animation: 'heroFadeUp 0.7s 0.08s cubic-bezier(0.22,1,0.36,1) both' }}
            >
              {current.title}
            </h1>
            {current.description && (
              <p
                key={`d-${currentIndex}`}
                className="text-base md:text-lg text-white/80 max-w-xl mx-auto mb-10 leading-relaxed"
                style={{ animation: 'heroFadeUp 0.7s 0.18s cubic-bezier(0.22,1,0.36,1) both' }}
              >
                {current.description}
              </p>
            )}
            <div
              key={`b-${currentIndex}`}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              style={{ animation: 'heroFadeUp 0.7s 0.28s cubic-bezier(0.22,1,0.36,1) both' }}
            >
              <Button variant="premium" size="lg" onClick={() => navigate('/products')} className="group text-base h-12 px-8 rounded-lg font-semibold btn-yellow-glow">
                Explore Strains
                <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
              {current.link_url && (
                <button
                  onClick={() => window.open(current.link_url!, '_blank')}
                  className="inline-flex items-center gap-2 text-white/85 hover:text-accent text-xs font-semibold uppercase tracking-[0.18em] transition-colors px-2 py-2 border-b border-white/30 hover:border-accent"
                >
                  Learn More <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Arrows */}
      {slideshows.length > 1 && (
        <>
          <button onClick={prev} aria-label="Previous slide" className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/15 backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all hidden sm:flex items-center justify-center">
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <button onClick={next} aria-label="Next slide" className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/15 backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all hidden sm:flex items-center justify-center">
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
        </>
      )}

      {/* Progress bar indicators */}
      {slideshows.length > 1 && (
        <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-30 flex gap-3 items-center">
          {slideshows.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="relative h-[3px] rounded-full overflow-hidden transition-all duration-500"
              style={{ width: i === currentIndex ? '48px' : '12px', background: 'rgba(255,255,255,0.3)' }}
            >
              {i === currentIndex && (
                <span
                  className="absolute inset-y-0 left-0 bg-accent rounded-full origin-left"
                  style={{ animation: 'progressBar 5s linear forwards', width: '100%' }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Scroll down */}
      <button
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        aria-label="Scroll down"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white/70 hover:text-accent hover:border-accent/60 transition-colors"
      >
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </button>
    </section>
  );
};
