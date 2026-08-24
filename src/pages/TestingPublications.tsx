import { useRef, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ExternalLink, Search, ShieldCheck, ChevronDown } from "lucide-react";
import { useGSAP } from "@/hooks/useGSAP";
import { fadeInUp, scrollStagger } from "@/utils/animations";
import { AnimatedNetwork } from "@/components/AnimatedNetwork";
import { BookOpen } from "lucide-react";
import { usePublications } from "@/contexts/PublicationsContext";

const TestingPublications = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const { publications, isLoading } = usePublications();
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());

  const headerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Expand all years by default once publications are loaded
  useEffect(() => {
    if (publications.length > 0) {
      setExpandedYears(new Set(publications.map(p => p.year)));
    }
  }, [publications]);

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
    if (!isLoading) {
      if (headerRef.current) {
        fadeInUp(headerRef.current, { delay: 0.2, duration: 0.8 });
      }
      if (searchRef.current) {
        fadeInUp(searchRef.current, { delay: 0.4, duration: 0.6 });
      }
      if (contentRef.current) {
        const pubs = contentRef.current.querySelectorAll(".publication-row");
        if (pubs.length > 0) {
          scrollStagger(pubs, {
            start: "top 90%",
            stagger: 0.05,
            once: true,
            trigger: contentRef.current,
          });
        }
      }
    }
  }, [groupedByYear, isLoading, expandedYears]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="pt-16 md:pt-20 flex-1">
        {/* Hero + Search with shared animated background */}
        <div className="relative overflow-hidden">
          {/* Background Network & Gradients — spans hero + search */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-primary/5 via-primary/5 to-transparent" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] opacity-70 translate-x-1/3 -translate-y-1/3" />
            <div className="absolute top-0 left-1/4 w-[1200px] h-[900px] opacity-20">
              <AnimatedNetwork />
            </div>
            {/* Edge fade gradients */}
            <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-background to-transparent" />
            <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-background to-transparent" />
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
          </div>

          {/* Hero Content & Search */}
          <section className="relative pt-6 pb-2 px-6 z-10">
            <div className="container mx-auto max-w-5xl">
              <div ref={headerRef} style={{ opacity: 0 }}>
                <div className="mb-4">
                  <h1 className="font-serif text-3xl md:text-5xl font-normal text-foreground mb-3 leading-tight">
                    Publications
                  </h1>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl">
                    A selection of our peer-reviewed publications in leading academic journals and conferences.
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div ref={searchRef} className="mb-4" style={{ opacity: 0 }}>
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
                    className="w-full pl-11 pr-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all duration-200 text-sm shadow-2xs"
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
            </div>
          </section>

        {/* Publications continue within animated background */}
        <section className="relative pb-12 px-6 z-10">
          <div className="container mx-auto max-w-5xl">

            {/* Loading State */}
            {isLoading && (
              <div className="py-20 text-center">
                <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-muted-foreground">Fetching live publications from Europe PMC...</p>
              </div>
            )}

            {/* Publications Timeline */}
            {!isLoading && (
              <div ref={contentRef} className="relative border-l-2 border-border/40 ml-4 md:ml-6 space-y-16 pb-12">
                {groupedByYear.length === 0 ? (
                  <div className="absolute inset-x-0 text-center py-16 text-muted-foreground -ml-4 md:-ml-6">
                    <p className="text-lg mb-2">No publications found</p>
                    <p className="text-sm text-muted-foreground/60">
                      Try adjusting your filter or check the API query.
                    </p>
                  </div>
                ) : (
                  groupedByYear.map(([year, pubs]) => (
                    <div key={year} className="relative pl-8 md:pl-12">
                      {/* Timeline Dot & Year */}
                      <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-background bg-primary shadow-sm" />
                      <button
                        onClick={() => {
                          setExpandedYears(prev => {
                            const next = new Set(prev);
                            if (next.has(year)) {
                              next.delete(year);
                            } else {
                              next.add(year);
                            }
                            return next;
                          });
                        }}
                        className="font-serif text-3xl md:text-4xl text-foreground mb-4 inline-flex items-baseline gap-3 cursor-pointer hover:text-primary transition-colors w-full text-left"
                      >
                        {year}
                        <span className="text-sm font-sans font-medium text-muted-foreground/60 tracking-wider">
                          {pubs.length} {pubs.length === 1 ? 'Paper' : 'Papers'}
                        </span>
                        <ChevronDown
                          size={20}
                          className={`ml-auto text-muted-foreground/40 transition-transform duration-300 ${expandedYears.has(year) ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {/* Publications List */}
                      {expandedYears.has(year) && (
                        <div className="space-y-5">
                          {pubs.map((pub, index) => (
                            <article
                              key={pub.id || index}
                              className="publication-row group relative p-5 md:p-6 rounded-xl border border-green-500/20 bg-green-50/30 dark:bg-green-950/10 hover:bg-green-50/60 dark:hover:bg-green-950/20 hover:shadow-md hover:border-green-500/40 transition-all duration-300"
                            >
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                                <div className="flex-1 min-w-0">

                                  <a
                                    href={pub.doi}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-serif text-lg md:text-xl text-foreground group-hover:text-primary transition-colors duration-200 leading-snug mb-2 block"
                                    dangerouslySetInnerHTML={{
                                      __html: pub.title
                                        .replace(/&lt;/g, '<')
                                        .replace(/&gt;/g, '>')
                                        .replace(/&amp;/g, '&')
                                        .replace(/&quot;/g, '"')
                                        .replace(/&#39;/g, "'")
                                    }}
                                  />
                                  <p className="text-sm text-foreground/80 mb-2 leading-relaxed">
                                    {pub.authors.split(',').map((author, i, arr) => (
                                      <span key={i}>
                                        <span>{author.trim()}</span>
                                        {i < arr.length - 1 ? ', ' : ''}
                                      </span>
                                    ))}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="italic font-medium text-primary/80">{pub.journal}</span>
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                    <span>{pub.year}</span>
                                  </div>
                                </div>

                                <div className="flex md:flex-col items-center gap-3 shrink-0">
                                  {pub.doi && (
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
                                  )}
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
            </div>
          </section>
        </div>
        {/* End of animated background */}
      </main>
      <Footer />
    </div>
  );
};

export default TestingPublications;
