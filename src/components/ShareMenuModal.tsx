import React, { useState } from 'react';
import { 
  X, 
  QrCode, 
  Copy, 
  Check, 
  Share2, 
  MessageCircle, 
  Sparkles,
  Printer
} from 'lucide-react';
import { Tenant } from '../types';

interface ShareMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
}

export const ShareMenuModal: React.FC<ShareMenuModalProps> = ({ isOpen, onClose, tenant }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const menuUrl = `${window.location.origin}/?view=store&tenant=${tenant.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`مرحباً بكم! تصفحوا وتذوقوا ألذ الوجبات المنزلية من قائمة طعام "${tenant.name}":\n${menuUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-4 text-center p-6 space-y-5"
        dir="rtl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-xl">
            <QrCode className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            مشاركة منيو متجرك الرقمي
          </h2>
          <p className="text-xs text-gray-500">
            شارك رابط قائمتك أو رمز الباركود مع زبائنك وعلى حسابات التواصل
          </p>
        </div>

        {/* QR Code Presentation Box */}
        <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/60 inline-block mx-auto">
          <div className="w-44 h-44 bg-white p-3 rounded-xl border border-gray-200 shadow-xs flex flex-col items-center justify-center relative">
            {/* High visual fidelity QR representation */}
            <div className="w-full h-full bg-gray-900 rounded-lg p-2 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-1 border-2 border-dashed border-amber-400/40 rounded pointer-events-none" />
              <div className="text-center text-white space-y-1 z-10">
                <QrCode className="w-20 h-20 text-white mx-auto stroke-1" />
                <span className="text-[10px] text-amber-300 font-mono font-bold block">
                  {tenant.id}
                </span>
              </div>
            </div>
          </div>
          <p className="text-[11px] font-bold text-gray-600 mt-2">
            امسح الباركود لفتح المنيو في جوالك
          </p>
        </div>

        {/* Copy Link Input */}
        <div className="space-y-1.5 text-right">
          <label className="text-xs font-bold text-gray-700">رابط المنيو المباشر:</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={menuUrl}
              className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-mono text-left ltr text-gray-700"
            />
            <button
              onClick={handleCopy}
              className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
            </button>
          </div>
        </div>

        {/* Quick Social Share Buttons */}
        <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
          <button
            onClick={handleWhatsAppShare}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>مشاركة عبر واتساب</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
            title="طباعة ستاند الباركود"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة</span>
          </button>
        </div>
      </div>
    </div>
  );
};
