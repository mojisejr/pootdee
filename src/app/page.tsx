"use client";

import { useState, useCallback, useEffect } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useDebouncedCallback } from "use-debounce";
import { useSavePhrase } from "./hooks/useSavePhrase";
import { 
  AnalyzeRequest, 
  AnalyzeResponse, 
  EnhancedAnalyzerOutput,
  ERROR_MESSAGES, 
  ErrorType 
} from "@/interfaces/langchain";

interface FormData {
  englishPhrase: string;
  userTranslation: string;
  context: string;
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    englishPhrase: "",
    userTranslation: "",
    context: "",
  });

  const [analysisResult, setAnalysisResult] = useState<EnhancedAnalyzerOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSaveButton, setShowSaveButton] = useState<boolean>(false);

  const { savePhrase, isSaving, error: saveError } = useSavePhrase();

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setAnalysisResult(null);
    setShowSaveButton(false);
  }, []);

  const debouncedAnalyze = useDebouncedCallback(async (data: FormData) => {
    if (!data.englishPhrase.trim()) {
      setAnalysisResult(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const requestData: AnalyzeRequest = {
        englishPhrase: data.englishPhrase.trim(),
        userTranslation: data.userTranslation.trim() || undefined,
        context: data.context.trim() || undefined,
        options: {
          includeMetadata: true,
          detailedAnalysis: true,
        },
      };

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const responseData: AnalyzeResponse = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (responseData.error && responseData.error.type === ErrorType.VALIDATION) {
          if (responseData.error.message && responseData.error.message.includes('grammatically incorrect')) {
            // Extract the suggestion from the responseData.error message
            const suggestionMatch = responseData.error.message.match(/It should be '([^']+)'/);
            const suggestion = suggestionMatch ? suggestionMatch[1] : null;
            
            // Create a special analysis result for grammar corrections
            const correctionResult: EnhancedAnalyzerOutput = {
              correctness: "incorrect" as const,
              meaning: "ประโยคนี้มีไวยากรณ์ที่ไม่ถูกต้อง",
              alternatives: suggestion ? [suggestion] : [],
              errors: responseData.error.message,
              overallRating: 1,
              severity: "high" as const,
              friendlyHeadings: {
                grammar: "ไวยากรณ์",
                vocabulary: "คำศัพท์", 
                context: "บริบท",
                overall: "ผลรวม"
              },
              grammarAnalysis: {
                score: 0,
                issues: [{
                  type: "other",
                  description: responseData.error.message,
                  severity: "high",
                  suggestion: suggestion || "กรุณาตรวจสอบไวยากรณ์"
                }],
                strengths: [],
                recommendations: suggestion ? [`ใช้ "${suggestion}" แทน`] : [],
                structureComparison: {
                  userStructure: formData.englishPhrase,
                  correctStructure: suggestion || formData.englishPhrase,
                  differences: [],
                  similarity: 0.1,
                  explanation: responseData.error.message
                },
                tenseAnalysis: {
                  detectedTense: "simple_present" as const,
                  correctTense: "simple_present" as const,
                  isCorrect: true,
                  explanation: "The sentence uses simple present tense correctly.",
                  examples: ["I eat breakfast every morning.", "She works at a bank."],
                  commonMistakes: ["Using 'am eating' instead of 'eat' for habitual actions."]
                },
                starRating: 1
              },
              vocabularyAnalysis: {
                score: 50,
                level: "beginner",
                appropriateWords: [],
                inappropriateWords: [],
                suggestions: [],
                wordAnalysis: [],
                starRating: 3,
                phoneticBreakdown: {
                  fullSentence: {
                    ipa: "",
                    simplified: "",
                    syllableCount: 0
                  },
                  wordByWord: [],
                  pronunciationTips: []
                }
              },
              contextAnalysis: {
                score: 50,
                appropriateness: "appropriate" as const,
                culturalNotes: [],
                improvements: [],
                situationalFit: "ต้องแก้ไขไวยากรณ์ก่อน",
                formality: "neutral" as const,
                starRating: 2,
                friendlyHeading: "บริบทและการใช้งาน"
              },
              confidence: 0.9,
              suggestions: suggestion ? [`ใช้ "${suggestion}" แทน`] : []
            };
            
            setAnalysisResult(correctionResult);
            return;
          }
        }

        // Handle other types of errors
        let errorType: ErrorType;
        switch (response.status) {
          case 400:
            errorType = ErrorType.VALIDATION;
            break;
          case 401:
            errorType = ErrorType.API_ERROR;
            break;
          case 429:
            errorType = ErrorType.API_RATE_LIMIT;
            break;
          case 500:
            errorType = ErrorType.API_ERROR;
            break;
          default:
            errorType = ErrorType.NETWORK_ERROR;
        }

        const errorMessage = responseData.error?.message || ERROR_MESSAGES[errorType].description;
        setError(errorMessage);
        return;
      }

      if (responseData.success && responseData.data) {
        setAnalysisResult(responseData.data);
        setShowSaveButton(true);
      } else {
        setError("ไม่สามารถวิเคราะห์ประโยคได้ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setError(ERROR_MESSAGES[ErrorType.NETWORK_ERROR].description);
    } finally {
      setIsLoading(false);
    }
  }, 1000);

  useEffect(() => {
    if (formData.englishPhrase.trim()) {
      debouncedAnalyze(formData);
    }
  }, [formData, debouncedAnalyze]);

  const handleSavePhrase = async () => {
    if (!analysisResult) return;

    try {
      await savePhrase({
        englishPhrase: formData.englishPhrase,
        userTranslation: formData.userTranslation,
        context: formData.context,
        analysisResult,
      });
      setShowSaveButton(false);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const renderStarRating = (rating: number, label: string) => {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">{label}:</span>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-4 h-4 ${
                star <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              English Analysis Tool
            </h1>
            <p className="text-lg text-gray-600">
              วิเคราะห์ประโยคภาษาอังกฤษของคุณและเรียนรู้ไปพร้อมกัน
            </p>
          </div>

          {/* Authentication Check */}
          <SignedOut>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                กรุณาเข้าสู่ระบบเพื่อใช้งาน
              </h2>
              <SignInButton mode="modal">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  เข้าสู่ระบบ
                </button>
              </SignInButton>
            </div>
          </SignedOut>

          <SignedIn>
            {/* Input Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="englishPhrase" className="block text-sm font-medium text-gray-700 mb-2">
                    ประโยคภาษาอังกฤษ *
                  </label>
                  <input
                    type="text"
                    id="englishPhrase"
                    value={formData.englishPhrase}
                    onChange={(e) => handleInputChange("englishPhrase", e.target.value)}
                    placeholder="กรอกประโยคภาษาอังกฤษที่ต้องการวิเคราะห์..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="userTranslation" className="block text-sm font-medium text-gray-700 mb-2">
                    คำแปลของคุณ (ไม่บังคับ)
                  </label>
                  <input
                    type="text"
                    id="userTranslation"
                    value={formData.userTranslation}
                    onChange={(e) => handleInputChange("userTranslation", e.target.value)}
                    placeholder="แปลประโยคนี้เป็นภาษาไทย..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
                    บริบทการใช้งาน (ไม่บังคับ)
                  </label>
                  <input
                    type="text"
                    id="context"
                    value={formData.context}
                    onChange={(e) => handleInputChange("context", e.target.value)}
                    placeholder="บอกบริบทหรือสถานการณ์ที่ใช้ประโยคนี้..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Loading Indicator */}
              {isLoading && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">กำลังวิเคราะห์...</span>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </div>

            {/* Analysis Results */}
            {analysisResult && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">ผลการวิเคราะห์</h2>
                  {renderStarRating(analysisResult.overallRating, "คะแนนรวม")}
                </div>

                {/* Overall Assessment */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      analysisResult.correctness === "correct" 
                        ? "bg-green-100 text-green-800"
                        : analysisResult.correctness === "partially_correct"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {analysisResult.correctness === "correct" ? "ถูกต้อง" : 
                       analysisResult.correctness === "partially_correct" ? "ถูกต้องบางส่วน" : "ไม่ถูกต้อง"}
                    </span>
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      analysisResult.severity === "low" 
                        ? "bg-blue-100 text-blue-800"
                        : analysisResult.severity === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {analysisResult.severity === "low" ? "ระดับต่ำ" : 
                       analysisResult.severity === "medium" ? "ระดับกลาง" : 
                       analysisResult.severity === "high" ? "ระดับสูง" : "ระดับวิกฤต"}
                    </span>
                  </div>
                  <p className="text-gray-700">{analysisResult.meaning}</p>
                </div>

                {/* Grammar Analysis */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{analysisResult.friendlyHeadings.grammar}</h3>
                    {renderStarRating(analysisResult.grammarAnalysis.starRating, "ไวยากรณ์")}
                  </div>
                  
                  {analysisResult.grammarAnalysis.issues.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">ปัญหาที่พบ:</h4>
                      <ul className="space-y-2">
                        {analysisResult.grammarAnalysis.issues.map((issue, index) => (
                          <li key={index} className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex items-start">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                                issue.severity === "high" ? "bg-red-100 text-red-800" :
                                issue.severity === "medium" ? "bg-yellow-100 text-yellow-800" :
                                "bg-blue-100 text-blue-800"
                              }`}>
                                {issue.severity === "high" ? "สูง" : issue.severity === "medium" ? "กลาง" : "ต่ำ"}
                              </span>
                              <div>
                                <p className="text-gray-900">{issue.description}</p>
                                <p className="text-sm text-gray-600 mt-1">แนะนำ: {issue.suggestion}</p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysisResult.grammarAnalysis.strengths.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">จุดเด่น:</h4>
                      <ul className="space-y-1">
                        {analysisResult.grammarAnalysis.strengths.map((strength, index) => (
                          <li key={index} className="text-sm text-green-700 flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysisResult.grammarAnalysis.recommendations.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">คำแนะนำ:</h4>
                      <ul className="space-y-1">
                        {analysisResult.grammarAnalysis.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-blue-700 flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Vocabulary Analysis */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{analysisResult.friendlyHeadings.vocabulary}</h3>
                    {renderStarRating(analysisResult.vocabularyAnalysis.starRating, "คำศัพท์")}
                  </div>
                  
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      ระดับ: {analysisResult.vocabularyAnalysis.level === "beginner" ? "เริ่มต้น" : 
                              analysisResult.vocabularyAnalysis.level === "intermediate" ? "กลาง" : "สูง"}
                    </span>
                  </div>

                  {analysisResult.vocabularyAnalysis.wordAnalysis.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">การวิเคราะห์คำศัพท์:</h4>
                      <div className="space-y-3">
                        {analysisResult.vocabularyAnalysis.wordAnalysis.map((word, index) => (
                          <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-blue-900">{word.word}</span>
                              <span className="text-xs text-blue-600">{word.partOfSpeech.primary}</span>
                            </div>
                            <p className="text-sm text-gray-700 mb-1">{word.meaning}</p>
                            <p className="text-xs text-gray-600">{word.usage}</p>
                            {word.phonetics && (
                              <div className="mt-2 text-xs text-gray-500">
                                การออกเสียง: {word.phonetics.simplified} ({word.phonetics.ipa})
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Context Analysis */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{analysisResult.friendlyHeadings.context}</h3>
                    {renderStarRating(analysisResult.contextAnalysis.starRating, "บริบท")}
                  </div>
                  
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ความเหมาะสม: {analysisResult.contextAnalysis.appropriateness === "very_appropriate" ? "เหมาะสมมาก" :
                                    analysisResult.contextAnalysis.appropriateness === "appropriate" ? "เหมาะสม" :
                                    analysisResult.contextAnalysis.appropriateness === "somewhat_appropriate" ? "เหมาะสมบ้าง" :
                                    analysisResult.contextAnalysis.appropriateness === "inappropriate" ? "ไม่เหมาะสม" : "ไม่เหมาะสมมาก"}
                    </span>
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      ความเป็นทางการ: {analysisResult.contextAnalysis.formality === "very_formal" ? "เป็นทางการมาก" :
                                      analysisResult.contextAnalysis.formality === "formal" ? "เป็นทางการ" :
                                      analysisResult.contextAnalysis.formality === "neutral" ? "กลาง" :
                                      analysisResult.contextAnalysis.formality === "informal" ? "ไม่เป็นทางการ" : "ไม่เป็นทางการมาก"}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-3">{analysisResult.contextAnalysis.situationalFit}</p>

                  {analysisResult.contextAnalysis.culturalNotes.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">หมายเหตุทางวัฒนธรรม:</h4>
                      <ul className="space-y-1">
                        {analysisResult.contextAnalysis.culturalNotes.map((note, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="text-purple-500 mr-2">•</span>
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysisResult.contextAnalysis.improvements.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">ข้อเสนอแนะ:</h4>
                      <ul className="space-y-1">
                        {analysisResult.contextAnalysis.improvements.map((improvement, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Alternatives */}
                {analysisResult.alternatives.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">ทางเลือกอื่น:</h3>
                    <ul className="space-y-2">
                      {analysisResult.alternatives.map((alt, index) => (
                        <li key={index} className="p-3 bg-green-50 border border-green-200 rounded-md">
                          <span className="text-green-800 font-medium">{alt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions */}
                {analysisResult.suggestions.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">คำแนะนำเพิ่มเติม:</h3>
                    <ul className="space-y-1">
                      {analysisResult.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="text-blue-500 mr-2">💡</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Save Button */}
                {showSaveButton && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSavePhrase}
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      {isSaving ? "กำลังบันทึก..." : "บันทึกประโยคนี้"}
                    </button>
                    {saveError && (
                      <p className="mt-2 text-sm text-red-600">{saveError}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </SignedIn>
        </div>
      </div>
    </div>
  );
}
