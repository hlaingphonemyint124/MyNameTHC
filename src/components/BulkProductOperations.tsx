import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Package, Trash2, Star, Sparkles, ToggleLeft, Search,
  Upload, FileText, Download, CheckSquare, Square, AlertTriangle,
  Loader2, X, ChevronDown, ChevronUp
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Product {
  id: string;
  name: string;
  category: string;
  thc: number;
  cbd: number;
  is_new: boolean | null;
  is_popular: boolean | null;
  is_featured: boolean | null;
}

interface BulkProductOperationsProps {
  products: Product[];
  onRefresh: () => void;
}

interface CsvRow {
  name: string;
  category: string;
  description: string;
  thc: number;
  cbd: number;
  effects: string[];
  aroma: string[];
  flavor: string[];
  is_new: boolean;
  is_popular: boolean;
  is_featured: boolean;
}

// ── CSV Template header ──────────────────────────────────────
const CSV_TEMPLATE_HEADER = "name,category,description,thc,cbd,effects,aroma,flavor,is_new,is_popular,is_featured";
const CSV_TEMPLATE_ROW    = "Purple Kush,Indica,\"A classic indica with earthy notes.\",22.5,0.5,\"Relaxing,Sleepy,Happy\",\"Earthy,Sweet,Pine\",\"Grape,Berry,Wood\",false,true,false";

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE_HEADER + "\n" + CSV_TEMPLATE_ROW], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "cannabis_import_template.csv"; a.click();
  URL.revokeObjectURL(url);
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row.");

  const header = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
  const required = ["name", "category", "description", "thc", "cbd"];
  for (const col of required) {
    if (!header.includes(col)) throw new Error(`CSV is missing required column: "${col}"`);
  }

  return lines.slice(1).map((line, idx) => {
    // Handle quoted fields with commas
    const cols: string[] = [];
    let cur = ""; let inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === "," && !inQ) { cols.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    cols.push(cur.trim());

    const get = (col: string) => {
      const i = header.indexOf(col);
      return i >= 0 ? (cols[i] ?? "").replace(/"/g, "").trim() : "";
    };
    const getArr = (col: string) =>
      get(col).split(",").map(s => s.trim()).filter(Boolean);
    const getBool = (col: string) => get(col).toLowerCase() === "true";

    const thc = parseFloat(get("thc"));
    const cbd = parseFloat(get("cbd"));
    if (!get("name"))     throw new Error(`Row ${idx + 2}: "name" is required.`);
    if (!["Indica","Sativa","Hybrid","Accessories"].includes(get("category")))
      throw new Error(`Row ${idx + 2}: category must be Indica, Sativa, Hybrid, or Accessories.`);
    if (isNaN(thc) || thc < 0 || thc > 100) throw new Error(`Row ${idx + 2}: invalid THC value.`);
    if (isNaN(cbd) || cbd < 0 || cbd > 100) throw new Error(`Row ${idx + 2}: invalid CBD value.`);

    return {
      name: get("name"),
      category: get("category"),
      description: get("description") || `${get("name")} — premium ${get("category")} strain.`,
      thc, cbd,
      effects:    getArr("effects"),
      aroma:      getArr("aroma"),
      flavor:     getArr("flavor"),
      is_new:     getBool("is_new"),
      is_popular: getBool("is_popular"),
      is_featured:getBool("is_featured"),
    };
  });
}

export const BulkProductOperations = ({ products, onRefresh }: BulkProductOperationsProps) => {
  const [selectedIds, setSelectedIds]     = useState<string[]>([]);
  const [loading, setLoading]             = useState(false);
  const [searchQuery, setSearchQuery]     = useState("");
  const [confirmAction, setConfirmAction] = useState<null | { label: string; fn: () => void }>(null);

  // CSV import state
  const [csvRows, setCsvRows]         = useState<CsvRow[]>([]);
  const [csvError, setCsvError]       = useState<string | null>(null);
  const [importing, setImporting]     = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importDone, setImportDone]   = useState(false);
  const [csvExpanded, setCsvExpanded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  // ── Selection helpers ────────────────────────────────────────
  const toggle = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelectedIds(prev => prev.length === filtered.length ? [] : filtered.map(p => p.id));
  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length;

  // ── Bulk DB operations ───────────────────────────────────────
  const bulkUpdate = async (patch: Record<string, boolean>, successMsg: string) => {
    if (!selectedIds.length) { toast.error("No products selected"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from("products").update(patch).in("id", selectedIds);
      if (error) throw error;
      toast.success(successMsg);
      setSelectedIds([]); onRefresh();
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const bulkDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("products").delete().in("id", selectedIds);
      if (error) throw error;
      toast.success(`Deleted ${selectedIds.length} product(s)`);
      setSelectedIds([]); onRefresh();
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const ask = (label: string, fn: () => void) => setConfirmAction({ label, fn });

  // ── CSV import ───────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError(null); setImportDone(false);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const rows = parseCsv(ev.target?.result as string);
        setCsvRows(rows); setCsvExpanded(true);
      } catch (err: any) {
        setCsvError(err.message); setCsvRows([]);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const runImport = async () => {
    if (!csvRows.length) return;
    setImporting(true); setImportProgress(0); setImportDone(false);
    let done = 0;
    const CHUNK = 10;
    try {
      for (let i = 0; i < csvRows.length; i += CHUNK) {
        const batch = csvRows.slice(i, i + CHUNK);
        const { error } = await supabase.from("products").insert(
          batch.map(r => ({
            ...r,
            effects: r.effects.length ? r.effects : ["—"],
            aroma:   r.aroma.length   ? r.aroma   : ["—"],
            flavor:  r.flavor.length  ? r.flavor  : ["—"],
          }))
        );
        if (error) throw error;
        done += batch.length;
        setImportProgress(Math.round((done / csvRows.length) * 100));
      }
      toast.success(`✅ Imported ${csvRows.length} products!`);
      setImportDone(true); setCsvRows([]); onRefresh();
    } catch (e: any) {
      toast.error("Import failed: " + e.message);
    } finally {
      setImporting(false);
    }
  };

  const clearCsv = () => { setCsvRows([]); setCsvError(null); setImportDone(false); };

  // ── Action buttons config ────────────────────────────────────
  const actions = [
    { label: "Mark New",       icon: <Sparkles className="h-4 w-4" />, variant: "default" as const,      fn: () => ask(`Mark ${selectedIds.length} as New?`,       () => bulkUpdate({ is_new: true },     `Marked ${selectedIds.length} as New`)) },
    { label: "Mark Popular",   icon: <Star className="h-4 w-4" />,     variant: "default" as const,      fn: () => ask(`Mark ${selectedIds.length} as Popular?`,   () => bulkUpdate({ is_popular: true }, `Marked ${selectedIds.length} as Popular`)) },
    { label: "Mark Featured",  icon: <Star className="h-4 w-4" />,     variant: "default" as const,      fn: () => ask(`Mark ${selectedIds.length} as Featured?`,  () => bulkUpdate({ is_featured: true },`Marked ${selectedIds.length} as Featured`)) },
    { label: "Remove New",     icon: <X className="h-4 w-4" />,        variant: "outline" as const,      fn: () => ask(`Remove 'New' from ${selectedIds.length}?`, () => bulkUpdate({ is_new: false },    `Removed 'New' badge`)) },
    { label: "Remove Popular", icon: <X className="h-4 w-4" />,        variant: "outline" as const,      fn: () => ask(`Remove 'Popular' from ${selectedIds.length}?`, () => bulkUpdate({ is_popular: false }, `Removed 'Popular' badge`)) },
    { label: `Delete (${selectedIds.length})`, icon: <Trash2 className="h-4 w-4" />, variant: "destructive" as const, fn: () => ask(`Permanently delete ${selectedIds.length} product(s)?`, bulkDelete) },
  ];

  return (
    <>
      <div className="space-y-6">

        {/* ── CSV Import Card ──────────────────────────────── */}
        <Card>
          <CardHeader className="cursor-pointer select-none" onClick={() => setCsvExpanded(v => !v)}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5 text-accent" />
                CSV Import
                {csvRows.length > 0 && (
                  <Badge variant="secondary">{csvRows.length} rows ready</Badge>
                )}
              </CardTitle>
              {csvExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
            <CardDescription>Import multiple products from a CSV file</CardDescription>
          </CardHeader>

          {csvExpanded && (
            <CardContent className="space-y-4">
              {/* Download template */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
                  <Download className="h-4 w-4" /> Download Template
                </Button>
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-2">
                  <Upload className="h-4 w-4" /> Choose CSV File
                </Button>
                <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
              </div>

              {/* Format hint */}
              <div className="text-xs text-muted-foreground bg-secondary/40 rounded-lg p-3 font-mono leading-relaxed">
                <p className="font-semibold mb-1 text-foreground">Required columns:</p>
                <p>name, category (Indica/Sativa/Hybrid/Accessories), description, thc, cbd</p>
                <p className="mt-1 font-semibold text-foreground">Optional columns:</p>
                <p>effects, aroma, flavor, is_new, is_popular, is_featured</p>
                <p className="mt-1">Use commas inside quotes for array fields: <span className="text-accent">"Relaxing,Sleepy,Happy"</span></p>
              </div>

              {/* Error */}
              {csvError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{csvError}</span>
                </div>
              )}

              {/* Preview */}
              {csvRows.length > 0 && !importDone && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{csvRows.length} products ready to import</Label>
                    <Button variant="ghost" size="sm" onClick={clearCsv}><X className="h-4 w-4" /></Button>
                  </div>
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                    {csvRows.map((row, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                        <span className="font-medium truncate">{row.name}</span>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <Badge variant="outline" className="text-xs">{row.category}</Badge>
                          <span className="text-muted-foreground">THC {row.thc}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {importing && (
                    <div className="space-y-1">
                      <Progress value={importProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground text-right">{importProgress}%</p>
                    </div>
                  )}
                  <Button onClick={runImport} disabled={importing} className="w-full gap-2">
                    {importing
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Importing…</>
                      : <><Upload className="h-4 w-4" /> Import {csvRows.length} Products</>}
                  </Button>
                </div>
              )}

              {importDone && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-600 text-sm font-medium">
                  ✅ Import complete! Products have been added to your catalog.
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* ── Bulk Operations Card ──────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Bulk Operations
              {selectedIds.length > 0 && (
                <Badge className="bg-accent text-accent-foreground">{selectedIds.length} selected</Badge>
              )}
            </CardTitle>
            <CardDescription>Select products and apply batch actions</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Select all + actions */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={toggleAll} className="gap-2">
                {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                {allSelected ? "Deselect All" : "Select All"}
              </Button>
              {actions.map(a => (
                <Button
                  key={a.label}
                  variant={a.variant}
                  size="sm"
                  className="gap-1"
                  disabled={loading || selectedIds.length === 0}
                  onClick={a.fn}
                >
                  {loading && selectedIds.length > 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : a.icon}
                  <span className="hidden sm:inline">{a.label}</span>
                </Button>
              ))}
            </div>

            {/* Product list */}
            <div className="max-h-[400px] overflow-y-auto rounded-lg border border-border divide-y divide-border">
              {filtered.length === 0 && (
                <div className="py-10 text-center text-muted-foreground text-sm">No products found</div>
              )}
              {filtered.map(p => (
                <label
                  key={p.id}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/5 transition-colors"
                >
                  <Checkbox
                    checked={selectedIds.includes(p.id)}
                    onCheckedChange={() => toggle(p.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-medium text-sm truncate">{p.name}</span>
                      <Badge variant="secondary" className="text-xs">{p.category}</Badge>
                      {p.is_new     && <Badge className="text-xs bg-green-600"><Sparkles className="h-2.5 w-2.5 mr-0.5" />New</Badge>}
                      {p.is_popular && <Badge className="text-xs bg-amber-600"><Star className="h-2.5 w-2.5 mr-0.5" />Popular</Badge>}
                      {p.is_featured && <Badge className="text-xs bg-purple-600"><Star className="h-2.5 w-2.5 mr-0.5" />Featured</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">THC {p.thc}% · CBD {p.cbd}%</p>
                  </div>
                </label>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">{filtered.length} of {products.length} products shown</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Confirm Dialog ─────────────────────────────────── */}
      <AlertDialog open={!!confirmAction} onOpenChange={o => !o && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Confirm Action
            </AlertDialogTitle>
            <AlertDialogDescription>{confirmAction?.label}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { confirmAction?.fn(); setConfirmAction(null); }}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
