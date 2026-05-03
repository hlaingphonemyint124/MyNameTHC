/**
 * StaticBackground — replaces the heavy Three.js canvas with a pure-CSS
 * gradient + subtle SVG grain.  Zero JS animation, zero WebGL overhead.
 * Scroll performance is identical to a plain <div>.
 */
export const ThreeDLeavesBackground = () => {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
      style={{
        background:
          "radial-gradient(ellipse at top, hsl(145 50% 10%) 0%, hsl(145 45% 5%) 60%, hsl(145 50% 4%) 100%)",
      }}
    >
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, hsl(145 50% 4% / 0.6) 100%)",
        }}
      />
      {/* Grain */}
      <div className="absolute inset-0 bg-noise pointer-events-none mix-blend-overlay opacity-[0.04]" />
    </div>
  );
};
