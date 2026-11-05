import React, { useState } from 'react';
import { 
  Store, 
  ChevronDown, 
  Plus, 
  ExternalLink, 
  Share2, 
  ChefHat, 
  CheckCircle, 
  MapPin, 
  BadgeCheck, 
  Power,
  Sparkles,
  Clock,
  Phone,
  MessageCircle,
  Settings,
  Crown,
  KeyRound,
  ShieldCheck,
  Zap,
  ShoppingBag
} from 'lucide-react';
import { Tenant } from '../types';
import { isTenantOpenNow } from '../utils/scheduleHelper';

interface HeaderProps {
  tenants: Tenant[];
  currentTenant: Tenant;
  onSelectTenant: (tenantId: string) => void;
  onToggleStoreStatus: () => void;
  onOpenAddMeal: () => void;
  onOpenCustomerPreview: () => void;
  onOpenShareModal: () => void;
  onAddNewTenant: () => void;
  onOpenScheduleModal: () => void;
  onOpenSuperAdmin: () => void;
  onOpenSaaSPricing: () => void;
  onOpenLicenseModal: () => void;
  onOpenQuickGuide: () => void;
  onOpenDigitalSeller: () => void;
}


export const Header: React.FC<HeaderProps> = ({
  tenants,
  currentTenant,
  onSelectTenant,
  onToggleStoreStatus,
  onOpenAddMeal,
  onOpenCustomerPreview,
  onOpenShareModal,
  onAddNewTenant,
  onOpenScheduleModal,
  onOpenSuperAdmin,
  onOpenSaaSPricing,
  onOpenLicenseModal,
  onOpenQuickGuide,
  onOpenDigitalSeller,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const statusInfo = isTenantOpenNow(currentTenant);

  return (
    <header className="bg-white border-b border-gray-200/80 sticky top-0 z-30 shadow-xs">
      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Right: Tenant Profile & Switcher */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={currentTenant.avatarImage}
                alt={currentTenant.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 shadow-xs transition-colors"
                style={{ borderColor: currentTenant.brandColor || '#d97706' }}
              />
              <span 
                className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full border-2 border-white ${
                  statusInfo.isOpen ? 'bg-emerald-500' : 'bg-rose-500'
                }`} 
                title={statusInfo.isOpen ? 'المتجر مفتوح' : 'المتجر مغلق'}
              />
            </div>

            {/* Tenant Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 text-right group p-1.5 -m-1.5 rounded-xl hover:bg-gray-50 transition"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="font-extrabold text-gray-900 text-base sm:text-lg group-hover:text-amber-600 transition">
                      {currentTenant.name}
                    </h1>
                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-600" />
                      <span>{currentTenant.city} - {currentTenant.district}</span>
                    </span>
                    <span>•</span>
                    <span className="bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded-md text-[10px]">
                      {currentTenant.type === 'sweets' 
                        ? 'أسرة منتجة (حلويات وضيافة)' 
                        : currentTenant.type === 'mufarzanat' 
                        ? 'أسرة منتجة (مفرزنات ومؤونة)' 
                        : 'أسرة منتجة (طبخ منزلي)'}
                    </span>
                    {currentTenant.phone && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-600 font-mono">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span className="ltr text-left">{currentTenant.phone}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={() => setDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-30 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-xs font-bold text-gray-400 border-b border-gray-100">
                      قائمة الأسر المنتجة المسجلة
                    </div>
                    {tenants.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          onSelectTenant(t.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-right flex items-center justify-between hover:bg-amber-50 transition ${
                          t.id === currentTenant.id ? 'bg-amber-50/60 font-bold text-amber-900' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <img 
                            src={t.avatarImage} 
                            alt="" 
                            className="w-7 h-7 rounded-lg object-cover shrink-0" 
                          />
                          <div className="truncate">
                            <div className="text-xs truncate">{t.name}</div>
                            <div className="text-[10px] text-gray-400">{t.city} - {t.ownerName}</div>
                          </div>
                        </div>
                        {t.id === currentTenant.id && (
                          <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                      </button>
                    ))}

                    <div className="pt-2 mt-1 border-t border-gray-100 px-2">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onAddNewTenant();
                        }}
                        className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-amber-600 hover:bg-amber-50 py-1.5 rounded-lg transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>تسجيل أسرة منتجة جديدة</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Left: Quick Actions and Status */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Open / Close Kitchen Store Status Badge & Override */}
            <button
              onClick={onToggleStoreStatus}
              title={currentTenant.autoScheduleEnabled ? 'انقر للتبديل اليدوي أو ضبط ساعات العمل' : 'انقر لتغيير حالة المتجر'}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                statusInfo.isOpen
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{statusInfo.statusLabel}</span>
            </button>

            {/* Store Brand Color, Schedule & Contact Settings */}
            <button
              onClick={onOpenScheduleModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-amber-300 bg-amber-50/80 hover:bg-amber-100 text-amber-900 transition"
              title="تخصيص لون الهوية (Brand Color)، ساعات العمل، وأرقام التواصل"
            >
              <span 
                className="w-3 h-3 rounded-full border border-black/20 shrink-0 shadow-xs" 
                style={{ backgroundColor: currentTenant.brandColor || '#d97706' }} 
              />
              <Settings className="w-3.5 h-3.5 text-amber-600" />
              <span>إعدادات المتجر والهوية</span>
            </button>

            {/* Share Menu / QR */}
            <button
              onClick={onOpenShareModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition"
              title="مشاركة رابط المنيو والباركود"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">مشاركة المنيو</span>
            </button>

            {/* View as Customer */}
            <button
              onClick={onOpenCustomerPreview}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-900 hover:bg-black text-white transition shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>معاينة متجر العميل</span>
            </button>

            {/* Add New Meal */}
            <button
              onClick={onOpenAddMeal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/20 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة طبخة منزلية</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
