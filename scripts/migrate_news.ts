import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'insilico',
  },
});

const initialNews = [
  { date: "Aug 2026", title: "New Grant Awarded for PARC Project", description: "Secured funding to expand our computational toxicology models for chemical risk assessment." },
  { date: "Jul 2026", title: "Paper Published in Environment International", description: "Our latest research on semantic information extraction for AOPs is now available." },
  { date: "Jun 2026", title: "Upcoming Workshop on NAMs", description: "Join us at the annual conference for a hands-on workshop on New Approach Methodologies." },
  { date: "May 2026", title: "Open Source Release: ToxPredict", description: "We have officially released v2.0 of our flagship toxicity prediction tool for community use." },
  { date: "Apr 2026", title: "Best Poster Award at SOT 2026", description: "Deepika received the Best Poster Award for her work on PBPK modeling at the Society of Toxicology meeting." },
  { date: "Mar 2026", title: "New PhD Student Joins the Team", description: "Welcome to our newest team member, who will be working on machine learning approaches for AOP prediction." },
  { date: "Feb 2026", title: "Collaboration with ETH Zürich", description: "Established a new research collaboration on integrative systems toxicology with ETH Zürich's computational biology group." },
  { date: "Jan 2026", title: "QSAR Model Published in Toxicological Sciences", description: "Our novel QSAR model for hepatotoxicity prediction has been published and made freely available." },
  { date: "Dec 2025", title: "Invited Talk at EUROTOX Conference", description: "Dr. Vikas Kumar delivered an invited keynote on computational approaches to chemical safety assessment." },
  { date: "Nov 2025", title: "AOP-Wiki Integration Complete", description: "Successfully integrated our ontology framework with the OECD AOP-Wiki knowledge base for enhanced data interoperability." }
];

async function migrate() {
  console.log(`Migrating ${initialNews.length} news items...`);
  
  for (const item of initialNews) {
    const { error } = await supabase.from("news").insert([item]);
    if (error) {
      console.error(`Failed to insert "${item.title}":`, error.message);
    } else {
      console.log(`Successfully inserted: "${item.title}"`);
    }
  }

  console.log("Migration complete.");
}

migrate();
