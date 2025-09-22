import { describe, it, expect } from 'vitest';
import { 
  AnalyzeRequest, 
  AnalyzeRequestSchema, 
  ErrorType,
  AnalyzeResponseSchema 
} from '../../src/interfaces/langchain';

/**
 * Integration tests for analyze functionality
 * Tests the core validation and interface logic without Next.js dependencies
 */
describe('Analyze API Logic', () => {
  
  describe('Request Validation', () => {
    it('should validate correct request structure', () => {
      const validRequest: AnalyzeRequest = {
        englishPhrase: "This is a test sentence.",
        userTranslation: "นี่คือประโยคทดสอบ",
        context: "Testing context"
      };

      const result = AnalyzeRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.englishPhrase).toBe(validRequest.englishPhrase);
        expect(result.data.userTranslation).toBe(validRequest.userTranslation);
        expect(result.data.context).toBe(validRequest.context);
      }
    });

    it('should validate minimal valid request', () => {
      const minimalRequest: AnalyzeRequest = {
        englishPhrase: "Test sentence"
      };

      const result = AnalyzeRequestSchema.safeParse(minimalRequest);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.englishPhrase).toBe(minimalRequest.englishPhrase);
        expect(result.data.userTranslation).toBe(undefined);
        expect(result.data.context).toBe(undefined);
      }
    });

    it('should reject empty english phrase', () => {
      const invalidRequest = {
        englishPhrase: "",
        userTranslation: "Some translation"
      };

      const result = AnalyzeRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.issues;
        expect(errors.some((error: any) =>
          error.path.includes('englishPhrase')
        )).toBe(true);
      }
    });

    it('should reject overly long english phrase', () => {
      const longPhrase = "a".repeat(501); // Exceeds 500 character limit
      const invalidRequest = {
        englishPhrase: longPhrase
      };

      const result = AnalyzeRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.issues;
        expect(errors.some((error: any) =>
          error.path.includes('englishPhrase')
        )).toBe(true);
      }
    });

    it('should reject completely empty request', () => {
      const emptyRequest = {};

      const result = AnalyzeRequestSchema.safeParse(emptyRequest);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.issues;
        expect(errors.some((error: any) =>
          error.path.includes('englishPhrase')
        )).toBe(true);
      }
    });
  });

  describe('Response Structure Validation', () => {
    it('should validate successful response structure', () => {
      const successResponse = {
        success: true,
        data: {
          correctness: "correct" as const,
          meaning: "This is a test sentence meaning",
          alternatives: ["Alternative 1", "Alternative 2"],
          errors: ""
        }
      };

      const result = AnalyzeResponseSchema.safeParse(successResponse);
      expect(result.success).toBe(true);
    });

    it('should validate error response structure', () => {
      const errorResponse = {
        success: false,
        error: {
          type: ErrorType.VALIDATION,
          message: "Validation failed",
          userMessage: "Please check your input",
          retryable: false,
          suggestedAction: "Fix the input and try again"
        }
      };

      const result = AnalyzeResponseSchema.safeParse(errorResponse);
      expect(result.success).toBe(true);
    });

    it('should reject invalid response structure', () => {
      const invalidResponse = {
        success: "maybe", // Should be boolean
        data: {
          correctness: "invalid_value", // Should be one of the enum values
          meaning: 123, // Should be string
          alternatives: "not_an_array", // Should be array
          errors: null // Should be string
        }
      };

      const result = AnalyzeResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });

  describe('Error Type Validation', () => {
    it('should validate all error types', () => {
      const errorTypes = [
        ErrorType.VALIDATION,
        ErrorType.API_TIMEOUT,
        ErrorType.API_RATE_LIMIT,
        ErrorType.API_ERROR,
        ErrorType.NETWORK_ERROR,
        ErrorType.UNKNOWN
      ];

      errorTypes.forEach(errorType => {
        const errorResponse = {
          success: false,
          error: {
            type: errorType,
            message: "Test error",
            userMessage: "User friendly message",
            retryable: true
          }
        };

        const result = AnalyzeResponseSchema.safeParse(errorResponse);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Input Sanitization', () => {
    it('should handle special characters in english phrase', () => {
      const specialCharsRequest: AnalyzeRequest = {
        englishPhrase: "Hello! How are you? I'm fine, thanks. 😊"
      };

      const result = AnalyzeRequestSchema.safeParse(specialCharsRequest);
      expect(result.success).toBe(true);
    });

    it('should handle unicode characters in translation', () => {
      const unicodeRequest: AnalyzeRequest = {
        englishPhrase: "Hello world",
        userTranslation: "สวัสดีชาวโลก 🌍",
        context: "Greeting in Thai with emoji"
      };

      const result = AnalyzeRequestSchema.safeParse(unicodeRequest);
      expect(result.success).toBe(true);
    });

    it('should handle very long but valid context', () => {
      const longContext = "This is a very long context that describes the situation in great detail. ".repeat(5);
      const contextRequest: AnalyzeRequest = {
        englishPhrase: "Test sentence",
        context: longContext
      };

      const result = AnalyzeRequestSchema.safeParse(contextRequest);
      expect(result.success).toBe(true);
    });
  });
});