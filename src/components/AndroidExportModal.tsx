import React, { useState } from 'react';
import { Smartphone, Copy, Check, Code, Folder, Layers } from 'lucide-react';

interface AndroidExportModalProps {
  onClose: () => void;
}

export const AndroidExportModal: React.FC<AndroidExportModalProps> = ({ onClose }) => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<string>('MainActivity.kt');

  const files: Record<string, string> = {
    'MainActivity.kt': `package com.carbflow.ai

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.*
import com.carbflow.ai.ui.theme.CarbFlowTheme
import com.carbflow.ai.ui.screens.MainAppScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            CarbFlowTheme {
                Surface(color = MaterialTheme.colorScheme.background) {
                    MainAppScreen()
                }
            }
        }
    }
}`,
    'data/UserProfile.kt': `package com.carbflow.ai.data

data class UserProfile(
    val id: Int = 0,
    val name: String = "كابتن أحمد",
    val age: Int = 28,
    val gender: String = "Male",
    val heightCm: Double = 178.0,
    val weightKg: Double = 82.0,
    val activityLevel: Double = 1.55,
    val goal: String = "بناء عضلي",
    val fastingType: String? = "16:8"
)

data class Macros(val calories: Int, val protein: Int, val fat: Int, val carbs: Int)
data class DayPlan(val day: String, val type: String, val carbs: Int, val protein: Int, val fat: Int, val calories: Int)`,

    'domain/CarbCycling.kt': `package com.carbflow.ai.domain

import com.carbflow.ai.data.UserProfile
import com.carbflow.ai.data.Macros
import com.carbflow.ai.data.DayPlan

object CarbCycling {
    private val days = listOf("السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة")
    
    fun getWeeklyPlan(p: UserProfile, macros: Macros): List<DayPlan> = days.mapIndexed { i, day ->
        val type = when (p.goal) {
            "بناء عضلي" -> if (i % 3 == 0) "مرتفع" else if (i % 2 == 0) "متوسط" else "منخفض"
            "خسارة دهون" -> if (i % 4 == 0) "مرتفع" else if (i % 2 == 0) "متوسط" else "منخفض"
            "تنشيف" -> if (i == 0) "مرتفع" else "منخفض"
            else -> "متوسط"
        }
        val carbFactor = when (type) { "مرتفع" -> 1.45; "متوسط" -> 1.0; "منخفض" -> 0.55; else -> 1.0 }
        DayPlan(
            day = day,
            type = type,
            carbs = (macros.carbs * carbFactor).toInt(),
            protein = macros.protein,
            fat = macros.fat,
            calories = when (type) { "مرتفع" -> macros.calories + 300; "منخفض" -> macros.calories - 300; else -> macros.calories }
        )
    }
}`,

    'service/OpenAIService.kt': `package com.carbflow.ai.service

class OpenAIService(private val apiKey: String) {
    suspend fun askGeminiOrOpenAI(prompt: String, context: String = ""): String {
        if (apiKey.isBlank()) return "⚠️ يرجى إضافة مفتاح API لتمكين الذكاء الاصطناعي."
        return try {
            // Retrofit HTTP request to AI endpoint
            "تحليل الذكاء الاصطناعي لك لـ CarbFlow AI: $prompt"
        } catch (e: Exception) {
            "خطأ في الاتصال: \${e.message}"
        }
    }
}`,

    'res/values/colors.xml': `<resources>
    <color name="md_theme_light_primary">#6750A4</color>
    <color name="md_theme_dark_primary">#D0BCFF</color>
    <color name="goal_muscle">#4CAF50</color>
    <color name="goal_fatloss">#2196F3</color>
    <color name="goal_cutting">#F44336</color>
    <color name="carb_high">#FF9800</color>
    <color name="carb_medium">#2196F3</color>
    <color name="carb_low">#4CAF50</color>
</resources>`,

    'build.gradle': `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace 'com.carbflow.ai'
    compileSdk 34

    defaultConfig {
        applicationId "com.carbflow.ai"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }

    buildFeatures {
        compose true
    }
    composeOptions {
        kotlinCompilerExtensionVersion '1.5.1'
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.compose.ui:ui:1.6.0'
    implementation 'androidx.compose.material3:material3:1.2.0'
}`
  };

  const copyCode = (filename: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-base font-bold text-white">مرجع هيكل كود Android Studio (Kotlin & Jetpack Compose)</h3>
              <p className="text-xs text-slate-400">يمكنك نسخ أي ملف مباشرة واستخدامه لبناء مشروع Android APK</p>
            </div>
          </div>
          <button onClick={onClose} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs">
            إغلاق
          </button>
        </div>

        {/* File Tabs */}
        <div className="flex gap-2 overflow-x-auto py-3 border-b border-slate-800/80">
          {Object.keys(files).map((fileName) => (
            <button
              key={fileName}
              onClick={() => setActiveFile(fileName)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition shrink-0 ${
                activeFile === fileName
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {fileName}
            </button>
          ))}
        </div>

        {/* Code Content Box */}
        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-y-auto mt-3 font-mono text-xs text-purple-200 relative">
          <button
            onClick={() => copyCode(activeFile, files[activeFile])}
            className="absolute top-3 left-3 px-3 py-1.5 bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-700 rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 shadow"
          >
            {copiedFile === activeFile ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>تم النسخ!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ كود الملف</span>
              </>
            )}
          </button>
          <pre className="whitespace-pre-wrap leading-relaxed pt-6">{files[activeFile]}</pre>
        </div>
      </div>
    </div>
  );
};
