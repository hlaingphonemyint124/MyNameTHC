import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Loader2, Upload, Eye, EyeOff, GripVertical, Plus, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface Slideshow {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  display_order: number;
  is_active: boolean | null;
  created_at: string;
}

export const SlideshowManager = () => {
  const [slideshows, setSlideshows] = useState<Slideshow[]>([]);
  const [fetching, setFetching]   = useState(true);
  const [loading, setLoading]     = useState(false);

  // Form state
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl]         = useState("");
  const [imageFile, setImageFile]     = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [order, setOrder]             = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchAll(); }, []);

  // ── Fetch ALL slideshows (admin sees everything, active or not) ──────────
  const fetchAll = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from("slideshows")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      setSlideshows(data || []);
      // Default next order value
      setOrder(data ? data.length : 0);
    } catch (e: any) {
      toast.error("Failed to load slideshows: " + e.message);
    } finally {
      setFetching(false);
    }
  };

  // ── Image picker ─────────────────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { toast.error("Image must be under 8 MB"); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ── Upload to Supabase Storage ───────────────────────────────────────────
  const uploadImage = async (file: File): Promise<string | null> => {
    const ext      = file.name.split(".").pop();
    const fileName = `slide-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from("slideshow-images")
      .upload(fileName, file, { upsert: false });

    if (error) {
      toast.error("Image upload failed: " + error.message);
      return null;
    }

    const { data } = supabase.storage.from("slideshow-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  // ── Add new slide ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!imageFile)    { toast.error("Please choose an image"); return; }

    setLoading(true);
    try {
      const imageUrl = await uploadImage(imageFile);
      if (!imageUrl) return;

      const { error } = await supabase.from("slideshows").insert({
        title:         title.trim(),
        description:   description.trim() || null,
        image_url:     imageUrl,
        link_url:      linkUrl.trim() || null,
        display_order: order,
        is_active:     true,
      });
      if (error) throw error;

      toast.success("Slide added successfully!");
      // Reset form
      setTitle(""); setDescription(""); setLinkUrl("");
      setImageFile(null); setImagePreview("");
      if (fileRef.current) fileRef.current.value = "";
      await fetchAll();
    } catch (e: any) {
      toast.error("Failed to add slide: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Toggle active / hidden ───────────────────────────────────────────────
  const toggleActive = async (id: string, current: boolean | null) => {
    const next = !current;
    // Optimistic update
    setSlideshows(prev => prev.map(s => s.id === id ? { ...s, is_active: next } : s));
    const { error } = await supabase
      .from("slideshows")
      .update({ is_active: next })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update: " + error.message);
      fetchAll(); // revert
    } else {
      toast.success(next ? "Slide is now visible" : "Slide hidden");
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this slide permanently?")) return;
    const { error } = await supabase.from("slideshows").delete().eq("id", id);
    if (error) { toast.error("Delete failed: " + error.message); return; }
    toast.success("Slide deleted");
    setSlideshows(prev => prev.filter(s => s.id !== id));
  };

  // ── Update display_order ─────────────────────────────────────────────────
  const moveSlide = async (id: string, direction: "up" | "down") => {
    const idx   = slideshows.findIndex(s => s.id === id);
    const swap  = direction === "up" ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= slideshows.length) return;

    const next = [...slideshows];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    const updated = next.map((s, i) => ({ ...s, display_order: i }));
    setSlideshows(updated);

    await Promise.all(
      updated.map(s =>
        supabase.from("slideshows").update({ display_order: s.display_order }).eq("id", s.id)
      )
    );
    toast.success("Order updated");
  };

  const activeCount = slideshows.filter(s => s.is_active).length;

  return (
    <div className="space-y-6">

      {/* ── Add form ─────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" /> Add New Slide
          </CardTitle>
          <CardDescription>Upload an image and fill in the details to add a new hero slide.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Title *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Summer Collection" required />
              </div>
              <div className="space-y-1.5">
                <Label>Display Order</Label>
                <Input
                  type="number" min={0}
                  value={order}
                  onChange={e => setOrder(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Description <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="A short subtitle for the slide" />
            </div>

            <div className="space-y-1.5">
              <Label>Link URL <span className="text-muted-foreground">(optional)</span></Label>
              <Input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://example.com" type="url" />
            </div>

            <div className="space-y-1.5">
              <Label>Slide Image *</Label>
              <label className="flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-border hover:border-accent cursor-pointer transition-colors">
                <Upload className="h-5 w-5 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground truncate">
                  {imageFile ? imageFile.name : "Click to choose image (max 8 MB)"}
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              {imagePreview && (
                <div className="relative mt-2 rounded-lg overflow-hidden h-40 bg-muted">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(""); if (fileRef.current) fileRef.current.value = ""; }}
                    className="absolute top-2 right-2 rounded-full bg-destructive text-white h-7 w-7 flex items-center justify-center text-xs"
                  >✕</button>
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading} variant="premium" className="w-full">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading…</> : "Add Slide"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Existing slides ───────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle>Existing Slides ({slideshows.length})</CardTitle>
              <CardDescription className="mt-0.5">
                {activeCount} active · {slideshows.length - activeCount} hidden
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchAll} className="gap-2">
              <RefreshCw className="h-4 w-4" />Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fetching ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : slideshows.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No slides yet. Add your first one above.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {slideshows.map((slide, idx) => (
                <Card key={slide.id} className={`overflow-hidden transition-all duration-300 ${!slide.is_active ? "opacity-50" : ""}`}>
                  {/* Image */}
                  <div className="relative h-40 bg-muted overflow-hidden">
                    <img
                      src={slide.image_url}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    {/* Order badge */}
                    <span className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm text-foreground text-xs font-bold rounded-md px-2 py-0.5">
                      #{slide.display_order}
                    </span>
                    {/* Active badge */}
                    <span className={`absolute top-2 right-2 text-xs font-semibold rounded-md px-2 py-0.5 ${slide.is_active ? "bg-green-600 text-white" : "bg-muted-foreground/80 text-white"}`}>
                      {slide.is_active ? "Active" : "Hidden"}
                    </span>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <div>
                      <p className="font-semibold text-sm truncate">{slide.title}</p>
                      {slide.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{slide.description}</p>
                      )}
                      {slide.link_url && (
                        <a href={slide.link_url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent truncate block mt-0.5 hover:underline">
                          {slide.link_url}
                        </a>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      {/* Reorder */}
                      <div className="flex gap-1">
                        <Button
                          size="icon" variant="outline"
                          className="h-7 w-7"
                          disabled={idx === 0}
                          onClick={() => moveSlide(slide.id, "up")}
                          title="Move up"
                        >↑</Button>
                        <Button
                          size="icon" variant="outline"
                          className="h-7 w-7"
                          disabled={idx === slideshows.length - 1}
                          onClick={() => moveSlide(slide.id, "down")}
                          title="Move down"
                        >↓</Button>
                      </div>

                      {/* Toggle + Delete */}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={!!slide.is_active}
                          onCheckedChange={() => toggleActive(slide.id, slide.is_active)}
                        />
                        <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDelete(slide.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
