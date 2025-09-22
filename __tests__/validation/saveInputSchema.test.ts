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
        context: ""
      };

      const result = SaveInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.englishPhrase).toBe(validInput.englishPhrase);
        expect(result.data.userTranslation).toBe(validInput.userTranslation);
        expect(result.data.context).toBe("");
      }
    });

    it('should validate complete input with all fields', () => {
      const validInput: SaveInput = {
        englishPhrase: "How are you doing today?",
        userTranslation: "วันนี้เป็นอย่างไรบ้าง",
        context: "Casual greeting between friends"
      };

      const result = SaveInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.englishPhrase).toBe(validInput.englishPhrase);
        expect(result.data.userTranslation).toBe(validInput.userTranslation);
        expect(result.data.context).toBe(validInput.context);
      }
    });

    it('should validate input at maximum length limits', () => {
      const maxLengthInput: SaveInput = {
        englishPhrase: "a".repeat(VALIDATION_CONSTANTS.MAX_PHRASE_LENGTH),
        userTranslation: "ก".repeat(VALIDATION_CONSTANTS.MAX_TRANSLATION_LENGTH),
        context: "c".repeat(VALIDATION_CONSTANTS.MAX_CONTEXT_LENGTH)
      };

      const result = SaveInputSchema.safeParse(maxLengthInput);
      expect(result.success).toBe(true);
    });

    it('should handle optional fields', () => {
      const minimalInput = {
        englishPhrase: "Hello"
      };

      const result = SaveInputSchema.safeParse(minimalInput);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.englishPhrase).toBe("Hello");
        expect(result.data.userTranslation).toBeUndefined();
        expect(result.data.context).toBeUndefined();
      }
    });

    it('should handle whitespace trimming correctly', () => {
      const whitespaceInput = {
        englishPhrase: "   Hello   ",
        userTranslation: "   สวัสดี   ",
        context: "   Context   "
      };

      const result = SaveInputSchema.safeParse(whitespaceInput);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.englishPhrase).toBe("Hello");
        expect(result.data.userTranslation).toBe("สวัสดี");
        expect(result.data.context).toBe("Context");
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

    it('should reject invalid data types', () => {
      const invalidInput = {
        englishPhrase: 123, // should be string
        userTranslation: true, // should be string
        context: [] // should be string
      };

      const result = SaveInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Helper Functions', () => {
    describe('validateSaveInput', () => {
      it('should return success for valid input', () => {
        const validInput: SaveInput = {
          englishPhrase: "Hello world",
          userTranslation: "สวัสดีโลก",
          context: "Greeting"
        };

        const result = validateSaveInput(validInput);
        expect(result.success).toBe(true);
        
        if (result.success) {
          expect(result.data).toEqual(validInput);
        }
      });

      it('should return error for invalid input', () => {
        const invalidInput = {
          englishPhrase: "", // empty
          userTranslation: "สวัสดี"
        };

        const result = validateSaveInput(invalidInput);
        expect(result.success).toBe(false);
        
        if (!result.success) {
          expect(result.error.message).toBeDefined();
          expect(result.error.issues).toBeDefined();
          expect(result.error.issues.length).toBeGreaterThan(0);
        }
      });

      it('should format error messages correctly', () => {
        const invalidInput = {
          englishPhrase: "a".repeat(VALIDATION_CONSTANTS.MAX_PHRASE_LENGTH + 1)
        };

        const result = validateSaveInput(invalidInput);
        expect(result.success).toBe(false);
        
        if (!result.success) {
          expect(result.error.issues[0].field).toBe('englishPhrase');
          expect(result.error.issues[0].message).toContain('less than');
        }
      });
    });

    describe('isSaveInputValid', () => {
      it('should return true for valid input', () => {
        const validInput: SaveInput = {
          englishPhrase: "Hello",
          userTranslation: "สวัสดี",
          context: "Greeting"
        };

        expect(isSaveInputValid(validInput)).toBe(true);
      });

      it('should return false for invalid input', () => {
        const invalidInput = {
          englishPhrase: ""
        };

        expect(isSaveInputValid(invalidInput)).toBe(false);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined inputs', () => {
      expect(isSaveInputValid(null)).toBe(false);
      expect(isSaveInputValid(undefined)).toBe(false);
      expect(isSaveInputValid({})).toBe(false);
    });

    it('should handle special characters in text fields', () => {
      const specialCharsInput: SaveInput = {
        englishPhrase: "Hello! @#$%^&*()_+ 123",
        userTranslation: "สวัสดี! ๑๒๓ @#$%",
        context: "Special chars: !@#$%^&*()"
      };

      const result = SaveInputSchema.safeParse(specialCharsInput);
      expect(result.success).toBe(true);
    });

    it('should handle unicode characters', () => {
      const unicodeInput: SaveInput = {
        englishPhrase: "Hello 🌍 world",
        userTranslation: "สวัสดี 🌍 โลก",
        context: "Unicode test 🚀"
      };

      const result = SaveInputSchema.safeParse(unicodeInput);
      expect(result.success).toBe(true);
    });

    it('should handle very long valid inputs', () => {
      const longValidInput: SaveInput = {
        englishPhrase: "This is a very long English phrase that tests the maximum length validation. ".repeat(10).substring(0, VALIDATION_CONSTANTS.MAX_PHRASE_LENGTH),
        userTranslation: "นี่คือการแปลที่ยาวมากเพื่อทดสอบการตรวจสอบความยาวสูงสุด ".repeat(10).substring(0, VALIDATION_CONSTANTS.MAX_TRANSLATION_LENGTH),
        context: "Long context description. ".repeat(20).substring(0, VALIDATION_CONSTANTS.MAX_CONTEXT_LENGTH)
      };

      const result = SaveInputSchema.safeParse(longValidInput);
      expect(result.success).toBe(true);
    });
  });

  describe('Validation Constants', () => {
    it('should have correct validation constants', () => {
      expect(VALIDATION_CONSTANTS.MIN_PHRASE_LENGTH).toBe(1);
      expect(VALIDATION_CONSTANTS.MAX_PHRASE_LENGTH).toBe(1000);
      expect(VALIDATION_CONSTANTS.MIN_TRANSLATION_LENGTH).toBe(0);
      expect(VALIDATION_CONSTANTS.MAX_TRANSLATION_LENGTH).toBe(1000);
      expect(VALIDATION_CONSTANTS.MAX_CONTEXT_LENGTH).toBe(500);
    });

    it('should not have removed constants', () => {
      expect(VALIDATION_CONSTANTS).not.toHaveProperty('MAX_TAGS');
    });
  });
});