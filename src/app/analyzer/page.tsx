'use client';

import { useState } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { useSavePhrase } from '../hooks/useSavePhrase';

interface FormData {
  englishPhrase: string;
  context: string;
  difficulty: string;
  category: string;
}

interface AnalysisResult {
  correctness: {
    score: number;
    explanation: string;
  };
  meaning: {
    translation: string;
    explanation: string;
  };
  grammar: {
    analysis: string;
    suggestions: string[];
  };
  vocabulary: {
    keyWords: Array<{
      word: string;
      meaning: string;
      usage: string;
    }>;
    difficulty: string;
  };
  context: {
    appropriateness: string;
    suggestions: string[];
  };
  alternatives: {
    formal: string[];
    informal: string[];
    native: string[];
  };
  suggestions: {
    improvements: string[];
    commonMistakes: string[];
    tips: string[];
  };
}

export default function AnalyzerPage(): JSX.Element {
  const [formData, setFormData] = useState<FormData>({
    englishPhrase: '',
    context: '',
    difficulty: 'intermediate',
    category: 'general'
  });

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [validationError, setValidationError] = useState<string>('');
  const [analysisError, setAnalysisError] = useState<string>('');
  const [showAdditionalFields, setShowAdditionalFields] = useState<boolean>(false);

  const { savePhrase, isSaving, error: saveError } = useSavePhrase();
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const performAnalysis = async (phrase: string, context: string, difficulty: string, category: string): Promise<AnalysisResult> => {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        englishPhrase: phrase,
        context,
        difficulty,
        category
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Analysis failed');
    }

    const data = await response.json();
    return data.analysis;
  };

  const handleAnalyze = async (): Promise<void> => {
    setValidationError('');
    setAnalysisError('');

    if (!formData.englishPhrase.trim()) {
      setValidationError('Please enter an English phrase to analyze.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await performAnalysis(
        formData.englishPhrase,
        formData.context,
        formData.difficulty,
        formData.category
      );
      setAnalysisResult(result);
    } catch (error) {
      console.error('ERROR: Analysis failed:', error);
      setAnalysisError(error instanceof Error ? error.message : 'An unexpected error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!analysisResult) return;

    setSaveSuccess(false);
    const success = await savePhrase({
      englishPhrase: formData.englishPhrase,
      context: formData.context,
      difficulty: formData.difficulty,
      category: formData.category,
      analysis: analysisResult
    });

    if (success) {
      setSaveSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <SignedOut>
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              English Phrase Analyzer
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Please sign in to access the analyzer and improve your English skills.
            </p>
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
                Sign In to Analyze
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
              English Phrase Analyzer
            </h1>

            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="englishPhrase" className="block text-sm font-medium text-gray-700 mb-2">
                    English Phrase *
                  </label>
                  <textarea
                    id="englishPhrase"
                    value={formData.englishPhrase}
                    onChange={(e) => setFormData(prev => ({ ...prev, englishPhrase: e.target.value }))}
                    placeholder="Enter the English phrase you want to analyze..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setShowAdditionalFields(!showAdditionalFields)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {showAdditionalFields ? 'Hide' : 'Show'} Additional Options
                  </button>
                </div>

                {showAdditionalFields && (
                  <div className="space-y-4 border-t pt-4">
                    <div>
                      <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
                        Context (Optional)
                      </label>
                      <textarea
                        id="context"
                        value={formData.context}
                        onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
                        placeholder="Provide context where this phrase might be used..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                          Difficulty Level
                        </label>
                        <select
                          id="difficulty"
                          value={formData.difficulty}
                          onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="general">General</option>
                          <option value="business">Business</option>
                          <option value="academic">Academic</option>
                          <option value="casual">Casual</option>
                          <option value="formal">Formal</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !formData.englishPhrase.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Phrase'}
                  </button>

                  {analysisResult && (
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      {isSaving ? 'Saving...' : 'Save Analysis'}
                    </button>
                  )}
                </div>

                {validationError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {validationError}
                  </div>
                )}

                {analysisError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {analysisError}
                  </div>
                )}

                {saveError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {saveError}
                  </div>
                )}

                {saveSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                    Analysis saved successfully!
                  </div>
                )}
              </div>
            </div>

            {analysisResult && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Analysis Results</h2>
                
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Correctness</h3>
                    <div className="flex items-center mb-2">
                      <span className="text-2xl font-bold text-blue-600 mr-2">
                        {analysisResult.correctness.score}/10
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${analysisResult.correctness.score * 10}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-gray-700">{analysisResult.correctness.explanation}</p>
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Meaning & Translation</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Thai Translation:</strong> {analysisResult.meaning.translation}
                    </p>
                    <p className="text-gray-700">{analysisResult.meaning.explanation}</p>
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Grammar Analysis</h3>
                    <p className="text-gray-700 mb-3">{analysisResult.grammar.analysis}</p>
                    {analysisResult.grammar.suggestions.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Grammar Suggestions:</h4>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          {analysisResult.grammar.suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Vocabulary</h3>
                    <p className="text-gray-700 mb-3">
                      <strong>Difficulty Level:</strong> {analysisResult.vocabulary.difficulty}
                    </p>
                    {analysisResult.vocabulary.keyWords.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Key Words:</h4>
                        <div className="space-y-2">
                          {analysisResult.vocabulary.keyWords.map((word, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-md">
                              <p className="font-medium text-gray-800">{word.word}</p>
                              <p className="text-gray-700 text-sm">{word.meaning}</p>
                              <p className="text-gray-600 text-sm italic">{word.usage}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Context Analysis</h3>
                    <p className="text-gray-700 mb-3">{analysisResult.context.appropriateness}</p>
                    {analysisResult.context.suggestions.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Context Suggestions:</h4>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          {analysisResult.context.suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Alternative Expressions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {analysisResult.alternatives.formal.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Formal:</h4>
                          <ul className="text-gray-700 space-y-1">
                            {analysisResult.alternatives.formal.map((alt, index) => (
                              <li key={index} className="bg-blue-50 p-2 rounded text-sm">{alt}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {analysisResult.alternatives.informal.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Informal:</h4>
                          <ul className="text-gray-700 space-y-1">
                            {analysisResult.alternatives.informal.map((alt, index) => (
                              <li key={index} className="bg-green-50 p-2 rounded text-sm">{alt}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {analysisResult.alternatives.native.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Native-like:</h4>
                          <ul className="text-gray-700 space-y-1">
                            {analysisResult.alternatives.native.map((alt, index) => (
                              <li key={index} className="bg-yellow-50 p-2 rounded text-sm">{alt}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Suggestions for Improvement</h3>
                    <div className="space-y-4">
                      {analysisResult.suggestions.improvements.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Improvements:</h4>
                          <ul className="list-disc list-inside text-gray-700 space-y-1">
                            {analysisResult.suggestions.improvements.map((improvement, index) => (
                              <li key={index}>{improvement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {analysisResult.suggestions.commonMistakes.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Common Mistakes to Avoid:</h4>
                          <ul className="list-disc list-inside text-gray-700 space-y-1">
                            {analysisResult.suggestions.commonMistakes.map((mistake, index) => (
                              <li key={index}>{mistake}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {analysisResult.suggestions.tips.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Learning Tips:</h4>
                          <ul className="list-disc list-inside text-gray-700 space-y-1">
                            {analysisResult.suggestions.tips.map((tip, index) => (
                              <li key={index}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SignedIn>
      </div>
    </div>
  );
}