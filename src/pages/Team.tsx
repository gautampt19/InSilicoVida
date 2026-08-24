import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createSlug } from "@/data/team";
import { HighlightedText } from "@/components/HighlightedText";
import { useGSAP } from "@/hooks/useGSAP";
import { scrollStagger, fadeInUp } from "@/utils/animations";
import { TeamMember } from "@/data/types";
import { Mail, Loader2 } from "lucide-react";
import { AnimatedNetwork } from "@/components/AnimatedNetwork";
import { useTeam } from "@/contexts/TeamContext";
import { useState } from "react";

/* ─── Member Image with Fallback ─── */
const MemberImage = ({
  image,
  name,
  size = "normal",
}: {
  image: string;
  name: string;
  size?: "large" | "normal" | "small";
}) => {
  const [imageError, ReactSetImageError] = useState(false);

  const sizeClasses = {
    large: "w-32 h-32 text-3xl",
    normal: "w-24 h-24 text-xl",
    small: "w-20 h-20 text-lg",
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (imageError || !image) {
    return (
      <div
        className={`${sizeClasses[size]} flex items-center justify-center bg-primary/10 text-primary font-serif font-semibold rounded-2xl`}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={name}
      className={`${sizeClasses[size]} object-cover rounded-2xl`}
      onError={() => ReactSetImageError(true)}
      loading="lazy"
    />
  );
};

/* ─── Team Member Card ─── */
const TeamMemberCard = ({
  member,
  size = "normal",
  onClick,
}: {
  member: TeamMember;
  size?: "large" | "normal" | "small";
  onClick: () => void;
}) => {
  return (
    <div
      className="group cursor-pointer p-5 rounded-2xl glass-panel glass-panel-hover transition-all duration-300 h-full"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="relative overflow-hidden rounded-2xl shrink-0 ring-2 ring-border/20 group-hover:ring-primary/30 transition-all duration-500">
          <div className="grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500">
            <MemberImage image={member.image} name={member.name} size={size} />
          </div>
        </div>
        <div className="flex-1 min-w-0 py-1">
          <h3
            className={`font-serif font-semibold text-foreground group-hover:text-primary transition-colors duration-200 ${
              size === "large"
                ? "text-xl"
                : size === "normal"
                ? "text-base"
                : "text-sm"
            }`}
          >
            {member.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">{member.role}</p>
          {size !== "small" && member.bio && (
            <p className="text-xs text-muted-foreground/60 mt-2 line-clamp-2 leading-relaxed">
              {member.bio.substring(0, 120)}...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Featured Leader Section ─── */
const FeaturedLeader = ({
  member,
  onClick,
}: {
  member: TeamMember;
  onClick: () => void;
}) => {
  return (
    <div
      className="group cursor-pointer p-8 md:p-10 rounded-2xl glass-panel glass-panel-hover transition-all duration-300 mb-16"
      onClick={onClick}
    >
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="relative overflow-hidden rounded-2xl shrink-0 ring-2 ring-border/20 group-hover:ring-primary/30 transition-all duration-500">
          <div className="grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500">
            <MemberImage image={member.image} name={member.name} size="large" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <p className="font-display text-xs font-semibold tracking-[0.2em] text-primary/60 uppercase mb-2">
            Group Leader
          </p>
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground group-hover:text-primary transition-colors duration-200 mb-3">
            {member.name}
          </h2>
          {member.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-xl">
              {member.bio.substring(0, 250)}...
            </p>
          )}

          {member.links && (
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {member.links.email && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/50 border border-border/30 text-xs text-muted-foreground">
                  <Mail size={12} /> Email
                </span>
              )}
              {member.links.orcid && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/50 border border-border/30 text-xs text-muted-foreground">
                  ORCID
                </span>
              )}
              {member.links["google scholar"] && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/50 border border-border/30 text-xs text-muted-foreground">
                  Scholar
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Page ─── */
const Team = () => {
  const navigate = useNavigate();
  const { teamMembers, isLoading, error } = useTeam();

  const groupLeader = teamMembers.find((m) => m.hierarchy === "leader");
  const researchers = teamMembers.filter((m) => m.hierarchy === "researcher");
  const phdStudents = teamMembers.filter((m) => m.hierarchy === "phd");
  const visitingScientists = teamMembers.filter((m) => m.hierarchy === "visiting");
  const alumni = teamMembers.filter((m) => m.hierarchy === "alumni");

  const headerRef = useRef<HTMLDivElement>(null);
  const leaderRef = useRef<HTMLDivElement>(null);
  const researchersRef = useRef<HTMLDivElement>(null);
  const phdRef = useRef<HTMLDivElement>(null);
  const visitingRef = useRef<HTMLDivElement>(null);
  const alumniRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (isLoading) return;

    if (headerRef.current) {
      fadeInUp(headerRef.current, { delay: 0.2, duration: 0.8 });
    }
    if (leaderRef.current) {
      fadeInUp(leaderRef.current, { delay: 0.4, duration: 0.8 });
    }
    if (researchersRef.current) {
      const cards = researchersRef.current.querySelectorAll(".team-card");
      scrollStagger(cards, {
        start: "top 85%",
        stagger: 0.12,
        once: true,
        trigger: researchersRef.current,
      });
    }
    if (phdRef.current) {
      const cards = phdRef.current.querySelectorAll(".team-card");
      scrollStagger(cards, {
        start: "top 85%",
        stagger: 0.08,
        once: true,
        trigger: phdRef.current,
      });
    }
    if (visitingRef.current) {
      const cards = visitingRef.current.querySelectorAll(".team-card");
      scrollStagger(cards, {
        start: "top 85%",
        stagger: 0.08,
        once: true,
        trigger: visitingRef.current,
      });
    }
    if (alumniRef.current) {
      const cards = alumniRef.current.querySelectorAll(".team-card");
      scrollStagger(cards, {
        start: "top 85%",
        stagger: 0.08,
        once: true,
        trigger: alumniRef.current,
      });
    }
  }, [isLoading]);

  const handleMemberClick = (member: TeamMember) => {
    const slug = createSlug(member.name);
    navigate(`/team/${slug}`);
  };

  return (
    <div className="min-h-screen bg-background relative z-10">
      <Header />
      <main className="pt-20">
        <section className="relative py-24 px-6 overflow-hidden">
          {/* Animated Network Background constrained to header */}
          <div className="absolute top-0 left-0 right-0 h-[600px] overflow-hidden pointer-events-none flex items-start justify-end z-0">
            <div className="w-[800px] h-[800px] absolute right-[-100px] top-[-150px] opacity-20">
              <AnimatedNetwork />
            </div>
            <div className="absolute right-[10%] top-[10%] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
            
            {/* Fade out to background color at the bottom of the 600px area */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          </div>
          
          <div className="section-container relative z-10">
            {/* Header */}
            <div ref={headerRef} className="mb-16" style={{ opacity: 0 }}>
              <span className="font-display text-xs font-semibold tracking-[0.2em] text-primary/80 uppercase mb-4 block">
                Our People
              </span>
              <h1 className="font-serif text-4xl md:text-6xl font-normal text-foreground mb-6">
                Research <span className="text-gradient">Team</span>
              </h1>
              <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
                <HighlightedText text="Our team is a dynamic mix of biologists, toxicologists, bioinformaticians, and computational scientists, each wielding expertise across multiple domains." />
              </p>
            </div>

            {/* Group Leader */}
            {groupLeader && (
              <div ref={leaderRef} style={{ opacity: 0 }}>
                <FeaturedLeader
                  member={groupLeader}
                  onClick={() => handleMemberClick(groupLeader)}
                />
              </div>
            )}

            {/* Researchers */}
            {researchers.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="font-serif text-xl font-normal text-foreground">
                    Researchers
                  </h2>
                  <div className="h-px flex-1 bg-border/30" />
                  <span className="text-xs text-muted-foreground/50">
                    {researchers.length}
                  </span>
                </div>
                <div
                  ref={researchersRef}
                  className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr"
                >
                  {researchers.map((member) => (
                    <div
                      key={member.name}
                      className="team-card"
                      style={{ opacity: 0 }}
                    >
                      <TeamMemberCard
                        member={member}
                        size="normal"
                        onClick={() => handleMemberClick(member)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PhD Students */}
            {phdStudents.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="font-serif text-xl font-normal text-foreground">
                    PhD Students
                  </h2>
                  <div className="h-px flex-1 bg-border/30" />
                  <span className="text-xs text-muted-foreground/50">
                    {phdStudents.length}
                  </span>
                </div>
                <div
                  ref={phdRef}
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr"
                >
                  {phdStudents.map((member) => (
                    <div
                      key={member.name}
                      className="team-card"
                      style={{ opacity: 0 }}
                    >
                      <TeamMemberCard
                        member={member}
                        size="small"
                        onClick={() => handleMemberClick(member)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visiting Scientists & Trainees */}
            {visitingScientists.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="font-serif text-xl font-normal text-foreground">
                    Visiting Scientists & Trainees
                  </h2>
                  <div className="h-px flex-1 bg-border/30" />
                  <span className="text-xs text-muted-foreground/50">
                    {visitingScientists.length}
                  </span>
                </div>
                <div
                  ref={visitingRef}
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr"
                >
                  {visitingScientists.map((member) => (
                    <div
                      key={member.name}
                      className="team-card"
                      style={{ opacity: 0 }}
                    >
                      <TeamMemberCard
                        member={member}
                        size="small"
                        onClick={() => handleMemberClick(member)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alumni */}
            {alumni.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="font-serif text-xl font-normal text-foreground">
                    Alumni
                  </h2>
                  <div className="h-px flex-1 bg-border/30" />
                  <span className="text-xs text-muted-foreground/50">
                    {alumni.length}
                  </span>
                </div>
                <div
                  ref={alumniRef}
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr"
                >
                  {alumni.map((member) => (
                    <div
                      key={member.name}
                      className="team-card"
                      style={{ opacity: 0 }}
                    >
                      <TeamMemberCard
                        member={member}
                        size="small"
                        onClick={() => handleMemberClick(member)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Team;
