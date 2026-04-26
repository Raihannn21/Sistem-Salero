import { Ingredient, RecipeItem } from "@prisma/client";

/**
 * Calculates the cost of a single recipe item based on ingredient unit conversion.
 * Logic: (Purchase Price / Yield) * Quantity used in recipe
 */
export function calculateRecipeItemCost(recipe: RecipeItem & { ingredient: Ingredient }) {
  const { ingredient, quantity } = recipe;
  const yieldFactor = ingredient.recipeYield || 1;
  const pricePerRecipeUnit = ingredient.pricePerUnit / yieldFactor;
  return pricePerRecipeUnit * quantity;
}

/**
 * Calculates total HPP for a menu item
 */
export function calculateMenuHPP(recipes: (RecipeItem & { ingredient: Ingredient })[]) {
  return recipes.reduce((total, recipe) => {
    return total + calculateRecipeItemCost(recipe);
  }, 0);
}
