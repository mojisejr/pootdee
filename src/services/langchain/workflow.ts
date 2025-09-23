import { analyzerAgent } from './analyzer';
import { 
  WorkflowState, 
  AnalysisMetadata,
  AnalyzerInput,
  AnalyzerOutput
} from '../../interfaces/langchain';
import { createLogger } from '../../lib/logger';

// Create scoped logger for workflow
const logger = createLogger('EnglishAnalysisWorkflow');

// Enhanced workflow interfaces
export interface WorkflowConfig {
  version: string;
  maxInputLength: number;
  timeoutMs: number;
  retryAttempts: number;
  enableLogging: boolean;
  enableStructuredOutput: boolean;
  features: {
    sentenceFiltering: boolean;
    grammarAnalysis: boolean;
    vocabularyAnalysis: boolean;
    contextAnalysis: boolean;
    batchProcessing: boolean;
    healthChecking: boolean;
  };
}

export interface WorkflowHealthStatus {
  isHealthy: boolean;
  status: string;
  details: {
    components: {
      analyzer: {
        isHealthy: boolean;
        lastCheck: string;
        version?: string;
        error?: string;
      };
      workflow: {
        isHealthy: boolean;
        lastCheck: string;
        version: string;
        error?: string;
      };
    };
    lastCheck: string;
    version: string;
    error?: string;
  };
}

export interface EnhancedWorkflowState extends WorkflowState {
  sessionId?: string;
  startTime?: number;
  metadata?: AnalysisMetadata & {
    workflowVersion: string;
    processingSteps: Array<{
      step: string;
      timestamp: string;
      duration: number;
      success: boolean;
    }>;
  };
}

export class EnglishAnalysisWorkflow {
  private static instance: EnglishAnalysisWorkflow;

  private constructor() {
    logger.info('Workflow initialized', {
      component: 'EnglishAnalysisWorkflow',
      action: 'constructor'
    });
  }

  public static getInstance(): EnglishAnalysisWorkflow {
    if (!EnglishAnalysisWorkflow.instance) {
      EnglishAnalysisWorkflow.instance = new EnglishAnalysisWorkflow();
    }
    return EnglishAnalysisWorkflow.instance;
  }

  public async execute(
    englishPhrase: string,
    userTranslation: string,
    context?: string,
    userId?: string
  ): Promise<AnalyzerOutput> {
    const startTime = Date.now();
    const sessionId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info('Starting workflow execution', {
      component: 'EnglishAnalysisWorkflow',
      action: 'execute',
      metadata: {
        sessionId,
        englishPhraseLength: englishPhrase.length,
        userTranslationLength: userTranslation.length,
        hasContext: !!context,
        userId
      }
    });

    // Initialize enhanced workflow state
    const state: EnhancedWorkflowState = {
      englishPhrase,
      userTranslation,
      context,
      isValidSentence: false,
      currentStep: 'filter',
      sessionId,
      startTime,
      metadata: {
        timestamp: new Date().toISOString(),
        processingTimeMs: 0,
        modelUsed: 'google-gemini',
        confidence: 0,
        retryCount: 0,
        version: '2.0.0',
        sessionId,
        workflowVersion: '2.0.0',
        processingSteps: []
      }
    };

    try {
      // Step 1: Sentence filtering
      state.currentStep = 'filter';
      logger.debug('Starting sentence filtering', {
        component: 'EnglishAnalysisWorkflow',
        action: 'sentence_filtering',
        metadata: { sessionId }
      });

      const filterResult = await this.sentenceFilterNode(state);
      state.metadata!.processingSteps.push({
        step: 'sentence_filtering',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        success: filterResult.isValidSentence
      });

      if (!filterResult.isValidSentence) {
        logger.error('Sentence filtering failed', undefined, {
          component: 'EnglishAnalysisWorkflow',
          action: 'sentence_filtering',
          metadata: {
            sessionId,
            reason: filterResult.filterError
          }
        });

        // Return error result with basic structure
        return {
          correctness: 'incorrect',
          meaning: 'Invalid input detected',
          alternatives: [],
          errors: filterResult.filterError || 'Invalid input',
          grammarAnalysis: {
            score: 0,
            starRating: 1,
            issues: [],
            strengths: [],
            recommendations: [],
            tenseAnalysis: {
              detectedTense: 'unknown',
              isCorrect: false,
              explanation: 'Cannot analyze invalid input',
              alternatives: [],
              usage: 'N/A'
            },
            structureAnalysis: {
              pattern: 'unknown',
              isNatural: false,
              explanation: 'Cannot analyze invalid input',
              improvements: [],
              comparison: 'N/A'
            },
            complexity: 'simple' as const
          },
          vocabularyAnalysis: {
            score: 0,
            starRating: 1,
            level: 'beginner',
            appropriateWords: [],
            inappropriateWords: [],
            suggestions: [],
            wordBreakdown: [],
            overallDifficulty: 'easy'
          },
          contextAnalysis: {
            score: 0,
            starRating: 1,
            appropriateness: 'neutral',
            culturalNotes: [],
            usageNotes: [],
            situationalFit: 'Not applicable due to invalid input'
          },
          confidence: 0,
          suggestions: ['Please provide a valid English phrase'],
          overallStarRating: 1
        };
      }

      // Step 2: Analysis
      state.currentStep = 'analyze';
      logger.debug('Starting analysis', {
        component: 'EnglishAnalysisWorkflow',
        action: 'analysis',
        metadata: { sessionId }
      });

      const analysisResult = await this.analyzerNode(filterResult);
      state.metadata!.processingSteps.push({
        step: 'analysis',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        success: !!analysisResult.analysisResult
      });

      if (!analysisResult.analysisResult) {
        logger.error('Analysis failed', undefined, {
          component: 'EnglishAnalysisWorkflow',
          action: 'analysis',
          metadata: {
            sessionId,
            error: analysisResult.analysisError
          }
        });

        throw new Error(analysisResult.analysisError || 'Analysis failed');
      }

      // Step 3: Finalization
      state.currentStep = 'complete';
      const totalProcessingTime = Date.now() - startTime;
      
      logger.info('Workflow execution completed', {
        component: 'EnglishAnalysisWorkflow',
        action: 'execute_complete',
        metadata: {
          sessionId,
          totalProcessingTime,
          correctness: analysisResult.analysisResult.correctness,
          confidence: analysisResult.analysisResult.confidence,
          stepsCompleted: state.metadata!.processingSteps.length
        }
      });

      // Update metadata
      state.metadata!.processingTimeMs = totalProcessingTime;
      state.metadata!.confidence = analysisResult.analysisResult.confidence;

      return analysisResult.analysisResult;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const totalProcessingTime = Date.now() - startTime;

      logger.error('Workflow execution failed', error instanceof Error ? error : undefined, {
        component: 'EnglishAnalysisWorkflow',
        action: 'execute_error',
        metadata: {
          sessionId,
          error: errorMessage,
          currentStep: state.currentStep,
          totalProcessingTime,
          processingSteps: state.metadata!.processingSteps
        }
      });

      // Return error result
      return {
        correctness: 'incorrect',
        meaning: `Analysis failed: ${errorMessage}`,
        alternatives: [],
        errors: errorMessage,
        grammarAnalysis: {
          score: 0,
          starRating: 1,
          issues: [],
          strengths: [],
          recommendations: [],
          tenseAnalysis: {
            detectedTense: 'unknown',
            isCorrect: false,
            explanation: 'Cannot analyze due to error',
            alternatives: [],
            usage: 'N/A'
          },
          structureAnalysis: {
            pattern: 'unknown',
            isNatural: false,
            explanation: 'Cannot analyze due to error',
            improvements: [],
            comparison: 'N/A'
          },
          complexity: 'simple' as const
        },
        vocabularyAnalysis: {
           score: 0,
           starRating: 1,
           level: 'beginner',
           appropriateWords: [],
           inappropriateWords: [],
           suggestions: [],
           wordBreakdown: [],
           overallDifficulty: 'easy'
         },
         contextAnalysis: {
           score: 0,
           starRating: 1,
          appropriateness: 'neutral',
          culturalNotes: [],
          usageNotes: [],
          situationalFit: 'Not applicable due to error'
        },
        confidence: 0,
        suggestions: ['Please try again with a different input'],
        overallStarRating: 1
      };
    }
  }

  private async sentenceFilterNode(state: EnhancedWorkflowState): Promise<EnhancedWorkflowState> {
    const { englishPhrase, userTranslation } = state;

    logger.debug('Performing sentence filtering', {
      component: 'EnglishAnalysisWorkflow',
      action: 'sentenceFilterNode',
      metadata: {
        sessionId: state.sessionId,
        englishPhraseLength: englishPhrase.length,
        userTranslationLength: userTranslation?.length || 0
      }
    });

    // Basic validation
    if (!englishPhrase || englishPhrase.trim().length === 0) {
      return {
        ...state,
        isValidSentence: false,
        filterError: 'English phrase cannot be empty',
        currentStep: 'error'
      };
    }

    if (!userTranslation || userTranslation.trim().length === 0) {
      return {
        ...state,
        isValidSentence: false,
        filterError: 'User translation cannot be empty',
        currentStep: 'error'
      };
    }

    // Length validation
    if (englishPhrase.length > 500) {
      return {
        ...state,
        isValidSentence: false,
        filterError: 'English phrase is too long (maximum 500 characters)',
        currentStep: 'error'
      };
    }

    if (userTranslation.length > 500) {
      return {
        ...state,
        isValidSentence: false,
        filterError: 'Translation is too long (maximum 500 characters)',
        currentStep: 'error'
      };
    }

    // Content validation
    const englishRegex = /^[a-zA-Z0-9\s.,!?'"()-]+$/;
    if (!englishRegex.test(englishPhrase)) {
      return {
        ...state,
        isValidSentence: false,
        filterError: 'English phrase contains invalid characters',
        currentStep: 'error'
      };
    }

    logger.debug('Sentence filtering passed', {
      component: 'EnglishAnalysisWorkflow',
      action: 'sentenceFilterNode',
      metadata: {
        sessionId: state.sessionId,
        result: 'valid'
      }
    });

    return {
      ...state,
      isValidSentence: true,
      currentStep: 'analyze'
    };
  }

  private async analyzerNode(state: EnhancedWorkflowState): Promise<EnhancedWorkflowState> {
    const { englishPhrase, userTranslation, context } = state;

    logger.debug('Performing analysis', {
      component: 'EnglishAnalysisWorkflow',
      action: 'analyzerNode',
      metadata: {
        sessionId: state.sessionId,
        hasContext: !!context
      }
    });

    try {
      const analyzerInput: AnalyzerInput = {
        sentence: englishPhrase,
        userTranslation,
        context
      };

      const result = await analyzerAgent.analyzeSentence(analyzerInput);

      logger.debug('Analysis completed successfully', {
        component: 'EnglishAnalysisWorkflow',
        action: 'analyzerNode',
        metadata: {
          sessionId: state.sessionId,
          correctness: result.correctness,
          confidence: result.confidence
        }
      });

      return {
        ...state,
        analysisResult: result,
        currentStep: 'complete'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      
      logger.error('Analysis node failed', error instanceof Error ? error : undefined, {
        component: 'EnglishAnalysisWorkflow',
        action: 'analyzerNode',
        metadata: {
          sessionId: state.sessionId,
          error: errorMessage
        }
      });

      return {
        ...state,
        analysisError: errorMessage,
        currentStep: 'error'
      };
    }
  }

  public async healthCheck(): Promise<WorkflowHealthStatus> {
    logger.debug('Performing health check', {
      component: 'EnglishAnalysisWorkflow',
      action: 'healthCheck'
    });

    try {
      // Test analyzer with a simple check
      const analyzerTest = await analyzerAgent.quickCheck('Hello world');
      const analyzerHealthy = analyzerTest !== undefined;
      
      const status: WorkflowHealthStatus = {
        isHealthy: analyzerHealthy,
        status: analyzerHealthy ? 'healthy' : 'unhealthy',
        details: {
          components: {
            analyzer: {
              isHealthy: analyzerHealthy,
              lastCheck: new Date().toISOString(),
              version: '2.0.0'
            },
            workflow: {
              isHealthy: true,
              lastCheck: new Date().toISOString(),
              version: '2.0.0'
            }
          },
          lastCheck: new Date().toISOString(),
          version: '2.0.0'
        }
      };

      logger.info('Health check completed', {
        component: 'EnglishAnalysisWorkflow',
        action: 'healthCheck',
        metadata: {
          isHealthy: status.isHealthy,
          version: status.details.version
        }
      });

      return status;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Health check failed';
      
      logger.error('Health check failed', error instanceof Error ? error : undefined, {
        component: 'EnglishAnalysisWorkflow',
        action: 'healthCheck',
        metadata: { error: errorMessage }
      });

      return {
        isHealthy: false,
        status: 'unhealthy',
        details: {
          components: {
            analyzer: {
              isHealthy: false,
              lastCheck: new Date().toISOString(),
              error: errorMessage
            },
            workflow: {
              isHealthy: false,
              lastCheck: new Date().toISOString(),
              version: '2.0.0',
              error: errorMessage
            }
          },
          lastCheck: new Date().toISOString(),
          version: '2.0.0',
          error: errorMessage
        }
      };
    }
  }

  public getConfig(): WorkflowConfig {
    logger.debug('Getting workflow configuration', {
      component: 'EnglishAnalysisWorkflow',
      action: 'getConfig'
    });

    return {
      version: '2.0.0',
      maxInputLength: 500,
      timeoutMs: 30000,
      retryAttempts: 3,
      enableLogging: true,
      enableStructuredOutput: true,
      features: {
        sentenceFiltering: true,
        grammarAnalysis: true,
        vocabularyAnalysis: true,
        contextAnalysis: true,
        batchProcessing: true,
        healthChecking: true
      }
    };
  }
}

// Export singleton instance
export const englishAnalysisWorkflow = EnglishAnalysisWorkflow.getInstance();