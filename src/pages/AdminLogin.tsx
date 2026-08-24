import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useGSAP } from "@/hooks/useGSAP";
import { fadeInUp } from "@/utils/animations";
import { Lock, ArrowRight, ShieldAlert, Mail } from "lucide-react";
import { toast } from "sonner";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (formRef.current) {
      fadeInUp(formRef.current, { delay: 0.2, duration: 0.8 });
    }
  }, []);

  // If already logged in, redirect to dashboard
  if (!isLoading && isAdmin) {
    navigate("/admin/dashboard", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const { success, error } = await login(email, password);
    
    if (success) {
      toast.success("Logged in successfully as Admin");
      navigate("/admin/dashboard");
    } else {
      toast.error(error || "Incorrect email or password");
      setPassword("");
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background relative z-10 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center pt-20 px-6">
        <div 
          ref={formRef} 
          className="w-full max-w-md p-8 md:p-10 rounded-3xl glass-panel relative overflow-hidden"
          style={{ opacity: 0 }}
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 inset-x-0 h-32 bg-primary/10 blur-[50px] -z-10" />

          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <ShieldAlert size={24} />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-normal text-foreground mb-2">
              Admin <span className="text-gradient">Login</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to access content management features.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground/50">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all duration-200 text-sm"
                  placeholder="admin@insilicovida.com"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground/50">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all duration-200 text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-display font-medium text-xs tracking-wider uppercase daylight-btn shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? "Authenticating..." : "Login"}
                {!isSubmitting && <ArrowRight size={14} />}
              </span>
              <div className="daylight-btn-overlay bg-secondary" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground/60">
              Secure authentication powered by Supabase.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminLogin;
