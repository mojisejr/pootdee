/**
 * Zod Validation Schemas for Save Operations
 * Provides type-safe validation for phrase saving functionality
 */

import { z } from "zod";

// Base validation constants
const MIN_PHRASE_LENGTH = 1;
const MAX_PHRASE_LENGTH = 1000;
const MIN_TRANSLATION_LENGTH = 0;
const MAX_TRANSLATION_LENGTH = 1000;
const MAX_CONTEXT_LENGTH = 500;

// Main validation schema for save input
export const SaveInputSchema = z.object({
  englishPhrase: z
    .string()
    .max(
      MAX_PHRASE_LENGTH,
      `English phrase must be less than ${MAX_PHRASE_LENGTH} characters`
    )
    .trim()
    .optional(),

  userTranslation: z
    .string()
    .max(
      MAX_TRANSLATION_LENGTH,
      `Translation must be less than ${MAX_TRANSLATION_LENGTH} characters`
    )
    .trim()
    .optional(),

  context: z
    .string()
    .max(
      MAX_CONTEXT_LENGTH,
      `Context must be less than ${MAX_CONTEXT_LENGTH} characters`
    )
    .trim()
    .optional(),
}).refine(
  (data) => {
    // At least one of englishPhrase or userTranslation must be provided and non-empty
    const hasEnglishPhrase = data.englishPhrase && data.englishPhrase.trim().length > 0;
    const hasUserTranslation = data.userTranslation && data.userTranslation.trim().length > 0;
    return hasEnglishPhrase || hasUserTranslation;
  },
  {
    message: "At least one field (English phrase or translation) must be provided",
    path: ["englishPhrase"], // This will be the primary error path
  }
);

// Type inference from schema
export type SaveInput = z.infer<typeof SaveInputSchema>;

// Validation result types
export interface SaveValidationSuccess {
  success: true;
  data: SaveInput;
}

export interface SaveValidationError {
  success: false;
  error: {
    message: string;
    issues: Array<{
      field: string;
      message: string;
    }>;
  };
}

export type SaveValidationResult = SaveValidationSuccess | SaveValidationError;

// Helper function for safe validation
export function validateSaveInput(input: unknown): SaveValidationResult {
  try {
    const result = SaveInputSchema.safeParse(input);

    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    }

    return {
      success: false,
      error: {
        message: "Validation failed",
        issues: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: "Unexpected validation error",
        issues: [
          {
            field: "unknown",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ],
      },
    };
  }
}

// Helper function for strict validation (throws on error)
export function parseAndValidateSaveInput(input: unknown): SaveInput {
  return SaveInputSchema.parse(input);
}

// Helper function to check if input is valid without parsing
export function isSaveInputValid(input: unknown): boolean {
  return SaveInputSchema.safeParse(input).success;
}

// Helper function to get validation errors as formatted strings
export function getSaveInputErrors(input: unknown): string[] {
  const result = SaveInputSchema.safeParse(input);

  if (result.success) {
    return [];
  }

  return result.error.issues.map((issue) => {
    const field = issue.path.join(".");
    return field ? `${field}: ${issue.message}` : issue.message;
  });
}

// Export validation constants for use in components
export const VALIDATION_CONSTANTS = {
  MIN_PHRASE_LENGTH,
  MAX_PHRASE_LENGTH,
  MIN_TRANSLATION_LENGTH,
  MAX_TRANSLATION_LENGTH,
  MAX_CONTEXT_LENGTH,
} as const;
