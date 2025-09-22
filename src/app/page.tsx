"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            เรียนรู้ภาษาอังกฤษ
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              อย่างชาญฉลาด
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            วิเคราะห์ประโยคภาษาอังกฤษด้วย AI ที่เข้าใจบริบทไทย
            <br />
            พัฒนาทักษะการใช้ภาษาอย่างมีประสิทธิภาพ
          </p>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                วิเคราะห์แม่นยำ
              </h3>
              <p className="text-gray-600">
                ตรวจสอบไวยากรณ์ คำศัพท์ และบริบทการใช้งานอย่างละเอียด
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                เข้าใจบริบทไทย
              </h3>
              <p className="text-gray-600">
                AI ที่เข้าใจความแตกต่างทางวัฒนธรรมและการใช้ภาษา
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                เก็บและจัดการ
              </h3>
              <p className="text-gray-600">
                บันทึกและจัดระเบียบประโยคที่เรียนรู้เพื่อทบทวน
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-y-4">
            <SignedOut>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <SignInButton mode="modal">
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    เริ่มใช้งานฟรี
                  </button>
                </SignInButton>
                <Link 
                  href="#features"
                  className="text-gray-600 hover:text-gray-900 px-8 py-4 rounded-xl text-lg font-medium transition-colors"
                >
                  เรียนรู้เพิ่มเติม
                </Link>
              </div>
              <p className="text-sm text-gray-500">
                ไม่ต้องใช้บัตรเครดิต • เริ่มใช้งานได้ทันที
              </p>
            </SignedOut>

            <SignedIn>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  href="/analyzer"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  เริ่มวิเคราะห์ประโยค
                </Link>
                <Link 
                  href="/studio"
                  className="text-gray-600 hover:text-gray-900 px-8 py-4 rounded-xl text-lg font-medium transition-colors"
                >
                  ดูประโยคที่บันทึก
                </Link>
              </div>
            </SignedIn>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ทำไมต้องเลือก PootDee?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              เครื่องมือที่ออกแบบมาเพื่อคนไทยโดยเฉพาะ
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                วิเคราะห์ทันที
              </h3>
              <p className="text-gray-600">
                ได้ผลการวิเคราะห์ภายในไม่กี่วินาที พร้อมคำแนะนำที่ชัดเจน
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
              <div className="text-3xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                ใช้งานง่าย
              </h3>
              <p className="text-gray-600">
                อินเทอร์เฟซที่เรียบง่าย เข้าใจง่าย เหมาะสำหรับทุกระดับ
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                ปลอดภัย
              </h3>
              <p className="text-gray-600">
                ข้อมูลของคุณได้รับการปกป้องด้วยระบบรักษาความปลอดภัยระดับสูง
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                รายงานละเอียด
              </h3>
              <p className="text-gray-600">
                ได้รับการวิเคราะห์ครบถ้วน ทั้งไวยากรณ์ คำศัพท์ และบริบท
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
              <div className="text-3xl mb-4">💾</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                จัดเก็บอัตโนมัติ
              </h3>
              <p className="text-gray-600">
                บันทึกประโยคที่วิเคราะห์แล้วเพื่อทบทวนและเรียนรู้ต่อไป
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
              <div className="text-3xl mb-4">🌟</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                พัฒนาต่อเนื่อง
              </h3>
              <p className="text-gray-600">
                อัปเดตฟีเจอร์ใหม่และปรับปรุงความแม่นยำอย่างสม่ำเสมอ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            พร้อมที่จะเริ่มต้นแล้วหรือยัง?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            เข้าร่วมกับผู้เรียนหลายพันคนที่เลือกใช้ PootDee 
            เพื่อพัฒนาทักษะภาษาอังกฤษ
          </p>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                เริ่มใช้งานฟรีวันนี้
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Link 
              href="/analyzer"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 inline-block"
            >
              เริ่มวิเคราะห์ประโยค
            </Link>
          </SignedIn>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 PootDee. สร้างด้วยความใส่ใจเพื่อคนไทย
          </p>
        </div>
      </footer>
    </div>
  );
}
