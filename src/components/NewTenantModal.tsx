import React, { useState } from 'react';
import { X, Store, MapPin, BadgeCheck, ChefHat } from 'lucide-react';
import { Tenant } from '../types';

import { DEFAULT_WEEK_SCHEDULE } from '../utils/scheduleHelper';

interface NewTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTenant: (tenant: Tenant) => void;
}

export const NewTenantModal: React.FC<NewTenantModalProps> = ({
  isOpen,
  onClose,
  onAddTenant,
}) => {
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [type, setType] = useState<Tenant['type']>('family');
  const [city, setCity] = useState('الرياض');
  const [district, setDistrict] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [freelanceDocNumber, setFreelanceDocNumber] = useState('');
  const [brandColor, setBrandColor] = useState('#d97706');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newTenant: Tenant = {
      id: `tenant-${Date.now().toString(36)}`,
      name: name.trim(),
      ownerName: ownerName.trim() || 'صاحب المتجر',
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
      freelanceDocNumber: freelanceDocNumber.trim() || `FL-${Math.floor(10000000 + Math.random() * 90000000)}`,
      bannerImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      avatarImage: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80',
      brandColor,
    };

    onAddTenant(newTenant);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-4 p-6 space-y-5"
        dir="rtl"
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                تسجيل أسرة منتجة جديدة (مطبخ منزلي)
              </h2>
              <p className="text-xs text-gray-500">
                إضافة مشروع أسرة منتجة جديد، توثيق العمل الحر، وإدارة قائمة الطبخ
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">
              اسم مشروع الأسرة المنتجة / المطبخ المنزلي <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً: مطبخ أم عبد العزيز، أطايب نجد، حلا البيت الفاخر"
              className="w-full text-sm p-2.5 border border-gray-200 rounded-xl outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">مجال ونشاط الأسرة</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Tenant['type'])}
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none bg-white"
              >
                <option value="family">أكلات شعبية وطبخ منزلي</option>
                <option value="mufarzanat">مفرزنات ومؤونة طعام</option>
                <option value="sweets">حلويات ومعجنات وضيافة قهوة</option>
                <option value="artisan">طهي حرفي وتراثي أصيل</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">اسم رائدة العمل / الطاهية</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="مثلاً: أم عبد العزيز، نورة العتيبي"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">المدينة</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none bg-white"
              >
                <option value="الرياض">الرياض</option>
                <option value="جدة">جدة</option>
                <option value="مكة المكرمة">مكة المكرمة</option>
                <option value="المدينة المنورة">المدينة المنورة</option>
                <option value="الدمام">الدمام</option>
                <option value="الخبر">الخبر</option>
                <option value="بريدة">بريدة</option>
                <option value="أبها">أبها</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">الحي السكني</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="مثلاً: حي النرجس، حي الصفا"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">رقم الجوال للتواصل</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none font-mono text-left ltr"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">رقم الواتساب للطلبات</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="05XXXXXXXX"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none font-mono text-left ltr"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700">
                رقم وثيقة العمل الحر (منصة العمل الحر)
              </label>
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                معتمدة وموثقة
              </span>
            </div>
            <input
              type="text"
              value={freelanceDocNumber}
              onChange={(e) => setFreelanceDocNumber(e.target.value)}
              placeholder="FL-12345678"
              className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none font-mono text-left ltr"
            />
          </div>

          <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <span>🎨 لون الهوية للأسرة المنتجة (Brand Color)</span>
              </label>
              <span className="text-[11px] font-mono font-bold text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                {brandColor}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {['#d97706', '#059669', '#dc2626', '#ea580c', '#2563eb', '#7c3aed', '#db2777', '#1f2937'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setBrandColor(c)}
                  className={`w-6 h-6 rounded-full border transition cursor-pointer ${
                    brandColor.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-gray-900 scale-110' : 'border-black/10'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0 mr-auto"
                title="تخصيص لون آخر"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs transition"
            >
              إنشاء وتفعيل حساب الأسرة المنتجة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
