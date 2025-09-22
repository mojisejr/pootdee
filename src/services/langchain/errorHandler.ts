import { ErrorType, ErrorDetails, WorkflowError, ERROR_MESSAGES } from '@/interfaces/langchain';

/**
 * Error Handler for LangGraph Workflow
 * Provides centralized error handling and user-friendly error messages
 */
export class LangGraphErrorHandler {
  /**
   * Handle errors from the Sentence Filter Agent
   */
  static handleFilterError(error: unknown): ErrorDetails {
    console.error('ERROR: Filter Agent failed:', error);
    
    if (error instanceof Error) {
      // API timeout errors
      if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
        return {
          step: 'filter',
          type: ErrorType.API_TIMEOUT,
          message: `Filter timeout: ${error.message}`,
          userMessage: ERROR_MESSAGES[ErrorType.API_TIMEOUT].description,
          retryable: true,
          suggestedAction: ERROR_MESSAGES[ErrorType.API_TIMEOUT].action,
        };
      }

      // Rate limit errors
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return {
          step: 'filter',
          type: ErrorType.API_RATE_LIMIT,
          message: `Filter rate limit: ${error.message}`,
          userMessage: ERROR_MESSAGES[ErrorType.API_RATE_LIMIT].description,
          retryable: true,
          suggestedAction: ERROR_MESSAGES[ErrorType.API_RATE_LIMIT].action,
        };
      }

      // Network errors
      if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
        return {
          step: 'filter',
          type: ErrorType.NETWORK_ERROR,
          message: `Filter network error: ${error.message}`,
          userMessage: ERROR_MESSAGES[ErrorType.NETWORK_ERROR].description,
          retryable: true,
          suggestedAction: ERROR_MESSAGES[ErrorType.NETWORK_ERROR].action,
        };
      }

      // Validation errors
      if (error.message.includes('validation') || error.message.includes('invalid')) {
        return {
          step: 'filter',
          type: ErrorType.VALIDATION,
          message: `Filter validation error: ${error.message}`,
          userMessage: ERROR_MESSAGES[ErrorType.VALIDATION].description,
          retryable: false,
          suggestedAction: ERROR_MESSAGES[ErrorType.VALIDATION].action,
        };
      }

      // Generic API errors
      return {
        step: 'filter',
        type: ErrorType.API_ERROR,
        message: `Filter API error: ${error.message}`,
        userMessage: ERROR_MESSAGES[ErrorType.API_ERROR].description,
        retryable: true,
        suggestedAction: ERROR_MESSAGES[ErrorType.API_ERROR].action,
      };
    }

    // Unknown errors
    return {
      step: 'filter',
      type: ErrorType.UNKNOWN,
      message: `Filter unknown error: ${String(error)}`,
      userMessage: ERROR_MESSAGES[ErrorType.UNKNOWN].description,
      retryable: true,
      suggestedAction: ERROR_MESSAGES[ErrorType.UNKNOWN].action,
    };
  }

  /**
   * Handle errors from the Analyzer Agent
   */
  static handleAnalyzerError(error: unknown): ErrorDetails {
    console.error('ERROR: Analyzer Agent failed:', error);
    
    if (error instanceof Error) {
      // API timeout errors
      if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
        return {
          step: 'analyze',
          type: ErrorType.API_TIMEOUT,
          message: `Analyzer timeout: ${error.message}`,
          userMessage: ERROR_MESSAGES[ErrorType.API_TIMEOUT].description,
          retryable: true,
          suggestedAction: ERROR_MESSAGES[ErrorType.API_TIMEOUT].action,
        };
      }

      // Rate limit errors
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return {
          step: 'analyze',
          type: ErrorType.API_RATE_LIMIT,
          message: `Analyzer rate limit: ${error.message}`,
          userMessage: ERROR_MESSAGES[ErrorType.API_RATE_LIMIT].description,
          retryable: true,
          suggestedAction: ERROR_MESSAGES[ErrorType.API_RATE_LIMIT].action,
        };
      }

      // Network errors
      if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
        return {
          step: 'analyze',
          type: ErrorType.NETWORK_ERROR,
          message: `Analyzer network error: ${error.message}`,
          userMessage: ERROR_MESSAGES[ErrorType.NETWORK_ERROR].description,
          retryable: true,
          suggestedAction: ERROR_MESSAGES[ErrorType.NETWORK_ERROR].action,
        };
      }

      // Validation errors
      if (error.message.includes('validation') || error.message.includes('invalid')) {
        return {
          step: 'analyze',
          type: ErrorType.VALIDATION,
          message: `Analyzer validation error: ${error.message}`,
          userMessage: ERROR_MESSAGES[ErrorType.VALIDATION].description,
          retryable: false,
          suggestedAction: ERROR_MESSAGES[ErrorType.VALIDATION].action,
        };
      }

      // Generic API errors
      return {
        step: 'analyze',
        type: ErrorType.API_ERROR,
        message: `Analyzer API error: ${error.message}`,
        userMessage: ERROR_MESSAGES[ErrorType.API_ERROR].description,
        retryable: true,
        suggestedAction: ERROR_MESSAGES[ErrorType.API_ERROR].action,
      };
    }

    // Unknown errors
    return {
      step: 'analyze',
      type: ErrorType.UNKNOWN,
      message: `Analyzer unknown error: ${String(error)}`,
      userMessage: ERROR_MESSAGES[ErrorType.UNKNOWN].description,
      retryable: true,
      suggestedAction: ERROR_MESSAGES[ErrorType.UNKNOWN].action,
    };
  }

  /**
   * Create a workflow error from error details
   */
  static createWorkflowError(errorDetails: ErrorDetails): WorkflowError {
    return {
      type: errorDetails.type,
      step: errorDetails.step,
      message: errorDetails.message,
      userMessage: errorDetails.userMessage,
      retryable: errorDetails.retryable ?? true,
      suggestedAction: errorDetails.suggestedAction,
    };
  }

  /**
   * Check if an error is retryable
   */
  static isRetryable(error: ErrorDetails): boolean {
    return error.retryable !== false && 
           error.type !== ErrorType.VALIDATION;
  }

  /**
   * Get retry delay based on error type (in milliseconds)
   */
  static getRetryDelay(error: ErrorDetails, attemptNumber: number): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds

    switch (error.type) {
      case ErrorType.API_RATE_LIMIT:
        return Math.min(baseDelay * Math.pow(2, attemptNumber) * 2, maxDelay);
      case ErrorType.API_TIMEOUT:
        return Math.min(baseDelay * Math.pow(2, attemptNumber), maxDelay);
      case ErrorType.NETWORK_ERROR:
        return Math.min(baseDelay * Math.pow(2, attemptNumber), maxDelay);
      default:
        return Math.min(baseDelay * attemptNumber, maxDelay);
    }
  }

  /**
   * Log error for debugging purposes
   */
  static logError(error: ErrorDetails, context?: Record<string, any>): void {
    const logData = {
      timestamp: new Date().toISOString(),
      step: error.step,
      type: error.type,
      message: error.message,
      retryable: error.retryable,
      context,
    };

    console.error('ERROR: LangGraph workflow error:', JSON.stringify(logData, null, 2));
  }
}