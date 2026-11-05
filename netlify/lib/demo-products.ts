import { randomUUID } from 'node:crypto';

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

/** Ready-made sample products shown in a brand-new store so the menu is never empty. */
const DEMO_PRODUCTS = [
  { name: 'كبسة لحم', price: 85, category: 'main', image: 'photo-1563379091339-03b21ab4a4f8' },
  { name: 'جريش بلدي', price: 45, category: 'main', image: 'photo-1541832676-9b763b0239ab' },
  { name: 'ورق عنب', price: 40, category: 'appetizers', image: 'photo-1608897013039-887f21d8c804' },
  { name: 'سمبوسة مفرزنة (20 حبة)', price: 35, category: 'appetizers', image: 'photo-1601050690597-df0568f70950' },
  { name: 'فطائر صاج مشكلة', price: 30, category: 'bakery', image: 'photo-1509440159596-0249088772ff' },
  { name: 'بسبوسة بالقشطة', price: 25, category: 'sweets', image: 'photo-1587314168485-3236d6710814' },
  { name: 'كيك الشوكولاتة', price: 55, category: 'sweets', image: 'photo-1578985545062-69928b1d9587' },
  { name: 'عصير كركديه بارد', price: 12, category: 'drinks', image: 'photo-1513558161293-cdaf765ed2fd' },
] as const;

export function createDemoProducts(now = new Date()) {
  return DEMO_PRODUCTS.map((p, i) => ({
    id: `demo-${randomUUID().slice(0, 8)}`,
    name: p.name,
    price: p.price,
    category: p.category,
    imageUrl: img(p.image),
    description: '',
    prepTimeMinutes: 0,
    isAvailable: true,
    isDemo: true,
    rating: 5,
    reviewsCount: 0,
    ordersCount: 0,
    // Keep the listed order: newest first in the dashboard.
    createdAt: new Date(now.getTime() - i * 1000).toISOString(),
  }));
}

/**
 * Seeds sample products once per store. Stores created before this feature that still have
 * an empty menu get them on their next load; a store that already has products, or whose
 * owner has removed the samples, is left untouched.
 */
export function withDemoProducts<T extends { tenant: any; products: any[] }>(data: T): T | null {
  if (!data?.tenant || data.tenant.demoSeeded) return null;
  const products = Array.isArray(data.products) && data.products.length ? data.products : createDemoProducts();
  return { ...data, products, tenant: { ...data.tenant, demoSeeded: true } };
}
