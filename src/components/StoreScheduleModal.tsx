import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Calendar, 
  Phone, 
  MessageCircle, 
  Instagram, 
  Check, 
  Copy, 
  Sparkles, 
  Info, 
  ShieldCheck, 
  AlertTriangle,
  Palette,
  Eye,
  CheckCheck
} from 'lucide-react';
import { Tenant, DaySchedule, DayKey } from '../types';
import { DEFAULT_WEEK_SCHEDULE, isTenantOpenNow, formatTimeArabic } from '../utils/scheduleHelper';

interface StoreScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  onSaveTenantSettings: (updatedTenant: Tenant) => void;
}

export const PRESET_BRAND_COLORS = [
  { name: 'عنبري ذهبي', hex: '#d97706', description: 'أكلات شعبية وتراثية' },
  { name: 'أخضر زمردي', hex: '#059669', description: 'صحي وطبيعي وطازج' },
  { name: 'أحمر عنابي', hex: '#dc2626', description: 'مشويات وبرجر ولحوم' },
  { name: 'برتقالي دافئ', hex: '#ea580c', description: 'معجنات وأطايب' },
  { name: 'أزرق نيلي', hex: '#2563eb', description: 'مطبخ سحابي عصري' },
  { name: 'بنفسجي ملكي', hex: '#7c3aed', description: 'حلويات فاخرة وترافل' },
  { name: 'وردي أنيق', hex: '#db2777', description: 'كيك ومخبوزات ومشروبات' },
  { name: 'فحم راقي', hex: '#1f2937', description: 'جورميه وأطباق راقية' },
];

export const StoreScheduleModal: React.FC<StoreScheduleModalProps> = ({
  isOpen,
  onClose,
  tenant,
  onSaveTenantSettings,
}) => {
  const [phone, setPhone] = useState(tenant.phone || '');
  const [whatsapp, setWhatsapp] = useState(tenant.whatsapp || '');
  const [instagram, setInstagram] = useState(tenant.instagram || '');
  const [brandColor, setBrandColor] = useState(tenant.brandColor || '#d97706');
  const [autoScheduleEnabled, setAutoScheduleEnabled] = useState(
    tenant.autoScheduleEnabled !== undefined ? tenant.autoScheduleEnabled : true
  );
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    tenant.schedule && tenant.schedule.length > 0 ? tenant.schedule : DEFAULT_WEEK_SCHEDULE
  );

  if (!isOpen) return null;

  // Live status calculation with modified state
  const tempTenant: Tenant = {
    ...tenant,
    phone,
    whatsapp,
    instagram,
    brandColor,
    autoScheduleEnabled,
    schedule,
  };
  const currentStatus = isTenantOpenNow(tempTenant);

  const handleDayToggle = (dayKey: DayKey) => {
    setSchedule(prev => prev.map(day => 
      day.key === dayKey ? { ...day, isOpen: !day.isOpen } : day
    ));
  };

  const handleTimeChange = (dayKey: DayKey, field: 'openTime' | 'closeTime', value: string) => {
    setSchedule(prev => prev.map(day => 
      day.key === dayKey ? { ...day, [field]: value } : day
    ));
  };

  const handleApplyToAll = (sourceDayKey: DayKey) => {
    const source = schedule.find(d => d.key === sourceDayKey);
    if (!source) return;

    setSchedule(prev => prev.map(day => ({
      ...day,
      isOpen: source.isOpen,
      openTime: source.openTime,
      closeTime: source.closeTime,
    })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Tenant = {
      ...tenant,
      phone: phone.trim(),
      whatsapp: whatsapp.trim(),
      instagram: instagram.trim(),
      brandColor: brandColor.trim() || '#d97706',
      autoScheduleEnabled,
      schedule,
      // If auto schedule is enabled, also sync isOpen with current schedule
      isOpen: autoScheduleEnabled ? currentStatus.isOpen : tenant.isOpen,
    };

    onSaveTenantSettings(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-6 transition-all"
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-gradient-to-l from-amber-600 via-amber-700 to-amber-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
              ⚙️
            </div>
            <div>
              <h2 className="text-lg font-bold">
                إعدادات المتجر والهوية وساعات العمل
              </h2>
              <p className="text-xs text-amber-200">
                تخصيص لون الهوية (Brand Color)، أوقات الإغلاق التلقائي، وأرقام التواصل لـ: {tenant.name}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Live Status Badge Bar */}
        <div className="bg-amber-50 px-6 py-3 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${currentStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="font-bold text-gray-800">حالة المتجر حالياً:</span>
            <span className={`font-extrabold ${currentStatus.isOpen ? 'text-emerald-700' : 'text-rose-700'}`}>
              {currentStatus.statusLabel}
            </span>
          </div>
          <div className="text-gray-500 text-[11px]">
            {currentStatus.todayScheduleText}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: Brand Color (لون الهوية والعلامة التجارية للمتجر) */}
          <div className="space-y-4 bg-gray-50/70 p-4.5 rounded-2xl border border-gray-200/80">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <Palette className="w-4 h-4 text-amber-600" />
                <span>لون الهوية والعلامة التجارية (Brand Color)</span>
              </div>
              <div className="flex items-center gap-2">
                <span 
                  className="w-4 h-4 rounded-full border border-black/20 shadow-xs" 
                  style={{ backgroundColor: brandColor }}
                />
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border border-gray-200 bg-white text-gray-700">
                  {brandColor}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              اختر اللون الأساسي المميز لمتجرك؛ ليتم تطبيقه فوراً وديناميكياً على واجهة المنيو، تصنيفات الوجبات، زر السلة، وإتمام الطلب في واجهة العميل (CustomerMenuPreview).
            </p>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESET_BRAND_COLORS.map(preset => {
                const isSelected = brandColor.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setBrandColor(preset.hex)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-right transition cursor-pointer ${
                      isSelected
                        ? 'bg-white border-gray-900 shadow-sm ring-2 ring-gray-900/10'
                        : 'bg-white/80 border-gray-200 hover:border-gray-300 hover:bg-white'
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center shadow-xs border border-black/10"
                      style={{ backgroundColor: preset.hex }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </span>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-gray-900 truncate">{preset.name}</div>
                      <div className="text-[10px] text-gray-400 truncate">{preset.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Color Picker Input */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-200/80 bg-white p-3 rounded-xl border">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="custom-color-picker"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-gray-200 p-0.5 bg-white shadow-xs shrink-0"
                />
                <div>
                  <label htmlFor="custom-color-picker" className="text-xs font-bold text-gray-900 block cursor-pointer">
                    تخصيص لون بدرجة دقيقة (Custom Hex)
                  </label>
                  <span className="text-[11px] text-gray-500">انقر لاختيار أي درجة لون مخصصة لعلامتك التجارية</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs text-gray-400 font-bold">كود اللون:</span>
                <input
                  type="text"
                  value={brandColor}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.startsWith('#') || val === '') {
                      setBrandColor(val);
                    } else {
                      setBrandColor('#' + val);
                    }
                  }}
                  placeholder="#d97706"
                  maxLength={7}
                  className="w-24 text-center font-mono font-bold text-xs p-1.5 border border-gray-300 rounded-lg outline-none focus:border-amber-500 uppercase"
                />
              </div>
            </div>

            {/* Live Interactive Preview Box */}
            <div className="rounded-xl border border-dashed border-gray-300 p-3 bg-white/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-gray-500" />
                  <span>معاينة فورية لعناصر واجهة العميل بهذا اللون:</span>
                </span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5" />
                  تأثير فوري على المتجر
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <span
                  className="text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xs flex items-center gap-1 transition-colors"
                  style={{ backgroundColor: brandColor }}
                >
                  <Sparkles className="w-3 h-3" />
                  تصنيف نشط
                </span>

                <button
                  type="button"
                  className="text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-default"
                  style={{ backgroundColor: brandColor }}
                >
                  + إضافة للطلب
                </button>

                <div 
                  className="text-xs font-extrabold px-2.5 py-1 rounded-lg border transition-colors"
                  style={{ color: brandColor, borderColor: `${brandColor}40`, backgroundColor: `${brandColor}15` }}
                >
                  45.00 ر.س
                </div>

                <div 
                  className="text-[11px] font-bold px-2 py-0.5 rounded-md border"
                  style={{ color: brandColor, borderColor: `${brandColor}50` }}
                >
                  تكفي 3 أشخاص
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Details (رقم الجوال والتواصل) */}
          <div className="space-y-4 bg-gray-50/70 p-4 rounded-2xl border border-gray-200/80">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 border-b border-gray-200 pb-2">
              <Phone className="w-4 h-4 text-amber-600" />
              <span>معلومات التواصل المباشر مع العملاء</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-500" />
                  <span>رقم جوال المتجر / الاتصال</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05XXXXXXXX"
                  className="w-full border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 p-2.5 rounded-xl outline-none text-gray-800 text-sm font-mono text-left ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>رقم الواتساب للطلبات</span>
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="05XXXXXXXX"
                  className="w-full border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 p-2.5 rounded-xl outline-none text-gray-800 text-sm font-mono text-left ltr"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                <span>حساب التواصل الاجتماعي (إنستغرام أو تيك توك)</span>
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@my_kitchen_sa"
                className="w-full border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 p-2.5 rounded-xl outline-none text-gray-800 text-sm font-mono text-left ltr"
              />
            </div>
          </div>

          {/* Section 2: Auto-Schedule Toggle */}
          <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-300/80 flex items-start gap-3">
            <input
              type="checkbox"
              id="auto-schedule-toggle"
              checked={autoScheduleEnabled}
              onChange={(e) => setAutoScheduleEnabled(e.target.checked)}
              className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 mt-0.5 cursor-pointer"
            />
            <div className="space-y-1">
              <label htmlFor="auto-schedule-toggle" className="text-sm font-bold text-gray-900 cursor-pointer block">
                تفعيل الإغلاق والفتح التلقائي للمتجر حسب ساعات العمل اليومية
              </label>
              <p className="text-xs text-gray-600 leading-relaxed">
                عند تفعيل هذا الخيار، سيتم قفل استقبال الطلبات في متجرك تلقائياً خارج أوقات العمل، وسيظهر للزبائن موعد الفتح القادم.
              </p>
            </div>
          </div>

          {/* Section 3: Daily Operating Hours (7 Days of the week) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>أوقات العمل لكل يوم في الأسبوع</span>
              </div>
              <button
                type="button"
                onClick={() => handleApplyToAll('sun')}
                className="text-xs text-amber-700 hover:text-amber-900 font-bold underline flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>نسخ أوقات الأحد لكل الأسبوع</span>
              </button>
            </div>

            <div className="space-y-2 border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
              {schedule.map((day) => (
                <div 
                  key={day.key} 
                  className={`p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                    day.isOpen ? 'bg-white' : 'bg-gray-100/70 opacity-75'
                  }`}
                >
                  {/* Day Label & On/Off toggle */}
                  <div className="flex items-center gap-3 w-36 shrink-0">
                    <input
                      type="checkbox"
                      id={`day-${day.key}`}
                      checked={day.isOpen}
                      onChange={() => handleDayToggle(day.key)}
                      className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                    />
                    <label 
                      htmlFor={`day-${day.key}`}
                      className={`text-sm font-bold cursor-pointer ${day.isOpen ? 'text-gray-900' : 'text-gray-400 line-through'}`}
                    >
                      {day.label}
                    </label>
                  </div>

                  {/* Hours inputs or Closed badge */}
                  {day.isOpen ? (
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <span>من:</span>
                        <input
                          type="time"
                          value={day.openTime}
                          onChange={(e) => handleTimeChange(day.key, 'openTime', e.target.value)}
                          className="border border-gray-200 rounded-lg p-1.5 text-xs font-mono font-bold text-gray-800 bg-white"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <span>إلى:</span>
                        <input
                          type="time"
                          value={day.closeTime}
                          onChange={(e) => handleTimeChange(day.key, 'closeTime', e.target.value)}
                          className="border border-gray-200 rounded-lg p-1.5 text-xs font-mono font-bold text-gray-800 bg-white"
                        />
                      </div>
                      <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-1 rounded-md hidden md:inline">
                        ({formatTimeArabic(day.openTime)} - {formatTimeArabic(day.closeTime)})
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end flex-1">
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg">
                        عطلة أسبوعية مغلقة
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition text-sm"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold shadow-md shadow-amber-500/20 transition text-sm cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>حفظ إعدادات المتجر ولون الهوية</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
