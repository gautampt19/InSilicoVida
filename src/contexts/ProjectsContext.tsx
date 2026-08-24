import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Project } from "../data/types";

interface ProjectsContextType {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  refreshProjects: () => Promise<void>;
  addProject: (project: Omit<Project, "id" | "created_at">) => Promise<{ success: boolean; error?: string }>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<{ success: boolean; error?: string }>;
  deleteProject: (id: string) => Promise<{ success: boolean; error?: string }>;
  uploadProjectImage: (file: File, projectTitle: string) => Promise<{ success: boolean; url?: string; error?: string }>;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const ProjectsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async (isInitial = false) => {
    try {
      if (isInitial) setIsLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: true })
        .order("id", { ascending: true });

      if (error) throw error;
      
      const mappedData = data?.map((item: any) => ({
        ...item,
        grantNumber: item.grant_number
      })) || [];

      setProjects(mappedData);
    } catch (err: any) {
      console.error("Error fetching projects:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(true);
  }, []);

  const addProject = async (project: Omit<Project, "id" | "created_at">) => {
    try {
      const dbProject = {
        ...project,
        grant_number: project.grantNumber
      };
      delete (dbProject as any).grantNumber;

      const { error } = await supabase.from("projects").insert([dbProject]);
      if (error) throw error;
      await fetchProjects(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const dbUpdates = {
        ...updates,
      };
      if (updates.grantNumber !== undefined) {
        (dbUpdates as any).grant_number = updates.grantNumber;
        delete dbUpdates.grantNumber;
      }

      const { error } = await supabase.from("projects").update(dbUpdates).eq("id", id);
      if (error) throw error;
      await fetchProjects(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      await fetchProjects(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const uploadProjectImage = async (file: File, projectTitle: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${projectTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('project-images').getPublicUrl(fileName);
      return { success: true, url: data.publicUrl };
    } catch (err: any) {
      console.error("Upload error:", err.message);
      return { success: false, error: err.message };
    }
  };

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        isLoading,
        error,
        refreshProjects: fetchProjects,
        addProject,
        updateProject,
        deleteProject,
        uploadProjectImage,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }
  return context;
};
