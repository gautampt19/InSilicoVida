import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { TeamMember } from "../data/types";
import { formatLinkedInUrl, generateLinkedInRssUrl } from "../lib/utils";

interface TeamContextType {
  teamMembers: TeamMember[];
  isLoading: boolean;
  error: string | null;
  refreshTeamMembers: () => Promise<void>;
  addTeamMember: (member: Omit<TeamMember, "id" | "created_at">) => Promise<{ success: boolean; error?: string }>;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => Promise<{ success: boolean; error?: string }>;
  deleteTeamMember: (id: string) => Promise<{ success: boolean; error?: string }>;
  uploadImage: (file: File, memberName: string) => Promise<{ success: boolean; url?: string; error?: string }>;
  createAndSaveMemberLinkedInRss: (memberId: string, linkedinUrl?: string) => Promise<{ success: boolean; rssUrl?: string; error?: string }>;
  syncAllMembersLinkedInRss: () => Promise<{ success: boolean; updatedCount: number; error?: string }>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamMembers = async (isInitial = false) => {
    try {
      if (isInitial) setIsLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("created_at", { ascending: true })
        .order("id", { ascending: true });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (err: any) {
      console.error("Error fetching team members:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers(true);
  }, []);

  const addTeamMember = async (member: Omit<TeamMember, "id" | "created_at">) => {
    try {
      const payload = { ...member };
      if (payload.links) {
        const links = { ...payload.links };
        if (links.LinkedIn) {
          links.LinkedIn = formatLinkedInUrl(links.LinkedIn);
          if (!links.linkedinFeed) {
            const autoFeed = generateLinkedInRssUrl(links.LinkedIn);
            if (autoFeed) links.linkedinFeed = autoFeed;
          }
        }
        payload.links = links;
      }
      const { error } = await supabase.from("team_members").insert([payload]);
      if (error) throw error;
      await fetchTeamMembers(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateTeamMember = async (id: string, updates: Partial<TeamMember>) => {
    try {
      const payload = { ...updates };
      if (payload.links) {
        const links = { ...payload.links };
        if (links.LinkedIn) {
          links.LinkedIn = formatLinkedInUrl(links.LinkedIn);
          if (!links.linkedinFeed) {
            const autoFeed = generateLinkedInRssUrl(links.LinkedIn);
            if (autoFeed) links.linkedinFeed = autoFeed;
          }
        }
        payload.links = links;
      }
      const { error } = await supabase.from("team_members").update(payload).eq("id", id);
      if (error) throw error;
      await fetchTeamMembers(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  /**
   * Dedicated function: Generates the RSS feed link for a team member's LinkedIn
   * profile and saves it into the Supabase database.
   */
  const createAndSaveMemberLinkedInRss = async (
    memberId: string,
    linkedinUrl?: string
  ): Promise<{ success: boolean; rssUrl?: string; error?: string }> => {
    try {
      const member = teamMembers.find((m) => m.id === memberId);
      const targetLinkedIn = linkedinUrl || member?.links?.LinkedIn;
      if (!targetLinkedIn) {
        return { success: false, error: "No LinkedIn profile found for this member." };
      }

      const cleanLinkedIn = formatLinkedInUrl(targetLinkedIn);
      const rssUrl = generateLinkedInRssUrl(cleanLinkedIn);
      if (!rssUrl) {
        return {
          success: false,
          error: "LinkedIn personal profiles require a valid feed XML URL from RSS.app or FetchRSS due to login restrictions.",
        };
      }

      const updatedLinks = {
        ...(member?.links || {}),
        LinkedIn: cleanLinkedIn,
        linkedinFeed: rssUrl,
      };

      const { error } = await supabase
        .from("team_members")
        .update({ links: updatedLinks })
        .eq("id", memberId);

      if (error) throw error;
      await fetchTeamMembers(false);
      return { success: true, rssUrl };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  /**
   * Batch function: Ensures all team members with a LinkedIn profile in the database
   * have an active RSS feed link created and saved.
   */
  const syncAllMembersLinkedInRss = async (): Promise<{
    success: boolean;
    updatedCount: number;
    error?: string;
  }> => {
    try {
      const { data: members, error } = await supabase
        .from("team_members")
        .select("id, name, links");

      if (error) throw error;
      let count = 0;

      for (const m of members || []) {
        if (m.links?.LinkedIn) {
          const cleanLinkedIn = formatLinkedInUrl(m.links.LinkedIn);
          const rssUrl = generateLinkedInRssUrl(cleanLinkedIn);
          if (rssUrl && rssUrl !== m.links.linkedinFeed) {
            await supabase
              .from("team_members")
              .update({
                links: {
                  ...m.links,
                  LinkedIn: cleanLinkedIn,
                  linkedinFeed: rssUrl,
                },
              })
              .eq("id", m.id);
            count++;
          }
        }
      }

      await fetchTeamMembers(false);
      return { success: true, updatedCount: count };
    } catch (err: any) {
      return { success: false, updatedCount: 0, error: err.message };
    }
  };

  const deleteTeamMember = async (id: string) => {
    try {
      const { error } = await supabase.from("team_members").delete().eq("id", id);
      if (error) throw error;
      await fetchTeamMembers(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const uploadImage = async (file: File, memberName: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${memberName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('team-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('team-images').getPublicUrl(fileName);
      return { success: true, url: data.publicUrl };
    } catch (err: any) {
      console.error("Upload error:", err.message);
      return { success: false, error: err.message };
    }
  };

  return (
    <TeamContext.Provider
      value={{
        teamMembers,
        isLoading,
        error,
        refreshTeamMembers: fetchTeamMembers,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        uploadImage,
        createAndSaveMemberLinkedInRss,
        syncAllMembersLinkedInRss,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider");
  }
  return context;
};
