import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  UtensilsCrossed, 
  Star, 
  Clock, 
  Flame, 
  ArrowUpRight 
} from 'lucide-react';
import { Product, Tenant, Order } from '../types';

interface StatsCardsProps {
  tenant: Tenant;
  products: Product[];
  orders: Order[];
  onOpenReviews?: () => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ 
  tenant, 
  products, 
  orders, 
  onOpenReviews 
}) => {
  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'cooking' || o.status === 'ready');
  const availableProducts = products.filter(p => p.isAvailable);
  const bestSeller = [...products].sort((a, b) => b.ordersCount - a.ordersCount)[0];

  return (
    <div className="space-y-4">
      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition group">
          <div className="absolute top-0 right-0 w-2 h-full bg-amber-500 rounded-r-2xl" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-500">مبيعات الأسرة المنتجة</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {tenant.totalRevenue.toLocaleString('ar-SA')}
            </span>
            <span className="text-sm font-bold text-amber-600">ر.س</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg w-fit">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% نمو مبيعات هذا الشهر</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition group">
          <div className="absolute top-0 right-0 w-2 h-full bg-orange-500 rounded-r-2xl" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-500">طلبات الزبائن والولائم</span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-110 transition">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {tenant.totalOrders.toLocaleString('ar-SA')}
            </span>
            <span className="text-sm font-medium text-gray-500">طلب مكتمل</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-orange-700 bg-orange-50 px-2 py-1 rounded-lg w-fit">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>{activeOrders.length} طلبات قيد الطبخ والتجهيز</span>
          </div>
        </div>

        {/* Active Meals */}
        <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition group">
          <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500 rounded-r-2xl" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-500">الطبخات والأصناف المسجلة</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {products.length.toLocaleString('ar-SA')}
            </span>
            <span className="text-sm font-medium text-gray-500">صنف منزلي</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg w-fit">
            <span>{availableProducts.length} متوفر للطلب الفوري</span>
            {products.length - availableProducts.length > 0 && (
              <span className="text-rose-600">({products.length - availableProducts.length} غير متوفر مؤقتاً)</span>
            )}
          </div>
        </div>

        {/* Customer Rating */}
        <div 
          onClick={onOpenReviews}
          className={`relative overflow-hidden bg-white p-5 rounded-2xl border border-yellow-200/90 shadow-sm hover:shadow-md transition group ${
            onOpenReviews ? 'cursor-pointer hover:border-yellow-400' : ''
          }`}
        >
          <div className="absolute top-0 right-0 w-2 h-full bg-yellow-500 rounded-r-2xl" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-500">تقييم نَفَس البيت والطبخ</span>
            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600 group-hover:scale-110 transition">
              <Star className="w-5 h-5 fill-yellow-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {tenant.rating}
            </span>
            <span className="text-xs text-yellow-500 font-bold">★★★★★</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-1.5 text-xs font-medium text-gray-600 bg-yellow-50/70 border border-yellow-200/50 px-2 py-1 rounded-lg w-full">
            <span>آراء وتقييمات الزبائن</span>
            {onOpenReviews && (
              <span className="text-amber-800 font-bold group-hover:underline text-[11px]">
                عرض الآراء ←
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Kitchen Insights Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-3.5 sm:p-4 rounded-xl border border-amber-200/60 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
            💡
          </div>
          <div className="text-gray-700">
            <span className="font-bold text-gray-900">الطبق الأكثر طلباً هذا الأسبوع من مطبخ الأسرة: </span>
            <span className="text-amber-800 font-semibold">{bestSeller ? bestSeller.name : 'لا توجد أطباق مسجلة بعد'}</span>
            {bestSeller && (
              <span className="mr-2 text-xs text-gray-500">({bestSeller.ordersCount} طلب إجمالي)</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>متوسط وقت التحضير: 30 دقيقة</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-600" />
            <span>طازج ومعد يدوياً بالكامل</span>
          </div>
        </div>
      </div>
    </div>
  );
};
