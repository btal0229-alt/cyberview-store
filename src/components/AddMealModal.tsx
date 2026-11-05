import React, { useState } from 'react';
import { X, Check, Image as ImageIcon, Upload, Loader2, Info, CheckCircle2 } from 'lucide-react';
import { Product, StoreCategory } from '../types';
import { DEFAULT_CATEGORIES } from '../utils/categories';
import { FOOD_PRESET_IMAGES } from '../data/mockData';
import { licenseHeaders } from '../utils/license';

/** Shrinks a phone photo in the browser so uploads stay fast and light. */
async function resizeImage(file: File, maxSize: number, quality: number): Promise<Blob> {
  const bitmapUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('decode'));
      el.src = bitmapUrl;
    });
    const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error('encode'))), 'image/jpeg', quality));
  } finally {
    URL.revokeObjectURL(bitmapUrl);
  }
}

const blobToDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(blob);
});

export type SimpleProductInput = Pick<Product, 'name' | 'price' | 'category' | 'imageUrl'>;

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeal: (productData: SimpleProductInput) => void;
  tenantId: string;
  initialMeal?: Product | null;
  categories?: StoreCategory[];
}

const field = 'w-full border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 px-3 py-3 rounded-xl outline-none text-gray-900 text-base transition bg-white';

export const AddMealModal: React.FC<AddMealModalProps> = ({ isOpen, onClose, onAddMeal, initialMeal, categories = DEFAULT_CATEGORIES }) => {
  const [name, setName] = useState(initialMeal?.name || '');
  const [price, setPrice] = useState<string>(initialMeal ? String(initialMeal.price) : '');
  const [category, setCategory] = useState<Product['category']>(
    initialMeal && categories.some(c => c.id === initialMeal.category) ? initialMeal.category : (categories[0]?.id ?? ''),
  );
  const [imageUrl, setImageUrl] = useState(initialMeal?.imageUrl || '');
  const [showLibrary, setShowLibrary] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleImageFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setErrorMsg('الملف المختار ليس صورة.'); return; }
    setErrorMsg('');
    setUploading(true);
    try {
      let blob: Blob;
      try { blob = await resizeImage(file, 1280, 0.85); } catch { blob = file; }
      try {
        const res = await fetch('/api/meal-images/upload', {
          method: 'POST',
          headers: { 'Content-Type': blob.type || 'image/jpeg', ...licenseHeaders() },
          body: blob,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || typeof data.url !== 'string') throw new Error(data.error || 'upload');
        setImageUrl(data.url);
      } catch {
        // Keep working even without a connection by embedding a small copy of the photo.
        const small = await resizeImage(file, 720, 0.7).catch(() => blob);
        setImageUrl(await blobToDataUrl(small));
      }
    } catch {
      setErrorMsg('تعذر قراءة الصورة، جرّب صورة أخرى.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) return setErrorMsg('انتظر حتى يكتمل رفع الصورة.');
    if (!name.trim()) return setErrorMsg('اكتب اسم المنتج.');
    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) return setErrorMsg('اكتب سعراً صحيحاً.');
    setErrorMsg('');
    onAddMeal({
      name: name.trim(),
      price: numericPrice,
      category,
      imageUrl: imageUrl.trim() || PRESET_FOR[category] || FOOD_PRESET_IMAGES[1].url,
    });
    setSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[95vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-extrabold text-gray-900">{initialMeal ? 'تعديل المنتج' : 'إضافة منتج'}</h2>
          <button type="button" onClick={onClose} aria-label="إغلاق" className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {errorMsg && (
            <p role="alert" className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />{errorMsg}
            </p>
          )}

          {/* Image */}
          <div className="space-y-2">
            <span className="block text-sm font-bold text-gray-700">الصورة</span>
            <label className={`relative block aspect-video rounded-2xl overflow-hidden border-2 border-dashed cursor-pointer ${imageUrl ? 'border-transparent' : 'border-gray-300 bg-gray-50'}`}>
              {imageUrl ? (
                <img src={imageUrl} alt="صورة المنتج" className="w-full h-full object-cover" />
              ) : (
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500">
                  <Upload className="w-7 h-7 text-amber-600" />
                  <span className="text-sm font-bold">اضغط لاختيار صورة من الهاتف</span>
                </span>
              )}
              {uploading && (
                <span className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                </span>
              )}
              {imageUrl && !uploading && (
                <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full">تغيير الصورة</span>
              )}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={uploading}
                onChange={(e) => { void handleImageFile(e.target.files?.[0]); e.target.value = ''; }}
              />
            </label>
            <button
              type="button"
              onClick={() => setShowLibrary(v => !v)}
              className="flex items-center gap-1.5 text-sm font-bold text-amber-700"
            >
              <ImageIcon className="w-4 h-4" />
              {showLibrary ? 'إخفاء الصور الجاهزة' : 'أو اختر صورة جاهزة'}
            </button>
            {showLibrary && (
              <div className="grid grid-cols-3 gap-2">
                {FOOD_PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => { setImageUrl(preset.url); setShowLibrary(false); }}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 ${imageUrl === preset.url ? 'border-amber-500' : 'border-transparent'}`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" loading="lazy" />
                    {imageUrl === preset.url && (
                      <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center"><Check className="w-3 h-3" /></span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Name */}
          <label className="block space-y-1.5">
            <span className="block text-sm font-bold text-gray-700">اسم المنتج</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً: كبسة لحم" maxLength={120} className={field} autoComplete="off" />
          </label>

          {/* Price */}
          <label className="block space-y-1.5">
            <span className="block text-sm font-bold text-gray-700">السعر</span>
            <div className="relative">
              <input type="number" inputMode="decimal" min="0" step="any" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" className={field + ' pl-12 font-bold'} />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">ر.س</span>
            </div>
          </label>

          {/* Category */}
          <div className="space-y-1.5">
            <span className="block text-sm font-bold text-gray-700">القسم</span>
            {categories.length === 0 && (
              <p className="text-xs text-gray-500">لا توجد أقسام بعد. أضف قسماً من «إضافة قسم» في قائمة المنتجات، وسيظهر المنتج تحت «أخرى» حتى ذلك الحين.</p>
            )}
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`px-4 py-2.5 rounded-full text-sm font-bold border transition ${category === c.id ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
                >
                  {c.emoji ? `${c.emoji} ` : ''}{c.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading || saved}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] disabled:opacity-70 text-white font-extrabold text-base transition"
          >
            {saved ? <><CheckCircle2 className="w-5 h-5" />تم الحفظ</> : initialMeal ? 'حفظ التعديلات' : 'إضافة المنتج'}
          </button>
        </form>
      </div>
    </div>
  );
};

const PRESET_FOR: Record<string, string | undefined> = {
  main: FOOD_PRESET_IMAGES[1].url,
  appetizers: FOOD_PRESET_IMAGES[0].url,
  sweets: FOOD_PRESET_IMAGES[6].url,
  bakery: FOOD_PRESET_IMAGES[5].url,
  drinks: FOOD_PRESET_IMAGES[8].url,
};
