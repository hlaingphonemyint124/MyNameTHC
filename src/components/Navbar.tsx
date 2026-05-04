import { Link, useLocation } from "react-router-dom";
import { LogOut, User, Shield, Menu, ChevronRight, UserPlus, LogIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useState, useEffect } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.png";
import { ThemeToggle } from "./ThemeToggle";
import { ProfileAvatar } from "./ProfileAvatar";

export const Navbar = () => {
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const { isAdmin } = useAdmin();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 50);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/products", label: "Products" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  const isLoggedOut = !loading && !user;
  const isLoggedIn  = !loading && !!user;

  const textBase = isScrolled ? "text-foreground" : "text-white";
  const textNav  = isScrolled ? "text-foreground/85" : "text-white/90";

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isScrolled ? "backdrop-blur-md bg-background/40 border-b border-border/30" : "bg-transparent"
      }`}>
        <div className="container">
          <div className={`flex items-center justify-between transition-[height] duration-500 ${isScrolled ? "h-12 md:h-14" : "h-14 md:h-16"}`}>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <img src={logo} alt="My Name THC"
                className={`w-auto transition-all duration-500 group-hover:scale-105 ${isScrolled ? "h-7 md:h-8" : "h-8 md:h-9"}`}
              />
              <div className="flex flex-col -space-y-1">
                <span className={`font-display text-sm md:text-base font-semibold tracking-tight group-hover:text-accent transition-colors ${textBase}`}>
                  My Name THC
                </span>
                <span className={`text-[9px] font-medium uppercase tracking-[0.22em] hidden sm:block ${isScrolled ? "text-muted-foreground" : "text-white/70"}`}>
                  Premium · Bangkok
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path}
                  className={`relative text-sm font-medium px-4 py-2 rounded-md transition-colors hover:text-accent ${isActive(link.path) ? "text-accent" : textNav}`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="ml-3 pl-3 border-l border-border/40"><ThemeToggle /></div>
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full p-0 ml-1">
                      <ProfileAvatar />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <div className="px-2 py-1.5 text-sm">
                      <p className="font-medium truncate">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer"><User className="mr-2 h-4 w-4" />Profile</Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer"><Shield className="mr-2 h-4 w-4" />Admin</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2 ml-2">
                  <Link to="/auth"><Button variant="ghost" size="sm" className={`rounded-md ${textNav}`}>Sign In</Button></Link>
                  <Link to="/auth?tab=signup"><Button variant="premium" size="sm" className="rounded-md">Sign Up</Button></Link>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <div className="flex lg:hidden items-center gap-1">
              <ThemeToggle />
              <button
                onClick={() => setMobileOpen(true)}
                className={`p-2 rounded-md hover:text-accent transition-colors ${textBase}`}
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile drawer — completely custom, no Sheet component ── */}
      {/* Backdrop */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`lg:hidden fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel */}
      <div className={`lg:hidden fixed top-0 right-0 z-[201] h-[100dvh] w-[85vw] max-w-[380px] flex flex-col
        bg-gradient-to-b from-background via-background to-[hsl(145,50%,5%)]
        border-l border-accent/20 shadow-2xl
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? "translate-x-0" : "translate-x-full"}
      `}>

        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-none">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-accent/8 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-accent/5 blur-3xl" />
        </div>

        {/* Close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-accent/10 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand header */}
        <div className="relative px-6 pt-6 pb-5 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-3">
            <img src={logo} alt="My Name THC" className="h-9 w-auto" />
            <div>
              <p className="font-display text-base font-semibold text-foreground">My Name THC</p>
              <p className="text-[9px] uppercase tracking-[0.22em] text-accent/80">Premium · Bangkok</p>
            </div>
          </div>
        </div>

        {/* Nav links — scrollable */}
        <nav className="relative flex-1 overflow-y-auto px-4 py-5 min-h-0">
          <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">Menu</p>
          <ul className="space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`group flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all duration-200 ${
                      active
                        ? "bg-accent/10 border-accent/30 text-accent"
                        : "border-transparent hover:bg-accent/5 hover:border-accent/15 text-foreground hover:text-accent"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${active ? "bg-accent" : "bg-muted-foreground/40 group-hover:bg-accent/60"}`} />
                      <span className="font-display text-lg font-medium">{link.label}</span>
                    </span>
                    <ChevronRight className={`h-4 w-4 shrink-0 transition-opacity ${active ? "opacity-100 text-accent" : "opacity-0 group-hover:opacity-50"}`} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Auth section — pinned to bottom ── */}
        <div className="relative shrink-0 px-5 pt-4 pb-6 border-t border-border/40 bg-black/10">

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-5 text-muted-foreground text-sm">
              <div className="h-4 w-4 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
              <span>Loading...</span>
            </div>
          )}

          {/* Logged OUT */}
          {isLoggedOut && (
            <div className="space-y-3">
              <p className="text-center text-xs text-muted-foreground/70 pb-1">
                Sign in to access your account
              </p>
              <Link to="/auth" onClick={() => setMobileOpen(false)}>
                <button className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-accent text-background font-semibold text-sm hover:bg-accent/90 active:scale-[0.98] transition-all">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </button>
              </Link>
              <Link to="/auth?tab=signup" onClick={() => setMobileOpen(false)}>
                <button className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-accent/50 text-foreground font-semibold text-sm hover:border-accent hover:text-accent hover:bg-accent/5 active:scale-[0.98] transition-all">
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </button>
              </Link>
            </div>
          )}

          {/* Logged IN */}
          {isLoggedIn && (
            <div className="space-y-2.5">
              {/* User card */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-border/50 mb-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center text-background font-bold text-sm shrink-0">
                  {user.email?.[0]?.toUpperCase() ?? "U"}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Signed in</p>
                  <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                </div>
              </div>
              <Link to="/profile" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/40 hover:border-accent/40 hover:bg-accent/5 text-foreground hover:text-accent transition-all"
              >
                <User className="h-4 w-4 text-accent shrink-0" />
                <span className="text-sm font-medium">Profile Settings</span>
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/40 hover:border-accent/40 hover:bg-accent/5 text-foreground hover:text-accent transition-all"
                >
                  <Shield className="h-4 w-4 text-accent shrink-0" />
                  <span className="text-sm font-medium">Admin Dashboard</span>
                </Link>
              )}
              <button
                onClick={async () => { await signOut(); setMobileOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm font-medium hover:bg-destructive/15 hover:border-destructive/50 active:scale-[0.98] transition-all"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}

          <p className="mt-4 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground/30">
            © My Name THC · Bangkok
          </p>
        </div>
      </div>
    </>
  );
};
