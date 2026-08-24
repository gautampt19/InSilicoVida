import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { Software } from "@/data/types";

interface SoftwareContextType {
  software: Software[];
  isLoading: boolean;
  error: string | null;
  addSoftware: (tool: Software) => Promise<{ success: boolean; error?: string }>;
  updateSoftware: (id: string, updates: Partial<Software>) => Promise<{ success: boolean; error?: string }>;
  deleteSoftware: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshSoftware: () => Promise<void>;
}

const SoftwareContext = createContext<SoftwareContextType | undefined>(undefined);

export function SoftwareProvider({ children }: { children: ReactNode }) {
  const [software, setSoftware] = useState<Software[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSoftware = async (isInitial = false) => {
    try {
      if (isInitial) setIsLoading(true);
      const { data, error } = await supabase
        .from("software")
        .select("*")
        .order("created_at", { ascending: true })
        .order("id", { ascending: true });

      if (error) throw error;
      setSoftware(data || []);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching software:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSoftware(true);
  }, []);

  const addSoftware = async (tool: Software) => {
    try {
      const { error } = await supabase.from("software").insert([tool]);
      if (error) throw error;
      await fetchSoftware(false);
      return { success: true };
    } catch (err: any) {
      console.error("Error adding software:", err.message);
      return { success: false, error: err.message };
    }
  };

  const updateSoftware = async (id: string, updates: Partial<Software>) => {
    try {
      const { error } = await supabase.from("software").update(updates).eq("id", id);
      if (error) throw error;
      await fetchSoftware(false);
      return { success: true };
    } catch (err: any) {
      console.error("Error updating software:", err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteSoftware = async (id: string) => {
    try {
      const { error } = await supabase.from("software").delete().eq("id", id);
      if (error) throw error;
      await fetchSoftware(false);
      return { success: true };
    } catch (err: any) {
      console.error("Error deleting software:", err.message);
      return { success: false, error: err.message };
    }
  };

  return (
    <SoftwareContext.Provider
      value={{
        software,
        isLoading,
        error,
        addSoftware,
        updateSoftware,
        deleteSoftware,
        refreshSoftware: fetchSoftware,
      }}
    >
      {children}
    </SoftwareContext.Provider>
  );
}

export function useSoftware() {
  const context = useContext(SoftwareContext);
  if (context === undefined) {
    throw new Error("useSoftware must be used within a SoftwareProvider");
  }
  return context;
}
