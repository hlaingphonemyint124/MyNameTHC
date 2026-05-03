import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Trash2, ImageIcon } from "lucide-react";

export const BackgroundManager = () => {
  const [loading, setLoading] = useState(false);
  const [currentBg, setCurrentBg] = useState<string | null>(null);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentBackground();
  }, []);

  const fetchCurrentBackground = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("background_image_url")
      .eq("id", "global")
      .single();
    if (data) setCurrentBg(data.background_image_url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBgFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!bgFile) {
      toast.error("Please select an image first");
      return;
    }
    setLoading(true);
    try {
      const fileExt = bgFile.name.split(".").pop();
      const filePath = `background-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("site-backgrounds")
        .upload(filePath, bgFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("site-backgrounds")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("site_settings")
        .update({ background_image_url: data.publicUrl, updated_at: new Date().toISOString() })
        .eq("id", "global");

      if (updateError) throw updateError;

      setCurrentBg(data.publicUrl);
      setBgFile(null);
      setPreviewUrl(null);
      toast.success("Background image updated! Reload the page to see it.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload background image");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Remove the background image?")) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .update({ background_image_url: null, updated_at: new Date().toISOString() })
        .eq("id", "global");
      if (error) throw error;
      setCurrentBg(null);
      toast.success("Background image removed");
    } catch {
      toast.error("Failed to remove background");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Website Background Image
        </CardTitle>
        <CardDescription>
          Upload a JPEG/PNG image to use as the global background for the entire site. No size limit.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current background preview */}
        {currentBg && (
          <div className="space-y-2">
            <Label>Current Background</Label>
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
              <img
                src={currentBg}
                alt="Current background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Button variant="destructive" size="sm" onClick={handleRemove} disabled={loading}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Upload new background */}
        <div className="space-y-3">
          <Label htmlFor="bg-image">Upload New Background (JPEG/PNG, no size limit)</Label>
          <Input
            id="bg-image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleFileChange}
            className="bg-background"
          />
          {previewUrl && (
            <div className="w-full h-40 rounded-lg overflow-hidden border border-border">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
          {bgFile && (
            <p className="text-xs text-muted-foreground">Selected: {bgFile.name} ({(bgFile.size / (1024 * 1024)).toFixed(2)} MB)</p>
          )}
          <Button
            variant="premium"
            onClick={handleUpload}
            disabled={loading || !bgFile}
            className="w-full md:w-auto"
          >
            <Upload className="h-4 w-4 mr-2" />
            {loading ? "Uploading..." : "Set as Background"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
