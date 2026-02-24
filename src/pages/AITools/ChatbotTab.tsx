import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { Send, Bot, User, Search, MapPin, Brain, Zap } from 'lucide-react';
import Markdown from 'react-markdown';
import toast from 'react-hot-toast';

type Message = {
  role: 'user' | 'model';
  text: string;
  urls?: { uri: string; title: string }[];
};

export default function ChatbotTab() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'pro' | 'flash-lite' | 'thinking' | 'search' | 'maps'>('pro');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      // Create a fresh instance for each call
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      let responseText = '';
      let urls: { uri: string; title: string }[] = [];

      if (mode === 'pro') {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: userMessage,
        });
        responseText = response.text || '';
      } else if (mode === 'flash-lite') {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-lite-latest',
          contents: userMessage,
        });
        responseText = response.text || '';
      } else if (mode === 'thinking') {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: userMessage,
          config: { thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } },
        });
        responseText = response.text || '';
      } else if (mode === 'search') {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: userMessage,
          config: { tools: [{ googleSearch: {} }] },
        });
        responseText = response.text || '';
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
          urls = chunks.map((c: any) => c.web).filter(Boolean);
        }
      } else if (mode === 'maps') {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: userMessage,
          config: {
            tools: [{ googleMaps: {} }],
            toolConfig: {
              retrievalConfig: {
                latLng: {
                  latitude: 24.7136, // Default to Riyadh
                  longitude: 46.6753,
                },
              },
            },
          },
        });
        responseText = response.text || '';
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
          urls = chunks.map((c: any) => c.maps).filter(Boolean);
        }
      }

      setMessages(prev => [...prev, { role: 'model', text: responseText, urls }]);
    } catch (error: any) {
      console.error(error);
      toast.error('حدث خطأ أثناء الاتصال بالذكاء الاصطناعي');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setMode('pro')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${mode === 'pro' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          <Bot className="w-5 h-5" />
          مساعد ذكي (Pro)
        </button>
        <button
          onClick={() => setMode('flash-lite')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${mode === 'flash-lite' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          <Zap className="w-5 h-5" />
          رد سريع (Flash Lite)
        </button>
        <button
          onClick={() => setMode('thinking')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${mode === 'thinking' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          <Brain className="w-5 h-5" />
          تفكير عميق (Thinking)
        </button>
        <button
          onClick={() => setMode('search')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${mode === 'search' ? 'bg-blue-500 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          <Search className="w-5 h-5" />
          بحث الويب (Search)
        </button>
        <button
          onClick={() => setMode('maps')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${mode === 'maps' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          <MapPin className="w-5 h-5" />
          بحث الخرائط (Maps)
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Bot className="w-20 h-20 mb-4 opacity-50" />
            <p className="text-xl font-bold">كيف يمكنني مساعدتك اليوم؟</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                {msg.role === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none'}`}>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <Markdown>{msg.text}</Markdown>
                </div>
                {msg.urls && msg.urls.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm font-bold mb-2">المصادر:</p>
                    <ul className="space-y-1">
                      {msg.urls.map((url, i) => (
                        <li key={i}>
                          <a href={url.uri} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-sm">
                            {url.title || url.uri}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-100 bg-white">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg flex items-center justify-center transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
