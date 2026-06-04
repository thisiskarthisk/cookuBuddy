/**
 * Utility for constructing recipe image URLs from GitHub raw content.
 */

export const getRecipeImageUrl = (filenameOrUrl: string | null) => {
  // Premium food placeholder from Unsplash
  const FALLBACK = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop';
  
  if (!filenameOrUrl) return FALLBACK;
  
  const input = filenameOrUrl.trim();
  if (input === '' || input.toLowerCase() === 'null') return FALLBACK;
  
  // If it's already a raw github URL, return it
  if (input.includes('raw.githubusercontent.com')) return input;
  
  // If it's a standard github URL with blob/tree, convert it to raw
  if (input.includes('github.com') && (input.includes('/blob/') || input.includes('/tree/'))) {
    return input
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('/blob/', '/')
      .replace('/tree/', '/');
  }
  
  // If it's just a filename, construct the URL
  const cleanFilename = input.split('/').pop() || '';
  if (!cleanFilename) return FALLBACK;
  
  // Ensure we have an extension if missing
  const finalFilename = cleanFilename.includes('.') ? cleanFilename : `${cleanFilename}.jpg`;
  
  return `https://raw.githubusercontent.com/thisiskarthisk/recipesData/main/food_images/${encodeURIComponent(
    finalFilename
  )}`;
};
