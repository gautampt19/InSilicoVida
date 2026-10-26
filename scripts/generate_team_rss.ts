import { supabase } from "../src/lib/supabase";
import { formatLinkedInUrl, extractLinkedInUsername, generateLinkedInRssUrl } from "../src/lib/utils";

/**
 * Standalone automation script to inspect all team members in the Supabase database,
 * generate RSS feed links for their LinkedIn profiles, and save them back to the database.
 */
export async function syncAllTeamMemberRssFeeds() {
  console.log("==================================================");
  console.log("  Generating & Saving Team Member LinkedIn RSS Feeds ");
  console.log("==================================================\n");

  const { data: members, error } = await supabase
    .from("team_members")
    .select("id, name, links")
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to query team_members:", error.message);
    return;
  }

  if (!members || members.length === 0) {
    console.log("No team members found in database.");
    return;
  }

  console.log(`Found ${members.length} team members. Processing LinkedIn profiles...\n`);

  let updatedCount = 0;
  let alreadyUpToDate = 0;
  let noLinkedInCount = 0;

  for (const member of members) {
    const rawLinkedIn = member.links?.LinkedIn;

    if (!rawLinkedIn || !rawLinkedIn.trim()) {
      noLinkedInCount++;
      continue;
    }

    const cleanLinkedIn = formatLinkedInUrl(rawLinkedIn);
    const username = extractLinkedInUsername(cleanLinkedIn);
    const generatedRss = generateLinkedInRssUrl(cleanLinkedIn);

    const currentRss = member.links?.linkedinFeed || member.links?.rssFeed;

    if (currentRss && currentRss === generatedRss && member.links?.LinkedIn === cleanLinkedIn) {
      console.log(`✓ ${member.name}: Already has up-to-date RSS feed:`);
      console.log(`    LinkedIn: ${cleanLinkedIn}`);
      console.log(`    RSS Feed: ${currentRss}\n`);
      alreadyUpToDate++;
      continue;
    }

    // Update member's links in Supabase
    const newLinks = {
      ...(member.links || {}),
      LinkedIn: cleanLinkedIn,
      linkedinFeed: currentRss && !currentRss.includes("rsshub.app") ? currentRss : generatedRss,
    };

    const { error: updateErr } = await supabase
      .from("team_members")
      .update({ links: newLinks })
      .eq("id", member.id);

    if (updateErr) {
      console.error(`✗ Error updating ${member.name}:`, updateErr.message);
    } else {
      console.log(`★ Updated ${member.name}:`);
      console.log(`    Username: ${username}`);
      console.log(`    LinkedIn: ${cleanLinkedIn}`);
      console.log(`    RSS Feed: ${newLinks.linkedinFeed}\n`);
      updatedCount++;
    }
  }

  console.log("--------------------------------------------------");
  console.log(`Summary:`);
  console.log(`  Updated with RSS: ${updatedCount}`);
  console.log(`  Already configured: ${alreadyUpToDate}`);
  console.log(`  No LinkedIn profile: ${noLinkedInCount}`);
  console.log(`  Total members: ${members.length}`);
  console.log("==================================================\n");
}

syncAllTeamMemberRssFeeds().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

