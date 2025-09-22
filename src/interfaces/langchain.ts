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
}

// ============================================================================
// Analyzer Agent Interfaces
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
}

export type AnalysisResult = AnalyzerOutput;

// ============================================================================
// Error Handling Interfaces
// ============================================================================

export enum ErrorType {
  VALIDATION = "validation",
  API_TIMEOUT = "api_timeout",
  API_RATE_LIMIT = "api_rate_limit",
  API_ERROR = "api_error",
  NETWORK_ERROR = "network_error",
  UNKNOWN = "unknown",
}

export interface ErrorDetails {
  step: "filter" | "analyze";
  type: ErrorType;
  message: string;
  userMessage: string;
  retryable?: boolean;
  suggestedAction?: string;
}

export interface WorkflowError {
  type: ErrorType;
  step: "filter" | "analyze";
  message: string;
  userMessage: string;
  retryable: boolean;
  suggestedAction?: string;
}

// ============================================================================
// API Request/Response Interfaces
// ============================================================================

export interface AnalyzeRequest {
  englishPhrase: string;
  userTranslation?: string;
  context?: string;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: {
    type: ErrorType;
    message: string;
    userMessage: string;
    retryable: boolean;
    suggestedAction?: string;
  };
}

// ============================================================================
// LangGraph State Management
// ============================================================================

export interface LangGraphState {
  englishPhrase: string;
  userTranslation?: string;
  context?: string;
  filterResult?: {
    isValid: boolean;
    reasoning: string;
  };
  analysisResult?: {
    grammar: AnalysisSection;
    usage: AnalysisSection;
    context: AnalysisSection;
  };
  errors?: string[];
  retryCount: number;
}

export interface AnalysisSection {
  score: number;
  feedback: string;
  suggestions: string[];
}

// ============================================================================
// Zod Validation Schemas
// ============================================================================

// Sentence Filter Schemas
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
});

// Analyzer Schemas
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
});

// API Request/Response Schemas
export const AnalyzeRequestSchema = z.object({
  englishPhrase: z.string().min(1, "English phrase is required").max(500, "Phrase too long"),
  userTranslation: z.string().optional(),
  context: z.string().optional(),
});

export const AnalyzeResponseSchema = z.object({
  success: z.boolean(),
  data: AnalyzerOutputSchema.optional(),
  error: z.object({
    type: z.nativeEnum(ErrorType),
    message: z.string(),
    userMessage: z.string(),
    retryable: z.boolean(),
    suggestedAction: z.string().optional(),
  }).optional(),
});

// Error Details Schema
export const ErrorDetailsSchema = z.object({
  step: z.enum(["filter", "analyze"]),
  type: z.nativeEnum(ErrorType),
  message: z.string(),
  userMessage: z.string(),
  retryable: z.boolean().optional(),
  suggestedAction: z.string().optional(),
});

// Workflow State Schema
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
});

// ============================================================================
// Error Messages for UI
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
  [ErrorType.UNKNOWN]: {
    title: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
    description: "เกิดปัญหาที่ไม่คาดคิด กรุณาลองใหม่หรือติดต่อผู้ดูแลระบบ",
    action: "ลองใหม่",
  },
};

// ============================================================================
// Type Guards
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
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'input' in obj &&
    typeof obj.input === 'object' &&
    obj.input !== null &&
    'sentence' in obj.input &&
    typeof obj.input.sentence === 'string' &&
    ('filterResult' in obj && (obj.filterResult === null || isValidSentenceFilterOutput(obj.filterResult))) &&
    ('analysisResult' in obj && (obj.analysisResult === null || isValidAnalyzerOutput(obj.analysisResult))) &&
    ('error' in obj && (obj.error === null || typeof obj.error === 'object')) &&
    'isComplete' in obj &&
    typeof obj.isComplete === 'boolean'
  );
}

export function isValidAnalysisResult(obj: unknown): obj is AnalysisResult {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'success' in obj &&
    typeof obj.success === 'boolean' &&
    ('error' in obj && (obj.error === null || typeof obj.error === 'object')) &&
    ('filterResult' in obj && (obj.filterResult === null || isValidSentenceFilterOutput(obj.filterResult))) &&
    ('analysisResult' in obj && (obj.analysisResult === null || isValidAnalyzerOutput(obj.analysisResult)))
  );
}

// ============================================================================
// Utility Types
// ============================================================================

export type NodeFunction<T = WorkflowState> = (state: T) => Promise<T>;
export type ConditionalEdgeFunction<T = WorkflowState> = (state: T) => string;

// Provider configuration
export interface ProviderConfig {
  primary: "google";
  fallback?: "google";
  timeout: number;
  maxRetries: number;
}