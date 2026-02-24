import { useState, useEffect } from 'react';
import { KeyRound } from 'lucide-react';

interface ApiKeyGuardProps {
  children: React.ReactNode;
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function ApiKeyGuard({ children }: ApiKeyGuardProps) {
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      try {
        if (window.aistudio && window.aistudio.hasSelectedApiKey) {
          const result = await window.aistudio.hasSelectedApiKey();
          setHasKey(result);
        } else {
          // Fallback if not in AI Studio environment
          setHasKey(true);
        }
      } catch (e) {
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    try {
      if (window.aistudio && window.aistudio.openSelectKey) {
        await window.aistudio.openSelectKey();
        // Assume success to mitigate race condition
        setHasKey(true);
      }
    } catch (e) {
      console.error(e);
      // If error contains "Requested entity was not found", reset state
      setHasKey(false);
    }
  };

  if (hasKey === null) {
    return <div className="p-8 text-center text-slate-500">جاري التحقق من الصلاحيات...</div>;
  }

  if (!hasKey) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center max-w-md mx-auto my-8">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <KeyRound className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">مطلوب مفتاح API</h3>
        <p className="text-slate-600 mb-6">
          هذه الميزة تتطلب استخدام نماذج مدفوعة. يرجى اختيار مفتاح API الخاص بك من مشروع Google Cloud للاستمرار.
          <br />
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
            مزيد من المعلومات عن الفوترة
          </a>
        </p>
        <button
          onClick={handleSelectKey}
          className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold transition-colors"
        >
          اختيار مفتاح API
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
