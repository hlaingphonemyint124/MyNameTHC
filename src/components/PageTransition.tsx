interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Lightweight page-enter animation using a pure CSS class.
 * No useState/useEffect — avoids the forced re-render on mount
 * that caused the previous version to briefly show invisible content.
 */
export const PageTransition = ({ children }: PageTransitionProps) => (
  <div className="page-enter">{children}</div>
);
