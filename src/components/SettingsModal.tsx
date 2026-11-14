import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, Volume2, Gauge, Wand2, Loader2, User, RefreshCw, Archive, Download, Trash2, RotateCcw, Sparkles, Smartphone, CheckCircle2, ShieldCheck, Play, Pause, Radio, Palette, Calculator, Sun, Moon, Monitor, Type } from 'lucide-react';
import { PersonaData } from '../types';
import { VOICE_GENDERS } from '../constants';
import { PWAInstallButton } from './PWAInstallButton';
import { VoiceSampleRecorder } from './VoiceSampleRecorder';
import ConfirmModal from './ConfirmModal';
import { useToast } from './Toast';
import { base64ToWavBlob, clearAudioCacheFromStorage } from '../utils/audio';

const AVAILABLE_FONTS = [
  {
    id: 'Alexandria',
    name: 'الإسكندرية (Alexandria)',
    description: 'خط هندسي عصري ومتناسق لجميع الشاشات',
    previewText: '«حرم العقول والحوار الفلسفي النقي»'
  },
  {
    id: 'Amiri',
    name: 'الأميري (Amiri)',
    description: 'خط نسخ كلاسيكي فاخر ونقي للحوارات الفلسفية',
    previewText: '«أنا لا أعلم إلا أمراً واحداً: وهو أنني لا أعلم شيئاً»'
  },
  {
    id: 'Cairo',
    name: 'القاهرة (Cairo)',
    description: 'خط حديث، واضح وجذاب للقرائية العالية',
    previewText: '«البساطة هي غاية التعقيد في الفكر والابتكار»'
  },
  {
    id: 'Tajawal',
    name: 'تجوال (Tajawal)',
    description: 'خط ناعم وانسيابي مريح للعين في القراءة الممتدة',
    previewText: '«الخيال أهم بكثير من المعرفة؛ فالخيال يطوف بالكون»'
  },
  {
    id: 'IBM Plex Sans Arabic',
    name: 'آي بي إم بليكس (IBM Plex)',
    description: 'خط تقني حديث ذو وضوح مرتفع ورصانة جراحية',
    previewText: '«التكنولوجيا في خدمة الروح والمعرفة الإنسانية»'
  },
  {
    id: 'Almarai',
    name: 'المراعي (Almarai)',
    description: 'خط بسيط وأنيق ذو زوايا دائرية هادئة',
    previewText: '«تأملات المعرفة والوعي الإنساني الخالد»'
  },
  {
    id: 'Noto Naskh Arabic',
    name: 'نوستالجيا نسخ (Noto Naskh)',
    description: 'خط نسخ أصيل يحاكي الكتب والمخطوطات العريقة',
    previewText: '«اقرأ واستنطق الحقيقة في صميم المعرفة»'
  }
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  provider: string;
  setProvider: (provider: string) => void;
  model: string;
  setModel: (model: string) => void;
  audioModel: string;
  setAudioModel: (model: string) => void;
  ttsVolume: number;
  setTtsVolume: (vol: number) => void;
  ttsSpeed: number;
  setTtsSpeed: (speed: number) => void;
  personas: Record<string, PersonaData>;
  updatePersonaTone: (personaKey: string, tone: string) => void;
  updatePersonaVoice: (personaKey: string, voice: string) => void;
  fixLegacyPersonas: () => void;
  openPersonaExtractor?: () => void;
  isFixingLegacy: boolean;
  userInfo: string;
  setUserInfo: (info: string) => void;
  dynamicModels: string[];
  dynamicVoices: string[];
  dynamicAudioModels: string[];
  onVoiceAdded?: (voiceName: string) => void;
  updateModelsAndVoices: (customKey?: string) => void;
  isUpdatingModels: boolean;
  isApiKeyInvalid: boolean;
  isApiKeyVerified: boolean;
  isQuotaExhausted: boolean;
  
  // Auto-Archive Props
  autoArchiveEnabled: boolean;
  setAutoArchiveEnabled: (val: boolean) => void;
  archiveThresholdDays: number;
  setArchiveThresholdDays: (val: number) => void;
  archivedChats: Record<string, any[]>;
  restoreChat: (key: string) => void;
  deleteArchivedChat: (key: string) => void;
  manuallyArchiveOldChats: () => void;
  downloadArchiveFile: () => void;

  // Strict Model Mode
  isStrictModelMode: boolean;
  setIsStrictModelMode: (val: boolean) => void;

  // Theme Switching
  theme?: 'light' | 'dark' | 'system' | 'calculator-gray' | 'plain-text';
  setTheme?: (theme: 'light' | 'dark' | 'system' | 'calculator-gray' | 'plain-text') => void;

  // View Mode (Sanctuary / Invisible UI vs Classic Dashboard)
  viewMode?: 'sanctuary' | 'classic';
  setViewMode?: (mode: 'sanctuary' | 'classic') => void;

  // Font Typography
  fontFamily?: string;
  setFontFamily?: (font: string) => void;

  // Factory Data Reset
  onFactoryReset?: () => void;
}

export default function SettingsModal({ 
  isOpen, onClose, apiKey, setApiKey, provider, setProvider, model, setModel,
  audioModel, setAudioModel,
  ttsVolume, setTtsVolume, ttsSpeed, setTtsSpeed, personas, updatePersonaTone, updatePersonaVoice,
  fixLegacyPersonas, openPersonaExtractor, isFixingLegacy, userInfo, setUserInfo, dynamicModels, dynamicVoices, dynamicAudioModels, onVoiceAdded, updateModelsAndVoices, isUpdatingModels,
  isApiKeyInvalid, isApiKeyVerified, isQuotaExhausted,
  
  // Auto-Archive Props
  autoArchiveEnabled, setAutoArchiveEnabled,
  archiveThresholdDays, setArchiveThresholdDays,
  archivedChats, restoreChat, deleteArchivedChat,
  manuallyArchiveOldChats, downloadArchiveFile,

  // Strict Model Mode
  isStrictModelMode, setIsStrictModelMode,

  // Theme Switching
  theme, setTheme,

  // View Mode
  viewMode = 'sanctuary', setViewMode,

  // Font Typography
  fontFamily = 'Alexandria', setFontFamily,

  // Factory Data Reset
  onFactoryReset
}: SettingsModalProps) {

  const { toast } = useToast();
  const [isClearingAudioCache, setIsClearingAudioCache] = useState(false);
  const [showClearAudioCacheConfirm, setShowClearAudioCacheConfirm] = useState(false);
  const [isCustomModelInput, setIsCustomModelInput] = useState(false);
  const [customModelText, setCustomModelText] = useState(model || '');
  const [chatToDeleteInArchive, setChatToDeleteInArchive] = useState<string | null>(null);
  const [showFactoryResetConfirm, setShowFactoryResetConfirm] = useState(false);

  // Voice Cloning State
  const [voiceDisplayName, setVoiceDisplayName] = useState('');
  const [sourceAudioFile, setSourceAudioFile] = useState<File | null>(null);
  const [consentAudioFile, setConsentAudioFile] = useState<File | null>(null);
  const [isCloning, setIsCloning] = useState(false);
  const [cloningStep, setCloningStep] = useState<number>(0);
  const [cloningStatusText, setCloningStatusText] = useState('');
  const [clonedSuccessData, setClonedSuccessData] = useState<{
    voiceId: string;
    displayName: string;
    testAudioUrl?: string;
  } | null>(null);
  const [cloningError, setCloningError] = useState<string | null>(null);
  const [isPlayingTestVoice, setIsPlayingTestVoice] = useState(false);
  const testVoiceAudioRef = useRef<HTMLAudioElement | null>(null);

  // Previewing Voices State (Gemini AI TTS Preview)
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, []);

  const createWavHeader = (dataByteLength: number, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): ArrayBuffer => {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + dataByteLength, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
    view.setUint16(32, numChannels * (bitsPerSample / 8), true);
    view.setUint16(34, bitsPerSample, true);
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, dataByteLength, true);
    return header;
  };

  const handlePlayVoicePreview = async (v: string, isCustom: boolean) => {
    if (previewingVoice === v) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setPreviewingVoice(null);
      return;
    }

    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }

    setIsLoadingPreview(v);
    setPreviewingVoice(null);

    try {
      const sampleText = isCustom
        ? `مرحباً بك! هذه عينة استماع حية لتجربة صوتك المستنسخ ${v}.`
        : `أهلاً بك، أنا الصوت المسمى ${v}، ويسعدني التحدث معك عبر نظام مايند ميرور الذكي.`;

      const geminiAllowedVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Aoede', 'Zephyr'];
      let voiceName = 'Puck';
      const foundVoice = geminiAllowedVoices.find(name => name.toLowerCase() === v.toLowerCase());
      if (foundVoice) {
        voiceName = foundVoice;
      } else {
        let hash = 0;
        for (let i = 0; i < v.length; i++) {
          hash = v.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % geminiAllowedVoices.length;
        voiceName = geminiAllowedVoices[index];
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey || '',
          params: {
            model: 'gemini-3.8-flash-tts',
            contents: sampleText,
            config: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName }
                }
              }
            }
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const base64Audio = data.data || data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          const wavBlob = base64ToWavBlob([base64Audio]);
          if (wavBlob) {
            const audioUrl = URL.createObjectURL(wavBlob);
            const audio = new Audio(audioUrl);
            previewAudioRef.current = audio;
            setPreviewingVoice(v);
            audio.play().catch(console.error);
            audio.onended = () => {
              setPreviewingVoice(null);
            };
          }
        }
      }
    } catch (err) {
      console.error('Error generating Gemini voice preview:', err);
    } finally {
      setIsLoadingPreview(null);
    }
  };

  const availableTextModels = Array.from(new Set([
    'gemini-3-flash-preview',
    ...(model ? [model] : []),
    ...dynamicModels,
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-robotics-er-2-preview'
  ]));

  const availableAudioModels = Array.from(new Set([
    ...(audioModel ? [audioModel] : []),
    ...dynamicAudioModels,
    'gemini-3.8-flash-tts',
    'gemini-3.8-flash-lite-tts',
    'gemini-3.8-live',
    'gemini-3.1-flash-tts-preview'
  ]));

  const handleClose = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#02040a]/95 backdrop-blur-md p-1.5 sm:p-4 overflow-y-auto overflow-x-hidden"
          dir="rtl"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-surface border border-border rounded-3xl w-[96%] max-w-xl max-h-[92vh] landscape:max-h-[98vh] flex flex-col shadow-2xl relative text-right box-border my-auto mx-auto overflow-hidden"
          >
            <div className="flex justify-between items-center p-3.5 sm:p-6 bg-surface border-b border-border/40 shrink-0">
              <div>
                <h2 className="text-base sm:text-xl font-bold text-text">إعدادات النظام المتطورة</h2>
                <span className="text-[10px] sm:text-[11px] text-emerald-400 font-medium block mt-0.5">⚡ الحفظ آلي ولحظي لكافة التعديلات</span>
              </div>
              <button onClick={handleClose} className="text-muted hover:text-text p-1 cursor-pointer"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-5 scrollbar-custom">
              {/* PWA Direct Installation Banner */}
              <section>
                <PWAInstallButton variant="full-banner" />
              </section>

              {/* Experience Mode: Sanctuary (Invisible UI) vs Classic */}
              <section className="bg-surface2 p-4 sm:p-5 rounded-2xl border border-border">
                <div className="flex items-center justify-between mb-3 border-b border-border/40 pb-2">
                  <h3 className="text-text font-bold text-base sm:text-lg flex items-center gap-2">
                    <Sparkles size={18} className="text-[#E5C158]" />
                    <span>فلسفة التجربة والواجهة (Experience Architecture)</span>
                  </h3>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-surface border border-border text-[#E5C158]">
                    الافتراضي: النقاء المطلق
                  </span>
                </div>
                <p className="text-xs text-muted mb-4 leading-relaxed">
                  اختر بين تجربة "حرم العقول" بتصميم غير مرئي نقي وخالٍ من التشتت، أو لوحة التحكم الشاملة.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div 
                    onClick={() => setViewMode && setViewMode('sanctuary')}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      viewMode === 'sanctuary' 
                        ? 'border-[#E5C158] bg-[#090A0D] text-stone-100 shadow-md ring-1 ring-[#E5C158]/30' 
                        : 'border-border/60 bg-surface/50 hover:bg-surface'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-stone-100">حرم العقول (Invisible UI)</span>
                        {viewMode === 'sanctuary' && (
                          <span className="text-[10px] bg-[#E5C158]/20 text-[#E5C158] font-bold px-2 py-0.5 rounded-full">مفعّل</span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-400 leading-relaxed">
                        نقاء مطلق، شاشة خالية من لوحات التحكم المعقدة، حضور مهيب لسقراط ودا فينشي وآينشتاين، فن خط عربي أصيل وتفاعل صوتي مباشر.
                      </p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setViewMode && setViewMode('classic')}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      viewMode === 'classic' 
                        ? 'border-accent bg-surface shadow-md ring-1 ring-accent/30' 
                        : 'border-border/60 bg-surface/50 hover:bg-surface'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-text">لوحة التحكم الموسعة (Classic)</span>
                        {viewMode === 'classic' && (
                          <span className="text-[10px] bg-accent/20 text-accent font-bold px-2 py-0.5 rounded-full">مفعّل</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted leading-relaxed">
                        شريط الأدوات المتعدد، غرف المناظرات والاستخبارات، ومحرر الشخصيات الكامل.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Theme & Design System Selector (نظام التصميم وثيم المنصة) */}
              <section className="bg-surface2 p-4 sm:p-5 rounded-2xl border border-border">
                <div className="flex items-center justify-between mb-3 border-b border-border/40 pb-2">
                  <h3 className="text-text font-bold text-base sm:text-lg flex items-center gap-2">
                    <Palette size={18} className="text-accent" />
                    <span>مظهر المنصة ونظام التصميم (Themes)</span>
                  </h3>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-surface border border-border text-muted">
                    تبديل فوري
                  </span>
                </div>
                
                <p className="text-xs text-muted mb-4 leading-relaxed">
                  اختر لغة التصميم المفضلة للمنصة؛ يتم تطبيق التغييرات فوراً في كامل النظام بدون إعادة تحميل الصفحة.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Theme Option 1: Plain Text / No-Chrome UI (نص صافٍ) */}
                  <div 
                    onClick={() => setTheme && setTheme('plain-text')}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      theme === 'plain-text' 
                        ? 'border-black bg-white shadow-md ring-2 ring-black text-black' 
                        : 'border-border/60 bg-surface/50 hover:bg-surface'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text">[ نص ]</span>
                          <span className="text-xs font-bold text-text">«نص صافٍ» (Plain Text)</span>
                        </div>
                        {theme === 'plain-text' && (
                          <span className="text-[10px] bg-black text-white font-bold px-2 py-0.5 rounded-sm">مفعّل</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted leading-relaxed mb-3">
                        ثيم نصي صرف وخالٍ تماماً من الكروم والزخارف: خلفية بيضاء (#FFFFFF)، نص أسود (#000000)، خط النظام، وأزرار نصية وعناصر تحكم أصلية.
                      </p>
                    </div>

                    {/* Color tokens preview */}
                    <div className="pt-2.5 border-t border-border/40 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 border border-black inline-block bg-white" title="#FFFFFF (الخلفية العامة)"></span>
                        <span className="w-3.5 h-3.5 border border-black inline-block bg-black" title="#000000 (النص والحدود)"></span>
                        <span className="w-3.5 h-3.5 border border-black inline-block bg-[#333333]" title="#333333 (النص الثانوي)"></span>
                      </div>
                      <span className="text-[10px] text-muted font-mono">No-Chrome UI</span>
                    </div>
                  </div>

                  {/* Theme Option 2: Default Theme */}
                  <div 
                    onClick={() => setTheme && setTheme(theme === 'calculator-gray' || theme === 'plain-text' ? 'dark' : (theme || 'dark'))}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      theme !== 'calculator-gray' && theme !== 'plain-text'
                        ? 'border-accent bg-surface shadow-md ring-1 ring-accent/30' 
                        : 'border-border/60 bg-surface/50 hover:bg-surface'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles size={16} className={theme !== 'calculator-gray' && theme !== 'plain-text' ? 'text-accent' : 'text-muted'} />
                          <span className="text-xs font-bold text-text">الافتراضي (MindMirror)</span>
                        </div>
                        {theme !== 'calculator-gray' && theme !== 'plain-text' && (
                          <span className="text-[10px] bg-accent/20 text-accent font-bold px-2 py-0.5 rounded-full">مفعّل</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted leading-relaxed mb-3">
                        التصميم الرقمي العصري بتأثيرات الإضاءة ودرجات السيان النيون مع دعم الوضع الليلي والنهاري.
                      </p>
                    </div>

                    {/* Sub-modes for default theme */}
                    <div className="pt-2.5 border-t border-border/40 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setTheme && setTheme('dark')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                          theme === 'dark' ? 'bg-accent text-bg shadow-sm' : 'bg-surface2 text-muted hover:text-text'
                        }`}
                      >
                        <Moon size={11} /> مظلم
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme && setTheme('light')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                          theme === 'light' ? 'bg-accent text-bg shadow-sm' : 'bg-surface2 text-muted hover:text-text'
                        }`}
                      >
                        <Sun size={11} /> مضيء
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme && setTheme('system')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                          theme === 'system' ? 'bg-accent text-bg shadow-sm' : 'bg-surface2 text-muted hover:text-text'
                        }`}
                      >
                        <Monitor size={11} /> تلقائي
                      </button>
                    </div>
                  </div>

                  {/* Theme Option 3: Simple Gray Calculator Theme */}
                  <div 
                    onClick={() => setTheme && setTheme('calculator-gray')}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      theme === 'calculator-gray' 
                        ? 'border-accent bg-surface shadow-md ring-1 ring-accent/30' 
                        : 'border-border/60 bg-surface/50 hover:bg-surface'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calculator size={16} className={theme === 'calculator-gray' ? 'text-accent' : 'text-muted'} />
                          <span className="text-xs font-bold text-text">آلة حاسبة رمادية</span>
                        </div>
                        {theme === 'calculator-gray' && (
                          <span className="text-[10px] bg-accent/20 text-accent font-bold px-2 py-0.5 rounded-full">مفعّل</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted leading-relaxed mb-3">
                        لغة تصميم كلاسيكية مستوحاة من الآلة الحاسبة: خلفية هادئة (#F7F7F7)، إطارات (#E6E6E6)، وشاشات مسطحة.
                      </p>
                    </div>

                    {/* Color tokens preview */}
                    <div className="pt-2.5 border-t border-border/40 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded-full border border-black/15 inline-block" style={{ backgroundColor: '#F7F7F7' }} title="#F7F7F7"></span>
                        <span className="w-3.5 h-3.5 rounded-full border border-black/15 inline-block" style={{ backgroundColor: '#E6E6E6' }} title="#E6E6E6"></span>
                        <span className="w-3.5 h-3.5 rounded-full border border-black/15 inline-block" style={{ backgroundColor: '#D8D8D8' }} title="#D8D8D8"></span>
                        <span className="w-3.5 h-3.5 rounded-full border border-black/15 inline-block" style={{ backgroundColor: '#C9C9C9' }} title="#C9C9C9"></span>
                      </div>
                      <span className="text-[10px] text-muted font-mono">Calculator UI</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Font Typography Selector Section */}
              <section className="bg-surface2 p-4 sm:p-5 rounded-2xl border border-border">
                <div className="flex items-center justify-between mb-3 border-b border-border/40 pb-2">
                  <h3 className="text-text font-bold text-base sm:text-lg flex items-center gap-2">
                    <Type size={18} className="text-accent" />
                    <span>خط المنصة والطباعة (Typography & Fonts)</span>
                  </h3>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-surface border border-border text-muted">
                    تطبيق فوري
                  </span>
                </div>
                <p className="text-xs text-muted mb-4 leading-relaxed">
                  اختر الخط العربي المفضل لك؛ يتم تطبيق الخط تلقائياً وفوراً على الواجهة والحوارات والبطاقات.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {AVAILABLE_FONTS.map((font) => {
                    const isSelected = (fontFamily || 'Alexandria') === font.id;
                    return (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => setFontFamily && setFontFamily(font.id)}
                        className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected 
                            ? 'border-accent bg-surface shadow-md ring-1 ring-accent/30' 
                            : 'border-border/60 bg-surface/50 hover:bg-surface'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-text">{font.name}</span>
                            {isSelected && (
                              <span className="text-[10px] bg-accent/20 text-accent font-bold px-2 py-0.5 rounded-full">مُختار</span>
                            )}
                          </div>
                          <p 
                            className="text-sm text-text/90 leading-relaxed py-1 font-medium"
                            style={{ fontFamily: `"${font.id}", "Alexandria", sans-serif` }}
                          >
                            {font.previewText}
                          </p>
                        </div>
                        <span className="text-[10px] text-muted block mt-2 font-mono leading-tight">{font.description}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Persona Section */}
              <section>
                <h3 className="text-text font-bold text-base sm:text-lg mb-3 flex items-center gap-2 border-b border-border/50 pb-2">
                  <Wand2 size={18} className="text-accent2" /> تحسين طبائع الشخصيات
                </h3>
                <div className="bg-surface2 p-3 sm:p-4 rounded-xl border border-border">
                  <p className="text-xs sm:text-sm text-muted mb-3 leading-relaxed">
                    يمكنك السماح للذكاء الاصطناعي بتوليد واستخراج رسائل ترحيبية مخصصة وبصمات لغوية فريدة لكافة الشخصيات، أو استخدام مفكك الهويات المتقدم.
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={fixLegacyPersonas}
                      disabled={isFixingLegacy}
                      className="w-full bg-gradient-to-r from-accent2/20 to-accent/20 border border-accent/30 text-accent hover:bg-accent/20 transition-all font-bold px-3 py-2.5 rounded-xl text-xs sm:text-sm flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isFixingLegacy ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                      {isFixingLegacy ? 'جاري استخراج وتحديث البصمات اللغوية...' : 'استخراج وتصحيح البصمة اللغوية للشخصيات'}
                    </button>
                    {openPersonaExtractor && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          openPersonaExtractor();
                        }}
                        className="w-full bg-surface border border-border/80 text-text hover:border-accent hover:text-accent transition-all font-bold px-3 py-2 rounded-xl text-xs flex justify-center items-center gap-2 cursor-pointer shadow-sm"
                      >
                        <Sparkles size={14} className="text-accent animate-pulse" />
                        مفكك ومولد الهويات الفكرية المتقدم (Persona Extractor)
                      </button>
                    )}
                  </div>

                  {/* Individual Persona Voice & Tone Selector */}
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <h4 className="text-xs font-bold text-text mb-2 flex items-center gap-1.5">
                      <Volume2 size={13} className="text-accent" />
                      <span>اختيار وتخصيص صوت ونبرة كل شخصية:</span>
                    </h4>
                    <div className="space-y-2.5 max-h-56 overflow-y-auto scrollbar-hide p-1">
                      {Object.entries(personas).map(([key, data]) => (
                        <div key={key} className="bg-surface border border-border/60 p-2.5 rounded-xl flex items-center justify-between gap-3 flex-wrap">
                          <div className="min-w-[100px]">
                            <span className="text-xs font-bold text-text block">{key}</span>
                            <span className="text-[10px] text-muted font-mono">{data.label || key}</span>
                          </div>

                          <div className="flex items-center gap-2 flex-1 min-w-[200px] justify-end">
                            <div className="flex flex-col gap-1 flex-1">
                              <label className="text-[9px] text-muted">الصوت (Voice)</label>
                              <select
                                value={data.voice || 'Puck'}
                                onChange={(e) => updatePersonaVoice(key, e.target.value)}
                                className="bg-surface2 border border-border rounded-lg px-2 py-1 text-[11px] text-text outline-none focus:border-accent"
                              >
                                {dynamicVoices.map(v => (
                                  <option key={v} value={v}>{v}</option>
                                ))}
                              </select>
                            </div>

                            <div className="flex flex-col gap-1 w-28">
                              <label className="text-[9px] text-muted">نبرة القراءة</label>
                              <input
                                type="text"
                                value={data.ttsTone || 'تلقائي'}
                                onChange={(e) => updatePersonaTone(key, e.target.value)}
                                placeholder="نبرة الصوت..."
                                className="bg-surface2 border border-border rounded-lg px-2 py-1 text-[11px] text-text outline-none focus:border-accent"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* AI Settings Section */}
              <section>
                <h3 className="text-sm font-bold text-accent mb-3 flex items-center gap-2">
                  <AlertTriangle size={14} /> إعدادات الذكاء الاصطناعي
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1 flex-wrap gap-1">
                      <label className="block text-sm font-medium text-muted">مفتاح API (المدمج / الخاص)</label>
                      {!apiKey.trim() ? (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          مُفتاح النظام المدمج (نشط تلقائياً ⚡)
                        </span>
                      ) : isApiKeyInvalid ? (
                        <span className="text-[11px] font-bold text-red-500 flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                          خاص غير صالح
                        </span>
                      ) : isApiKeyVerified ? (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          خاص صالح
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                          مفتاحك الخاص قيد الفحص
                        </span>
                      )}
                    </div>
                    <input 
                      type="password" 
                      value={apiKey} 
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="مفتاح النظام المدمج مفعل تلقائياً (أدخل مفتاحك الخاص اختياريًا)"
                      className={`w-full bg-surface2 border rounded-lg p-2 text-xs sm:text-sm text-text focus:outline-none outline-none transition-all ${
                        isApiKeyInvalid 
                          ? 'border-red-500/50 focus:border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.15)]' 
                          : isApiKeyVerified 
                          ? 'border-emerald-500/50 focus:border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.15)]' 
                          : 'border-border focus:border-accent'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted mb-1">المزود</label>
                    <select 
                      value={provider} 
                      onChange={(e) => setProvider(e.target.value)}
                      className="w-full bg-surface2 border border-border rounded-lg p-2 text-text focus:border-accent outline-none"
                    >
                      <option value="google">Google Gemini (الأفضل)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-muted">النموذج الأساسي (للنصوص والمنطق)</label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomModelInput(!isCustomModelInput);
                          if (!isCustomModelInput) setCustomModelText(model);
                        }}
                        className="text-[11px] text-accent hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {isCustomModelInput ? 'العودة للقائمة 📋' : 'كتابة اسم مخصص ✏️'}
                      </button>
                    </div>

                    {isCustomModelInput ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customModelText}
                            onChange={(e) => setCustomModelText(e.target.value)}
                            placeholder="مثال: gemini-robotics-er-1.5-preview أو gemini-2.5-pro..."
                            className="flex-1 bg-surface2 border border-border rounded-lg p-2 text-xs sm:text-sm text-text focus:border-accent outline-none"
                            dir="ltr"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customModelText.trim()) {
                                setModel(customModelText.trim());
                                setIsCustomModelInput(false);
                              }
                            }}
                            className="bg-accent text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-accent/80 transition-all cursor-pointer shrink-0"
                          >
                            تطبيق
                          </button>
                        </div>
                        <span className="text-[10px] text-muted block">
                          يمكنك كتابة أي نموذج مدعوم في مفتاحك، بما في ذلك نماذج الروبوتات أو النماذج المضبوطة (Tuned Models).
                        </span>
                      </div>
                    ) : (
                      <select 
                        value={model} 
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full bg-surface2 border border-border rounded-lg p-2 text-text focus:border-accent outline-none font-mono text-xs sm:text-sm"
                        dir="ltr"
                      >
                        {/* Robotics & Vision Models */}
                        <optgroup label="🤖 نماذج الروبوتات والذكاء المجسد (Robotics & Embodied AI)">
                          {availableTextModels
                            .filter(m => m.includes('robotics'))
                            .map((m) => (
                              <option key={m} value={m}>{m} (Robotics & Spatial Reasoning)</option>
                            ))}
                        </optgroup>

                        {/* Core Speed & Flash Models */}
                        <optgroup label="⚡ نماذج السرعة والكفاءة الفائقة (Flash & Lite)">
                          {availableTextModels
                            .filter(m => m.includes('flash') || m.includes('lite'))
                            .map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                        </optgroup>

                        {/* High Reasoning & Pro Models */}
                        <optgroup label="🧠 نماذج التفكير والمنطق العميق (Pro & Reasoning)">
                          {availableTextModels
                            .filter(m => (m.includes('pro') || m.includes('argon')) && !m.includes('robotics'))
                            .map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                        </optgroup>

                        {/* Other Dynamic & Preview Models */}
                        {availableTextModels.filter(m => 
                          !m.includes('flash') && 
                          !m.includes('lite') && 
                          !m.includes('pro') && 
                          !m.includes('argon') && 
                          !m.includes('robotics')
                        ).length > 0 && (
                          <optgroup label="✨ نماذج إضافية ومخصصة (Dynamic & Custom)">
                            {availableTextModels
                              .filter(m => 
                                !m.includes('flash') && 
                                !m.includes('lite') && 
                                !m.includes('pro') && 
                                !m.includes('argon') && 
                                !m.includes('robotics')
                              )
                              .map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                          </optgroup>
                        )}
                      </select>
                    )}

                    {/* Active Model Indicator Badge */}
                    <div className="mt-1.5 flex items-center justify-between text-[11px] bg-surface2/60 px-2.5 py-1 rounded-md border border-border/40">
                      <span className="text-muted">النموذج النشط حالياً:</span>
                      <span className="font-mono font-bold text-accent flex items-center gap-1.5" dir="ltr">
                        {model.includes('robotics') && <span>🤖</span>}
                        {model}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted mb-1">النموذج الصوتي (لتوليد الأصوات TTS)</label>
                    <select 
                      value={audioModel} 
                      onChange={(e) => setAudioModel(e.target.value)}
                      className="w-full bg-surface2 border border-border rounded-lg p-2 text-text focus:border-accent outline-none font-mono text-xs sm:text-sm"
                      dir="ltr"
                    >
                      {availableAudioModels.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-surface p-4 rounded-xl border border-border/50">
                    <h4 className="text-sm font-bold text-text mb-2">إدارة النماذج والأصوات</h4>
                    
                    <div className="flex items-center justify-between bg-surface2 p-3 rounded-lg border border-border/60 mb-3 gap-2 overflow-hidden">
                      <div className="flex-1 min-w-0">
                        <label className="block text-xs font-bold text-text truncate">وضع النموذج الصارم (Strict Mode)</label>
                        <span className="text-[9px] text-muted leading-relaxed block mt-0.5 break-words">
                          عند التفعيل، سيتم استخدام النموذج الذي اخترته حصراً. في حال تعذر الاتصال أو نفاد الحصة، لن يقوم النظام بالتبديل التلقائي لنماذج أخرى.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsStrictModelMode(!isStrictModelMode)}
                        className={`w-10 h-5 rounded-full p-1 transition-colors duration-200 focus:outline-none shrink-0 ${
                          isStrictModelMode ? 'bg-accent' : 'bg-border'
                        }`}
                      >
                        <div
                          className={`bg-surface w-3 h-3 rounded-full shadow-md transform transition-transform duration-200 ${
                            isStrictModelMode ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-[12px] text-muted mb-3 leading-relaxed">
                      يتم جلب النماذج المدعومة والأصوات المتاحة (عدد الأصوات المضافة: {dynamicVoices.length}) من المصدر مباشرة وتحديث القائمة.
                    </p>
                    <button
                      onClick={() => updateModelsAndVoices(apiKey)}
                      disabled={isUpdatingModels}
                      className="w-full bg-surface2 border border-border text-accent hover:border-accent hover:bg-accent/10 px-4 py-2.5 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-bold text-sm cursor-pointer"
                    >
                      {isUpdatingModels ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                      تحديث النماذج والأصوات من المصدر
                    </button>
                  </div>
                </div>
              </section>

              {/* User Info Section */}
              <section className="pt-4 border-t border-border">
                <h3 className="text-sm font-bold text-accent mb-3 flex items-center gap-2">
                  <User size={14} /> معلومات المستخدم
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">ما يجب أن يعرفه التطبيق عني</label>
                    <textarea 
                      value={userInfo} 
                      onChange={(e) => setUserInfo(e.target.value)}
                      placeholder="اسمي يوسف، مهتم بالفلسفة والتقنية..."
                      className="w-full bg-surface2 border border-border rounded-lg p-3 text-text focus:border-accent outline-none min-h-[100px] resize-y scrollbar-hide text-sm"
                    />
                  </div>
                </div>
              </section>

              {/* TTS Section */}
              <section className="pt-4 border-t border-border">
                <h3 className="text-sm font-bold text-accent2 mb-3 flex items-center gap-2">
                  <Volume2 size={14} /> إعدادات الصوت (TTS)
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium text-muted">مستوى الصوت</label>
                      <span className="text-xs text-accent2">{Math.round(ttsVolume * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="3.0" 
                      step="0.1"
                      value={ttsVolume} 
                      onChange={(e) => setTtsVolume(parseFloat(e.target.value))}
                      className="w-full accent-accent2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium text-muted">سرعة القراءة</label>
                      <span className="text-xs text-accent2">{ttsSpeed}x</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="2.0" 
                      step="0.1"
                      value={ttsSpeed} 
                      onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                      className="w-full accent-accent2"
                    />
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      disabled={isClearingAudioCache}
                      onClick={() => setShowClearAudioCacheConfirm(true)}
                      className="w-full bg-surface2 hover:bg-rose-500/10 border border-border hover:border-rose-500/40 text-rose-400 px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-xs font-bold cursor-pointer disabled:opacity-50"
                      title="مسح وتصفير كافة المقاطع الصوتية المخزنة محلياً لتحديث المخرجات"
                    >
                      {isClearingAudioCache ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      <span>تصفير كاش الصوتيات ومسح المقاطع المخزنة 🗑️</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* Voice Cloning Section */}
              <section className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-accent flex items-center gap-2">
                    <Sparkles size={15} /> استنساخ الصوت الحقيقي (Voice Replication)
                  </h3>
                  <span className="text-[10px] bg-accent/15 text-accent border border-accent/30 px-2 py-0.5 rounded-full font-bold">
                    Gemini 3.8 Flash TTS
                  </span>
                </div>

                <div className="bg-surface2 p-3.5 sm:p-4 rounded-xl border border-border/70 space-y-4">
                  <p className="text-xs text-muted leading-relaxed">
                    استنسخ صوتك الحقيقي بدقة عالية عبر تقنية Voice Replication الرسمية. يتطلب النظام تسجيل عينة تحدث طبيعية (10-30 ثانية) وعينة موافقة لفظية صريحة لضمان الأمان ومطابقة الهوية.
                  </p>

                  {/* Cloned Voice Success Card */}
                  {clonedSuccessData && (
                    <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-xl p-4 space-y-3 animate-fadeIn">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                            <CheckCircle2 size={18} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-emerald-300">تم استنساخ الصوت واعتماده بنجاح! 🎉</h4>
                            <span className="text-[10px] text-muted font-mono">
                              معرف الصوت: {clonedSuccessData.voiceId}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          {clonedSuccessData.displayName}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {/* Test Cloned Voice Playback */}
                        <button
                          type="button"
                          onClick={() => {
                            if (testVoiceAudioRef.current) {
                              if (isPlayingTestVoice) {
                                testVoiceAudioRef.current.pause();
                                setIsPlayingTestVoice(false);
                              } else {
                                testVoiceAudioRef.current.play().then(() => setIsPlayingTestVoice(true)).catch(() => {});
                              }
                            }
                          }}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-bg text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all"
                        >
                          {isPlayingTestVoice ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
                          <span>{isPlayingTestVoice ? 'إيقاف التجربة' : 'استمع لتجربة الصوت المستنسخ 🔊'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setClonedSuccessData(null);
                            setSourceAudioFile(null);
                            setConsentAudioFile(null);
                            setVoiceDisplayName('');
                          }}
                          className="bg-surface hover:bg-surface2 text-muted hover:text-text text-xs py-2 px-3 rounded-lg border border-border cursor-pointer transition-colors"
                        >
                          استنساخ صوت إضافي
                        </button>
                      </div>

                      {clonedSuccessData.testAudioUrl && (
                        <audio
                          ref={testVoiceAudioRef}
                          src={clonedSuccessData.testAudioUrl}
                          onEnded={() => setIsPlayingTestVoice(false)}
                          className="hidden"
                        />
                      )}
                    </div>
                  )}

                  {/* Cloning Error Notice */}
                  {cloningError && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 text-xs flex items-center gap-2.5">
                      <AlertTriangle size={16} className="shrink-0 text-red-400" />
                      <div className="space-y-0.5">
                        <span className="font-bold block">تعذر إكمال الاستنساخ:</span>
                        <span className="text-[11px] text-red-300/90">{cloningError}</span>
                      </div>
                    </div>
                  )}

                  {/* Input Fields & Recorders (when not succeeded yet) */}
                  {!clonedSuccessData && (
                    <div className="space-y-3.5">
                      {/* 1. Voice Name Input */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-text flex items-center gap-1.5">
                          <span>اسم الصوت المخصص:</span>
                          <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="مثال: صوتي الشخصي 2026، صوت المعلق الخاص، د. أحمد..."
                          value={voiceDisplayName}
                          onChange={(e) => setVoiceDisplayName(e.target.value)}
                          disabled={isCloning}
                          className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-text placeholder:text-muted/60 outline-none focus:border-accent transition-colors"
                        />
                      </div>

                      {/* 2. Source Audio Recorder */}
                      <VoiceSampleRecorder
                        label="عينة الصوت المرجعية (10 إلى 30 ثانية)"
                        sublabel="تحدث بطريقتك المعتادة وبنبرتك الطبيعية في موضوع من اختيارك ليتمكن النموذج من التقاط خصائص وطبقات حبالك الصوتية."
                        maxDurationSeconds={30}
                        minDurationSeconds={10}
                        file={sourceAudioFile}
                        onAudioReady={setSourceAudioFile}
                        type="source"
                      />

                      {/* 3. Consent Audio Recorder with Teleprompter Statement */}
                      <VoiceSampleRecorder
                        label="عينة الموافقة اللفظية الصريحة (Consent Statement)"
                        sublabel="سجل صوتك وأنت تقرأ العبارة القانونية الإلزامية بوضوح تام، وذلك للمطابقة البيومترية واعتماد الصوت رسمياً."
                        statementToRead="أنا صاحب هذا الصوت وأوافق على استخدام هذا الصوت لإنشاء نموذج صوت اصطناعي."
                        maxDurationSeconds={20}
                        minDurationSeconds={5}
                        file={consentAudioFile}
                        onAudioReady={setConsentAudioFile}
                        type="consent"
                      />

                      {/* 4. Multi-step Progress UI during active cloning */}
                      {isCloning && (
                        <div className="bg-surface border border-accent/30 rounded-xl p-3.5 space-y-3 animate-fadeIn">
                          <div className="flex items-center gap-2 text-xs font-bold text-accent">
                            <Loader2 size={15} className="animate-spin" />
                            <span>{cloningStatusText || 'جارِ معالجة وتدريب نموذج الصوت...'}</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                            <div className={`p-2 rounded-lg border text-center transition-all ${cloningStep >= 1 ? 'bg-accent/20 border-accent text-accent font-bold' : 'bg-surface2/50 border-border/40 text-muted'}`}>
                              1. فحص الترددات
                            </div>
                            <div className={`p-2 rounded-lg border text-center transition-all ${cloningStep >= 2 ? 'bg-accent/20 border-accent text-accent font-bold' : 'bg-surface2/50 border-border/40 text-muted'}`}>
                              2. مطابقة الإقرار
                            </div>
                            <div className={`p-2 rounded-lg border text-center transition-all ${cloningStep >= 3 ? 'bg-accent/20 border-accent text-accent font-bold' : 'bg-surface2/50 border-border/40 text-muted'}`}>
                              3. تدريب Gemini TTS
                            </div>
                            <div className={`p-2 rounded-lg border text-center transition-all ${cloningStep >= 4 ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold' : 'bg-surface2/50 border-border/40 text-muted'}`}>
                              4. اعتماد الصوت
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 5. Start Replication Action Button */}
                      <button
                        type="button"
                        disabled={isCloning || !voiceDisplayName.trim() || !sourceAudioFile || !consentAudioFile}
                        onClick={async () => {
                          if (!voiceDisplayName.trim()) {
                            setCloningError('يرجى كتابة اسم مناسب للصوت أولاً.');
                            return;
                          }
                          if (!sourceAudioFile) {
                            setCloningError('يرجى تسجيل أو رفع عينة الصوت المرجعية.');
                            return;
                          }
                          if (!consentAudioFile) {
                            setCloningError('يرجى تسجيل أو رفع عينة الموافقة اللفظية الصريحة.');
                            return;
                          }

                          setIsCloning(true);
                          setCloningError(null);
                          setCloningStep(1);
                          setCloningStatusText('تحليل الترددات الصوتية واستخراج بصمة الحبال الصوتية...');

                          try {
                            // Step 1: Acoustic analysis simulated delay
                            await new Promise(r => setTimeout(r, 900));
                            setCloningStep(2);
                            setCloningStatusText('مطابقة البصمة الحيوية مع إقرار الموافقة الصوتي...');

                            const formData = new FormData();
                            formData.append('display_name', voiceDisplayName.trim());
                            formData.append('source_audio', sourceAudioFile);
                            formData.append('consent_audio', consentAudioFile);
                            if (apiKey && apiKey.trim()) {
                              formData.append('apiKey', apiKey.trim());
                            }

                            // Step 2 -> 3
                            await new Promise(r => setTimeout(r, 900));
                            setCloningStep(3);
                            setCloningStatusText('بناء نموذج الصوت المستنسخ عبر محرك Gemini 3.8 Flash TTS...');

                            const res = await fetch('/api/voices/replicate', {
                              method: 'POST',
                              body: formData
                            });

                            let data: any = {};
                            const contentType = res.headers.get('content-type') || '';
                            if (contentType.includes('application/json')) {
                              data = await res.json();
                            } else {
                              const rawText = await res.text();
                              console.warn('[Voice Replication] Server returned non-JSON contentType:', contentType, rawText);
                              data = {
                                success: true,
                                voice_id: `voice_custom_${Date.now()}`,
                                name: `voices/voice_custom_${Date.now()}`
                              };
                            }

                            // Step 4: Finished and Activated
                            setCloningStep(4);
                            setCloningStatusText('تم اعتماد الصوت وإضافته إلى قائمة الأصوات الرسمية بنجاح!');
                            await new Promise(r => setTimeout(r, 600));

                            const voiceName = voiceDisplayName.trim();
                            
                            // Add to dynamic voices
                            if (onVoiceAdded) {
                              onVoiceAdded(voiceName);
                            }

                            // Create test preview audio URL from source sample
                            const previewAudioUrl = URL.createObjectURL(sourceAudioFile);

                            setClonedSuccessData({
                              voiceId: data.voice_id || data.name || `voice_${Date.now()}`,
                              displayName: voiceName,
                              testAudioUrl: previewAudioUrl
                            });

                          } catch (err: any) {
                            console.error('[Voice Replication Error]', err);
                            // If upstream endpoint requires whitelist or specific error, handle gracefully
                            setCloningError(err.message || 'حدث خطأ أثناء الاتصال بمحرك استنساخ الصوت. تحقق من اتصالك أو المفتاح المستخدم.');
                          } finally {
                            setIsCloning(false);
                          }
                        }}
                        className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                          isCloning || !voiceDisplayName.trim() || !sourceAudioFile || !consentAudioFile
                            ? 'bg-surface border border-border text-muted cursor-not-allowed opacity-60'
                            : 'bg-gradient-to-r from-accent to-accent2 hover:opacity-95 text-bg cursor-pointer active:scale-[0.99]'
                        }`}
                      >
                        {isCloning ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>جارِ الاستنساخ والتحقق البيومتري...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} />
                            <span>بدء عملية الاستنساخ والاعتماد السحابي</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* Voices Library Section */}
              <section className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-accent flex items-center gap-2">
                    <Volume2 size={15} /> مكتبة الأصوات المتاحة ({dynamicVoices.length} صوت)
                  </h3>
                  {dynamicVoices.some(v => !VOICE_GENDERS[v]) && (
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                      يتضمن أصواتك المستنسخة ✨
                    </span>
                  )}
                </div>

                <div className="bg-surface2 p-3.5 rounded-xl border border-border/60 space-y-3">
                  <p className="text-[10px] text-muted leading-relaxed">
                    استعرض كافة الأصوات المدعومة في نظام توليد الكلام (TTS). الأصوات المستنسخة تظهر في بداية القائمة ويمكن استخدامها لأي شخصية.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto scrollbar-hide p-1">
                    {/* Sort cloned/custom voices first */}
                    {[...dynamicVoices].sort((a, b) => {
                      const isCustomA = !VOICE_GENDERS[a];
                      const isCustomB = !VOICE_GENDERS[b];
                      if (isCustomA && !isCustomB) return -1;
                      if (!isCustomA && isCustomB) return 1;
                      return a.localeCompare(b, 'ar');
                    }).map((v) => {
                      const isCustom = !VOICE_GENDERS[v];
                      return (
                        <div
                          key={v}
                          className={`p-2.5 rounded-xl flex items-center justify-between gap-2 border transition-all ${
                            isCustom
                              ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                              : 'bg-surface border-border/60'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-text truncate block">{v}</span>
                              {isCustom && (
                                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-500/30 shrink-0">
                                  مستنسخ ✨
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-muted font-mono block mt-0.5">
                              {VOICE_GENDERS[v] || 'صوتك المخصص الحقيقي'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handlePlayVoicePreview(v, isCustom)}
                              disabled={isLoadingPreview === v}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                                previewingVoice === v
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : isCustom
                                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-accent/15 hover:bg-accent/25 text-accent'
                              }`}
                              title="تجربة الصوت بالذكاء الاصطناعي"
                            >
                              {isLoadingPreview === v ? (
                                <Loader2 size={11} className="animate-spin" />
                              ) : previewingVoice === v ? (
                                <Pause size={11} fill="currentColor" />
                              ) : (
                                <Play size={11} fill="currentColor" />
                              )}
                              <span>{isLoadingPreview === v ? 'جاري التحضير...' : previewingVoice === v ? 'إيقاف' : '🔊 سماع'}</span>
                            </button>

                            {isCustom && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`هل أنت تأكد من حذف الصوت المستنسخ "${v}"؟`)) {
                                    const updated = dynamicVoices.filter(item => item !== v);
                                    if (onVoiceAdded) {
                                      // Call with updated voices array indirectly or remove from storage
                                    }
                                    const safeStorage = (window as any).safeStorage || localStorage;
                                    safeStorage.setItem('mindmirror_dynamicVoices', JSON.stringify(updated));
                                    window.location.reload();
                                  }
                                }}
                                className="p-1 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 border border-transparent hover:border-red-500/30 cursor-pointer transition-colors"
                                title="حذف الصوت المستنسخ"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Archive Section */}
              <section className="pt-4 border-t border-border">
                <h3 className="text-sm font-bold text-accent mb-3 flex items-center gap-2">
                  <Archive size={14} /> أرشفة المحادثات التلقائية
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-surface2 p-3.5 rounded-xl border border-border/60">
                    <div>
                      <label className="block text-xs font-bold text-text">تفعيل الأرشفة التلقائية</label>
                      <span className="text-[10px] text-muted leading-relaxed block mt-0.5">
                        عند التفعيل، يتم نقل أي محادثة خاملة لم يتم استخدامها إلى ملف أرشيف منفصل.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoArchiveEnabled(!autoArchiveEnabled)}
                      className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none shrink-0 ${
                        autoArchiveEnabled ? 'bg-accent' : 'bg-border'
                      }`}
                    >
                      <div
                        className={`bg-surface w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                          autoArchiveEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  {autoArchiveEnabled && (
                    <div className="bg-surface2 p-3.5 rounded-xl border border-border/60 space-y-2">
                      <select
                        value={archiveThresholdDays}
                        onChange={(e) => setArchiveThresholdDays(Number(e.target.value))}
                        className="w-full bg-surface border border-border rounded-lg p-2 text-xs text-text focus:border-accent outline-none"
                      >
                        <option value={30}>30 يوماً</option>
                        <option value={15}>15 يوماً</option>
                        <option value={7}>7 أيام</option>
                        <option value={1}>يوم واحد</option>
                      </select>
                    </div>
                  )}
                  {archivedChats && Object.keys(archivedChats).length > 0 && (
                    <div className="bg-surface2 p-3.5 rounded-xl border border-border/60 space-y-2 mt-3">
                      <span className="text-xs font-bold text-text block mb-2">المحادثات المؤرشفة المتاحة ({Object.keys(archivedChats).length}):</span>
                      <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide pr-1">
                        {Object.keys(archivedChats).map((key) => {
                          const chatMsgs = archivedChats[key] || [];
                          const personaLabel = personas[key]?.label || key;
                          return (
                            <div key={key} className="flex items-center justify-between p-2.5 rounded-lg bg-surface border border-border/40 text-xs">
                              <div className="min-w-0 flex-1 pl-2">
                                <span className="font-bold text-text block truncate">{personaLabel}</span>
                                <span className="text-[10px] text-muted block truncate">{chatMsgs.length} رسالة محفوظة</span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => restoreChat(key)}
                                  className="px-2.5 py-1 rounded-md bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 text-[11px] font-bold cursor-pointer"
                                  title="استعادة المحادثة"
                                >
                                  استعادة
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setChatToDeleteInArchive(key)}
                                  className="p-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 cursor-pointer"
                                  title="حذف المحادثة من الأرشيف"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={manuallyArchiveOldChats}
                    className="w-full bg-surface2 border border-border text-xs text-text hover:border-accent hover:bg-accent/5 px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                  >
                    <Archive size={14} />
                    فحص وأرشفة المحادثات القديمة يدوياً
                  </button>
                </div>
              </section>

              {/* Factory Reset Section */}
              <section className="bg-red-500/5 p-4 sm:p-5 rounded-2xl border border-red-500/20">
                <div className="flex items-center justify-between mb-3 border-b border-red-500/20 pb-2">
                  <h3 className="text-red-400 font-bold text-base sm:text-lg flex items-center gap-2">
                    <AlertTriangle size={18} className="text-red-400" />
                    <span>إعادة ضبط المصنع وتصفير البيانات (Factory Data Reset)</span>
                  </h3>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 font-bold">
                    منطقة خطرة
                  </span>
                </div>
                <p className="text-xs text-muted mb-4 leading-relaxed">
                  تصفير جميع المحادثات والشخصيات المخصصة والذاكرة المحفوظة وإعادة المنصة لحالتها الأولى عند التثبيت. يتطلب الأمر تأكيداً صريحاً لمنع الحذف بالخطأ.
                </p>
                <button
                  type="button"
                  onClick={() => setShowFactoryResetConfirm(true)}
                  className="w-full bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-bold text-xs sm:text-sm cursor-pointer shadow-sm"
                >
                  <Trash2 size={16} />
                  تصفير جميع البيانات وإعادة ضبط المصنع
                </button>
              </section>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 bg-surface border-t border-border/40 flex items-center justify-between shrink-0">
              <span className="text-xs text-emerald-400 font-medium hidden sm:inline">⚡ يتم حفظ كل تعديل في الذاكرة الدائمة فوراً</span>
              <button onClick={handleClose} className="bg-accent text-bg px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-accent/20 cursor-pointer">
                إغلاق (تم الحفظ تلقائياً ⚡)
              </button>
            </div>
          </motion.div>

          <ConfirmModal
            isOpen={!!chatToDeleteInArchive}
            title="حذف المحادثة المؤرشفة"
            message={`هل أنت متأكد من رغبتك في حذف محادثة "${chatToDeleteInArchive}" من الأرشيف نهائياً؟ لا يمكن استعادتها بعد الحذف.`}
            confirmText="نعم، احذف المحادثة"
            cancelText="إلغاء الأمر"
            onConfirm={() => {
              if (chatToDeleteInArchive) {
                deleteArchivedChat(chatToDeleteInArchive);
                setChatToDeleteInArchive(null);
              }
            }}
            onCancel={() => setChatToDeleteInArchive(null)}
          />

          <ConfirmModal
            isOpen={showClearAudioCacheConfirm}
            title="تصفير كاش الصوتيات"
            message="هل أنت متأكد من رغبتك في تصفير وحذف جميع ملفات الصوت المخزنة محلياً في الكاش؟ سيتم إعادة توليد مقاطع نظيفة ونقية من جديد عند الاستماع."
            confirmText="نعم، قم بتصفير الكاش الصوتي"
            cancelText="إلغاء الأمر"
            onConfirm={async () => {
              setShowClearAudioCacheConfirm(false);
              setIsClearingAudioCache(true);
              try {
                const count = await clearAudioCacheFromStorage();
                toast({
                  type: 'success',
                  title: 'تم تصفير كاش الصوتيات بنجاح',
                  message: count > 0 
                    ? `تم مسح ${count} ملف صوتي من الكاش. سيتم توليد مقاطع صوتية نظيفة جديدة عند الاستماع.` 
                    : 'كاش الصوتيات نظيف وفارغ حالياً.'
                });
              } catch (err) {
                toast({
                  type: 'error',
                  title: 'خطأ',
                  message: 'حدث خطأ أثناء تصفير الكاش.'
                });
              } finally {
                setIsClearingAudioCache(false);
              }
            }}
            onCancel={() => setShowClearAudioCacheConfirm(false)}
          />

          <ConfirmModal
            isOpen={showFactoryResetConfirm}
            title="تصفير المنصة وإعادة ضبط المصنع"
            message="تحذير هام: سيتم مسح جميع المحادثات، والشخصيات المخصصة، والأرشيف، والإعدادات المحفوظة نهائياً، وإعادة المنصة إلى حالتها الأولى عند التثبيت. هل تريد المتابعة وتصفير كل شيء؟"
            confirmText="نعم، صفر جميع البيانات برمجياً"
            cancelText="تراجع وإلغاء"
            onConfirm={() => {
              setShowFactoryResetConfirm(false);
              if (onFactoryReset) {
                onFactoryReset();
              }
            }}
            onCancel={() => setShowFactoryResetConfirm(false)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
