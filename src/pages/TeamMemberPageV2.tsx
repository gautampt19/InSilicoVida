import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createSlug } from "@/data/team";
import { HighlightedText } from "@/components/HighlightedText";
import { useGSAP } from "@/hooks/useGSAP";
import { fadeInUp } from "@/utils/animations";
import { Publication, TeamMember } from "@/data/types";
import { toast } from "sonner";
import { useTeam } from "@/contexts/TeamContext";
import {
  ArrowLeft,
  ExternalLink,
  Mail,
  Github,
  Linkedin,
  BookOpen,
  Users,
  User,
} from "lucide-react";

/* ─── Avatar Colors ─── */
const AVATAR_COLORS = [
  "hsl(200, 90%, 47%)",  // blue
  "hsl(335, 78%, 62%)",  // pink
  "hsl(145, 50%, 55%)",  // green
  "hsl(210, 80%, 39%)",  // dark blue
  "hsl(220, 25%, 31%)",  // slate
  "hsl(270, 60%, 55%)",  // purple
  "hsl(25, 85%, 55%)",   // orange
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/* ─── Member Avatar ─── */
const MemberAvatar = ({
  member,
  size = "md",
}: {
  member: TeamMember;
  size?: "sm" | "md" | "lg";
}) => {
  const [imgError, setImgError] = useState(false);
  const sizeMap = {
    sm: "w-14 h-14 text-lg",
    md: "w-24 h-24 text-3xl",
    lg: "w-28 h-28 text-4xl",
  };

  if (!member.image || imgError) {
    return (
      <div
        className={`${sizeMap[size]} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
        style={{ background: getAvatarColor(member.name) }}
      >
        {getInitials(member.name)}
      </div>
    );
  }

  return (
    <img
      src={member.image}
      alt={member.name}
      className={`${sizeMap[size]} rounded-full object-cover shrink-0`}
      onError={() => setImgError(true)}
      loading="lazy"
    />
  );
};

/* ─── Research Interest Tags (extracted from bio) ─── */
const RESEARCH_KEYWORDS = [
  "PBPK", "QSAR", "AOPs", "QIVIVE", "IVIVE",
  "Systems Biology", "Computational Toxicology", "Risk Assessment",
  "Machine Learning", "Artificial Intelligence", "Deep Learning",
  "Text Mining", "Bioinformatics", "Omics", "Drug Delivery",
  "Gut Microbiota", "Neurotoxicity", "Immunotoxicity",
  "Pharmacokinetic", "Pharmacodynamic", "Ontology",
  "In Silico", "In Vitro", "Knowledge Engineering",
  "Data Management", "Adverse Outcome Pathways",
  "Formulation Science", "Systems Toxicology",
];

function extractInterests(bio: string): string[] {
  if (!bio) return ["Research"];
  const found: string[] = [];
  const bioLower = bio.toLowerCase();
  for (const kw of RESEARCH_KEYWORDS) {
    if (bioLower.includes(kw.toLowerCase()) && !found.includes(kw)) {
      found.push(kw);
    }
  }
  return found.length > 0 ? found : ["Research"];
}

/* ─── Publication Card ─── */
const PublicationCard = ({ pub }: { pub: Publication }) => (
  <a
    href={pub.doi || "#"}
    target="_blank"
    rel="noopener noreferrer"
    className="group block p-5 rounded-2xl border border-border/50 bg-card hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-200"
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <h4
          className="font-serif text-base text-primary group-hover:text-primary/80 transition-colors leading-snug mb-1.5"
          dangerouslySetInnerHTML={{
            __html: pub.title
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&amp;/g, "&")
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'"),
          }}
        />
        <p className="text-sm text-muted-foreground leading-relaxed mb-2 line-clamp-2">
          {pub.authors}
        </p>
        <p className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium">
          {pub.journal} · {pub.year}
        </p>
      </div>
      <ExternalLink
        size={14}
        className="text-muted-foreground/40 group-hover:text-primary shrink-0 mt-1 transition-colors"
      />
    </div>
  </a>
);

/* ─── Team Member Card (for Team tab) ─── */
const TeamMemberCard = ({
  member,
  onClick,
}: {
  member: TeamMember;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-200 text-left w-full group cursor-pointer"
  >
    <MemberAvatar member={member} size="sm" />
    <div>
      <div className="font-serif text-base text-primary group-hover:text-primary/80 transition-colors">
        {member.name}
      </div>
      <div className="text-sm text-muted-foreground">{member.role}</div>
    </div>
  </button>
);

/* ─── Tab Button ─── */
const TabButton = ({
  label,
  icon: Icon,
  isActive,
  onClick,
}: {
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-5 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-150 w-full cursor-pointer ${
      isActive
        ? "bg-primary text-primary-foreground shadow-md"
        : "text-muted-foreground hover:bg-muted/50"
    }`}
  >
    <Icon size={16} />
    {label}
  </button>
);

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  PAGE COMPONENT                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */

const TeamMemberPageV2 = () => {
  const { memberSlug } = useParams<{ memberSlug: string }>();
  const navigate = useNavigate();
  const { teamMembers, isLoading } = useTeam();

  const member = teamMembers.find((m) => createSlug(m.name) === memberSlug);
  const leader = teamMembers.find((m) => m.hierarchy === "leader");
  const isLeader = member && leader && member.name === leader.name;

  const [activeTab, setActiveTab] = useState<"about" | "publications" | "team">("about");

  const sortedOtherMembers = useMemo(() => {
    const hierarchyOrder: Record<string, number> = {
      leader: 1,
      researcher: 2,
      phd: 3,
      visiting: 4,
      alumni: 5,
    };
    return teamMembers
      .filter((m) => m.name !== member?.name)
      .sort((a, b) => {
        const orderA = hierarchyOrder[a.hierarchy || "researcher"] || 4;
        const orderB = hierarchyOrder[b.hierarchy || "researcher"] || 4;
        return orderA - orderB;
      });
  }, [teamMembers, member?.name]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [pubsLoading, setPubsLoading] = useState(false);
  const [pubsFetched, setPubsFetched] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const shellRef = useRef<HTMLDivElement>(null);

  /* ── Animations ── */
  useGSAP(() => {
    if (isLoading) return;
    if (shellRef.current) {
      fadeInUp(shellRef.current, { delay: 0.15, duration: 0.6 });
    }
  }, [memberSlug, isLoading]);

  /* ── Fetch publications when Publications tab is first opened ── */
  useEffect(() => {
    if (activeTab !== "publications" || pubsFetched) return;
    const orcid = member?.links?.orcid;
    if (!orcid) {
      setPubsFetched(true);
      return;
    }

    const fetchPubs = async () => {
      setPubsLoading(true);
      try {
        // 1. Fetch ALL works from the ORCID public API (has complete list)
        const orcidRes = await fetch(
          `https://pub.orcid.org/v3.0/${orcid}/works`,
          { headers: { Accept: "application/json" } }
        );
        if (!orcidRes.ok) throw new Error("ORCID API error");
        const orcidData = await orcidRes.json();
        const groups = orcidData.group || [];

        // Map ORCID works to our Publication type
        const orcidPubs: Publication[] = groups.map((g: any) => {
          const summary = g["work-summary"]?.[0] || {};
          const externalIds = g["external-ids"]?.["external-id"] || [];
          const doiEntry = externalIds.find((e: any) => e["external-id-type"] === "doi");
          const doi = doiEntry?.["external-id-value"] || "";
          const year = summary["publication-date"]?.year?.value || "Unknown Year";

          return {
            id: doi || String(summary["put-code"] || Math.random()),
            title: summary.title?.title?.value || "Untitled",
            authors: "", // ORCID doesn't provide author lists
            journal: summary["journal-title"]?.value || "Unknown Journal",
            year,
            doi: doi ? `https://doi.org/${doi}` : "",
            isOpenAccess: false,
          };
        });

        // 2. Enrich with Europe PMC data (author strings, open access status)
        //    Fetch all Europe PMC results for this ORCID
        let epmcMap = new Map<string, any>();
        let cursorMark = "*";
        let hasMore = true;

        while (hasMore) {
          const epmcUrl = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=AUTHORID:"${orcid}"&format=json&resultType=core&pageSize=200&cursorMark=${encodeURIComponent(cursorMark)}`;
          const epmcRes = await fetch(epmcUrl);
          if (epmcRes.ok) {
            const epmcData = await epmcRes.json();
            const results = epmcData.resultList?.result || [];
            for (const r of results) {
              if (r.doi) epmcMap.set(r.doi.toLowerCase(), r);
            }
            const nextCursor = epmcData.nextCursorMark;
            if (!nextCursor || nextCursor === cursorMark || results.length === 0) {
              hasMore = false;
            } else {
              cursorMark = nextCursor;
            }
          } else {
            hasMore = false;
          }
        }

        // Merge: enrich ORCID pubs with Europe PMC data where available
        const enriched = orcidPubs.map((pub) => {
          const rawDoi = pub.doi.replace("https://doi.org/", "").toLowerCase();
          const epmc = epmcMap.get(rawDoi);
          if (epmc) {
            return {
              ...pub,
              authors: epmc.authorString || pub.authors,
              journal: epmc.journalTitle || pub.journal,
              isOpenAccess: epmc.isOpenAccess === "Y",
            };
          }
          return pub;
        });

        // Sort by year descending
        enriched.sort((a, b) => Number(b.year) - Number(a.year));
        setPublications(enriched);
      } catch (e) {
        console.error("Publication fetch error:", e);
        toast.error("Failed to load publications.");
      } finally {
        setPubsLoading(false);
        setPubsFetched(true);
      }
    };

    fetchPubs();
  }, [activeTab, pubsFetched, member]);

  /* ── Reset state when navigating between members ── */
  useEffect(() => {
    setActiveTab("about");
    setPublications([]);
    setPubsFetched(false);
    setPubsLoading(false);
    setCopiedEmail(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [memberSlug]);

  /* ── Guard ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background relative z-10">
        <Header />
        <main className="pt-24 pb-20 flex justify-center items-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!member) {
    return <Navigate to="/team" replace />;
  }

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const interests = extractInterests(member.bio);

  return (
    <div className="min-h-screen bg-background relative z-10">
      <Header />
      <main className="pt-24 pb-20">
        <div
          ref={shellRef}
          className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8"
          style={{ opacity: 0 }}
        >
          {/* ═══════ LEFT SIDEBAR ═══════ */}
          <aside className="md:sticky md:top-28 self-start flex flex-col gap-5">
            {/* Profile card */}
            <div className="p-6 rounded-2xl border border-border/50 bg-card shadow-sm text-center">
              <div className="flex justify-center mb-4">
                <MemberAvatar member={member} size="lg" />
              </div>
              <h2 className="font-serif text-xl text-foreground">{member.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{member.role}</p>
            </div>

            {/* Back to team */}
            <Link
              to="/team"
              className="flex items-center gap-2 text-sm text-primary hover:underline px-2 group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to team
            </Link>

            {/* Navigation tabs */}
            <nav className="flex flex-row md:flex-col gap-2">
              <TabButton
                label="About Me"
                icon={User}
                isActive={activeTab === "about"}
                onClick={() => setActiveTab("about")}
              />
              <TabButton
                label="Publications"
                icon={BookOpen}
                isActive={activeTab === "publications"}
                onClick={() => setActiveTab("publications")}
              />
              {isLeader && (
                <TabButton
                  label="Team"
                  icon={Users}
                  isActive={activeTab === "team"}
                  onClick={() => setActiveTab("team")}
                />
              )}
            </nav>
          </aside>

          {/* ═══════ RIGHT CONTENT ═══════ */}
          <div className="min-w-0">
            {/* ─── ABOUT ME ─── */}
            {activeTab === "about" && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="mb-6">
                  <h2 className="font-serif text-3xl text-foreground mb-1">About Me</h2>
                  <p className="text-sm text-muted-foreground">
                    {member.role}, InSilicoVida Research Group
                  </p>
                </div>

                <div className="p-7 rounded-2xl border border-border/50 bg-card shadow-sm space-y-6">
                  {/* Bio */}
                  <div className="text-base text-muted-foreground leading-relaxed space-y-4 text-justify">
                    <HighlightedText text={member.bio} />
                  </div>

                  {/* Research Interests */}
                  <div>
                    <h4 className="font-serif text-lg text-foreground mb-3">Research Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {interests.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-3 py-1.5 rounded-md bg-muted border border-border/50 text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* At a Glance */}
                  <div>
                    <h4 className="font-serif text-lg text-foreground mb-3">At a Glance</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FactRow label="Role" value={member.role} />
                      <FactRow label="Department" value="Chemical Engineering" />
                      {member.links?.email && (
                        <FactRow
                          label="Contact"
                          value={
                            <button
                              onClick={() => handleCopyEmail(member.links!.email!)}
                              className="text-primary hover:underline cursor-pointer text-left"
                            >
                              {copiedEmail ? "Copied!" : member.links.email}
                            </button>
                          }
                        />
                      )}
                      {member.links?.orcid && (
                        <FactRow
                          label="ORCID"
                          value={
                            <a
                              href={`https://orcid.org/${member.links.orcid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {member.links.orcid}
                            </a>
                          }
                        />
                      )}
                      {member.links?.["google scholar"] && (
                        <FactRow
                          label="Scholar"
                          value={
                            <a
                              href={member.links["google scholar"]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Google Scholar ↗
                            </a>
                          }
                        />
                      )}
                      {member.links?.github && (
                        <FactRow
                          label="GitHub"
                          value={
                            <a
                              href={`https://github.com/${member.links.github}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {member.links.github} ↗
                            </a>
                          }
                        />
                      )}
                      {member.links?.researchgate && (
                        <FactRow
                          label="ResearchGate"
                          value={
                            <a
                              href={member.links.researchgate}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              ResearchGate ↗
                            </a>
                          }
                        />
                      )}
                      {member.links?.LinkedIn && (
                        <FactRow
                          label="LinkedIn"
                          value={
                            <a
                              href={`https://${member.links.LinkedIn.startsWith("www.") ? "" : "www."}${member.links.LinkedIn}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              LinkedIn ↗
                            </a>
                          }
                        />
                      )}

                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ─── PUBLICATIONS ─── */}
            {activeTab === "publications" && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="mb-6">
                  <h2 className="font-serif text-3xl text-foreground mb-1">Publications</h2>
                </div>

                {pubsLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading publications…</p>
                  </div>
                ) : publications.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-muted-foreground/60 mb-2">
                      {publications.length} publication{publications.length !== 1 ? "s" : ""} found
                    </p>
                    {publications.map((pub, idx) => (
                      <PublicationCard key={pub.id || idx} pub={pub} />
                    ))}
                  </div>
                ) : (
                  <div className="p-10 rounded-2xl border border-border/50 bg-card text-center">
                    <BookOpen size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">
                      {member.links?.orcid
                        ? "No publications found for this ORCID."
                        : "This member does not have an ORCID linked. Publications cannot be fetched automatically."}
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* ─── TEAM ─── */}
            {activeTab === "team" && isLeader && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="mb-6">
                  <h2 className="font-serif text-3xl text-foreground mb-1">Team</h2>
                  <p className="text-sm text-muted-foreground">
                    Click a name to view that member's page
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sortedOtherMembers.map((m) => (
                    <TeamMemberCard
                      key={m.name}
                      member={m}
                      onClick={() => navigate(`/team/${createSlug(m.name)}`)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

/* ─── Fact Row Helper ─── */
const FactRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex gap-3 items-baseline">
    <span className="text-xs uppercase tracking-wider text-muted-foreground/60 min-w-[90px] shrink-0">
      {label}
    </span>
    <span className="text-sm text-foreground">{value}</span>
  </div>
);

export default TeamMemberPageV2;
