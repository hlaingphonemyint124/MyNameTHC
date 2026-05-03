import { Link, useLocation } from "react-router-dom";
import { LogOut, User, Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import logo from "@/assets/logo.png";
import { ThemeToggle } from "./ThemeToggle";
import { ProfileAvatar } from "./ProfileAvatar";

export const Navbar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  
  const handleSignOut = async () => {
    await signOut();
  };

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 50);
        ticking = false;
      });
    };
    
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/products", label: "Products" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];
  
  // Over the transparent hero we always use white text for legibility.
  // Once scrolled (translucent bg), revert to theme-aware foreground.
  const textBase = isScrolled ? "text-foreground" : "text-white";
  const textMuted = isScrolled ? "text-muted-foreground" : "text-white/70";
  const textNav = isScrolled ? "text-foreground/85" : "text-white/90";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isScrolled
          ? "backdrop-blur-md bg-background/40 border-b border-border/30"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container">
        <div className={`flex items-center justify-between transition-[height] duration-500 ${isScrolled ? "h-12 md:h-14" : "h-14 md:h-16"}`}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <img
              src={logo}
              alt="My Name THC"
              className={`w-auto transition-all duration-500 group-hover:scale-105 ${isScrolled ? "h-7 md:h-8" : "h-8 md:h-9"}`}
            />
            <div className="flex flex-col -space-y-1">
              <span className={`font-display text-sm md:text-base font-semibold tracking-tight group-hover:text-accent transition-colors duration-300 ${textBase}`}>
                My Name THC
              </span>
              <span className={`text-[9px] font-medium uppercase tracking-[0.22em] hidden sm:block transition-colors duration-300 ${textMuted}`}>
                Premium · Bangkok
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation (lg and up) */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-glow group/nav relative text-sm font-medium px-4 py-2 rounded-md transition-colors duration-300 hover:text-accent ${
                  isActive(link.path)
                    ? "text-accent"
                    : textNav
                }`}
              >
                {link.label}
                <span
                  className={`absolute left-1/2 -translate-x-1/2 -bottom-0.5 h-1 w-1 rounded-full bg-accent transition-all duration-300 ${
                    isActive(link.path) ? "opacity-100 scale-100" : "opacity-0 scale-50 group-hover/nav:opacity-60 group-hover/nav:scale-100"
                  }`}
                />
              </Link>
            ))}

            <div className="ml-3 pl-3 border-l border-border/40">
              <ThemeToggle />
            </div>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full p-0 ml-1 transition-transform duration-300 hover:scale-105">
                    <ProfileAvatar />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 animate-scale-in">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer transition-colors duration-200">
                      <User className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer transition-colors duration-200">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer transition-colors duration-200">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth" className="ml-1">
                <Button variant="premium" size="sm" className="rounded-md">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile + Tablet Navigation (below lg) */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`hover:text-accent ${textBase}`}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[88vw] sm:w-[420px] p-0 border-l border-accent/20 bg-gradient-to-b from-background via-background to-surface-deep/80 backdrop-blur-2xl"
              >
                {/* Decorative gold glow */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
                  <div className="absolute -bottom-40 -left-20 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
                  <div className="absolute inset-0 bg-noise opacity-[0.04]" />
                </div>

                <div className="relative flex flex-col h-full">
                  {/* Header / brand */}
                  <div className="px-7 pt-8 pb-6 border-b border-border/40">
                    <div className="flex items-center gap-3">
                      <img src={logo} alt="My Name THC" className="h-9 w-auto" />
                      <div className="flex flex-col -space-y-0.5">
                        <span className="font-display text-base font-semibold tracking-tight text-foreground">
                          My Name THC
                        </span>
                        <span className="text-[9px] font-medium uppercase tracking-[0.22em] text-accent/80">
                          Premium · Bangkok
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Nav links */}
                  <nav className="flex-1 px-4 py-6 overflow-y-auto">
                    <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                      Menu
                    </p>
                    <ul className="space-y-1">
                      {navLinks.map((link, i) => {
                        const active = isActive(link.path);
                        return (
                          <li key={link.path}>
                            <SheetClose asChild>
                              <Link
                                to={link.path}
                                className={`group/link relative flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 ${
                                  active
                                    ? "bg-accent/10 border border-accent/30"
                                    : "border border-transparent hover:bg-accent/5 hover:border-accent/15"
                                }`}
                                style={{ animationDelay: `${i * 50}ms` }}
                              >
                                <span className="flex items-center gap-3">
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                                      active
                                        ? "bg-accent shadow-[0_0_10px_hsl(var(--accent))]"
                                        : "bg-muted-foreground/30 group-hover/link:bg-accent/60"
                                    }`}
                                  />
                                  <span
                                    className={`font-display text-lg font-medium transition-colors duration-300 ${
                                      active ? "text-accent" : "text-foreground group-hover/link:text-accent"
                                    }`}
                                  >
                                    {link.label}
                                  </span>
                                </span>
                                <span
                                  className={`text-accent transition-all duration-300 ${
                                    active
                                      ? "opacity-100 translate-x-0"
                                      : "opacity-0 -translate-x-2 group-hover/link:opacity-60 group-hover/link:translate-x-0"
                                  }`}
                                  aria-hidden
                                >
                                  →
                                </span>
                              </Link>
                            </SheetClose>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>

                  {/* Footer / account */}
                  <div className="relative px-6 py-6 border-t border-border/40 bg-surface/30 backdrop-blur-sm">
                    {user ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-border/40">
                          <div className="h-10 w-10 rounded-full bg-gradient-gold flex items-center justify-center text-background font-semibold text-sm shrink-0">
                            {user.email?.[0]?.toUpperCase() ?? "U"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
                              Signed in
                            </p>
                            <p className="text-sm font-medium text-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <SheetClose asChild>
                            <Link
                              to="/profile"
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/85 hover:text-accent hover:bg-accent/5 transition-all duration-200"
                            >
                              <User className="h-4 w-4 text-accent/80" />
                              Profile Settings
                            </Link>
                          </SheetClose>
                          {isAdmin && (
                            <SheetClose asChild>
                              <Link
                                to="/admin"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/85 hover:text-accent hover:bg-accent/5 transition-all duration-200"
                              >
                                <Shield className="h-4 w-4 text-accent/80" />
                                Admin Dashboard
                              </Link>
                            </SheetClose>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            handleSignOut();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm font-medium hover:bg-destructive/10 hover:border-destructive/50 transition-all duration-300"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <SheetClose asChild>
                        <Link to="/auth">
                          <Button variant="premium" className="w-full rounded-xl h-12">
                            Sign In
                          </Button>
                        </Link>
                      </SheetClose>
                    )}

                    <p className="mt-5 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
                      © My Name THC · Bangkok
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};
