import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Mic, Volume2, FileAudio, Play, Square, Loader2, Radio } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AudioTab() {
  const [mode, setMode] = useState<'tts' | 'transcribe' | 'live'>('tts');
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [liveConnected, setLiveConnected] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Live API refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const nextPlayTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      stopLiveSession();
    };
  }, []);

  const handleTTS = async () => {
    if (!text.trim()) {
      toast.error('الرجاء إدخال نص');
      return;
    }

    setLoading(true);
    setAudioUrl(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const binaryString = window.atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        const buffer = new ArrayBuffer(44 + bytes.length);
        const view = new DataView(buffer);
        
        const writeString = (offset: number, string: string) => {
          for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
          }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + bytes.length, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, 24000, true);
        view.setUint32(28, 24000 * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, bytes.length, true);
        
        const audioData = new Uint8Array(buffer, 44);
        audioData.set(bytes);
        
        const blob = new Blob([buffer], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      }
    } catch (error: any) {
      console.error(error);
      toast.error('حدث خطأ أثناء توليد الصوت');
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleTranscribe(audioBlob);
      };

      mediaRecorder.start();
      setRecording(true);
      setTranscription(null);
    } catch (error) {
      console.error(error);
      toast.error('لم نتمكن من الوصول إلى الميكروفون');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setRecording(false);
    }
  };

  const handleTranscribe = async (audioBlob: Blob) => {
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64data,
                  mimeType: 'audio/webm',
                },
              },
              { text: 'قم بتفريغ هذا المقطع الصوتي بدقة' },
            ],
          },
        });

        setTranscription(response.text || 'لم يتم العثور على نتيجة');
      };
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء التفريغ الصوتي');
    } finally {
      setLoading(false);
    }
  };

  const startLiveSession = async () => {
    try {
      setLoading(true);
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      nextPlayTimeRef.current = audioContext.currentTime;
      
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "أنت مساعد ذكي لمتجر. أجب باللغة العربية بشكل مختصر ومفيد.",
        },
        callbacks: {
          onopen: () => {
            setLiveConnected(true);
            setLoading(false);
            toast.success('تم الاتصال بالمساعد الصوتي');
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const binary = atob(base64Audio);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
              }
              const pcm16 = new Int16Array(bytes.buffer);
              const float32 = new Float32Array(pcm16.length);
              for (let i = 0; i < pcm16.length; i++) {
                float32[i] = pcm16[i] / 0x7FFF;
              }
              const audioBuffer = audioContextRef.current.createBuffer(1, float32.length, 24000);
              audioBuffer.getChannelData(0).set(float32);
              
              const playSource = audioContextRef.current.createBufferSource();
              playSource.buffer = audioBuffer;
              playSource.connect(audioContextRef.current.destination);
              
              const currentTime = audioContextRef.current.currentTime;
              if (nextPlayTimeRef.current < currentTime) {
                nextPlayTimeRef.current = currentTime;
              }
              playSource.start(nextPlayTimeRef.current);
              nextPlayTimeRef.current += audioBuffer.duration;
            }
            
            if (message.serverContent?.interrupted) {
              nextPlayTimeRef.current = audioContextRef.current?.currentTime || 0;
            }
          },
          onclose: () => {
            stopLiveSession();
          },
          onerror: (error) => {
            console.error(error);
            toast.error('حدث خطأ في الاتصال');
            stopLiveSession();
          }
        },
      });

      sessionRef.current = sessionPromise;

      processor.onaudioprocess = (e) => {
        if (!liveConnected) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        const bytes = new Uint8Array(pcm16.buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Data = btoa(binary);
        
        sessionPromise.then((session: any) => {
          session.sendRealtimeInput({
            media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
          });
        });
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

    } catch (error) {
      console.error(error);
      toast.error('فشل الاتصال بالمساعد الصوتي');
      setLoading(false);
    }
  };

  const stopLiveSession = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (sessionRef.current) {
      sessionRef.current.then((session: any) => session.close());
      sessionRef.current = null;
    }
    setLiveConnected(false);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-2 overflow-x-auto shrink-0">
        <button
          onClick={() => { setMode('tts'); setAudioUrl(null); stopLiveSession(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${mode === 'tts' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          <Volume2 className="w-5 h-5" />
          تحويل النص إلى صوت
        </button>
        <button
          onClick={() => { setMode('transcribe'); setTranscription(null); stopLiveSession(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${mode === 'transcribe' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          <FileAudio className="w-5 h-5" />
          تفريغ صوتي
        </button>
        <button
          onClick={() => { setMode('live'); stopLiveSession(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${mode === 'live' ? 'bg-rose-500 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          <Radio className="w-5 h-5" />
          المحادثة المباشرة
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {mode === 'tts' ? (
            <>
              <div className="space-y-2">
                <label className="block text-lg font-bold text-slate-700">النص المراد تحويله</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="اكتب النص هنا..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[200px]"
                />
              </div>
              <button
                onClick={handleTTS}
                disabled={loading || !text.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Volume2 className="w-6 h-6" />}
                توليد الصوت
              </button>
            </>
          ) : mode === 'transcribe' ? (
            <div className="flex flex-col items-center justify-center space-y-8 py-12">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-slate-800">تسجيل الصوت</h3>
                <p className="text-slate-500">انقر على الزر للبدء في التحدث، وسنقوم بتفريغ كلامك إلى نص.</p>
              </div>
              
              <button
                onClick={recording ? stopRecording : startRecording}
                disabled={loading}
                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  recording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-emerald-500 hover:bg-emerald-600'
                } text-white disabled:opacity-50`}
              >
                {recording ? <Square className="w-12 h-12 fill-current" /> : <Mic className="w-12 h-12" />}
              </button>
              
              {recording && <p className="text-red-500 font-bold animate-pulse">جاري التسجيل...</p>}
              {loading && <p className="text-emerald-600 font-bold flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> جاري التفريغ...</p>}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-8 py-12">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-slate-800">المحادثة المباشرة</h3>
                <p className="text-slate-500">تحدث مباشرة مع المساعد الذكي واحصل على إجابات فورية.</p>
              </div>
              
              <button
                onClick={liveConnected ? stopLiveSession : startLiveSession}
                disabled={loading && !liveConnected}
                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  liveConnected 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-rose-500 hover:bg-rose-600'
                } text-white disabled:opacity-50`}
              >
                {loading && !liveConnected ? (
                  <Loader2 className="w-12 h-12 animate-spin" />
                ) : liveConnected ? (
                  <Square className="w-12 h-12 fill-current" />
                ) : (
                  <Radio className="w-12 h-12" />
                )}
              </button>
              
              {liveConnected && <p className="text-rose-500 font-bold animate-pulse">متصل... يمكنك التحدث الآن</p>}
              {loading && !liveConnected && <p className="text-rose-600 font-bold">جاري الاتصال...</p>}
            </div>
          )}
        </div>

        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center min-h-[400px]">
          {loading && mode !== 'live' ? (
            <div className="text-center text-slate-500">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-500" />
              <p className="font-bold text-lg">جاري المعالجة...</p>
            </div>
          ) : mode === 'tts' && audioUrl ? (
            <div className="space-y-6 w-full max-w-md text-center">
              <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                <Volume2 className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">الصوت جاهز!</h3>
              <audio src={audioUrl} controls autoPlay className="w-full" />
            </div>
          ) : mode === 'transcribe' && transcription ? (
            <div className="w-full h-full bg-white p-6 rounded-xl shadow-sm border border-slate-100 overflow-y-auto prose prose-sm max-w-none">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileAudio className="w-5 h-5 text-emerald-500" />
                النص المفرغ:
              </h3>
              <p className="whitespace-pre-wrap text-slate-700 text-lg leading-relaxed">{transcription}</p>
            </div>
          ) : mode === 'live' ? (
            <div className="text-center text-slate-400">
              <Radio className={`w-24 h-24 mx-auto mb-4 ${liveConnected ? 'text-rose-500 animate-pulse' : 'opacity-50'}`} />
              <p className="font-bold text-lg">{liveConnected ? 'المساعد يستمع إليك...' : 'اضغط على الزر للاتصال'}</p>
            </div>
          ) : (
            <div className="text-center text-slate-400">
              {mode === 'tts' ? <Volume2 className="w-16 h-16 mx-auto mb-4 opacity-50" /> : <FileAudio className="w-16 h-16 mx-auto mb-4 opacity-50" />}
              <p className="font-bold text-lg">النتيجة ستظهر هنا</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
