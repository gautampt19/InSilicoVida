import { useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ExternalLink, Github, Star } from "lucide-react";
import { useSoftware } from "@/contexts/SoftwareContext";
import { HighlightedText } from "@/components/HighlightedText";
import { useGSAP } from "@/hooks/useGSAP";
import { scrollStagger, fadeInUp } from "@/utils/animations";
import { SoftwareCategory, Software as SoftwareType } from "@/data/types";
import gsap from "gsap";
import { AnimatedNetwork } from "@/components/AnimatedNetwork";

const getLanguageColor = (language: string) => {
  const colors: Record<string, string> = {
    Python: "hsl(210, 60%, 50%)",
    R: "hsl(200, 70%, 45%)",
    "C++": "hsl(340, 80%, 55%)",
    JavaScript: "hsl(50, 90%, 50%)",
  };
  return colors[language] || "hsl(var(--muted-foreground))";
};

type FilterType = "all" | SoftwareCategory;

const Software = () => {
  const { software, isLoading } = useSoftware();
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filteredSoftware =
    activeFilter === "all"
      ? software
      : software.filter((item) => item.category === activeFilter);

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pbpk", label: "PBPK" },
    { value: "text-mining", label: "Text Mining" },
    { value: "omics", label: "Omics" },
  ];

  useGSAP(() => {
    if (isLoading) return;
    
    if (headerRef.current) {
      fadeInUp(headerRef.current, { delay: 0.2, duration: 0.8 });
    }
    if (filtersRef.current) {
      const buttons = filtersRef.current.querySelectorAll("button");
      gsap.fromTo(
        buttons,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: "power2.out",
          delay: 0.4,
        }
      );
    }
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll(".software-card");
      scrollStagger(cards, {
        start: "top 85%",
        stagger: 0.08,
        once: true,
        trigger: cardsRef.current,
      });
    }
  }, [activeFilter, isLoading]);

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
            <div ref={headerRef} className="mb-10" style={{ opacity: 0 }}>
              <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-3">Open Source</p>
              <h1 className="font-serif text-3xl md:text-5xl font-normal leading-tight mb-4">
                Software <span className="font-sans">&</span> <span className="text-primary">Tools</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                <HighlightedText text="Open-source software developed by our laboratory to support reproducible research and advance computational methods." />
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 px-6">
          <div className="container mx-auto max-w-7xl">

            {/* Filter Tabs */}
            <div ref={filtersRef} className="flex flex-wrap gap-2 mb-8">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setActiveFilter(option.value)}
                  style={{ opacity: 0 }}
                  className={`px-5 py-2 text-xs font-display font-semibold tracking-wider uppercase rounded-full transition-all duration-300 ${
                    activeFilter === option.value
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-card/50 border border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Software Cards */}
            {isLoading ? (
              <div className="py-20 flex justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div
                ref={cardsRef}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr"
              >
                {filteredSoftware.map((item) => (
                  <SoftwareCard key={item.id || item.name} item={item} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

/* ─── Software Card ─── */
const SoftwareCard = ({ item }: { item: SoftwareType }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const langColor = item.language ? getLanguageColor(item.language) : null;
  const isLong = item.description.length > 180;
  const displayDesc = isExpanded || !isLong 
    ? item.description 
    : item.description.slice(0, 180).trim() + "...";

  return (
    <article
      ref={cardRef}
      className="software-card group flex flex-col p-6 md:p-8 border border-border/60 bg-card bg-gradient-to-b from-primary/[0.03] to-transparent hover:from-primary/[0.08] hover:border-primary/40 hover:shadow-lg transition-all duration-500 h-full relative"
      style={{ opacity: 0 }}
    >
      {/* Left Accent Bar matching language */}
      {langColor && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 opacity-40 group-hover:opacity-100 transition-opacity duration-500"
          style={{ backgroundColor: langColor }}
        />
      )}

      <div className="flex flex-col h-full">
        {/* Top Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="font-display text-[10px] uppercase tracking-[0.2em] font-semibold text-primary mb-2 block">
              {item.category.replace("-", " ")}
            </span>
            <h2 className="font-serif text-2xl font-normal text-foreground group-hover:text-primary transition-colors duration-300">
              {item.name}
            </h2>
          </div>
          {item.github && (
            <a
              href={item.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-muted/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-300 shrink-0 ml-4"
              aria-label="View on GitHub"
            >
              <Github size={18} />
            </a>
          )}
        </div>

        {/* Description */}
        <div className="text-base text-muted-foreground leading-relaxed mb-6 flex-1">
          <p>
            <HighlightedText text={displayDesc} />
          </p>
          {isLong && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-primary hover:text-primary/80 font-medium text-xs mt-3 uppercase tracking-wider transition-colors"
            >
              {isExpanded ? "- Show less" : "+ Read more"}
            </button>
          )}
        </div>

        {/* Footer Metrics */}
        <div className="pt-4 border-t border-border/40 mt-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              {item.language && (
                <span className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: langColor || undefined }}
                  />
                  <span className="text-xs font-medium font-display tracking-wide uppercase text-foreground">{item.language}</span>
                </span>
              )}
              {(item.stars ?? 0) > 0 && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Star size={14} className="text-yellow-500/80" />
                  {item.stars}
                </span>
              )}
            </div>
            {item.license && (
              <span className="px-2 py-1 bg-muted rounded text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                {item.license}
              </span>
            )}
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-4 flex-wrap">
            {item.website && (
              <a href={item.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary hover:text-primary/70 transition-colors">
                <ExternalLink size={14} /> Website
              </a>
            )}
            {item.doi && (
              <a href={item.doi} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary hover:text-primary/70 transition-colors">
                <ExternalLink size={14} /> Paper
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default Software;
