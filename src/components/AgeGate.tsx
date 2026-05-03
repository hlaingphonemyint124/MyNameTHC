import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Leaf, ShieldCheck } from "lucide-react";

const STORAGE_KEY = "mnt_age_verified_v1";

export const AgeGate = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const verified = localStorage.getItem(STORAGE_KEY);
      if (!verified) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  // Lock body scroll and force scroll to top while gate is open
  useEffect(() => {
    if (open) {
      window.scrollTo(0, 0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const accept = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    setOpen(false);
  };

  const decline = () => {
    window.location.href = "https://www.google.com";
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-surface-deep/90 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-card hairline-strong p-8 shadow-2xl bg-noise overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-5">
            <div className="h-14 w-14 rounded-full bg-accent/15 flex items-center justify-center hairline">
              <Leaf className="h-7 w-7 text-accent" strokeWidth={1.75} />
            </div>
          </div>

          <p className="eyebrow text-center mb-2">Age Verification</p>
          <h2 id="age-gate-title" className="font-display text-3xl font-bold text-center text-foreground mb-3">
            Are you 21 or older?
          </h2>
          <p className="text-sm text-muted-foreground text-center leading-relaxed mb-6">
            My Name THC operates under Thai cannabis regulations. You must be of legal age
            to enter this site. Please consume responsibly.
          </p>

          <div className="flex flex-col gap-2.5">
            <Button onClick={accept} variant="premium" size="lg" className="w-full rounded-md font-semibold">
              Yes, I'm 21 or older
            </Button>
            <Button onClick={decline} variant="ghost" size="lg" className="w-full rounded-md text-muted-foreground hover:text-foreground">
              No, take me back
            </Button>
          </div>

          <div className="flex items-center justify-center gap-1.5 mt-5 text-[11px] uppercase tracking-wider text-muted-foreground">
            <ShieldCheck className="h-3 w-3" />
            <span>Lab tested · Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
