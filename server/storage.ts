import { readFileSync, writeFileSync, existsSync } from "fs";
import type { DataStructure, MealType, StatusResponse } from "@shared/schema";

const DATA_FILE = "./data.json";
const NAMES_FILE = "./names.json";
const EXPECTED_COUNT = parseInt(process.env.EXPECTED_COUNT || "70");

export interface IStorage {
  getStatus(): Promise<StatusResponse>;
  vote(name: string, meal: MealType): Promise<StatusResponse>;
  resetMeal(meal: MealType): Promise<StatusResponse>;
  resetAll(): Promise<StatusResponse>;
  getPresetNames(): Promise<string[]>;
  addName(name: string): Promise<string[]>;
  updateName(oldName: string, newName: string): Promise<string[]>;
  deleteName(name: string): Promise<string[]>;
  exportCSV(): Promise<string>;
  getBackupData(): Promise<{ names: string[]; data: DataStructure }>;
}

export class MemStorage implements IStorage {
  private loadData(): DataStructure {
    if (!existsSync(DATA_FILE)) {
      const initialData: DataStructure = {
        meals: {
          Breakfast: { eaten: [] },
          Lunch: { eaten: [] },
          Dinner: { eaten: [] },
        },
        last_reset: new Date().toISOString(),
      };
      this.saveData(initialData);
      return initialData;
    }

    const raw = readFileSync(DATA_FILE, "utf-8");
    const data: DataStructure = JSON.parse(raw);
    
    // Check if we need to reset (new day)
    const lastReset = new Date(data.last_reset);
    const now = new Date();
    
    if (
      lastReset.getDate() !== now.getDate() ||
      lastReset.getMonth() !== now.getMonth() ||
      lastReset.getFullYear() !== now.getFullYear()
    ) {
      // Reset all meals for new day
      data.meals.Breakfast.eaten = [];
      data.meals.Lunch.eaten = [];
      data.meals.Dinner.eaten = [];
      data.last_reset = now.toISOString();
      this.saveData(data);
    }
    
    return data;
  }

  private saveData(data: DataStructure): void {
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  }

  private loadNames(): string[] {
    if (!existsSync(NAMES_FILE)) {
      return [];
    }
    const raw = readFileSync(NAMES_FILE, "utf-8");
    const names: string[] = JSON.parse(raw);
    return names.filter(n => n.trim().length > 0);
  }

  async getStatus(): Promise<StatusResponse> {
    const data = this.loadData();
    const allNames = this.loadNames();

    const response: StatusResponse = {
      meals: {
        Breakfast: {
          eaten: data.meals.Breakfast.eaten,
          notEaten: allNames.filter(n => !data.meals.Breakfast.eaten.includes(n)),
          eatenCount: data.meals.Breakfast.eaten.length,
          notEatenCount: allNames.length - data.meals.Breakfast.eaten.length,
        },
        Lunch: {
          eaten: data.meals.Lunch.eaten,
          notEaten: allNames.filter(n => !data.meals.Lunch.eaten.includes(n)),
          eatenCount: data.meals.Lunch.eaten.length,
          notEatenCount: allNames.length - data.meals.Lunch.eaten.length,
        },
        Dinner: {
          eaten: data.meals.Dinner.eaten,
          notEaten: allNames.filter(n => !data.meals.Dinner.eaten.includes(n)),
          eatenCount: data.meals.Dinner.eaten.length,
          notEatenCount: allNames.length - data.meals.Dinner.eaten.length,
        },
      },
      expectedCount: EXPECTED_COUNT,
    };

    return response;
  }

  async vote(name: string, meal: MealType): Promise<StatusResponse> {
    const data = this.loadData();
    
    // Check if already voted
    if (data.meals[meal].eaten.includes(name)) {
      throw new Error(`${name} has already voted for ${meal}`);
    }

    // Add vote
    data.meals[meal].eaten.push(name);
    this.saveData(data);

    return this.getStatus();
  }

  async resetMeal(meal: MealType): Promise<StatusResponse> {
    const data = this.loadData();
    data.meals[meal].eaten = [];
    this.saveData(data);
    return this.getStatus();
  }

  async resetAll(): Promise<StatusResponse> {
    const data = this.loadData();
    data.meals.Breakfast.eaten = [];
    data.meals.Lunch.eaten = [];
    data.meals.Dinner.eaten = [];
    data.last_reset = new Date().toISOString();
    this.saveData(data);
    return this.getStatus();
  }

  async getPresetNames(): Promise<string[]> {
    return this.loadNames();
  }

  private saveNames(names: string[]): void {
    writeFileSync(NAMES_FILE, JSON.stringify(names, null, 2), "utf-8");
  }

  async addName(name: string): Promise<string[]> {
    const names = this.loadNames();
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      throw new Error("Name cannot be empty");
    }
    
    if (names.includes(trimmedName)) {
      throw new Error("Name already exists");
    }
    
    names.push(trimmedName);
    names.sort();
    this.saveNames(names);
    return names;
  }

  async updateName(oldName: string, newName: string): Promise<string[]> {
    const names = this.loadNames();
    const data = this.loadData();
    const trimmedNewName = newName.trim();
    
    if (!trimmedNewName) {
      throw new Error("Name cannot be empty");
    }
    
    const index = names.indexOf(oldName);
    if (index === -1) {
      throw new Error("Name not found");
    }
    
    if (oldName !== trimmedNewName && names.includes(trimmedNewName)) {
      throw new Error("New name already exists");
    }
    
    // Update in names list
    names[index] = trimmedNewName;
    names.sort();
    this.saveNames(names);
    
    // Update in meal data
    for (const meal of ["Breakfast", "Lunch", "Dinner"] as MealType[]) {
      const mealIndex = data.meals[meal].eaten.indexOf(oldName);
      if (mealIndex !== -1) {
        data.meals[meal].eaten[mealIndex] = trimmedNewName;
      }
    }
    this.saveData(data);
    
    return names;
  }

  async deleteName(name: string): Promise<string[]> {
    const names = this.loadNames();
    const data = this.loadData();
    
    const index = names.indexOf(name);
    if (index === -1) {
      throw new Error("Name not found");
    }
    
    // Remove from names list
    names.splice(index, 1);
    this.saveNames(names);
    
    // Remove from meal data
    for (const meal of ["Breakfast", "Lunch", "Dinner"] as MealType[]) {
      data.meals[meal].eaten = data.meals[meal].eaten.filter(n => n !== name);
    }
    this.saveData(data);
    
    return names;
  }

  async exportCSV(): Promise<string> {
    const data = this.loadData();
    const allNames = this.loadNames();

    let csv = "Name,Breakfast,Lunch,Dinner\n";

    allNames.forEach(name => {
      const breakfast = data.meals.Breakfast.eaten.includes(name) ? "✓" : "";
      const lunch = data.meals.Lunch.eaten.includes(name) ? "✓" : "";
      const dinner = data.meals.Dinner.eaten.includes(name) ? "✓" : "";
      csv += `${name},${breakfast},${lunch},${dinner}\n`;
    });

    return csv;
  }

  async getBackupData(): Promise<{ names: string[]; data: DataStructure }> {
    return {
      names: this.loadNames(),
      data: this.loadData(),
    };
  }
}

export const storage = new MemStorage();
