import React, { createContext, useContext, useState, useEffect } from "react";
import { Publication } from "@/data/types";
import { useTeam } from "@/contexts/TeamContext";

interface PublicationsContextType {
  publications: Publication[];
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const PublicationsContext = createContext<PublicationsContextType>({
  publications: [],
  isLoading: true,
  refetch: async () => { },
});

export const PublicationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { teamMembers, isLoading: teamLoading } = useTeam();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPublications = async () => {
    setIsLoading(true);
    try {
      const orcids = teamMembers
        .map((m) => m.links?.orcid)
        .filter(Boolean) as string[];

      if (orcids.length === 0 && !teamLoading) {
        setIsLoading(false);
        return;
      }

      // 1. Fetch ALL works from ORCID API for each member
      const allOrcidPubs: Publication[] = [];
      await Promise.all(
        orcids.map(async (orcid) => {
          try {
            const res = await fetch(
              `https://pub.orcid.org/v3.0/${orcid}/works`,
              { headers: { Accept: "application/json" } }
            );
            if (!res.ok) return;
            const data = await res.json();
            const groups = data.group || [];
            for (const g of groups) {
              const summary = g["work-summary"]?.[0] || {};
              const externalIds = g["external-ids"]?.["external-id"] || [];
              const doiEntry = externalIds.find((e: any) => e["external-id-type"] === "doi");
              const doi = doiEntry?.["external-id-value"] || "";
              const year = summary["publication-date"]?.year?.value || "Unknown Year";
              allOrcidPubs.push({
                id: doi || String(summary["put-code"] || Math.random()),
                title: summary.title?.title?.value || "Untitled",
                authors: "",
                journal: summary["journal-title"]?.value || "Unknown Journal",
                year,
                doi: doi ? `https://doi.org/${doi}` : "",
                isOpenAccess: false,
              });
            }
          } catch {
            // skip failed ORCID fetches
          }
        })
      );

      // 2. Fetch Europe PMC results for all ORCIDs
      let epmcMap = new Map<string, any>();
      if (orcids.length > 0) {
        const queryParts = orcids.map((orcid) => `AUTHORID:"${orcid}"`);
        const orcidQuery = queryParts.join(" OR ");
        let cursorMark = "*";
        let hasMore = true;

        while (hasMore) {
          const apiUrl = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(
            orcidQuery
          )}&format=json&resultType=core&pageSize=200&cursorMark=${encodeURIComponent(cursorMark)}`;
          const res = await fetch(apiUrl);
          if (!res.ok) break;
          const data = await res.json();
          const results = data.resultList?.result || [];
          for (const r of results) {
            if (r.doi) epmcMap.set(r.doi.toLowerCase(), r);
          }
          const nextCursor = data.nextCursorMark;
          if (!nextCursor || nextCursor === cursorMark || results.length === 0) {
            hasMore = false;
          } else {
            cursorMark = nextCursor;
          }
        }
      }

      // 3. Deduplicate by DOI (lowercase)
      const seen = new Map<string, Publication>();
      for (const pub of allOrcidPubs) {
        const key = pub.doi
          ? pub.doi.replace("https://doi.org/", "").toLowerCase()
          : pub.id;
        if (!seen.has(key)) {
          const epmc = pub.doi ? epmcMap.get(pub.doi.replace("https://doi.org/", "").toLowerCase()) : null;
          if (epmc) {
            seen.set(key, {
              ...pub,
              authors: epmc.authorString || pub.authors,
              journal: epmc.journalTitle || pub.journal,
              isOpenAccess: epmc.isOpenAccess === "Y",
            });
          } else {
            seen.set(key, pub);
          }
        }
      }

      const uniquePubs = Array.from(seen.values());
      uniquePubs.sort((a, b) => Number(b.year) - Number(a.year));
      setPublications(uniquePubs);
    } catch (e) {
      console.error("Publications API fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!teamLoading) {
      fetchPublications();
    }
  }, [teamLoading, teamMembers.length]);

  return (
    <PublicationsContext.Provider
      value={{
        publications,
        isLoading,
        refetch: fetchPublications,
      }}
    >
      {children}
    </PublicationsContext.Provider>
  );
};

export const usePublications = () => useContext(PublicationsContext);
