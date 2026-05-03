import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "./ProductCard";
import { Product } from "@/data/products";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Loader2 } from "lucide-react";

interface ProductCarouselProps {
  type: "new" | "popular";
  title: string;
}

export const ProductCarousel = ({ type, title }: ProductCarouselProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [type]);

  const fetchProducts = async () => {
    try {
      const column = type === "new" ? "is_new" : "is_popular";
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq(column, true)
        .limit(8);

      if (error) throw error;
      setProducts((data as any) || []);
    } catch (error) {
      console.error(`Error fetching ${type} products:`, error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 animate-fade-in-up">
      <div className="container px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-gold bg-clip-text text-transparent">
          {title}
        </h2>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {products.map((product, index) => (
              <CarouselItem
                key={product.id}
                className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div className="animate-scale-in">
                  <ProductCard product={product} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0" />
          <CarouselNext className="right-0" />
        </Carousel>
      </div>
    </section>
  );
};
