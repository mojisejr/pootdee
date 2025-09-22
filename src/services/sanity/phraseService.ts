/**
 * Phrase Database Service Layer
 * Provides CRUD operations and business logic for phrase management
 */

import { client, writeClient } from "@/sanity/lib/client";
import { createLogger } from "@/lib/logger";
import {
  GET_USER_PHRASES,
  GET_PHRASE_BY_ID,
  GET_PHRASES_BY_DIFFICULTY,
  GET_BOOKMARKED_PHRASES,
  SEARCH_PHRASES,
  GET_PHRASES_FOR_REVIEW,
  GET_USER_PHRASE_STATS,
  GET_USER_TAGS,
  validateQueryParams,
} from "@/sanity/lib/queries";
import {
  type Phrase,
  type CreatePhraseInput,
  type UpdatePhraseInput,
  type PhraseResponse,
  type PhrasesResponse,
  type UserPhraseStats,
  type BulkCreatePhraseInput,
  type BulkOperationResponse,
} from "@/interfaces/phrase";

// Create scoped logger for phrase service
const logger = createLogger("PhraseService");

/**
 * Enhanced Phrase Service Class
 * Handles all database operations for phrases with comprehensive logging and error handling
 */
export class PhraseService {
  /**
   * Create a new phrase with enhanced analysis data
   */
  static async createPhrase(input: CreatePhraseInput): Promise<PhraseResponse> {
    const startTime = Date.now();

    try {
      logger.info("Creating new phrase", {
        component: "PhraseService",
        action: "createPhrase",
        metadata: {
          userId: input.userId,
          hasAnalysisData: !!(input as any).analysisData,
          phraseLength: input.englishPhrase?.length || 0,
        },
      });

      // Validate required fields
      if (!input.englishPhrase?.trim()) {
        logger.error(
          "Phrase creation failed - missing English phrase",
          undefined,
          {
            component: "PhraseService",
            action: "createPhrase_validation",
            metadata: { userId: input.userId, error: "missing_english_phrase" },
          }
        );
        return {
          success: false,
          error: "English phrase is required",
        };
      }

      if (!input.userTranslation?.trim()) {
        logger.error(
          "Phrase creation failed - missing user translation",
          undefined,
          {
            component: "PhraseService",
            action: "createPhrase_validation",
            metadata: {
              userId: input.userId,
              error: "missing_user_translation",
            },
          }
        );
        return {
          success: false,
          error: "User translation is required",
        };
      }

      if (!input.userId?.trim()) {
        logger.error("Phrase creation failed - missing user ID", undefined, {
          component: "PhraseService",
          action: "createPhrase_validation",
          metadata: { error: "missing_user_id" },
        });
        return {
          success: false,
          error: "User ID is required",
        };
      }

      // Prepare document for creation with enhanced analysis data
      const phraseDoc = {
        _type: "phrase" as const,
        englishPhrase: input.englishPhrase.trim(),
        userTranslation: input.userTranslation.trim(),
        context: input.context?.trim() || "",
        userId: input.userId,
        tags: input.tags || [],
        difficulty: input.difficulty || ("beginner" as const),
        isBookmarked: input.isBookmarked || false,
        reviewCount: 0,
        // Enhanced analysis data from new schema
        ...((input as any).analysisData && {
          analysisData: (input as any).analysisData,
          grammarAnalysis: (input as any).grammarAnalysis,
          vocabularyAnalysis: (input as any).vocabularyAnalysis,
          contextAnalysis: (input as any).contextAnalysis,
          analysisMetadata: (input as any).analysisMetadata,
        }),
      };

      const result = await writeClient.create(phraseDoc);

      if (!result) {
        throw new Error("Failed to create phrase - invalid response");
      }

      const processingTime = Date.now() - startTime;
      logger.info("Phrase created successfully", {
        component: "PhraseService",
        action: "createPhrase_success",
        metadata: {
          phraseId: result._id,
          userId: input.userId,
          processingTime,
          hasAnalysisData: !!(input as any).analysisData,
        },
      });

      return {
        success: true,
        data: result as Phrase,
        message: "Phrase created successfully",
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      logger.error(
        "Phrase creation failed",
        error instanceof Error ? error : undefined,
        {
          component: "PhraseService",
          action: "createPhrase_error",
          metadata: {
            userId: input.userId,
            error: errorMessage,
            processingTime,
          },
        }
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get phrase by ID with enhanced logging
   */
  static async getPhraseById(
    phraseId: string,
    userId: string
  ): Promise<PhraseResponse> {
    const startTime = Date.now();

    try {
      logger.info("Fetching phrase by ID", {
        component: "PhraseService",
        action: "getPhraseById",
        metadata: { phraseId, userId },
      });

      // Validate inputs
      if (!phraseId?.trim()) {
        logger.error("Get phrase failed - missing phrase ID", undefined, {
          component: "PhraseService",
          action: "getPhraseById_validation",
          metadata: { userId, error: "missing_phrase_id" },
        });
        return {
          success: false,
          error: "Phrase ID is required",
        };
      }

      if (!userId?.trim()) {
        logger.error("Get phrase failed - missing user ID", undefined, {
          component: "PhraseService",
          action: "getPhraseById_validation",
          metadata: { phraseId, error: "missing_user_id" },
        });
        return {
          success: false,
          error: "User ID is required",
        };
      }

      const result = await client.fetch(GET_PHRASE_BY_ID, { phraseId, userId });

      if (!result) {
        logger.info("Phrase not found", {
          component: "PhraseService",
          action: "getPhraseById_not_found",
          metadata: { phraseId, userId },
        });
        return {
          success: false,
          error: "Phrase not found or access denied",
        };
      }

      const processingTime = Date.now() - startTime;
      logger.info("Phrase fetched successfully", {
        component: "PhraseService",
        action: "getPhraseById_success",
        metadata: {
          phraseId,
          userId,
          processingTime,
          hasAnalysisData: !!(result as any).analysisData,
        },
      });

      return {
        success: true,
        data: result as Phrase,
        message: "Phrase retrieved successfully",
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      logger.error(
        "Get phrase by ID failed",
        error instanceof Error ? error : undefined,
        {
          component: "PhraseService",
          action: "getPhraseById_error",
          metadata: {
            phraseId,
            userId,
            error: errorMessage,
            processingTime,
          },
        }
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Update phrase
   */
  static async updatePhrase(
    phraseId: string,
    userId: string,
    updates: UpdatePhraseInput
  ): Promise<PhraseResponse> {
    try {
      console.log("INFO: Updating phrase:", phraseId);

      // First verify ownership
      const existingPhrase = await this.getPhraseById(phraseId, userId);
      if (!existingPhrase.success) {
        return existingPhrase;
      }

      // Prepare update data
      const updateData: Record<string, unknown> = {};

      if (updates.englishPhrase !== undefined) {
        updateData.englishPhrase = updates.englishPhrase.trim();
      }
      if (updates.userTranslation !== undefined) {
        updateData.userTranslation = updates.userTranslation.trim();
      }
      if (updates.context !== undefined) {
        updateData.context = updates.context.trim();
      }
      if (updates.analysis !== undefined) {
        updateData.analysis = updates.analysis;
      }
      if (updates.tags !== undefined) {
        updateData.tags = updates.tags;
      }
      if (updates.difficulty !== undefined) {
        updateData.difficulty = updates.difficulty;
      }
      if (updates.isBookmarked !== undefined) {
        updateData.isBookmarked = updates.isBookmarked;
      }
      if (updates.reviewCount !== undefined) {
        updateData.reviewCount = updates.reviewCount;
      }
      if (updates.lastReviewedAt !== undefined) {
        updateData.lastReviewedAt = updates.lastReviewedAt;
      }

      const result = await writeClient.patch(phraseId).set(updateData).commit();

      if (!result) {
        throw new Error("Failed to update phrase - invalid response");
      }

      console.log("INFO: Phrase updated successfully:", phraseId);

      return {
        success: true,
        data: result as Phrase,
        message: "Phrase updated successfully",
      };
    } catch (error) {
      console.error("ERROR: Failed to update phrase:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Delete phrase
   */
  static async deletePhrase(
    phraseId: string,
    userId: string
  ): Promise<PhraseResponse> {
    try {
      console.log("INFO: Deleting phrase:", phraseId);

      // First verify ownership
      const existingPhrase = await this.getPhraseById(phraseId, userId);
      if (!existingPhrase.success) {
        return existingPhrase;
      }

      await writeClient.delete(phraseId);

      console.log("INFO: Phrase deleted successfully:", phraseId);

      return {
        success: true,
        message: "Phrase deleted successfully",
      };
    } catch (error) {
      console.error("ERROR: Failed to delete phrase:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Get all phrases for a user
   */
  static async getUserPhrases(userId: string): Promise<PhrasesResponse> {
    try {
      console.log("INFO: Fetching all phrases for user:", userId);

      if (!validateQueryParams({ userId })) {
        return {
          success: false,
          error: "Invalid query parameters",
        };
      }

      const phrases = await client.fetch<Phrase[]>(GET_USER_PHRASES, {
        userId,
      });

      return {
        success: true,
        data: phrases || [],
        total: phrases?.length || 0,
      };
    } catch (error) {
      console.error("ERROR: Failed to fetch user phrases:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Get phrases by difficulty
   */
  static async getPhrasesByDifficulty(
    userId: string,
    difficulty: "beginner" | "intermediate" | "advanced"
  ): Promise<PhrasesResponse> {
    try {
      console.log("INFO: Fetching phrases by difficulty:", difficulty);

      if (!validateQueryParams({ userId, difficulty })) {
        return {
          success: false,
          error: "Invalid query parameters",
        };
      }

      const phrases = await client.fetch<Phrase[]>(GET_PHRASES_BY_DIFFICULTY, {
        userId,
        difficulty,
      });

      return {
        success: true,
        data: phrases || [],
        total: phrases?.length || 0,
      };
    } catch (error) {
      console.error("ERROR: Failed to fetch phrases by difficulty:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Get bookmarked phrases
   */
  static async getBookmarkedPhrases(userId: string): Promise<PhrasesResponse> {
    try {
      console.log("INFO: Fetching bookmarked phrases for user:", userId);

      if (!validateQueryParams({ userId })) {
        return {
          success: false,
          error: "Invalid query parameters",
        };
      }

      const phrases = await client.fetch<Phrase[]>(GET_BOOKMARKED_PHRASES, {
        userId,
      });

      return {
        success: true,
        data: phrases || [],
        total: phrases?.length || 0,
      };
    } catch (error) {
      console.error("ERROR: Failed to fetch bookmarked phrases:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Search phrases
   */
  static async searchPhrases(
    userId: string,
    searchTerm: string
  ): Promise<PhrasesResponse> {
    try {
      console.log("INFO: Searching phrases with term:", searchTerm);

      if (!validateQueryParams({ userId })) {
        return {
          success: false,
          error: "Invalid query parameters",
        };
      }

      if (!searchTerm?.trim()) {
        return {
          success: false,
          error: "Search term is required",
        };
      }

      const phrases = await client.fetch<Phrase[]>(SEARCH_PHRASES, {
        userId,
        searchTerm: searchTerm.trim(),
      });

      return {
        success: true,
        data: phrases || [],
        total: phrases?.length || 0,
      };
    } catch (error) {
      console.error("ERROR: Failed to search phrases:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Get phrases for review
   */
  static async getPhrasesForReview(
    userId: string,
    limit: number = 10
  ): Promise<PhrasesResponse> {
    try {
      console.log("INFO: Fetching phrases for review, limit:", limit);

      if (!validateQueryParams({ userId, limit })) {
        return {
          success: false,
          error: "Invalid query parameters",
        };
      }

      const phrases = await client.fetch<Phrase[]>(GET_PHRASES_FOR_REVIEW, {
        userId,
        limit,
      });

      return {
        success: true,
        data: phrases || [],
        total: phrases?.length || 0,
      };
    } catch (error) {
      console.error("ERROR: Failed to fetch phrases for review:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Get user phrase statistics
   */
  static async getUserPhraseStats(
    userId: string
  ): Promise<{ success: boolean; data?: UserPhraseStats; error?: string }> {
    try {
      console.log("INFO: Fetching phrase statistics for user:", userId);

      if (!validateQueryParams({ userId })) {
        return {
          success: false,
          error: "Invalid query parameters",
        };
      }

      const stats = await client.fetch<UserPhraseStats>(GET_USER_PHRASE_STATS, {
        userId,
      });

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("ERROR: Failed to fetch phrase statistics:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Get user tags
   */
  static async getUserTags(
    userId: string
  ): Promise<{ success: boolean; data?: string[]; error?: string }> {
    try {
      console.log("INFO: Fetching user tags for user:", userId);

      if (!validateQueryParams({ userId })) {
        return {
          success: false,
          error: "Invalid query parameters",
        };
      }

      const tags = await client.fetch<string[]>(GET_USER_TAGS, { userId });

      return {
        success: true,
        data: tags || [],
      };
    } catch (error) {
      console.error("ERROR: Failed to fetch user tags:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Bulk create phrases
   */
  static async bulkCreatePhrases(
    input: BulkCreatePhraseInput
  ): Promise<BulkOperationResponse> {
    try {
      console.log("INFO: Bulk creating phrases, count:", input.phrases.length);

      const results: Phrase[] = [];
      const errors: Array<{ index: number; error: string }> = [];

      for (let i = 0; i < input.phrases.length; i++) {
        const phraseInput = input.phrases[i];
        const result = await this.createPhrase(phraseInput);

        if (result.success && result.data) {
          results.push(result.data);
        } else {
          errors.push({
            index: i,
            error: result.error || "Unknown error",
          });
        }
      }

      return {
        success: true,
        successCount: results.length,
        errorCount: errors.length,
        errors: errors.length > 0 ? errors : undefined,
        data: results,
      };
    } catch (error) {
      console.error("ERROR: Failed to bulk create phrases:", error);
      return {
        success: false,
        successCount: 0,
        errorCount: input.phrases.length,
        errors: [
          {
            index: 0,
            error:
              error instanceof Error ? error.message : "Unknown error occurred",
          },
        ],
      };
    }
  }

  /**
   * Update review status
   */
  static async updateReviewStatus(
    phraseId: string,
    userId: string,
    isCorrect: boolean
  ): Promise<PhraseResponse> {
    try {
      console.log("INFO: Updating review status for phrase:", phraseId);

      const existingPhrase = await this.getPhraseById(phraseId, userId);
      if (!existingPhrase.success || !existingPhrase.data) {
        return existingPhrase;
      }

      const currentReviewCount = existingPhrase.data.reviewCount || 0;
      const newReviewCount = isCorrect
        ? currentReviewCount + 1
        : Math.max(0, currentReviewCount - 1);

      return await this.updatePhrase(phraseId, userId, {
        reviewCount: newReviewCount,
        lastReviewedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("ERROR: Failed to update review status:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
