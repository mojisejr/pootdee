import { z } from 'zod';

// ============================================================================
// Core Workflow State Interface
// ============================================================================

export interface WorkflowState {
  // Input data
  englishPhrase: string;
  userTranslation?: string;
  context?: string;

  // Processing states
  isValidSentence: boolean;
  filterError?: string;

  // Analysis results
  analysisResult?: AnalysisResult;
  analysisError?: string;

  // Workflow control
  currentStep: "filter" | "analyze" | "complete" | "error";
  errorDetails?: ErrorDetails;

  // Enhanced metadata
  metadata?: AnalysisMetadata;
}

// ============================================================================
// Enhanced Analysis Metadata Interface
// ============================================================================

export interface AnalysisMetadata {
  timestamp: string;
  processingTimeMs: number;
  modelUsed: string;
  confidence: number;
  retryCount: number;
  version: string;
  sessionId?: string;
}

// ============================================================================
// Sentence Filter Agent Interfaces
// ============================================================================

export interface SentenceFilterInput {
  englishPhrase: string;
  userTranslation?: string;
  context?: string;
}

export interface SentenceFilterOutput {
  isValid: boolean;
  reason: string;
  cleanedSentence: string | null;
  confidence: number;
  metadata?: {
    detectedLanguage: string;
    wordCount: number;
    sentenceCount: number;
    complexity: "simple" | "medium" | "complex";
  };
}

// ============================================================================
// Enhanced Analyzer Agent Interfaces
// ============================================================================

export interface AnalyzerInput {
  sentence: string;
  userTranslation?: string;
  context?: string;
}

export interface AnalyzerOutput {
  correctness: "correct" | "incorrect" | "partially_correct";
  meaning: string;
  alternatives: string[];
  errors: string;
  
  // Enhanced analysis fields
  grammarAnalysis: GrammarAnalysis;
  vocabularyAnalysis: VocabularyAnalysis;
  contextAnalysis: ContextAnalysis;
  confidence: number;
  suggestions: string[];
  
  // Overall rating
  overallStarRating: number; // 1-5 stars (average of component ratings)
}

export interface GrammarAnalysis {
  score: number; // 0-100
  starRating: number; // 1-5 stars
  issues: GrammarIssue[];
  strengths: string[];
  recommendations: string[];
  tenseAnalysis: TenseAnalysis;
  structureAnalysis: StructureAnalysis;
  complexity: "simple" | "medium" | "complex";
}

export interface TenseAnalysis {
  detectedTense: string; // e.g., "Present Perfect", "Past Simple"
  isCorrect: boolean;
  explanation: string; // Thai explanation
  alternatives: string[]; // alternative tense suggestions
  usage: string; // Thai explanation of when to use this tense
}

export interface StructureAnalysis {
  pattern: string; // e.g., "Subject + Verb + Object"
  isNatural: boolean;
  explanation: string; // Thai explanation
  improvements: string[]; // Thai suggestions for improvement
  comparison: string; // Thai comparison with Thai sentence structure
}

export interface GrammarIssue {
  type: "tense" | "subject_verb_agreement" | "article" | "preposition" | "word_order" | "other";
  description: string;
  severity: "low" | "medium" | "high";
  suggestion: string;
  position?: {
    start: number;
    end: number;
  };
}

export interface VocabularyAnalysis {
  score: number; // 0-100
  starRating: number; // 1-5 stars
  level: "beginner" | "intermediate" | "advanced";
  appropriateWords: string[];
  inappropriateWords: string[];
  suggestions: VocabularySuggestion[];
  wordBreakdown: WordAnalysis[];
  overallDifficulty: "easy" | "medium" | "hard";
}

export interface WordAnalysis {
  word: string;
  position: {
    start: number;
    end: number;
  };
  partOfSpeech: string;
  difficulty: "easy" | "medium" | "hard";
  phonics: {
    pronunciation: string; // IPA notation
    syllables: string[];
    stress: number[]; // syllable stress pattern
  };
  meaning: string; // Thai explanation
  commonUsage: string; // Thai explanation of common usage
  alternatives: string[]; // simpler alternatives
}

export interface VocabularySuggestion {
  original: string;
  suggested: string;
  reason: string;
  context: string;
}

export interface ContextAnalysis {
  score: number; // 0-100
  starRating: number; // 1-5 stars
  appropriateness: "formal" | "informal" | "neutral";
  culturalNotes: string[];
  usageNotes: string[];
  situationalFit: string;
}

export type AnalysisResult = AnalyzerOutput;

// ============================================================================
// Enhanced Error Handling Interfaces
// ============================================================================

export enum ErrorType {
  VALIDATION = "validation",
  API_TIMEOUT = "api_timeout",
  API_RATE_LIMIT = "api_rate_limit",
  API_ERROR = "api_error",
  NETWORK_ERROR = "network_error",
  PARSING_ERROR = "parsing_error",
  STRUCTURED_OUTPUT_ERROR = "structured_output_error",
  UNKNOWN = "unknown",
}

export interface ErrorDetails {
  step: "filter" | "analyze";
  type: ErrorType;
  message: string;
  userMessage: string;
  retryable?: boolean;
  suggestedAction?: string;
  timestamp: string;
  errorCode?: string;
  context?: Record<string, unknown>;
}

export interface WorkflowError {
  type: ErrorType;
  step: "filter" | "analyze";
  message: string;
  userMessage: string;
  retryable: boolean;
  suggestedAction?: string;
  timestamp: string;
  errorCode?: string;
  context?: Record<string, unknown>;
}

// ============================================================================
// API Request/Response Interfaces
// ============================================================================

export interface AnalyzeRequest {
  englishPhrase: string;
  userTranslation?: string;
  context?: string;
  options?: {
    includeMetadata?: boolean;
    detailedAnalysis?: boolean;
    sessionId?: string;
  };
}

export interface AnalyzeResponse {
  success: boolean;
  data?: AnalysisResult;
  metadata?: AnalysisMetadata;
  error?: {
    type: ErrorType;
    message: string;
    userMessage: string;
    retryable: boolean;
    suggestedAction?: string;
    timestamp: string;
    errorCode?: string;
    context?: Record<string, unknown>;
  };
}

// ============================================================================
// LangGraph State Interface (Enhanced)
// ============================================================================

export interface LangGraphState {
  englishPhrase: string;
  userTranslation?: string;
  context?: string;
  filterResult?: {
    isValid: boolean;
    reasoning: string;
    metadata?: SentenceFilterOutput['metadata'];
  };
  analysisResult?: {
    grammar: AnalysisSection;
    usage: AnalysisSection;
    context: AnalysisSection;
    enhanced?: AnalyzerOutput;
  };
  errors?: string[];
  retryCount: number;
  metadata?: AnalysisMetadata;
}

export interface AnalysisSection {
  score: number;
  feedback: string;
  suggestions: string[];
}

// ============================================================================
// Enhanced Zod Schemas for Structured Output
// ============================================================================

// Grammar Analysis Schemas
export const GrammarIssueSchema = z.object({
  type: z.enum(["tense", "subject_verb_agreement", "article", "preposition", "word_order", "other"]),
  description: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  suggestion: z.string(),
  position: z.object({
    start: z.number(),
    end: z.number(),
  }).optional(),
});

export const TenseAnalysisSchema = z.object({
  detectedTense: z.string(),
  isCorrect: z.boolean(),
  explanation: z.string(),
  alternatives: z.array(z.string()),
  usage: z.string(),
});

export const StructureAnalysisSchema = z.object({
  pattern: z.string(),
  isNatural: z.boolean(),
  explanation: z.string(),
  improvements: z.array(z.string()),
  comparison: z.string(),
});

export const GrammarAnalysisSchema = z.object({
  score: z.number().min(0).max(100),
  starRating: z.number().min(1).max(5),
  issues: z.array(GrammarIssueSchema),
  strengths: z.array(z.string()),
  recommendations: z.array(z.string()),
  tenseAnalysis: TenseAnalysisSchema,
  structureAnalysis: StructureAnalysisSchema,
  complexity: z.enum(["simple", "medium", "complex"]),
});

// Vocabulary Analysis Schemas
export const VocabularySuggestionSchema = z.object({
  original: z.string(),
  suggested: z.string(),
  reason: z.string(),
  context: z.string(),
});

export const PhonicsSchema = z.object({
  pronunciation: z.string(),
  syllables: z.array(z.string()),
  stress: z.array(z.number()),
});

export const WordAnalysisSchema = z.object({
  word: z.string(),
  position: z.object({
    start: z.number(),
    end: z.number(),
  }),
  partOfSpeech: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  phonics: PhonicsSchema,
  meaning: z.string(),
  commonUsage: z.string(),
  alternatives: z.array(z.string()),
});

export const VocabularyAnalysisSchema = z.object({
  score: z.number().min(0).max(100),
  starRating: z.number().min(1).max(5),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  appropriateWords: z.array(z.string()),
  inappropriateWords: z.array(z.string()),
  suggestions: z.array(VocabularySuggestionSchema),
  wordBreakdown: z.array(WordAnalysisSchema),
  overallDifficulty: z.enum(["easy", "medium", "hard"]),
});

// Context Analysis Schema
export const ContextAnalysisSchema = z.object({
  score: z.number().min(0).max(100),
  starRating: z.number().min(1).max(5),
  appropriateness: z.enum(["formal", "informal", "neutral"]),
  culturalNotes: z.array(z.string()),
  usageNotes: z.array(z.string()),
  situationalFit: z.string(),
});

// Enhanced Metadata Schema
export const AnalysisMetadataSchema = z.object({
  timestamp: z.string(),
  processingTimeMs: z.number(),
  modelUsed: z.string(),
  confidence: z.number().min(0).max(1),
  retryCount: z.number(),
  version: z.string(),
  sessionId: z.string().optional(),
});

// Enhanced Filter Schemas
export const SentenceFilterInputSchema = z.object({
  englishPhrase: z.string().min(1, "English phrase is required"),
  userTranslation: z.string().optional(),
  context: z.string().optional(),
});

export const SentenceFilterOutputSchema = z.object({
  isValid: z.boolean(),
  reason: z.string(),
  cleanedSentence: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  metadata: z.object({
    detectedLanguage: z.string(),
    wordCount: z.number(),
    sentenceCount: z.number(),
    complexity: z.enum(["simple", "medium", "complex"]),
  }).optional(),
});

// Enhanced Analyzer Schemas
export const AnalyzerInputSchema = z.object({
  sentence: z.string().min(1, "Sentence is required"),
  userTranslation: z.string().optional(),
  context: z.string().optional(),
});

export const AnalyzerOutputSchema = z.object({
  correctness: z.enum(["correct", "incorrect", "partially_correct"]),
  meaning: z.string(),
  alternatives: z.array(z.string()),
  errors: z.string(),
  grammarAnalysis: GrammarAnalysisSchema,
  vocabularyAnalysis: VocabularyAnalysisSchema,
  contextAnalysis: ContextAnalysisSchema,
  confidence: z.number().min(0).max(1),
  suggestions: z.array(z.string()),
  overallStarRating: z.number().min(1).max(5),
});

// Enhanced Request/Response Schemas
export const AnalyzeRequestSchema = z.object({
  englishPhrase: z.string().min(1, "English phrase is required").max(500, "Phrase too long"),
  userTranslation: z.string().optional(),
  context: z.string().optional(),
  options: z.object({
    includeMetadata: z.boolean().optional(),
    detailedAnalysis: z.boolean().optional(),
    sessionId: z.string().optional(),
  }).optional(),
});

export const AnalyzeResponseSchema = z.object({
  success: z.boolean(),
  data: AnalyzerOutputSchema.optional(),
  metadata: AnalysisMetadataSchema.optional(),
  error: z.object({
    type: z.nativeEnum(ErrorType),
    message: z.string(),
    userMessage: z.string(),
    retryable: z.boolean(),
    suggestedAction: z.string().optional(),
    timestamp: z.string(),
    errorCode: z.string().optional(),
    context: z.record(z.string(), z.unknown()).optional(),
  }).optional(),
});

// Enhanced Error Schemas
export const ErrorDetailsSchema = z.object({
  step: z.enum(["filter", "analyze"]),
  type: z.nativeEnum(ErrorType),
  message: z.string(),
  userMessage: z.string(),
  retryable: z.boolean().optional(),
  suggestedAction: z.string().optional(),
  timestamp: z.string(),
  errorCode: z.string().optional(),
  context: z.record(z.string(), z.unknown()).optional(),
});

// Enhanced Workflow State Schema
export const WorkflowStateSchema = z.object({
  englishPhrase: z.string(),
  userTranslation: z.string().optional(),
  context: z.string().optional(),
  isValidSentence: z.boolean(),
  filterError: z.string().optional(),
  analysisResult: AnalyzerOutputSchema.optional(),
  analysisError: z.string().optional(),
  currentStep: z.enum(["filter", "analyze", "complete", "error"]),
  errorDetails: ErrorDetailsSchema.optional(),
  metadata: AnalysisMetadataSchema.optional(),
});

// ============================================================================
// Enhanced Error Messages with Structured Output Context
// ============================================================================

export const ERROR_MESSAGES: Record<ErrorType, {
  title: string;
  description: string;
  action: string;
}> = {
  [ErrorType.VALIDATION]: {
    title: "ข้อมูลไม่ถูกต้อง",
    description: "กรุณาตรวจสอบประโยคที่กรอกให้เป็นประโยคเดียวและเป็นภาษาอังกฤษ",
    action: "แก้ไขประโยค",
  },
  [ErrorType.API_TIMEOUT]: {
    title: "การวิเคราะห์ใช้เวลานานเกินไป",
    description: "ระบบใช้เวลาในการวิเคราะห์นานกว่าปกติ กรุณาลองใหม่อีกครั้ง",
    action: "ลองใหม่",
  },
  [ErrorType.API_RATE_LIMIT]: {
    title: "ใช้งานเกินขิดจำกัด",
    description: "คุณใช้งานระบบวิเคราะห์เกินขีดจำกัดแล้ว กรุณารอสักครู่แล้วลองใหม่",
    action: "รอ 1 นาที",
  },
  [ErrorType.API_ERROR]: {
    title: "เกิดข้อผิดพลาดในการวิเคราะห์",
    description: "ระบบ AI มีปัญหาชั่วคราว กรุณาลองใหม่อีกครั้ง",
    action: "ลองใหม่",
  },
  [ErrorType.NETWORK_ERROR]: {
    title: "ปัญหาการเชื่อมต่อ",
    description: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต",
    action: "ตรวจสอบเน็ต",
  },
  [ErrorType.PARSING_ERROR]: {
    title: "เกิดข้อผิดพลาดในการประมวลผล",
    description: "ไม่สามารถประมวลผลข้อมูลที่ได้รับจาก AI ได้ กรุณาลองใหม่อีกครั้ง",
    action: "ลองใหม่",
  },
  [ErrorType.STRUCTURED_OUTPUT_ERROR]: {
    title: "เกิดข้อผิดพลาดในรูปแบบข้อมูล",
    description: "ข้อมูลที่ได้รับจาก AI ไม่ตรงตามรูปแบบที่คาดหวัง กรุณาลองใหม่อีกครั้ง",
    action: "ลองใหม่",
  },
  [ErrorType.UNKNOWN]: {
    title: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
    description: "เกิดปัญหาที่ไม่คาดคิด กรุณาลองใหม่หรือติดต่อผู้ดูแลระบบ",
    action: "ลองใหม่",
  },
};

// ============================================================================
// Enhanced Type Guards with Structured Output Validation
// ============================================================================

export function isValidSentenceFilterOutput(obj: unknown): obj is SentenceFilterOutput {
  return SentenceFilterOutputSchema.safeParse(obj).success;
}

export function isValidAnalyzerOutput(obj: unknown): obj is AnalyzerOutput {
  return AnalyzerOutputSchema.safeParse(obj).success;
}

export function isValidAnalyzeRequest(obj: unknown): obj is AnalyzeRequest {
  return AnalyzeRequestSchema.safeParse(obj).success;
}

export function isValidWorkflowState(obj: unknown): obj is WorkflowState {
  return WorkflowStateSchema.safeParse(obj).success;
}

export function isValidAnalysisResult(obj: unknown): obj is AnalysisResult {
  return AnalyzerOutputSchema.safeParse(obj).success;
}

export function isValidAnalysisMetadata(obj: unknown): obj is AnalysisMetadata {
  return AnalysisMetadataSchema.safeParse(obj).success;
}

export function isValidGrammarAnalysis(obj: unknown): obj is GrammarAnalysis {
  return GrammarAnalysisSchema.safeParse(obj).success;
}

export function isValidVocabularyAnalysis(obj: unknown): obj is VocabularyAnalysis {
  return VocabularyAnalysisSchema.safeParse(obj).success;
}

export function isValidContextAnalysis(obj: unknown): obj is ContextAnalysis {
  return ContextAnalysisSchema.safeParse(obj).success;
}

// ============================================================================
// Enhanced Utility Functions for Structured Output
// ============================================================================

/**
 * Validates and parses structured output from LLM
 */
export function parseStructuredOutput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): { success: true; data: T } | { success: false; error: ErrorDetails } {
  try {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      const errorMessage = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      
      return {
        success: false,
        error: {
          step: "analyze",
          type: ErrorType.STRUCTURED_OUTPUT_ERROR,
          message: `Structured output validation failed: ${errorMessage}`,
          userMessage: "เกิดข้อผิดพลาดในการประมวลผลข้อมูล กรุณาลองใหม่อีกครั้ง",
          retryable: true,
          suggestedAction: "ลองใหม่",
          timestamp: new Date().toISOString(),
          errorCode: "STRUCT_VALIDATION_FAILED",
          context: { originalData: data, validationErrors: result.error.issues, context },
        },
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        step: "analyze",
        type: ErrorType.PARSING_ERROR,
        message: `Failed to parse structured output: ${error instanceof Error ? error.message : 'Unknown error'}`,
        userMessage: "เกิดข้อผิดพลาดในการประมวลผลข้อมูล กรุณาลองใหม่อีกครั้ง",
        retryable: true,
        suggestedAction: "ลองใหม่",
        timestamp: new Date().toISOString(),
        errorCode: "STRUCT_PARSE_FAILED",
        context: { originalData: data, error: error instanceof Error ? error.message : 'Unknown error', context },
      },
    };
  }
}

/**
 * Creates analysis metadata with current timestamp and processing info
 */
export function createAnalysisMetadata(
  modelUsed: string,
  processingTimeMs: number,
  confidence: number,
  retryCount: number = 0,
  sessionId?: string
): AnalysisMetadata {
  return {
    timestamp: new Date().toISOString(),
    processingTimeMs,
    modelUsed,
    confidence,
    retryCount,
    version: "1.0.0",
    sessionId,
  };
}

/**
 * Creates error details with proper timestamp and context
 */
export function createErrorDetails(
  step: "filter" | "analyze",
  type: ErrorType,
  message: string,
  userMessage: string,
  retryable: boolean = true,
  suggestedAction?: string,
  errorCode?: string,
  context?: Record<string, unknown>
): ErrorDetails {
  return {
    step,
    type,
    message,
    userMessage,
    retryable,
    suggestedAction,
    timestamp: new Date().toISOString(),
    errorCode,
    context,
  };
}

// ============================================================================
// Provider Configuration Interface
// ============================================================================

export interface ProviderConfig {
  primary: "google";
  fallback?: "google";
  timeout: number;
  maxRetries: number;
  structuredOutput?: {
    enabled: boolean;
    retryOnValidationError: boolean;
    maxValidationRetries: number;
  };
}

// ============================================================================
// Logging Configuration Interface
// ============================================================================

export interface LoggingConfig {
  level: "DEBUG" | "INFO" | "ERROR";
  enableStructuredLogs: boolean;
  includeMetadata: boolean;
  includeContext: boolean;
}

// ============================================================================
// Type Definitions for LangChain Integration
// ============================================================================

export type NodeFunction<T = WorkflowState> = (state: T) => Promise<T>;
export type ConditionalEdgeFunction<T = WorkflowState> = (state: T) => string;