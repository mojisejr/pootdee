/**
 * Custom React Hook for Phrase Saving Operations
 * Handles validation, state management, and API calls for saving phrases
 */

import { useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  SaveInput,
  validateSaveInput,
  SaveValidationResult,
  SaveValidationError,
} from "@/interfaces/save";

// Hook state interface
interface UseSavePhraseState {
  isSaving: boolean;
  error: string | null;
  validationErrors: SaveValidationError["error"] | null;
  lastSavedData: SaveInput | null;
}

// Hook return interface
interface UseSavePhraseReturn {
  // State
  isSaving: boolean;
  error: string | null;
  validationErrors: SaveValidationError["error"] | null;
  lastSavedData: SaveInput | null;

  // Actions
  savePhrase: (input: unknown) => Promise<boolean>;
  clearError: () => void;
  clearValidationErrors: () => void;
  reset: () => void;
}

// Simulated API response interface
interface SaveApiResponse {
  success: boolean;
  data?: {
    id: string;
    message: string;
  };
  error?: string;
}

/**
 * Custom hook for saving phrases with validation and state management
 *
 * Features:
 * - Input validation using Zod schema
 * - Loading state management
 * - Error handling for validation and API errors
 * - User authentication integration
 * - Simulated API call (Phase 4 requirement)
 *
 * @returns Hook interface with state and actions
 */
export function useSavePhrase(): UseSavePhraseReturn {
  const { user, isLoaded } = useUser();

  const [state, setState] = useState<UseSavePhraseState>({
    isSaving: false,
    error: null,
    validationErrors: null,
    lastSavedData: null,
  });

  /**
   * Simulates API call to save phrase
   * In Phase 4, this is a mock implementation
   * Future phases will integrate with actual Sanity backend
   */
  const simulateSaveApi = useCallback(
    async (): Promise<SaveApiResponse> => {
      // Simulate network delay
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 1000)
      );

      // Simulate occasional API errors for testing
      if (Math.random() < 0.1) {
        // 10% chance of simulated error
        return {
          success: false,
          error: "Simulated API error - please try again",
        };
      }

      // Simulate successful save
      return {
        success: true,
        data: {
          id: `phrase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          message: "Phrase saved successfully!",
        },
      };
    },
    []
  );

  /**
   * Main save function with validation and error handling
   */
  const savePhrase = useCallback(
    async (input: unknown): Promise<boolean> => {
      // Check if user is authenticated
      if (!isLoaded) {
        setState((prev) => ({
          ...prev,
          error: "Authentication is loading, please wait...",
        }));
        return false;
      }

      if (!user) {
        setState((prev) => ({
          ...prev,
          error: "You must be signed in to save phrases",
        }));
        return false;
      }

      // Clear previous errors
      setState((prev) => ({
        ...prev,
        error: null,
        validationErrors: null,
        isSaving: true,
      }));

      try {
        // Validate input
        const validationResult: SaveValidationResult = validateSaveInput(input);

        console.log("DEBUG: Validation result:", validationResult);

        if (!validationResult.success) {
          setState((prev) => ({
            ...prev,
            isSaving: false,
            validationErrors: validationResult.error,
          }));
          return false;
        }

        // Add userId to validated data
        const saveData: SaveInput = {
          ...validationResult.data,
          // Note: userId will be handled server-side in actual implementation
          // For Phase 4, we're just validating the client-side data structure
        };

        // Simulate API call
        const apiResponse = await simulateSaveApi();

        if (!apiResponse.success) {
          setState((prev) => ({
            ...prev,
            isSaving: false,
            error: apiResponse.error || "Failed to save phrase",
          }));
          return false;
        }

        // Success
        setState((prev) => ({
          ...prev,
          isSaving: false,
          lastSavedData: saveData,
          error: null,
          validationErrors: null,
        }));

        console.log("INFO: Phrase saved successfully", {
          phraseId: apiResponse.data?.id,
          userId: user.id,
          englishPhrase: saveData.englishPhrase ? saveData.englishPhrase.substring(0, 50) + "..." : "N/A",
          userTranslation: saveData.userTranslation ? saveData.userTranslation.substring(0, 50) + "..." : "N/A",
          timestamp: new Date().toISOString(),
        });

        return true;
      } catch (error) {
        console.error("ERROR: Unexpected error during phrase save:", error);

        setState((prev) => ({
          ...prev,
          isSaving: false,
          error: "An unexpected error occurred while saving",
        }));

        return false;
      }
    },
    [user, isLoaded, simulateSaveApi]
  );

  /**
   * Clear general error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  /**
   * Clear validation errors
   */
  const clearValidationErrors = useCallback(() => {
    setState((prev) => ({
      ...prev,
      validationErrors: null,
    }));
  }, []);

  /**
   * Reset all state to initial values
   */
  const reset = useCallback(() => {
    setState({
      isSaving: false,
      error: null,
      validationErrors: null,
      lastSavedData: null,
    });
  }, []);

  return {
    // State
    isSaving: state.isSaving,
    error: state.error,
    validationErrors: state.validationErrors,
    lastSavedData: state.lastSavedData,

    // Actions
    savePhrase,
    clearError,
    clearValidationErrors,
    reset,
  };
}
