import { groq } from 'next-sanity'

/**
 * GROQ Query Utilities for Phrase Operations
 * Provides type-safe query functions for phrase data management
 */

// Base phrase fields selection
const PHRASE_FIELDS = groq`
  _id,
  _type,
  _createdAt,
  _updatedAt,
  englishPhrase,
  userTranslation,
  context,
  analysis {
    correctness,
    explanation,
    suggestions,
    grammarNotes,
    culturalNotes,
    difficultyLevel,
    confidence
  },
  userId,
  tags,
  difficulty,
  isBookmarked,
  reviewCount,
  lastReviewedAt
`

// Get all phrases for a specific user
export const GET_USER_PHRASES = groq`
  *[_type == "phrase" && userId == $userId] | order(_createdAt desc) {
    ${PHRASE_FIELDS}
  }
`

// Get a single phrase by ID
export const GET_PHRASE_BY_ID = groq`
  *[_type == "phrase" && _id == $phraseId][0] {
    ${PHRASE_FIELDS}
  }
`

// Get phrases by difficulty level for a user
export const GET_PHRASES_BY_DIFFICULTY = groq`
  *[_type == "phrase" && userId == $userId && difficulty == $difficulty] | order(_createdAt desc) {
    ${PHRASE_FIELDS}
  }
`

// Get bookmarked phrases for a user
export const GET_BOOKMARKED_PHRASES = groq`
  *[_type == "phrase" && userId == $userId && isBookmarked == true] | order(_createdAt desc) {
    ${PHRASE_FIELDS}
  }
`

// Get phrases by tag for a user
export const GET_PHRASES_BY_TAG = groq`
  *[_type == "phrase" && userId == $userId && $tag in tags] | order(_createdAt desc) {
    ${PHRASE_FIELDS}
  }
`

// Search phrases by English phrase or translation
export const SEARCH_PHRASES = groq`
  *[_type == "phrase" && userId == $userId && (
    englishPhrase match $searchTerm + "*" ||
    userTranslation match $searchTerm + "*"
  )] | order(_createdAt desc) {
    ${PHRASE_FIELDS}
  }
`

// Get phrases that need review (based on review count and last reviewed date)
export const GET_PHRASES_FOR_REVIEW = groq`
  *[_type == "phrase" && userId == $userId && (
    reviewCount < 3 ||
    lastReviewedAt < dateTime(now()) - 60*60*24*7 // 7 days ago
  )] | order(reviewCount asc, lastReviewedAt asc) [0...$limit] {
    ${PHRASE_FIELDS}
  }
`

// Get phrase statistics for a user
export const GET_USER_PHRASE_STATS = groq`
  {
    "total": count(*[_type == "phrase" && userId == $userId]),
    "byDifficulty": {
      "beginner": count(*[_type == "phrase" && userId == $userId && difficulty == "beginner"]),
      "intermediate": count(*[_type == "phrase" && userId == $userId && difficulty == "intermediate"]),
      "advanced": count(*[_type == "phrase" && userId == $userId && difficulty == "advanced"])
    },
    "bookmarked": count(*[_type == "phrase" && userId == $userId && isBookmarked == true]),
    "needsReview": count(*[_type == "phrase" && userId == $userId && (
      reviewCount < 3 ||
      lastReviewedAt < dateTime(now()) - 60*60*24*7
    )]),
    "recentlyAdded": count(*[_type == "phrase" && userId == $userId && _createdAt > dateTime(now()) - 60*60*24*7])
  }
`

// Get recent phrases (last 7 days) for a user
export const GET_RECENT_PHRASES = groq`
  *[_type == "phrase" && userId == $userId && _createdAt > dateTime(now()) - 60*60*24*7] | order(_createdAt desc) {
    ${PHRASE_FIELDS}
  }
`

// Get phrases with analysis correctness filter
export const GET_PHRASES_BY_CORRECTNESS = groq`
  *[_type == "phrase" && userId == $userId && analysis.correctness == $correctness] | order(_createdAt desc) {
    ${PHRASE_FIELDS}
  }
`

// Get all unique tags for a user
export const GET_USER_TAGS = groq`
  array::unique(*[_type == "phrase" && userId == $userId].tags[])
`

/**
 * Query parameter types for type safety
 */
export interface PhraseQueryParams {
  userId: string
  phraseId?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  tag?: string
  searchTerm?: string
  limit?: number
  correctness?: 'correct' | 'incorrect' | 'partially_correct'
}

/**
 * Helper function to validate query parameters
 */
export function validateQueryParams(params: Partial<PhraseQueryParams>): boolean {
  if (!params.userId) {
    console.error('ERROR: userId is required for phrase queries')
    return false
  }
  
  if (params.difficulty && !['beginner', 'intermediate', 'advanced'].includes(params.difficulty)) {
    console.error('ERROR: Invalid difficulty level')
    return false
  }
  
  if (params.correctness && !['correct', 'incorrect', 'partially_correct'].includes(params.correctness)) {
    console.error('ERROR: Invalid correctness value')
    return false
  }
  
  return true
}