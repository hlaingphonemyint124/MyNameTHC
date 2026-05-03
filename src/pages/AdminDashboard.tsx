import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { toast } from 'sonner';
import {
  Plus, Trash2, Upload, Pencil, Package, Images,
  Users, Star, Sparkles, Loader2, X, Search
} from 'lucide-react';
import { z } from 'zod';
import { SlideshowManager } from '@/components/SlideshowManager';
import { UserManagement } from '@/components/UserManagement';
import { BulkProductOperations } from '@/components/BulkProductOperations';
import { FeaturedProductsManager } from '@/components/FeaturedProductsManager';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.enum(['Indica', 'Sativa', 'Hybrid', 'Accessories']),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  thc: z.number().min(0).max(100),
  cbd: z.number().min(0).max(100),
});

const AdminDashboard = () => {
  const navigate   = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [loading, setLoading]   = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState('');

  // Form state
  const [name, setName]             = useState('');
  const [category, setCategory]     = useState<'Indica' | 'Sativa' | 'Hybrid' | 'Accessories'>('Indica');
  const [description, setDescription] = useState('');
  const [thc, setThc]               = useState('');
  const [cbd, setCbd]               = useState('');
  const [effects, setEffects]       = useState('');
  const [aroma, setAroma]           = useState('');
  const [flavor, setFlavor]         = useState('');
  const [isNew, setIsNew]           = useState(false);
  const [isPopular, setIsPopular]   = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => { if (isAdmin) fetchProducts(); }, [isAdmin]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { toast.error('Failed to fetch products'); return; }
    setProducts(data ?? []);
  };

  const filteredProducts = products.filter(p =>
    !productSearch.trim() ||
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setName(product.name);
    setCategory(product.category);
    setDescription(product.description);
    setThc(product.thc.toString());
    setCbd(product.cbd.toString());
    setEffects(product.effects?.join(', ') ?? '');
    setAroma(product.aroma?.join(', ') ?? '');
    setFlavor(product.flavor?.join(', ') ?? '');
    setIsNew(product.is_new ?? false);
    setIsPopular(product.is_popular ?? false);
    setIsFeatured(product.is_featured ?? false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null); setName(''); setCategory('Indica'); setDescription('');
    setThc(''); setCbd(''); setEffects(''); setAroma(''); setFlavor('');
    setIsNew(false); setIsPopular(false); setIsFeatured(false); setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = productSchema.safeParse({
      name, category, description,
      thc: parseFloat(thc), cbd: parseFloat(cbd),
    });
    if (!result.success) {
      result.error.errors.forEach(err => toast.error(err.message));
      return;
    }
    setLoading(true);
    try {
      let image_url: string | null = null;
      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile, { upsert: false });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
        image_url = urlData.publicUrl;
      }
      const payload: any = {
        name, category, description,
        thc: parseFloat(thc), cbd: parseFloat(cbd),
        effects: effects.split(',').map(s => s.trim()).filter(Boolean),
        aroma:   aroma.split(',').map(s => s.trim()).filter(Boolean),
        flavor:  flavor.split(',').map(s => s.trim()).filter(Boolean),
        is_new: isNew, is_popular: isPopular, is_featured: isFeatured,
      };
      if (image_url) payload.image_url = image_url;

      if (editingId) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Product updated!');
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
        toast.success('Product created!');
      }
      resetForm(); fetchProducts();
    } catch (err: any) {
      toast.error(err.message ?? 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { toast.error('Delete failed'); return; }
    toast.success('Product deleted');
    fetchProducts();
  };

  if (adminLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-accent" />
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container px-4 sm:px-6 pt-24 sm:pt-28 pb-20">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <p className="eyebrow mb-1 text-xs sm:text-sm">Dashboard</p>
          <h1 className="font-display text-2xl sm:text-4xl font-bold">Admin Panel</h1>
        </div>

        <Tabs defaultValue="products">
          {/* Responsive tab list — wraps on mobile */}
          <TabsList className="mb-6 flex flex-wrap h-auto gap-1 bg-secondary/50 p-1 rounded-xl w-full">
            {[
              { value: 'products',  icon: <Package className="h-3.5 w-3.5" />,  label: 'Products'  },
              { value: 'featured',  icon: <Star className="h-3.5 w-3.5" />,     label: 'Featured'  },
              { value: 'slideshow', icon: <Images className="h-3.5 w-3.5" />,   label: 'Slideshow' },
              { value: 'users',     icon: <Users className="h-3.5 w-3.5" />,    label: 'Users'     },
              { value: 'bulk',      icon: <Sparkles className="h-3.5 w-3.5" />, label: 'Bulk Ops'  },
            ].map(t => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1.5 flex-1 sm:flex-none"
              >
                {t.icon}
                <span>{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Products Tab ── */}
          <TabsContent value="products">
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">

              {/* Form */}
              <Card className="h-fit">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">
                    {editingId ? 'Edit Product' : 'Add Product'}
                  </CardTitle>
                  <CardDescription>
                    {editingId ? 'Update product details' : 'Add a new strain to your catalog'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="space-y-1.5">
                      <Label className="text-sm">Name *</Label>
                      <Input value={name} onChange={e => setName(e.target.value)} placeholder="Purple Kush" required />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm">Category *</Label>
                      <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['Indica','Sativa','Hybrid','Accessories'].map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm">Description *</Label>
                      <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe the strain…" required />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm">THC % *</Label>
                        <Input type="number" step="0.1" min="0" max="100" value={thc} onChange={e => setThc(e.target.value)} required placeholder="22.5" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm">CBD %</Label>
                        <Input type="number" step="0.1" min="0" max="100" value={cbd} onChange={e => setCbd(e.target.value)} placeholder="0.5" />
                      </div>
                    </div>

                    {[
                      { label: 'Effects', value: effects, set: setEffects, placeholder: 'Relaxing, Sleepy, Creative' },
                      { label: 'Aroma',   value: aroma,   set: setAroma,   placeholder: 'Earthy, Sweet, Pine' },
                      { label: 'Flavor',  value: flavor,  set: setFlavor,  placeholder: 'Grape, Berry, Citrus' },
                    ].map(f => (
                      <div key={f.label} className="space-y-1.5">
                        <Label className="text-sm">{f.label} <span className="text-muted-foreground">(comma-separated)</span></Label>
                        <Input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} />
                      </div>
                    ))}

                    <div className="space-y-1.5">
                      <Label className="text-sm">Product Image</Label>
                      <label className="flex items-center gap-2 px-3 py-2.5 rounded-md border border-border text-sm cursor-pointer hover:bg-muted/50 transition-colors w-full">
                        <Upload className="h-4 w-4 shrink-0" />
                        <span className="truncate">{imageFile ? imageFile.name : 'Choose file…'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && setImageFile(e.target.files[0])} />
                      </label>
                    </div>

                    {[
                      { id: 'is-new',      label: 'Mark as New',      val: isNew,      set: setIsNew },
                      { id: 'is-popular',  label: 'Mark as Popular',  val: isPopular,  set: setIsPopular },
                      { id: 'is-featured', label: 'Mark as Featured', val: isFeatured, set: setIsFeatured },
                    ].map(sw => (
                      <div key={sw.id} className="flex items-center justify-between py-1">
                        <Label htmlFor={sw.id} className="text-sm cursor-pointer">{sw.label}</Label>
                        <Switch id={sw.id} checked={sw.val} onCheckedChange={sw.set} />
                      </div>
                    ))}

                    <div className="flex gap-2 pt-2">
                      <Button type="submit" variant="premium" disabled={loading} className="flex-1">
                        {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : editingId ? 'Update Product' : 'Add Product'}
                      </Button>
                      {editingId && (
                        <Button type="button" variant="outline" onClick={resetForm}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Product list */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <h2 className="font-display text-lg font-semibold">All Products ({products.length})</h2>
                  <div className="relative w-full sm:w-56">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search…"
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {filteredProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <Package className="h-10 w-10 mb-3 opacity-40" />
                      <p className="text-sm">No products yet. Add your first strain!</p>
                    </div>
                  )}
                  {filteredProducts.map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-card border border-border/60 hover:border-accent/30 transition-colors group">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                          <p className="font-medium text-sm sm:text-base truncate">{p.name}</p>
                          {p.is_new      && <Badge className="text-xs bg-green-700 px-1.5">New</Badge>}
                          {p.is_popular  && <Badge className="text-xs bg-amber-700 px-1.5">Popular</Badge>}
                          {p.is_featured && <Badge className="text-xs bg-purple-700 px-1.5">Featured</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{p.category} · THC {p.thc}% · CBD {p.cbd}%</p>
                      </div>
                      <div className="flex gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(p)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="featured">  <FeaturedProductsManager /> </TabsContent>
          <TabsContent value="slideshow"> <SlideshowManager /> </TabsContent>
          <TabsContent value="users">     <UserManagement /> </TabsContent>
          <TabsContent value="bulk">
            <BulkProductOperations products={products} onRefresh={fetchProducts} />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
