import React, { createContext, useContext, useState, useEffect } from "react";
import { homeContent as defaultHomeContent } from "@/data/home";
import { supabase } from "@/lib/supabase";

export interface HighlightItem {
  title: string;
  text: string;
  link: string;
}

export interface HomeData {
  labName: string;
  tagline: string;
  description: string;
  bannerImage: string;
  highlights: HighlightItem[];
  tickerItems: TickerItem[];
}

interface HomeContextType {
  homeData: HomeData;
  isLoading: boolean;
  updateHomeData: (newContent: Partial<HomeData>) => Promise<{ success: boolean; error?: string }>;
}

const STORAGE_KEY = "insilicovida_home_content";

const defaultTickerItems: TickerItem[] = [
  { category: "News", title: "Welcoming our new PhD students for the Fall term!" },
  { category: "Publication", title: "Predicting Endocrine Disruption using Quantitative AOP Networks in Toxicology Letters" },
  { category: "Poster", title: "In-Silico Modeling of Organophosphate Flame Retardants presented at EuroTox" },
  { category: "Event", title: "Joint Seminar on Computational Toxicology with DTU on October 14th" },
  { category: "Research", title: "ENVESOME initiative officially launches the exposome monitoring dashboard" },
];

const initialData: HomeData = {
  labName: defaultHomeContent.labName || "InSilico Vida",
  tagline: "Computational Modeling for Health Risk Assessment",
  description: defaultHomeContent.description,
  bannerImage: "/banner.png",
  highlights: defaultHomeContent.highlights,
  tickerItems: defaultTickerItems,
};

const HomeContext = createContext<HomeContextType>({
  homeData: initialData,
  isLoading: false,
  updateHomeData: async () => ({ success: true }),
});

export const HomeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [homeData, setHomeData] = useState<HomeData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return { ...initialData, ...JSON.parse(saved) };
      } catch (e) {
        return initialData;
      }
    }
    return initialData;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch from Supabase home_content table if it exists
  const fetchHomeData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from("home_content").select("*").single();
      if (!error && data) {
        const fetchedData: HomeData = {
          labName: data.lab_name || initialData.labName,
          tagline: data.tagline || initialData.tagline,
          description: data.description || initialData.description,
          bannerImage: data.banner_image || initialData.bannerImage,
          highlights: data.highlights || initialData.highlights,
          tickerItems: data.ticker_items || initialData.tickerItems,
        };
        setHomeData(fetchedData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fetchedData));
      }
    } catch (e) {
      console.warn("Supabase home_content fetch fallback to local:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const updateHomeData = async (updates: Partial<HomeData>) => {
    try {
      const updated = { ...homeData, ...updates };
      setHomeData(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Try updating Supabase home_content single row if table exists
      try {
        await supabase.from("home_content").upsert({
          id: 1,
          lab_name: updated.labName,
          tagline: updated.tagline,
          description: updated.description,
          banner_image: updated.bannerImage,
          highlights: updated.highlights,
          ticker_items: updated.tickerItems,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        // Fallback to local storage if DB row not present
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return (
    <HomeContext.Provider value={{ homeData, isLoading, updateHomeData }}>
      {children}
    </HomeContext.Provider>
  );
};

export const useHome = () => useContext(HomeContext);
