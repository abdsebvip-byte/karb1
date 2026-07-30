import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// AI Chat Endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { prompt, context, profile, planType } = req.body;

    // Calculate exact mathematical context from profile
    const weightKg = Number(profile?.weightKg) || 80;
    const heightCm = Number(profile?.heightCm) || 175;
    const age = Number(profile?.age) || 28;
    const gender = profile?.gender === 'Female' ? 'Female' : 'Male';
    const bodyFatPct = Number(profile?.bodyFatPct) || (gender === 'Female' ? 23 : 15);
    const activityLevel = Number(profile?.activityLevel) || 1.55;

    const lbmKg = Math.round(weightKg * (1 - bodyFatPct / 100) * 10) / 10;
    const bmrKatch = Math.round(370 + (21.6 * lbmKg));
    const tdee = Math.round(bmrKatch * activityLevel);

    if (!ai) {
      // Scientific mathematical analysis directly derived from user metrics
      return res.json({
        text: `بصفتي المحرك الحسابي لـ CarbFlow AI:
بناءً على قياساتك الحيوية الدقيقة (الوزن: ${weightKg} كجم، نسبة الدهون: ${bodyFatPct}%، الكتلة العضلية LBM: ${lbmKg} كجم):

📊 **التحليل العلمي الحسابي لمؤشراتك:**
1. **معدل الأيض الأساسي BMR (معادلة Katch-McArdle):** ${bmrKatch} سعرة حرارية/يوم.
2. **إجمالي طاقة الحرق اليومي (TDEE):** ${tdee} سعرة حرارية/يوم.
3. **نوع يوم الكارب الحالي:** ${planType === 'high' ? 'كارب مرتفع 🔥 (شحن الجليكوجين)' : planType === 'refeed' ? 'Refeed ⚡ (تنشيط هرمون اللبتين)' : planType === 'medium' ? 'كارب متوسط ⚖️ (توازن البناء)' : 'كارب منخفض 🥗 (أكسدة الدهون)'}.

💡 **التوصية العلمية اليومية لطلبك ("${prompt}"):**
- **توجيه الكارب:** حافظ على تناول 75% من الكارب اليومي حول نافذة التمرين (قبل التمرين بـ 1.5 ساعة وبعده بـ 45 دقيقة) للاستفادة من مستقبلات GLUT4 البنائية.
- **الماء والصيام:** استهدف 3.5 لتر ماء مع الالتزام بنافذة صيام ${profile?.fastingType || '16:8'} لرفع حساسية الإنسولين وحماية النسيج العضلي.

*(ملاحظة: تم توليد هذه الإجابة عبر المحرك الرياضي الداخلي Katch-McArdle Engine بناءً على قياساتك الحقيقية).*`
      });
    }

    const systemInstruction = `أنت الخبير الرياضي والمستشار العلمي لنظام CarbFlow AI.
عليك الاعتماد الصارم على الأرقام والمعادلات العلمية المحسوبة للمستخدم:
- الوزن: ${weightKg} kg
- الكتلة العضلية الخالية من الدهون (LBM): ${lbmKg} kg (حُسبت بدقة عبر Katch-McArdle)
- نسبة الدهون: ${bodyFatPct}%
- BMR (Katch-McArdle): ${bmrKatch} kcal
- TDEE: ${tdee} kcal
- نوع اليوم الحالي: ${planType || 'medium'}
- سياق اليوم: ${context || ''}

ممنوع استخدام أرقام عشوائية أو تخمينية. تحدث باللغة العربية بأسلوب علمي دقيق، مشجع، ومنسق بنقاط وأجوبة مباشرة.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: error.message || 'حدث خطأ أثناء التواصل مع الذكاء الاصطناعي.' });
  }
});

// AI Recipes Endpoint
app.post('/api/ai/recipes', async (req, res) => {
  try {
    const { dayType, targetCarbs, targetProtein, targetFat, targetCalories, preferences } = req.body;

    const c = Math.max(20, Number(targetCarbs) || 150);
    const p = Math.max(20, Number(targetProtein) || 120);
    const f = Math.max(10, Number(targetFat) || 50);
    const cal = Number(targetCalories) || ((c * 4) + (p * 4) + (f * 9));

    if (!ai) {
      // Dynamically calculated meals mathematically split from target macros
      const breakfastC = Math.round(c * 0.30);
      const breakfastP = Math.round(p * 0.30);
      const breakfastF = Math.round(f * 0.30);
      const breakfastCal = Math.round((breakfastC * 4) + (breakfastP * 4) + (breakfastF * 9));

      const lunchC = Math.round(c * 0.45);
      const lunchP = Math.round(p * 0.45);
      const lunchF = Math.round(f * 0.45);
      const lunchCal = Math.round((lunchC * 4) + (lunchP * 4) + (lunchF * 9));

      const dinnerC = Math.max(0, c - (breakfastC + lunchC));
      const dinnerP = Math.max(0, p - (breakfastP + lunchP));
      const dinnerF = Math.max(0, f - (breakfastF + lunchF));
      const dinnerCal = Math.round((dinnerC * 4) + (dinnerP * 4) + (dinnerF * 9));

      // Calculate exact food portion weights dynamically
      const bOatsG = Math.round((breakfastC * 0.7) / 0.66);
      const bEggCount = Math.max(2, Math.round(breakfastP / 7));
      const lRiceG = Math.round((lunchC * 0.8) / 0.28);
      const lChickenG = Math.round((lunchP * 0.85) / 0.31);
      const dPotatoG = Math.round((dinnerC * 0.75) / 0.20);
      const dTunaG = Math.round((dinnerP * 0.8) / 0.25);

      return res.json({
        recipes: [
          {
            title: `وجبة الإفطار الموزونة (${breakfastC}g كارب)`,
            mealType: 'إفطار / كسر الصيام',
            description: `وجبة إفطار مخصصة بنسبة 30% من الماكروز لتعزيز طاقة البداية وتغذية الجليكوجين.`,
            carbs: breakfastC,
            protein: breakfastP,
            fat: breakfastF,
            calories: breakfastCal,
            ingredients: [
              `${bOatsG}g شوفان جاف (${breakfastC}g كارب معقد)`,
              `${bEggCount} بيض بلدي كامل / بياض بيض (${breakfastP}g بروتين)`,
              `زيت زيتون بكر أو مكسرات نية (${breakfastF}g دهون صحية)`
            ]
          },
          {
            title: `وجبة الغداء الرئيسية (${lunchC}g كارب)`,
            mealType: 'غداء / وجبة ما بعد التمرين',
            description: `وجبة غداء مكثفة بنسبة 45% من الكارب اليومي لشحن العضلات بعد التمرين وتنشيط البناء العضلي.`,
            carbs: lunchC,
            protein: lunchP,
            fat: lunchF,
            calories: lunchCal,
            ingredients: [
              `${lRiceG}g أرز بني/أبيض مطبوخ (${lunchC}g كارب)`,
              `${lChickenG}g صدور دجاج مشوية (${lunchP}g بروتين)`,
              `سلطة خضراء مع خضار سوتيه (${lunchF}g دهون وألياف)`
            ]
          },
          {
            title: `وجبة العشاء والتعافي (${dinnerC}g كارب)`,
            mealType: 'عشاء / ختم النافذة',
            description: `وجبة خفيفة ومحسوبة بنسبة 25% لتوفير الاستشفاء العصبي والعضلي طوال الليل.`,
            carbs: dinnerC,
            protein: dinnerP,
            fat: dinnerF,
            calories: dinnerCal,
            ingredients: [
              `${dPotatoG}g بطاطس حلوة/مسلوقة (${dinnerC}g كارب)`,
              `${dTunaG}g تونة صافية بالماء أو فيليه سمك (${dinnerP}g بروتين)`,
              `أفوكادو أو زيت زيتون (${dinnerF}g دهون صحية)`
            ]
          }
        ]
      });
    }

    const prompt = `يرجى تقديم 3 وجبات صحية ومبتكرة تناسب يوم كربوهيدرات من نوع "${dayType}" (high/medium/low) في نظام Carb Cycle.
الأهداف الغذائية اليومية:
- الكربوهيدرات: ${targetCarbs}g
- البروتين: ${targetProtein}g
- الدهون: ${targetFat}g
- السعرات الحرارية: ${targetCalories} kcal
تفضيلات: ${preferences || 'وجبات عربية صحية سهلة التحضير'}

أرجع الإجابة كـ JSON صالح بدقة بنفس الهيكل التالي:
{
  "recipes": [
    {
      "title": "اسم الوجبة",
      "mealType": "إفطار / غداء / عشاء / سناك",
      "description": "وصف قصير",
      "carbs": 40,
      "protein": 30,
      "fat": 10,
      "calories": 370,
      "ingredients": ["عنصر 1", "عنصر 2"]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    res.json(JSON.parse(response.text || '{"recipes":[]}'));
  } catch (error: any) {
    console.error('Recipes AI Error:', error);
    res.status(500).json({ error: error.message || 'فشل توليد الوصفات.' });
  }
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  app.use(vite.middlewares);
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const templatePath = path.resolve(__dirname, 'index.html');
      const rawHtml = fs.readFileSync(templatePath, 'utf-8');
      const template = await vite.transformIndexHtml(url, rawHtml);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e: any) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`CarbFlow AI Server running on http://0.0.0.0:${PORT}`);
});
