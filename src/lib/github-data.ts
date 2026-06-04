/**
 * Service to fetch and manage recipe data from GitHub.
 */

const GITHUB_JSON_URL = 'https://raw.githubusercontent.com/thisiskarthisk/recipesData/refs/heads/main/recipes_data.json';

export interface Recipe {
  sr_no: number;
  title: string;
  description: string;
  ingredients: string[];
  instructions: Record<string, string>;
  cooking_time: number;
  servings: string | null;
  ratings: {
    rating: number;
    count: number;
  } | null;
  tags: {
    type?: string[];
    cuisine?: string[];
    ingredient?: string[];
    meal?: string[];
    'special-consideration'?: string[];
    'simple-cooking'?: string[];
    technique?: string[];
    source?: string[];
  };
  publish_date: string;
  image_filename: string | null;
}

let cachedRecipes: Recipe[] | null = null;

export const fetchAllRecipes = async (forceRefresh = false): Promise<Recipe[]> => {
  if (cachedRecipes && !forceRefresh) {
    return cachedRecipes;
  }

  try {
    console.log('[GITHUB DATA] Fetching recipes from GitHub...');
    const response = await fetch(GITHUB_JSON_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch recipes: ${response.statusText}`);
    }
    const data = await response.json();
    cachedRecipes = data;
    console.log(`[GITHUB DATA] Successfully loaded ${data.length} recipes.`);
    return data;
  } catch (error) {
    console.error('[GITHUB DATA] Error fetching recipes:', error);
    return [];
  }
};

export const getRecipeBySrNo = async (sr_no: number | string): Promise<Recipe | null> => {
  const recipes = await fetchAllRecipes();
  const targetId = typeof sr_no === 'string' ? parseInt(sr_no, 10) : sr_no;
  return recipes.find(r => r.sr_no === targetId) || null;
};

export const searchRecipes = async (query: string): Promise<Recipe[]> => {
  const recipes = await fetchAllRecipes();
  const lowerQuery = query.toLowerCase();
  return recipes.filter(r => 
    r.title.toLowerCase().includes(lowerQuery) ||
    r.description.toLowerCase().includes(lowerQuery) ||
    r.tags.cuisine?.some(c => c.toLowerCase().includes(lowerQuery)) ||
    r.tags.type?.some(t => t.toLowerCase().includes(lowerQuery))
  );
};
