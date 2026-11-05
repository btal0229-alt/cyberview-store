import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  UtensilsCrossed, 
  ShoppingBag, 
  Share2, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ChefHat,
  Crown,
  Zap,
  KeyRound
} from 'lucide-react';
import { Product, Tenant, Order, Review, SubscriptionPlan, LicenseKey, PlatformSettings } from './types';
import { 
  INITIAL_TENANTS, 
  INITIAL_PRODUCTS, 
  INITIAL_ORDERS, 
  INITIAL_REVIEWS,
  INITIAL_SUBSCRIPTION_PLANS,
  INITIAL_LICENSE_KEYS,
  INITIAL_PLATFORM_SETTINGS
} from './data/mockData';
import { productKeysApi } from './utils/productKeys';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { MealList } from './components/MealList';
import { AddMealModal, SimpleProductInput } from './components/AddMealModal';
import { RecentOrders } from './components/RecentOrders';
import { CustomerMenuPreview } from './components/CustomerMenuPreview';
import { ShareMenuModal } from './components/ShareMenuModal';
import { NewTenantModal } from './components/NewTenantModal';
import { StoreScheduleModal } from './components/StoreScheduleModal';
import { MealReviewsModal } from './components/MealReviewsModal';
import { OrderInvoiceModal } from './components/OrderInvoiceModal';
import { SuperAdminModal } from './components/SuperAdminModal';
import { SaaSPricingModal } from './components/SaaSPricingModal';
import { LicenseActivationModal } from './components/LicenseActivationModal';
import { QuickStartGuideModal } from './components/QuickStartGuideModal';
import { DigitalProductSellerModal } from './components/DigitalProductSellerModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { isTenantOpenNow } from './utils/scheduleHelper';
import { getCategories, newCategoryId } from './utils/categories';

export default function App({ initial, onPersist, onManage }: { initial: { tenant: Tenant; products: Product[]; orders: Order[]; reviews: Review[] }; onPersist: (data: any) => void; onManage: () => void }) {
  const [tenants, setTenants] = useState<Tenant[]>([initial.tenant]);
  const [currentTenantId, setCurrentTenantId] = useState(initial.tenant.id);
  const [plans] = useState(INITIAL_SUBSCRIPTION_PLANS);
  const [licenseKeys] = useState<LicenseKey[]>([]);
  const [platformSettings, setPlatformSettings] = useState(INITIAL_PLATFORM_SETTINGS);
  const [allProducts, setAllProducts] = useState<Record<string, Product[]>>({ [initial.tenant.id]: initial.products });
  const [orders, setOrders] = useState<Order[]>(initial.orders);
  const [reviews, setReviews] = useState<Review[]>(initial.reviews);
  // 6. Modal States
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Product | null>(null);
  const [isCustomerPreviewOpen, setIsCustomerPreviewOpen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'store' || params.get('view') === 'customer';
  });
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isNewTenantOpen, setIsNewTenantOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [reviewsFocusedProductId, setReviewsFocusedProductId] = useState<string | null>(null);

  // SaaS Specific Modals
  const [isSuperAdminOpen, setIsSuperAdminOpen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return false;
  });
  const [isSaaSPricingOpen, setIsSaaSPricingOpen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return false;
  });
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [isQuickGuideOpen, setIsQuickGuideOpen] = useState(false);
  const [isDigitalSellerOpen, setIsDigitalSellerOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  useEffect(() => setSelectedInvoiceOrder(null), [currentTenantId]);
  const completingOrders = useRef(new Set<string>());

  // 7. Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    onPersist({ tenant: tenants[0], products: allProducts[initial.tenant.id] || [], orders, reviews });
  }, [tenants, allProducts, orders, reviews]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // SaaS Handlers
  const handleActivateKey = () => { onManage(); return false; };
  const handleAddLicenseKey = () => { onManage(); };
  const handleUpdatePlatformSettings = (newSettings: PlatformSettings) => {
    setPlatformSettings(newSettings);
  };

  const handleRegisterNewTenant = (newTenant: Tenant) => {
    setTenants(prev => [newTenant, ...prev]);
    setAllProducts(prev => ({
      ...prev,
      [newTenant.id]: []
    }));
    setCurrentTenantId(newTenant.id);
  };

  const handleOpenReviews = (productId?: string) => {
    setReviewsFocusedProductId(productId || null);
    setIsReviewsModalOpen(true);
  };

  const handleAddReviewReply = (reviewId: string, replyText: string) => {
    setReviews(prev => prev.map(r => 
      r.id === reviewId ? { ...r, reply: replyText, replyDate: 'الآن' } : r
    ));
    showToast('تم إرسال ردك للعميل بنجاح! 💬');
  };

  const handleTriggerTestOrder = () => {
    const meal = currentProducts[0] || {
      name: 'ورق عنب حامض حلو بدبس الرمان',
      price: 45,
      id: 'prod-test'
    };
    const testOrder: Order = {
      id: `ORD-${crypto.randomUUID()}`,
      tenantId: currentTenantId,
      customerName: 'فهد العتيبي (طلب تجريبي)',
      customerPhone: '0551122334',
      items: [
        {
          productId: meal.id,
          productName: meal.name,
          quantity: 2,
          unitPrice: meal.price,
          notes: 'حار مع ليمون ودبس رمان زيادة',
        }
      ],
      totalAmount: (meal.price * 2) + 15,
      status: 'pending',
      createdAt: 'الآن',
      deliveryType: 'delivery',
      address: 'الرياض، حي النرجس، شارع العليا',
      paymentMethod: 'mada',
      customerNotes: 'طلب تجريبي لاختبار رنين الجرس وإصدار الفاتورة',
    };
    handlePlaceCustomerOrder(testOrder);
  };

  const handleAddNewReview = (newReviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const newRev: Review = {
      id: `rev-${Date.now().toString(36)}`,
      ...newReviewData,
      createdAt: 'الآن',
    };
    setReviews(prev => [newRev, ...prev]);

    // Recalculate average rating for the meal
    const productReviews = [newRev, ...reviews.filter(r => r.productId === newReviewData.productId)];
    const newAvg = Number((productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1));

    setAllProducts(prev => ({
      ...prev,
      [currentTenantId]: (prev[currentTenantId] || []).map(p => 
        p.id === newReviewData.productId 
          ? { ...p, rating: newAvg, reviewsCount: productReviews.length }
          : p
      )
    }));

    showToast(`تمت إضافة تقييم جديد لوجبة "${newReviewData.productName}" بنجاح! ⭐`);
  };

  // Current Tenant and Products
  const currentTenant = tenants.find(t => t.id === currentTenantId) || tenants[0];
  const currentProducts = allProducts[currentTenantId] || [];
  const currentOrders = orders.filter(o => o.tenantId === currentTenantId);

  // Handlers for store sections (categories)
  const currentCategories = getCategories(currentTenant);
  const updateCategories = (next: typeof currentCategories) =>
    setTenants(prev => prev.map(t => t.id === currentTenantId ? { ...t, categories: next } : t));
  const handleAddCategory = (label: string, emoji: string) => {
    if (currentCategories.some(c => c.label.trim() === label)) {
      showToast('يوجد قسم بهذا الاسم مسبقاً.');
      return;
    }
    updateCategories([...currentCategories, { id: newCategoryId(), label, ...(emoji ? { emoji } : {}) }]);
    showToast(`تمت إضافة قسم «${label}».`);
  };
  const handleDeleteCategory = (categoryId: string) => {
    const target = currentCategories.find(c => c.id === categoryId);
    updateCategories(currentCategories.filter(c => c.id !== categoryId));
    if (target) showToast(`تم حذف قسم «${target.label}».`);
  };

  // Handlers for Products
  const handleSaveMeal = (productData: SimpleProductInput) => {
    if (editingMeal) {
      // Update existing meal
      const updatedList = currentProducts.map(p => 
        p.id === editingMeal.id 
          ? { 
              ...p, 
              ...productData,
              isDemo: false,
            } 
          : p
      );
      setAllProducts(prev => ({
        ...prev,
        [currentTenantId]: updatedList
      }));
      showToast(`تم تحديث وجبة "${productData.name}" بنجاح! 👏`);
    } else {
      // Add new meal (matches user's prompt!)
      const newMeal: Product = {
        id: `prod-${Date.now().toString(36)}`,
        description: '',
        prepTimeMinutes: 0,
        isAvailable: true,
        ...productData,
        createdAt: new Date().toISOString(),
        rating: 5.0,
        reviewsCount: 0,
        ordersCount: 0,
      };

      const updatedList = [newMeal, ...currentProducts];
      setAllProducts(prev => ({
        ...prev,
        [currentTenantId]: updatedList
      }));

      // Update tenant metrics
      setTenants(prev => prev.map(t => 
        t.id === currentTenantId 
          ? { ...t } 
          : t
      ));

      showToast(`تمت إضافة الوجبة "${productData.name}" لقائمة طعام المتجر بنجاح! 🎉`);
    }

    setEditingMeal(null);
    setIsAddMealOpen(false);
  };

  const handleDeleteMeal = (productId: string) => {
    const mealToDelete = currentProducts.find(p => p.id === productId);
    const updated = currentProducts.filter(p => p.id !== productId);
    setAllProducts(prev => ({
      ...prev,
      [currentTenantId]: updated
    }));
    showToast(`تم حذف الوجبة "${mealToDelete?.name || ''}" من القائمة.`);
  };

  const handleToggleAvailability = (productId: string) => {
    const updated = currentProducts.map(p => {
      if (p.id === productId) {
        const nextState = !p.isAvailable;
        showToast(nextState ? `أصبحت "${p.name}" متوفرة للطلب الآن! ✅` : `تم تعيين "${p.name}" كغير متوفرة مؤقتاً.`);
        return { ...p, isAvailable: nextState };
      }
      return p;
    });

    setAllProducts(prev => ({
      ...prev,
      [currentTenantId]: updated
    }));
  };

  // Handlers for Store & Orders
  const handleToggleStoreStatus = () => {
    const statusNow = isTenantOpenNow(currentTenant);
    const nextStatus = !statusNow.isOpen;
    
    setTenants(prev => prev.map(t => 
      t.id === currentTenantId 
        ? { ...t, isOpen: nextStatus, autoScheduleEnabled: false } 
        : t
    ));
    showToast(nextStatus 
      ? 'تم فتح المتجر يدوياً لاستقبال الطلبات 🟢 (وضع يدوي)' 
      : 'تم إغلاق المتجر يدوياً مؤقتاً 🔴 (وضع يدوي)'
    );
  };

  const handleSaveTenantSettings = (updatedTenant: Tenant) => {
    setTenants(prev => prev.map(t => 
      t.id === updatedTenant.id ? updatedTenant : t
    ));
    showToast(`تم حفظ لون الهوية وإعدادات وساعات عمل متجر "${updatedTenant.name}" بنجاح! 🎨`);
  };

  const handleOpenInvoice = async (order: Order) => {
    if (order.status !== 'delivered') { setSelectedInvoiceOrder(order); return; }
    try {
      const data = await productKeysApi(order.tenantId, { action: 'invoice', orderId: order.id });
      setSelectedInvoiceOrder(data.order || order);
    } catch (error) { showToast(error instanceof Error ? error.message : 'تعذر تحميل الفاتورة.'); }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    if (completingOrders.current.has(orderId)) return;
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    if (newStatus === 'delivered') {
      completingOrders.current.add(orderId);
      showToast('جارٍ إتمام الطلب…');
      try {
        const data = await productKeysApi(order.tenantId, { action: 'fulfill', order });
        setOrders(prev => prev.map(o => o.id === orderId ? { ...data.order, items: data.order.items.map(({ activationCodes, ...item }: Order['items'][number]) => item) } : o));
        setSelectedInvoiceOrder(data.order);
        showToast('تم إتمام الطلب وحفظ الفاتورة.');
      } catch (error) { showToast(error instanceof Error ? error.message : 'تعذر إتمام الطلب.'); }
      finally { completingOrders.current.delete(orderId); }
      return;
    }
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    showToast(`تم تحديث حالة الطلب رقم ${orderId}`);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (completingOrders.current.has(orderId)) return;
    setOrders(prev => prev.filter(o => o.id !== orderId));
    setSelectedInvoiceOrder(prev => (prev && prev.id === orderId ? null : prev));
    showToast(`تم حذف الطلب رقم ${orderId}`);
  };

  const handlePlaceCustomerOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    // increment tenant revenue & orders
    setTenants(prev => prev.map(t => 
      t.id === currentTenantId 
        ? { 
            ...t, 
            totalOrders: t.totalOrders + 1, 
            totalRevenue: t.totalRevenue + newOrder.totalAmount 
          }
        : t
    ));
    showToast(`طلب جديد وارد من العميل ${newOrder.customerName}! 🔔`);
  };

  const handleAddNewTenant = (newTenant: Tenant) => {
    setTenants(prev => [newTenant, ...prev]);
    setAllProducts(prev => ({
      ...prev,
      [newTenant.id]: []
    }));
    setCurrentTenantId(newTenant.id);
    showToast(`تم تفعيل المتجر الجديد "${newTenant.name}" بنجاح! 🎊`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir="rtl">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-amber-500/40 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Header */}
      <Header
        tenants={tenants}
        currentTenant={currentTenant}
        onSelectTenant={setCurrentTenantId}
        onToggleStoreStatus={handleToggleStoreStatus}
        onOpenAddMeal={() => {
          setEditingMeal(null);
          setIsAddMealOpen(true);
        }}
        onOpenCustomerPreview={() => setIsCustomerPreviewOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onAddNewTenant={() => onManage()}
        onOpenScheduleModal={() => setIsScheduleModalOpen(true)}
        onOpenSuperAdmin={() => onManage()}
        onOpenSaaSPricing={() => onManage()}
        onOpenLicenseModal={() => onManage()}
        onOpenQuickGuide={() => setIsQuickGuideOpen(true)}
        onOpenDigitalSeller={() => onManage()}
      />

      {/* Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Welcome & Dashboard Status Intro */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">👩‍🍳</span>
              <h2 className="text-lg font-extrabold text-gray-900">
                لوحة تحكم الأسر المنتجة والطبخ المنزلي
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              مرحباً بك، <span className="font-bold text-gray-800">{currentTenant.ownerName}</span> • إدارة طبخات البيت، المفرزنات والولائم، واستقبال طلبات الزبائن
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCustomerPreviewOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
              <span>معاينة متجر العميل</span>
            </button>
            <button
              onClick={() => {
                setEditingMeal(null);
                setIsAddMealOpen(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 px-3.5 py-2 rounded-xl shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة منتج</span>
            </button>
          </div>
        </div>

        {/* 1. Core Statistics Cards (عرض الإحصائيات الأساسية) */}
        <StatsCards
          tenant={currentTenant}
          products={currentProducts}
          orders={currentOrders}
          onOpenReviews={() => handleOpenReviews()}
        />

        {/* 2. Main Content Grid: Meal Catalog + Kitchen Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2-column: Meals Catalog (قائمة الوجبات المسجلة) */}
          <div id="meals-section" className="lg:col-span-2 space-y-6">
            <MealList
              products={currentProducts}
              onAddNew={() => {
                setEditingMeal(null);
                setIsAddMealOpen(true);
              }}
              onEdit={(meal) => {
                setEditingMeal(meal);
                setIsAddMealOpen(true);
              }}
              onDelete={handleDeleteMeal}
              onToggleAvailability={handleToggleAvailability}
              onDeleteDemo={() => {
                setAllProducts(prev => ({ ...prev, [currentTenantId]: currentProducts.filter(p => !p.isDemo) }));
                showToast('تم حذف المنتجات التجريبية.');
              }}
              onOpenMealReviews={(prodId) => handleOpenReviews(prodId)}
              categories={currentCategories}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          </div>

          {/* Side Column: Recent Live Orders & Kitchen Highlights */}
          <div id="orders-section" className="space-y-6">
            <RecentOrders
              orders={currentOrders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              tenant={currentTenant}
              onOpenInvoice={handleOpenInvoice}
              onShowToast={showToast}
              onDeleteOrder={handleDeleteOrder}
            />

            {/* Quick Tips & Platform Info Card */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-2xl border border-amber-200/80 p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <ChefHat className="w-4 h-4 text-amber-600" />
                <span>إرشادات تميز الأسر المنتجة ومشاريع الطبخ المنزلي</span>
              </div>
              <ul className="text-xs text-gray-700 space-y-2 list-disc list-inside leading-relaxed">
                <li>توضيح سعة الصحن وعدد الأشخاص (وجبة فردية، جمعة عائلية، بوفيه) يسهل على الزبائن اختيار الكمية بدقة.</li>
                <li>إبراز رقم وثيقة العمل الحر يزيد ثقة الزبائن في الالتزام بالمعايير الصحية وجودة ونظافة نَفَس البيت.</li>
                <li>تحديث أوقات العمل وجدولة استلام الطلبات يضمن تجهيز الأطباق ساخنة وطازجة بوقتها المحدد.</li>
                <li>توفير خيارات المفرزنات والحلويات مسبقة الحجز يضاعف دخل الأسرة في المواسم والجمعات الأسبوعية.</li>
              </ul>
              <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-amber-800 font-medium">
                <span>رمز الأسرة المنتجة:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-200 font-bold">
                  {currentTenant.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Native App Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex items-center justify-around shadow-lg text-[10px] font-bold text-gray-500">
        <button
          onClick={() => {
            const el = document.getElementById('meals-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-1 hover:text-amber-600 transition cursor-pointer"
        >
          <UtensilsCrossed className="w-4 h-4 text-amber-600" />
          <span>الأكلات</span>
        </button>

        <button
          onClick={() => {
            const el = document.getElementById('orders-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="relative flex flex-col items-center gap-1 hover:text-amber-600 transition cursor-pointer"
        >
          {currentOrders.filter(o => o.status === 'pending').length > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          )}
          <ShoppingBag className="w-4 h-4 text-orange-600" />
          <span>الطلبات</span>
        </button>

        <button
          onClick={() => {
            setEditingMeal(null);
            setIsAddMealOpen(true);
          }}
          className="-mt-5 w-11 h-11 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 cursor-pointer active:scale-95 transition"
          title="إضافة طبخة"
        >
          <Plus className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsCustomerPreviewOpen(true)}
          className="flex flex-col items-center gap-1 hover:text-amber-600 transition cursor-pointer"
        >
          <ExternalLink className="w-4 h-4 text-blue-600" />
          <span>متجر العميل</span>
        </button>

        <button
          onClick={() => onManage()}
          className="flex flex-col items-center gap-1 hover:text-amber-600 transition cursor-pointer"
        >
          <Crown className="w-4 h-4 text-amber-500" />
          <span>المنصة</span>
        </button>
      </nav>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200/80 py-4 mt-12 mb-[calc(5rem+env(safe-area-inset-bottom))] md:mb-0 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-amber-600">منصة الأسر المنتجة والمطابخ السحابية</span>
          </div>
          <div className="text-gray-400">
            جميع الحقوق محفوظة © {new Date().getFullYear()}
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isAddMealOpen && <AddMealModal
        key={editingMeal?.id || 'new'}
        isOpen={isAddMealOpen}
        onClose={() => {
          setIsAddMealOpen(false);
          setEditingMeal(null);
        }}
        onAddMeal={handleSaveMeal}
        tenantId={currentTenantId}
        initialMeal={editingMeal}
        categories={currentCategories}
      />}

      <CustomerMenuPreview
        isOpen={isCustomerPreviewOpen}
        onClose={() => setIsCustomerPreviewOpen(false)}
        tenant={currentTenant}
        products={currentProducts}
        onPlaceOrder={handlePlaceCustomerOrder}
      />

      <ShareMenuModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        tenant={currentTenant}
      />

      <NewTenantModal
        isOpen={isNewTenantOpen}
        onClose={() => setIsNewTenantOpen(false)}
        onAddTenant={handleAddNewTenant}
      />

      <StoreScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        tenant={currentTenant}
        onSaveTenantSettings={handleSaveTenantSettings}
      />

      <MealReviewsModal
        isOpen={isReviewsModalOpen}
        onClose={() => {
          setIsReviewsModalOpen(false);
          setReviewsFocusedProductId(null);
        }}
        tenant={currentTenant}
        products={currentProducts}
        reviews={reviews}
        onAddReply={handleAddReviewReply}
        onAddNewReview={handleAddNewReview}
        initialSelectedProductId={reviewsFocusedProductId}
      />

      {/* 7. Printable Invoice & Kitchen Receipt Modal */}
      <OrderInvoiceModal
        isOpen={!!selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
        order={selectedInvoiceOrder}
        tenant={currentTenant}
      />

      {/* 8. Super Admin SaaS & Client Management Modal */}
      <SuperAdminModal
        isOpen={isSuperAdminOpen}
        onClose={() => setIsSuperAdminOpen(false)}
        tenants={tenants}
        plans={plans}
        licenseKeys={licenseKeys}
        platformSettings={platformSettings}
        onUpdateTenants={setTenants}
        onAddLicenseKey={handleAddLicenseKey}
        onUpdatePlatformSettings={handleUpdatePlatformSettings}
        onSelectTenant={setCurrentTenantId}
        onShowToast={showToast}
      />

      {/* 9. SaaS Pricing & New Kitchen Onboarding Modal */}
      <SaaSPricingModal
        isOpen={isSaaSPricingOpen}
        onClose={() => setIsSaaSPricingOpen(false)}
        plans={plans}
        platformSettings={platformSettings}
        onRegisterNewTenant={handleRegisterNewTenant}
        onShowToast={showToast}
      />

      {/* 10. License Key Activation & Plan Status Modal */}
      <LicenseActivationModal
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
        tenant={currentTenant}
        plans={plans}
        licenseKeys={licenseKeys}
        onActivateKey={handleActivateKey}
        onOpenPricingModal={() => onManage()}
        onShowToast={showToast}
      />

      {/* 11. Quick Start & Operational Walkthrough Guide Modal */}
      <QuickStartGuideModal
        isOpen={isQuickGuideOpen}
        onClose={() => setIsQuickGuideOpen(false)}
        tenant={currentTenant}
        onOpenAddMeal={() => {
          setEditingMeal(null);
          setIsAddMealOpen(true);
        }}
        onOpenCustomerPreview={() => setIsCustomerPreviewOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onTriggerTestOrder={handleTriggerTestOrder}
        onShowToast={showToast}
      />

      {/* 12. Digital Product Seller Kit Modal (لبيع التطبيق في متجرك بسلة / زد) */}
      <DigitalProductSellerModal
        isOpen={isDigitalSellerOpen}
        onClose={() => setIsDigitalSellerOpen(false)}
        tenant={currentTenant}
        plans={plans}
        platformSettings={platformSettings}
        onAddLicenseKey={handleAddLicenseKey}
        onShowToast={showToast}
      />

      {/* 13. PWA Offline Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
}
