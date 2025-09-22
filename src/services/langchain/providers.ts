import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ProviderConfig } from '@/interfaces/langchain';

/**
 * AI Provider Configuration and Management
 * Currently supports Google AI only
 */
export class AIProviderManager {
  private static instance: AIProviderManager;
  private config: ProviderConfig;
  private model: BaseChatModel | null = null;

  private constructor() {
    this.config = {
      primary: "google",
      timeout: parseInt(process.env.AI_TIMEOUT || "30000"),
      maxRetries: parseInt(process.env.AI_MAX_RETRIES || "3"),
    };

    console.log('INFO: AI Provider Manager initialized with config:', {
      primary: this.config.primary,
      timeout: this.config.timeout,
      maxRetries: this.config.maxRetries,
    });
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AIProviderManager {
    if (!AIProviderManager.instance) {
      AIProviderManager.instance = new AIProviderManager();
    }
    return AIProviderManager.instance;
  }

  /**
   * Initialize Google AI model
   */
  private initializeModel(): void {
    try {
      if (!process.env.GOOGLE_AI_API_KEY) {
        throw new Error('GOOGLE_AI_API_KEY environment variable is required');
      }

      this.model = new ChatGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_AI_API_KEY,
        model: "gemini-1.5-flash",
        temperature: 0.1,
        maxOutputTokens: 2048,
      });

      console.log('INFO: Google AI model initialized successfully');
    } catch (error) {
      console.error('ERROR: Failed to initialize Google AI model:', error);
      throw new Error(`AI Provider initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get the AI model
   */
  getModel(): BaseChatModel {
    if (!this.model) {
      this.initializeModel();
    }
    if (!this.model) {
      throw new Error('AI model is not available');
    }
    return this.model;
  }

  /**
   * Execute a model call with retry logic
   */
  async executeWithRetry<T>(
    operation: (model: BaseChatModel) => Promise<T>,
    context: string = "AI operation",
    maxRetries: number = this.config.maxRetries
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`DEBUG: Attempting ${context} (attempt ${attempt}/${maxRetries})`);
        const model = this.getModel();
        const result = await operation(model);
        console.log(`INFO: ${context} completed successfully on attempt ${attempt}`);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`ERROR: ${context} failed on attempt ${attempt}:`, lastError.message);

        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break;
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`DEBUG: Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error(`${context} failed after ${maxRetries} attempts. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Get current configuration
   */
  getConfig(): ProviderConfig {
    return { ...this.config };
  }

  /**
   * Update configuration (for testing or runtime changes)
   */
  updateConfig(newConfig: Partial<ProviderConfig>): void {
    this.config = { ...this.config, ...newConfig };
    // Reset model to force re-initialization with new config
    this.model = null;
    console.log('INFO: AI Provider configuration updated:', this.config);
  }

  /**
   * Health check for AI provider
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'error'; error?: string }> {
    try {
      const model = this.getModel();
      await model.invoke("Test message");
      return { status: 'healthy' };
    } catch (error) {
      return { 
        status: 'error', 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }
}

// Export singleton instance
export const aiProviderManager = AIProviderManager.getInstance();