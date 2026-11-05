import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Store, 
  Phone, 
  ChevronRight,
  Flame,
  AlertCircle,
  Bell,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Download,
  FileSpreadsheet,
  Printer,
  MessageCircle,
  Receipt,
  Trash2
} from 'lucide-react';
import { Order, Tenant } from '../types';
import { kitchenSound } from '../utils/audioAlert';
import { exportCompletedOrdersToCSV } from '../utils/exportCsv';

interface RecentOrdersProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  tenant: Tenant;
  onOpenInvoice?: (order: Order) => void;
  onShowToast?: (msg: string) => void;
  onDeleteOrder?: (orderId: string) => void;
}

export const RecentOrders: React.FC<RecentOrdersProps> = ({ 
  orders, 
  onUpdateOrderStatus, 
  tenant, 
  onOpenInvoice,
  onShowToast,
  onDeleteOrder
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isMuted, setIsMuted] = useState(kitchenSound.isSoundMuted());
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const prevOrderIdsRef = useRef<Set<string>>(new Set(orders.map(o => o.id)));
  const isFirstRender = useRef(true);

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const completedOrders = orders.filter(o => o.status === 'delivered');

  // Detect newly arrived pending orders and trigger the audio chime
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const currentIds = new Set(orders.map(o => o.id));
    const newlyAddedPendingOrders = orders.filter(
      order => !prevOrderIdsRef.current.has(order.id) && order.status === 'pending'
    );

    if (newlyAddedPendingOrders.length > 0) {
      kitchenSound.playOrderAlert();
    }

    prevOrderIdsRef.current = currentIds;
  }, [orders]);

  const handleToggleMute = () => {
    const nextState = kitchenSound.toggleMute();
    setIsMuted(nextState);
    if (!nextState) {
      kitchenSound.playOrderAlert();
    }
  };

  const handleTestSound = () => {
    setIsPlayingTest(true);
    kitchenSound.playOrderAlert();
    setTimeout(() => setIsPlayingTest(false), 1200);
  };

  const handleExportCSV = () => {
    const success = exportCompletedOrdersToCSV(orders, tenant);
    if (success) {
      if (onShowToast) {
        onShowToast(`تم تصدير بيانات ${completedOrders.length} طلبات مكتملة إلى ملف CSV بنجاح! 📊`);
      }
    } else {
      if (onShowToast) {
        onShowToast('لا توجد طلبات مكتملة (تم التسليم) لتصديرها حتى الآن.');
      }
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="relative bg-amber-500 text-white text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm shadow-amber-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-85"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-200"></span>
            </span>
            <span>طلب جديد بانتظار الموافقة!</span>
          </span>
        );
      case 'cooking':
        return (
          <span className="bg-orange-100 text-orange-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-600 animate-bounce" />
            <span>قيد التحضير في المطبخ</span>
          </span>
        );
      case 'ready':
        return (
          <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Store className="w-3 h-3 text-blue-600" />
            <span>جاهز للتسليم / المندوب</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>تم التسليم</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-rose-100 text-rose-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>ملغي</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 sm:p-6 space-y-4">
      {/* Header with Title & Audio Alert Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
            pendingCount > 0 ? 'bg-amber-500 text-white animate-pulse' : 'bg-orange-100 text-orange-600'
          }`}>
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                طلبات المطبخ الحية (الطلبات الواردة)
              </h2>
            </div>
            <p className="text-xs text-gray-500">
              متابعة حالة الطبخ والتسليم مع تنبيه صوتي فوري
            </p>
          </div>
        </div>

        {/* Audio controls & pending counter */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Sound Toggle Button */}
          <button
            onClick={handleToggleMute}
            title={isMuted ? 'تفعيل التنبيه الصوتي' : 'كتم التنبيه الصوتي'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition ${
              isMuted 
                ? 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200' 
                : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-600" />}
            <span className="text-[11px]">{isMuted ? 'مكتوم' : 'صوت التنبيه: مفعّل'}</span>
          </button>

          {/* Test Sound Button */}
          <button
            onClick={handleTestSound}
            title="تجربة رنين جرس المطبخ"
            className="p-1.5 rounded-xl border border-gray-200 hover:border-amber-400 bg-white hover:bg-amber-50 text-gray-600 hover:text-amber-700 transition"
          >
            <Bell className={`w-3.5 h-3.5 ${isPlayingTest ? 'text-amber-600 animate-bounce' : ''}`} />
          </button>

          {pendingCount > 0 && (
            <span className="flex items-center gap-1 bg-amber-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full animate-pulse shadow-sm shadow-amber-500/30">
              <Bell className="w-3 h-3 fill-white" />
              <span>{pendingCount} جديد!</span>
            </span>
          )}
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
            {orders.length}
          </span>
        </div>
      </div>

      {/* Accounting & Inventory CSV Export Banner */}
      <div className="bg-gradient-to-l from-emerald-50 via-teal-50/40 to-white border border-emerald-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-emerald-950">
                المحاسبة وجرد المبيعات
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {completedOrders.length} طلب مكتمل
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              تصدير المبيعات والأصناف المباعة إلى ملف Excel/CSV للمحاسبة
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={completedOrders.length === 0}
          title={completedOrders.length === 0 ? 'لا توجد طلبات مكتملة للتصدير' : 'تحميل ملف الإكسل والمحاسبة'}
          className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
            completedOrders.length > 0
              ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white'
              : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>تصدير CSV ({completedOrders.length})</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { key: 'all', label: 'جميع الطلبات', count: orders.length },
          { key: 'pending', label: 'بانتظار الموافقة 🔔', count: orders.filter(o => o.status === 'pending').length },
          { key: 'cooking', label: 'قيد الطبخ 🔥', count: orders.filter(o => o.status === 'cooking').length },
          { key: 'ready', label: 'جاهزة للتسليم 📦', count: orders.filter(o => o.status === 'ready').length },
          { key: 'delivered', label: 'المكتملة ✓', count: orders.filter(o => o.status === 'delivered').length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
              filterStatus === tab.key
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              filterStatus === tab.key ? 'bg-amber-700 text-white' : 'bg-white text-gray-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs">
            لا توجد طلبات واردة حالياً
          </div>
        ) : (
          orders
            .filter(o => filterStatus === 'all' || o.status === filterStatus)
            .map((order) => {
            const isPending = order.status === 'pending';
            const isDelivered = order.status === 'delivered';
            const canDeliver = order.status === 'cooking' || order.status === 'ready';

            const handleWhatsAppCustomer = () => {
              let text = '';
              if (order.status === 'pending') {
                text = `مرحباً بك يا ${order.customerName}! 🌿\nاستلمنا طلبك رقم (${order.id}) في "${tenant.name}" وسنبدأ بطبخه وتحضيره طازجاً فوراً.`;
              } else if (order.status === 'cooking') {
                text = `مرحباً يا ${order.customerName}! 🔥\nطلبك رقم (${order.id}) قيد الطبخ والتجهيز الآن على نار هادئة بكل حب وإتقان.`;
              } else if (order.status === 'ready') {
                text = `أهلاً يا ${order.customerName}! 📦✨\nطلبك رقم (${order.id}) أصبح جاهزاً وساخناً الآن ${order.deliveryType === 'delivery' ? 'وجاري تسليمه للمندوب للتوصيل' : 'ويمكنك التفضل لاستلامه من موقع المطبخ'}.`;
              } else {
                text = `أهلاً يا ${order.customerName}! ❤️\nنتمنى أن تكون وجبتك من "${tenant.name}" نالت إعجابك وبالعافية عليكم، ويسعدنا دائماً تقييمكم وتكرار زيارتكم.`;
              }
              const cleanPhone = order.customerPhone.replace(/\D/g, '');
              const waPhone = cleanPhone.startsWith('0') ? '966' + cleanPhone.substring(1) : cleanPhone;
              window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`, '_blank');
            };

            return (
              <div
                key={order.id}
                className={`relative rounded-xl border transition-all duration-300 overflow-hidden space-y-3 ${
                  isPending
                    ? 'p-3.5 sm:p-4 bg-gradient-to-br from-amber-50/95 via-orange-50/70 to-white border-amber-400 shadow-md shadow-amber-500/15 ring-2 ring-amber-400/80 animate-pulse'
                    : 'p-3.5 sm:p-4 border-gray-100 bg-gray-50/50 hover:bg-white hover:border-amber-200 shadow-xs'
                }`}
              >
                {/* Visual pulse banner for new incoming orders */}
                {isPending && (
                  <div className="bg-gradient-to-l from-amber-500 via-orange-500 to-amber-600 text-white text-[11px] font-extrabold px-3 py-1.5 -mx-3.5 -mt-3.5 sm:-mx-4 sm:-mt-4 mb-3 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 fill-white animate-bounce" />
                      <span>🔔 طلب جديد وصل للتو إلى المطبخ - مطلوب قبول وتأكيد التحضير!</span>
                    </div>
                    <span className="font-mono text-[10px] bg-black/20 px-1.5 py-0.5 rounded text-amber-100">
                      طلب فوري
                    </span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                    <span className="font-mono font-extrabold text-sm text-gray-800 break-all">
                      {order.id}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs font-bold text-gray-700">
                      {order.customerName}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-[11px] text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>{order.createdAt}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {getStatusBadge(order.status)}
                    <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      {order.totalAmount} ر.س
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className={`text-xs text-gray-600 p-2.5 rounded-lg border flex flex-wrap gap-x-4 gap-y-1 ${
                  isPending ? 'bg-white/90 border-amber-200' : 'bg-white border-gray-100'
                }`}>
                  {order.items.map((item, idx) => (
                    <span key={idx} className="font-medium">
                      <span className="font-bold text-gray-900">{item.quantity}x</span> {item.productName}
                    </span>
                  ))}
                </div>

                {/* Footer with customer info, invoice print, whatsapp notify & status actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1 border-t border-gray-100">
                  <div className="flex flex-wrap items-center gap-3 text-gray-500">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <span className="font-mono text-left ltr">{order.customerPhone}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      {order.deliveryType === 'delivery' ? (
                        <>
                          <Truck className="w-3 h-3 text-amber-600" />
                          <span>توصيل: {order.address || 'العنوان المسجل'}</span>
                        </>
                      ) : (
                        <>
                          <Store className="w-3 h-3 text-emerald-600" />
                          <span>استلام من المطبخ</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Actions Bar: Print Invoice, WhatsApp Notify, Change Status */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
                    {/* Print Invoice Button */}
                    {onOpenInvoice && (
                      <button
                        onClick={() => onOpenInvoice(order)}
                        title="طباعة فاتورة وإيصال تحضير الطلب"
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-gray-700" />
                        <span>فاتورة 🖨️</span>
                      </button>
                    )}

                    {/* WhatsApp Customer Update Button */}
                    <button
                      onClick={handleWhatsAppCustomer}
                      title="إشعار العميل بحالة الوجبة عبر الواتساب"
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs transition flex items-center gap-1 cursor-pointer border border-emerald-200/60"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>واتساب العميل</span>
                    </button>

                    {/* Intermediate kitchen step */}
                    {order.status === 'cooking' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'ready')}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        <Store className="w-3 h-3" />
                        <span>جاهز للتسليم 📦</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Order actions: accept, delivered, delete */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100" data-testid="order-actions">
                  <button
                    type="button"
                    onClick={() => onUpdateOrderStatus(order.id, 'cooking')}
                    disabled={!isPending}
                    title={isPending ? 'قبول الطلب وبدء التحضير' : 'تم قبول هذا الطلب'}
                    className={`px-2 py-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
                      isPending
                        ? 'bg-amber-500 hover:bg-amber-600 active:scale-95 text-white shadow-sm shadow-amber-500/30 cursor-pointer'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isPending ? 'قبول' : 'مقبول ✓'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateOrderStatus(order.id, 'delivered')}
                    disabled={!canDeliver}
                    title={isDelivered ? 'تم توصيل هذا الطلب' : isPending ? 'اقبل الطلب أولاً' : 'تأكيد توصيل الطلب للعميل'}
                    className={`px-2 py-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
                      canDeliver
                        ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white cursor-pointer'
                        : isDelivered
                          ? 'bg-emerald-50 text-emerald-600 cursor-default'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>{isDelivered ? 'تم التوصيل ✓' : 'تم التوصيل'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!onDeleteOrder) return;
                      if (window.confirm(`هل تريد حذف الطلب ${order.id} نهائياً؟`)) onDeleteOrder(order.id);
                    }}
                    disabled={!onDeleteOrder}
                    title="حذف الطلب من القائمة"
                    className="px-2 py-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 border border-rose-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

