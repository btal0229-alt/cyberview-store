import React from 'react';
import { Product, Tenant, Order } from '../types';
import { Storefront } from './Storefront';

interface CustomerMenuPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  products: Product[];
  onPlaceOrder: (order: Order) => void;
}

/** The merchant's preview of the customer store. Orders placed here land straight in the dashboard. */
export const CustomerMenuPreview: React.FC<CustomerMenuPreviewProps> = ({ isOpen, onClose, tenant, products, onPlaceOrder }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-100">
      <Storefront
        tenant={tenant}
        products={products}
        onClose={onClose}
        previewNote="معاينة متجر العميل — الطلبات التجريبية من هنا تظهر في قسم الطلبات"
        onSubmitOrder={async input => {
          const items = input.items.flatMap(({ productId, quantity }) => {
            const p = products.find(x => x.id === productId);
            return p ? [{ productId, productName: p.name, quantity, unitPrice: p.price }] : [];
          });
          const order: Order = {
            id: `ORD-${Date.now().toString(36).toUpperCase()}`,
            tenantId: tenant.id,
            customerName: input.customerName,
            customerPhone: input.customerPhone,
            items,
            totalAmount: items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
            status: 'pending',
            createdAt: new Date().toISOString(),
            deliveryType: input.address ? 'delivery' : 'pickup',
            address: input.address || undefined,
            paymentMethod: 'cash',
            customerNotes: input.notes || undefined,
            source: 'dashboard',
          };
          onPlaceOrder(order);
          return order;
        }}
      />
    </div>
  );
};
