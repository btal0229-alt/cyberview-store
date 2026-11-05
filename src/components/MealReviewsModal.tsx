import React, { useState, useMemo } from 'react';
import { 
  X, 
  Star, 
  MessageSquare, 
  CheckCircle, 
  Filter, 
  Search, 
  CornerDownLeft, 
  Send, 
  Plus, 
  TrendingUp, 
  Award,
  Sparkles,
  Utensils
} from 'lucide-react';
import { Product, Review, Tenant } from '../types';

interface MealReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  products: Product[];
  reviews: Review[];
  onAddReply: (reviewId: string, replyText: string) => void;
  onAddNewReview: (newReview: Omit<Review, 'id' | 'createdAt'>) => void;
  initialSelectedProductId?: string | null;
}

export const MealReviewsModal: React.FC<MealReviewsModalProps> = ({
  isOpen,
  onClose,
  tenant,
  products,
  reviews,
  onAddReply,
  onAddNewReview,
  initialSelectedProductId,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(initialSelectedProductId || 'all');
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [showAddReviewForm, setShowAddReviewForm] = useState(false);

  // New review form states
  const [newCustName, setNewCustName] = useState('');
  const [newProductId, setNewProductId] = useState(products[0]?.id || '');
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState('');

  if (!isOpen) return null;

  // Filter tenant reviews
  const tenantReviews = reviews.filter(r => r.tenantId === tenant.id);

  // Calculate per-meal stats
  const mealStats = useMemo(() => {
    return products.map(product => {
      const productReviews = tenantReviews.filter(r => r.productId === product.id);
      const count = productReviews.length;
      const average = count > 0 
        ? productReviews.reduce((sum, r) => sum + r.rating, 0) / count 
        : product.rating || 5.0;

      return {
        product,
        reviewsCount: count > 0 ? count : product.reviewsCount,
        averageRating: Number(average.toFixed(1)),
        latestReview: productReviews[0] || null,
      };
    });
  }, [products, tenantReviews]);

  // Overall store calculations
  const totalReviewsCount = tenantReviews.length;
  const storeAverage = totalReviewsCount > 0 
    ? (tenantReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(1)
    : tenant.rating.toString();

  // Star breakdown calculation
  const starCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    tenantReviews.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      counts[star] = (counts[star] || 0) + 1;
    });
    return counts;
  }, [tenantReviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return tenantReviews.filter(r => {
      const matchesMeal = selectedProductId === 'all' || r.productId === selectedProductId;
      const matchesStar = selectedStarFilter === 'all' || r.rating === selectedStarFilter;
      const matchesSearch = 
        r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.productName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesMeal && matchesStar && matchesSearch;
    });
  }, [tenantReviews, selectedProductId, selectedStarFilter, searchQuery]);

  const handleSendReply = (reviewId: string) => {
    const text = replyInputs[reviewId]?.trim();
    if (!text) return;
    onAddReply(reviewId, text);
    setReplyInputs(prev => ({ ...prev, [reviewId]: '' }));
  };

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newComment.trim()) return;

    const targetProduct = products.find(p => p.id === newProductId) || products[0];

    onAddNewReview({
      tenantId: tenant.id,
      productId: targetProduct.id,
      productName: targetProduct.name,
      customerName: newCustName.trim(),
      rating: newRating,
      comment: newComment.trim(),
      verifiedPurchase: true,
    });

    setNewCustName('');
    setNewComment('');
    setShowAddReviewForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-slate-50 w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-4 max-h-[92vh] flex flex-col"
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-gradient-to-l from-amber-500 via-amber-600 to-amber-700 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shadow-xs">
              ⭐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">تقييمات ومراجعات العملاء للوجبات</h2>
                <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {tenant.name}
                </span>
              </div>
              <p className="text-xs text-amber-100">
                لوحة تفاعلية لمعرفة متوسط تقييم كل وجبة وانطباعات الزبائن والرد عليهم
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

        {/* Content Workspace */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Section 1: Overview Summary & Rating Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Overall Score Box */}
            <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-gray-500 mb-1">متوسط تقييم المطبخ العام</span>
              <div className="text-4xl sm:text-5xl font-black text-amber-500 my-1">
                {storeAverage}
              </div>
              <div className="flex items-center gap-1 my-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star} 
                    className={`w-4 h-4 ${
                      star <= Math.round(Number(storeAverage))
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-gray-200 fill-gray-200'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 font-medium mt-1">
                مبني على {totalReviewsCount} تقييم موثق للوجبات
              </span>
            </div>

            {/* Star Distribution Breakdown */}
            <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
              <h3 className="text-xs font-bold text-gray-700 mb-3 flex items-center justify-between">
                <span>توزيع تقييمات النجوم</span>
                <span className="text-amber-700 text-[11px] font-semibold">رضا العملاء: 98%</span>
              </h3>
              
              {[5, 4, 3, 2, 1].map(stars => {
                const count = starCounts[stars as keyof typeof starCounts] || 0;
                const percentage = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0;

                return (
                  <div key={stars} className="flex items-center gap-3 text-xs">
                    <span className="w-12 font-bold text-gray-700 flex items-center gap-1">
                      <span>{stars}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                    </span>
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-10 text-left font-mono text-gray-500 text-[11px]">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Meal-by-Meal Rating Breakdown Carousel / Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-amber-600" />
                <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">
                  متوسط التقييم لكل وجبة مسجلة
                </h3>
              </div>
              <span className="text-xs text-gray-500">
                اضغط على أي وجبة لتصفية مراجعاتها
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {mealStats.map(({ product, reviewsCount, averageRating }) => {
                const isSelected = selectedProductId === product.id;

                return (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProductId(isSelected ? 'all' : product.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected 
                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 shadow-xs' 
                        : 'bg-white border-gray-200 hover:border-amber-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-100"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 text-xs truncate">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-black text-amber-600 text-sm">
                            {averageRating}
                          </span>
                          <div className="flex items-center text-amber-400">
                            <Star className="w-3 h-3 fill-amber-400" />
                          </div>
                          <span className="text-[10px] text-gray-400">
                            ({reviewsCount} تقييم)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-left">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                        isSelected 
                          ? 'bg-amber-600 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isSelected ? 'محدد ✓' : 'عرض'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Reviews Feed & Interactive Reply */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 space-y-4 shadow-xs">
            
            {/* Feed Header with Filters & Add review toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <h3 className="font-extrabold text-gray-900 text-sm">
                  مراجعات وتجارب الزبائن المكتوبة
                </h3>
                <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {filteredReviews.length} مراجعة
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Reset Meal Filter if active */}
                {selectedProductId !== 'all' && (
                  <button
                    onClick={() => setSelectedProductId('all')}
                    className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition"
                  >
                    عرض كل الوجبات ✕
                  </button>
                )}

                {/* Star Filter Pills */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setSelectedStarFilter('all')}
                    className={`px-2 py-1 rounded-lg transition ${
                      selectedStarFilter === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
                    }`}
                  >
                    الكل
                  </button>
                  {[5, 4, 3].map(st => (
                    <button
                      key={st}
                      onClick={() => setSelectedStarFilter(st)}
                      className={`px-2 py-1 rounded-lg flex items-center gap-0.5 transition ${
                        selectedStarFilter === st ? 'bg-white text-amber-700 shadow-xs' : 'text-gray-600'
                      }`}
                    >
                      <span>{st}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </button>
                  ))}
                </div>

                {/* Toggle Add Review Form */}
                <button
                  onClick={() => setShowAddReviewForm(!showAddReviewForm)}
                  className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة تقييم جديد</span>
                </button>
              </div>
            </div>

            {/* Optional New Review Simulator Form */}
            {showAddReviewForm && (
              <form onSubmit={handleCreateReview} className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>تسجيل تجربة وتقييم عميل جديد</span>
                  </h4>
                  <button 
                    type="button" 
                    onClick={() => setShowAddReviewForm(false)}
                    className="text-gray-400 hover:text-gray-600 text-xs"
                  >
                    إلغاء
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700">اسم العميل</label>
                    <input
                      type="text"
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      placeholder="مثلاً: سارة العتيبي"
                      className="w-full text-xs p-2 bg-white border border-gray-200 rounded-xl outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700">الوجبة التي تم تقييمها</label>
                    <select
                      value={newProductId}
                      onChange={(e) => setNewProductId(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-gray-200 rounded-xl outline-none"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700">التقييم (النجوم)</label>
                    <select
                      value={newRating}
                      onChange={(e) => setNewRating(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-white border border-gray-200 rounded-xl outline-none"
                    >
                      <option value="5">★★★★★ (5 نجوم - ممتاز)</option>
                      <option value="4">★★★★☆ (4 نجوم - جيد جداً)</option>
                      <option value="3">★★★☆☆ (3 نجوم - جيد)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700">تعليق وملاحظة العميل</label>
                  <textarea
                    rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="اكتب انطباع العميل عن الطعم، التغليف، سرعة التوصيل..."
                    className="w-full text-xs p-2 bg-white border border-gray-200 rounded-xl outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs"
                  >
                    حفظ التقييم ونشره
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            <div className="space-y-3">
              {filteredReviews.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  لا توجد مراجعات مطابقة لمعايير البحث الحالية
                </div>
              ) : (
                filteredReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60 space-y-2.5 hover:bg-white hover:border-amber-200 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-700 font-bold text-xs flex items-center justify-center">
                          {rev.customerName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-xs">
                              {rev.customerName}
                            </span>
                            {rev.verifiedPurchase && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                <span>طلب موثق</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400">{rev.createdAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                          {rev.productName}
                        </span>
                        <div className="flex items-center text-amber-400">
                          {[1, 2, 3, 4, 5].map(st => (
                            <Star 
                              key={st} 
                              className={`w-3.5 h-3.5 ${
                                st <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed pr-10">
                      {rev.comment}
                    </p>

                    {/* Merchant Reply if exists */}
                    {rev.reply ? (
                      <div className="mr-6 sm:mr-10 p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px]">
                          <CornerDownLeft className="w-3 h-3 text-amber-600" />
                          <span>رد {tenant.name}:</span>
                          {rev.replyDate && (
                            <span className="text-[10px] text-gray-400 font-normal mr-auto">
                              {rev.replyDate}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 leading-relaxed text-[11px]">
                          {rev.reply}
                        </p>
                      </div>
                    ) : (
                      /* Merchant Reply Input */
                      <div className="mr-6 sm:mr-10 pt-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={replyInputs[rev.id] || ''}
                          onChange={(e) => setReplyInputs(prev => ({ ...prev, [rev.id]: e.target.value }))}
                          placeholder="اكتب ردك اللطيف للعميل..."
                          className="flex-1 text-xs p-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendReply(rev.id)}
                          className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3 py-2 rounded-xl transition shadow-xs"
                        >
                          <Send className="w-3 h-3" />
                          <span>رد</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 shrink-0">
          <div>
            <span>نصيحة: المراجعات والردود السريعة ترفع ولاء الزبائن بنسبة 40%</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-bold transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
