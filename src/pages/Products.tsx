import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { PageTransition } from '@/components/PageTransition';
import { ProductCard } from '@/components/ProductCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Search, AlertCircle } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import type { Category } from '@/data/products';

const Products = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') as Category | null;
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>(categoryParam || 'All');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch ALL products with real-time enabled
  const { products, loading, error } = useProducts({ realtime: true });

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const filtered = products.filter(p => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navbar />
        <main className="container pt-28 md:pt-32 pb-20 md:pb-28">
          <header className="text-center mb-12 md:mb-16 reveal max-w-3xl mx-auto">
            <p className="eyebrow mb-4">The Collection</p>
            <h1 className="font-display text-display-xl text-foreground mb-5">Premium Strains</h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Browse our carefully curated selection of premium cannabis strains, lab-tested and crafted with care.
            </p>
          </header>

          <div className="mb-10 md:mb-14 space-y-5 reveal">
            <div className="flex justify-center">
              <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
            </div>
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search strains..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 bg-card hairline rounded-md h-11"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive mb-8 max-w-lg mx-auto">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {filtered.map((product, i) => (
                <div key={product.id} className="reveal" style={{ transitionDelay: `${(i % 8) * 60}ms` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 max-w-md mx-auto">
              <p className="eyebrow mb-2">No matches</p>
              <p className="text-muted-foreground">No products found matching your criteria. Try a different search.</p>
            </div>
          )}
        </main>

        <section className="py-12 md:py-16 bg-surface-deep/40 hairline border-t">
          <div className="container">
            <p className="eyebrow mb-3 text-center">Legal Notice</p>
            <p className="text-center text-sm text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              My Name THC operates in compliance with Thai cannabis regulations.
              For adults 21+ only. Please verify local laws regarding cannabis use and possession.
              Always consume responsibly.
            </p>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Products;
