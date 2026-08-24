import { useEffect, useRef, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createSlug } from "@/data/team";
import { HighlightedText } from "@/components/HighlightedText";
import { useGSAP } from "@/hooks/useGSAP";
import { fadeInUp } from "@/utils/animations";
import { Mail, ExternalLink, Github, Twitter, Linkedin, ArrowLeft } from "lucide-react";
import { useTeam } from "@/contexts/TeamContext";

/* ─── Member Image with Fallback ─── */
const MemberImage = ({
  image,
  name,
}: {
  image: string;
  name: string;
}) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (imageError || !image) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-primary/10 text-primary font-serif font-semibold text-6xl rounded-3xl">
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={name}
      className="w-full h-full object-cover rounded-3xl min-h-[300px] max-h-[500px]"
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};

const TeamMemberProfile = () => {
  const { memberSlug } = useParams<{ memberSlug: string }>();
  const { teamMembers, isLoading } = useTeam();
  const member = teamMembers.find((m) => createSlug(m.name) === memberSlug);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (isLoading) return;
    if (headerRef.current) {
      fadeInUp(headerRef.current, { delay: 0.1, duration: 0.6 });
    }
    if (imageRef.current) {
      fadeInUp(imageRef.current, { delay: 0.2, duration: 0.8 });
    }
    if (contentRef.current) {
      fadeInUp(contentRef.current, { delay: 0.3, duration: 0.8, y: 30 });
    }
  }, [isLoading, memberSlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background relative z-10">
        <Header />
        <main className="pt-24 pb-16 flex justify-center items-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!member) {
    return <Navigate to="/team" replace />;
  }

  const handleCopyEmail = (e: React.MouseEvent, email: string) => {
    e.preventDefault();
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background relative z-10">
      <Header />
      <main className="pt-24 pb-16">
        <section className="px-6 max-w-6xl mx-auto">
          {/* Back button */}
          <div ref={headerRef} className="mb-10" style={{ opacity: 0 }}>
            <Link
              to="/team"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-10 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Team
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">
            {/* Left Column: Image */}
            <div className="md:col-span-4 lg:col-span-4" ref={imageRef} style={{ opacity: 0 }}>
              <div className="sticky top-32 p-4 rounded-3xl glass-panel glass-panel-hover">
                <div className="relative overflow-hidden rounded-2xl ring-2 ring-border/20">
                  <div className="grayscale hover:grayscale-0 transition-all duration-500">
                    <MemberImage image={member.image} name={member.name} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="md:col-span-8 lg:col-span-8" ref={contentRef} style={{ opacity: 0 }}>
              <div className="mb-8">
                <p className="text-primary font-semibold text-xs tracking-widest uppercase mb-3">
                  {member.role}
                </p>
                <h1 className="font-serif text-4xl md:text-5xl text-foreground font-normal leading-tight mb-6 lowercase">
                  {member.name}
                </h1>

                {/* Links / Socials */}
                {member.links && (
                  <div className="flex flex-wrap gap-3 mb-10">
                    {member.links.email && (
                      <button
                        onClick={(e) => handleCopyEmail(e, member.links.email as string)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border/50 rounded-xl text-sm font-medium text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm cursor-pointer"
                        title={member.links.email}
                      >
                        <Mail size={16} /> {copiedEmail ? "Copied!" : "Email"}
                      </button>
                    )}
                    {member.links.orcid && (
                      <a
                        href={`https://orcid.org/${member.links.orcid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border/50 rounded-xl text-sm font-medium text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm"
                      >
                        <ExternalLink size={16} /> ORCID
                      </a>
                    )}
                    {member.links.github && (
                      <a
                        href={`https://github.com/${member.links.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border/50 rounded-xl text-sm font-medium text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm"
                      >
                        <Github size={16} /> GitHub
                      </a>
                    )}
                    {member.links["google scholar"] && (
                      <a
                        href={member.links["google scholar"]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border/50 rounded-xl text-sm font-medium text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm"
                      >
                        <ExternalLink size={16} /> Scholar
                      </a>
                    )}
                    {member.links.twitter && (
                      <a
                        href={`https://twitter.com/${member.links.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border/50 rounded-xl text-sm font-medium text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm"
                      >
                        <Twitter size={16} /> Twitter
                      </a>
                    )}
                    {member.links.LinkedIn && (
                      <a
                        href={`https://${
                          member.links.LinkedIn.startsWith("www.") ? "" : "www."
                        }${member.links.LinkedIn}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border/50 rounded-xl text-sm font-medium text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm"
                      >
                        <Linkedin size={16} /> LinkedIn
                      </a>
                    )}
                    {member.links.researchgate && (
                      <a
                        href={member.links.researchgate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border/50 rounded-xl text-sm font-medium text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm"
                      >
                        <ExternalLink size={16} /> ResearchGate
                      </a>
                    )}
                    {member.links["home-page"] && (
                      <a
                        href={member.links["home-page"]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border/50 rounded-xl text-sm font-medium text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm"
                      >
                        <Github size={16} /> GitHub
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Bio Section */}
              <div className="prose prose-invert max-w-none">
                <h2 className="text-xl font-serif text-foreground mb-4">About</h2>
                <div className="text-base text-muted-foreground leading-relaxed space-y-4 text-justify">
                  <HighlightedText text={member.bio} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TeamMemberProfile;
