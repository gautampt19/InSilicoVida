import { useRef, useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Search, ExternalLink, Download, FileText, Calendar, MapPin, Image as ImageIcon } from "lucide-react";
import { usePosters } from "@/contexts/PostersContext";
import { HighlightedText } from "@/components/HighlightedText";
import { useGSAP } from "@/hooks/useGSAP";
import { fadeInUp, scrollStagger } from "@/utils/animations";
import gsap from "gsap";
import { AnimatedNetwork } from "@/components/AnimatedNetwork";
import { Poster } from "@/data/types";

// Official-style Zenodo SVG Icon component
const ZenodoIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l7 4.5-7 4.5z" />
  </svg>
);

const Posters = () => {
  const { posters, isLoading } = usePosters();
  const [query, setQuery] = useState("");
  const [selectedConference, setSelectedConference] = useState("all");

  const headerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Extract unique conferences for filter dropdown
  const conferences = useMemo(() => {
    const set = new Set<string>();
    posters.forEach((p) => {
      if (p.conference) set.add(p.conference);
    });
    return ["all", ...Array.from(set)];
  }, [posters]);

  // Filter posters by query & conference
  const filteredPosters = useMemo(() => {
    return posters.filter((p) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.authors.toLowerCase().includes(q) ||
        p.conference.toLowerCase().includes(q) ||
        p.year.includes(q);
      const matchesConf = selectedConference === "all" || p.conference === selectedConference;
      return matchesQuery && matchesConf;
    });
  }, [posters, query, selectedConference]);

  useGSAP(() => {
    if (isLoading) return;

    if (headerRef.current) {
      fadeInUp(headerRef.current, { delay: 0.2, duration: 0.8 });
    }
    if (searchRef.current) {
      fadeInUp(searchRef.current, { delay: 0.4, duration: 0.6 });
    }
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll(".poster-card");
      scrollStagger(cards, {
        start: "top 85%",
        stagger: 0.08,
        once: true,
        trigger: cardsRef.current,
      });
    }
  }, [filteredPosters, isLoading]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
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
            <div ref={headerRef} className="max-w-3xl" style={{ opacity: 0 }}>
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs tracking-widest uppercase border border-primary/20 mb-4">
                <FileText size={14} /> Conference Presentations
              </p>
              <h1 className="font-serif text-3xl md:text-5xl font-normal leading-tight mb-4 text-foreground">
                Academic <span className="text-primary">Posters</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Explore research posters presented by our laboratory members at international conferences, complete with direct links to Zenodo open repository deposits.
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 px-6">
          <div className="container mx-auto max-w-7xl">
            {/* Search & Filter Controls */}
            <div ref={searchRef} className="mb-10 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center" style={{ opacity: 0 }}>
              <div className="relative flex-1 max-w-xl">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search posters by title, author, or conference..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-card border border-border/50 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all text-sm shadow-sm"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded"
                  >
                    Clear
                  </button>
                )}
              </div>

              {conferences.length > 2 && (
                <div className="w-full md:w-64">
                  <select
                    value={selectedConference}
                    onChange={(e) => setSelectedConference(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 shadow-sm"
                  >
                    <option value="all">All Conferences</option>
                    {conferences.filter((c) => c !== "all").map((conf) => (
                      <option key={conf} value={conf}>{conf}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Poster Cards Grid */}
            {isLoading ? (
              <div className="py-20 flex justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredPosters.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground border border-dashed border-border/50 rounded-3xl bg-card/20">
                <FileText size={36} className="mx-auto mb-3 opacity-40 text-primary" />
                <p className="text-lg font-medium text-foreground">No posters found</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  {query || selectedConference !== "all" ? "Try adjusting your search criteria" : "Check back soon for upcoming conference posters."}
                </p>
              </div>
            ) : (
              <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosters.map((poster) => (
                  <PosterCard key={poster.id || poster.title} poster={poster} />
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

/* ─── Poster Card Component ─── */
const PosterCard = ({ poster }: { poster: Poster }) => {
  const [imgError, setImgError] = useState(false);

  const zenodoRecordId = useMemo(() => {
    if (!poster.zenodo_url) return null;
    const match = poster.zenodo_url.match(/(?:records?\/|zenodo\.)([0-9]+)/i);
    return match ? match[1] : null;
  }, [poster.zenodo_url]);

  const displayImage = poster.image_url || (zenodoRecordId ? `https://zenodo.org/records/${zenodoRecordId}/thumb400` : null);

  return (
    <article className="poster-card group flex flex-col border border-border/50 rounded-2xl bg-card hover:bg-card/90 hover:border-primary/40 hover:shadow-lg transition-all duration-300 overflow-hidden h-full relative" style={{ opacity: 0 }}>
      {/* Image Thumbnail Preview if present */}
      {displayImage && !imgError && (
        <div className="h-48 w-full overflow-hidden bg-muted relative border-b border-border/40">
          <img
            src={displayImage}
            alt={poster.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
        </div>
      )}

      <div className="p-6 md:p-7 flex flex-col flex-1">
        {/* Header Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            <MapPin size={12} /> {poster.conference}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-muted/60 text-muted-foreground border border-border/40">
            <Calendar size={12} /> {poster.year}
          </span>
        </div>

        {/* Title */}
        <h2 className="font-serif text-xl font-medium text-foreground group-hover:text-primary transition-colors leading-snug mb-3">
          {poster.title}
        </h2>

        {/* Authors */}
        <p className="text-sm text-foreground/80 mb-4 line-clamp-2 leading-relaxed">
          {poster.authors}
        </p>

        {/* Description / Abstract */}
        {poster.description && (
          <p className="text-xs text-muted-foreground line-clamp-3 mb-6 leading-relaxed">
            {poster.description}
          </p>
        )}

        {/* Action Buttons Footer */}
        <div className="mt-auto pt-5 border-t border-border/40 flex items-center justify-between gap-3">
          {poster.zenodo_url ? (
            <a
              href={poster.zenodo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/20 font-medium text-xs tracking-wider uppercase transition-all shadow-sm"
              title="View on Zenodo Repository"
            >
              <ZenodoIcon className="w-4 h-4" /> View on Zenodo
            </a>
          ) : (
            <span className="text-xs text-muted-foreground/50 italic">No Zenodo link</span>
          )}

          {poster.pdf_url && (
            <a
              href={poster.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 p-2 rounded-xl bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Download PDF"
            >
              <Download size={16} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

export default Posters;
