import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Activity, Beaker, BrainCircuit, LineChart } from "lucide-react";

export const DashboardCards = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll(".dash-card");
    
    // Initial entrance animation
    gsap.fromTo(
      cards,
      { y: 50, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 1, stagger: 0.2, ease: "back.out(1.5)" }
    );

    // Continuous floating animation
    cards.forEach((card, i) => {
      gsap.to(card, {
        y: -15,
        duration: 2 + i * 0.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: i * 0.2,
      });
    });
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
      {/* Main Prediction Card */}
      <div className="dash-card absolute right-[25%] top-[25%] w-64 p-5 rounded-2xl glass-panel border border-primary/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-xl bg-background/40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <BrainCircuit size={16} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ToxPredict AI</span>
          </div>
          <span className="text-xs font-bold text-primary">98.4%</span>
        </div>
        
        <div className="space-y-3">
          <div className="h-2 w-full bg-border/50 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[85%] rounded-full" />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
            <span>Confidence</span>
            <span>High</span>
          </div>
        </div>
      </div>

      {/* Analytics Card */}
      <div className="dash-card absolute right-[10%] top-[45%] w-56 p-4 rounded-xl glass-panel border border-primary/20 shadow-lg backdrop-blur-xl bg-background/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-1.5 rounded-md bg-secondary/50 text-foreground">
            <LineChart size={14} />
          </div>
          <span className="text-[11px] font-semibold text-foreground">In-Silico Models</span>
        </div>
        
        <div className="flex items-end gap-2 h-12 mt-4">
          {[40, 70, 45, 90, 65, 100, 80].map((h, i) => (
            <div key={i} className="flex-1 bg-primary/20 rounded-t-sm relative group">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-sm transition-all duration-500" 
                style={{ height: `${h}%` }} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Small floating metric */}
      <div className="dash-card absolute right-[35%] bottom-[25%] px-4 py-3 rounded-full glass-panel border border-primary/20 shadow-lg backdrop-blur-xl bg-background/40 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-medium text-foreground tracking-wide">NAMs Pipeline Active</span>
      </div>
    </div>
  );
};
