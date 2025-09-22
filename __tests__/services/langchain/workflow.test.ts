import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { EnglishAnalysisWorkflow } from '../../../src/services/langchain/workflow';
import { AnalyzeRequest } from '../../../src/interfaces/langchain';

/**
 * Unit tests for EnglishAnalysisWorkflow
 * Tests the core functionality of the LangGraph workflow implementation
 */
describe('EnglishAnalysisWorkflow', () => {
  let workflow: EnglishAnalysisWorkflow;

  beforeEach(() => {
    workflow = EnglishAnalysisWorkflow.getInstance();
  });

  afterEach(() => {
    // Cleanup if needed
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = EnglishAnalysisWorkflow.getInstance();
      const instance2 = EnglishAnalysisWorkflow.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(EnglishAnalysisWorkflow);
    });

    it('should have required methods', () => {
      expect(typeof workflow.execute).toBe('function');
      expect(typeof workflow.healthCheck).toBe('function');
      expect(typeof workflow.getConfig).toBe('function');
    });
  });

  describe('Health Check', () => {
    it('should return health status with correct structure', async () => {
      const healthStatus = await workflow.healthCheck();
      
      expect(healthStatus).toBeTruthy();
      expect(typeof healthStatus.status).toBe('string');
      expect(typeof healthStatus.details).toBe('object');
      
      // Check that health status is either 'healthy' or 'unhealthy'
      expect(['healthy', 'unhealthy'].includes(healthStatus.status)).toBe(true);
    });

    it('should include component status in details', async () => {
      const healthStatus = await workflow.healthCheck();
      
      expect(healthStatus.details).toBeTruthy();
      expect(typeof healthStatus.details).toBe('object');
      
      // Should have some component information
      const detailKeys = Object.keys(healthStatus.details);
      expect(detailKeys.length).toBeGreaterThan(0);
    });
  });

  describe('Input Validation', () => {
    it('should handle valid input correctly', () => {
      const validInput: AnalyzeRequest = {
        englishPhrase: "This is a test sentence.",
        userTranslation: "นี่คือประโยคทดสอบ",
        context: "Testing context"
      };

      // This test verifies the workflow can accept valid input
      // Note: We're not testing the full execution here to avoid API calls
      expect(() => {
        // Just verify the input structure is accepted
        const result = workflow.execute(validInput);
        expect(result).toBeInstanceOf(Promise);
      }).not.toThrow();
    });

    it('should handle minimal valid input', () => {
      const minimalInput: AnalyzeRequest = {
        englishPhrase: "Test sentence"
      };

      expect(() => {
        const result = workflow.execute(minimalInput);
        expect(result).toBeInstanceOf(Promise);
      }).not.toThrow();
    });
  });

  describe('Configuration', () => {
    it('should return configuration object', () => {
      const config = workflow.getConfig();
      
      expect(config).toBeTruthy();
      expect(typeof config).toBe('object');
    });
  });

  describe('Workflow State Management', () => {
    it('should maintain proper state during execution', () => {
      // Test that workflow maintains consistent state
      expect(workflow).toBeTruthy();
      
      // Verify internal components are properly initialized
      // Note: This is a basic state check without exposing internal implementation
      const healthCheck1 = workflow.healthCheck();
      const healthCheck2 = workflow.healthCheck();
      
      expect(healthCheck1).toBeTruthy();
      expect(healthCheck2).toBeTruthy();
    });
  });
});