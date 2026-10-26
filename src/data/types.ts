// Shared TypeScript interfaces for all data types

export type SoftwareCategory = "pbpk" | "text-mining" | "omics";

export interface Software {
  id?: string;
  created_at?: string;
  name: string;
  description: string;
  language?: string;
  stars?: number;
  license?: string;
  github?: string;
  doi?: string;
  website?: string;
  tags?: string[];
  category: SoftwareCategory;
  date?: string;
}

export interface Publication {
  title: string;
  authors: string;
  journal: string;
  year: string;
  doi: string;
  image?: string;
  id?: string;
  isOpenAccess?: boolean;
}

export interface TeamMember {
  id?: string;
  name: string;
  role: string;
  created_at?: string;
  bio: string;
  image: string;
  hierarchy?: "leader" | "researcher" | "phd" | "visiting" | "alumni";
  links?: {
    email?: string;
    orcid?: string;
    github?: string;
    "google scholar"?: string;
    twitter?: string;
    researchgate?: string;
    LinkedIn?: string;
    linkedinFeed?: string;
    rssFeed?: string;
    "home-page"?: string;
  };
  aliases?: string[];
}


export interface HomeContent {
  labName: string;
  description: string;
  highlights: {
    title: string;
    text: string;
    image?: string;
    link?: string;
  }[];
}

export interface Project {
  id?: string;
  created_at?: string;
  title: string;
  subtitle: string;
  description: string;
  status: "active" | "past";
  date: string;
  grantNumber?: string;
  funding?: string;
  website?: string;
  image?: string;
}

export interface NewsItem {
  id?: string;
  created_at?: string;
  date: string;
  title: string;
  description: string;
  link?: string;
}

export interface Poster {
  id?: string;
  created_at?: string;
  title: string;
  authors: string;
  conference: string;
  year: string;
  zenodo_url?: string;
  pdf_url?: string;
  image_url?: string;
  description?: string;
}

export interface BlogPost {
  id?: string;
  created_at?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category?: string;
  image?: string;
  read_time?: string;
  published?: boolean;
}


