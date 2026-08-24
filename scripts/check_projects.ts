import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || !anonKey) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, { db: { schema: 'insilico' } });
const supabaseAnon = createClient(supabaseUrl, anonKey, { db: { schema: 'insilico' } });

async function check() {
  console.log("Checking as Admin (Service Role)...");
  const { data: adminData, error: adminError } = await supabaseAdmin.from("projects").select("*");
  if (adminError) console.error("Admin Error:", adminError);
  else console.log(`Admin sees ${adminData.length} projects.`);

  console.log("Checking as Anon (Public)...");
  const { data: anonData, error: anonError } = await supabaseAnon.from("projects").select("*");
  if (anonError) console.error("Anon Error:", anonError);
  else console.log(`Anon sees ${anonData.length} projects.`);
}

check();
