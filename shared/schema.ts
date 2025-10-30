import { z } from "zod";

export type MealType = "Breakfast" | "Lunch" | "Dinner";

export const mealTypes: MealType[] = ["Breakfast", "Lunch", "Dinner"];

export interface MealData {
  eaten: string[];
}

export interface MealsData {
  Breakfast: MealData;
  Lunch: MealData;
  Dinner: MealData;
}

export interface DataStructure {
  meals: MealsData;
  last_reset: string;
}

export interface StatusResponse {
  meals: {
    [key in MealType]: {
      eaten: string[];
      notEaten: string[];
      eatenCount: number;
      notEatenCount: number;
    };
  };
  expectedCount: number;
}

export const voteSchema = z.object({
  name: z.string().min(1),
  meal: z.enum(["Breakfast", "Lunch", "Dinner"]),
});

export type Vote = z.infer<typeof voteSchema>;
