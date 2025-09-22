import { 
  WorkflowState, 
  AnalyzeRequest, 
  AnalyzeResponse, 
  ErrorType, 
  ERROR_MESSAGES
} from '@/interfaces/langchain';
import { SentenceFilterAgent } from './sentenceFilter';
import { AnalyzerAgent } from './analyzer';
import { LangGraphErrorHandler } from './errorHandler';

/**
 * EnglishAnalysisWorkflow - Orchestrates the complete English analysis process
 * Implements a simplified sequential workflow for sentence filtering and analysis
 */
export class EnglishAnalysisWorkflow {
  private static instance: EnglishAnalysisWorkflow;
  private sentenceFilter: SentenceFilterAgent;
  private analyzer: AnalyzerAgent;

  private constructor() {
    this.sentenceFilter = SentenceFilterAgent.getInstance();
    this.analyzer = AnalyzerAgent.getInstance();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): EnglishAnalysisWorkflow {
    if (!EnglishAnalysisWorkflow.instance) {
      EnglishAnalysisWorkflow.instance = new EnglishAnalysisWorkflow();
    }
    return EnglishAnalysisWorkflow.instance;
  }

  /**
   * Execute the workflow with the given input
   */
  public async execute(input: AnalyzeRequest): Promise<AnalyzeResponse> {
    try {
      console.log('INFO: Starting English analysis workflow:', {
        phrase: input.englishPhrase,
        hasTranslation: !!input.userTranslation,
        hasContext: !!input.context
      });

      // Initialize state
      const initialState: WorkflowState = {
        englishPhrase: input.englishPhrase,
        userTranslation: input.userTranslation,
        context: input.context,
        isValidSentence: false,
        currentStep: "filter",
      };

      // Step 1: Sentence Filter
      const filterResult = await this.sentenceFilterNode(initialState);
      
      if (!filterResult.isValidSentence) {
        console.log('INFO: Sentence filter rejected input:', filterResult.filterError);
        return {
          success: false,
          error: {
            type: ErrorType.VALIDATION,
            message: filterResult.filterError || "Invalid sentence",
            userMessage: ERROR_MESSAGES[ErrorType.VALIDATION].description,
            retryable: false,
            suggestedAction: ERROR_MESSAGES[ErrorType.VALIDATION].action,
          },
        };
      }

      // Step 2: Analyzer
      const analysisResult = await this.analyzerNode(filterResult);
      
      if (analysisResult.analysisError) {
        console.log('ERROR: Analysis failed:', analysisResult.analysisError);
        return {
          success: false,
          error: {
            type: ErrorType.API_ERROR,
            message: analysisResult.analysisError,
            userMessage: ERROR_MESSAGES[ErrorType.API_ERROR].description,
            retryable: true,
            suggestedAction: ERROR_MESSAGES[ErrorType.API_ERROR].action,
          },
        };
      }

      if (!analysisResult.analysisResult) {
        console.log('ERROR: No analysis result returned');
        return {
          success: false,
          error: {
            type: ErrorType.UNKNOWN,
            message: "No analysis result returned",
            userMessage: ERROR_MESSAGES[ErrorType.UNKNOWN].description,
            retryable: true,
            suggestedAction: ERROR_MESSAGES[ErrorType.UNKNOWN].action,
          },
        };
      }

      console.log('INFO: Workflow completed successfully');
      return {
        success: true,
        data: analysisResult.analysisResult,
      };
    } catch (error) {
      console.error("ERROR: Workflow execution failed:", error);
      return {
        success: false,
        error: {
          type: ErrorType.UNKNOWN,
          message: error instanceof Error ? error.message : "Unknown error",
          userMessage: ERROR_MESSAGES[ErrorType.UNKNOWN].description,
          retryable: true,
          suggestedAction: ERROR_MESSAGES[ErrorType.UNKNOWN].action,
        },
      };
    }
  }

  /**
   * Sentence filter node - validates and cleans input sentence
   */
  private async sentenceFilterNode(state: WorkflowState): Promise<WorkflowState> {
    try {
      console.log('DEBUG: Executing sentence filter node');
      
      const filterInput = {
        englishPhrase: state.englishPhrase,
        userTranslation: state.userTranslation,
        context: state.context,
      };

      const filterOutput = await this.sentenceFilter.filterSentence(filterInput);
      
      return {
        ...state,
        isValidSentence: filterOutput.isValid,
        filterError: filterOutput.isValid ? undefined : filterOutput.reason,
        currentStep: filterOutput.isValid ? "analyze" : "error",
      };
    } catch (error) {
      console.error('ERROR: Sentence filter node failed:', error);
      const errorDetails = LangGraphErrorHandler.handleFilterError(error);
       
       return {
         ...state,
         isValidSentence: false,
         filterError: errorDetails.userMessage,
         currentStep: "error",
       };
    }
  }

  /**
   * Analyzer node - performs detailed analysis of the sentence
   */
  private async analyzerNode(state: WorkflowState): Promise<WorkflowState> {
    try {
      console.log('DEBUG: Executing analyzer node');
      
      const analyzerInput = {
        sentence: state.englishPhrase,
        userTranslation: state.userTranslation,
        context: state.context,
      };

      const analysisOutput = await this.analyzer.analyzeSentence(analyzerInput);
      
      return {
        ...state,
        analysisResult: analysisOutput,
        currentStep: "complete",
      };
    } catch (error) {
      console.error('ERROR: Analyzer node failed:', error);
      const errorDetails = LangGraphErrorHandler.handleAnalyzerError(error);
       
       return {
         ...state,
         analysisError: errorDetails.userMessage,
         currentStep: "error",
       };
    }
  }

  /**
   * Health check for the workflow
   */
  public async healthCheck(): Promise<{ status: string; details: Record<string, unknown> }> {
     try {
       // Test sentence filter with a simple validation
       const filterTest = await this.sentenceFilter.quickValidate('Hello world');
       
       // Test analyzer with a simple check
       const analyzerTest = await this.analyzer.quickCheck('Hello world');
       
       const filterHealthy = filterTest === true;
       const analyzerHealthy = analyzerTest !== undefined;
       const allHealthy = filterHealthy && analyzerHealthy;
       
       return {
         status: allHealthy ? 'healthy' : 'unhealthy',
         details: {
           sentenceFilter: { status: filterHealthy ? 'healthy' : 'unhealthy', test: filterTest },
           analyzer: { status: analyzerHealthy ? 'healthy' : 'unhealthy', test: analyzerTest },
         },
       };
     } catch (error) {
       console.error('ERROR: Workflow health check failed:', error);
       return {
         status: 'unhealthy',
         details: {
           error: error instanceof Error ? error.message : 'Unknown error',
         },
       };
     }
   }

  /**
   * Get workflow configuration
   */
  public getConfig(): Record<string, unknown> {
    return {
      name: 'EnglishAnalysisWorkflow',
      version: '1.0.0',
      steps: ['filter', 'analyze'],
      supportedLanguages: ['en'],
    };
  }
}