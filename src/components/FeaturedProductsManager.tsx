import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Star, StarOff, Loader2, ImageOff, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
  thc: number;
  cbd: number;
  is_featured: boolean | null;
  is_new: boolean | null;
  is_popular: boolean | null;
}

export const FeaturedProductsManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, category, image_url, thc, cbd, is_featured, is_new, is_popular")
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch products: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (productId: string, currentStatus: boolean | null) => {
    setUpdating(productId);
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_featured: !currentStatus })
        .eq("id", productId);

      if (error) throw error;
      toast.success(currentStatus ? "Product removed from featured" : "Product added to featured");
      fetchProducts();
    } catch (error: any) {
      toast.error("Failed to update: " + error.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleImageError = (productId: string) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  const featuredCount = products.filter((p) => p.is_featured).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Star className="h-5 w-5 text-accent" />
              Featured Products Management
            </span>
            <Badge variant="secondary">{featuredCount} Featured</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Select products to feature on the homepage. Featured products will be displayed prominently to visitors.
          </p>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  product.is_featured ? "ring-2 ring-accent" : ""
                }`}
              >
                <div className="relative h-32 w-full bg-muted">
                  {product.image_url && !imageErrors[product.id] ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      onError={() => handleImageError(product.id)}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-secondary">
                      <ImageOff className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  {product.is_featured && (
                    <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline">{product.category}</Badge>
                      {product.is_new && <Badge variant="secondary">New</Badge>}
                      {product.is_popular && <Badge variant="secondary">Popular</Badge>}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    THC: {product.thc}% | CBD: {product.cbd}%
                  </div>
                  <Button
                    variant={product.is_featured ? "destructive" : "premium"}
                    size="sm"
                    className="w-full transition-all duration-300"
                    onClick={() => toggleFeatured(product.id, product.is_featured)}
                    disabled={updating === product.id}
                  >
                    {updating === product.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : product.is_featured ? (
                      <>
                        <StarOff className="h-4 w-4 mr-2" />
                        Remove from Featured
                      </>
                    ) : (
                      <>
                        <Star className="h-4 w-4 mr-2" />
                        Add to Featured
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
