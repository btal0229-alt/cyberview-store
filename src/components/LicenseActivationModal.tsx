import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  Sparkles, 
  CheckCircle2, 
  Crown, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Tenant, SubscriptionPlan, LicenseKey } from '../types';

interface LicenseActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  plans: SubscriptionPlan[];
  licenseKeys: LicenseKey[];
  onActivateKey: (tenantId: string, keyCode: string) => boolean;
  onOpenPricingModal: () => void;
  onShowToast: (msg: string) => void;
}

export const LicenseActivationModal: React.FC<LicenseActivationModalProps> = ({
  isOpen,
  onClose,
  tenant,
  plans,
  licenseKeys,
  onActivateKey,
  onOpenPricingModal,
  onShowToast,
}) => {
  const [keyCode, setKeyCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPlan = plans.find(p => p.id === tenant.subscriptionPlanId) || plans[1];
  const isTrial = tenant.subscriptionStatus === 'trial';
  const isExpired = tenant.subscriptionStatus === 'expired';

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyCode.trim()) {
      setErrorMsg('يرجى إدخال كود الترخيص');
      return;
    }

    const success = onActivateKey(tenant.id, keyCode.trim());
    if (success) {
      setErrorMsg(null);
      setKeyCode('');
      onClose();
    } else {
      setErrorMsg('كود الترخيص غير صالح أو تم استخدامه من قبل.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-4 p-5 sm:p-6 space-y-5"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">
                ترخيص وباقة المتجر
              </h2>
              <p className="text-xs text-gray-500">
                حالة اشتراك المتجر وتفعيل أكواد التراخيص
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Plan Card */}
        <div className="bg-gradient-to-br from-amber-50 via-orange-50/50 to-white border border-amber-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">الباقة الحالية:</span>
            {isTrial ? (
              <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                فترة تجريبية 14 يوم
              </span>
            ) : isExpired ? (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                منتهي الصلاحية
              </span>
            ) : (
              <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                نشط ومعتمد ✓
              </span>
            )}
          </div>

          <div>
            <h3 className="font-black text-lg text-gray-900">{tenant.subscriptionPlanName || currentPlan.name}</h3>
            <p className="text-xs text-gray-600 mt-0.5">{currentPlan.description}</p>
          </div>

          <div className="pt-2 border-t border-amber-200/50 flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>تاريخ الانتهاء: <strong className="font-mono text-gray-900">{tenant.subscriptionExpiryDate || '2027-11-04'}</strong></span>
            </div>
            {tenant.licenseKey && (
              <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-amber-200 text-amber-900">
                {tenant.licenseKey}
              </span>
            )}
          </div>
        </div>

        {/* Activate New License Key Form */}
        <form onSubmit={handleActivate} className="space-y-3 text-xs">
          <div>
            <label className="block text-gray-800 font-extrabold mb-1">
              تفعيل كود ترخيص جديد (License Key):
            </label>
            <p className="text-[11px] text-gray-500 mb-2">
              إذا قمت بشراء كود ترخيص أو تجديد اشتراك من مالك المنصة، ألصق الكود هنا:
            </p>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={keyCode}
                onChange={(e) => {
                  setKeyCode(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="PRO-SA-XXXX-XXXX-2026"
                className="w-full pl-3 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none font-mono text-left ltr uppercase"
              />
            </div>
            {errorMsg && (
              <p className="text-[11px] text-rose-600 font-bold mt-1.5">{errorMsg}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-extrabold rounded-xl transition shadow-md shadow-amber-600/20 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>تفعيل الكود والترقية فوراً</span>
          </button>
        </form>

        {/* Upgrade / Pricing Shortcut */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-500">تريد ترقية باقتك أونلاين؟</span>
          <button
            onClick={() => {
              onClose();
              onOpenPricingModal();
            }}
            className="text-amber-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>استعراض الباقات والأسعار</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};
