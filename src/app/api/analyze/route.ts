import { NextRequest, NextResponse } from 'next/server';
import { 
  AnalyzeRequest, 
  AnalyzeResponse, 
  AnalyzeRequestSchema, 
  ErrorType, 
  ERROR_MESSAGES 
} from '@/interfaces/langchain';
import { englishAnalysisWorkflow } from '@/services/langchain';

/**
 * POST /api/analyze
 * Analyzes English sentences using the LangGraph workflow
 * 
 * @param request - NextRequest containing the English phrase and optional translation/context
 * @returns NextResponse with analysis results or error details
 */
export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    console.log('INFO: Analyze API endpoint called');
    
    // Parse and validate request body
    const body = await request.json();
    console.log('DEBUG: Request body received:', {
      hasPhrase: !!body.englishPhrase,
      hasTranslation: !!body.userTranslation,
      hasContext: !!body.context,
      phraseLength: body.englishPhrase?.length || 0
    });

    // Validate input using Zod schema
    const validationResult = AnalyzeRequestSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('ERROR: Request validation failed:', validationResult.error.issues);
      
      const response: AnalyzeResponse = {
        success: false,
        error: {
          type: ErrorType.VALIDATION,
          message: 'Invalid request data',
          userMessage: ERROR_MESSAGES[ErrorType.VALIDATION].description,
          retryable: false,
          suggestedAction: ERROR_MESSAGES[ErrorType.VALIDATION].action,
        },
      };
      
      return NextResponse.json(response, { status: 400 });
    }

    const analyzeRequest: AnalyzeRequest = validationResult.data;

    // Execute the workflow
    console.log('INFO: Starting workflow execution');
    const startTime = Date.now();
    
    const result = await englishAnalysisWorkflow.execute(analyzeRequest);
    
    const executionTime = Date.now() - startTime;
    console.log('INFO: Workflow execution completed:', {
      success: result.success,
      executionTimeMs: executionTime,
      hasData: !!result.data,
      hasError: !!result.error
    });

    // Return successful response
    if (result.success && result.data) {
      console.log('INFO: Analysis successful:', {
        correctness: result.data.correctness,
        alternativesCount: result.data.alternatives.length,
        hasErrors: !!result.data.errors
      });
      
      return NextResponse.json(result, { status: 200 });
    }

    // Return error response
    if (result.error) {
      console.log('ERROR: Analysis failed:', {
        type: result.error.type,
        message: result.error.message,
        retryable: result.error.retryable
      });
      
      const statusCode = getStatusCodeForError(result.error.type);
      return NextResponse.json(result, { status: statusCode });
    }

    // Fallback error case
    console.error('ERROR: Unexpected workflow result state');
    const fallbackResponse: AnalyzeResponse = {
      success: false,
      error: {
        type: ErrorType.UNKNOWN,
        message: 'Unexpected workflow result',
        userMessage: ERROR_MESSAGES[ErrorType.UNKNOWN].description,
        retryable: true,
        suggestedAction: ERROR_MESSAGES[ErrorType.UNKNOWN].action,
      },
    };
    
    return NextResponse.json(fallbackResponse, { status: 500 });

  } catch (error) {
    console.error('ERROR: API endpoint exception:', error);
    
    // Handle different types of errors
    let errorType = ErrorType.UNKNOWN;
    let statusCode = 500;
    
    if (error instanceof SyntaxError) {
      errorType = ErrorType.VALIDATION;
      statusCode = 400;
    } else if (error instanceof Error && error.message.includes('timeout')) {
      errorType = ErrorType.API_TIMEOUT;
      statusCode = 408;
    } else if (error instanceof Error && error.message.includes('rate limit')) {
      errorType = ErrorType.API_RATE_LIMIT;
      statusCode = 429;
    }

    const errorResponse: AnalyzeResponse = {
      success: false,
      error: {
        type: errorType,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        userMessage: ERROR_MESSAGES[errorType].description,
        retryable: errorType !== ErrorType.VALIDATION,
        suggestedAction: ERROR_MESSAGES[errorType].action,
      },
    };

    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

/**
 * GET /api/analyze
 * Health check endpoint for the analyze service
 */
export async function GET(): Promise<NextResponse> {
  try {
    console.log('INFO: Health check endpoint called');
    
    const healthStatus = await englishAnalysisWorkflow.healthCheck();
    const config = englishAnalysisWorkflow.getConfig();
    
    const response = {
      status: healthStatus.status,
      timestamp: new Date().toISOString(),
      service: 'English Analysis API',
      version: config.version,
      details: healthStatus.details,
      config: {
        supportedLanguages: config.supportedLanguages,
        steps: config.steps,
      },
    };
    
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    console.log('INFO: Health check completed:', {
      status: healthStatus.status,
      statusCode
    });
    
    return NextResponse.json(response, { status: statusCode });
    
  } catch (error) {
    console.error('ERROR: Health check failed:', error);
    
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'English Analysis API',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    
    return NextResponse.json(errorResponse, { status: 503 });
  }
}

/**
 * Helper function to map error types to HTTP status codes
 */
function getStatusCodeForError(errorType: ErrorType): number {
  switch (errorType) {
    case ErrorType.VALIDATION:
      return 400;
    case ErrorType.API_TIMEOUT:
      return 408;
    case ErrorType.API_RATE_LIMIT:
      return 429;
    case ErrorType.API_ERROR:
      return 502;
    case ErrorType.NETWORK_ERROR:
      return 503;
    case ErrorType.UNKNOWN:
    default:
      return 500;
  }
}