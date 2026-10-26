import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { TeamMember } from "../data/types";
import { formatLinkedInUrl } from "../lib/utils";

interface TeamContextType {
  teamMembers: TeamMember[];
  isLoading: boolean;
  error: string | null;
  refreshTeamMembers: () => Promise<void>;
  addTeamMember: (member: Omit<TeamMember, "id" | "created_at">) => Promise<{ success: boolean; error?: string }>;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => Promise<{ success: boolean; error?: string }>;
  deleteTeamMember: (id: string) => Promise<{ success: boolean; error?: string }>;
  uploadImage: (file: File, memberName: string) => Promise<{ success: boolean; url?: string; error?: string }>;
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
