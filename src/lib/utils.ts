import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes any external web URL by removing malformed prefixes (e.g. "https://www.https//"),
 * trimming whitespace, and ensuring it starts with "https://".
 */
export function normalizeExternalUrl(url?: string): string {
  if (!url) return "";
  let trimmed = url.trim();
  if (!trimmed) return "";

  // Strip duplicate protocol or malformed prefixes
  trimmed = trimmed.replace(/^https?:\/\/(?:www\.)?(?:https?:\/\/|https?:\/|https?:\/\/)+/i, "https://");
  trimmed = trimmed.replace(/^https?:\/\/(?:www\.)?https?:\/\//i, "https://");
  trimmed = trimmed.replace(/^https?:\/\/(?:www\.)?https?\/\//i, "https://");
  trimmed = trimmed.replace(/^https?\/\//i, "https://");

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed.replace(/^\/+/, "")}`;
}

/**
 * Normalizes LinkedIn URLs and safely handles:
 * - "https://www.linkedin.com/in/username"
 * - "www.linkedin.com/in/username"
 * - "linkedin.com/in/username"
 * - "in/username"
 * - "username"
 * - Accidental malformed double prefixes like "https://www.https//www.linkedin.com/in/..."
 */
export function formatLinkedInUrl(raw?: string): string {
  if (!raw) return "";
  let clean = raw.trim();
  if (!clean) return "";

  clean = clean.replace(/^https?:\/\/(?:www\.)?(?:https?:\/\/|https?:\/|https?:\/\/)+/i, "https://");
  clean = clean.replace(/^https?:\/\/(?:www\.)?https?:\/\//i, "https://");
  clean = clean.replace(/^https?:\/\/(?:www\.)?https?\/\//i, "https://");
  clean = clean.replace(/^https?\/\//i, "https://");

  if (/^https?:\/\//i.test(clean)) {
    return clean;
  }
  if (clean.startsWith("www.linkedin.com")) {
    return `https://${clean}`;
  }
  if (clean.startsWith("linkedin.com")) {
    return `https://www.${clean}`;
  }
  if (clean.startsWith("in/")) {
    return `https://www.linkedin.com/${clean}`;
  }
  if (clean.startsWith("www.")) {
    return `https://${clean}`;
  }
  return `https://www.linkedin.com/in/${clean}`;
}

/**
 * Extracts a clean LinkedIn username/handle or company slug from a LinkedIn URL or identifier.
 * Examples:
 * - "https://www.linkedin.com/in/rajesh-kumar-pathak-8212499a" -> "rajesh-kumar-pathak-8212499a"
 * - "www.linkedin.com/in/deepika-deepika-753261103/" -> "deepika-deepika-753261103"
 * - "linkedin.com/in/someone?param=1" -> "someone"
 * - "rajesh-kumar-pathak-8212499a" -> "rajesh-kumar-pathak-8212499a"
 */
export function extractLinkedInUsername(urlOrHandle?: string): string {
  if (!urlOrHandle) return "";
  let clean = urlOrHandle.trim().replace(/\/+$/, "");
  clean = clean.split("?")[0].split("#")[0];
  clean = clean.replace(/^(?:https?:\/\/(?:www\.)?)?(?:https?:\/\/|https?:\/|https?\/\/)+/i, "");

  const inMatch = clean.match(/(?:linkedin\.com\/in\/|in\/)([^/?#]+)/i);
  if (inMatch) return inMatch[1];

  const compMatch = clean.match(/(?:linkedin\.com\/company\/|company\/)([^/?#]+)/i);
  if (compMatch) return compMatch[1];

  return clean.replace(/^@/, "").replace(/^www\./, "");
}

/**
 * Automatically creates an RSS feed URL from a LinkedIn profile URL or username.
 * Supports configurable template via environment variable VITE_LINKEDIN_RSS_TEMPLATE,
 * defaulting to the standard RSS bridge route:
 * https://rsshub.app/linkedin/post/{username}
 */
export function generateLinkedInRssUrl(linkedinUrlOrHandle?: string, customTemplate?: string): string {
  const username = extractLinkedInUsername(linkedinUrlOrHandle);
  if (!username) return "";

  const template =
    customTemplate ||
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_LINKEDIN_RSS_TEMPLATE) ||
    (typeof process !== "undefined" && process.env?.VITE_LINKEDIN_RSS_TEMPLATE);

  if (template) {
    return template.replace("{username}", encodeURIComponent(username));
  }

  // RSSHub officially supports company posts route: /linkedin/company/:company_id/posts
  if (linkedinUrlOrHandle?.toLowerCase().includes("/company/")) {
    return `https://rsshub.app/linkedin/company/${encodeURIComponent(username)}/posts`;
  }

  // For personal profiles (/in/), public RSSHub does not host an open route due to LinkedIn login walls.
  // We return empty so users use RSS.app/FetchRSS generated feeds or the direct "Add LinkedIn Post" feature.
  return "";
}


/**
 * Extracts a standard 16-character ORCID ID (e.g. "0000-0003-3835-8430")
 * whether raw ID or full URL is provided.
 */
export function extractOrcidId(raw?: string): string {
  if (!raw) return "";
  const match = raw.match(/\d{4}-\d{4}-\d{4}-[\dX]{4}/i);
  return match ? match[0] : raw.trim();
}

/**
 * Formats an ORCID link as "https://orcid.org/0000-0000-0000-0000".
 */
export function formatOrcidUrl(raw?: string): string {
  const id = extractOrcidId(raw);
  if (!id) return "";
  return `https://orcid.org/${id}`;
}

/**
 * Formats a GitHub profile URL from username or URL.
 */
export function formatGithubUrl(raw?: string): string {
  if (!raw) return "";
  const clean = raw.trim();
  if (!clean) return "";
  if (/^https?:\/\//i.test(clean)) return clean;
  if (clean.startsWith("github.com/")) return `https://${clean}`;
  return `https://github.com/${clean.replace(/^@/, "")}`;
}

/**
 * Formats a Twitter / X profile URL from handle or URL.
 */
export function formatTwitterUrl(raw?: string): string {
  if (!raw) return "";
  const clean = raw.trim();
  if (!clean) return "";
  if (/^https?:\/\//i.test(clean)) return clean;
  if (clean.startsWith("twitter.com/") || clean.startsWith("x.com/")) return `https://${clean}`;
  return `https://twitter.com/${clean.replace(/^@/, "")}`;
}

