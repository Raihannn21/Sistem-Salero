import { MenuItem, RecipeItem, Ingredient } from "@prisma/client";

type MenuItemWithRecipes = MenuItem & {
  recipes: (RecipeItem & {
    ingredient: Ingredient;
  })[];
};

/**
 * Calculates the HPP (Cost of Goods Sold) for a menu item.
 * Formula: (Sum of (Ingredient Cost per Recipe Unit * Quantity Used)) / Recipe Yield
 */
export function calculateMenuHPP(menuItem: MenuItemWithRecipes): number {
  if (!menuItem.recipes || menuItem.recipes.length === 0) return 0;

  const totalBatchCost = menuItem.recipes.reduce((total, recipe) => {
    const { ingredient, quantity } = recipe;
    
    // Cost per recipe unit = Purchase Price / How many recipe units in one purchase unit
    // If recipeYield is 0 or not set, fallback to 1 to avoid division by zero
    const costPerRecipeUnit = ingredient.pricePerUnit / (ingredient.recipeYield || 1);
    
    return total + (costPerRecipeUnit * quantity);
  }, 0);

  // Divide the total cost of the batch by the number of portions it produces
  const yieldCount = menuItem.recipeYield || 1;
  return totalBatchCost / yieldCount;
}

export function calculateProfitMargin(basePrice: number, hpp: number): number {
  if (basePrice === 0) return 0;
  return ((basePrice - hpp) / basePrice) * 100;
}
