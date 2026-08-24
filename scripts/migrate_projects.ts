import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { projects } from "../src/data/projects";

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
  console.log(`Migrating ${projects.length} projects...`);
  
  for (const p of projects) {
    const dbProject = {
      ...p,
      grant_number: p.grantNumber,
    };
    delete (dbProject as any).grantNumber;

    const { error } = await supabase.from("projects").insert([dbProject]);
    if (error) {
      console.error(`Failed to insert ${p.title}:`, error.message);
    } else {
      console.log(`Successfully inserted ${p.title}`);
    }
  }

  console.log("Migration complete.");
}

migrate();
