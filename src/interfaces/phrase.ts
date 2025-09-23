/**
 * TypeScript Interfaces for Phrase Data Structures
 * Provides type safety for phrase-related operations
 */

// Base Sanity document interface
export interface SanityDocument {
  _id: string
  _type: string
  _createdAt: string
  _updatedAt: string
  _rev?: string
}

// Analysis result interface
export interface PhraseAnalysis {
  correctness: 'correct' | 'incorrect' | 'partially_correct'
  explanation: string
  suggestions: string[]
  grammarNotes: string[]
  culturalNotes: string[]
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
  confidence: number // 0-100 confidence score
}

// Main phrase interface extending Sanity document
export interface Phrase extends SanityDocument {
  _type: 'phrase'
  englishPhrase: string
  userTranslation: string
  context?: string
  analysis?: PhraseAnalysis
  userId: string
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  isBookmarked: boolean
  reviewCount: number
  lastReviewedAt?: string
}

// Input interface for creating new phrases
export interface CreatePhraseInput {
  englishPhrase: string
  userTranslation: string
  context?: string
  userId: string
  tags?: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  isBookmarked?: boolean
}

// Enhanced input interface for creating phrases with analysis data
export interface EnhancedCreatePhraseInput extends CreatePhraseInput {
  analysisData?: unknown
  grammarAnalysis?: unknown
  vocabularyAnalysis?: unknown
  contextAnalysis?: unknown
  analysisMetadata?: unknown
}

// Input interface for updating existing phrases
export interface UpdatePhraseInput {
  englishPhrase?: string
  userTranslation?: string
  context?: string
  analysis?: PhraseAnalysis
  tags?: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  isBookmarked?: boolean
  reviewCount?: number
  lastReviewedAt?: string
}

// Response interface for phrase operations
export interface PhraseResponse {
  success: boolean
  data?: Phrase
  error?: string
  message?: string
}

// Response interface for multiple phrases
export interface PhrasesResponse {
  success: boolean
  data?: Phrase[]
  error?: string
  message?: string
  total?: number
}

// User phrase statistics interface
export interface UserPhraseStats {
  total: number
  byDifficulty: {
    beginner: number
    intermediate: number
    advanced: number
  }
  bookmarked: number
  needsReview: number
  recentlyAdded: number
}

// Query filters interface
export interface PhraseFilters {
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  isBookmarked?: boolean
  tags?: string[]
  searchTerm?: string
  correctness?: 'correct' | 'incorrect' | 'partially_correct'
  needsReview?: boolean
  dateRange?: {
    from: string
    to: string
  }
}

// Pagination interface
export interface PaginationOptions {
  page: number
  limit: number
  sortBy?: 'createdAt' | 'updatedAt' | 'reviewCount' | 'difficulty'
  sortOrder?: 'asc' | 'desc'
}

// Paginated response interface
export interface PaginatedPhrasesResponse extends PhrasesResponse {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Analysis request interface
export interface AnalysisRequest {
  englishPhrase: string
  userTranslation: string
  context?: string
  userId: string
}

// Analysis response interface
export interface AnalysisResponse {
  success: boolean
  data?: PhraseAnalysis
  error?: string
  message?: string
}

// Bulk operations interfaces
export interface BulkCreatePhraseInput {
  phrases: CreatePhraseInput[]
}

export interface BulkUpdatePhraseInput {
  updates: Array<{
    phraseId: string
    data: UpdatePhraseInput
  }>
}

export interface BulkOperationResponse {
  success: boolean
  successCount: number
  errorCount: number
  errors?: Array<{
    index: number
    error: string
  }>
  data?: Phrase[]
}

// Review session interfaces
export interface ReviewSession {
  userId: string
  phrases: Phrase[]
  startedAt: string
  completedAt?: string
  correctAnswers: number
  totalQuestions: number
}

export interface ReviewSessionResponse {
  success: boolean
  data?: ReviewSession
  error?: string
  message?: string
}

// Export/Import interfaces
export interface ExportOptions {
  format: 'json' | 'csv' | 'xlsx'
  includeAnalysis: boolean
  filters?: PhraseFilters
}

export interface ImportPhraseData {
  englishPhrase: string
  userTranslation: string
  context?: string
  tags?: string
  difficulty?: string
  isBookmarked?: boolean
}

export interface ImportResponse {
  success: boolean
  imported: number
  skipped: number
  errors: Array<{
    row: number
    error: string
    data: ImportPhraseData
  }>
}

// Type guards for runtime type checking
export function isPhraseAnalysis(obj: unknown): obj is PhraseAnalysis {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'correctness' in obj &&
    'explanation' in obj &&
    'suggestions' in obj &&
    'grammarNotes' in obj &&
    'culturalNotes' in obj &&
    'difficultyLevel' in obj &&
    'confidence' in obj
  )
}

export function isPhrase(obj: unknown): obj is Phrase {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    '_type' in obj &&
    (obj as Phrase)._type === 'phrase' &&
    'englishPhrase' in obj &&
    'userTranslation' in obj &&
    'userId' in obj
  )
}

// Utility types
export type PhraseField = keyof Phrase
export type CreatePhraseField = keyof CreatePhraseInput
export type UpdatePhraseField = keyof UpdatePhraseInput
export type DifficultyLevel = Phrase['difficulty']
export type CorrectnessLevel = PhraseAnalysis['correctness']