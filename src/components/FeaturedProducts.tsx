import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const FeaturedProducts = () => {
  const { products, loading } = useProducts({ featured: true, limit: 4, realtime: true });
  const navigate = useNavigate();

  if (loading) {
    return (
      <section className="py-14 md:py-16 lg:py-20">
        <div className="container">
          <div className="mb-8 md:mb-10">
            <div className="h-3 w-40 bg-muted animate-pulse rounded mb-4" />
            <div className="h-10 w-72 bg-muted animate-pulse rounded" />
          </div>
          <div className="hidden md:grid md:grid-cols-4 gap-6 md:gap-8">
            {[1,2,3,4].map(i => <div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-xl" />)}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-14 md:py-16 lg:py-20 relative">
      <div className="container">
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

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-4 gap-6 md:gap-8">
          {products.map((product, i) => (
            <div key={product.id} className="reveal" style={{ transitionDelay: `${i * 80}ms` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Mobile carousel */}
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
