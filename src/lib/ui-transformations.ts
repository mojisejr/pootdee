/**
 * UI Transformation Utilities
 * 
 * This file contains utility functions to transform technical data
 * into user-friendly Thai representations for better UX.
 */

/**
 * Transform IPA phonetic notation to Thai pronunciation guide
 * @param ipaNotation - International Phonetic Alphabet notation
 * @param syllables - Array of syllables
 * @param stress - Array of stress patterns
 * @returns Thai pronunciation guide with stress indicators
 */
export function transformPhoneticToThai(
  ipaNotation: string,
  syllables: string[],
  stress: number[]
): string {
  // Basic IPA to Thai approximation mapping
  const ipaToThaiMap: Record<string, string> = {
    // Vowels
    'ɪ': 'อิ',
    'i:': 'อี',
    'ɛ': 'เอ',
    'æ': 'แอ',
    'ʌ': 'อะ',
    'ɑ:': 'อา',
    'ɒ': 'อ็อ',
    'ɔ:': 'ออ',
    'ʊ': 'อุ',
    'u:': 'อู',
    'ə': 'เออ',
    'ɜ:': 'เออ',
    'eɪ': 'เอ',
    'aɪ': 'ไอ',
    'ɔɪ': 'ออย',
    'aʊ': 'เอา',
    'əʊ': 'โอ',
    'ɪə': 'เอีย',
    'eə': 'แอร์',
    'ʊə': 'อัวร์',
    
    // Consonants
    'p': 'ป',
    'b': 'บ',
    't': 'ต',
    'd': 'ด',
    'k': 'ก',
    'g': 'ก',
    'f': 'ฟ',
    'v': 'ว',
    'θ': 'ธ',
    'ð': 'ด',
    's': 'ส',
    'z': 'ซ',
    'ʃ': 'ช',
    'ʒ': 'ช',
    'h': 'ห',
    'm': 'ม',
    'n': 'น',
    'ŋ': 'ง',
    'l': 'ล',
    'r': 'ร',
    'w': 'ว',
    'j': 'ย',
    'tʃ': 'ช',
    'dʒ': 'จ'
  };

  // Transform IPA notation to Thai approximation
  let thaiPronunciation = ipaNotation;
  
  // Replace IPA symbols with Thai equivalents
  Object.entries(ipaToThaiMap).forEach(([ipa, thai]) => {
    thaiPronunciation = thaiPronunciation.replace(new RegExp(ipa, 'g'), thai);
  });

  // Clean up any remaining IPA symbols
  thaiPronunciation = thaiPronunciation
    .replace(/[ˈˌ]/g, '') // Remove stress markers
    .replace(/[ː]/g, '') // Remove length markers
    .replace(/[()]/g, '') // Remove parentheses
    .trim();

  // If transformation didn't work well, use syllables as fallback
  if (thaiPronunciation === ipaNotation || thaiPronunciation.length < 2) {
    thaiPronunciation = syllables.join('-');
  }

  // Add stress indicators using Thai formatting
  if (stress.length > 0 && syllables.length > 0) {
    const stressedSyllables = syllables.map((syllable, index) => {
      const isStressed = stress[index] === 1;
      return isStressed ? `**${syllable}**` : syllable;
    });
    
    return `${thaiPronunciation} (${stressedSyllables.join('-')})`;
  }

  return thaiPronunciation;
}

/**
 * Transform technical difficulty levels to user-friendly Thai descriptions
 */
export function transformDifficultyToThai(difficulty: "easy" | "medium" | "hard"): string {
  const difficultyMap: Record<string, string> = {
    easy: "ง่าย",
    medium: "ปานกลาง", 
    hard: "ท้าทาย"
  };
  
  return difficultyMap[difficulty] || difficulty;
}

/**
 * Transform vocabulary level to Thai description
 */
export function transformVocabularyLevelToThai(level: "beginner" | "intermediate" | "advanced"): string {
  const levelMap: Record<string, string> = {
    beginner: "เริ่มต้น",
    intermediate: "ปานกลาง",
    advanced: "ขั้นสูง"
  };
  
  return levelMap[level] || level;
}

/**
 * Transform grammar complexity to Thai description
 */
export function transformComplexityToThai(complexity: "simple" | "medium" | "complex"): string {
  const complexityMap: Record<string, string> = {
    simple: "เรียบง่าย",
    medium: "ปานกลาง",
    complex: "ซับซ้อน"
  };
  
  return complexityMap[complexity] || complexity;
}

/**
 * Transform appropriateness level to Thai description
 */
export function transformAppropriatenessToThai(appropriateness: "formal" | "informal" | "neutral"): string {
  const appropriatenessMap: Record<string, string> = {
    formal: "ทางการ",
    informal: "ไม่เป็นทางการ",
    neutral: "กลางๆ"
  };
  
  return appropriatenessMap[appropriateness] || appropriateness;
}

/**
 * Get encouraging tone for correctness status
 */
export function getEncouragingTone(correctness: "correct" | "incorrect" | "partially_correct"): {
  icon: string;
  message: string;
  color: string;
} {
  const toneMap = {
    correct: {
      icon: "🎉",
      message: "ยอดเยี่ยม! แปลถูกต้องแล้ว",
      color: "text-green-600"
    },
    partially_correct: {
      icon: "👍",
      message: "ดีมาก! เกือบถูกแล้ว",
      color: "text-yellow-600"
    },
    incorrect: {
      icon: "💪",
      message: "ไม่เป็นไร! ลองใหม่ได้เสมอ",
      color: "text-blue-600"
    }
  };
  
  return toneMap[correctness];
}

/**
 * Get encouraging message for star rating
 */
export function getStarRatingMessage(rating: number): string {
  if (rating >= 4.5) return "เก่งมาก! 🌟";
  if (rating >= 3.5) return "ดีมาก! 👏";
  if (rating >= 2.5) return "ดีแล้ว! 👍";
  if (rating >= 1.5) return "พยายามต่อไป! 💪";
  return "เริ่มต้นใหม่! 🌱";
}