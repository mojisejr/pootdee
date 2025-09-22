// LangGraph Service Layer Exports
// Centralized exports for all LangGraph-related services

// Core Workflow
export { EnglishAnalysisWorkflow } from './workflow';

// Individual Agents
export { SentenceFilterAgent } from './sentenceFilter';
export { AnalyzerAgent } from './analyzer';

// Utilities
export { AIProviderManager } from './providers';
export { LangGraphErrorHandler } from './errorHandler';

// Convenience exports for singleton instances
import { EnglishAnalysisWorkflow } from './workflow';
import { SentenceFilterAgent } from './sentenceFilter';
import { AnalyzerAgent } from './analyzer';
import { AIProviderManager } from './providers';

export const englishAnalysisWorkflow = EnglishAnalysisWorkflow.getInstance();
export const sentenceFilterAgent = SentenceFilterAgent.getInstance();
export const analyzerAgent = AnalyzerAgent.getInstance();
export const aiProviderManager = AIProviderManager.getInstance();