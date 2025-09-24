"use client";

import { useState, useCallback, useEffect } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useDebouncedCallback } from "use-debounce";
import { useSavePhrase } from "./hooks/useSavePhrase";
import { 
  AnalyzeRequest, 
  AnalyzeResponse, 
  AnalyzerOutput,
  ERROR_MESSAGES, 
  ErrorType 
} from "@/interfaces/langchain";
import {
  transformPhoneticToThai,
  transformDifficultyToThai,
  transformVocabularyLevelToThai,
  transformComplexityToThai,
  transformAppropriatenessToThai,
  getEncouragingTone,
  getStarRatingMessage
} from "@/lib/ui-transformations";

interface FormData {
  englishPhrase: string;
  userTranslation: string;
  context: string;
}

// Star rating component
const StarRating = ({ rating, label }: { rating: number; label: string }) => {
  const stars = Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      className={`text-lg ${
        i < rating ? "text-yellow-400" : "text-gray-300"
      }`}
    >
      ⭐
    </span>
  ));

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">{label}:</span>
      <div className="flex">{stars}</div>
      <span className="text-sm text-gray-600">({rating}/5)</span>
    </div>
  );
};

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    englishPhrase: "",
    userTranslation: "",
    context: "",
  });
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzerOutput | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showSaveButton, setShowSaveButton] = useState<boolean>(false);

  const { savePhrase, isSaving, error: saveError } = useSavePhrase();

  // Clear validation error when user starts typing
  useEffect(() => {
    if (validationError && formData.englishPhrase.trim()) {
      setValidationError(null);
    }
  }, [formData.englishPhrase, validationError]);

  // Clear analysis results when input changes significantly
  const [previousEnglishPhrase, setPreviousEnglishPhrase] = useState<string>("");
  
  useEffect(() => {
    const currentPhrase = formData.englishPhrase.trim();
    
    // Only clear results if the phrase actually changed (not just state update)
    if (analysisResult && currentPhrase !== previousEnglishPhrase && currentPhrase !== "") {
      setAnalysisResult(null);
      setAnalysisError(null);
    }
    
    // Update previous phrase for next comparison
    setPreviousEnglishPhrase(currentPhrase);
  }, [formData.englishPhrase, analysisResult, previousEnglishPhrase]);

  // Show save button when there's data in either field (as per PRD requirement)
  useEffect(() => {
    const hasEnglishPhrase = formData.englishPhrase.trim().length > 0;
    const hasUserTranslation = formData.userTranslation.trim().length > 0;
    
    // Show save button if user has entered data in at least one field
    setShowSaveButton(hasEnglishPhrase || hasUserTranslation);
  }, [formData.englishPhrase, formData.userTranslation]);

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Core analyze function without debouncing
  const performAnalysis = useCallback(async (): Promise<void> => {
    // Validation
    if (!formData.englishPhrase.trim()) {
      setValidationError(ERROR_MESSAGES[ErrorType.VALIDATION].description);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setValidationError(null);

    try {
      const analyzeRequest: AnalyzeRequest = {
        englishPhrase: formData.englishPhrase.trim(),
        userTranslation: formData.userTranslation.trim(),
        context: formData.context.trim(),
      };

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(analyzeRequest),
      });

      const data: AnalyzeResponse = await response.json();

      if (!response.ok) {
        // Handle validation errors that might contain suggestions
        if (response.status === 400 && data.error?.type === 'validation') {
          // Check if this is a sentence filter rejection with suggestions
          if (data.error.message && data.error.message.includes('grammatically incorrect')) {
            // Extract the suggestion from the error message
            const suggestionMatch = data.error.message.match(/It should be '([^']+)'/);
            const suggestion = suggestionMatch ? suggestionMatch[1] : null;
            
            // Create a special analysis result for grammar corrections
            const correctionResult: AnalyzerOutput = {
              correctness: "incorrect" as const,
              meaning: "ประโยคนี้มีไวยากรณ์ที่ไม่ถูกต้อง",
              alternatives: suggestion ? [suggestion] : [],
              errors: data.error.message,
              grammarAnalysis: {
                score: 0,
                starRating: 1,
                issues: [{
                  type: "other",
                  description: data.error.message,
                  severity: "high",
                  suggestion: suggestion || "กรุณาตรวจสอบไวยากรณ์"
                }],
                strengths: [],
                recommendations: suggestion ? [`ใช้ "${suggestion}" แทน`] : [],
                tenseAnalysis: {
                  detectedTense: "unknown",
                  isCorrect: false,
                  explanation: "ไม่สามารถวิเคราะห์ได้เนื่องจากไวยากรณ์ไม่ถูกต้อง",
                  alternatives: [],
                  usage: "ไม่สามารถระบุการใช้งานได้"
                },
                structureAnalysis: {
                  pattern: "unknown",
                  isNatural: false,
                  explanation: "โครงสร้างประโยคไม่ถูกต้อง",
                  improvements: ["กรุณาตรวจสอบไวยากรณ์"],
                  comparison: "ไม่สามารถเปรียบเทียบได้เนื่องจากโครงสร้างไม่ถูกต้อง"
                },
                complexity: "simple"
              },
              vocabularyAnalysis: {
                score: 50,
                starRating: 2,
                level: "beginner",
                appropriateWords: [],
                inappropriateWords: [],
                suggestions: [],
                wordBreakdown: [],
                overallDifficulty: "easy"
              },
              contextAnalysis: {
                score: 50,
                starRating: 2,
                appropriateness: "neutral",
                culturalNotes: [],
                usageNotes: [],
                situationalFit: "ต้องแก้ไขไวยากรณ์ก่อน"
              },
              confidence: 0.9,
              suggestions: suggestion ? [`ใช้ "${suggestion}" แทน`] : [],
              overallStarRating: 1
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

        const errorMessage = data.error?.message || ERROR_MESSAGES[errorType].description;
        throw new Error(errorMessage);
      }

      if (!data.success || !data.data) {
        throw new Error(ERROR_MESSAGES[ErrorType.API_ERROR].description);
      }

      setAnalysisResult(data.data);
    } catch (error) {
      console.error("ERROR: Analysis failed:", error);
      
      if (error instanceof Error) {
        setAnalysisError(error.message);
      } else {
        setAnalysisError(ERROR_MESSAGES[ErrorType.NETWORK_ERROR].description);
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [formData.englishPhrase, formData.userTranslation, formData.context]);

  // Debounced analyze function (500ms delay)
  const debouncedAnalyze = useDebouncedCallback(performAnalysis, 500);

  // Handle analyze button click
  const handleAnalyze = useCallback((): void => {
    // Immediate validation feedback
    if (!formData.englishPhrase.trim()) {
      setValidationError(ERROR_MESSAGES[ErrorType.VALIDATION].description);
      return;
    }
    
    // Clear previous errors and trigger debounced analysis
    setValidationError(null);
    debouncedAnalyze();
  }, [formData.englishPhrase, debouncedAnalyze]);

  const handleSave = async (): Promise<void> => {
    const success = await savePhrase(formData);

    if (success) {
      console.log("INFO: Phrase saved successfully");
      // Optionally clear form or show success message
    } else {
      console.log("ERROR: Failed to save phrase - error handled by hook");
      // Error is already handled by the hook and displayed in UI
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SignedOut>
        <div className="h-screen w-full flex flex-col justify-center items-center px-4">
          <div className="text-center space-y-6 max-w-md">
            <h1 className="text-4xl lg:text-5xl font-bold text-primary">
              POOTDEE
            </h1>
            <div className="space-y-2">
              <p className="text-xl text-foreground">เรียนภาษาอังกฤษได้ง่าย</p>
              <p className="text-xl text-foreground">จัดการประโยคอย่างฉลาด</p>
            </div>
            <SignInButton>
              <button className="btn bg-gradient-to-r from-primary to-primary text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                เริ่มกันเลย !
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">POOTDEE</h1>
            <p className="text-muted-foreground">
              วิเคราะห์และจัดการประโยคภาษาอังกฤษ
            </p>
          </div>

          <div className="space-y-6">
            {/* Main English Phrase Input */}
            <div>
              <label
                htmlFor="englishPhrase"
                className="block text-sm font-medium text-foreground mb-2"
              >
                English Phrase
              </label>
              <textarea
                id="englishPhrase"
                value={formData.englishPhrase}
                onChange={(e) =>
                  handleInputChange("englishPhrase", e.target.value)
                }
                placeholder="Enter your English phrase..."
                className="w-full min-h-[120px] p-5 border-2 border-border rounded-2xl text-base leading-relaxed resize-vertical transition-colors focus:border-primary focus:outline-none bg-background"
                disabled={isAnalyzing || isSaving}
              />
            </div>

            {/* Expandable Additional Fields */}
            {!isExpanded && (
              <button
                onClick={() => setIsExpanded(true)}
                className="w-full p-3 border-2 border-dashed border-muted-foreground rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                disabled={isAnalyzing || isSaving}
              >
                + เพิ่มข้อมูล
              </button>
            )}

            {isExpanded && (
              <div className="space-y-4 animate-in">
                {/* User Translation */}
                <div>
                  <label
                    htmlFor="userTranslation"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    คำแปลที่คิด
                  </label>
                  <textarea
                    id="userTranslation"
                    value={formData.userTranslation}
                    onChange={(e) =>
                      handleInputChange("userTranslation", e.target.value)
                    }
                    placeholder="ใส่คำแปลที่คุณคิดไว้..."
                    className="w-full min-h-[100px] p-4 border-2 border-border rounded-xl text-base resize-vertical transition-colors focus:border-primary focus:outline-none bg-background"
                    disabled={isAnalyzing || isSaving}
                  />
                </div>

                {/* Context Field */}
                <div>
                  <label
                    htmlFor="context"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    บริบท (ใช้ตอนไหน?)
                  </label>
                  <textarea
                    id="context"
                    value={formData.context}
                    onChange={(e) =>
                      handleInputChange("context", e.target.value)
                    }
                    placeholder="บอกบริบทหรือสถานการณ์ที่จะใช้ประโยคนี้..."
                    className="w-full min-h-[80px] p-4 border-2 border-border rounded-xl text-base resize-vertical transition-colors focus:border-primary focus:outline-none bg-background"
                    disabled={isAnalyzing || isSaving}
                  />
                </div>

                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isAnalyzing || isSaving}
                >
                  ซ่อนฟิลด์เพิ่มเติม
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleAnalyze}
                disabled={
                  isAnalyzing ||
                  isSaving ||
                  !formData.englishPhrase.trim()
                }
                className="flex-1 bg-gradient-to-r from-primary to-primary text-white py-4 px-6 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isAnalyzing ? "กำลังวิเคราะห์..." : "วิเคราะห์!"}
              </button>

              {showSaveButton && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-accent to-accent text-white py-4 px-6 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSaving ? "กำลังบันทึก..." : "เก็บ!"}
                </button>
              )}
            </div>

            {/* Validation Error Display */}
            {validationError && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-yellow-600 text-sm font-medium">
                  ⚠️ ข้อมูลไม่ถูกต้อง:
                </p>
                <p className="text-yellow-600 text-sm">{validationError}</p>
              </div>
            )}

            {/* Analysis Error Display */}
            {analysisError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm font-medium">
                  ❌ เกิดข้อผิดพลาดในการวิเคราะห์:
                </p>
                <p className="text-red-600 text-sm">{analysisError}</p>
              </div>
            )}

            {/* Save Error Display */}
            {saveError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm font-medium">
                  ❌ เกิดข้อผิดพลาดในการบันทึก:
                </p>
                <p className="text-red-600 text-sm">{saveError}</p>
              </div>
            )}

            {/* Analysis Results Display */}
            {analysisResult && (
              <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                <div className="text-center border-b pb-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">ผลการวิเคราะห์</h2>
                  <StarRating rating={analysisResult.overallStarRating || 3} label="คะแนนรวม" />
                  <p className="text-sm text-gray-600 mt-2">
                    {getStarRatingMessage(analysisResult.overallStarRating || 3)}
                  </p>
                </div>

                {/* Basic Analysis */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="mb-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        analysisResult.correctness === "correct"
                          ? "bg-green-100 text-green-800"
                          : analysisResult.correctness === "partially_correct"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {analysisResult.correctness === "correct" && "✅ ถูกต้อง"}
                      {analysisResult.correctness === "partially_correct" && "🟠 ถูกต้องบางส่วน"}
                      {analysisResult.correctness === "incorrect" && "❌ ไม่ถูกต้อง"}
                    </span>
                  </div>
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p className="text-blue-800 font-medium text-sm">
                      {getEncouragingTone(analysisResult.correctness).icon} {getEncouragingTone(analysisResult.correctness).message}
                    </p>
                  </div>
                  <p className="text-gray-700 mb-2">
                    <strong>ความหมาย:</strong> {analysisResult.meaning}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>ความมั่นใจ:</strong> {Math.round(analysisResult.confidence * 100)}%
                  </p>
                </div>

                {/* Grammar Analysis */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">📝 การวิเคราะห์ไวยากรณ์</h3>
                    <StarRating rating={analysisResult.grammarAnalysis.starRating || 3} label="" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    คะแนน: <span className="font-medium">{analysisResult.grammarAnalysis.score}/100</span>
                    {" | "}
                    ความซับซ้อน: <span className="font-medium">{transformComplexityToThai(analysisResult.grammarAnalysis.complexity)}</span>
                  </p>

                  {/* Tense Analysis */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">🕐 การวิเคราะห์กาล (Tense Analysis)</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">กาลที่ตรวจพบ:</span> {analysisResult.grammarAnalysis.tenseAnalysis.detectedTense}</p>
                      <p><span className="font-medium">ความถูกต้อง:</span> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          analysisResult.grammarAnalysis.tenseAnalysis.isCorrect 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {analysisResult.grammarAnalysis.tenseAnalysis.isCorrect ? 'ถูกต้อง' : 'ไม่ถูกต้อง'}
                        </span>
                      </p>
                      <p><span className="font-medium">คำอธิบาย:</span> {analysisResult.grammarAnalysis.tenseAnalysis.explanation}</p>
                      {analysisResult.grammarAnalysis.tenseAnalysis.alternatives.length > 0 && (
                        <div>
                          <span className="font-medium">ทางเลือกอื่น:</span>
                          <ul className="list-disc list-inside ml-4 mt-1">
                            {analysisResult.grammarAnalysis.tenseAnalysis.alternatives.map((alt, idx) => (
                              <li key={idx}>{alt}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p><span className="font-medium">การใช้งาน:</span> {analysisResult.grammarAnalysis.tenseAnalysis.usage}</p>
                    </div>
                  </div>

                  {/* Structure Analysis */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">🏗️ การวิเคราะห์โครงสร้าง (Structure Analysis)</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">รูปแบบ:</span> {analysisResult.grammarAnalysis.structureAnalysis.pattern}</p>
                      <p><span className="font-medium">ความเป็นธรรมชาติ:</span> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          analysisResult.grammarAnalysis.structureAnalysis.isNatural 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {analysisResult.grammarAnalysis.structureAnalysis.isNatural ? 'เป็นธรรมชาติ' : 'ไม่เป็นธรรมชาติ'}
                        </span>
                      </p>
                      <p><span className="font-medium">คำอธิบาย:</span> {analysisResult.grammarAnalysis.structureAnalysis.explanation}</p>
                      {analysisResult.grammarAnalysis.structureAnalysis.improvements.length > 0 && (
                        <div>
                          <span className="font-medium">ข้อเสนอแนะ:</span>
                          <ul className="list-disc list-inside ml-4 mt-1">
                            {analysisResult.grammarAnalysis.structureAnalysis.improvements.map((improvement, idx) => (
                              <li key={idx}>{improvement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p><span className="font-medium">เปรียบเทียบ:</span> {analysisResult.grammarAnalysis.structureAnalysis.comparison}</p>
                    </div>
                  </div>

                  {/* Grammar Issues */}
                  {analysisResult.grammarAnalysis.issues.length > 0 && (
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900 mb-2">ปัญหาที่พบ:</h4>
                      <ul className="space-y-2">
                        {analysisResult.grammarAnalysis.issues.map((issue, index) => (
                          <li key={index} className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex items-start gap-2">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  issue.severity === "high" ? "bg-red-100 text-red-800" :
                                  issue.severity === "medium" ? "bg-yellow-100 text-yellow-800" :
                                  "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {issue.severity}
                              </span>
                              <div className="flex-1">
                                <p className="text-gray-900">{issue.description}</p>
                                <p className="text-sm text-gray-600 mt-1">แนะนำ: {issue.suggestion}</p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Grammar Strengths */}
                  {analysisResult.grammarAnalysis.strengths.length > 0 && (
                    <div className="mb-3">
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

                  {/* Grammar Recommendations */}
                  {analysisResult.grammarAnalysis.recommendations.length > 0 && (
                    <div>
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
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">📚 การวิเคราะห์คำศัพท์</h3>
                    <StarRating rating={analysisResult.vocabularyAnalysis.starRating || 3} label="" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    คะแนน: <span className="font-medium">{analysisResult.vocabularyAnalysis.score}/100</span>
                    {" | "}
                    ระดับ: <span className="font-medium">{transformVocabularyLevelToThai(analysisResult.vocabularyAnalysis.level)}</span>
                    {" | "}
                    ความยาก: <span className="font-medium">{transformDifficultyToThai(analysisResult.vocabularyAnalysis.overallDifficulty)}</span>
                  </p>

                  {/* Word Breakdown */}
                  {analysisResult.vocabularyAnalysis.wordBreakdown && analysisResult.vocabularyAnalysis.wordBreakdown.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">การวิเคราะห์คำต่อคำ:</h4>
                      <div className="space-y-3">
                        {analysisResult.vocabularyAnalysis.wordBreakdown.map((word, index) => (
                          <div key={index} className="p-3 bg-white border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-lg">{word.word}</span>
                              <span className="text-sm text-gray-500">ตำแหน่งที่ {word.position.start}-{word.position.end}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div>
                                <strong>ชนิดคำ:</strong> {word.partOfSpeech}
                              </div>
                              <div>
                                <strong>ความยาก:</strong> <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">{transformDifficultyToThai(word.difficulty)}</span>
                              </div>
                            </div>
                            {word.phonics && (
                              <div className="mt-2 p-2 bg-blue-50 rounded">
                                <div className="text-sm">
                                  <strong>การออกเสียง:</strong> <span className="font-mono text-blue-700">{transformPhoneticToThai(word.phonics.pronunciation, word.phonics.syllables, word.phonics.stress)}</span>
                                </div>
                              </div>
                            )}
                            <div className="mt-2">
                              <div className="text-sm"><strong>ความหมาย:</strong> {word.meaning}</div>
                              <div className="text-sm"><strong>การใช้ทั่วไป:</strong> {word.commonUsage}</div>
                              {word.alternatives && word.alternatives.length > 0 && (
                                <div className="text-sm">
                                  <strong>คำทางเลือก:</strong> {word.alternatives.join(", ")}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vocabulary Suggestions */}
                  {analysisResult.vocabularyAnalysis.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">คำแนะนำคำศัพท์:</h4>
                      <ul className="space-y-2">
                        {analysisResult.vocabularyAnalysis.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm text-blue-600 flex items-start gap-2">
                            <span className="text-blue-500 mt-1">💡</span>
                            <div>
                              <span className="font-medium text-red-600">{suggestion.original}</span>
                              <span className="mx-2">→</span>
                              <span className="font-medium text-green-600">{suggestion.suggested}</span>
                              <div className="text-xs text-gray-600 mt-1">{suggestion.reason}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Context Analysis */}
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">🎯 การวิเคราะห์บริบท</h3>
                    <StarRating rating={analysisResult.contextAnalysis.starRating || 3} label="" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    คะแนน: <span className="font-medium">{analysisResult.contextAnalysis.score}/100</span>
                    {" | "}
                    ความเหมาะสม: <span className="font-medium">{transformAppropriatenessToThai(analysisResult.contextAnalysis.appropriateness)}</span>
                  </p>
                  <p className="text-sm text-gray-700 mb-3">{analysisResult.contextAnalysis.situationalFit}</p>

                  {/* Usage Notes */}
                  {analysisResult.contextAnalysis.usageNotes.length > 0 && (
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900 mb-2">หมายเหตุการใช้:</h4>
                      <ul className="space-y-1">
                        {analysisResult.contextAnalysis.usageNotes.map((note, index) => (
                          <li key={index} className="text-sm text-blue-600 flex items-start gap-2">
                            <span className="text-blue-500 mt-1">📝</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Cultural Notes */}
                  {analysisResult.contextAnalysis.culturalNotes.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">หมายเหตุทางวัฒนธรรม:</h4>
                      <ul className="space-y-1">
                        {analysisResult.contextAnalysis.culturalNotes.map((note, index) => (
                          <li key={index} className="text-sm text-purple-600 flex items-start gap-2">
                            <span className="text-purple-500 mt-1">🌍</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Alternatives */}
                {analysisResult.alternatives && analysisResult.alternatives.length > 0 && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">🔄 ทางเลือกอื่น</h3>
                    <ul className="space-y-2">
                      {analysisResult.alternatives.map((alternative, index) => (
                        <li key={index} className="text-gray-700 flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>{alternative}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* General Suggestions */}
                {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 คำแนะนำทั่วไป</h3>
                    <ul className="space-y-2">
                      {analysisResult.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-gray-700 flex items-start gap-2">
                          <span className="text-orange-600 mt-1">💡</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Errors */}
                {analysisResult.errors && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-900 mb-3">⚠️ ข้อผิดพลาด</h3>
                    <p className="text-red-700">{analysisResult.errors}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </SignedIn>
    </div>
  );
}
