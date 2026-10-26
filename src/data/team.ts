import { TeamMember } from "./types";

export const teamMembers: TeamMember[] = [
  {
    name: "Vikas Kumar",
    role: "Group Leader",
    hierarchy: "leader",
    bio: "Dr Vikas Kumar is a member of the TECNATOX a specialized research center in the area of Technology Transfer in Toxicology, Food and Environmental Health. Dr. Kumar expetise lies in Knowledge Engineering and Decision Modelling including rule based expert system, Artificial intelligence and hybrid system, Integrated System Modelling, Integrative Systems Toxicology and broad range of in silico tools for human health risk assessment, Data Management and Analytical Solutions. Specialized in tissue dosimetry (physiologically-based kinetic models), translational models (IVIVE, QIVIVE, inter-species scaling), QSAR, quantitative AOPs and Systems biology models",
    image: "/images/members/vikas_kumar_2012082006.jpg",
    links: {
      github: "InSilicoVida",
      "google scholar": "https://scholar.google.com/citations?user=rhH7LGQAAAAJ",
      orcid: "0000-0002-9795-5967",
      email: "vikas.kumar@urv.cat",
    },
  },
  {
    name: "Deepika",
    role: "Researcher",
    hierarchy: "researcher",
    bio: "My work is to develop Physiologically Based Pharmacokinetic Models (PBPK) and Systems Biology models for evaluating toxicity using programming language like Rstudio and Python. I have hands-on-experience in culturing the cells (in-vitro), techniques like UV-Vis, PCR, transwell permeability etc. Also I am involved in ontology development for biomedical domain, and developing or refining the adverse outcome pathways (AOPs). I am currently involved with PARC (European Partnership for the Assessment of Risks from Chemicals) which consists of 200 partners in 28 countries. Skills: PBPK Modeling · Machine Learning · Toxicology and Risk Assessment · Systems Biology/Pharmacodynamic Modeling",
    image: "/images/members/deepika.jpg",
    links: {
      email: "deepika@iispv.cat",
      twitter: "Deepika0601",
      orcid: "0000-0001-8345-1349",
      researchgate: "https://www.researchgate.net/profile/Deepika-Deepika-6",
      LinkedIn: "www.linkedin.com/in/deepika-deepika-753261103",
      "google scholar": "https://scholar.google.es/citations?user=saX1XIwAAAAJ&hl=en",
    },
  },
  {
    name: "Rajesh Kumar Pathak",
    role: "Researcher",
    hierarchy: "researcher",
    bio: "Rajesh Kumar Pathak is a bioinformatics and systems biology researcher whose work spans computational genomics, next-generation sequencing, host–pathogen interactions, and computer-aided drug and vaccine design. His publications bridge plant and microbial systems, with applications in agriculture, infectious disease, and rational drug discovery.",
    image: "/images/members/rajesh_kumar_pathak.jpg",
    links: {
      email: "rajeshkumar.pathak@urv.cat",
      orcid: "0000-0003-3835-8430",
      github: "rkpathakbioinfo",
      LinkedIn: "https://www.linkedin.com/in/rajesh-kumar-pathak-8212499a",
      "google scholar": "https://scholar.google.com/citations?hl=en&user=aGb3z1gAAAAJ&view_op=list_works&sortby=pubdate",
    },
  },
  {
    name: "Judith Bosa-brull",
    role: "Researcher",
    hierarchy: "researcher",
    bio: "Her work focuses on nutrition, metabolism, and related biomedical research questions, with a particular emphasis on experimental and omics-based approaches in animal models. A recent contribution includes co-authorship on a study examining transcriptomic changes in mice after a single dose of ibogaine, reflecting an interest in how bioactive compounds affect brain and metabolic pathways.",
    image: "/images/members/judith_bosa_brull.jpg",
    links: {},
  },
  {
    name: "Kanchan Bharti",
    role: "Researcher",
    hierarchy: "researcher",
    bio: "Her key areas of interest include pharmaceutics, formulation science, and advanced drug delivery, covering how medicines are designed, processed, and delivered in the body. Typical work in this domain involves developing novel carriers, controlled-release systems, or targeted formulations to enhance therapeutic outcomes.",
    image: "/images/members/kanchan_bharti.jpg",
    links: {},
  },
  {
    name: "saurav kumar",
    role: "PhD Student",
    hierarchy: "phd",
    bio: "Bioinformatician and Lead Programmer working on text mining and developing tools like AOP-wiki explorer, AOP-bot etc. for extracting useful information from vast literature.",
    image: "/images/members/saurav.jpg",
    links: {
      "home-page": "https://github.com/Crispae",
      email: "saurav.kumar@iispv.cat",
      orcid: "0000-0003-0593-2598",
      "google scholar": "https://scholar.google.com/citations?user=D_srPckAAAAJ&hl=en",
    },
    aliases: ["S. Kumar"],
  },
  {
    name: "Shubh Sharma",
    role: "PhD Student",
    hierarchy: "phd",
    bio: "Predoctoral Research Fellow working on computational toxicology and AOP development.",
    image: "/images/members/shubh.jpeg",
    links: {
      "home-page": "https://github.com/Ragingdemo",
      email: "shubh.sharma@estudiants.urv.cat",
      orcid: "0009-0004-2207-3937",
    },
    aliases: ["S. sharma"],
  },
  {
    name: "Jordina Balaguer",
    role: "PhD Student",
    hierarchy: "phd",
    bio: "Jordina is working mostly on developing a system to test gut microbiota and neurotoxicity through developing co-culture system.",
    image: "/images/members/jordina_balaguer_2_619574743.jpg",
    links: {
      email: "jordina.balaguer@urv.cat",
      orcid: "0000-0001-9001-207X",
    },
  },
  {
    name: "Oscar Sabuz Vidal",
    role: "PhD Student",
    hierarchy: "phd",
    bio: "Oscar work is mostly focused on developing cross-link between gut microbiota and mimmunotoxicity.",
    image: "/images/members/oscar_sabuz_vidal.jpg",
    links: {
      email: "oscar.sabuz@urv.cat",
      orcid: "0000-0002-1987-4694",
    },
  },
  {
    name: "Gautam",
    role: "PhD Student",
    hierarchy: "phd",
    bio: "Gautam is a PhD student focusing on machine learning applications in computational toxicology and the development of predictive models for chemical risk assessment.",
    links: {},
  },
  {
    name: "Yash Yogesh Gondegaonkar",
    role: "PhD Student",
    hierarchy: "phd",
    bio: "Yash is researching advanced deep learning architectures to improve the reliability of in-silico toxicity predictions and analyze complex adverse outcome pathways.",
    links: {},
  },
  {
    name: "Vishak Viswalal",
    role: "PhD Student",
    hierarchy: "phd",
    bio: "Vishak's research involves the integration of multi-omics data with systems biology models to understand metabolic disruptions caused by environmental pollutants.",
    links: {},
  },
];

// Helper functions to get team members by hierarchy
export const getGroupLeader = () => {
  return teamMembers.find((member) => member.hierarchy === "leader");
};

export const getResearchers = () => {
  return teamMembers.filter((member) => member.hierarchy === "researcher");
};

export const getPhDStudents = () => {
  return teamMembers.filter((member) => member.hierarchy === "phd");
};

export const getVisitingScientists = () => {
  return teamMembers.filter((member) => member.hierarchy === "visiting");
};

export const getAlumni = () => {
  return teamMembers.filter((member) => member.hierarchy === "alumni");
};

export const getTeamMembersByRole = (role: string) => {
  const roleMap: Record<string, string> = {
    pi: "Group Leader",
    postdoc: "Researcher",
    phd: "PhD Student",
    programmer: "Bioinformatician/Lead Programmer",
  };
  return teamMembers.filter((member) => member.role === roleMap[role] || member.role === role);
};

// Helper for URL routing
export const createSlug = (name: string) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

export const getMemberBySlug = (slug: string) => {
  return teamMembers.find((member) => createSlug(member.name) === slug);
};

