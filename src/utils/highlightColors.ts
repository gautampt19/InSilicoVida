/**
 * Light spectrum color palette for highlighting technical terms
 * Each color is a pastel/light shade that's readable and visually appealing
 */
export const HIGHLIGHT_COLORS = [
  // Teals (primary family)
  { text: "hsl(168, 76%, 36%)", bg: "hsl(168, 76%, 36%, 0.45)" },
  { text: "hsl(172, 66%, 40%)", bg: "hsl(172, 66%, 40%, 0.45)" },
  { text: "hsl(175, 70%, 38%)", bg: "hsl(175, 70%, 38%, 0.45)" },
  
  // Emeralds (accent family)
  { text: "hsl(160, 84%, 32%)", bg: "hsl(160, 84%, 32%, 0.45)" },
  { text: "hsl(152, 69%, 38%)", bg: "hsl(152, 69%, 38%, 0.45)" },
  
  // Deep Navy / Slate blues
  { text: "hsl(217, 50%, 42%)", bg: "hsl(217, 50%, 42%, 0.45)" },
  { text: "hsl(210, 55%, 48%)", bg: "hsl(210, 55%, 48%, 0.45)" },
  
  // Ocean blues (complementary)
  { text: "hsl(199, 89%, 42%)", bg: "hsl(199, 89%, 42%, 0.45)" },
  { text: "hsl(190, 75%, 44%)", bg: "hsl(190, 75%, 44%, 0.45)" },
  
  // Warm amber (complementary contrast)
  { text: "hsl(43, 80%, 48%)", bg: "hsl(43, 80%, 48%, 0.45)" },
  { text: "hsl(35, 85%, 52%)", bg: "hsl(35, 85%, 52%, 0.45)" },
  
  // Rose / Coral (complementary pop)
  { text: "hsl(350, 65%, 50%)", bg: "hsl(350, 65%, 50%, 0.45)" },
  { text: "hsl(340, 70%, 55%)", bg: "hsl(340, 70%, 55%, 0.45)" },
  
  // Soft violet (tertiary)
  { text: "hsl(270, 55%, 55%)", bg: "hsl(270, 55%, 55%, 0.45)" },
  { text: "hsl(262, 60%, 52%)", bg: "hsl(262, 60%, 52%, 0.45)" },
  
  // Greens (natural)
  { text: "hsl(142, 60%, 40%)", bg: "hsl(142, 60%, 40%, 0.45)" },
  { text: "hsl(145, 55%, 45%)", bg: "hsl(145, 55%, 45%, 0.45)" },
];

/**
 * Get a random color from the highlight palette
 * Uses a simple hash function to ensure the same term always gets the same color
 */
export function getHighlightColor(term: string): { text: string; bg: string } {
  // Simple hash function to get consistent color for same term
  let hash = 0;
  for (let i = 0; i < term.length; i++) {
    hash = term.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % HIGHLIGHT_COLORS.length;
  return HIGHLIGHT_COLORS[index];
}

/**
 * Get a random color (truly random, not based on term)
 */
export function getRandomHighlightColor(): { text: string; bg: string } {
  const index = Math.floor(Math.random() * HIGHLIGHT_COLORS.length);
  return HIGHLIGHT_COLORS[index];
}

