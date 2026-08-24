import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env.local');

dotenv.config({ path: envPath });

import { teamMembers } from '../src/data/team.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase URL or Service Role Key in .env.local");
  process.exit(1);
}

// Create a Supabase client with the Service Role key to bypass RLS, and set the schema to 'insilico'
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: {
    schema: 'insilico',
  },
});

async function migrateData() {
  console.log("Starting migration to insilico.team_members...");
  
  // Clear existing data (optional, but good for idempotency during testing)
  const { error: deleteError } = await supabase.from('team_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) {
    console.error("Error clearing existing data:", deleteError);
  }

  // Insert the data
  const { data, error } = await supabase.from('team_members').insert(
    teamMembers.map((member) => ({
      name: member.name,
      role: member.role,
      bio: member.bio,
      image: member.image,
      hierarchy: member.hierarchy,
      links: member.links || {},
      aliases: member.aliases || [],
    }))
  ).select();

  if (error) {
    console.error("Migration failed:", error);
  } else {
    console.log(`Migration successful! Inserted ${data.length} team members.`);
  }
}

migrateData();
