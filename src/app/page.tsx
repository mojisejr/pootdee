'use client';

import { useState } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

interface FormData {
  englishPhrase: string;
  userTranslation: string;
  context: string;
  tags: string;
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    englishPhrase: '',
    userTranslation: '',
    context: '',
    tags: ''
  });
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAnalyze = async (): Promise<void> => {
    if (!formData.englishPhrase.trim() && !formData.userTranslation.trim()) {
      alert('กรุณากรอกประโยคภาษาอังกฤษหรือคำแปลอย่างน้อย 1 ฟิลด์');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call for analysis
      console.log('Analyzing phrase:', formData);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Mock delay
    } catch (error) {
      console.error('Error analyzing phrase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!formData.englishPhrase.trim() && !formData.userTranslation.trim()) {
      alert('กรุณากรอกประโยคภาษาอังกฤษหรือคำแปลอย่างน้อย 1 ฟิลด์');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call for saving
      console.log('Saving phrase:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
    } catch (error) {
      console.error('Error saving phrase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SignedOut>
        <div className="h-screen w-full flex flex-col justify-center items-center px-4">
          <div className="text-center space-y-6 max-w-md">
            <h1 className="text-4xl lg:text-5xl font-bold text-primary">POOTDEE</h1>
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
            <p className="text-muted-foreground">วิเคราะห์และจัดการประโยคภาษาอังกฤษ</p>
          </div>

          <div className="space-y-6">
            {/* Main English Phrase Input */}
            <div>
              <label htmlFor="englishPhrase" className="block text-sm font-medium text-foreground mb-2">
                English Phrase
              </label>
              <textarea
                id="englishPhrase"
                value={formData.englishPhrase}
                onChange={(e) => handleInputChange('englishPhrase', e.target.value)}
                placeholder="Enter your English phrase..."
                className="w-full min-h-[120px] p-5 border-2 border-border rounded-2xl text-base leading-relaxed resize-vertical transition-colors focus:border-primary focus:outline-none bg-background"
                disabled={isLoading}
              />
            </div>

            {/* Expandable Additional Fields */}
            {!isExpanded && (
              <button
                onClick={() => setIsExpanded(true)}
                className="w-full p-3 border-2 border-dashed border-muted-foreground rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                disabled={isLoading}
              >
                + เพิ่มข้อมูล
              </button>
            )}

            {isExpanded && (
              <div className="space-y-4 animate-in">
                {/* User Translation */}
                <div>
                  <label htmlFor="userTranslation" className="block text-sm font-medium text-foreground mb-2">
                    คำแปลที่คิด
                  </label>
                  <textarea
                    id="userTranslation"
                    value={formData.userTranslation}
                    onChange={(e) => handleInputChange('userTranslation', e.target.value)}
                    placeholder="ใส่คำแปลที่คุณคิดไว้..."
                    className="w-full min-h-[100px] p-4 border-2 border-border rounded-xl text-base resize-vertical transition-colors focus:border-primary focus:outline-none bg-background"
                    disabled={isLoading}
                  />
                </div>

                {/* Context Field */}
                <div>
                  <label htmlFor="context" className="block text-sm font-medium text-foreground mb-2">
                    บริบท (ใช้ตอนไหน?)
                  </label>
                  <textarea
                    id="context"
                    value={formData.context}
                    onChange={(e) => handleInputChange('context', e.target.value)}
                    placeholder="บอกบริบทหรือสถานการณ์ที่จะใช้ประโยคนี้..."
                    className="w-full min-h-[80px] p-4 border-2 border-border rounded-xl text-base resize-vertical transition-colors focus:border-primary focus:outline-none bg-background"
                    disabled={isLoading}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-foreground mb-2">
                    Tags/หมวดหมู่
                  </label>
                  <input
                    id="tags"
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="เช่น: การทำงาน, การเดินทาง, ครอบครัว"
                    className="w-full p-4 border-2 border-border rounded-xl text-base transition-colors focus:border-primary focus:outline-none bg-background"
                    disabled={isLoading}
                  />
                </div>

                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  ซ่อนฟิลด์เพิ่มเติม
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleAnalyze}
                disabled={isLoading || (!formData.englishPhrase.trim() && !formData.userTranslation.trim())}
                className="flex-1 bg-gradient-to-r from-primary to-primary text-white py-4 px-6 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'กำลังวิเคราะห์...' : 'อธิบาย!'}
              </button>
              
              <button
                onClick={handleSave}
                disabled={isLoading || (!formData.englishPhrase.trim() && !formData.userTranslation.trim())}
                className="flex-1 bg-gradient-to-r from-accent to-accent text-white py-4 px-6 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'กำลังบันทึก...' : 'เก็บ!'}
              </button>
            </div>

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
