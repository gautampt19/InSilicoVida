import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { BlogPost } from "@/data/types";

const INITIAL_BLOGS: BlogPost[] = [
  {
    id: "parc-modellers-hackathon-2026",
    title: "Bridging AI and Biological Modeling: Highlights from the PARC Modellers Hackathon 2026",
    slug: "parc-modellers-hackathon-2026",
    excerpt: "Bringing together 12 emerging researchers from 7 European countries to pioneer agentic AI workflows, AOP ontologies, and LLM-assisted FAIR PBPK modeling.",
    content: `The PARC Modellers Meeting 2026 Hackathon marked our very first initiative dedicated to uniting junior researchers and early-career modelers to tackle complex toxicological problems in the era of artificial intelligence. Held over four intense days of collaborative sprint sessions, the hackathon focused on exploring cutting-edge technologies, specifically bridging the gap between Large Language Models (LLMs) and deep domain expertise in biology and chemical risk assessment.

The event brought together 12 participants from seven European countries (France, Spain, Italy, Sweden, Slovenia, Greece, and Germany), organized into four multidisciplinary teams.

### Four Innovative Hackathon Themes
1. **Agentic Systems for Weight of Evidence (WoE)**: Developing autonomous multi-agent pipelines to retrieve, evaluate, and synthesize diverse toxicological literature for regulatory evidence synthesis.
2. **Adverse Outcome Pathway (AOP) Ontology**: Constructing structured ontologies and semantic frameworks to enable machine-readable knowledge representation and harmonized risk evaluation.
3. **AI-Driven QSAR-to-PBPK Pipeline**: Linking molecular structure representations and machine learning property estimators directly into continuous organ-level physiological exposure simulators.
4. **LLM-Assisted FAIR PBPK Model Building**: Generating and validating Findable, Accessible, Interoperable, and Reusable differential equation models using guided natural language prompts.

Throughout the project, eight mentors from Spain, Germany, Slovenia, the Netherlands, and Estonia provided technical and scientific guidance to each group. At the conclusion of the event, a panel of three distinguished judges evaluated the working prototypes, awarding a special prize to the winning team for their outstanding proof-of-concept.

![Figure 1. Photo of Hackathon, Mentors, Judges, and Modellers Meeting](/images/blogs/parc-hackathon-image1.jpeg)

### Statement from the Scientific Coordination
"The PARC Hackathon marked our very first initiative dedicated to bringing our junior community together to tackle complex research problems in the age of AI! The hackathon focused on exploring cutting-edge technologies, specifically bridging the gap between Large Language Models (LLMs) and deep expertise in biology. Participants worked tirelessly over four continuous days to solve core challenges and deliver initial proofs-of-concept. This intense collaboration has successfully paved the way for these researchers to continue working together and driving innovation forward."

### Participant Voices & Experiences
**Edgar Lopez (Postdoctoral Researcher):**
"Participating in the PARC Modellers Meeting 2026 Hackathon was one of the most enriching experiences of my postdoctoral training. It provided an excellent opportunity to learn from experts across different fields of chemical risk assessment, apply new concepts in real time, and build connections that have continued to broaden my scientific perspective beyond the event. The Hackathon was a truly multidisciplinary experience, bringing together different perspectives to address real-world challenges in chemical and biological modelling. I particularly valued the relevance of the topics, including LLM-assisted FAIR PBPK model building, agentic systems for weight-of-evidence assessment, AOP ontologies, and AI-driven QSAR-to-PBPK pipelines, as well as the opportunity to connect with researchers working at the forefront of these scientific challenges."

**Shubh Sharma (Researcher):**
"I had the opportunity to participate in a hackathon focused on the application of AI to scientific and biomedical research, where I worked on the AOP Ontology development and refinement. It was an absolute pleasure working on it under the supervision of esteemed mentors, and with colleagues from different institutes within PARC. I learnt a lot from them and developed the working prototype which would help in future harmonization and knowledge representation of AOPs and their usage in chemical risk assessment. Apart from this, I also met different researchers working on different projects towards the same end goal: making risk assessment easy and accurate. The hackathon helped in fostering collaboration and interdisciplinary problem-solving amongst like-minded and curious researchers."

This collaborative hackathon demonstrates how combining AI technologies with deep biological knowledge accelerates innovative solutions for safer chemical safety assessment.`,
    author: "InSilicoVida Team",
    date: "October 2026",
    category: "Hackathon",
    read_time: "4 min read",
    image: "/images/blogs/parc-hackathon-image1.jpeg",
    published: true,
  },
  {
    id: "deepika-special-poster-award-eurotox-2026",
    title: "InSilicoVida Researcher Deepika Wins Special Poster Award at EUROTOX 2026",
    slug: "deepika-special-poster-award-eurotox-2026",
    excerpt: "Deepika Deepika honored with the Special Poster Award at EUROTOX 2026 in Vienna for her comprehensive comparative study of generic vs specialized PBPK models across 100 chemicals.",
    content: `At the 60th Congress of the European Societies of Toxicology (EUROTOX 2026), held in Vienna, Austria (13–16 September 2026), InSilicoVida researcher Deepika Deepika was presented with the prestigious **Special Poster Award** for outstanding scientific contribution in computational toxicology and pharmacokinetic modeling.

![Deepika Deepika receiving the Special Poster Award at EUROTOX 2026 in Vienna, alongside co-author Dr. Vikas Kumar and session chair](/images/blogs/eurotox-award-2026.jpg)

### Award-Winning Research: A 100-Chemical Benchmark
The award-winning poster, titled **"Comparative evaluation of generic PBPK (Physiologically Based Pharmacokinetic) Modeling Platforms vs specialized PBPK models for chemical risk assessment: Case Study with 100 chemicals"**, was co-authored by Deepika Deepika, Yash Yogesh Gondegaonkar, Saurav Kumar, and Vikas Kumar in a collaborative initiative between the Institut de Recerca Biomèdica Catalunya Sud (Universitat Rovira i Virgili, Tarragona, Spain) and the German Federal Institute for Risk Assessment (BfR, Berlin, Germany). The research was supported by the European Partnership for the Assessment of Risks from Chemicals (PARC), Merlon, and TECNATox, co-funded by the European Union.

![Figure 2. Full EUROTOX 2026 Award-Winning Poster: Comparative Evaluation of Generic PBPK Modeling Platforms vs Specialized PBPK Models](/images/blogs/eurotox-2026-poster.jpg)

### Core Scientific Questions & Objectives
Physiologically Based Pharmacokinetic (PBPK) models are increasingly indispensable in modern chemical safety assessment and regulatory decision-making. 
- **Generic Open-Source Platforms** (such as the \`httk\` package in R) parameterize organ distribution and clearance using in silico QSAR/QSPR algorithms, enabling rapid, high-throughput screening across extensive chemical inventories.
- **Specialized Compound-Specific Models** account for intricate ADME mechanisms, transporter kinetics, and non-linear metabolic pathways, but are labor-intensive and cannot readily scale to thousands of uncharacterized substances.

The primary objective of this study was to systematically evaluate whether generic high-throughput PBPK platforms can achieve sufficient predictive accuracy compared to dedicated compound-specific models when benchmarked against real observed human in vivo clinical data across 100 chemicals of regulatory interest—including phthalates, bisphenols, pesticides, persistent organic pollutants (POPs), pharmaceuticals, and per- and polyfluoroalkyl substances (PFAS).

### Key Findings and Quantitative Observations
By comparing critical pharmacokinetic endpoints such as maximum plasma concentration ($C_{max}$) and area under the curve ($AUC$), the team discovered significant variations across different QSPR prediction algorithms:
- **Algorithm Sensitivity**: In silico parameterizations (such as default \`httk\` values, Sipes et al. 2017, Dawson et al. 2021, and Pradeep et al. 2020) produced substantial discrepancies. For paracetamol, predictions varied up to 7-fold in $C_{max}$ and 11-fold in $AUC$ depending on the chosen algorithm.
- **Divergence for Complex Compounds**: For certain substances like nitrofurantoin, riluzole, and flutamide, generic model alignments with observed human clinical profiles showed marked divergence, highlighting that without active transporter kinetics or metabolite clearance, generic approximations may lead to under- or over-estimation of internal target tissue exposure.
- **Implications for Next-Generation Risk Assessment**: While generic platforms offer an invaluable first-tier triage filter for chemical screening, their standalone reliance for definitive regulatory risk assessment remains limited by the uncertainty of underlying QSPR predictors and the absence of secondary metabolite kinetics.

### Ongoing and Future Directions
Moving forward, our research team is extending this comparative benchmark by evaluating all 100 chemicals under standardized human dosing scenarios with harmonized clinical endpoints ($C_{max}$, $AUC$), developing automated uncertainty bounds, and coupling generic PBPK workflows with mechanistic machine learning models.

We congratulate Deepika and the entire modeling team for this well-deserved international recognition!`,
    author: "InSilicoVida Team",
    date: "September 2026",
    category: "Awards",
    read_time: "5 min read",
    image: "/images/blogs/eurotox-award-2026.jpg",
    published: true,
  },
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
  uploadImage: (file: File, title: string) => Promise<{ success: boolean; url?: string; error?: string }>;
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
        // Fallback to local initial blogs if Supabase table is not yet created
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

  const uploadImage = async (file: File, title: string): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('blog-images').getPublicUrl(fileName);
      return { success: true, url: data.publicUrl };
    } catch (err: any) {
      console.error("Blog image upload error:", err.message);
      return { success: false, error: err.message };
    }
  };

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
        uploadImage,
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
