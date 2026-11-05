import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Users, 
  CreditCard, 
  KeyRound, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Copy, 
  Check, 
  MessageCircle, 
  Calendar, 
  Store, 
  Settings, 
  ExternalLink,
  Crown,
  Search,
  Filter,
  RefreshCw,
  Building2,
  Sparkles
} from 'lucide-react';
import { Tenant, SubscriptionPlan, LicenseKey, PlatformSettings } from '../types';

interface SuperAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenants: Tenant[];
  plans: SubscriptionPlan[];
  licenseKeys: LicenseKey[];
  platformSettings: PlatformSettings;
  onUpdateTenants: (tenants: Tenant[]) => void;
  onAddLicenseKey: (key: LicenseKey) => void;
  onUpdatePlatformSettings: (settings: PlatformSettings) => void;
  onSelectTenant: (tenantId: string) => void;
  onShowToast: (msg: string) => void;
}

export const SuperAdminModal: React.FC<SuperAdminModalProps> = ({
  isOpen,
  onClose,
  tenants,
  plans,
  licenseKeys,
  platformSettings,
  onUpdateTenants,
  onAddLicenseKey,
  onUpdatePlatformSettings,
  onSelectTenant,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'tenants' | 'licenses' | 'plans' | 'settings'>('tenants');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New License Generator Form State
  const [genPlanId, setGenPlanId] = useState(plans[1]?.id || 'plan-pro');
  const [genDuration, setGenDuration] = useState<'month' | 'year' | 'lifetime'>('year');
  const [genClientName, setGenClientName] = useState('');

  // Settings State
  const [settingsForm, setSettingsForm] = useState(platformSettings);

  if (!isOpen) return null;

  // Platform Metrics
  const activeTenants = tenants.filter(t => t.subscriptionStatus !== 'expired' && t.subscriptionStatus !== 'suspended');
  const estimatedMRR = tenants.reduce((acc, t) => {
    const plan = plans.find(p => p.id === t.subscriptionPlanId);
    return acc + (plan ? plan.price : 49);
  }, 0);
  const totalPlatformVolume = tenants.reduce((acc, t) => acc + t.totalRevenue, 0);
  const totalPlatformOrders = tenants.reduce((acc, t) => acc + t.totalOrders, 0);

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
    onShowToast('تم نسخ النص بنجاح إلى الحافظة! 📋');
  };

  const handleExtendSubscription = (tenantId: string, days: number) => {
    const updated = tenants.map(t => {
      if (t.id === tenantId) {
        const currentDate = t.subscriptionExpiryDate ? new Date(t.subscriptionExpiryDate) : new Date();
        currentDate.setDate(currentDate.getDate() + days);
        const newExpiry = currentDate.toISOString().split('T')[0];
        return {
          ...t,
          subscriptionStatus: 'active' as const,
          subscriptionExpiryDate: newExpiry,
        };
      }
      return t;
    });

    onUpdateTenants(updated);
    onShowToast(`تم تمديد اشتراك المتجر بنجاح لمدة ${days} يوماً! 🚀`);
  };

  const handleChangePlan = (tenantId: string, planId: string) => {
    const selectedPlan = plans.find(p => p.id === planId);
    const updated = tenants.map(t => {
      if (t.id === tenantId) {
        return {
          ...t,
          subscriptionPlanId: planId,
          subscriptionPlanName: selectedPlan ? selectedPlan.name : t.subscriptionPlanName,
        };
      }
      return t;
    });
    onUpdateTenants(updated);
    onShowToast(`تمت ترقية باقة المتجر إلى "${selectedPlan?.name}" بنجاح! 👑`);
  };

  const handleToggleTenantStatus = (tenantId: string) => {
    const updated = tenants.map(t => {
      if (t.id === tenantId) {
        const nextStatus = t.subscriptionStatus === 'active' ? 'suspended' : 'active';
        return {
          ...t,
          subscriptionStatus: nextStatus as 'active' | 'suspended',
        };
      }
      return t;
    });
    onUpdateTenants(updated);
    onShowToast('تم تحديث حالة حساب المشترك.');
  };

  const handleGenerateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    const plan = plans.find(p => p.id === genPlanId) || plans[0];
    
    // Generate distinct prefix based on plan
    const prefix = plan.id === 'plan-enterprise' ? 'ENT-VIP' : plan.id === 'plan-pro' ? 'PRO-SA' : 'START-SA';
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const code = `${prefix}-${randomHex}-${randomNum}-2026`;

    const now = new Date();
    const expiry = new Date();
    if (genDuration === 'month') {
      expiry.setDate(now.getDate() + 30);
    } else if (genDuration === 'year') {
      expiry.setDate(now.getDate() + 365);
    } else {
      expiry.setFullYear(now.getFullYear() + 10); // lifetime
    }

    const newKey: LicenseKey = {
      id: `lic-${Date.now().toString(36)}`,
      code,
      planId: plan.id,
      planName: plan.name,
      createdAt: now.toISOString().split('T')[0],
      expiresAt: expiry.toISOString().split('T')[0],
      status: 'available',
      assignedTenantName: genClientName.trim() || undefined,
    };

    onAddLicenseKey(newKey);
    setGenClientName('');
    onShowToast(`تم إنشاء كود الترخيص "${code}" بنجاح! يمكنك إرساله للعميل الآن. 🎉`);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePlatformSettings(settingsForm);
    onShowToast('تم حفظ إعدادات وهوية المنصة بنجاح! ⚙️');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div 
        className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-4 flex flex-col max-h-[92vh]"
        dir="rtl"
      >
        {/* Super Admin Top Header */}
        <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-white">
                  بوابة مالك المنصة والتراخيص (Super Admin SaaS)
                </h1>
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  مالك المنصة
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                إدارة باقات بيع المنصة للأسر والمطابخ، تفعيل المشتركين، وإصدار أكواد التراخيص
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick SaaS Metric Banner */}
        <div className="bg-slate-100/90 border-b border-gray-200 px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0 text-xs">
          <div className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-2xs">
            <span className="text-gray-500 block text-[11px] font-semibold">إجمالي المشتركين (المتاجر)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-slate-900">{tenants.length}</span>
              <span className="text-[10px] text-emerald-600 font-bold">({activeTenants.length} نشط)</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-2xs">
            <span className="text-gray-500 block text-[11px] font-semibold">الإيراد الشهري المتكرر (MRR)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-amber-600">{estimatedMRR.toLocaleString('ar-SA')}</span>
              <span className="text-[10px] text-gray-500">ر.س / شهر</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-2xs">
            <span className="text-gray-500 block text-[11px] font-semibold">مبيعات المتاجر عبر النظام</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-emerald-700">{totalPlatformVolume.toLocaleString('ar-SA')}</span>
              <span className="text-[10px] text-gray-500">ر.س</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-2xs">
            <span className="text-gray-500 block text-[11px] font-semibold">التراخيص المتاحة للبيع</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-indigo-700">
                {licenseKeys.filter(k => k.status === 'available').length}
              </span>
              <span className="text-[10px] text-gray-500">كود جاهز للبيع</span>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-gray-200 bg-white shrink-0 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('tenants')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'tenants' 
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg' 
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>المشتركين وأصحاب المتاجر ({tenants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('licenses')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'licenses' 
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg' 
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>توليد وإدارة التراخيص ({licenseKeys.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'plans' 
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg' 
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>باقات بيع المنصة والأسعار ({plans.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'settings' 
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg' 
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>إعدادات العلامة البيضاء والحساب البنكي</span>
          </button>
        </div>

        {/* Tab Contents (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* TAB 1: Tenants & Clients List */}
          {activeTab === 'tenants' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="بحث باسم المتجر أو المالك أو المدينة..."
                    className="w-full pl-3 pr-9 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="text-xs text-gray-500">
                  💡 تلميح: يمكنك الدخول كأي تاجر بالضغط على اسمه أو تجديد اشتراكه فوراً
                </div>
              </div>

              {/* Tenants Table */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold">
                      <tr>
                        <th className="py-3 px-4">المتجر وصاحب المشروع</th>
                        <th className="py-3 px-4">المدينة والتواصل</th>
                        <th className="py-3 px-4">الباقة المشترك بها</th>
                        <th className="py-3 px-4">حالة الاشتراك والانتهاء</th>
                        <th className="py-3 px-4">إجمالي المبيعات</th>
                        <th className="py-3 px-4 text-center">إجراءات المالك</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredTenants.map((t) => {
                        const isExpired = t.subscriptionStatus === 'expired';
                        const isTrial = t.subscriptionStatus === 'trial';
                        const isSuspended = t.subscriptionStatus === 'suspended';

                        return (
                          <tr key={t.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={t.avatarImage}
                                  alt={t.name}
                                  className="w-9 h-9 rounded-xl object-cover border"
                                  style={{ borderColor: t.brandColor || '#d97706' }}
                                />
                                <div>
                                  <div className="font-extrabold text-gray-900">{t.name}</div>
                                  <div className="text-gray-500 text-[11px]">{t.ownerName}</div>
                                  <span className="text-[10px] text-gray-400 font-mono">
                                    وثيقة: {t.freelanceDocNumber || 'FL-معتمد'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div>
                                <span className="font-semibold text-gray-800">{t.city}</span>
                                <span className="text-gray-400"> - </span>
                                <span className="text-gray-500">{t.district}</span>
                              </div>
                              <div className="text-[11px] font-mono text-gray-600 ltr text-right mt-0.5">
                                {t.phone || t.whatsapp}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <select
                                value={t.subscriptionPlanId || 'plan-starter'}
                                onChange={(e) => handleChangePlan(t.id, e.target.value)}
                                className="text-xs bg-slate-50 border border-gray-200 rounded-lg px-2 py-1 font-bold text-gray-800 focus:bg-white focus:outline-none cursor-pointer"
                              >
                                {plans.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} ({p.price} ر.س)
                                  </option>
                                ))}
                              </select>
                              {t.licenseKey && (
                                <span className="block text-[10px] font-mono text-gray-400 mt-1">
                                  كود: {t.licenseKey}
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  {isSuspended ? (
                                    <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                      موقوف مؤقتاً
                                    </span>
                                  ) : isExpired ? (
                                    <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                      منتهي الصلاحية
                                    </span>
                                  ) : isTrial ? (
                                    <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                      تجربة مجانية
                                    </span>
                                  ) : (
                                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                      نشط وساري ✓
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-gray-500 flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-gray-400" />
                                  <span>ينتهي: {t.subscriptionExpiryDate || '2027-11-04'}</span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4 font-mono font-bold text-gray-900">
                              <div>{t.totalRevenue.toLocaleString('ar-SA')} ر.س</div>
                              <span className="text-[10px] text-gray-400 font-sans font-normal">
                                ({t.totalOrders} طلب منفذ)
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Extend 30 days */}
                                <button
                                  onClick={() => handleExtendSubscription(t.id, 30)}
                                  title="تمديد 30 يوماً"
                                  className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold transition cursor-pointer"
                                >
                                  + شهر
                                </button>

                                {/* Extend 1 Year */}
                                <button
                                  onClick={() => handleExtendSubscription(t.id, 365)}
                                  title="تمديد سنة كاملة"
                                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[11px] font-bold transition cursor-pointer"
                                >
                                  + سنة
                                </button>

                                {/* Switch / Enter Store */}
                                <button
                                  onClick={() => {
                                    onSelectTenant(t.id);
                                    onClose();
                                    onShowToast(`تم الانتقال للتحكم في متجر "${t.name}" بنجاح! 👨‍🍳`);
                                  }}
                                  title="الدخول وإدارة هذا المتجر"
                                  className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition cursor-pointer"
                                >
                                  <Store className="w-3.5 h-3.5" />
                                </button>

                                {/* Copy Storefront Link for Customer */}
                                <button
                                  onClick={() => {
                                    const url = `${window.location.origin}/?tenant=${t.id}&view=store`;
                                    handleCopyText(url, `store-${t.id}`);
                                  }}
                                  title="نسخ رابط متجر العميل لإرساله للمشتري"
                                  className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition cursor-pointer"
                                >
                                  {copiedKey === `store-${t.id}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: License Keys Generator */}
          {activeTab === 'licenses' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Generator Card */}
              <div className="bg-slate-50 border border-gray-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">
                      توليد كود ترخيص فوري (License Key)
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      لإصدار ترخيص لمن اشترى المنصة بحوالة بنكية أو كاش
                    </p>
                  </div>
                </div>

                <form onSubmit={handleGenerateLicense} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">
                      اسم العميل / المطبخ المشتري (اختياري):
                    </label>
                    <input
                      type="text"
                      value={genClientName}
                      onChange={(e) => setGenClientName(e.target.value)}
                      placeholder="مثال: مطبخ أطايب الجزيرة"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">
                      نوع الباقة المشتراة:
                    </label>
                    <select
                      value={genPlanId}
                      onChange={(e) => setGenPlanId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none font-bold"
                    >
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} - {p.price} ر.س / شهرياً
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">
                      مدة صلاحية الترخيص:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setGenDuration('month')}
                        className={`py-2 px-1 text-center rounded-xl border font-bold transition cursor-pointer ${
                          genDuration === 'month' 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        شهر (30 يوم)
                      </button>
                      <button
                        type="button"
                        onClick={() => setGenDuration('year')}
                        className={`py-2 px-1 text-center rounded-xl border font-bold transition cursor-pointer ${
                          genDuration === 'year' 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        سنة كاملة
                      </button>
                      <button
                        type="button"
                        onClick={() => setGenDuration('lifetime')}
                        className={`py-2 px-1 text-center rounded-xl border font-bold transition cursor-pointer ${
                          genDuration === 'lifetime' 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        مدى الحياة 👑
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold rounded-xl transition shadow-md shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>إصدار وتوليد كود الترخيص الآن</span>
                  </button>
                </form>
              </div>

              {/* License Keys List */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-gray-900">
                    أكواد التراخيص الصادرة ({licenseKeys.length})
                  </h3>
                  <span className="text-xs text-gray-500">
                    يمكن للعميل إدخال الكود في لوحة تحكمه لتفعيل باقته فوراً
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                  {licenseKeys.map((lic) => {
                    const isAvailable = lic.status === 'available';

                    return (
                      <div
                        key={lic.id}
                        className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isAvailable 
                            ? 'bg-white border-indigo-200 shadow-2xs hover:border-indigo-400' 
                            : 'bg-gray-50 border-gray-200 text-gray-500'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md select-all">
                              {lic.code}
                            </span>
                            {isAvailable ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                متاح وجاهز للتسليم
                              </span>
                            ) : (
                              <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                مستخدم بواسطة: {lic.assignedTenantName || 'متجر مسجل'}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-3">
                            <span className="font-semibold text-gray-700">{lic.planName}</span>
                            <span>•</span>
                            <span>صالح حتى: {lic.expiresAt}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyText(lic.code, lic.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            {copiedKey === lic.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>تم النسخ!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>نسخ الكود</span>
                              </>
                            )}
                          </button>

                          {/* Quick WhatsApp message to the buyer */}
                          <button
                            onClick={() => {
                              const msg = encodeURIComponent(
                                `مرحباً بك! 🎉\nتم إصدار ترخيص متجرك في ${platformSettings.platformName}:\n\n` +
                                `📋 الباقة: ${lic.planName}\n` +
                                `🔑 كود التفعيل: ${lic.code}\n` +
                                `📅 تاريخ الانتهاء: ${lic.expiresAt}\n\n` +
                                `يمكنك تفعيل الكود فوراً من لوحة تحكم متجرك والبدء في استقبال طلباتك بكل سهولة!`
                              );
                              window.open(`https://wa.me/?text=${msg}`, '_blank');
                            }}
                            title="إرسال بيانات الترخيص للعميل عبر الواتساب"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: SaaS Subscription Plans */}
          {activeTab === 'plans' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">
                    باقات بيع المنصة والاشتراكات المقترحة
                  </h3>
                  <p className="text-xs text-gray-500">
                    هذه الباقات تظهر للعملاء الجدد عند فتح رابط المنصة لشراء متجرهم
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {plans.map((p) => (
                  <div
                    key={p.id}
                    className={`rounded-3xl p-5 border flex flex-col justify-between transition-all ${
                      p.popular 
                        ? 'border-indigo-500 bg-gradient-to-b from-indigo-50/40 via-white to-white shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500' 
                        : 'border-gray-200 bg-white shadow-xs'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500">{p.nameEn}</span>
                        {p.badge && (
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                            p.popular ? 'bg-indigo-600 text-white' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {p.badge}
                          </span>
                        )}
                      </div>

                      <h4 className="font-black text-lg text-gray-900">{p.name}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">{p.description}</p>

                      <div className="flex items-baseline gap-1 py-2 border-y border-gray-100">
                        <span className="text-3xl font-black text-gray-900">{p.price}</span>
                        <span className="text-xs text-gray-500 font-bold">ر.س / شهرياً</span>
                        {p.originalPrice && (
                          <span className="text-xs text-gray-400 line-through mr-2">
                            {p.originalPrice} ر.س
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-bold text-gray-900 block">مميزات الباقة:</span>
                        <ul className="space-y-1.5 text-xs text-gray-700">
                          {p.features.map((feat, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-gray-100 text-center">
                      <span className="text-[11px] text-gray-500">
                        العمولة: <span className="font-bold text-emerald-600">0% بدون استقطاع</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: White-Label & Bank Settings */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="max-w-2xl mx-auto space-y-4 text-xs">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                <Building2 className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-amber-900">
                  <h4 className="font-bold text-sm">تخصيص علامتك التجارية ومعلومات التحويل</h4>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    عندما يشتري منك أي عميل اشتراك في المنصة، سيظهر له اسم علامتك التجارية وبيانات حسابك البنكي لاستقبال التحويلات المالية للاشتراكات.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 font-bold mb-1">اسم المنصة التجاري:</label>
                  <input
                    type="text"
                    value={settingsForm.platformName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, platformName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-gray-700 font-bold mb-1">وصف المنصة التسويقي:</label>
                  <input
                    type="text"
                    value={settingsForm.platformSubtitle}
                    onChange={(e) => setSettingsForm({ ...settingsForm, platformSubtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">واتساب المبيعات والدعم:</label>
                  <input
                    type="text"
                    value={settingsForm.supportWhatsapp}
                    onChange={(e) => setSettingsForm({ ...settingsForm, supportWhatsapp: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none font-mono text-left ltr"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">البريد الإلكتروني للمبيعات:</label>
                  <input
                    type="email"
                    value={settingsForm.supportEmail}
                    onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none font-mono text-left ltr"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">اسم البنك المعتمد:</label>
                  <input
                    type="text"
                    value={settingsForm.bankName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bankName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                    placeholder="مثال: مصرف الراجحي"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">اسم المستفيد من الحساب:</label>
                  <input
                    type="text"
                    value={settingsForm.accountHolder}
                    onChange={(e) => setSettingsForm({ ...settingsForm, accountHolder: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                    placeholder="مؤسسة فلان لتقنية المعلومات"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-gray-700 font-bold mb-1">رقم الآيبان البنكي (IBAN):</label>
                  <input
                    type="text"
                    value={settingsForm.ibanNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, ibanNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none font-mono text-left ltr"
                    placeholder="SA0000000000000000000000"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  حفظ إعدادات المنصة والعلامة البيضاء
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-3.5 flex items-center justify-between text-xs shrink-0">
          <span className="text-gray-500">
            النظام جاهز تماماً لبيع التراخيص والاشتراكات لأي عدد من الأسر والمطابخ 🚀
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
