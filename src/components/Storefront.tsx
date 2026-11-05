import React, { useEffect, useMemo, useState } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, X, CheckCircle2, Loader2, Receipt, Store, ArrowRight } from 'lucide-react';
import type { Order, Product, Tenant } from '../types';
import { getCategories, isUncategorized, UNCATEGORIZED, formatOrderTime } from '../utils/categories';
import { isTenantOpenNow } from '../utils/scheduleHelper';

export interface CheckoutInput {
  customerName: string;
  customerPhone: string;
  address: string;
  notes: string;
  items: { productId: string; quantity: number }[];
}

interface StorefrontProps {
  tenant: Tenant;
  products: Product[];
  /** Sends the order to the store; resolves with the saved order. */
  onSubmitOrder: (input: CheckoutInput) => Promise<Order>;
  /** Shown in the dashboard preview so the merchant can go back. */
  onClose?: () => void;
  previewNote?: string;
}

type CartLine = { productId: string; quantity: number };

const read = <T,>(key: string, fallback: T): T => {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
};
const write = (key: string, value: unknown) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full or blocked */ } };

const money = (n: number) => `${n.toLocaleString('ar-SA')} ر.س`;
const field = 'w-full border border-stone-300 bg-white rounded-xl px-4 py-3 text-base text-stone-900 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10';

export const Storefront: React.FC<StorefrontProps> = ({ tenant, products, onSubmitOrder, onClose, previewNote }) => {
  const cartKey = `storefront-cart:${tenant.id}`;
  const ordersKey = `storefront-orders:${tenant.id}`;
  const brand = tenant.brandColor || '#b45309';

  const [cart, setCart] = useState<CartLine[]>(() => read<CartLine[]>(cartKey, []));
  const [category, setCategory] = useState('all');
  const [sheet, setSheet] = useState<'none' | 'cart' | 'checkout' | 'done' | 'history'>('none');
  const [customer, setCustomer] = useState(() => read('storefront-customer', { name: '', phone: '', address: '' }));
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [myOrders, setMyOrders] = useState<Order[]>(() => read<Order[]>(ordersKey, []));
  const [flash, setFlash] = useState('');

  const available = useMemo(() => products.filter(p => p.isAvailable), [products]);
  const categories = getCategories(tenant);
  const tabs = useMemo(() => {
    const used = categories.filter(c => available.some(p => p.category === c.id));
    const hasOther = available.some(p => isUncategorized(categories, p));
    return [{ id: 'all', label: 'الكل', emoji: '' }, ...used, ...(hasOther ? [UNCATEGORIZED] : [])];
  }, [categories, available]);
  const shown = category === 'all' ? available
    : category === '' ? available.filter(p => isUncategorized(categories, p))
    : available.filter(p => p.category === category);

  // Drop cart lines for products that were removed or became unavailable.
  const lines = cart.map(l => ({ ...l, product: available.find(p => p.id === l.productId) })).filter((l): l is CartLine & { product: Product } => !!l.product);
  const count = lines.reduce((s, l) => s + l.quantity, 0);
  const total = lines.reduce((s, l) => s + l.quantity * l.product.price, 0);
  const open = isTenantOpenNow(tenant).isOpen;

  useEffect(() => { write(cartKey, cart); }, [cart, cartKey]);
  useEffect(() => { if (!tabs.some(t => t.id === category)) setCategory('all'); }, [tabs, category]);
  useEffect(() => { if (!flash) return; const t = setTimeout(() => setFlash(''), 1600); return () => clearTimeout(t); }, [flash]);

  const qty = (id: string) => cart.find(l => l.productId === id)?.quantity || 0;
  const change = (id: string, delta: number) => setCart(prev => {
    const current = prev.find(l => l.productId === id);
    if (!current) return delta > 0 ? [...prev, { productId: id, quantity: Math.min(99, delta) }] : prev;
    const next = Math.min(99, current.quantity + delta);
    return next > 0 ? prev.map(l => l.productId === id ? { ...l, quantity: next } : l) : prev.filter(l => l.productId !== id);
  });
  const add = (p: Product) => { change(p.id, 1); setFlash(`أُضيف «${p.name}» إلى السلة`); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const name = customer.name.trim();
    const phone = customer.phone.replace(/[\s-]/g, '');
    if (name.length < 2) return setError('اكتب اسمك.');
    if (!/^\+?\d{8,15}$/.test(phone)) return setError('اكتب رقم جوال صحيح، مثل 05xxxxxxxx.');
    if (!lines.length) return setError('السلة فارغة.');
    setError(''); setBusy(true);
    try {
      const order = await onSubmitOrder({ customerName: name, customerPhone: phone, address: customer.address.trim(), notes: notes.trim(), items: lines.map(l => ({ productId: l.productId, quantity: l.quantity })) });
      write('storefront-customer', { name, phone, address: customer.address.trim() });
      const history = [order, ...myOrders].slice(0, 30);
      setMyOrders(history); write(ordersKey, history);
      setLastOrder(order); setCart([]); setNotes(''); setSheet('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر إرسال الطلب، حاول مجدداً.');
    } finally { setBusy(false); }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-stone-100 text-stone-900 pb-28">
      {previewNote && (
        <div className="sticky top-0 z-30 bg-stone-900 text-white text-sm px-4 py-2.5 flex items-center justify-between gap-3">
          <span>{previewNote}</span>
          {onClose && <button onClick={onClose} className="flex items-center gap-1.5 font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"><ArrowRight className="w-4 h-4" />رجوع للوحة التحكم</button>}
        </div>
      )}

      <header className="text-white" style={{ background: brand }}>
        <div className="max-w-3xl mx-auto px-4 pt-8 pb-6 flex items-center gap-4">
          {tenant.avatarImage
            ? <img src={tenant.avatarImage} alt="" className="w-16 h-16 rounded-2xl object-cover bg-white/20 shrink-0" />
            : <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0"><Store className="w-8 h-8" /></div>}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold truncate">{tenant.name}</h1>
            <p className="text-sm text-white/85 mt-1 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${open ? 'bg-emerald-300' : 'bg-rose-300'}`} />
              {open ? 'يستقبل الطلبات الآن' : 'مغلق حالياً'}
              {(tenant.city || tenant.district) && <span>· {[tenant.district, tenant.city].filter(Boolean).join('، ')}</span>}
            </p>
          </div>
          {myOrders.length > 0 && (
            <button onClick={() => setSheet('history')} className="shrink-0 flex items-center gap-1.5 text-sm font-bold bg-white/15 hover:bg-white/25 px-3 py-2 rounded-xl">
              <Receipt className="w-4 h-4" />طلباتي
            </button>
          )}
        </div>
      </header>

      <nav className="sticky z-20 bg-stone-100/95 backdrop-blur border-b border-stone-200" style={{ top: previewNote ? 44 : 0 }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id || 'other'} onClick={() => setCategory(t.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border transition ${category === t.id ? 'text-white border-transparent' : 'bg-white border-stone-300 text-stone-700'}`}
              style={category === t.id ? { background: brand } : undefined}>
              {t.emoji ? `${t.emoji} ` : ''}{t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-5">
        {!open && <p className="mb-4 p-4 rounded-2xl bg-rose-50 text-rose-800 text-sm font-bold">المتجر مغلق حالياً، يمكنك تصفح المنتجات والطلب عند فتحه.</p>}
        {!available.length && <p className="py-16 text-center text-stone-500">يُجهّز المتجر منتجاته حالياً.</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {shown.map(p => {
            const q = qty(p.id);
            return (
              <article key={p.id} className="bg-white rounded-2xl overflow-hidden border border-stone-200 flex flex-col">
                <button type="button" onClick={() => open && add(p)} disabled={!open} className="text-right flex-1 flex flex-col disabled:cursor-not-allowed" aria-label={`أضف ${p.name} إلى السلة`}>
                  <div className="aspect-square bg-stone-200 overflow-hidden">
                    {p.imageUrl && <img src={p.imageUrl} alt="" loading="lazy" className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-3 flex-1">
                    <h2 className="font-bold leading-snug line-clamp-2">{p.name}</h2>
                    <p className="mt-1 font-extrabold" style={{ color: brand }}>{money(p.price)}</p>
                  </div>
                </button>
                <div className="px-3 pb-3">
                  {q === 0 ? (
                    <button type="button" onClick={() => add(p)} disabled={!open} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white font-bold text-sm active:scale-95 transition disabled:opacity-40" style={{ background: brand }}>
                      <Plus className="w-4 h-4" />أضف للسلة
                    </button>
                  ) : (
                    <div className="flex items-center justify-between rounded-xl border-2 py-1 px-1" style={{ borderColor: brand }}>
                      <button type="button" onClick={() => change(p.id, 1)} aria-label="زيادة" className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ background: brand }}><Plus className="w-4 h-4" /></button>
                      <span className="font-extrabold text-lg">{q}</span>
                      <button type="button" onClick={() => change(p.id, -1)} aria-label="إنقاص" className="w-9 h-9 rounded-lg flex items-center justify-center bg-stone-100 text-stone-800">{q === 1 ? <Trash2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}</button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {flash && <div role="status" className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-stone-900 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg max-w-[90vw] truncate">{flash}</div>}

      {count > 0 && sheet === 'none' && (
        <div className="fixed bottom-0 inset-x-0 z-30 p-3 bg-gradient-to-t from-stone-100 via-stone-100/90">
          <button onClick={() => setSheet('cart')} className="max-w-3xl mx-auto w-full flex items-center justify-between gap-3 text-white font-extrabold px-5 py-4 rounded-2xl shadow-xl active:scale-[0.98] transition" style={{ background: brand }}>
            <span className="flex items-center gap-2"><span className="relative"><ShoppingBag className="w-6 h-6" /><span className="absolute -top-2 -left-2 bg-white text-stone-900 text-[11px] w-5 h-5 rounded-full flex items-center justify-center">{count}</span></span>عرض السلة وإتمام الطلب</span>
            <span>{money(total)}</span>
          </button>
        </div>
      )}

      {sheet !== 'none' && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={() => !busy && setSheet('none')}>
          <div onClick={e => e.stopPropagation()} className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <h2 className="text-lg font-extrabold">
                {sheet === 'cart' ? 'سلة التسوق' : sheet === 'checkout' ? 'إتمام الطلب' : sheet === 'done' ? 'تم إرسال طلبك' : 'طلباتي'}
              </h2>
              <button onClick={() => setSheet('none')} disabled={busy} aria-label="إغلاق" className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>

            {sheet === 'cart' && (
              <div className="p-5 space-y-4">
                {!lines.length && <p className="py-8 text-center text-stone-500">السلة فارغة.</p>}
                {lines.map(l => (
                  <div key={l.productId} className="flex items-center gap-3">
                    {l.product.imageUrl && <img src={l.product.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />}
                    <div className="flex-1 min-w-0"><p className="font-bold truncate">{l.product.name}</p><p className="text-sm text-stone-500">{money(l.product.price * l.quantity)}</p></div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => change(l.productId, 1)} aria-label="زيادة" className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                      <span className="w-6 text-center font-extrabold">{l.quantity}</span>
                      <button onClick={() => change(l.productId, -1)} aria-label="إنقاص" className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center">{l.quantity === 1 ? <Trash2 className="w-4 h-4 text-rose-600" /> : <Minus className="w-4 h-4" />}</button>
                    </div>
                  </div>
                ))}
                {lines.length > 0 && <>
                  <div className="flex justify-between pt-4 border-t border-stone-200 text-lg font-extrabold"><span>الإجمالي</span><span>{money(total)}</span></div>
                  <button onClick={() => { setError(''); setSheet('checkout'); }} disabled={!open} className="w-full py-4 rounded-2xl text-white font-extrabold text-lg disabled:opacity-40" style={{ background: brand }}>{open ? 'إتمام الطلب' : 'المتجر مغلق حالياً'}</button>
                  <button onClick={() => setSheet('none')} className="w-full py-2 text-stone-600 font-bold">متابعة التسوق</button>
                </>}
              </div>
            )}

            {sheet === 'checkout' && (
              <form onSubmit={submit} className="p-5 space-y-4">
                {error && <p role="alert" className="p-3 rounded-xl bg-rose-50 text-rose-800 text-sm font-bold">{error}</p>}
                <label className="block space-y-1.5"><span className="font-bold text-sm">الاسم</span>
                  <input className={field} value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} autoComplete="name" maxLength={80} required placeholder="اسمك" /></label>
                <label className="block space-y-1.5"><span className="font-bold text-sm">رقم الجوال</span>
                  <input className={field} dir="ltr" type="tel" inputMode="tel" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} autoComplete="tel" maxLength={20} required placeholder="05xxxxxxxx" /></label>
                <label className="block space-y-1.5"><span className="font-bold text-sm">العنوان <span className="font-normal text-stone-500">(اختياري، للتوصيل)</span></span>
                  <input className={field} value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} autoComplete="street-address" maxLength={300} placeholder="الحي، الشارع" /></label>
                <label className="block space-y-1.5"><span className="font-bold text-sm">ملاحظات <span className="font-normal text-stone-500">(اختياري)</span></span>
                  <textarea className={field} rows={2} value={notes} onChange={e => setNotes(e.target.value)} maxLength={500} /></label>
                <div className="rounded-2xl bg-stone-50 p-4 text-sm space-y-1">
                  {lines.map(l => <div key={l.productId} className="flex justify-between"><span>{l.quantity} × {l.product.name}</span><span>{money(l.quantity * l.product.price)}</span></div>)}
                  <div className="flex justify-between font-extrabold text-base pt-2 border-t border-stone-200 mt-2"><span>الإجمالي</span><span>{money(total)}</span></div>
                </div>
                <button disabled={busy} className="w-full py-4 rounded-2xl text-white font-extrabold text-lg flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: brand }}>
                  {busy ? <><Loader2 className="w-5 h-5 animate-spin" />جارٍ إرسال الطلب…</> : 'تأكيد الطلب'}
                </button>
                <button type="button" onClick={() => setSheet('cart')} disabled={busy} className="w-full py-2 text-stone-600 font-bold">رجوع للسلة</button>
              </form>
            )}

            {sheet === 'done' && lastOrder && (
              <div className="p-6 space-y-4 text-center">
                <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-600" />
                <p className="text-xl font-extrabold">وصل طلبك إلى المتجر</p>
                <p className="text-stone-600">سيراجع المتجر طلبك ويتواصل معك على الرقم <bdi dir="ltr" className="font-bold">{lastOrder.customerPhone}</bdi>.</p>
                <div className="rounded-2xl bg-stone-50 p-4 text-sm text-right space-y-1">
                  <div className="flex justify-between"><span className="text-stone-500">رقم الطلب</span><bdi dir="ltr" className="font-mono font-bold">{lastOrder.id}</bdi></div>
                  {lastOrder.items.map((i, idx) => <div key={idx} className="flex justify-between"><span>{i.quantity} × {i.productName}</span><span>{money(i.quantity * i.unitPrice)}</span></div>)}
                  <div className="flex justify-between font-extrabold text-base pt-2 border-t border-stone-200 mt-2"><span>الإجمالي</span><span>{money(lastOrder.totalAmount)}</span></div>
                </div>
                <button onClick={() => setSheet('none')} className="w-full py-4 rounded-2xl text-white font-extrabold" style={{ background: brand }}>طلب جديد</button>
              </div>
            )}

            {sheet === 'history' && (
              <div className="p-5 space-y-3">
                <p className="text-sm text-stone-500">الطلبات التي أرسلتها من هذا الجهاز.</p>
                {myOrders.map(o => (
                  <div key={o.id} className="rounded-2xl border border-stone-200 p-4 text-sm space-y-1">
                    <div className="flex justify-between gap-2"><bdi dir="ltr" className="font-mono font-bold">{o.id}</bdi><span className="text-stone-500">{formatOrderTime(o.createdAt)}</span></div>
                    <p className="text-stone-700">{o.items.map(i => `${i.quantity} × ${i.productName}`).join('، ')}</p>
                    <div className="flex justify-between"><span className="text-stone-500">أُرسل للمتجر</span><span className="font-extrabold">{money(o.totalAmount)}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
