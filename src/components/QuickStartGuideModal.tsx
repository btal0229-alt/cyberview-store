import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  UtensilsCrossed, 
  Smartphone, 
  Receipt, 
  QrCode, 
  Crown, 
  ArrowLeft, 
  ExternalLink,
  Bell,
  Play,
  Printer,
  Copy,
  Check
} from 'lucide-react';
import { Tenant } from '../types';

interface QuickStartGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  onOpenAddMeal: () => void;
  onOpenCustomerPreview: () => void;
  onOpenShareModal: () => void;
  onTriggerTestOrder: () => void;
  onShowToast: (msg: string) => void;
}

export const QuickStartGuideModal: React.FC<QuickStartGuideModalProps> = ({
  isOpen,
  onClose,
  tenant,
  onOpenAddMeal,
  onOpenCustomerPreview,
  onOpenShareModal,
  onTriggerTestOrder,
  onShowToast,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const storeUrl = `${window.location.origin}/?tenant=${tenant.id}&view=store`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    onShowToast('تم نسخ رابط متجرك بنجاح! 📋');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5" dir="rtl">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-4 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-l from-amber-600 via-orange-600 to-amber-700 text-white p-6 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center text-xl shrink-0">
              🚀
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black">
                  دليل الاستخدام السريع والتشغيل الفوري
                </h2>
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  جاهز للاستعمال
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                خطوات بسيطة لإطلاق متجرك الفعلي، استقبال أول طلب، والبيع للعملاء
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-xs">
          
          {/* Step 1: Menu & Meals */}
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white font-black text-sm flex items-center justify-center shrink-0">
              1
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                <span>إضافة وتعديل طبخاتك المنزلية</span>
              </h3>
              <p className="text-gray-600 leading-relaxed">
                سجل وجباتك، أطباق العزائم، المفرزنات أو الحلويات مع تحديد السعر، الصور، وقت التحضير، وتحديد هل الوجبة متوفرة للطلب اليومي الفوري أو مسبقة الحجز.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenAddMeal();
                }}
                className="mt-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1"
              >
                <span>+ إضافة طبخة للمنيو الآن</span>
              </button>
            </div>
          </div>

          {/* Step 2: Share with customers */}
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0">
              2
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-blue-600" />
                <span>مشاركة المنيو وباركود QR مع الزبائن</span>
              </h3>
              <p className="text-gray-600 leading-relaxed">
                لكل متجر رابط خاص ورمز باركود QR code جاهز للطباعة أو المشاركة في بايو إنستغرام وواتساب. العميل يفتح الرابط ويطلب بدون الحاجة لتحميل أي تطبيق.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-white border border-blue-300 hover:bg-blue-50 text-blue-800 font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>نسخ رابط المتجر للعميل</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenShareModal();
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>عرض الباركود</span>
                </button>
              </div>
            </div>
          </div>

          {/* Step 3: Orders, Bell & Printing Receipts */}
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0">
              3
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-emerald-600" />
                <span>استقبال الطلبات برنين فوري وطباعة الفاتورة</span>
              </h3>
              <p className="text-gray-600 leading-relaxed">
                عندما يطلب العميل، يرن جرس المطبخ فوراً! يمكنك قبول الطلب وبدء الطبخ، إشعار العميل على الواتساب، وطباعة إيصال الفاتورة المعتمد للأسر المنتجة.
              </p>
              <button
                onClick={() => {
                  onTriggerTestOrder();
                  onShowToast('🔔 تم إرسال طلب تجريبي جديد! استمع لجرس المطبخ الآن.');
                }}
                className="mt-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>تجربة استقبال طلب حقيقي الآن</span>
              </button>
            </div>
          </div>

          {/* Step 4: Install as Mobile App */}
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shrink-0">
              4
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-purple-600" />
                <span>تثبيت التطبيق على الجوال (PWA)</span>
              </h3>
              <p className="text-gray-600 leading-relaxed">
                يمكنك أنت وعملاؤك تثبيت المنصة على شاشة الآيفون أو الأندرويد بضغطة زر لفتحها كتطبيق أصيل بدون الحاجة لمتجر التطبيقات وبسرعة فائقة.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              onClose();
              onOpenCustomerPreview();
            }}
            className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-extrabold rounded-xl text-xs transition cursor-pointer inline-flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>تجربة متجر العميل الآن</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            إغلاق الدليل
          </button>
        </div>

      </div>
    </div>
  );
};
