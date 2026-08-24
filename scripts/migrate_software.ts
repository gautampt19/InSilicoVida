import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { software } from "../src/data/software";

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

async function migrate() {
  console.log(`Migrating ${software.length} software tools...`);
  
  for (const s of software) {
    const dbSoftware = {
      name: s.name,
      description: s.description,
      language: s.language || null,
      stars: s.stars || 0,
      license: s.license || null,
      github: s.github || null,
      doi: s.doi || null,
      website: s.website || null,
      tags: s.tags || [],
      category: s.category,
      date: s.date || null,
    };

    const { error } = await supabase.from("software").insert([dbSoftware]);
    if (error) {
      console.error(`Failed to insert ${s.name}:`, error.message);
    } else {
      console.log(`Successfully inserted ${s.name}`);
    }
  }

  console.log("Migration complete.");
}

migrate();
