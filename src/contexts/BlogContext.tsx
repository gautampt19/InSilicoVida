import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { BlogPost } from "@/data/types";

const INITIAL_BLOGS: BlogPost[] = [
  {
    id: "1",
    title: "Advancements in High-Throughput PBPK Modeling for Chemical Risk Assessment",
    slug: "advancements-in-high-throughput-pbpk-modeling",
    excerpt: "Exploring how integrated computational workflows accelerate pharmacokinetic predictions across diverse chemical spaces and population groups.",
    content: `Physiologically Based Pharmacokinetic (PBPK) modeling has evolved into an indispensable pillar of modern predictive toxicology and pharmacology. By combining anatomical, physiological, and biochemical data with substance-specific properties, PBPK models allow researchers to simulate internal chemical exposure profiles without extensive animal testing.

### Key Pillars of Modern PBPK Modeling
1. **Anatomical Accuracy**: Multi-compartment mathematical modeling representing tissue blood flows and organ volumes.
2. **In Vitro to In Vivo Extrapolation (IVIVE)**: Converting high-throughput cell-based assay parameters ($V_{max}$, $K_m$, clearance) into organ-level transport rates.
3. **Population Variability**: Integrating Monte Carlo simulations to address age, gender, and genetic polymorphism variations across populations.

Our research group at InSilicoVida continues to develop automated pipelines linking machine learning predictions directly to ODE-based PBPK solvers in R and Python.`,
    author: "InSilicoVida Team",
    date: "July 2026",
    category: "PBPK",
    read_time: "5 min read",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1200",
    published: true,
  },
  {
    id: "2",
    title: "FAIR Data Standards in Computational Toxicology",
    slug: "fair-data-standards-in-computational-toxicology",
    excerpt: "Why Findable, Accessible, Interoperable, and Reusable data repositories are crucial for next-generation risk assessment methodologies.",
    content: `The rapid rise of machine learning models in toxicology underscores a urgent necessity: standardized, high-quality computational datasets. FAIR principles (Findable, Accessible, Interoperable, and Reusable) ensure that predictive models and toxicological evidence are transparent, reproducible, and verifiable.

### Implementing FAIR in Bio-Simulation
- **Standardized Annotations**: Utilizing ontology terms (ChEBI, PubChem CIDs, MeSH) for all chemical and biological endpoints.
- **Open Model Repositories**: Publishing PBPK model code in open-source R packages and open science repositories.
- **Machine-Readable Metadata**: Providing structured JSON-LD descriptors alongside research papers.

At InSilicoVida, we prioritize open science by ensuring all our software tools, PBPK scripts, and poster publications are freely accessible.`,
    author: "Research Team",
    date: "June 2026",
    category: "FAIR Data",
    read_time: "4 min read",
    image: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=1200",
    published: true,
  },
  {
    id: "3",
    title: "AI & Machine Learning for Quantitative Structure-Activity Relationships (QSAR)",
    slug: "ai-and-machine-learning-for-qsar",
    excerpt: "How deep neural networks and graph representations are reshaping property prediction for novel pharmaceuticals and environmental chemicals.",
    content: `Quantitative Structure-Activity Relationship (QSAR) models have long served as virtual filters for chemical screening. Recent developments in graph neural networks (GNNs) and transformer models have significantly expanded the accuracy and domain of applicability for predicting chemical toxicity, bioaccumulation, and partition coefficients.

Combining machine learning QSAR models with PBPK simulators allows full end-to-end virtual screening—predicting both intrinsic toxicity and real organ exposure levels purely from a 2D chemical structure.`,
    author: "InSilicoVida Team",
    date: "May 2026",
    category: "Machine Learning",
    read_time: "6 min read",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200",
    published: true,
  }
];

interface BlogContextType {
  blogs: BlogPost[];
  isLoading: boolean;
  error: string | null;
  addBlog: (item: BlogPost) => Promise<{ success: boolean; error?: string }>;
  updateBlog: (id: string, updates: Partial<BlogPost>) => Promise<{ success: boolean; error?: string }>;
  deleteBlog: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshBlogs: () => Promise<void>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export function BlogProvider({ children }: { children: ReactNode }) {
  const [blogs, setBlogs] = useState<BlogPost[]>(INITIAL_BLOGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogs = async (isInitial = false) => {
    try {
      if (isInitial) setIsLoading(true);
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // If table does not exist or fetch fails, fallback to local initial blogs
        console.warn("Supabase blogs table notice:", error.message);
      } else if (data && data.length > 0) {
        setBlogs(data);
      }
      setError(null);
    } catch (err: any) {
      console.error("Error fetching blogs:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(true);
  }, []);

  const addBlog = async (item: BlogPost) => {
    try {
      const slug = item.slug || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const blogWithSlug = { ...item, slug };

      const { data, error } = await supabase.from("blogs").insert([blogWithSlug]).select();
      if (error) {
        // Fallback to local state if Supabase table is not configured
        console.warn("Using local state for blog addition:", error.message);
        setBlogs(prev => [{ ...blogWithSlug, id: Date.now().toString() }, ...prev]);
      } else {
        await fetchBlogs(false);
      }
      return { success: true };
    } catch (err: any) {
      console.error("Error adding blog:", err.message);
      return { success: false, error: err.message };
    }
  };

  const updateBlog = async (id: string, updates: Partial<BlogPost>) => {
    try {
      const { error } = await supabase.from("blogs").update(updates).eq("id", id);
      if (error) {
        // Fallback update in local state
        setBlogs(prev => prev.map(b => (b.id === id ? { ...b, ...updates } : b)));
      } else {
        await fetchBlogs(false);
      }
      return { success: true };
    } catch (err: any) {
      console.error("Error updating blog:", err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteBlog = async (id: string) => {
    try {
      const { error } = await supabase.from("blogs").delete().eq("id", id);
      if (error) {
        // Fallback delete in local state
        setBlogs(prev => prev.filter(b => b.id !== id));
      } else {
        await fetchBlogs(false);
      }
      return { success: true };
    } catch (err: any) {
      console.error("Error deleting blog:", err.message);
      return { success: false, error: err.message };
    }
  };

  return (
    <BlogContext.Provider
      value={{
        blogs,
        isLoading,
        error,
        addBlog,
        updateBlog,
        deleteBlog,
        refreshBlogs: fetchBlogs,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
}

export function useBlog() {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error("useBlog must be used within a BlogProvider");
  }
  return context;
}
