import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes with proper conflict resolution
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Utility function to format display names for components
 * @param name - Component name
 * @returns Formatted display name
 */
export function formatDisplayName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Utility function to generate unique IDs for form elements
 * @param prefix - Prefix for the ID
 * @returns Unique ID string
 */
export function generateId(prefix: string = "element"): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}