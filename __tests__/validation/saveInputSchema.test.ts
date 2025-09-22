import { describe, it, expect } from 'vitest';
import { 
  SaveInput, 
  SaveInputSchema, 
  validateSaveInput,
  isSaveInputValid,
  VALIDATION_CONSTANTS
} from '../../src/interfaces/save';

/**
 * Unit tests for Save Input Validation Schema
 * Tests the Zod validation logic for phrase saving functionality
 */
describe('Save Input Validation Schema', () => {
  
  describe('SaveInputSchema - Valid Cases', () => {
    it('should validate minimal valid input with only englishPhrase', () => {
      const validInput: SaveInput = {
        englishPhrase: "Hello world",
        userTranslation: "สวัสดีโลก",
        context: "",
        difficulty: 'beginner',
        isBookmarked: false,
        tags: []
      };

      const result = SaveInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.englishPhrase).toBe(validInput.englishPhrase);
        expect(result.data.userTranslation).toBe(validInput.userTranslation);
        expect(result.data.context).toBe("");
        expect(result.data.tags).toEqual([]);
        expect(result.data.difficulty).toBe('beginner');
        expect(result.data.isBookmarked).toBe(false);
      }
    });

    it('should validate complete input with all fields', () => {
      const validInput: SaveInput = {
        englishPhrase: "How are you doing today?",
        userTranslation: "วันนี้เป็นอย่างไรบ้าง",
        context: "Casual greeting between friends",
        difficulty: 'intermediate',
        isBookmarked: true,
        tags: ["greeting", "casual", "friends"]
      };

      const result = SaveInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.englishPhrase).toBe(validInput.englishPhrase);
        expect(result.data.userTranslation).toBe(validInput.userTranslation);
        expect(result.data.context).toBe(validInput.context);
        expect(result.data.tags).toEqual(validInput.tags);
        expect(result.data.difficulty).toBe('intermediate');
        expect(result.data.isBookmarked).toBe(true);
      }
    });

    it('should validate input at maximum length limits', () => {
      const maxLengthInput: SaveInput = {
        englishPhrase: "a".repeat(VALIDATION_CONSTANTS.MAX_PHRASE_LENGTH),
        userTranslation: "ก".repeat(VALIDATION_CONSTANTS.MAX_TRANSLATION_LENGTH),
        context: "c".repeat(VALIDATION_CONSTANTS.MAX_CONTEXT_LENGTH),
        difficulty: 'advanced',
        isBookmarked: false,
        tags: Array(VALIDATION_CONSTANTS.MAX_TAGS).fill("tag")
      };

      const result = SaveInputSchema.safeParse(maxLengthInput);
      expect(result.success).toBe(true);
    });

    it('should handle optional fields with defaults', () => {
      const minimalInput = {
        englishPhrase: "Hello",
        userTranslation: "สวัสดี"
      };

      const result = SaveInputSchema.safeParse(minimalInput);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.difficulty).toBe('beginner'); // default
        expect(result.data.isBookmarked).toBe(false); // default
        expect(result.data.tags).toEqual([]); // default
        expect(result.data.context).toBeUndefined(); // optional
      }
    });

    it('should handle whitespace trimming correctly', () => {
      const whitespaceInput = {
        englishPhrase: "   Hello   ",
        userTranslation: "   สวัสดี   ",
        context: "   Context   ",
        tags: ["   tag1   ", "   tag2   "]
      };

      const result = SaveInputSchema.safeParse(whitespaceInput);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.englishPhrase).toBe("Hello");
        expect(result.data.userTranslation).toBe("สวัสดี");
        expect(result.data.context).toBe("Context");
        expect(result.data.tags).toEqual(["tag1", "tag2"]);
      }
    });
  });

  describe('SaveInputSchema - Invalid Cases', () => {
    it('should reject empty englishPhrase', () => {
      const invalidInput = {
        englishPhrase: "",
        userTranslation: "สวัสดี"
      };

      const result = SaveInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const phraseError = result.error.issues.find(issue => 
          issue.path.includes('englishPhrase')
        );
        expect(phraseError).toBeDefined();
      }
    });

    it('should reject empty userTranslation', () => {
      const invalidInput = {
        englishPhrase: "Hello",
        userTranslation: ""
      };

      const result = SaveInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const translationError = result.error.issues.find(issue => 
          issue.path.includes('userTranslation')
        );
        expect(translationError).toBeDefined();
      }
    });

    it('should reject whitespace-only englishPhrase', () => {
      const invalidInput = {
        englishPhrase: "   ",
        userTranslation: "สวัสดี"
      };

      const result = SaveInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const phraseError = result.error.issues.find(issue => 
          issue.path.includes('englishPhrase')
        );
        expect(phraseError).toBeDefined();
        expect(phraseError?.message).toContain('cannot be empty or only whitespace');
      }
    });

    it('should reject englishPhrase exceeding maximum length', () => {
      const invalidInput: Partial<SaveInput> = {
        englishPhrase: "a".repeat(VALIDATION_CONSTANTS.MAX_PHRASE_LENGTH + 1),
        userTranslation: "สวัสดี"
      };

      const result = SaveInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const lengthError = result.error.issues.find(issue => 
          issue.path.includes('englishPhrase') && issue.code === 'too_big'
        );
        expect(lengthError).toBeDefined();
      }
    });

    it('should reject userTranslation exceeding maximum length', () => {
      const invalidInput: Partial<SaveInput> = {
        englishPhrase: "Hello",
        userTranslation: "ก".repeat(VALIDATION_CONSTANTS.MAX_TRANSLATION_LENGTH + 1)
      };

      const result = SaveInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const lengthError = result.error.issues.find(issue => 
          issue.path.includes('userTranslation') && issue.code === 'too_big'
        );
        expect(lengthError).toBeDefined();
      }
    });

    it('should reject context exceeding maximum length', () => {
      const invalidInput: Partial<SaveInput> = {
        englishPhrase: "Hello",
        userTranslation: "สวัสดี",
        context: "c".repeat(VALIDATION_CONSTANTS.MAX_CONTEXT_LENGTH + 1)
      };

      const result = SaveInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const lengthError = result.error.issues.find(issue => 
          issue.path.includes('context') && issue.code === 'too_big'
        );
        expect(lengthError).toBeDefined();
      }
    });

    it('should reject too many tags', () => {
      const invalidInput: Partial<SaveInput> = {
        englishPhrase: "Hello",
        userTranslation: "สวัสดี",
        tags: Array(VALIDATION_CONSTANTS.MAX_TAGS + 1).fill("tag")
      };

      const result = SaveInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const tagsError = result.error.issues.find(issue => 
          issue.path.includes('tags') && issue.code === 'too_big'
        );
        expect(tagsError).toBeDefined();
        expect(tagsError?.message).toContain('Maximum 10 tags allowed');
      }
    });

    it('should reject empty tags in array', () => {
      const invalidInput: Partial<SaveInput> = {
        englishPhrase: "Hello",
        userTranslation: "สวัสดี",
        tags: ["valid", "", "another"]
      };

      const result = SaveInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const tagError = result.error.issues.find(issue => 
          issue.path.includes('tags')
        );
        expect(tagError).toBeDefined();
      }
    });

    it('should reject invalid difficulty level', () => {
      const invalidInput = {
        englishPhrase: "Hello",
        userTranslation: "สวัสดี",
        difficulty: "expert" // Invalid difficulty
      };

      const result = SaveInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const difficultyError = result.error.issues.find(issue => 
          issue.path.includes('difficulty')
        );
        expect(difficultyError).toBeDefined();
      }
    });

    it('should reject input with wrong field types', () => {
      const invalidInput = {
        englishPhrase: 123, // Should be string
        userTranslation: true, // Should be string
        context: null, // Should be string
        tags: "not an array", // Should be array
        difficulty: 42, // Should be enum
        isBookmarked: "yes" // Should be boolean
      };

      const result = SaveInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const typeErrors = result.error.issues.filter(issue => 
          issue.code === 'invalid_type'
        );
        expect(typeErrors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('validateSaveInput Helper Function', () => {
    it('should return success for valid input', () => {
      const validInput: SaveInput = {
        englishPhrase: "Hello world",
        userTranslation: "สวัสดีโลก",
        context: "",
        difficulty: 'beginner',
        isBookmarked: false,
        tags: []
      };

      const result = validateSaveInput(validInput);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should return error for invalid input', () => {
      const invalidInput = {
        englishPhrase: "",
        userTranslation: ""
      };

      const result = validateSaveInput(invalidInput);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.message).toBe('Validation failed');
        expect(result.error.issues).toBeInstanceOf(Array);
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should handle unknown input gracefully', () => {
      const unknownInput = {
        randomField: "random value",
        anotherField: 123
      };

      const result = validateSaveInput(unknownInput);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('isSaveInputValid Helper Function', () => {
    it('should return true for valid input', () => {
      const validInput: SaveInput = {
        englishPhrase: "Hello world",
        userTranslation: "สวัสดีโลก",
        context: "",
        difficulty: 'beginner',
        isBookmarked: false,
        tags: []
      };

      expect(isSaveInputValid(validInput)).toBe(true);
    });

    it('should return false for invalid input', () => {
      const invalidInput = {
        englishPhrase: "",
        userTranslation: ""
      };

      expect(isSaveInputValid(invalidInput)).toBe(false);
    });

    it('should return false for malformed input', () => {
      const malformedInput = {
        englishPhrase: 123,
        userTranslation: null
      };

      expect(isSaveInputValid(malformedInput)).toBe(false);
    });
  });

  describe('Edge Cases and Special Characters', () => {
    it('should handle Thai characters correctly', () => {
      const thaiInput: SaveInput = {
        englishPhrase: "Hello, my name is John",
        userTranslation: "สวัสดีครับ ผมชื่อจอห์น",
        context: "การแนะนำตัวเอง",
        difficulty: 'beginner',
        isBookmarked: false,
        tags: ["แนะนำตัว", "ทักทาย"]
      };

      const result = SaveInputSchema.safeParse(thaiInput);
      expect(result.success).toBe(true);
    });

    it('should handle special characters and emojis', () => {
      const specialInput: SaveInput = {
        englishPhrase: "Hello! 😊 How's it going? (Great!)",
        userTranslation: "สวัสดี! 😊 เป็นอย่างไรบ้าง? (ดีมาก!)",
        context: "Casual conversation with emojis & punctuation",
        difficulty: 'intermediate',
        isBookmarked: true,
        tags: ["emoji", "punctuation", "casual"]
      };

      const result = SaveInputSchema.safeParse(specialInput);
      expect(result.success).toBe(true);
    });

    it('should handle newlines and tabs in context', () => {
      const multilineInput: SaveInput = {
        englishPhrase: "Line 1\nLine 2\tTabbed",
        userTranslation: "บรรทัด 1\nบรรทัด 2\tแท็บ",
        context: "Multi-line\ncontext with\ttabs",
        difficulty: 'advanced',
        isBookmarked: false,
        tags: ["multiline", "formatting"]
      };

      const result = SaveInputSchema.safeParse(multilineInput);
      expect(result.success).toBe(true);
    });
  });

  describe('Validation Constants', () => {
    it('should have reasonable validation constants', () => {
      expect(VALIDATION_CONSTANTS.MAX_PHRASE_LENGTH).toBeGreaterThan(0);
      expect(VALIDATION_CONSTANTS.MAX_TRANSLATION_LENGTH).toBeGreaterThan(0);
      expect(VALIDATION_CONSTANTS.MAX_CONTEXT_LENGTH).toBeGreaterThan(0);
      expect(VALIDATION_CONSTANTS.MAX_TAGS).toBeGreaterThan(0);
      
      // Ensure reasonable limits (not too small, not too large)
      expect(VALIDATION_CONSTANTS.MAX_PHRASE_LENGTH).toBeGreaterThanOrEqual(100);
      expect(VALIDATION_CONSTANTS.MAX_PHRASE_LENGTH).toBeLessThanOrEqual(10000);
      expect(VALIDATION_CONSTANTS.MAX_TAGS).toBe(10);
    });

    it('should have consistent min/max relationships', () => {
      expect(VALIDATION_CONSTANTS.MIN_PHRASE_LENGTH).toBeLessThanOrEqual(VALIDATION_CONSTANTS.MAX_PHRASE_LENGTH);
      expect(VALIDATION_CONSTANTS.MIN_TRANSLATION_LENGTH).toBeLessThanOrEqual(VALIDATION_CONSTANTS.MAX_TRANSLATION_LENGTH);
    });
  });
});