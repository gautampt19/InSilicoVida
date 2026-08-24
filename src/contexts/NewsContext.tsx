import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { NewsItem } from "@/data/types";

interface NewsContextType {
  news: NewsItem[];
  isLoading: boolean;
  error: string | null;
  addNews: (item: NewsItem) => Promise<{ success: boolean; error?: string }>;
  updateNews: (id: string, updates: Partial<NewsItem>) => Promise<{ success: boolean; error?: string }>;
  deleteNews: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshNews: () => Promise<void>;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export function NewsProvider({ children }: { children: ReactNode }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async (isInitial = false) => {
    try {
      if (isInitial) setIsLoading(true);
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });

      if (error) throw error;
      setNews(data || []);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching news:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(true);
  }, []);

  const addNews = async (item: NewsItem) => {
    try {
      const { error } = await supabase.from("news").insert([item]);
      if (error) throw error;
      await fetchNews(false);
      return { success: true };
    } catch (err: any) {
      console.error("Error adding news:", err.message);
      return { success: false, error: err.message };
    }
  };

  const updateNews = async (id: string, updates: Partial<NewsItem>) => {
    try {
      const { error } = await supabase.from("news").update(updates).eq("id", id);
      if (error) throw error;
      await fetchNews(false);
      return { success: true };
    } catch (err: any) {
      console.error("Error updating news:", err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteNews = async (id: string) => {
    try {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;
      await fetchNews(false);
      return { success: true };
    } catch (err: any) {
      console.error("Error deleting news:", err.message);
      return { success: false, error: err.message };
    }
  };

  return (
    <NewsContext.Provider
      value={{
        news,
        isLoading,
        error,
        addNews,
        updateNews,
        deleteNews,
        refreshNews: fetchNews,
      }}
    >
      {children}
    </NewsContext.Provider>
  );
}

export function useNews() {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error("useNews must be used within a NewsProvider");
  }
  return context;
}
