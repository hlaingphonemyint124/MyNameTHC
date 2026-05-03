import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export const NewProducts = () => {
  const { products, loading } = useProducts({ isNew: true, limit: 4, realtime: true });
  const navigate = useNavigate();

  if (loading) {
    return (
      <section className="py-14 md:py-16 lg:py-20 bg-surface-deep/30">
        <div className="container">
          <div className="mb-8 md:mb-10">
            <div className="h-3 w-32 bg-muted animate-pulse rounded mb-4" />
            <div className="h-10 w-56 bg-muted animate-pulse rounded" />
          </div>
          <div className="hidden md:grid md:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-xl" />)}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-14 md:py-16 lg:py-20 bg-surface-deep/30 relative overflow-hidden">
      <div className="container">
        <div className="flex items-end justify-between mb-8 md:mb-10 gap-6 reveal">
          <div>
            <p className="eyebrow mb-3 inline-flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Just Arrived
            </p>
            <h2 className="font-display text-display-lg text-foreground">New Arrivals</h2>
          </div>
          <Button variant="ghost" onClick={() => navigate('/products')} className="group text-foreground hover:text-accent shrink-0">
            View All
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="hidden md:grid md:grid-cols-4 gap-6 md:gap-8">
          {products.map((product, i) => (
            <div key={product.id} className="reveal" style={{ transitionDelay: `${i * 80}ms` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="md:hidden -mx-4 px-4 pb-3 flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar">
          {products.map(product => (
            <div key={product.id} className="shrink-0 w-[72%] snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
