import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert a snake_case string to title case (Normal Word Like This)
 * @param snakeCase The snake_case string to convert
 * @returns The converted title case string
 */
export function snakeCaseToTitleCase(snakeCase: string): string {
  return snakeCase.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
