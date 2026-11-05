import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  ExternalLink, 
  Smartphone, 
  KeyRound, 
  Share2, 
  ArrowRight,
  ShieldCheck,
  Tag,
  DollarSign,
  Package
} from 'lucide-react';
import { Tenant, LicenseKey, SubscriptionPlan, PlatformSettings } from '../types';

interface DigitalProductSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  plans: SubscriptionPlan[];
  platformSettings: PlatformSettings;
  onAddLicenseKey: (key: LicenseKey) => void;
  onShowToast: (msg: string) => void;
}

export const DigitalProductSellerModal: React.FC<DigitalProductSellerModalProps> = ({
  isOpen,
  onClose,
  tenant,
  plans,
  platformSettings,
  onAddLicenseKey,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'listing' | 'bundle' | 'deploy'>('listing');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Buyer Package Generator Form State
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(plans[1]?.id || 'plan-pro');
  const [licenseDuration, setLicenseDuration] = useState<'month' | 'year' | 'lifetime'>('year');
  const [generatedBundle, setGeneratedBundle] = useState<{
    code: string;
    downloadUrl: string;
    textSummary: string;
  } | null>(null);

  if (!isOpen) return null;

  const appLiveUrl = window.location.origin;

  const productTitle = 'نظام وتطبيق سُفرة السحابي لإدارة ومبيعات الأسر المنتجة والمطابخ (سورس كود وترخيص جاهز)';
  
  const productDescriptionText = `✨ نظام وتطبيق سُفرة السحابي المتكامل للأسر المنتجة والمطابخ السحابية 🇸🇦
الحل الرقمي الأسرع لإطلاق وإدارة مبيعات الطبخ المنزلي، الولائم، المفرزنات والحلويات بدون أي عمولات.

🌟 مميزات النظام التي يحصل عليها المشتري:
1. تطبيق جوال PWA فوري يمكن تثبيته على شاشة الآيفون والأندرويد بضغطة زر.
2. منيو رقمي سريع وجذاب بهوية بصرية مخصصة ورمز باركود QR جاهز للطباعة.
3. نظام استقبال الطلبات الحية مع رنين جرس المطبخ الفوري عند وصول أي طلب.
4. طباعة فواتير وإيصالات تحضير الطلب الحرارية (80mm) بباركود ضريبي معتمد.
5. إشعارات تلقائية للعميل عبر الواتساب بحالة تجهيز الوجبة (جاري الطبخ / جاهز للتسليم).
6. سلة مشتريات سلسة تدعم الدفع كاش، مدى، Apple Pay، وتحويل بنكي.
7. لوحة إحصائيات للمبيعات وتقييمات الزبائن وتصدير التقارير إلى Excel/CSV.
8. متوافق مع متطلبات وثيقة العمل الحر ونظام الأسر المنتجة السعودي.

📦 ماذا يتسلم العميل فور الشراء؟
- رابط المتجر المخصص الجاهز للاستعمال الفوري.
- كود ترخيص وتفعيل معتمد.
- دليل الاستخدام السريع خطوة بخطوة.
- دعم فني وتشغيلي متواصل.`;

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
    onShowToast('تم نسخ المحتوى بنجاح! جاهز للصق في متجرك. 📋');
  };

  const handleGenerateBundle = (e: React.FormEvent) => {
    e.preventDefault();
    const plan = plans.find(p => p.id === selectedPlanId) || plans[1];
    
    // Generate valid license
    const prefix = licenseDuration === 'lifetime' ? 'ENT-LIFE' : plan.id === 'plan-enterprise' ? 'VIP-ENT' : 'PRO-SA';
    const rand = Math.floor(1000 + Math.random() * 9000);
    const code = `${prefix}-${rand}-2026`;

    const expiryDate = new Date();
    if (licenseDuration === 'month') expiryDate.setDate(expiryDate.getDate() + 30);
    else if (licenseDuration === 'year') expiryDate.setDate(expiryDate.getDate() + 365);
    else expiryDate.setFullYear(expiryDate.getFullYear() + 10);

    const expiryStr = expiryDate.toISOString().split('T')[0];

    const newKey: LicenseKey = {
      id: `lic-${Date.now().toString(36)}`,
      code,
      planId: plan.id,
      planName: plan.name,
      createdAt: new Date().toISOString().split('T')[0],
      expiresAt: expiryStr,
      status: 'available',
      assignedTenantName: buyerName.trim() || undefined,
    };

    onAddLicenseKey(newKey);

    // Prepare text file content for delivery to the buyer
    const deliveryContent = `========================================================
🎉 باقة تسليم العميل المشتري - منصة سُفرة للمطابخ السحابية
========================================================

مرحباً بك عزيزنا العميل: ${buyerName.trim() || 'العميل الكريم'}
شكراً لشرائك نظام ومنصة سُفرة لإدارة ومبيعات مطبخك المنزلي.

📋 تفاصيل باقة الترخيص:
- نوع الباقة: ${plan.name}
- كود التفعيل والترخيص: ${code}
- مدة الصلاحية: ${licenseDuration === 'lifetime' ? 'ترخيص دائم مدى الحياة 👑' : `ساري حتى ${expiryStr}`}

🚀 روابط الوصول المباشر لمتجرك:
- رابط تشغيل المنصة: ${appLiveUrl}
- كود التفعيل: ${code}

📲 خطوات تشغيل متجرك في 3 خطوات بسيطة:
1. افتح الرابط أعلاه من متصفحك أو جوالك.
2. انقر على "👑 الباقة والترخيص" من الشريط العلوي وأدخل كود التفعيل (${code}).
3. سيتم تفعيل باقتك فوراً، ويمكنك البدء بإضافة وجباتك ومشاركة باركود المتجر مع زبائنك!

📞 للدعم الفني والاستفسارات:
- واتساب: ${platformSettings.supportWhatsapp}
- البريد: ${platformSettings.supportEmail}

نتمنى لمشروعك المنزلي مزيداً من النجاح والأرباح الوفيرة! 🌿
========================================================`;

    const blob = new Blob([deliveryContent], { type: 'text/plain;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);

    setGeneratedBundle({
      code,
      downloadUrl,
      textSummary: deliveryContent,
    });

    onShowToast(`تم تجهيز باقة المشتري بنجاح! كود الترخيص: ${code} 🎉`);
  };

  const handleDownloadFile = () => {
    if (!generatedBundle) return;
    const a = document.createElement('a');
    a.href = generatedBundle.downloadUrl;
    a.download = `باقة_تسليم_${buyerName.trim() || 'العميل'}_منصة_سفرة.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onShowToast('تم تحميل ملف التسليم للمشتري بنجاح! 📥');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5" dir="rtl">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-4 max-h-[92vh] flex flex-col">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-l from-emerald-800 via-teal-900 to-slate-900 text-white p-6 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center text-xl shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black">
                  بوابة بيع التطبيق كمنتج في متجرك (Digital Store Kit)
                </h2>
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  جاهز للبيع
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                بيانات عرض المنتج، الوصف التسويقي، وحزمة التسليم الفوري للمشتري في سلة أو زد
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-gray-200 bg-white shrink-0 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('listing')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'listing'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>بيانات ووصف المنتج لمتجرك (سلة / زد)</span>
          </button>

          <button
            onClick={() => setActiveTab('bundle')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'bundle'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>تجهيز حزمة التسليم الفوري للمشتري</span>
          </button>

          <button
            onClick={() => setActiveTab('deploy')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'deploy'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>روابط النشر وتأكيد الجاهزية</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-xs">

          {/* TAB 1: Product Listing Kit */}
          {activeTab === 'listing' && (
            <div className="space-y-5">
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-emerald-950 space-y-1">
                  <h4 className="font-extrabold text-sm">كيف تعرض هذا التطبيق للبيع في متجرك (سلة / زد / موقعك)؟</h4>
                  <p className="text-[11px] leading-relaxed text-emerald-800">
                    أضف منتجاً جديداً في متجرك كـ <strong>"منتج رقمي / خدمة"</strong>، انسخ العنوان والوصف التسويقي أدناه وضعه في خانة الوصف، وحدد السعر المقترح. وعندما يشتري العميل، حمّل له ملف التسليم الجاهز!
                  </p>
                </div>
              </div>

              {/* Product Title Field */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-gray-900 text-xs">
                    1. عنوان المنتج المقترح لمتجرك:
                  </label>
                  <button
                    onClick={() => handleCopy(productTitle, 'title')}
                    className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-bold text-gray-700 transition cursor-pointer"
                  >
                    {copiedField === 'title' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ العنوان</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-200 font-bold text-gray-800 text-sm">
                  {productTitle}
                </div>
              </div>

              {/* Pricing Suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
                  <span className="text-[11px] text-gray-500 font-bold">السعر المقترح (رخصة متجر فردي):</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-emerald-700">299</span>
                    <span className="text-xs text-gray-500 font-bold">ر.س</span>
                  </div>
                  <span className="text-[10px] text-gray-400 block">لأصحاب المطبخ المنزلي الواحد</span>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-emerald-300 ring-2 ring-emerald-500/30 shadow-2xs space-y-1">
                  <span className="text-[11px] text-emerald-900 font-bold">السعر المقترح (اشتراك سنوي Pro):</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-amber-700">599</span>
                    <span className="text-xs text-gray-500 font-bold">ر.س / سنوياً</span>
                  </div>
                  <span className="text-[10px] text-gray-400 block">شامل الفواتير وتخصيص الهوية</span>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
                  <span className="text-[11px] text-gray-500 font-bold">السعر المقترح (ترخيص كامل مدى الحياة):</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-900">1,299</span>
                    <span className="text-xs text-gray-500 font-bold">ر.س</span>
                  </div>
                  <span className="text-[10px] text-gray-400 block">للمطابخ الكبيرة أو إعادة البيع</span>
                </div>
              </div>

              {/* Full Description Field */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-gray-900 text-xs">
                    2. الوصف التسويقي الكامل للمنتج (جاهز للصق):
                  </label>
                  <button
                    onClick={() => handleCopy(productDescriptionText, 'desc')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    {copiedField === 'desc' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>تم نسخ الوصف بالكامل!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الوصف التسويقي كاملاً</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={10}
                  value={productDescriptionText}
                  className="w-full bg-white p-3.5 rounded-xl border border-gray-200 text-gray-700 text-xs leading-relaxed focus:outline-none font-sans"
                />
              </div>

            </div>
          )}

          {/* TAB 2: Buyer Delivery Package Generator */}
          {activeTab === 'bundle' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Form to generate bundle */}
              <div className="bg-slate-50 border border-gray-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">
                      تجهيز حزمة تسليم فوري للمشتري
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      أدخل بيانات المشتري لتوليد ملف التسليم الفوري مع كود التفعيل ورابط الوصول
                    </p>
                  </div>
                </div>

                <form onSubmit={handleGenerateBundle} className="space-y-3.5">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">اسم العميل / المطبخ المشتري:*</label>
                    <input
                      type="text"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="مثال: مطبخ بهارات البيت"
                      required
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">نوع الباقة المشتراة:</label>
                    <select
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none font-bold"
                    >
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.price} ر.س)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">مدة الصلاحية للترخيص:</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setLicenseDuration('month')}
                        className={`py-2 px-1 text-center rounded-xl border font-bold transition cursor-pointer ${
                          licenseDuration === 'month' 
                            ? 'bg-emerald-600 text-white border-emerald-600' 
                            : 'bg-white text-gray-700 border-gray-200'
                        }`}
                      >
                        شهر (30 يوم)
                      </button>
                      <button
                        type="button"
                        onClick={() => setLicenseDuration('year')}
                        className={`py-2 px-1 text-center rounded-xl border font-bold transition cursor-pointer ${
                          licenseDuration === 'year' 
                            ? 'bg-emerald-600 text-white border-emerald-600' 
                            : 'bg-white text-gray-700 border-gray-200'
                        }`}
                      >
                        سنة كاملة
                      </button>
                      <button
                        type="button"
                        onClick={() => setLicenseDuration('lifetime')}
                        className={`py-2 px-1 text-center rounded-xl border font-bold transition cursor-pointer ${
                          licenseDuration === 'lifetime' 
                            ? 'bg-emerald-600 text-white border-emerald-600' 
                            : 'bg-white text-gray-700 border-gray-200'
                        }`}
                      >
                        مدى الحياة 👑
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold rounded-xl transition shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>توليد كود الترخيص وملف التسليم الآن</span>
                  </button>
                </form>
              </div>

              {/* Delivery Bundle Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-gray-900">
                    معاينة ملف التسليم للمشتري
                  </h3>
                  {generatedBundle && (
                    <button
                      onClick={handleDownloadFile}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition cursor-pointer shadow-xs active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل ملف المشتري (.txt)</span>
                    </button>
                  )}
                </div>

                {generatedBundle ? (
                  <div className="bg-stone-50 border border-gray-300 rounded-2xl p-4 font-mono text-[11px] text-gray-800 space-y-3 max-h-[340px] overflow-y-auto">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                      <span className="font-bold text-emerald-700">كود التفعيل المرخص:</span>
                      <span className="bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded font-extrabold select-all">
                        {generatedBundle.code}
                      </span>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-xs text-gray-700 leading-relaxed">
                      {generatedBundle.textSummary}
                    </pre>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-10 text-center space-y-2 text-gray-400">
                    <FileText className="w-10 h-10 mx-auto stroke-1" />
                    <p className="font-bold">لم يتم توليد باقة بعد</p>
                    <p className="text-[11px]">أدخل اسم العميل واضغط "توليد كود الترخيص" لإنشاء ملف التسليم فوراً</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: Deployment & Live URLs */}
          {activeTab === 'deploy' && (
            <div className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                  <span className="text-gray-500 font-bold block text-[11px]">رابط التطبيق المنشور والمباشر:</span>
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-200">
                    <span className="font-mono font-bold text-xs text-gray-800 truncate ltr text-left">
                      {appLiveUrl}
                    </span>
                    <button
                      onClick={() => handleCopy(appLiveUrl, 'liveUrl')}
                      className="p-1 hover:bg-gray-100 rounded text-gray-600 cursor-pointer"
                      title="نسخ الرابط"
                    >
                      {copiedField === 'liveUrl' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                  <span className="text-gray-500 font-bold block text-[11px]">رابط متجر العميل المباشر:</span>
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-200">
                    <span className="font-mono font-bold text-xs text-gray-800 truncate ltr text-left">
                      {appLiveUrl}/?tenant={tenant.id}&view=store
                    </span>
                    <button
                      onClick={() => handleCopy(`${appLiveUrl}/?tenant=${tenant.id}&view=store`, 'storeUrl')}
                      className="p-1 hover:bg-gray-100 rounded text-gray-600 cursor-pointer"
                      title="نسخ الرابط"
                    >
                      {copiedField === 'storeUrl' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Ready Checklist */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
                <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>قائمة جاهزية النشر والبيع (100% Ready Checklist):</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-gray-700">
                  <div className="flex items-center gap-2 p-2 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>تطبيق جوال PWA قابل للتثبيت على هواتف العملاء</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>فواتير وإيصالات مطبخ حرارية جاهزة للطباعة مع QR</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>سلة طلبات مع خيارات الدفع وربط مباشر بالواتساب</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>لوحة تحكم مالك المنصة لإصدار وإدارة التراخيص</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>نظام متعدد المستأجرين (عزل المتاجر والبيانات)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>تصدير المبيعات وتقارير المحاسبة إلى Excel/CSV</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <span className="text-gray-500 text-xs">
            يمكنك نشر هذا المنتج الرقمي في متجرك وبدء تحقيق الأرباح فوراً 🚀
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-xs transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
