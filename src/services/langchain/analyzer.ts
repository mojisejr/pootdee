import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import {
  AnalysisResult,
  AnalyzerInput,
  AnalyzerOutput,
  AnalyzerInputSchema,
  AnalyzerOutputSchema,
  AnalysisMetadata,
  parseStructuredOutput,
  createAnalysisMetadata,
  isValidAnalyzerOutput,
} from "../../interfaces/langchain";
import { createLogger } from "../../lib/logger";

// Create scoped logger for analyzer service
const logger = createLogger("AnalyzerAgent");

// Additional result types for enhanced functionality
export interface QuickCheckResult {
  correctness: "correct" | "incorrect" | "partially_correct";
  reason: string;
  confidence: number;
}

export interface AlternativesResult {
  alternatives: string[];
  originalSentence: string;
  context?: string;
}

export interface BatchAnalysisResult {
  results: AnalyzerOutput[];
  errors: Array<{ index: number; error: string }>;
  totalProcessed: number;
  successCount: number;
  errorCount: number;
}

export interface TranslationComparisonResult {
  original: string;
  translation: string;
  accuracy: number;
  differences: string[];
  suggestions: string[];
  context?: string;
}

// Enhanced analyzer output with metadata
export interface EnhancedAnalyzerOutput extends AnalyzerOutput {
  metadata?: AnalysisMetadata;
}

class AnalyzerAgent {
  private model: ChatGoogleGenerativeAI;
  private promptTemplate: ChatPromptTemplate;

  private constructor() {
    logger.info("Initializing AnalyzerAgent with structured output support");

    try {
      // Set GOOGLE_API_KEY for the library if not already set
      if (!process.env.GOOGLE_API_KEY && process.env.GOOGLE_AI_API_KEY) {
        process.env.GOOGLE_API_KEY = process.env.GOOGLE_AI_API_KEY;
      }

      this.model = new ChatGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_AI_API_KEY,
        model: "gemini-1.5-flash",
        temperature: 0.3,
        maxOutputTokens: 2048,
      });

      logger.debug("ChatGoogleGenerativeAI model initialized", {
        metadata: {
          model: "gemini-2.5-flash",
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      });

      this.promptTemplate = ChatPromptTemplate.fromTemplate(`
        เธอเป็นผู้ช่วยวิเคราะห์ภาษาอังกฤษสำหรับคนไทยที่กำลังเรียนรู้ 
        ช่วยวิเคราะห์ประโยคภาษาอังกฤษที่ให้มา และให้ feedback แบบเป็นกันเอง และเข้าใจ painpoint ของผู้ใช้
        
        ประโยคที่ต้องวิเคราะห์: {sentence}
        บริบทที่ผู้ใช้เอาประโยคไปใช้: {context} 
        คำแปลของผู้ใช้ที่ผู้ใช้คิดว่าประโยคนี้แปลว่าอะไร: {userTranslation}
        
        ให้วิเคราะห์และส่งผลลัพธ์เป็น JSON ที่มีโครงสร้างดังนี้:
        
        1. correctness: ประเมินว่า "correct", "incorrect", หรือ "partially_correct"
        2. meaning: ถ้าผู้ใช้ไม่ได้ให้ {userTranslation} ก็ให้แปลตามปกติ แต่ถ้าผู้ใช้ให้มา ให้ตรวจด้วยว่าแปลถูกหรือเปล่า และที่ถูกคืออะไรตามประโยคที่ให้มา 
        3. alternatives: ยกตัวอย่างประโยคทางเลือกที่ดีกว่า (array ของ string)
        4. errors: ชี้ข้อผิดพลาดและวิธีแก้ไขแบบเป็นกันเอง (string)
        5. grammarAnalysis: วิเคราะห์ grammar ประกอบด้วย [ตอบเป็นภาษาไทย]:
           - score: คะแนน 0-100
           - issues: array ของปัญหา grammar (type, description, severity, suggestion)
           - strengths: จุดแข็งด้าน grammar (array ของ string)
           - recommendations: คำแนะนำปรับปรุง (array ของ string)
        6. vocabularyAnalysis: วิเคราะห์คำศัพท์ ประกอบด้วย [ตอบเป็นภาษาไทย]:
           - score: คะแนน 0-100
           - level: ระดับความยาก "beginner", "intermediate", "advanced"
           - appropriateWords: คำที่ใช้ถูกต้อง (array ของ string)
           - inappropriateWords: คำที่ใช้ไม่เหมาะสม (array ของ string)
           - suggestions: คำแนะนำคำศัพท์ (array ของ object) **Required**
        7. contextAnalysis: วิเคราะห์บริบท ประกอบด้วย [ตอบเป็นภาษาไทย]:
           - score: คะแนน 0-100
           - appropriateness: "formal", "informal", "neutral"
           - culturalNotes: หมายเหตุทางวัฒนธรรม (array ของ string)
           - usageNotes: หมายเหตุการใช้งาน (array ของ string)
           - situationalFit: ความเหมาะสมกับสถานการณ์ (string)
        8. confidence: ความมั่นใจในการวิเคราะห์ 0.0-1.0
        9. suggestions: คำแนะนำที่จะสรุปชีชัดเลยว่า ประโยคที่ใช้ใช้ได้จริงหรือเปล่าในบริบทที่ให้มา (ถ้าให้) และ ควรจะปรับปรุงยังไงแบบเอาไปใช้จริงได้ (array ของ string) **Required**
        
        อธิบายทุกอย่างเป็นภาษาไทยแบบเป็นกันเอง เหมือนเพื่อนคุยกัน ให้กำลังใจและช่วยให้เข้าใจ
        สำคัญคือต้องอธิบายไม่ใช่แค่ว่าผิดตรงไหน แต่ทำไมผิด และจะปรับปรุงยังไง
        สำหรับ technical terms หรือ grammar terms ให้ใช้ภาษาอังกฤษตามปกติ
      `);

      logger.info("AnalyzerAgent initialization completed successfully");
    } catch (error) {
      logger.error("Failed to initialize AnalyzerAgent", error as Error);
      throw error;
    }
  }

  /**
   * Analyze a sentence with comprehensive structured output
   */
  async analyzeSentence(input: AnalyzerInput): Promise<EnhancedAnalyzerOutput> {
    const startTime = Date.now();
    logger.info("Starting sentence analysis", {
      metadata: {
        hasContext: !!input.context,
        hasUserTranslation: !!input.userTranslation,
      },
    });

    try {
      // Validate input
      const validationResult = AnalyzerInputSchema.safeParse(input);
      if (!validationResult.success) {
        const error = new Error(
          `Invalid input: ${validationResult.error.issues.map((i) => i.message).join(", ")}`
        );
        logger.error("Input validation failed", error, {
          metadata: {
            inputSentence: input.sentence.substring(0, 50) + "...",
          },
        });
        throw error;
      }

      logger.debug("Input validation passed", {
        metadata: {
          sentenceLength: input.sentence.length,
        },
      });

      // Create structured output chain
      const structuredModel =
        this.model.withStructuredOutput(AnalyzerOutputSchema);
      const chain = this.promptTemplate.pipe(structuredModel);

      logger.debug("Invoking AI model for analysis", {
        metadata: {
          modelType: "structured",
        },
      });

      // Execute analysis
      const result = await this.executeWithRetry(
        () =>
          chain.invoke({
            sentence: input.sentence,
            context: input.context || "No specific context provided",
            userTranslation: input.userTranslation || "No translation provided",
          }),
        3
      );

      const processingTime = Date.now() - startTime;

      // Validate result
      const parsedResult = parseStructuredOutput(AnalyzerOutputSchema, result);
      if (!parsedResult.success) {
        const error = new Error(
          `Invalid analysis result: ${parsedResult.error.message}`
        );
        logger.error("Analysis result validation failed", error, {
          metadata: {
            processingTime,
          },
        });
        throw error;
      }

      // Add metadata
      const metadata = createAnalysisMetadata(
        "gemini-1.5-flash",
        processingTime,
        parsedResult.data.confidence,
        0
      );

      const enhancedResult: EnhancedAnalyzerOutput = {
        ...parsedResult.data,
        metadata,
      };

      logger.info("Sentence analysis completed successfully", {
        metadata: {
          processingTime,
          correctness: enhancedResult.correctness,
          confidence: enhancedResult.confidence,
          grammarScore: enhancedResult.grammarAnalysis?.score,
          vocabularyScore: enhancedResult.vocabularyAnalysis?.score,
        },
      });

      return enhancedResult;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error("Sentence analysis failed", error as Error, {
        metadata: {
          processingTime,
          inputSentence: input.sentence.substring(0, 50) + "...",
        },
      });
      throw error;
    }
  }

  /**
   * Quick correctness check with logging
   */
  async quickCheck(sentence: string): Promise<QuickCheckResult> {
    const startTime = Date.now();
    logger.info("Starting quick correctness check", {
      metadata: {
        sentenceLength: sentence.length,
      },
    });

    try {
      const result = await this.executeWithRetry(async () => {
        const response = await this.model.invoke([
          {
            role: "user",
            content: `Quickly assess if this English sentence is grammatically correct and natural: "${sentence}". Respond with just "correct", "incorrect", or "partially_correct" and a brief reason.`,
          },
        ]);

        const content = response.content.toString().toLowerCase();
        let correctness: "correct" | "incorrect" | "partially_correct" =
          "incorrect";

        if (content.includes("correct") && !content.includes("incorrect")) {
          correctness = "correct";
        } else if (
          content.includes("partially") ||
          content.includes("partial")
        ) {
          correctness = "partially_correct";
        }

        return {
          correctness,
          reason: response.content.toString(),
          confidence: 0.8,
        };
      }, 2);

      const processingTime = Date.now() - startTime;

      logger.info("Quick check completed", {
        metadata: {
          processingTime,
          correctness: result.correctness,
          confidence: result.confidence,
        },
      });

      return result;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error("Quick check failed", error as Error, {
        metadata: {
          processingTime,
          sentence: sentence.substring(0, 50) + "...",
        },
      });
      throw error;
    }
  }

  /**
   * Get alternative expressions with logging
   */
  async getAlternatives(
    sentence: string,
    context?: string
  ): Promise<AlternativesResult> {
    const startTime = Date.now();
    logger.info("Getting alternative expressions", {
      metadata: {
        hasContext: !!context,
        sentenceLength: sentence.length,
      },
    });

    try {
      const result = await this.executeWithRetry(async () => {
        const contextPrompt = context ? ` in the context of: ${context}` : "";
        const response = await this.model.invoke([
          {
            role: "user",
            content: `Provide 3-5 alternative ways to express this English sentence: "${sentence}"${contextPrompt}. Focus on natural, commonly used expressions.`,
          },
        ]);

        const alternatives = response.content
          .toString()
          .split("\n")
          .filter((line) => line.trim().length > 0)
          .map((line) => line.replace(/^\d+\.?\s*/, "").trim())
          .filter((alt) => alt.length > 0)
          .slice(0, 5);

        return {
          alternatives,
          originalSentence: sentence,
          context: context || undefined,
        };
      }, 2);

      const processingTime = Date.now() - startTime;

      logger.info("Alternative expressions generated", {
        metadata: {
          processingTime,
          alternativeCount: result.alternatives.length,
        },
      });

      return result;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error("Failed to get alternatives", error as Error, {
        metadata: {
          processingTime,
          sentence: sentence.substring(0, 50) + "...",
        },
      });
      throw error;
    }
  }

  /**
   * Analyze multiple sentences in batch with logging
   */
  async analyzeBatch(inputs: AnalyzerInput[]): Promise<BatchAnalysisResult> {
    const startTime = Date.now();
    logger.info("Starting batch analysis", {
      metadata: {
        batchSize: inputs.length,
      },
    });

    try {
      const results: AnalyzerOutput[] = [];
      const errors: Array<{ index: number; error: string }> = [];

      for (let i = 0; i < inputs.length; i++) {
        try {
          logger.debug(`Processing batch item ${i + 1}/${inputs.length}`, {
            metadata: {
              itemIndex: i,
            },
          });

          const result = await this.analyzeSentence(inputs[i]);
          results.push(result);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          errors.push({ index: i, error: errorMessage });

          logger.error(`Batch item ${i + 1} failed`, error as Error, {
            metadata: {
              itemIndex: i,
            },
          });
        }
      }

      const processingTime = Date.now() - startTime;
      const successCount = results.length;
      const errorCount = errors.length;

      logger.info("Batch analysis completed", {
        metadata: {
          processingTime,
          totalItems: inputs.length,
          successCount,
          errorCount,
          successRate: (successCount / inputs.length) * 100,
        },
      });

      return {
        results,
        errors,
        totalProcessed: inputs.length,
        successCount,
        errorCount,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error("Batch analysis failed", error as Error, {
        metadata: {
          processingTime,
          batchSize: inputs.length,
        },
      });
      throw error;
    }
  }

  /**
   * Compare translation with original with logging
   */
  async compareTranslation(
    original: string,
    translation: string,
    context?: string
  ): Promise<TranslationComparisonResult> {
    const startTime = Date.now();
    logger.info("Starting translation comparison", {
      metadata: {
        hasContext: !!context,
        originalLength: original.length,
        translationLength: translation.length,
      },
    });

    try {
      const result = await this.executeWithRetry(async () => {
        const contextPrompt = context ? ` Context: ${context}` : "";
        const response = await this.model.invoke([
          {
            role: "user",
            content: `Compare this translation accuracy:
              Original: "${original}"
              Translation: "${translation}"${contextPrompt}
              
              Rate accuracy (0-100), identify differences, and suggest improvements.`,
          },
        ]);

        const content = response.content.toString();
        const accuracyMatch = content.match(
          /(\d+)(?:\s*\/\s*100|\s*%|\s*out\s+of\s+100)/i
        );
        const accuracy = accuracyMatch ? parseInt(accuracyMatch[1]) : 75;

        return {
          original,
          translation,
          accuracy,
          differences: [content],
          suggestions: [`Review the analysis: ${content}`],
          context,
        };
      }, 2);

      const processingTime = Date.now() - startTime;

      logger.info("Translation comparison completed", {
        metadata: {
          processingTime,
          accuracy: result.accuracy,
        },
      });

      return result;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error("Translation comparison failed", error as Error, {
        metadata: {
          processingTime,
        },
      });
      throw error;
    }
  }

  /**
   * Execute operation with retry logic and logging
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug(`Executing operation attempt ${attempt}/${maxRetries}`, {
          metadata: {
            attempt,
            maxRetries,
          },
        });

        const result = await operation();

        if (attempt > 1) {
          logger.info(`Operation succeeded on retry attempt ${attempt}`, {
            metadata: {
              attempt,
              maxRetries,
            },
          });
        }

        return result;
      } catch (error) {
        lastError = error as Error;

        logger.error(
          `Operation failed on attempt ${attempt}/${maxRetries}`,
          lastError,
          {
            metadata: {
              attempt,
              maxRetries,
              willRetry: attempt < maxRetries,
            },
          }
        );

        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt - 1) * 1000;
        logger.debug(`Waiting ${delay}ms before retry`, {
          metadata: {
            delay,
            nextAttempt: attempt + 1,
          },
        });

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    logger.error("All retry attempts exhausted", lastError!, {
      metadata: {
        maxRetries,
        finalError: lastError?.message,
      },
    });

    throw lastError;
  }

  // Singleton pattern
  private static instance: AnalyzerAgent;

  static getInstance(): AnalyzerAgent {
    if (!AnalyzerAgent.instance) {
      AnalyzerAgent.instance = new AnalyzerAgent();
    }
    return AnalyzerAgent.instance;
  }
}

// Export singleton instance
export const analyzerAgent = AnalyzerAgent.getInstance();
