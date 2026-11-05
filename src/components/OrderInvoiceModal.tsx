import React from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  Store, 
  MapPin, 
  Phone, 
  Calendar, 
  Clock, 
  QrCode, 
  Receipt,
  Truck,
  CreditCard,
  ChefHat
} from 'lucide-react';
import { Order, Tenant } from '../types';

interface OrderInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  tenant: Tenant;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({
  isOpen,
  onClose,
  order,
  tenant,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const deliveryFee = order.deliveryType === 'delivery' ? 15 : 0;
  const itemsSubtotal = order.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const total = order.totalAmount;

  const getPaymentMethodLabel = (method?: Order['paymentMethod']) => {
    switch (method) {
      case 'mada': return 'بطاقة مدى الإلكترونية 💳';
      case 'apple_pay': return 'Apple Pay ';
      case 'bank_transfer': return 'تحويل بنكي 🏦';
      case 'cash':
      default: return 'الدفع نقداً عند الاستلام 💵';
    }
  };

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="فاتورة الطلب" className="order-invoice-overlay fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:p-0 print:bg-white">
      <div 
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-4 p-5 sm:p-7 space-y-5 print:shadow-none print:border-none print:m-0 print:p-4 print:w-full"
        dir="rtl"
      >
        {/* Header Actions (Hidden in print) */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">
                فاتورة وإيصال تحضير الطلب
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                إيصال معتمد للمطبخ والعميل جاهز للطباعة الفورية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة الفاتورة</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="border border-dashed border-gray-300 rounded-2xl p-5 bg-stone-50/40 print:border-solid print:border-gray-800 print:bg-white print:p-2 space-y-4 font-mono text-xs text-gray-800">
          
          {/* Store Brand & Title */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-300">
            <div className="flex items-center justify-center gap-2">
              <ChefHat className="w-5 h-5 text-amber-600" />
              <h1 className="font-extrabold text-base text-gray-900 font-sans">
                {tenant.name}
              </h1>
            </div>
            <p className="text-[11px] text-gray-500 font-sans">
              مشروع أسرة منتجة ومطبخ معتمد • وثيقة العمل الحر: <span className="font-bold text-gray-800">{tenant.freelanceDocNumber || 'FL-94827103'}</span>
            </p>
            <div className="flex items-center justify-center gap-3 text-[11px] text-gray-600 font-sans pt-1">
              <span>{tenant.city} - {tenant.district}</span>
              <span>•</span>
              <span>جوال المطبخ: {tenant.phone}</span>
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-3 rounded-xl border border-gray-200/80 font-sans">
            <div>
              <span className="text-gray-400 block">رقم الفاتورة / الطلب:</span>
              <span className="font-bold font-mono text-xs text-gray-900 break-all">{order.id}</span>
            </div>
            <div>
              <span className="text-gray-400 block">تاريخ وتوقيت الطلب:</span>
              <span className="font-bold font-mono text-xs text-gray-900">{order.createdAt}</span>
            </div>
            <div>
              <span className="text-gray-400 block">اسم العميل:</span>
              <span className="font-bold text-gray-900">{order.customerName}</span>
            </div>
            <div>
              <span className="text-gray-400 block">رقم التواصل:</span>
              <span className="font-bold font-mono text-gray-900 ltr text-right">{order.customerPhone}</span>
            </div>
            <div className="col-span-2 pt-1 border-t border-gray-100 flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-1">
                {order.deliveryType === 'delivery' ? (
                  <>
                    <Truck className="w-3.5 h-3.5 text-amber-600" />
                    <span>توصيل إلى: {order.address || 'العنوان المسجل'}</span>
                  </>
                ) : (
                  <>
                    <Store className="w-3.5 h-3.5 text-emerald-600" />
                    <span>استلام يدوي من موقع المطبخ المنزلي</span>
                  </>
                )}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                {getPaymentMethodLabel(order.paymentMethod)}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-1.5 font-sans">
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 pb-1 border-b border-gray-200 px-1">
              <span>الصنف المنزلي</span>
              <div className="flex items-center gap-6">
                <span>الكمية</span>
                <span>السعر</span>
                <span>المجموع</span>
              </div>
            </div>

            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-1.5 border-b border-dashed border-gray-200 px-1 text-xs">
                <div>
                  <span className="font-bold text-gray-900">{item.productName}</span>
                  {item.notes && (
                    <span className="block text-[10px] text-gray-500">ملاحظة: {item.notes}</span>
                  )}
                </div>
                <div className="flex items-center gap-6 font-mono">
                  <span className="w-6 text-center">{item.quantity}x</span>
                  <span className="w-12 text-left">{item.unitPrice}</span>
                  <span className="w-14 text-left font-bold text-gray-900">{item.unitPrice * item.quantity} ر.س</span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Summary */}
          <div className="space-y-1.5 pt-2 font-sans text-xs">
            <div className="flex items-center justify-between text-gray-600">
              <span>المجموع الفرعي للأصناف:</span>
              <span className="font-mono font-bold">{itemsSubtotal} ر.س</span>
            </div>
            {order.deliveryType === 'delivery' && (
              <div className="flex items-center justify-between text-gray-600">
                <span>أجور التوصيل المنزلي:</span>
                <span className="font-mono font-bold">{deliveryFee} ر.س</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm font-extrabold text-gray-900 pt-2 border-t-2 border-gray-900">
              <span>الإجمالي المطلوب سداده:</span>
              <span className="font-mono text-base text-amber-700">{total} ر.س</span>
            </div>
          </div>

          {/* QR & Verification Footer */}
          <div className="pt-3 border-t border-dashed border-gray-300 flex items-center justify-between font-sans">
            <div className="text-[10px] text-gray-500 space-y-0.5">
              <p className="font-bold text-gray-700">شكراً لطلبكم ودعمكم للمشاريع المنزلية السعودية 🇸🇦</p>
              <p>تم تحضير طعامكم بكل حب وعناية بأعلى معايير النظافة والاتقان</p>
              <p className="font-mono text-[9px] text-gray-400">منظومة سُفرة السحابية • كود الفاتورة: {order.id}</p>
            </div>
            <div className="w-16 h-16 bg-white p-1 rounded-lg border border-gray-200 flex items-center justify-center shrink-0">
              <QrCode className="w-14 h-14 text-gray-800" />
            </div>
          </div>

        </div>

        {/* Footer Notes for Screen */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 print:hidden">
          <span>💡 نصيحة: يمكنك طباعة الفاتورة على طابعات الإيصالات الحرارية (80mm) أو كملف PDF.</span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
