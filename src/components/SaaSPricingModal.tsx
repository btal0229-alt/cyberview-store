import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ArrowLeft, 
  Store, 
  Phone, 
  CreditCard, 
  CheckCircle2, 
  Building2, 
  ChefHat,
  MessageCircle,
  QrCode,
  Flame,
  Truck,
  FileText
} from 'lucide-react';
import { SubscriptionPlan, PlatformSettings, Tenant } from '../types';
import { DEFAULT_WEEK_SCHEDULE } from '../utils/scheduleHelper';

interface SaaSPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: SubscriptionPlan[];
  platformSettings: PlatformSettings;
  onRegisterNewTenant: (newTenant: Tenant) => void;
  onShowToast: (msg: string) => void;
}

export const SaaSPricingModal: React.FC<SaaSPricingModalProps> = ({
  isOpen,
  onClose,
  plans,
  platformSettings,
  onRegisterNewTenant,
  onShowToast,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  
  // Registration Form State
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState('الرياض');
  const [district, setDistrict] = useState('');
  const [type, setType] = useState<Tenant['type']>('family');
  const [brandColor, setBrandColor] = useState('#d97706');
  const [paymentChoice, setPaymentChoice] = useState<'trial' | 'mada' | 'apple_pay' | 'bank_transfer'>('trial');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleStartSubscription = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !ownerName.trim()) {
      onShowToast('يرجى كتابة اسم المتجر واسم المالك');
      return;
    }

    setIsSubmitting(true);

    const chosenPlan = plans.find(p => p.id === selectedPlanId) || plans[1];
    const newTenantId = `tenant-${Date.now().toString(36)}`;
    
    // Set expiry
    const expiryDate = new Date();
    if (paymentChoice === 'trial') {
      expiryDate.setDate(expiryDate.getDate() + 14); // 14 days trial
    } else if (billingCycle === 'yearly') {
      expiryDate.setDate(expiryDate.getDate() + 365);
    } else {
      expiryDate.setDate(expiryDate.getDate() + 30);
    }

    const newTenant: Tenant = {
      id: newTenantId,
      name: storeName.trim(),
      ownerName: ownerName.trim(),
      type,
      city,
      district: district.trim() || 'وسط المدينة',
      phone: phone.trim() || '0550000000',
      whatsapp: whatsapp.trim() || phone.trim() || '0550000000',
      rating: 5.0,
      totalOrders: 0,
      totalRevenue: 0,
      isOpen: true,
      autoScheduleEnabled: true,
      schedule: DEFAULT_WEEK_SCHEDULE,
      freelanceDocNumber: `FL-${Math.floor(10000000 + Math.random() * 90000000)}`,
      bannerImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      avatarImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=300&q=80',
      brandColor,
      subscriptionPlanId: chosenPlan.id,
      subscriptionPlanName: chosenPlan.name,
      subscriptionStatus: paymentChoice === 'trial' ? 'trial' : 'active',
      subscriptionExpiryDate: expiryDate.toISOString().split('T')[0],
      licenseKey: `AUTO-${Math.random().toString(36).substring(2, 7).toUpperCase()}-2026`,
      subdomain: storeName.toLowerCase().replace(/\s+/g, '-'),
    };

    setTimeout(() => {
      onRegisterNewTenant(newTenant);
      setIsSubmitting(false);
      setSelectedPlanId(null);
      onClose();
      onShowToast(`مبروك! تم تفعيل متجرك الجديد "${newTenant.name}" بنجاح وجاهز لاستقبال الطلبات 🎉`);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div 
        className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-4 flex flex-col max-h-[92vh]"
        dir="rtl"
      >
        {/* Modal Top Header */}
        <div className="bg-gradient-to-l from-amber-600 via-orange-600 to-amber-700 text-white p-6 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="relative flex items-center justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-xs mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>فرصة لأصحاب الطبخ المنزلي والمطابخ السحابية</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black">
                امتلك متجرك الرقمي المتكامل للطبخ واستقبل طلباتك فوراً
              </h1>
              <p className="text-xs sm:text-sm text-amber-100 max-w-2xl">
                منيو رقمي سريع بهويتك الخاصة، استقبال الطلبات مباشرة على الواتساب، فواتير إلكترونية معتمدة وبدون أي عمولة على مبيعاتك (0%).
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer self-start"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-7">

          {/* If No Plan Selected -> Show Pricing Cards */}
          {!selectedPlanId ? (
            <div className="space-y-6">
              
              {/* Billing Cycle Switcher */}
              <div className="flex items-center justify-center gap-3">
                <div className="bg-slate-100 p-1 rounded-2xl border border-gray-200 flex items-center text-xs font-bold">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-5 py-2 rounded-xl transition cursor-pointer ${
                      billingCycle === 'monthly'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    اشتراك شهري
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                      billingCycle === 'yearly'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <span>اشتراك سنوي</span>
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-1.5 py-0.2 rounded-md">
                      خصم شهرين مجاناً 🎁
                    </span>
                  </button>
                </div>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((p) => {
                  const monthlyPrice = p.price;
                  const yearlyPrice = Math.round(monthlyPrice * 10); // 10 months instead of 12 (2 months free)
                  const displayPrice = billingCycle === 'yearly' ? yearlyPrice : monthlyPrice;

                  return (
                    <div
                      key={p.id}
                      className={`relative rounded-3xl p-6 border flex flex-col justify-between transition-all duration-300 ${
                        p.popular
                          ? 'border-amber-500 bg-gradient-to-b from-amber-50/50 via-white to-white shadow-xl shadow-amber-500/10 ring-2 ring-amber-500'
                          : 'border-gray-200 bg-white hover:border-amber-300 shadow-xs'
                      }`}
                    >
                      {p.popular && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-xs font-black px-4 py-1 rounded-full shadow-md">
                          الباقة الأكثر اختياراً للنمو ⭐
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-400">{p.nameEn}</span>
                          {p.badge && (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                              {p.badge}
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="font-extrabold text-xl text-gray-900">{p.name}</h3>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            {p.description}
                          </p>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-1 py-3 border-y border-gray-100">
                          <span className="text-4xl font-black text-gray-900">
                            {displayPrice}
                          </span>
                          <span className="text-xs font-bold text-gray-500">
                            {billingCycle === 'yearly' ? 'ر.س / سنوياً' : 'ر.س / شهرياً'}
                          </span>
                          {p.originalPrice && (
                            <span className="text-xs text-gray-400 line-through mr-2">
                              {billingCycle === 'yearly' ? p.originalPrice * 12 : p.originalPrice} ر.س
                            </span>
                          )}
                        </div>

                        {/* Features List */}
                        <div className="space-y-2.5 pt-2">
                          <span className="text-xs font-extrabold text-gray-800 block">
                            المميزات المضمنة:
                          </span>
                          <ul className="space-y-2 text-xs text-gray-600">
                            {p.features.map((feat, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <div className="pt-6 mt-4 border-t border-gray-100 space-y-2">
                        <button
                          onClick={() => handleStartSubscription(p.id)}
                          className={`w-full py-3 rounded-2xl font-black text-xs transition-all shadow-md cursor-pointer active:scale-95 flex items-center justify-center gap-2 ${
                            p.popular
                              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/25'
                              : 'bg-gray-900 hover:bg-black text-white'
                          }`}
                        >
                          <Store className="w-4 h-4" />
                          <span>ابدأ الآن وفعل متجرك (تجربة 14 يوم مجاناً)</span>
                        </button>
                        <p className="text-center text-[10px] text-gray-400 font-medium">
                          بدون عمولة مبيعات • إلغاء في أي وقت
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Trust & Guarantee Banner */}
              <div className="bg-slate-50 border border-gray-200 rounded-2xl p-4 flex flex-wrap items-center justify-around gap-4 text-xs font-bold text-gray-700">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>متوافق مع وثيقة العمل الحر ونظام الأسر المنتجة</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>متجرك يعمل فوراً خلال 60 ثانية</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-indigo-600" />
                  <span>صمم خصيصاً للمطابخ والأسر والحلويات</span>
                </div>
              </div>

            </div>
          ) : (
            
            /* Registration & Store Creation Wizard Form */
            <div className="max-w-2xl mx-auto space-y-6">
              <button
                onClick={() => setSelectedPlanId(null)}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 rotate-180" />
                <span>العودة لاختيار باقة أخرى</span>
              </button>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-800 font-bold block">الباقة المختارة:</span>
                  <h3 className="font-extrabold text-base text-gray-900">
                    {plans.find(p => p.id === selectedPlanId)?.name}
                  </h3>
                </div>
                <div className="text-left">
                  <span className="text-lg font-black text-amber-800">
                    {billingCycle === 'yearly' 
                      ? Math.round((plans.find(p => p.id === selectedPlanId)?.price || 99) * 10)
                      : (plans.find(p => p.id === selectedPlanId)?.price || 99)
                    } ر.س
                  </span>
                  <span className="text-[10px] text-gray-500 block">
                    {billingCycle === 'yearly' ? 'اشتراك سنوي (شهران مجاناً)' : 'اشتراك شهري'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmitRegistration} className="space-y-4 text-xs">
                <h4 className="font-black text-sm text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <Store className="w-4 h-4 text-amber-600" />
                  <span>بيانات متجرك أو مطبخك المنزلي:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">اسم المتجر / المطبخ:*</label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="مثال: مطبخ أطايب زمان للأكلات الحجازية"
                      required
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">اسم صاحبة أو صاحب المطبخ:*</label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="مثال: أم سعود الغامدي"
                      required
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">نوع المطبخ / النشاط:*</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as Tenant['type'])}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none font-bold"
                    >
                      <option value="family">أسر منتجة (طبخ منزلي شعبي)</option>
                      <option value="home_kitchen">مطبخ منزلي عام وولائم</option>
                      <option value="mufarzanat">مفرزنات ومعجنات مجمدة</option>
                      <option value="sweets">حلويات وكيك ومناسبات</option>
                      <option value="cloud_kitchen">مطبخ سحابي تجاري</option>
                      <option value="artisan">مأكولات حرفية وضيافة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">لون الهوية المفضل للمتجر:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="w-10 h-10 rounded-xl border border-gray-200 p-0.5 cursor-pointer shrink-0"
                      />
                      <span className="text-[11px] text-gray-500">سيتم تلوين المتجر والأزرار بلونك المختار</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">المدينة:*</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="الرياض، جدة، الدمام..."
                      required
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">الحي:*</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="مثال: حي الياسمين"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">رقم الواتساب لاستقبال الطلبات:*</label>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="05XXXXXXXX"
                      required
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none font-mono text-left ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">رقم الجوال للاتصال:</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="05XXXXXXXX"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none font-mono text-left ltr"
                    />
                  </div>
                </div>

                {/* Payment / Trial Options */}
                <div className="pt-3 space-y-2">
                  <label className="block text-gray-900 font-extrabold mb-1">
                    طريقة التفعيل والسداد:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentChoice('trial')}
                      className={`p-3 rounded-2xl border text-right transition cursor-pointer flex items-center justify-between ${
                        paymentChoice === 'trial'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <div className="font-extrabold text-xs">تجربة مجانية 14 يوم 🎁</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">ابدأ فوراً بدون أي بطاقة بنكية</div>
                      </div>
                      <CheckCircle2 className={`w-4 h-4 ${paymentChoice === 'trial' ? 'text-emerald-600' : 'text-gray-300'}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentChoice('mada')}
                      className={`p-3 rounded-2xl border text-right transition cursor-pointer flex items-center justify-between ${
                        paymentChoice === 'mada'
                          ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold ring-2 ring-amber-500'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <div className="font-extrabold text-xs">بطاقة مدى / فيزا / Apple Pay 💳</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">تفعيل فوري مع إيصال رسمي</div>
                      </div>
                      <CheckCircle2 className={`w-4 h-4 ${paymentChoice === 'mada' ? 'text-amber-600' : 'text-gray-300'}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentChoice('bank_transfer')}
                      className={`p-3 rounded-2xl border text-right transition cursor-pointer flex items-center justify-between col-span-1 sm:col-span-2 ${
                        paymentChoice === 'bank_transfer'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold ring-2 ring-indigo-500'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <div className="font-extrabold text-xs">تحويل بنكي مباشر (الآيبان) 🏦</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          {platformSettings.bankName} - {platformSettings.ibanNumber}
                        </div>
                      </div>
                      <CheckCircle2 className={`w-4 h-4 ${paymentChoice === 'bank_transfer' ? 'text-indigo-600' : 'text-gray-300'}`} />
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-sm rounded-2xl transition shadow-lg shadow-amber-600/30 cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>جاري إعداد وتجهيز متجرك...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-200" />
                        <span>إنشاء وتفعيل متجري الآن 🚀</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-3.5 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-gray-500">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>للاستفسارات ومبيعات الجملة: واتساب <span className="font-mono font-bold text-gray-800">{platformSettings.supportWhatsapp}</span></span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-gray-500 hover:text-gray-700 font-bold transition cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};
