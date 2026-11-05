import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Clock, 
  Flame, 
  Star, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Filter, 
  LayoutGrid, 
  Table as TableIcon,
  Sparkles,
  UtensilsCrossed,
  Eye,
  ShoppingBag,
  Users
} from 'lucide-react';
import { Product, StoreCategory } from '../types';
import { UNCATEGORIZED, categoryLabel, isUncategorized } from '../utils/categories';

interface MealListProps {
  products: Product[];
  onAddNew: () => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onToggleAvailability: (productId: string) => void;
  onOpenMealReviews?: (productId?: string) => void;
  onDeleteDemo?: () => void;
  categories: StoreCategory[];
  onAddCategory: (label: string, emoji: string) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export const MealList: React.FC<MealListProps> = ({
  products,
  onAddNew,
  onEdit,
  onDelete,
  onToggleAvailability,
  onOpenMealReviews,
  onDeleteDemo,
  categories,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [newCategoryEmoji, setNewCategoryEmoji] = useState('');
  const [categoryDeleteId, setCategoryDeleteId] = useState<string | null>(null);

  const hasUncategorized = products.some(p => isUncategorized(categories, p));
  const CATEGORIES = [
    { id: 'all', label: 'الكل', deletable: false },
    ...categories.map(c => ({ id: c.id, label: categoryLabel(categories, c.id), deletable: true })),
    ...(hasUncategorized ? [{ id: UNCATEGORIZED.id, label: categoryLabel([], ''), deletable: false }] : []),
  ];
  const countFor = (id: string) => id === 'all' ? products.length
    : id === '' ? products.filter(p => isUncategorized(categories, p)).length
    : products.filter(p => p.category === id).length;

  const categoryIdsKey = CATEGORIES.map(c => c.id).join('|');
  React.useEffect(() => {
    if (!CATEGORIES.some(c => c.id === selectedCategory)) setSelectedCategory('all');
  }, [categoryIdsKey, selectedCategory]);

  const submitNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const label = newCategoryLabel.trim();
    if (!label) return;
    onAddCategory(label, newCategoryEmoji.trim());
    setNewCategoryLabel('');
    setNewCategoryEmoji('');
    setIsAddingCategory(false);
  };


  // Filtered products calculation
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesCategory = selectedCategory === 'all'
        || (selectedCategory === '' ? isUncategorized(categories, prod) : prod.category === selectedCategory);
      const matchesSearch = 
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prod.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prod.servings && prod.servings.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesAvailability = 
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && prod.isAvailable) ||
        (availabilityFilter === 'unavailable' && !prod.isAvailable);

      return matchesCategory && matchesSearch && matchesAvailability;
    });
  }, [products, categories, selectedCategory, searchQuery, availabilityFilter]);

  const getCategoryName = (cat: Product['category']) => categoryLabel(categories, cat);
  const demoCount = products.filter(p => p.isDemo).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 sm:p-6 space-y-5">
      {/* Top Header of the Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-gray-900">
              منتجات المتجر
            </h2>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {products.length} منتج
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            أضف منتجاتك أو عدّلها أو احذفها بضغطة واحدة
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Reviews shortcut button */}
          {onOpenMealReviews && (
            <button
              onClick={() => onOpenMealReviews()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-yellow-300 bg-yellow-50/80 hover:bg-yellow-100 text-yellow-900 transition"
              title="عرض تقييمات ومراجعات العملاء للوجبات"
            >
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-500" />
              <span>تقييمات الوجبات</span>
            </button>
          )}

          {/* Switch View Mode */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl text-gray-600">
            <button
              onClick={() => setViewMode('grid')}
              title="عرض الشبكة"
              className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-white text-amber-600 shadow-xs' : 'hover:text-gray-900'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="عرض الجدول"
              className={`p-1.5 rounded-lg transition ${viewMode === 'table' ? 'bg-white text-amber-600 shadow-xs' : 'hover:text-gray-900'}`}
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Add New Meal Button */}
          <button
            onClick={onAddNew}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-amber-500/20 transition text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 pl-4 pr-10 py-2.5 rounded-xl text-sm outline-none transition"
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-3 text-xs text-gray-400 hover:text-gray-600"
              >
                مسح
              </button>
            )}
          </div>

          {/* Availability Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setAvailabilityFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${availabilityFilter === 'all' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              الكل ({products.length})
            </button>
            <button
              onClick={() => setAvailabilityFilter('available')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${availabilityFilter === 'available' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-gray-600 hover:text-emerald-700'}`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>المتوفر ({products.filter(p => p.isAvailable).length})</span>
            </button>
            <button
              onClick={() => setAvailabilityFilter('unavailable')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${availabilityFilter === 'unavailable' ? 'bg-white text-rose-700 shadow-xs font-bold' : 'text-gray-600 hover:text-rose-700'}`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>غير المتوفر ({products.filter(p => !p.isAvailable).length})</span>
            </button>
          </div>
        </div>

        {/* Categories Tabs + section management */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">الأقسام</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => {
              const count = countFor(cat.id);
              const isSelected = selectedCategory === cat.id;
              return (
                <div key={cat.id || 'other'} className={`flex items-center rounded-xl transition ${isSelected ? 'bg-amber-600 text-white shadow-xs' : 'bg-gray-100 text-gray-700'}`}>
                  <button
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${isSelected ? '' : 'hover:bg-gray-200'}`}
                  >
                    <span>{cat.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isSelected ? 'bg-amber-700 text-amber-100' : 'bg-gray-200 text-gray-600'}`}>
                      {count}
                    </span>
                  </button>
                  {cat.deletable && (
                    <button
                      onClick={() => setCategoryDeleteId(cat.id)}
                      title="حذف القسم"
                      aria-label={`حذف قسم ${cat.label}`}
                      className={`ml-1 mr-[-2px] w-6 h-6 rounded-lg flex items-center justify-center transition ${isSelected ? 'hover:bg-amber-700 text-amber-100' : 'hover:bg-rose-100 text-gray-400 hover:text-rose-600'}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
            {!isAddingCategory && (
              <button
                onClick={() => setIsAddingCategory(true)}
                className="whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold border border-dashed border-amber-500 text-amber-700 hover:bg-amber-50 flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة قسم</span>
              </button>
            )}
          </div>

          {isAddingCategory && (
            <form onSubmit={submitNewCategory} className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <input
                value={newCategoryEmoji}
                onChange={(e) => setNewCategoryEmoji(e.target.value)}
                placeholder="🍽️"
                maxLength={4}
                aria-label="رمز القسم (اختياري)"
                className="w-14 text-center border border-gray-300 rounded-lg px-2 py-2 text-sm bg-white outline-none focus:border-amber-500"
              />
              <input
                autoFocus
                value={newCategoryLabel}
                onChange={(e) => setNewCategoryLabel(e.target.value)}
                placeholder="اسم القسم، مثلاً: مشويات"
                maxLength={40}
                aria-label="اسم القسم"
                className="flex-1 min-w-[10rem] border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-amber-500"
              />
              <button type="submit" disabled={!newCategoryLabel.trim()} className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-bold">
                إضافة
              </button>
              <button type="button" onClick={() => { setIsAddingCategory(false); setNewCategoryLabel(''); setNewCategoryEmoji(''); }} className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm font-bold">
                إلغاء
              </button>
            </form>
          )}

          {categoryDeleteId !== null && (() => {
            const target = categories.find(c => c.id === categoryDeleteId);
            if (!target) return null;
            const affected = products.filter(p => p.category === target.id).length;
            return (
              <div role="alertdialog" className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm">
                <span className="flex-1 min-w-[12rem]">
                  حذف قسم «{target.label}»؟
                  {affected > 0 && ` المنتجات (${affected}) لن تُحذف وستظهر تحت «${UNCATEGORIZED.label}» حتى تنقلها لقسم آخر.`}
                </span>
                <button
                  onClick={() => { onDeleteCategory(target.id); setCategoryDeleteId(null); if (selectedCategory === target.id) setSelectedCategory('all'); }}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  حذف القسم
                </button>
                <button onClick={() => setCategoryDeleteId(null)} className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 font-bold">
                  إلغاء
                </button>
              </div>
            );
          })()}
        </div>

      </div>

      {demoCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900">
          <p className="text-sm flex-1">
            <strong>هذه منتجات تجريبية جاهزة</strong> لتبدأ بها. عدّل الاسم والسعر والصورة لتناسب متجرك، أو احذفها وأضف منتجاتك.
          </p>
          {onDeleteDemo && (
            <button
              type="button"
              onClick={() => { if (confirm(`حذف ${demoCount} من المنتجات التجريبية؟`)) onDeleteDemo(); }}
              className="shrink-0 px-4 py-2.5 rounded-xl bg-white border border-sky-300 text-sky-800 text-sm font-bold hover:bg-sky-100"
            >
              حذف المنتجات التجريبية
            </button>
          )}
        </div>
      )}

      {/* Meals Container: Grid View vs Table View */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-2xl">
            🍲
          </div>
          <h3 className="text-base font-bold text-gray-800">لا توجد منتجات هنا بعد</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            امسح البحث أو أضف منتجاً جديداً
          </p>
          <button
            onClick={onAddNew}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`group bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between hover:shadow-md ${
                product.isAvailable ? 'border-gray-200 hover:border-amber-300' : 'border-gray-200 bg-gray-50/60 opacity-90'
              }`}
            >
              {/* Product Card Top: Image & Badges */}
              <div>
                <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Badges on Image */}
                  <div className="absolute top-2.5 right-2.5 flex flex-wrap gap-1.5">
                    {product.isDemo && (
                      <span className="bg-sky-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">تجريبي</span>
                    )}
                    {product.isSpecial && (
                      <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <Sparkles className="w-3 h-3" />
                        <span>طبق مميز</span>
                      </span>
                    )}
                    <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {getCategoryName(product.category)}
                    </span>
                  </div>

                  {/* Availability Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <button
                      onClick={() => onToggleAvailability(product.id)}
                      title="انقر لتغيير التوفر"
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs transition shadow-xs ${
                        product.isAvailable
                          ? 'bg-emerald-600/90 hover:bg-emerald-700 text-white'
                          : 'bg-rose-600/90 hover:bg-rose-700 text-white'
                      }`}
                    >
                      {product.isAvailable ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          <span>متوفر للطلب</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>غير متوفر مؤقتاً</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Price Tag overlay bottom right */}
                  <div className="absolute bottom-2.5 right-2.5 text-white">
                    <div className="flex items-baseline gap-1 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-xl">
                      <span className="text-base font-extrabold text-amber-400">
                        {product.price}
                      </span>
                      <span className="text-[10px] font-bold text-gray-200">ر.س</span>
                    </div>
                  </div>

                  {/* Rating overlay bottom left */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenMealReviews) onOpenMealReviews(product.id);
                    }}
                    title="انقر لعرض آراء ومراجعات هذه الوجبة"
                    className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-black/65 hover:bg-black/90 active:scale-95 backdrop-blur-xs text-white px-2 py-0.5 rounded-full text-xs transition cursor-pointer"
                  >
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{product.rating}</span>
                    <span className="text-[10px] text-gray-300">({product.reviewsCount})</span>
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-1 group-hover:text-amber-700 transition">
                      {product.name}
                    </h3>
                  </div>

                  {product.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  {/* Serving Capacity (بيعه عداد من الأشخاص) */}
                  {product.servings && (
                    <div className="flex items-center gap-1.5 bg-amber-50/90 text-amber-900 border border-amber-200/80 px-2.5 py-1 rounded-xl text-xs font-semibold w-fit">
                      <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{product.servings}</span>
                    </div>
                  )}

                  {/* Meta Pills */}
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-gray-600 border-t border-gray-100">
                    {product.prepTimeMinutes > 0 && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{product.prepTimeMinutes} دقيقة</span>
                      </div>
                    )}
                    {product.calories && (
                      <div className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span>{product.calories} سعرة</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 mr-auto text-gray-500">
                      <ShoppingBag className="w-3.5 h-3.5 text-gray-400" />
                      <span>{product.ordersCount} طلب</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="p-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onToggleAvailability(product.id)}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition ${
                    product.isAvailable
                      ? 'border-gray-200 text-gray-700 hover:bg-gray-100'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold'
                  }`}
                >
                  {product.isAvailable ? 'تعيين كغير متوفر' : 'تفعيل التوفر فوراً'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEdit(product)}
                    title="تعديل المنتج"
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100 transition"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>تعديل</span>
                  </button>

                  {deleteConfirmId === product.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          onDelete(product.id);
                          setDeleteConfirmId(null);
                        }}
                        className="px-3 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition"
                      >
                        تأكيد الحذف
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-300 transition"
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(product.id)}
                      title="حذف المنتج"
                      className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs font-bold hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>حذف</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-600 border-b border-gray-200">
              <tr>
                <th className="p-3">الوجبة</th>
                <th className="p-3">التصنيف</th>
                <th className="p-3">السعر</th>
                <th className="p-3">الطلبات</th>
                <th className="p-3">حالة التوفر</th>
                <th className="p-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-amber-50/40 transition">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-100"
                      />
                      <div>
                        <div className="font-bold text-gray-900 flex items-center gap-1.5">
                          <span>{product.name}</span>
                          {product.isDemo && (
                            <span className="text-[10px] bg-sky-100 text-sky-800 font-extrabold px-1.5 rounded">تجريبي</span>
                          )}
                          {product.isSpecial && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded">
                              مميز
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 line-clamp-1">{product.description}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-medium text-gray-600 text-xs">
                    {getCategoryName(product.category)}
                  </td>
                  <td className="p-3 font-extrabold text-amber-600">
                    {product.price} ر.س
                  </td>
                  <td className="p-3 text-xs font-bold text-gray-700">
                    {product.ordersCount} طلب
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => onToggleAvailability(product.id)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 transition ${
                        product.isAvailable
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${product.isAvailable ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                      <span>{product.isAvailable ? 'متوفر' : 'غير متوفر'}</span>
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onEdit(product)}
                        className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm(`حذف "${product.name}"؟`)) onDelete(product.id); }}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
