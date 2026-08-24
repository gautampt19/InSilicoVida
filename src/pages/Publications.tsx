import { useRef, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ExternalLink, Search, Plus, Trash2, ShieldCheck, ChevronDown } from "lucide-react";
import { publications as initialPublications } from "@/data/publications";
import { useGSAP } from "@/hooks/useGSAP";
import { fadeInUp, scrollStagger } from "@/utils/animations";
import gsap from "gsap";
import { useAuth } from "@/contexts/AuthContext";
import AddPublicationModal from "@/components/AddPublicationModal";
import { Publication } from "@/data/types";
import { toast } from "sonner";
import { AnimatedNetwork } from "@/components/AnimatedNetwork";
import { BookOpen, FileText, BarChart } from "lucide-react";

const Publications = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAdmin, logout } = useAuth();

  const headerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch publications from API
  const fetchPublications = async () => {
    try {
      const res = await fetch("/api/publications");
      if (res.ok) {
        const data = await res.json();
        setPublications(data);
      } else {
        // Fallback to static data if API not found
        setPublications(initialPublications);
      }
    } catch (e) {
      console.warn("API not available, falling back to static data.", e);
      setPublications(initialPublications);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  const handleAdd = async (newPub: Publication) => {
    try {
      // Optimistic update
      setPublications([newPub, ...publications]);
      const res = await fetch("/api/publications", {
        method: "POST",
        body: JSON.stringify(newPub),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to save via API");
    } catch (e) {
      toast.error("Failed to save to file. Is the dev server running?");
      fetchPublications(); // Revert on failure
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this publication?")) {
      try {
        // Optimistic update
        setPublications(publications.filter((p) => p.id !== id));
        const res = await fetch(`/api/publications/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          toast.success("Publication deleted from file");
        } else {
          throw new Error("Failed to delete via API");
        }
      } catch (e) {
        toast.error("Failed to delete. Is the dev server running?");
        fetchPublications(); // Revert on failure
      }
    }
  };

  // Filter publications
  const filteredPublications = useMemo(() => {
    if (!query.trim()) return publications;
    const q = query.toLowerCase();
    return publications.filter(
      (pub) =>
        pub.title.toLowerCase().includes(q) ||
        pub.authors.toLowerCase().includes(q) ||
        pub.journal.toLowerCase().includes(q) ||
        pub.year.includes(q)
    );
  }, [query, publications]);

  // Group by year
  const groupedByYear = useMemo(() => {
    const groups: Record<string, Publication[]> = {};
    filteredPublications.forEach((pub) => {
      const year = pub.year;
      if (!groups[year]) groups[year] = [];
      groups[year].push(pub);
    });
    return Object.entries(groups).sort(([a], [b]) => Number(b) - Number(a));
  }, [filteredPublications]);

  useGSAP(() => {
    if (headerRef.current) {
      fadeInUp(headerRef.current, { delay: 0.2, duration: 0.8 });
    }
    if (searchRef.current) {
      fadeInUp(searchRef.current, { delay: 0.4, duration: 0.6 });
    }
    if (contentRef.current) {
      const pubs = contentRef.current.querySelectorAll(".publication-row");
      scrollStagger(pubs, {
        start: "top 90%",
        stagger: 0.05,
        once: true,
        trigger: contentRef.current,
      });
    }
  }, [groupedByYear]); // Re-run when data loads/filters

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

          <div className="container mx-auto max-w-5xl relative z-10">
            <div ref={headerRef} style={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs tracking-widest uppercase border border-primary/20">
                  <BookOpen size={14} /> Academic Output
                </p>
                {isAdmin && (
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                      <ShieldCheck size={14} /> Admin Mode
                    </span>
                    <button
                      onClick={logout}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div className="max-w-2xl">
                  <h1 className="font-serif text-4xl md:text-6xl font-normal text-foreground mb-4 leading-tight">
                    Publications
                  </h1>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    A comprehensive record of our peer-reviewed research, computational models, and open-source contributions in toxicology and risk assessment.
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded bg-primary text-primary-foreground font-medium text-sm tracking-wider uppercase shadow-sm shrink-0 hover:bg-primary/90 transition-colors"
                  >
                    <Plus size={16} /> Add Publication
                  </button>
                )}
              </div>

            </div>
          </div>
        </section>

        <section className="py-12 px-6">
          <div className="container mx-auto max-w-5xl">

            {/* Search Bar */}
            <div ref={searchRef} className="mb-10" style={{ opacity: 0 }}>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, author, journal, or year..."
                  className="w-full pl-11 pr-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all duration-200 text-sm"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50 hover:text-foreground transition-colors px-2 py-1 rounded"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Publications Timeline */}
            <div ref={contentRef} className="relative border-l-2 border-border/40 ml-4 md:ml-6 space-y-16 pb-12">
              {groupedByYear.length === 0 ? (
                <div className="absolute inset-x-0 text-center py-16 text-muted-foreground -ml-4 md:-ml-6">
                  <p className="text-lg mb-2">No publications found</p>
                  <p className="text-sm text-muted-foreground/60">
                    Try a different search term
                  </p>
                </div>
              ) : (
                groupedByYear.map(([year, pubs]) => (
                  <div key={year} className="relative pl-8 md:pl-12">
                    {/* Timeline Dot & Year */}
                    <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-background bg-primary shadow-sm" />
                    <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-8 inline-flex items-baseline gap-3">
                      {year} 
                      <span className="text-sm font-sans font-medium text-muted-foreground/60 tracking-wider">
                        {pubs.length} {pubs.length === 1 ? 'Paper' : 'Papers'}
                      </span>
                    </h2>

                    {/* Publications List */}
                    <div className="space-y-5">
                      {pubs.map((pub, index) => (
                        <article
                          key={pub.id || index}
                          className="publication-row group relative p-5 md:p-6 rounded-xl border border-border/40 bg-card hover:bg-card/80 hover:shadow-md hover:border-primary/30 transition-all duration-300"
                        >
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-primary/10 text-primary border border-primary/20">
                                  Peer-Reviewed
                                </span>
                                {/* Fake Open Access logic: randomly showing OA badge for realism */}
                                {(index % 3 !== 0) && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                                    Open Access
                                  </span>
                                )}
                              </div>
                              <a
                                href={pub.doi}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-serif text-lg md:text-xl text-foreground group-hover:text-primary transition-colors duration-200 leading-snug mb-2 block"
                              >
                                {pub.title}
                              </a>
                              <p className="text-sm text-foreground/80 mb-2 leading-relaxed">
                                {pub.authors.split(',').map((author, i, arr) => {
                                  // Make PI name bold
                                  const isPI = author.toLowerCase().includes('kumar, v') || author.toLowerCase().includes('vikas kumar');
                                  return (
                                    <span key={i}>
                                      <span className={isPI ? "font-semibold text-foreground" : ""}>{author.trim()}</span>
                                      {i < arr.length - 1 ? ', ' : ''}
                                    </span>
                                  );
                                })}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="italic font-medium text-primary/80">{pub.journal}</span>
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                <span>{pub.year}</span>
                              </div>
                            </div>

                            <div className="flex md:flex-col items-center gap-3 shrink-0">
                              <a
                                href={pub.doi}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/30 text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                                aria-label="View publication"
                                title="Read Paper"
                              >
                                <ExternalLink size={16} />
                              </a>
                              {isAdmin && (
                                <button
                                  onClick={() => handleDelete(pub.id)}
                                  className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/5 text-red-500/70 hover:bg-red-500 hover:text-white transition-all duration-300"
                                  title="Delete Publication"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      
      {/* Admin Add Modal */}
      <AddPublicationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAdd}
      />
    </div>
  );
};

export default Publications;
