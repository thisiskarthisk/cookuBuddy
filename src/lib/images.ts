/**
 * Utility for constructing recipe image URLs from GitHub raw content.
 */

export const getRecipeImageUrl = (filenameOrUrl: string | null) => {
  const FALLBACK = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=600&auto=format&fit=crop';
  
  if (!filenameOrUrl) return FALLBACK;
  
  const input = filenameOrUrl.trim();
  
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
  // Ensure we have an extension if missing
  const finalFilename = cleanFilename.includes('.') ? cleanFilename : `${cleanFilename}.jpg`;
  
  return `https://raw.githubusercontent.com/thisiskarthisk/recipesData/main/food_images/${encodeURIComponent(
    finalFilename
  )}`;
};
