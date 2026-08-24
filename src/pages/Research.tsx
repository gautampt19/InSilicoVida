import { useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { researchAreas, researchDescription } from "@/data/research";
import { HighlightedText } from "@/components/HighlightedText";
import { useGSAP } from "@/hooks/useGSAP";
import { scrollStagger, fadeInUp } from "@/utils/animations";
import gsap from "gsap";
import { AnimatedNetwork } from "@/components/AnimatedNetwork";

const Research = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (headerRef.current) {
      fadeInUp(headerRef.current, { delay: 0.2, duration: 0.8 });
    }
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll(".research-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          delay: 0.4,
          stagger: 0.12,
          ease: "power3.out",
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative pt-12 pb-20 px-6 overflow-hidden">
          {/* Background Network & Gradients */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-primary/5 via-primary/5 to-transparent" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] opacity-70 translate-x-1/3 -translate-y-1/3" />
            <div className="absolute top-1/2 left-1/4 w-[1000px] h-[500px] -translate-y-1/2 opacity-20">
              <AnimatedNetwork />
            </div>
            {/* Edge fade gradients */}
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background to-transparent" />
            <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-background to-transparent" />
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
          </div>

          <div className="container mx-auto max-w-7xl relative z-10">
            <div ref={headerRef} className="mb-12 max-w-3xl" style={{ opacity: 0 }}>
              <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-3">Our Focus</p>
              <h1 className="font-serif text-3xl md:text-5xl font-normal text-foreground mb-6">
                Research <span className="text-primary">Areas</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                <HighlightedText text={researchDescription} />
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 px-6">
          <div className="container mx-auto max-w-7xl">

            {/* Research Cards — 2-column grid, always expanded */}
            <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {researchAreas.map((area, index) => (
                <div
                  key={area.title}
                  className="research-card group border border-border rounded-lg bg-card p-6 md:p-8 hover:border-primary/30 hover:shadow-md transition-all duration-300"
                  style={{ opacity: 0 }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
                      <area.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="font-serif text-xl md:text-2xl font-medium text-foreground group-hover:text-primary transition-colors">
                      {area.title.split("&").map((part, i, arr) => (
                        <span key={i}>
                          {part}
                          {i < arr.length - 1 && <span className="font-sans">&amp;</span>}
                        </span>
                      ))}
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed ml-[52px]">
                    <HighlightedText text={area.description} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Research;
