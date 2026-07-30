import React, { useState } from 'react';
import { UserProfile, DayPlan, ChatMessage } from '../types';
import { Bot, Send, Sparkles, User, RefreshCw, Lightbulb, Dumbbell, Flame } from 'lucide-react';

interface AIScreenProps {
  profile: UserProfile;
  todayPlan: DayPlan;
}

export const AIScreen: React.FC<AIScreenProps> = ({ profile, todayPlan }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_1',
      sender: 'ai',
      text: `مرحباً كابتن ${profile.name}! 👋
أنا مدربك الذكي المساعد في CarbFlow AI. 
يومك الحالي هو: **${todayPlan?.dayName || 'اليوم'}** (كارب **${todayPlan?.type === 'high' ? 'مرتفع 🔥' : todayPlan?.type === 'refeed' ? 'Refeed ⚡' : todayPlan?.type === 'medium' ? 'متوسط ⚖️' : 'منخفض 🥗'}**).

كيف يمكنني مساعدتك الآن؟ يمكنني:
• اقتراح وجبات محسوبة الكارب والبروتين.
• تعديل الماكروز حسب شدة تمرينك اليوم.
• إجابة أي سؤال حول الصيام المتقطع أو الكارب سايكل.`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'اقترح لي وجبة سريعة عالي الكارب قبل التمرين 🔥',
    'ماذا آكل في يوم الكارب المنخفض عند الجوع؟ 🥗',
    'كيف أوفق بين الصيام المتقطع والتمرين القوي؟ ⚡',
    'احسب لي ماكروز: 200g صدور دجاج + 150g أرز مسلوق 🍗',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || loading) return;

    const userMsgId = 'user_' + Date.now();
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          profile,
          planType: todayPlan?.type || 'medium',
          context: `اليوم: ${todayPlan?.dayName || 'اليوم'}, تمرين اليوم: ${todayPlan?.workoutFocus || ''}, الكارب المستهدف: ${todayPlan?.carbs || 0}g, السعرات المستهدفة: ${todayPlan?.calories || 0} kcal`,
        }),
      });

      const data = await response.json();
      const aiMsg: ChatMessage = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: data.text || 'شكرًا لطلبك، لم أتمكن من إيجاد الرد المناسب.',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'ai',
          text: 'عذراً، حدث خطأ في الاتصال بالسيرفر: ' + (err.message || 'خطأ غير معروف'),
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
      {/* Top AI Bar */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <Bot className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              مساعد CarbFlow AI الذكي
              <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 rounded">متصل</span>
            </h3>
            <p className="text-[10px] text-slate-400">مدعوم بـ Gemini 2.5 للتحليل الغذائي والتوجيه</p>
          </div>
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                msg.sender === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-indigo-950 border border-indigo-700 text-indigo-300'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-1 ${
                msg.sender === 'user'
                  ? 'bg-purple-600 text-white rounded-tr-none shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-lg'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <span className="block text-[9px] opacity-60 text-left font-mono">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-purple-400 p-2 bg-slate-900/60 rounded-xl w-fit">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
            <span>جاري تحليل البيانات وتوليد الإجابة...</span>
          </div>
        )}
      </div>

      {/* Quick Suggestions Chips */}
      <div className="px-3 py-2 bg-slate-900/60 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp)}
            disabled={loading}
            className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 transition"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-slate-900 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="اسأل الذكاء الاصطناعي حول الوجبات، التمرين، أو الكارب..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputPrompt.trim()}
            className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white flex items-center justify-center shadow-md shadow-purple-600/30 transition shrink-0"
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
