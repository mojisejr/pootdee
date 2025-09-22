"use client";

import { useState, useCallback, useEffect } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useDebouncedCallback } from "use-debounce";
import { useSavePhrase } from "./hooks/useSavePhrase";
import { 
  AnalyzeRequest, 
  AnalyzeResponse, 
  AnalysisResult,
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
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Use the save phrase hook
  const { savePhrase, isSaving, error: saveError } = useSavePhrase();

  // Clear validation error when user starts typing
  useEffect(() => {
    if (validationError && formData.englishPhrase.trim()) {
      setValidationError(null);
    }
  }, [formData.englishPhrase, validationError]);

  // Clear analysis results when input changes significantly
  // Track previous englishPhrase to detect actual changes
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
            const correctionResult: AnalysisResult = {
              correctness: "incorrect" as const,
              meaning: "ประโยคนี้มีไวยากรณ์ที่ไม่ถูกต้อง",
              alternatives: suggestion ? [suggestion] : [],
              errors: data.error.message
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

      if (!data.data) {
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
                  (!formData.englishPhrase.trim() &&
                    !formData.userTranslation.trim())
                }
                className="flex-1 bg-gradient-to-r from-primary to-primary text-white py-4 px-6 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isAnalyzing ? "กำลังวิเคราะห์..." : "อธิบาย!"}
              </button>

              <button
                onClick={handleSave}
                disabled={
                  isAnalyzing ||
                  isSaving ||
                  (!formData.englishPhrase.trim() &&
                    !formData.userTranslation.trim())
                }
                className="flex-1 bg-gradient-to-r from-accent to-accent text-white py-4 px-6 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSaving ? "กำลังบันทึก..." : "เก็บ!"}
              </button>
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

            {/* Analysis Result Display */}
            {analysisResult && (
              <div className="p-6 bg-green-50 border border-green-200 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <h3 className="text-lg font-semibold text-green-800">ผลการวิเคราะห์</h3>
                </div>
                
                {/* Correctness Status */}
                <div className="p-4 bg-white rounded-lg border border-green-100">
                  <h4 className="font-medium text-green-700 mb-2">ความถูกต้อง:</h4>
                  <div className="flex items-center gap-2">
                    {analysisResult.correctness === "correct" && (
                      <>
                        <span className="text-green-600">🎉</span>
                        <span className="text-green-600 font-medium">ถูกต้อง</span>
                      </>
                    )}
                    {analysisResult.correctness === "partially_correct" && (
                      <>
                        <span className="text-yellow-600">⚠️</span>
                        <span className="text-yellow-600 font-medium">ถูกต้องบางส่วน</span>
                      </>
                    )}
                    {analysisResult.correctness === "incorrect" && (
                      <>
                        <span className="text-red-600">❌</span>
                        <span className="text-red-600 font-medium">ไม่ถูกต้อง</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Meaning */}
                <div className="p-4 bg-white rounded-lg border border-green-100">
                  <h4 className="font-medium text-green-700 mb-2">ความหมาย:</h4>
                  <p className="text-gray-700">{analysisResult.meaning}</p>
                </div>

                {/* Alternatives */}
                {analysisResult.alternatives && analysisResult.alternatives.length > 0 && (
                  <div className="p-4 bg-white rounded-lg border border-green-100">
                    <h4 className="font-medium text-green-700 mb-2">ทางเลือกอื่น:</h4>
                    <ul className="space-y-1">
                      {analysisResult.alternatives.map((alternative, index) => (
                        <li key={index} className="text-gray-700 flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>{alternative}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Errors/Suggestions */}
                {analysisResult.errors && (
                  <div className="p-4 bg-white rounded-lg border border-green-100">
                    <h4 className="font-medium text-green-700 mb-2">ข้อเสนอแนะ:</h4>
                    <p className="text-gray-700">{analysisResult.errors}</p>
                  </div>
                )}
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

            {/* Help Text */}
            <p className="text-sm text-muted-foreground text-center">
              กรอกประโยคภาษาอังกฤษหรือคำแปลอย่างน้อย 1 ฟิลด์เพื่อเริ่มใช้งาน
            </p>
          </div>
        </div>
      </SignedIn>
    </div>
  );
}
