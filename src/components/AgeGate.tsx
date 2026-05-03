import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Leaf, ShieldCheck } from "lucide-react";

export const AgeGate = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem("age_ok")) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [visible]);

  if (!visible) return null;

  const accept = () => {
    try { sessionStorage.setItem("age_ok", "1"); } catch {}
    setVisible(false);
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0,
      width: "100vw",
      height: "100vh",
      zIndex: 99999,
      background: "hsl(145, 50%, 4%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      boxSizing: "border-box",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "440px",
        borderRadius: "16px",
        padding: "clamp(24px, 5vw, 40px)",
        background: "hsl(145, 40%, 8%)",
        border: "1px solid hsl(145, 30%, 18%)",
        boxShadow: "0 32px 64px -16px hsl(145 50% 2% / 0.8)",
        boxSizing: "border-box",
      }}>
        {/* Icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "50%",
            background: "hsl(82, 60%, 40%, 0.15)",
            border: "1px solid hsl(82, 60%, 40%, 0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Leaf style={{ width: "28px", height: "28px", color: "hsl(82, 60%, 55%)" }} strokeWidth={1.75} />
          </div>
        </div>

        {/* Text */}
        <p style={{
          textAlign: "center", marginBottom: "8px",
          fontSize: "11px", fontWeight: 600,
          letterSpacing: "0.14em", textTransform: "uppercase",
          color: "hsl(82, 60%, 55%)",
        }}>
          Age Verification
        </p>
        <h2 style={{
          textAlign: "center", marginBottom: "12px",
          fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 700,
          color: "hsl(60, 20%, 95%)",
          fontFamily: "Fraunces, Georgia, serif",
          lineHeight: 1.2,
        }}>
          Are you 21 or older?
        </h2>
        <p style={{
          textAlign: "center", marginBottom: "28px",
          fontSize: "14px", lineHeight: 1.6,
          color: "hsl(145, 15%, 60%)",
        }}>
          My Name THC operates under Thai cannabis regulations. You must be of legal age to enter this site. Please consume responsibly.
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Button onClick={accept} variant="premium" size="lg" className="w-full rounded-md font-semibold">
            Yes, I'm 21 or older
          </Button>
          <Button
            onClick={() => window.location.href = "https://www.google.com"}
            variant="ghost" size="lg"
            className="w-full rounded-md text-muted-foreground hover:text-foreground"
          >
            No, take me back
          </Button>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "6px", marginTop: "20px",
          fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase",
          color: "hsl(145, 15%, 45%)",
        }}>
          <ShieldCheck style={{ width: "12px", height: "12px" }} />
          <span>Lab tested · Compliant</span>
        </div>
      </div>
    </div>
  );
};
