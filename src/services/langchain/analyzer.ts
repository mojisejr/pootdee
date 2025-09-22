import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { 
  AnalyzerInput, 
  AnalyzerOutput, 
  AnalyzerInputSchema, 
  AnalyzerOutputSchema,
  isValidAnalyzerOutput 
} from '@/interfaces/langchain';
import { aiProviderManager } from './providers';
import { LangGraphErrorHandler } from './errorHandler';

/**
 * Analyzer Agent
 * Provides detailed analysis of English sentences including grammar, usage, and context
 */
export class AnalyzerAgent {
  private static instance: AnalyzerAgent;
  private promptTemplate: ChatPromptTemplate;

  private constructor() {
    // Create the prompt template based on ai-guide.md specifications
    this.promptTemplate = ChatPromptTemplate.fromTemplate(`
You are an expert English language teacher and analyzer. Your task is to provide comprehensive analysis of English sentences for language learners.

ANALYSIS REQUIREMENTS:
1. Evaluate grammar correctness
2. Assess natural usage and fluency
3. Consider context appropriateness
4. Provide constructive feedback
5. Suggest improvements and alternatives
6. Identify specific errors if any

INPUT:
Sentence: "{sentence}"
User Translation: "{userTranslation}"
Context: "{context}"

ANALYSIS FRAMEWORK:
- Grammar: Check syntax, tense usage, word order, agreement
- Usage: Evaluate naturalness, common expressions, register
- Context: Assess appropriateness for given situation
- Alternatives: Provide better or equivalent expressions
- Errors: Identify specific mistakes with explanations

CORRECTNESS LEVELS:
- "correct": Grammar and usage are perfect, natural English
- "partially_correct": Minor issues that don't affect understanding
- "incorrect": Significant errors that affect meaning or clarity

OUTPUT FORMAT (JSON only):
{{
  "correctness": "correct" | "incorrect" | "partially_correct",
  "meaning": "Clear explanation of what the sentence means and its usage",
  "alternatives": ["alternative expression 1", "alternative expression 2", "..."],
  "errors": "Detailed explanation of any errors found, or empty string if none"
}}

EXAMPLES:

Input: "I am go to school."
Output: {{
  "correctness": "incorrect",
  "meaning": "The speaker intends to express going to school, but the grammar is incorrect.",
  "alternatives": ["I am going to school.", "I go to school.", "I will go to school."],
  "errors": "Incorrect verb form: 'am go' should be 'am going' (present continuous) or 'go' (simple present). The auxiliary verb 'am' requires the -ing form of the main verb."
}}

Input: "The weather is beautiful today."
Output: {{
  "correctness": "correct",
  "meaning": "This sentence describes the current weather condition as pleasant and attractive.",
  "alternatives": ["It's a beautiful day today.", "Today's weather is lovely.", "What beautiful weather we're having today!"],
  "errors": ""
}}

Input: "I have been lived here for five years."
Output: {{
  "correctness": "incorrect",
  "meaning": "The speaker wants to express that they have resided in this location for five years.",
  "alternatives": ["I have lived here for five years.", "I have been living here for five years."],
  "errors": "Incorrect perfect tense usage: 'have been lived' mixes present perfect passive with active voice. Use either 'have lived' (present perfect) or 'have been living' (present perfect continuous)."
}}

CONTEXT CONSIDERATIONS:
- If user translation is provided, compare it with the English sentence
- If context is provided, evaluate appropriateness for that situation
- Consider formality level and register
- Suggest context-appropriate alternatives

Respond with JSON only:
`);
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AnalyzerAgent {
    if (!AnalyzerAgent.instance) {
      AnalyzerAgent.instance = new AnalyzerAgent();
    }
    return AnalyzerAgent.instance;
  }

  /**
   * Analyze an English sentence
   */
  async analyzeSentence(input: AnalyzerInput): Promise<AnalyzerOutput> {
    try {
      // Validate input
      const validatedInput = AnalyzerInputSchema.parse(input);
      console.log('DEBUG: Analyzer input validated:', {
        sentence: validatedInput.sentence,
        hasTranslation: !!validatedInput.userTranslation,
        hasContext: !!validatedInput.context,
      });

      // Create the chain
      const chain = this.promptTemplate.pipe(
        aiProviderManager.getModel()
      ).pipe(
        new StringOutputParser()
      );

      // Execute with retry logic
      const result = await aiProviderManager.executeWithRetry(
        async () => {
          const response = await chain.invoke({
            sentence: validatedInput.sentence,
            userTranslation: validatedInput.userTranslation || "Not provided",
            context: validatedInput.context || "Not provided",
          });

          console.log('DEBUG: Raw analyzer response:', response);

          // Parse JSON response
          let parsedResponse: Record<string, unknown>;
          try {
            // Clean the response to extract JSON
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
              throw new Error('No JSON found in response');
            }
            parsedResponse = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
          } catch (parseError) {
            console.error('ERROR: Failed to parse analyzer response as JSON:', parseError);
            throw new Error(`Invalid JSON response from analyzer agent: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
          }

          // Validate the parsed response
          const validatedOutput = AnalyzerOutputSchema.parse(parsedResponse);
          
          if (!isValidAnalyzerOutput(validatedOutput)) {
            throw new Error('Analyzer response does not match expected schema');
          }

          return validatedOutput;
        },
        "Sentence Analyzer"
      );

      console.log('INFO: Sentence analysis completed successfully:', {
        correctness: result.correctness,
        hasErrors: !!result.errors,
        alternativesCount: result.alternatives.length,
      });

      return result;

    } catch (error) {
      console.error('ERROR: Sentence analysis failed:', error);
      
      // Handle specific error types
      if (error instanceof Error && error.message.includes('parse')) {
        const errorDetails = LangGraphErrorHandler.handleAnalyzerError(
          new Error(`Validation error: ${error.message}`)
        );
        throw errorDetails;
      }

      const errorDetails = LangGraphErrorHandler.handleAnalyzerError(error);
      throw errorDetails;
    }
  }

  /**
   * Quick correctness check (simplified version)
   */
  async quickCheck(sentence: string): Promise<"correct" | "incorrect" | "partially_correct"> {
    try {
      const result = await this.analyzeSentence({ sentence });
      return result.correctness;
    } catch (error) {
      console.error('ERROR: Quick check failed:', error);
      return "incorrect";
    }
  }

  /**
   * Get alternatives for a sentence
   */
  async getAlternatives(sentence: string, context?: string): Promise<string[]> {
    try {
      const result = await this.analyzeSentence({ sentence, context });
      return result.alternatives;
    } catch (error) {
      console.error('ERROR: Get alternatives failed:', error);
      return [];
    }
  }

  /**
   * Batch analyze multiple sentences
   */
  async analyzeBatch(inputs: AnalyzerInput[]): Promise<AnalyzerOutput[]> {
    const results: AnalyzerOutput[] = [];
    
    for (const input of inputs) {
      try {
        const result = await this.analyzeSentence(input);
        results.push(result);
      } catch (error) {
        console.error('ERROR: Batch analysis item failed:', error);
        // Add a failed result
        results.push({
          correctness: "incorrect",
          meaning: `Analysis failed: ${error instanceof Error ? error.message : String(error)}`,
          alternatives: [],
          errors: "Unable to analyze due to processing error",
        });
      }
    }

    return results;
  }

  /**
   * Compare user translation with English sentence
   */
  async compareTranslation(sentence: string, userTranslation: string, context?: string): Promise<{
    analysis: AnalyzerOutput;
    translationFeedback: string;
  }> {
    try {
      const analysis = await this.analyzeSentence({ 
        sentence, 
        userTranslation, 
        context 
      });

      // Generate specific translation feedback
      const translationFeedback = this.generateTranslationFeedback(
        sentence, 
        userTranslation, 
        analysis
      );

      return {
        analysis,
        translationFeedback,
      };
    } catch (error) {
      console.error('ERROR: Translation comparison failed:', error);
      throw error;
    }
  }

  /**
   * Generate feedback for user translation
   */
  private generateTranslationFeedback(
    sentence: string, 
    userTranslation: string, 
    analysis: AnalyzerOutput
  ): string {
    if (analysis.correctness === "correct") {
      return `Your translation captures the meaning well. The English sentence "${sentence}" is grammatically correct and natural.`;
    } else if (analysis.correctness === "partially_correct") {
      return `Your translation is on the right track. The English sentence has minor issues: ${analysis.errors}`;
    } else {
      return `Your translation idea is good, but the English sentence needs improvement: ${analysis.errors}. Consider these alternatives: ${analysis.alternatives.join(', ')}`;
    }
  }
}

// Export singleton instance
export const analyzerAgent = AnalyzerAgent.getInstance();