import { NextRequest, NextResponse } from 'next/server';
import { 
  englishAnalysisWorkflow,
  WorkflowHealthStatus,
  WorkflowConfig
} from '../../../services/langchain/workflow';
import { 
  AnalyzeRequest, 
  AnalyzeResponse, 
  ErrorType, 
  createErrorDetails
} from '../../../interfaces/langchain';
import { createLogger } from '../../../lib/logger';

const logger = createLogger('AnalyzeAPI');

/**
 * POST /api/analyze
 * Analyzes English phrases for grammar, vocabulary, and context
 */
export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    logger.info('Analysis request received');
    
    const body = await request.json();
    const { englishPhrase, userTranslation, context, options } = body as AnalyzeRequest;

    // Validate required fields
    if (!englishPhrase || typeof englishPhrase !== 'string' || englishPhrase.trim().length === 0) {
      const errorDetails = createErrorDetails(
        "filter",
        ErrorType.VALIDATION,
        "English phrase is required and must be a non-empty string",
        "กรุณากรอกประโยคภาษาอังกฤษ",
        false,
        "กรอกประโยคภาษาอังกฤษที่ต้องการวิเคราะห์"
      );

      return NextResponse.json({
        success: false,
        error: {
          ...errorDetails,
          retryable: errorDetails.retryable || false
        }
      }, { status: 400 });
    }

    // Execute analysis workflow
    logger.info('Starting analysis workflow', { 
      metadata: {
        hasTranslation: !!userTranslation,
        hasContext: !!context
      }
    });

    const startTime = Date.now();
    const result = await englishAnalysisWorkflow.execute(
      englishPhrase,
      userTranslation || '',
      context,
      options?.sessionId
    );
    const processingTime = Date.now() - startTime;

    logger.info('Analysis completed successfully', {
      metadata: {
        correctness: result.correctness,
        confidence: result.confidence
      }
    });

    const response: AnalyzeResponse = {
      success: true,
      data: result,
      metadata: options?.includeMetadata ? {
        timestamp: new Date().toISOString(),
        processingTimeMs: processingTime,
        modelUsed: 'gemini-2.5-flash',
        confidence: result.confidence,
        retryCount: 0,
        version: '1.0.0',
        sessionId: options?.sessionId
      } : undefined
    };

    return NextResponse.json(response);

  } catch (error) {
    logger.error('Analysis failed', error instanceof Error ? error : undefined);

    const errorDetails = createErrorDetails(
      "analyze",
      ErrorType.UNKNOWN,
      error instanceof Error ? error.message : 'Unknown error occurred',
      "เกิดข้อผิดพลาดในการวิเคราะห์ กรุณาลองใหม่อีกครั้ง",
      true,
      "ลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบหากปัญหายังคงอยู่"
    );

    return NextResponse.json({
      success: false,
      error: {
        ...errorDetails,
        retryable: errorDetails.retryable || false
      }
    }, { status: getStatusCodeForError(errorDetails.type) });
  }
}

/**
 * GET /api/analyze
 * Health check endpoint for the analyze service
 */
export async function GET(): Promise<NextResponse<{ status: string; timestamp: string; health: WorkflowHealthStatus; config: WorkflowConfig }>> {
  try {
    const health = await englishAnalysisWorkflow.healthCheck();
    const config = englishAnalysisWorkflow.getConfig();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: health.details.lastCheck,
      health,
      config
    });
  } catch (error) {
    logger.error('Health check failed', error instanceof Error ? error : undefined);
    
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        timestamp: new Date().toISOString(),
        health: {
          isHealthy: false,
          status: 'unhealthy',
          details: {
            components: {
              analyzer: {
                isHealthy: false,
                lastCheck: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error'
              },
              workflow: {
                isHealthy: false,
                lastCheck: new Date().toISOString(),
                version: '1.0.0',
                error: error instanceof Error ? error.message : 'Unknown error'
              }
            },
            lastCheck: new Date().toISOString(),
            version: '1.0.0',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        },
        config: englishAnalysisWorkflow.getConfig()
      },
      { status: 500 }
    );
  }
}

/**
 * Maps error types to appropriate HTTP status codes
 */
function getStatusCodeForError(errorType: ErrorType): number {
  switch (errorType) {
    case ErrorType.VALIDATION:
      return 400;
    case ErrorType.API_TIMEOUT:
      return 408;
    case ErrorType.API_RATE_LIMIT:
      return 429;
    case ErrorType.UNKNOWN:
    default:
      return 500;
  }
}