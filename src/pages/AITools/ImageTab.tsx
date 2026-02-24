import { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Image as ImageIcon, Edit, Search, Upload, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ApiKeyGuard from '../../components/ApiKeyGuard';

export default function ImageTab() {
  const [mode, setMode] = useState<'generate' | 'edit' | 'analyze'>('generate');
  const [prompt, setPrompt] = useState('');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4' | '4:3' | '9:16' | '16:9'>('1:1');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setResultImage(null);
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
    if ((mode === 'edit' || mode === 'analyze') && !selectedImage) {
      toast.error('الرجاء اختيار صورة أولاً');
      return;
    }

    setLoading(true);
    setResultImage(null);
    setAnalysisResult(null);

    try {
      // Must create a new instance to pick up the latest API key from the dialog
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

      if (mode === 'generate') {
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-image-preview',
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio,
              imageSize: imageSize,
            },
          },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            setResultImage(`data:image/png;base64,${part.inlineData.data}`);
            break;
          }
        }
      } else if (mode === 'edit') {
        const base64Data = selectedImage!.split(',')[1];
        const mimeType = selectedImage!.split(';')[0].split(':')[1];

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                },
              },
              { text: prompt },
            ],
          },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            setResultImage(`data:image/png;base64,${part.inlineData.data}`);
            break;
          }
        }
      } else if (mode === 'analyze') {
        const base64Data = selectedImage!.split(',')[1];
        const mimeType = selectedImage!.split(';')[0].split(':')[1];

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
              { text: prompt || 'صف هذه الصورة بالتفصيل' },
            ],
          },
        });

        setAnalysisResult(response.text || 'لم يتم العثور على نتيجة');
      }
    } catch (error: any) {
      console.error(error);
      toast.error('حدث خطأ أثناء معالجة الطلب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ApiKeyGuard>
      <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => { setMode('generate'); setResultImage(null); setAnalysisResult(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${mode === 'generate' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            <ImageIcon className="w-5 h-5" />
            توليد صورة
          </button>
          <button
            onClick={() => { setMode('edit'); setResultImage(null); setAnalysisResult(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${mode === 'edit' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            <Edit className="w-5 h-5" />
            تعديل صورة
          </button>
          <button
            onClick={() => { setMode('analyze'); setResultImage(null); setAnalysisResult(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${mode === 'analyze' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            <Search className="w-5 h-5" />
            تحليل صورة
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {(mode === 'edit' || mode === 'analyze') && (
              <div className="space-y-2">
                <label className="block text-lg font-bold text-slate-700">الصورة الأصلية</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors flex flex-col items-center justify-center min-h-[200px]"
                >
                  {selectedImage ? (
                    <img src={selectedImage} alt="Selected" className="max-h-48 rounded-xl object-contain" />
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-slate-400 mb-4" />
                      <p className="text-slate-600 font-bold">انقر لاختيار صورة</p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-lg font-bold text-slate-700">
                {mode === 'generate' ? 'وصف الصورة' : mode === 'edit' ? 'التعديل المطلوب' : 'سؤال عن الصورة (اختياري)'}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mode === 'generate' ? 'مثال: متجر بقالة حديث بألوان زاهية...' : mode === 'edit' ? 'مثال: أضف فلتر قديم للصورة...' : 'مثال: ما هي المنتجات الموجودة في هذه الصورة؟'}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
              />
            </div>

            {mode === 'generate' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">حجم الصورة</label>
                  <select 
                    value={imageSize} 
                    onChange={(e) => setImageSize(e.target.value as any)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="1K">1K (سريع)</option>
                    <option value="2K">2K (جودة عالية)</option>
                    <option value="4K">4K (جودة فائقة)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">الأبعاد</label>
                  <select 
                    value={aspectRatio} 
                    onChange={(e) => setAspectRatio(e.target.value as any)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="1:1">مربع (1:1)</option>
                    <option value="4:3">أفقي (4:3)</option>
                    <option value="16:9">شاشة عريضة (16:9)</option>
                    <option value="3:4">عمودي (3:4)</option>
                    <option value="9:16">جوال (9:16)</option>
                  </select>
                </div>
              </div>
            )}

            <button
              onClick={handleAction}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-6 h-6" />}
              {mode === 'generate' ? 'توليد الصورة' : mode === 'edit' ? 'تطبيق التعديل' : 'تحليل الصورة'}
            </button>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center min-h-[400px]">
            {loading ? (
              <div className="text-center text-slate-500">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-500" />
                <p className="font-bold text-lg">جاري المعالجة... قد يستغرق هذا بضع ثوانٍ</p>
              </div>
            ) : resultImage ? (
              <div className="space-y-4 w-full">
                <img src={resultImage} alt="Result" className="w-full rounded-xl shadow-sm" />
                <a 
                  href={resultImage} 
                  download="generated-image.png"
                  className="flex items-center justify-center gap-2 w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-3 rounded-xl font-bold transition-colors"
                >
                  <Download className="w-5 h-5" />
                  تحميل الصورة
                </a>
              </div>
            ) : analysisResult ? (
              <div className="w-full h-full bg-white p-6 rounded-xl shadow-sm border border-slate-100 overflow-y-auto prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-slate-800 text-lg leading-relaxed">{analysisResult}</p>
              </div>
            ) : (
              <div className="text-center text-slate-400">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="font-bold text-lg">النتيجة ستظهر هنا</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ApiKeyGuard>
  );
}
