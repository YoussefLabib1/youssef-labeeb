import { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Video, Film, Search, Upload, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ApiKeyGuard from '../../components/ApiKeyGuard';

export default function VideoTab() {
  const [mode, setMode] = useState<'generate' | 'animate' | 'analyze'>('generate');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedFile(event.target?.result as string);
        setResultVideo(null);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAction = async () => {
    if (!prompt.trim() && mode !== 'analyze') {
      toast.error('الرجاء إدخال وصف');
      return;
    }
    if ((mode === 'animate' || mode === 'analyze') && !selectedFile) {
      toast.error('الرجاء اختيار ملف أولاً');
      return;
    }

    setLoading(true);
    setResultVideo(null);
    setAnalysisResult(null);
    setStatus('جاري بدء المعالجة...');

    try {
      const apiKey = process.env.GEMINI_API_KEY || '';
      const ai = new GoogleGenAI({ apiKey });

      if (mode === 'generate' || mode === 'animate') {
        let operation;
        
        if (mode === 'generate') {
          operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
              numberOfVideos: 1,
              resolution: '720p',
              aspectRatio: aspectRatio,
            }
          });
        } else {
          const base64Data = selectedFile!.split(',')[1];
          const mimeType = selectedFile!.split(';')[0].split(':')[1];
          
          operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            image: {
              imageBytes: base64Data,
              mimeType: mimeType,
            },
            config: {
              numberOfVideos: 1,
              resolution: '720p',
              aspectRatio: aspectRatio,
            }
          });
        }

        setStatus('جاري توليد الفيديو... قد يستغرق هذا عدة دقائق');
        
        while (!operation.done) {
          await new Promise(resolve => setTimeout(resolve, 10000));
          operation = await ai.operations.getVideosOperation({ operation: operation });
          setStatus('لا زال التوليد مستمراً... يرجى الانتظار');
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        
        if (downloadLink) {
          setStatus('جاري تحميل الفيديو...');
          const response = await fetch(downloadLink, {
            method: 'GET',
            headers: {
              'x-goog-api-key': apiKey,
            },
          });
          
          if (!response.ok) throw new Error('فشل تحميل الفيديو');
          
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setResultVideo(url);
          setStatus('');
        } else {
          throw new Error('لم يتم العثور على رابط الفيديو');
        }
      } else if (mode === 'analyze') {
        setStatus('جاري تحليل الفيديو...');
        const base64Data = selectedFile!.split(',')[1];
        const mimeType = selectedFile!.split(';')[0].split(':')[1];

        const response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                },
              },
              { text: prompt || 'صف محتوى هذا الفيديو بالتفصيل' },
            ],
          },
        });

        setAnalysisResult(response.text || 'لم يتم العثور على نتيجة');
        setStatus('');
      }
    } catch (error: any) {
      console.error(error);
      toast.error('حدث خطأ أثناء معالجة الطلب');
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ApiKeyGuard>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-2 overflow-x-auto">
          <button
            onClick={() => { setMode('generate'); setResultVideo(null); setAnalysisResult(null); setSelectedFile(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${mode === 'generate' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            <Video className="w-5 h-5" />
            توليد فيديو
          </button>
          <button
            onClick={() => { setMode('animate'); setResultVideo(null); setAnalysisResult(null); setSelectedFile(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${mode === 'animate' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            <Film className="w-5 h-5" />
            تحريك صورة
          </button>
          <button
            onClick={() => { setMode('analyze'); setResultVideo(null); setAnalysisResult(null); setSelectedFile(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${mode === 'analyze' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            <Search className="w-5 h-5" />
            تحليل فيديو
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {(mode === 'animate' || mode === 'analyze') && (
              <div className="space-y-2">
                <label className="block text-lg font-bold text-slate-700">
                  {mode === 'animate' ? 'الصورة الأصلية' : 'الفيديو'}
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors flex flex-col items-center justify-center min-h-[200px]"
                >
                  {selectedFile ? (
                    mode === 'animate' ? (
                      <img src={selectedFile} alt="Selected" className="max-h-48 rounded-xl object-contain" />
                    ) : (
                      <video src={selectedFile} controls className="max-h-48 rounded-xl" />
                    )
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-slate-400 mb-4" />
                      <p className="text-slate-600 font-bold">
                        انقر لاختيار {mode === 'animate' ? 'صورة' : 'فيديو'}
                      </p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept={mode === 'animate' ? 'image/*' : 'video/*'} 
                  className="hidden" 
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-lg font-bold text-slate-700">
                {mode === 'generate' ? 'وصف الفيديو' : mode === 'animate' ? 'وصف الحركة' : 'سؤال عن الفيديو (اختياري)'}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mode === 'generate' ? 'مثال: سيارة رياضية تسير في شارع مضاء بالنيون...' : mode === 'animate' ? 'مثال: اجعل الشخص يبتسم ويلوح بيده...' : 'مثال: ماذا يحدث في هذا الفيديو؟'}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
              />
            </div>

            {(mode === 'generate' || mode === 'animate') && (
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">الأبعاد</label>
                <select 
                  value={aspectRatio} 
                  onChange={(e) => setAspectRatio(e.target.value as any)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="16:9">شاشة عريضة (16:9)</option>
                  <option value="9:16">جوال (9:16)</option>
                </select>
              </div>
            )}

            <button
              onClick={handleAction}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Video className="w-6 h-6" />}
              {mode === 'generate' ? 'توليد الفيديو' : mode === 'animate' ? 'تحريك الصورة' : 'تحليل الفيديو'}
            </button>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center min-h-[400px]">
            {loading ? (
              <div className="text-center text-slate-500">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-500" />
                <p className="font-bold text-lg mb-2">{status}</p>
                <p className="text-sm">يرجى عدم إغلاق هذه الصفحة</p>
              </div>
            ) : resultVideo ? (
              <div className="space-y-4 w-full">
                <video src={resultVideo} controls autoPlay loop className="w-full rounded-xl shadow-sm" />
                <a 
                  href={resultVideo} 
                  download="generated-video.mp4"
                  className="flex items-center justify-center gap-2 w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-3 rounded-xl font-bold transition-colors"
                >
                  <Download className="w-5 h-5" />
                  تحميل الفيديو
                </a>
              </div>
            ) : analysisResult ? (
              <div className="w-full h-full bg-white p-6 rounded-xl shadow-sm border border-slate-100 overflow-y-auto prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-slate-800 text-lg leading-relaxed">{analysisResult}</p>
              </div>
            ) : (
              <div className="text-center text-slate-400">
                <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="font-bold text-lg">النتيجة ستظهر هنا</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ApiKeyGuard>
  );
}
