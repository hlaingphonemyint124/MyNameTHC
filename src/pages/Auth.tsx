import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Leaf, Eye, EyeOff, Mail, Lock, User, Shield, ArrowLeft, Phone, MapPin, CalendarIcon, Globe, MessageCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase").regex(/[a-z]/, "Must contain lowercase").regex(/[0-9]/, "Must contain a number"),
  confirmPassword: z.string(),
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(30),
  dateOfBirth: z.string().min(1, "Date of birth is required").refine(val => {
    const age = (Date.now() - new Date(val).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return age >= 21;
  }, "You must be at least 21 years old"),
  address: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(80),
  country: z.string().trim().min(2).max(80),
  lineId: z.string().trim().min(1).max(50),
  preferredContact: z.enum(["line", "phone", "email"]),
  agreeTerms: z.literal(true, { errorMap: () => ({ message: "You must agree to the terms" }) }),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Thailand");
  const [lineId, setLineId] = useState("");
  const [preferredContact, setPreferredContact] = useState<"line"|"phone"|"email"|"">("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get("tab") === "signup" ? "signup" : "signin";
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { if (session) navigate("/"); });
  }, [navigate]);

  const pwStrength = (p: string) => [p.length >= 8, /[A-Z]/.test(p), /[a-z]/.test(p), /[0-9]/.test(p), /[^A-Za-z0-9]/.test(p)].filter(Boolean).length;
  const strength = pwStrength(password);
  const strengthLabels = ["Very Weak","Weak","Fair","Good","Strong"];
  const strengthColors = ["bg-red-500","bg-orange-500","bg-yellow-500","bg-lime-500","bg-green-500"];

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = signInSchema.safeParse({ email, password });
    if (!r.success) { toast.error(r.error.errors[0].message); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message.includes("Invalid login") ? "Invalid email or password" : error.message);
      else { toast.success("Welcome back!"); navigate("/"); }
    } finally { setLoading(false); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = signUpSchema.safeParse({ email, password, confirmPassword, fullName, phone, dateOfBirth, address, city, country, lineId, preferredContact, agreeTerms });
    if (!r.success) { toast.error(r.error.errors[0].message); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/`, data: { full_name: fullName, phone, date_of_birth: dateOfBirth, address, city, country, line_id: lineId, preferred_contact: preferredContact } },
      });
      if (error) { toast.error(error.message); }
      else { toast.success("Account created! You can now sign in."); setActiveTab("signin"); }
    } finally { setLoading(false); }
  };

  const handleForgot = async () => {
    if (!email) { toast.error("Enter your email first"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth?type=recovery` });
      if (error) toast.error(error.message);
      else toast.success("Reset email sent! Check your inbox.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-hero relative overflow-hidden">
      {/* Background glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Back */}
      <div className="w-full max-w-md px-4 sm:px-0 mb-4 relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-4 sm:px-0 pb-8">
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="text-center pt-8 pb-4 px-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-lg">
                <Leaf className="h-8 w-8 text-background" />
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent font-display">
              My Name THC
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {activeTab === "signin" ? "Welcome back! Sign in to continue" : "Create your account to get started"}
            </p>
          </div>

          {/* Tabs */}
          <div className="px-5 sm:px-7 pb-7">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6 h-11">
                <TabsTrigger value="signin" className="text-sm font-medium">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm font-medium">Sign Up</TabsTrigger>
              </TabsList>

              {/* ── Sign In ── */}
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="si-email" className="flex items-center gap-2 text-sm">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
                    </Label>
                    <Input id="si-email" type="email" placeholder="your@email.com" value={email}
                      onChange={e => setEmail(e.target.value)} required className="h-11 bg-background" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="si-pw" className="flex items-center gap-2 text-sm">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Password
                    </Label>
                    <div className="relative">
                      <Input id="si-pw" type={showPassword ? "text" : "password"} placeholder="••••••••"
                        value={password} onChange={e => setPassword(e.target.value)} required className="h-11 bg-background pr-11" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox checked={rememberMe} onCheckedChange={v => setRememberMe(v as boolean)} />
                      <span className="text-muted-foreground">Remember me</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={handleForgot} className="text-accent hover:underline text-xs">Forgot password?</button>
                      <span className="text-border">|</span>
                      <button type="button" onClick={() => setActiveTab("signup")} className="text-accent hover:underline text-xs">Create account</button>
                    </div>
                  </div>

                  <Button type="submit" variant="premium" className="w-full h-11 text-sm font-semibold" disabled={loading}>
                    {loading ? <><div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />Signing in...</> : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              {/* ── Sign Up ── */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-3.5">

                  <div className="space-y-1.5">
                    <Label htmlFor="su-name" className="flex items-center gap-2 text-sm"><User className="h-3.5 w-3.5 text-muted-foreground" />Full Name</Label>
                    <Input id="su-name" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} required className="h-11 bg-background" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="su-phone" className="flex items-center gap-2 text-sm"><Phone className="h-3.5 w-3.5 text-muted-foreground" />Phone</Label>
                      <Input id="su-phone" type="tel" placeholder="+66 81 234 5678" value={phone} onChange={e => setPhone(e.target.value)} required className="h-11 bg-background" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="su-dob" className="flex items-center gap-2 text-sm"><CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />Date of Birth</Label>
                      <Input id="su-dob" type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)}
                        max={new Date().toISOString().split("T")[0]} required className="h-11 bg-background" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="su-addr" className="flex items-center gap-2 text-sm"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />Address</Label>
                    <Input id="su-addr" placeholder="123 Sukhumvit Rd." value={address} onChange={e => setAddress(e.target.value)} required className="h-11 bg-background" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="su-city" className="text-sm">City</Label>
                      <Input id="su-city" placeholder="Bangkok" value={city} onChange={e => setCity(e.target.value)} required className="h-11 bg-background" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="su-country" className="flex items-center gap-2 text-sm"><Globe className="h-3.5 w-3.5 text-muted-foreground" />Country</Label>
                      <Input id="su-country" placeholder="Thailand" value={country} onChange={e => setCountry(e.target.value)} required className="h-11 bg-background" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="su-line" className="flex items-center gap-2 text-sm"><MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />LINE ID</Label>
                      <Input id="su-line" placeholder="@yourlineid" value={lineId} onChange={e => setLineId(e.target.value)} required className="h-11 bg-background" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="su-contact" className="text-sm">Preferred Contact</Label>
                      <Select value={preferredContact} onValueChange={v => setPreferredContact(v as any)}>
                        <SelectTrigger id="su-contact" className="h-11 bg-background"><SelectValue placeholder="Choose" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="line">LINE</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="su-email" className="flex items-center gap-2 text-sm"><Mail className="h-3.5 w-3.5 text-muted-foreground" />Email</Label>
                    <Input id="su-email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-11 bg-background" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="su-pw" className="flex items-center gap-2 text-sm"><Lock className="h-3.5 w-3.5 text-muted-foreground" />Password</Label>
                    <div className="relative">
                      <Input id="su-pw" type={showPassword ? "text" : "password"} placeholder="••••••••"
                        value={password} onChange={e => setPassword(e.target.value)} required className="h-11 bg-background pr-11" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {password && (
                      <div className="space-y-1 pt-1">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? strengthColors[strength-1] : "bg-muted"}`} />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">Strength: <span className={strength >= 4 ? "text-green-500" : strength >= 3 ? "text-yellow-500" : "text-red-400"}>{strengthLabels[strength-1] || "Too weak"}</span></p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="su-confirm" className="flex items-center gap-2 text-sm"><Shield className="h-3.5 w-3.5 text-muted-foreground" />Confirm Password</Label>
                    <div className="relative">
                      <Input id="su-confirm" type={showConfirm ? "text" : "password"} placeholder="••••••••"
                        value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                        className={`h-11 bg-background pr-11 ${confirmPassword && password !== confirmPassword ? "border-destructive" : ""}`} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && <p className="text-xs text-destructive">Passwords don't match</p>}
                  </div>

                  <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                    <Checkbox checked={agreeTerms} onCheckedChange={v => setAgreeTerms(v as boolean)} className="mt-0.5 shrink-0" />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      I agree to the <span className="text-accent">Terms of Service</span> and <span className="text-accent">Privacy Policy</span>
                    </span>
                  </label>

                  <Button type="submit" variant="premium" className="w-full h-11 text-sm font-semibold mt-1"
                    disabled={loading || !agreeTerms || password !== confirmPassword}>
                    {loading ? <><div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />Creating...</> : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-5 pt-5 border-t border-border/60 text-center">
              <p className="text-xs text-muted-foreground">By continuing, you confirm that you are 21+ years old</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
