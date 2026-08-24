import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useProjects } from "@/contexts/ProjectsContext";
import { Badge } from "@/components/ui/badge";
import { Calendar, Award, ExternalLink, ArrowRight } from "lucide-react";
import { HighlightedText } from "@/components/HighlightedText";
import { useGSAP } from "@/hooks/useGSAP";
import { scrollStagger, fadeInUp } from "@/utils/animations";
import { AnimatedNetwork } from "@/components/AnimatedNetwork";

const ProjectCard = ({
  project,
  index,
}: {
  project: any;
  index: number;
  total: number;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const formatNumber = (num: number) => (num + 1).toString().padStart(2, "0");

  // Spotlight cursor effect
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const handleMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    };
    card.addEventListener("mousemove", handleMove);
    return () => card.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div
      className="sticky mb-6"
      style={{
        top: `calc(6.5rem + ${index * 1.5}rem)`,
        zIndex: index + 1,
      }}
    >
      <article
        ref={cardRef}
        className="project-card group relative flex flex-col md:flex-row p-8 md:p-10 rounded-2xl glass-panel glass-panel-hover card-spotlight overflow-hidden gap-8"
        style={{ opacity: 0 }}
      >
      {/* Background Index Number */}
      <span className="absolute right-6 top-4 font-serif text-7xl md:text-8xl font-bold opacity-[0.03] select-none pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-300">
        {formatNumber(index)}
      </span>



      {/* Content */}
      <div className="flex-1 relative z-10">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="font-display text-xs font-semibold tracking-widest text-primary/50">
            PROJECT {formatNumber(index)}
          </span>
          <Badge
            variant={project.status === "active" ? "default" : "secondary"}
            className={
              project.status === "active"
                ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                : ""
            }
          >
            {project.status === "active" ? "● Active" : "Past"}
          </Badge>
        </div>

        <h3 className="font-serif text-xl md:text-2xl font-normal text-foreground mb-2 group-hover:text-primary transition-colors duration-300 leading-tight flex flex-wrap items-center gap-3">
          {project.image && (
            <img 
              src={project.image} 
              alt={`${project.title} logo`} 
              className="h-8 md:h-10 object-contain bg-white rounded-sm p-1 shadow-sm"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }} 
            />
          )}
          {project.website ? (
            <a href={project.website} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4 decoration-primary/30 flex items-center gap-2">
              {project.title} <ExternalLink size={14} className="opacity-50" />
            </a>
          ) : (
            project.title
          )}
        </h3>

        <p className="font-display text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-4">
          {project.subtitle}
        </p>

        <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-6 max-w-2xl">
          <HighlightedText text={project.description} />
        </p>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-5 text-xs text-muted-foreground/60">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-primary/60" />
            <span>{project.date}</span>
          </div>
          {project.grantNumber && (
            <div className="flex items-center gap-1.5">
              <Award size={13} className="text-primary/60" />
              <span className="font-mono text-[11px]">
                {project.grantNumber}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-full md:w-[220px] flex flex-col justify-between border-t md:border-t-0 md:border-l border-border/30 pt-6 md:pt-0 md:pl-8 shrink-0 relative z-10">
        <div className="space-y-4">
          {project.funding && (
            <div>
              <p className="font-display text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-1">
                Funding
              </p>
              <p className="font-sans text-sm text-foreground">
                {project.funding}
              </p>
            </div>
          )}
          {project.grantNumber && (
            <div>
              <p className="font-display text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-1">
                Reference
              </p>
              <p className="font-mono text-xs text-foreground bg-background/50 px-2.5 py-1.5 rounded-lg border border-border/30 inline-block">
                {project.grantNumber}
              </p>
            </div>
          )}
        </div>

        {project.website && (
          <div className="pt-6 mt-auto">
            <a
              href={project.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-display font-medium text-xs tracking-wider uppercase daylight-btn shadow-md shadow-primary/20"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                Visit <ExternalLink size={11} />
              </span>
              <div className="daylight-btn-overlay bg-secondary" />
            </a>
          </div>
        )}
      </div>
    </article>
    </div>
  );
};

const ResearchProjects = () => {
  const [filter, setFilter] = useState<"all" | "active" | "past">("all");
  const { projects, isLoading } = useProjects();

  const activeProjects = projects.filter((p) => p.status === "active");
  const pastProjects = projects.filter((p) => p.status === "past");

  const filteredProjects =
    filter === "all"
      ? projects
      : filter === "active"
      ? activeProjects
      : pastProjects;

  const headerRef = useRef<HTMLDivElement>(null);
  const activeProjectsRef = useRef<HTMLDivElement>(null);
  const pastProjectsRef = useRef<HTMLDivElement>(null);
  const filteredProjectsRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (isLoading) return;
    
    if (headerRef.current) {
      fadeInUp(headerRef.current, { delay: 0.2, duration: 0.8 });
    }

    const animateProjects = (container: HTMLElement | null) => {
      if (container) {
        const cards = container.querySelectorAll(".project-card");
        scrollStagger(cards, {
          start: "top 80%",
          stagger: 0.12,
          once: true,
          trigger: container,
        });
      }
    };

    if (filter === "all") {
      animateProjects(activeProjectsRef.current);
      animateProjects(pastProjectsRef.current);
    } else {
      animateProjects(filteredProjectsRef.current);
    }
  }, [filter, isLoading]);

  const SectionHeader = ({
    title,
    count,
  }: {
    title: string;
    count: number;
  }) => (
    <div className="flex items-center gap-4 mb-8">
      <h2 className="font-serif text-xl font-normal text-foreground">
        {title}
      </h2>
      <div className="h-px flex-1 bg-border/30" />
      <span className="text-xs text-muted-foreground/50">{count}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background relative z-10">
      <Header />
      <main className="pt-20">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <section className="relative py-24 px-6 overflow-clip">
          {/* Animated Network Background constrained to header */}
          <div className="absolute top-0 left-0 right-0 h-[600px] overflow-hidden pointer-events-none flex items-start justify-end z-0">
            <div className="w-[800px] h-[800px] absolute right-[-100px] top-[-150px] opacity-20">
              <AnimatedNetwork />
            </div>
            <div className="absolute right-[10%] top-[10%] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
            
            {/* Fade out to background color at the bottom of the 600px area */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          </div>
          
          <div className="container mx-auto max-w-5xl relative z-10">
            {/* Header */}
            <div ref={headerRef} className="mb-16" style={{ opacity: 0 }}>
              <span className="font-display text-xs font-semibold tracking-[0.2em] text-primary/80 uppercase mb-4 block">
                Research Portfolio
              </span>
              <h1 className="font-serif text-4xl md:text-6xl font-normal text-foreground mb-6">
                Research <span className="text-gradient">Projects</span>
              </h1>
              <p className="font-sans text-base text-muted-foreground max-w-3xl leading-relaxed">
                <HighlightedText text="Our research group is actively involved in numerous international and national research projects focused on advancing computational toxicology, human health risk assessment, and new approach methodologies (NAMs)." />
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-12">
              {[
                { value: "all" as const, label: "All Projects" },
                {
                  value: "active" as const,
                  label: `Active (${activeProjects.length})`,
                },
                {
                  value: "past" as const,
                  label: `Past (${pastProjects.length})`,
                },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`px-5 py-2 rounded-full text-xs font-display font-semibold tracking-wider uppercase transition-all duration-300 ${
                    filter === option.value
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-card/50 border border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Projects */}
            {filter === "all" ? (
              <>
                {/* Active Projects */}
                <div className="mb-16">
                  <SectionHeader
                    title="Active Projects"
                    count={activeProjects.length}
                  />
                  <div
                    ref={activeProjectsRef}
                    className="relative"
                  >
                    {activeProjects.map((project, index) => (
                      <ProjectCard
                        key={project.title}
                        project={project}
                        index={index}
                        total={activeProjects.length}
                      />
                    ))}
                  </div>
                </div>

                {/* Past Projects */}
                <div>
                  <SectionHeader
                    title="Past Projects"
                    count={pastProjects.length}
                  />
                  <div
                    ref={pastProjectsRef}
                    className="relative"
                  >
                    {pastProjects.map((project, index) => (
                      <ProjectCard
                        key={project.title}
                        project={project}
                        index={index}
                        total={pastProjects.length}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div
                ref={filteredProjectsRef}
                className="relative"
              >
                {filteredProjects.map((project, index) => (
                  <ProjectCard
                    key={project.title}
                    project={project}
                    index={index}
                    total={filteredProjects.length}
                  />
                ))}
              </div>
            )}
          </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ResearchProjects;
