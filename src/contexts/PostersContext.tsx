import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { Poster } from "@/data/types";

interface PostersContextType {
  posters: Poster[];
  isLoading: boolean;
  error: string | null;
  addPoster: (item: Poster) => Promise<{ success: boolean; error?: string }>;
  updatePoster: (id: string, updates: Partial<Poster>) => Promise<{ success: boolean; error?: string }>;
  deletePoster: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshPosters: () => Promise<void>;
  uploadPosterImage: (file: File, title: string) => Promise<{ success: boolean; url?: string; error?: string }>;
}

const PostersContext = createContext<PostersContextType | undefined>(undefined);

export function PostersProvider({ children }: { children: ReactNode }) {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosters = async (isInitial = false) => {
    try {
      if (isInitial) setIsLoading(true);
      const { data, error } = await supabase
        .from("posters")
        .select("*")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });

      if (error) throw error;
      setPosters(data || []);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching posters:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosters(true);
  }, []);

  const addPoster = async (item: Poster) => {
    try {
      const { error } = await supabase.from("posters").insert([item]);
      if (error) throw error;
      await fetchPosters(false);
      return { success: true };
    } catch (err: any) {
      console.error("Error adding poster:", err.message);
      return { success: false, error: err.message };
    }
  };

  const updatePoster = async (id: string, updates: Partial<Poster>) => {
    try {
      const { error } = await supabase.from("posters").update(updates).eq("id", id);
      if (error) throw error;
      await fetchPosters(false);
      return { success: true };
    } catch (err: any) {
      console.error("Error updating poster:", err.message);
      return { success: false, error: err.message };
    }
  };

  const deletePoster = async (id: string) => {
    try {
      const { error } = await supabase.from("posters").delete().eq("id", id);
      if (error) throw error;
      await fetchPosters(false);
      return { success: true };
    } catch (err: any) {
      console.error("Error deleting poster:", err.message);
      return { success: false, error: err.message };
    }
  };

  const uploadPosterImage = async (file: File, title: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `poster_${title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}.${fileExt}`;

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
    <PostersContext.Provider
      value={{
        posters,
        isLoading,
        error,
        addPoster,
        updatePoster,
        deletePoster,
        refreshPosters: fetchPosters,
        uploadPosterImage,
      }}
    >
      {children}
    </PostersContext.Provider>
  );
}

export function usePosters() {
  const context = useContext(PostersContext);
  if (context === undefined) {
    throw new Error("usePosters must be used within a PostersProvider");
  }
  return context;
}
