/**
 * Extract YouTube Video ID from various URL formats
 * Handles:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://youtu.be/VIDEO_ID?si=...
 * - https://youtube.com/shorts/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
export function getYouTubeId(url: string | null | undefined): string {
  if (!url) return '';
  
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return '';

  // Regex for various YouTube formats
  const regexes = [
    /[?&]v=([^&#\b]+)/,           // Standard: youtube.com/watch?v=ID
    /youtu\.be\/([^?&#\b]+)/,     // Shortened: youtu.be/ID
    /shorts\/([^?&#\b]+)/,        // Shorts: youtube.com/shorts/ID
    /embed\/([^?&#\b]+)/,         // Embed: youtube.com/embed/ID
    /v\/([^?&#\b]+)/,             // Older: youtube.com/v/ID
  ];

  for (const regex of regexes) {
    const match = trimmedUrl.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  return '';
}

/**
 * Normalizes a YouTube URL to a standard watch format
 */
export function normalizeYouTubeUrl(url: string | null | undefined): string {
  const id = getYouTubeId(url);
  if (!id) return url || '';
  return `https://www.youtube.com/watch?v=${id}`;
}
