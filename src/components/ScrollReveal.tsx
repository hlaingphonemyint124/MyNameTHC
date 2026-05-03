import { useEffect } from "react";

/**
 * Adds a single global IntersectionObserver that toggles `.in-view` on any
 * element with the `.reveal` class once it enters the viewport.
 * Mount once near the app root.
 */
export const ScrollReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );

    const scan = () => {
      document.querySelectorAll(".reveal:not(.in-view)").forEach((el) => observer.observe(el));
    };

    scan();
    // re-scan on route changes / dynamic content
    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
};
