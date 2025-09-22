import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { 
  SentenceFilterInput, 
  SentenceFilterOutput, 
  SentenceFilterInputSchema, 
  SentenceFilterOutputSchema,
  isValidSentenceFilterOutput 
} from '@/interfaces/langchain';
import { aiProviderManager } from './providers';
import { LangGraphErrorHandler } from './errorHandler';

/**
 * Sentence Filter Agent
 * Validates if the input is a proper English sentence suitable for analysis
 */
export class SentenceFilterAgent {
  private static instance: SentenceFilterAgent;
  private promptTemplate: ChatPromptTemplate;

  private constructor() {
    // Create the prompt template based on ai-guide.md specifications
    this.promptTemplate = ChatPromptTemplate.fromTemplate(`
You are a sentence validation expert. Your task is to determine if the given English phrase is a valid, complete sentence suitable for language learning analysis.

VALIDATION RULES:
1. Must be a complete sentence (has subject and predicate)
2. Must be in English language
3. Must be a single sentence (not multiple sentences)
4. Must not be a fragment, phrase, or incomplete thought
5. Must not contain inappropriate content
6. Must be suitable for language learning context

INPUT:
English Phrase: "{englishPhrase}"
User Translation: "{userTranslation}"
Context: "{context}"

ANALYSIS REQUIREMENTS:
- Evaluate if the phrase meets all validation rules
- Provide clear reasoning for your decision
- If valid, clean the sentence (fix minor typos, normalize punctuation)
- Assign confidence score (0.0 to 1.0)

OUTPUT FORMAT (JSON only):
{{
  "isValid": boolean,
  "reason": "Clear explanation of why the sentence is valid or invalid",
  "cleanedSentence": "Cleaned version of the sentence if valid, null if invalid",
  "confidence": number between 0.0 and 1.0
}}

EXAMPLES:

Input: "Hello world"
Output: {{
  "isValid": false,
  "reason": "This is a greeting phrase, not a complete sentence with subject and predicate",
  "cleanedSentence": null,
  "confidence": 0.9
}}

Input: "I am learning English."
Output: {{
  "isValid": true,
  "reason": "Complete sentence with subject 'I', verb 'am learning', and object 'English'",
  "cleanedSentence": "I am learning English.",
  "confidence": 0.95
}}

Input: "The quick brown fox jumps over the lazy dog"
Output: {{
  "isValid": true,
  "reason": "Complete sentence with clear subject, verb, and object structure",
  "cleanedSentence": "The quick brown fox jumps over the lazy dog.",
  "confidence": 0.98
}}

Respond with JSON only:
`);
  }

  /**
   * Get singleton instance
   */
  static getInstance(): SentenceFilterAgent {
    if (!SentenceFilterAgent.instance) {
      SentenceFilterAgent.instance = new SentenceFilterAgent();
    }
    return SentenceFilterAgent.instance;
  }

  /**
   * Validate and filter an English sentence
   */
  async filterSentence(input: SentenceFilterInput): Promise<SentenceFilterOutput> {
    try {
      // Validate input
      const validatedInput = SentenceFilterInputSchema.parse(input);
      console.log('DEBUG: Sentence filter input validated:', {
        englishPhrase: validatedInput.englishPhrase,
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
        async (model) => {
          const response = await chain.invoke({
            englishPhrase: validatedInput.englishPhrase,
            userTranslation: validatedInput.userTranslation || "Not provided",
            context: validatedInput.context || "Not provided",
          });

          console.log('DEBUG: Raw filter response:', response);

          // Parse JSON response
          let parsedResponse: any;
          try {
            // Clean the response to extract JSON
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
              throw new Error('No JSON found in response');
            }
            parsedResponse = JSON.parse(jsonMatch[0]);
          } catch (parseError) {
            console.error('ERROR: Failed to parse filter response as JSON:', parseError);
            throw new Error(`Invalid JSON response from filter agent: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
          }

          // Validate the parsed response
          const validatedOutput = SentenceFilterOutputSchema.parse(parsedResponse);
          
          if (!isValidSentenceFilterOutput(validatedOutput)) {
            throw new Error('Filter response does not match expected schema');
          }

          return validatedOutput;
        },
        "Sentence Filter"
      );

      console.log('INFO: Sentence filter completed successfully:', {
        isValid: result.isValid,
        confidence: result.confidence,
        hasCleanedSentence: !!result.cleanedSentence,
      });

      return result;

    } catch (error) {
      console.error('ERROR: Sentence filter failed:', error);
      
      // Handle specific error types
      if (error instanceof Error && error.message.includes('parse')) {
        const errorDetails = LangGraphErrorHandler.handleFilterError(
          new Error(`Validation error: ${error.message}`)
        );
        throw errorDetails;
      }

      const errorDetails = LangGraphErrorHandler.handleFilterError(error);
      throw errorDetails;
    }
  }

  /**
   * Quick validation check (simplified version)
   */
  async quickValidate(englishPhrase: string): Promise<boolean> {
    try {
      const result = await this.filterSentence({ englishPhrase });
      return result.isValid && result.confidence > 0.7;
    } catch (error) {
      console.error('ERROR: Quick validation failed:', error);
      return false;
    }
  }

  /**
   * Batch filter multiple sentences
   */
  async filterBatch(inputs: SentenceFilterInput[]): Promise<SentenceFilterOutput[]> {
    const results: SentenceFilterOutput[] = [];
    
    for (const input of inputs) {
      try {
        const result = await this.filterSentence(input);
        results.push(result);
      } catch (error) {
        console.error('ERROR: Batch filter item failed:', error);
        // Add a failed result
        results.push({
          isValid: false,
          reason: `Processing failed: ${error instanceof Error ? error.message : String(error)}`,
          cleanedSentence: null,
          confidence: 0.0,
        });
      }
    }

    return results;
  }
}

// Export singleton instance
export const sentenceFilterAgent = SentenceFilterAgent.getInstance();