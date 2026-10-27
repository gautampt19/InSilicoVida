import * as dotenv from "dotenv";
dotenv.config();

import { supabase } from "../src/lib/supabase";
import fs from "fs";
import path from "path";
import { chromium } from "playwright";
import { extractLinkedInUsername } from "../src/lib/utils";
import { teamMembers } from "../src/data/team";

interface RawPost {
  title: string;
  description: string;
  link: string;
  date?: string;
  author?: string;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function parseLinkedInDate(dateInput?: string | Date): string {
  const now = new Date();
  const currentYear = now.getFullYear();

  if (!dateInput) {
    return `${MONTH_NAMES[now.getMonth()]} ${currentYear}`;
  }

  if (dateInput instanceof Date) {
    return `${MONTH_NAMES[dateInput.getMonth()]} ${dateInput.getFullYear()}`;
  }

  const clean = dateInput
    .replace(/\r/g, "")
    .replace(/•.*$/, "")
    .replace(/\bedited\b/i, "")
    .trim();

  if (!clean) {
    return `${MONTH_NAMES[now.getMonth()]} ${currentYear}`;
  }

  // Relative units: "3w", "2mo", "1yr", "5d", "4h"
  const relMatch = clean.match(/^(\d+)\s*([whdmy]|mo|yr)/i);
  if (relMatch) {
    const count = parseInt(relMatch[1], 10);
    const unit = relMatch[2].toLowerCase();
    const target = new Date();
    if (unit === "h" || unit === "d") {
      target.setDate(target.getDate() - (unit === "d" ? count : 1));
    } else if (unit === "w") {
      target.setDate(target.getDate() - count * 7);
    } else if (unit === "mo" || unit === "m") {
      target.setMonth(target.getMonth() - count);
    } else if (unit === "yr" || unit === "y") {
      target.setFullYear(target.getFullYear() - count);
    }
    return `${MONTH_NAMES[target.getMonth()]} ${target.getFullYear()}`;
  }

  if (/yesterday/i.test(clean)) {
    const target = new Date();
    target.setDate(target.getDate() - 1);
    return `${MONTH_NAMES[target.getMonth()]} ${target.getFullYear()}`;
  }

  if (/today|just now/i.test(clean)) {
    return `${MONTH_NAMES[now.getMonth()]} ${currentYear}`;
  }

  // Month + Day with year: "Nov 6, 2024" or "Jul 11, 2025"
  const fullDateMatch = clean.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},\s*(20\d{2})/i);
  if (fullDateMatch) {
    const monthIdx = MONTH_NAMES.findIndex(
      (m) => m.toLowerCase() === fullDateMatch[1].slice(0, 3).toLowerCase()
    );
    const yr = parseInt(fullDateMatch[2], 10);
    if (monthIdx !== -1) {
      return `${MONTH_NAMES[monthIdx]} ${yr}`;
    }
  }

  // Month + Day without year: "Feb 7" or "Apr 27"
  const monthDayMatch = clean.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}/i);
  if (monthDayMatch) {
    const monthIdx = MONTH_NAMES.findIndex(
      (m) => m.toLowerCase() === monthDayMatch[1].slice(0, 3).toLowerCase()
    );
    if (monthIdx !== -1) {
      const yr = monthIdx > now.getMonth() ? currentYear - 1 : currentYear;
      return `${MONTH_NAMES[monthIdx]} ${yr}`;
    }
  }

  const d = new Date(clean);
  if (!isNaN(d.getTime()) && d.getFullYear() >= 2015 && d.getFullYear() <= currentYear + 1) {
    return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  }

  return `${MONTH_NAMES[now.getMonth()]} ${currentYear}`;
}

export function formatNewsDate(dateInput?: string | Date): string {
  return parseLinkedInDate(dateInput);
}

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Normalizes URL for deduplication by removing hash fragments like #author=...
 */
function getBaseLink(link?: string): string {
  if (!link) return "";
  return link.split("#author=")[0].split("?author=")[0].trim().toLowerCase();
}


/**
 * Fetch and extract OpenGraph info from a single LinkedIn post URL
 */
async function fetchPostMetadata(postUrl: string, authorName?: string): Promise<RawPost | null> {
  try {
    const res = await fetch(postUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) {
      console.warn(`Failed to fetch URL ${postUrl}: HTTP ${res.status}`);
      return null;
    }

    const html = await res.text();
    const titleMatch =
      /<meta property=["']og:title["'] content=["']([^"']+)["']/i.exec(html) ||
      /<title>([^<]+)<\/title>/i.exec(html);
    const descMatch =
      /<meta property=["']og:description["'] content=["']([^"']+)["']/i.exec(html) ||
      /<meta name=["']description["'] content=["']([^"']+)["']/i.exec(html);

    const rawTitle = titleMatch ? cleanText(titleMatch[1]) : (authorName ? `${authorName} on LinkedIn` : "Team Update on LinkedIn");
    const rawDesc = descMatch ? cleanText(descMatch[1]) : "";

    let finalLink = postUrl;
    if (authorName && !finalLink.includes("#author=")) {
      finalLink = `${finalLink}#author=${encodeURIComponent(authorName)}`;
    }

    return {
      title: rawTitle.substring(0, 100),
      description: rawDesc || "Check out our latest update on LinkedIn.",
      link: finalLink,
      date: parseLinkedInDate(),
      author: authorName,
    };
  } catch (err: any) {
    console.error(`Error scraping post ${postUrl}:`, err.message);
    return null;
  }
}


/**
 * Automates scraping team member LinkedIn posts via Playwright using an authenticated session cookie (li_at).
 * Uses a human-like browser profile and visits each member's recent activity stream.
 */
async function scrapeLinkedInTeamPosts(
  members: Array<{ name: string; linkedinUrl: string }>,
  liAtCookie: string
): Promise<RawPost[]> {
  const posts: RawPost[] = [];

  console.log("==========================================");
  console.log(`Starting Headless Scraper for ${members.length} Member(s)`);
  console.log("==========================================\n");

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 900 },
    });

    // Inject session cookie into context
    await context.addCookies([
      {
        name: "li_at",
        value: liAtCookie.trim(),
        domain: ".linkedin.com",
        path: "/",
        httpOnly: true,
        secure: true,
      },
    ]);

    const page = await context.newPage();

    for (const member of members) {
      const username = extractLinkedInUsername(member.linkedinUrl);
      if (!username) continue;

      const isCompany = member.linkedinUrl.toLowerCase().includes("/company/");
      const activityUrl = isCompany
        ? `https://www.linkedin.com/company/${encodeURIComponent(username)}/home/`
        : `https://www.linkedin.com/in/${encodeURIComponent(username)}/recent-activity/all/`;

      console.log(`- Scraping posts for "${member.name}" (${username})${isCompany ? " [Company Page]" : ""}...`);

      try {
        await page.goto(activityUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForTimeout(3500);

        // Check if session expired or blocked
        if (page.url().includes("/login") || page.url().includes("/checkpoint/")) {
          console.warn("  ⚠️ Warning: LinkedIn session cookie expired or security checkpoint encountered.");
          console.warn("  Please update the LINKEDIN_LI_AT secret in GitHub repository settings.");
          break;
        }

        const extracted = await page.evaluate((authorName) => {
          const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href*='/feed/update/urn:li:activity:']"));
          const seenHrefs = new Set();
          const results: Array<{ text: string; link: string; date?: string }> = [];

          for (const link of links) {
            if (results.length >= 5) break; // Keep up to 5 latest posts per member

            const cleanHref = link.href.split("?")[0].replace(/\/+$/, "") + "/";
            if (seenHrefs.has(cleanHref)) continue;
            seenHrefs.add(cleanHref);

            // Walk up DOM tree to find the enclosing post card container
            let cur: HTMLElement | null = link;
            let container: HTMLElement | null = null;
            for (let i = 0; i < 9; i++) {
              if (!cur.parentElement) break;
              cur = cur.parentElement;
              if (
                cur.getAttribute("role") === "listitem" ||
                cur.tagName === "LI" ||
                cur.tagName === "ARTICLE" ||
                cur.classList.contains("feed-shared-update-v2") ||
                cur.getAttribute("data-id") ||
                (cur.getAttribute("componentkey") && cur.getAttribute("componentkey")!.includes("update-card"))
              ) {
                container = cur;
                break;
              }
            }

            const target = container || link.parentElement?.parentElement?.parentElement;
            const rawText = target ? (target.innerText || target.textContent || "") : "";

            // Strip carriage returns which corrupt Windows terminal output
            const cleanRaw = rawText.replace(/\r/g, "");
            const lines = cleanRaw.split("\n").map((l) => l.trim()).filter(Boolean);

            const contentLines: string[] = [];
            let dateFound = "";
            let datePassed = false;

            for (const line of lines) {
              if (
                line === "Feed post" ||
                line.startsWith("•") ||
                line === "You" ||
                line.includes("reposted this")
              ) {
                continue;
              }

              // 1. Before finding date: check if this is the publication date line
              if (!datePassed) {
                const cleanedDate = line.replace(/•.*$/, "").replace(/\bedited\b/i, "").trim();
                const isDate =
                  /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(,\s*\d{4})?/i.test(cleanedDate) ||
                  /^\d+\s*([whdmy]|mo|yr)\b/i.test(cleanedDate) ||
                  /^(yesterday|today|just now)$/i.test(cleanedDate) ||
                  (/\b20\d{2}\b/.test(cleanedDate) && cleanedDate.length < 25);

                if (isDate) {
                  dateFound = line;
                  datePassed = true;
                }
                // Skip everything before the date line (author name, network degree, headline/job title)
                continue;
              }

              // 2. After date: skip action/follow buttons
              if (/^(Follow|\+\s*Follow|Following|Connect|Join now|Sign in|View analytics|Like|Comment|Repost|Send)$/i.test(line)) {
                continue;
              }

              // 3. Stop collecting if footer badges or reaction counts are reached
              if (
                /^(Starting a new position|Celebrating a new certification|Open to work|Hiring)$/i.test(line) ||
                /^\d+[\d,\.\s]*\s*(reactions?|impressions?|comments?|reposts?)?$/i.test(line) ||
                /^(reactions?|impressions?|comments?|reposts?)$/i.test(line)
              ) {
                if (contentLines.length > 0) break;
                continue;
              }

              // 4. Genuine post content line
              contentLines.push(line.replace(/…\s*more$/, "").trim());
            }

            // Fallback if date line was not strictly recognized
            if (contentLines.length === 0 && lines.length > 0) {
              for (const line of lines) {
                if (
                  line.length > 50 &&
                  !line.includes("PhD Researcher") &&
                  !line.includes("Postdoctoral Researcher") &&
                  !line.includes("Consulting") &&
                  !line.includes("Feed post")
                ) {
                  contentLines.push(line.replace(/…\s*more$/, "").trim());
                }
              }
            }

            const cleanContent = contentLines.join("\n").trim();
            if (cleanContent.length > 10) {
              results.push({
                link: cleanHref,
                text: cleanContent,
                date: dateFound,
              });
            }
          }

          return results;
        }, member.name);

        console.log(`  ✓ Found ${extracted.length} post(s) for ${member.name}.`);

        for (const item of extracted) {
          const lines = item.text
            .split("\n")
            .map((l) => l.trim())
            .filter((l) => l.length > 5);

          // Find first line that isn't a simple greeting
          let firstMeaningfulLine =
            lines.find((l) => !/^(hello|hi|dear|greetings)[\s,\.!]*$/i.test(l)) || lines[0] || `${member.name} on LinkedIn`;

          // If it still starts with greeting like "Hello everyone,", take next line if long enough
          if (/^(hello|hi|dear|greetings)/i.test(firstMeaningfulLine) && lines.length > 1 && lines[1].length > 15) {
            firstMeaningfulLine = lines[1];
          }

          // If line ends with a colon (e.g. "New paper from InSilico Vida group is out:"), append the next line
          if (firstMeaningfulLine.endsWith(":") && lines.length > 1 && lines[1].length > 10) {
            firstMeaningfulLine = `${firstMeaningfulLine} ${lines[1]}`;
          }

          const title =
            firstMeaningfulLine.length > 85
              ? firstMeaningfulLine.substring(0, 82) + "..."
              : firstMeaningfulLine;

          let finalLink = item.link || member.linkedinUrl;
          if (!finalLink.includes("#author=")) {
            finalLink = `${finalLink}#author=${encodeURIComponent(member.name)}`;
          }

          posts.push({
            title,
            description: item.text,
            link: finalLink,
            date: parseLinkedInDate(item.date),
            author: member.name,
          });
        }
      } catch (err: any) {
        console.warn(`  Could not scrape posts for ${member.name}:`, err.message);
      }

      // 2s pause between profiles to avoid rate limits
      await page.waitForTimeout(2000);
    }
  } catch (err: any) {
    console.error("Headless scraper error:", err.message);
  } finally {
    if (browser) await browser.close();
  }

  return posts;
}

async function main() {
  console.log("==========================================");
  console.log("   InSilicoVida Multi-Person LinkedIn Sync");
  console.log("==========================================\n");

  // 0. Auto-clean corrupted legacy items (e.g. title "Follow", "Feb 2001", or headline as title)
  try {
    const { data: badNews } = await supabase
      .from("news")
      .select("id, title, date")
      .or("title.eq.Follow,date.eq.Feb 2001,title.ilike.Postdoctoral Researcher I IIT%");

    if (badNews && badNews.length > 0) {
      console.log(`Cleaning up ${badNews.length} corrupted legacy news item(s)...`);
      for (const bad of badNews) {
        await supabase.from("news").delete().eq("id", bad.id);
        console.log(`  ✓ Removed bad record ID ${bad.id} ("${bad.title}")`);
      }
    }
  } catch (err: any) {
    console.warn("Legacy cleanup check skipped:", err.message);
  }

  const postsToProcess: RawPost[] = [];

  // 1. Automated Headless Scraper for Team Members if LINKEDIN_LI_AT is provided
  const liAtCookie = process.env.LINKEDIN_LI_AT;
  if (liAtCookie && liAtCookie.trim()) {
    try {
      const { data: dbMembers } = await supabase
        .from("team_members")
        .select("name, links");

      const memberMap = new Map<string, { name: string; linkedinUrl: string }>();

      // InSilico Vida official company profile
      const companyUrl =
        process.env.LINKEDIN_COMPANY_URL ||
        "https://www.linkedin.com/company/insilico-vida/home/";

      memberMap.set("insilico vida", {
        name: "InSilico Vida",
        linkedinUrl: companyUrl.trim(),
      });

      // Merge local fallback teamMembers and Supabase team_members
      for (const m of teamMembers) {
        if (m.links?.LinkedIn && typeof m.links.LinkedIn === "string" && m.links.LinkedIn.trim()) {
          memberMap.set(m.name.toLowerCase(), { name: m.name, linkedinUrl: m.links.LinkedIn.trim() });
        }
      }
      for (const m of dbMembers || []) {
        if (m.links?.LinkedIn && typeof m.links.LinkedIn === "string" && m.links.LinkedIn.trim()) {
          memberMap.set(m.name.toLowerCase(), { name: m.name, linkedinUrl: m.links.LinkedIn.trim() });
        }
      }

      const membersToScrape = Array.from(memberMap.values());
      if (membersToScrape.length > 0) {
        const scrapedPosts = await scrapeLinkedInTeamPosts(membersToScrape, liAtCookie);
        postsToProcess.push(...scrapedPosts);
      }
    } catch (err: any) {
      console.error("Error during automated member scraping:", err.message);
    }
  } else {
    console.log("ℹ️  LINKEDIN_LI_AT session cookie not set. Skipping automated profile scraping.");
    console.log("   (Add LINKEDIN_LI_AT secret in GitHub to automatically scrape team member posts every 10 minutes)\n");
  }


  // 2. Process single post URL if provided via env
  const singlePostUrl = process.env.LINKEDIN_POST_URL;
  const singlePostAuthor = process.env.LINKEDIN_AUTHOR;

  if (singlePostUrl) {
    console.log(`Extracting single post from: ${singlePostUrl} (Author: ${singlePostAuthor || "Team Member"})...`);
    const post = await fetchPostMetadata(singlePostUrl, singlePostAuthor);
    if (post) postsToProcess.push(post);
  }

  // 4. Fallback: Parse command-line args if supplied
  const args = process.argv.slice(2);
  const urlIdx = args.indexOf("--url");
  const authorIdx = args.indexOf("--author");
  const titleIdx = args.indexOf("--title");
  const descIdx = args.indexOf("--desc");

  if (urlIdx !== -1 && args[urlIdx + 1]) {
    const cliUrl = args[urlIdx + 1];
    const cliAuthor = authorIdx !== -1 ? args[authorIdx + 1] : undefined;
    const cliTitle = titleIdx !== -1 ? args[titleIdx + 1] : (cliAuthor ? `${cliAuthor} on LinkedIn` : "LinkedIn Update");
    const cliDesc = descIdx !== -1 ? args[descIdx + 1] : "Check out our latest update on LinkedIn.";

    let finalLink = cliUrl;
    if (cliAuthor && !finalLink.includes("#author=")) {
      finalLink = `${finalLink}#author=${encodeURIComponent(cliAuthor)}`;
    }

    postsToProcess.push({
      title: cliTitle,
      description: cliDesc,
      link: finalLink,
      date: parseLinkedInDate(),
      author: cliAuthor,
    });
  }

  if (postsToProcess.length === 0) {
    console.log("No LinkedIn posts found to sync.");
    return;
  }

  // 5. Fetch existing news from Supabase for deduplication
  console.log("\nFetching existing news items from Supabase for deduplication...");
  const { data: existingNews, error: fetchErr } = await supabase
    .from("news")
    .select("id, title, link");

  if (fetchErr) {
    console.error("Failed to query existing news:", fetchErr.message);
    process.exit(1);
  }

  const existingBaseLinks = new Set(
    (existingNews || []).map((n) => getBaseLink(n.link)).filter(Boolean)
  );
  const existingTitles = new Set(
    (existingNews || []).map((n) => (n.title || "").trim().toLowerCase())
  );

  let insertedCount = 0;
  let skippedCount = 0;

  for (const post of postsToProcess) {
    const baseLinkKey = getBaseLink(post.link);
    const titleKey = (post.title || "").trim().toLowerCase();

    // Check if already in database
    if ((baseLinkKey && existingBaseLinks.has(baseLinkKey)) || existingTitles.has(titleKey)) {
      console.log(`[SKIP] Already exists: "${post.title}" (${post.link})`);
      skippedCount++;
      continue;
    }

    console.log(`[INSERT] Adding new post for ${post.author || "Lab"}: "${post.title}"...`);
    const { error: insertErr } = await supabase.from("news").insert([
      {
        date: post.date || parseLinkedInDate(),
        title: post.title,
        description: post.description,
        link: post.link || undefined,
      },
    ]);

    if (insertErr) {
      console.error(`  Error inserting: ${insertErr.message}`);
    } else {
      console.log(`  ✓ Successfully added.`);
      insertedCount++;
      if (baseLinkKey) existingBaseLinks.add(baseLinkKey);
      existingTitles.add(titleKey);
    }
  }

  console.log("\n==========================================");
  console.log(`Sync Complete!`);
  console.log(`Inserted: ${insertedCount} new news items.`);
  console.log(`Skipped:  ${skippedCount} existing items.`);
  console.log("==========================================");
}

main().catch((err) => {
  console.error("Fatal error during sync:", err);
  process.exit(1);
});
