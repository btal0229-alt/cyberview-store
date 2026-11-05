import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA on the home screen, hide
  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-lg">
        <Check className="w-3 h-3 text-emerald-400" />
        <span>تطبيق مثبت ✓</span>
      </span>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-slate-950 text-xs font-black rounded-xl transition shadow-sm cursor-pointer animate-pulse"
        title="تثبيت التطبيق على شاشة جوالك أو حاسوبك"
      >
        <Download className="w-3.5 h-3.5" />
        <span>تثبيت التطبيق 📲</span>
      </button>
    );
  }

  // iOS Safari flow (WebKit doesn't fire beforeinstallprompt)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-bold rounded-xl transition cursor-pointer"
          title="تثبيت التطبيق على الآيفون"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>تثبيت على الآيفون </span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4" dir="rtl">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <Smartphone className="w-6 h-6" />
              </div>
              
              <h3 className="text-base font-extrabold text-gray-900">
                تثبيت تطبيق سُفرة على الآيفون
              </h3>

              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-900 text-right space-y-2 leading-relaxed">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <span>اضغط على زر المشاركة <Share2 className="w-3.5 h-3.5 inline mx-1 text-amber-700" /> في شريط متصفح سفاري السفلي.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  <span>مرر للأسفل واضغط على <strong>"إضافة إلى الصفحة الرئيسية"</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-amber-700" />.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                  <span>اضغط <strong>"إضافة"</strong> لتجد أيقونة التطبيق على شاشة جوالك مباشرة!</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition cursor-pointer"
              >
                فهمت، حسناً
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback trigger button for desktop / other browsers to guide installation
  return (
    <button
      onClick={() => setShowIOSGuide(true)}
      className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-bold rounded-lg transition cursor-pointer"
      title="كيفية تثبيت التطبيق"
    >
      <Smartphone className="w-3 h-3 text-amber-300" />
      <span>تثبيت كـ تطبيق</span>
    </button>
  );
};
