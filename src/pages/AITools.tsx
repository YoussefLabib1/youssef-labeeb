import { useState } from 'react';
import { Sparkles, Bot, Image as ImageIcon, Video, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ChatbotTab from './AITools/ChatbotTab';
import ImageTab from './AITools/ImageTab';
import VideoTab from './AITools/VideoTab';
import AudioTab from './AITools/AudioTab';

export default function AITools() {
  const [activeTab, setActiveTab] = useState<'chat' | 'image' | 'video' | 'audio'>('chat');

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-indigo-600" />
            أدوات الذكاء الاصطناعي
          </h1>
          <p className="text-lg text-slate-500">
            مجموعة متكاملة من أدوات Gemini لتسهيل إدارة محلك
          </p>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-2 shrink-0">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          <Bot className="w-5 h-5" />
          المساعد الذكي
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${activeTab === 'image' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          <ImageIcon className="w-5 h-5" />
          استوديو الصور
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${activeTab === 'video' ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          <Video className="w-5 h-5" />
          استوديو الفيديو
        </button>
        <button
          onClick={() => setActiveTab('audio')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${activeTab === 'audio' ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          <Volume2 className="w-5 h-5" />
          استوديو الصوت
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'chat' && <ChatbotTab />}
            {activeTab === 'image' && <ImageTab />}
            {activeTab === 'video' && <VideoTab />}
            {activeTab === 'audio' && <AudioTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
