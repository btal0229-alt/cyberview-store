import { getUser, verifyRequestOrigin } from '@netlify/identity';
import { getDatabase } from '@netlify/database';
import { createHash, createHmac, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import { LICENSE_HEADER, hashKey, storeForKey } from '../lib/license-auth';
import { createDemoProducts, withDemoProducts } from '../lib/demo-products';

const reply = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const PLANS = ['plan-starter', 'plan-pro', 'plan-enterprise'];
export const generateLicenseCode = () => {
  const group = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
  return `PRO-SA-${group()}-${group()}-2026`;
};
const publicStore = (s: { id: string; data: any; plan_id: string; expires_at: string | null; active: boolean }) => ({ id: s.id, data: s.data, planId: s.plan_id, expiresAt: s.expires_at, active: s.active });

const MAX_ORDERS = 3000;
type StorefrontInput = { storeId: string; customerName: string; customerPhone: string; address: string; notes: string; items: { productId: string; quantity: number }[] };
/** Checks the shape of an order sent from the public storefront (no login required). */
export function validateStorefrontOrder(body: any): StorefrontInput | { error: string } {
  const storeId = typeof body.storeId === 'string' ? body.storeId : '';
  if (!storeId || storeId.length > 100) return { error: 'المتجر غير صالح' };
  const customerName = typeof body.customerName === 'string' ? body.customerName.trim().replace(/\s+/g, ' ') : '';
  if (customerName.length < 2 || customerName.length > 80) return { error: 'اكتب اسمك (حرفان على الأقل)' };
  const customerPhone = typeof body.customerPhone === 'string' ? body.customerPhone.replace(/[\s-]/g, '') : '';
  if (!/^\+?\d{8,15}$/.test(customerPhone)) return { error: 'اكتب رقم جوال صحيح' };
  const address = typeof body.address === 'string' ? body.address.trim().slice(0, 300) : '';
  const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 500) : '';
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 50) return { error: 'السلة فارغة' };
  const items: StorefrontInput['items'] = [];
  for (const item of body.items) {
    if (!item || typeof item.productId !== 'string' || item.productId.length > 200 || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) return { error: 'كمية غير صالحة في السلة' };
    const existing = items.find(i => i.productId === item.productId);
    if (existing) existing.quantity = Math.min(99, existing.quantity + item.quantity); else items.push({ productId: item.productId, quantity: item.quantity });
  }
  return { storeId, customerName, customerPhone, address, notes, items };
}
/** Builds the order from the store's saved menu so prices always come from the merchant. */
export function buildStorefrontOrder(data: any, input: StorefrontInput, now = new Date()) {
  const products: any[] = Array.isArray(data?.products) ? data.products : [];
  if (data?.tenant?.isOpen === false && !data?.tenant?.autoScheduleEnabled) return { error: 'المتجر مغلق حالياً ولا يستقبل طلبات' } as const;
  const items = [];
  for (const { productId, quantity } of input.items) {
    const product = products.find(p => p?.id === productId);
    if (!product || !product.isAvailable) return { error: `المنتج «${product?.name || ''}» لم يعد متوفراً، حدّث الصفحة وحاول مجدداً` } as const;
    items.push({ productId, productName: String(product.name), quantity, unitPrice: Number(product.price) || 0 });
  }
  const totalAmount = Math.round(items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0) * 100) / 100;
  const order = {
    id: `ORD-${now.getTime().toString(36).toUpperCase()}${randomInt(36 ** 3).toString(36).toUpperCase().padStart(3, '0')}`,
    tenantId: input.storeId,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    items,
    totalAmount,
    status: 'pending',
    createdAt: now.toISOString(),
    deliveryType: input.address ? 'delivery' : 'pickup',
    ...(input.address ? { address: input.address } : {}),
    paymentMethod: 'cash',
    ...(input.notes ? { customerNotes: input.notes } : {}),
    source: 'storefront',
  };
  return { order } as const;
}

export const OWNER_HEADER = 'x-owner-token';
const OWNER_SESSION_MS = 30 * 86400000;
const ownerPasswordFromEnv = () => (globalThis as any).Netlify?.env?.get?.('OWNER_PASSWORD') ?? process.env.OWNER_PASSWORD;
const digest = (value: string) => createHash('sha256').update(value).digest();
const sign = (password: string, exp: number) => createHmac('sha256', digest('owner-session:' + password)).update('owner:' + exp).digest('hex');
/** Stateless owner session token; changing OWNER_PASSWORD invalidates every issued token. */
export const createOwnerToken = (password: string, now = Date.now()) => { const exp = now + OWNER_SESSION_MS; return `${exp}.${sign(password, exp)}`; };
export const verifyOwnerToken = (password: string | undefined, token: string | null) => {
  if (!password || !token || token.length > 200) return false;
  const [expRaw, signature] = token.split('.');
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp <= Date.now() || !signature) return false;
  return timingSafeEqual(digest(signature), digest(sign(password, exp)));
};

export function createSaasHandler(deps: { getUser: typeof getUser; getDatabase: typeof getDatabase; verifyRequestOrigin: typeof verifyRequestOrigin; ownerPassword?: () => string | undefined } = { getUser, getDatabase, verifyRequestOrigin, ownerPassword: ownerPasswordFromEnv }) {
const ownerPassword = deps.ownerPassword ?? ownerPasswordFromEnv;
/** The owner is recognised by the password-based session token, or (legacy) a Netlify Identity admin. */
const isOwner = async (req: Request) => {
  if (verifyOwnerToken(ownerPassword(), req.headers.get(OWNER_HEADER))) return true;
  try { const user = await deps.getUser(); return !!(user?.roles?.includes('admin') || user?.roles?.includes('superadmin')); } catch { return false; }
};
return async (req: Request) => {
  try {
    if (!['GET', 'POST'].includes(req.method)) return reply({ error: 'طريقة غير مدعومة' }, 405);
    if (req.method === 'POST') { try { deps.verifyRequestOrigin(req); } catch { return reply({ error: 'مصدر غير مسموح' }, 403); } }
    const database = deps.getDatabase();
    const url = new URL(req.url);
    const publicId = url.searchParams.get('public');
    const licenseKey = req.headers.get(LICENSE_HEADER);

    if (req.method === 'GET' && publicId) {
      const { rows } = await database.pool.query(`SELECT s.data FROM saas_stores s JOIN saas_licenses l ON l.id=s.license_id WHERE s.id=$1 AND NOT l.revoked AND (l.expires_at IS NULL OR l.expires_at>NOW())`, [publicId]);
      if (!rows[0]) return reply({ error: 'المتجر غير متاح' }, 404);
      const { tenant, products } = rows[0].data;
      const { id, name, avatarImage, bannerImage, brandColor, city, district, isOpen, schedule, autoScheduleEnabled, categories } = tenant;
      return reply({ tenant: { id, name, avatarImage, bannerImage, brandColor, city, district, isOpen, schedule, autoScheduleEnabled, categories }, products: (products || []).filter((p: any) => p.isAvailable) });
    }

    // Customer store session: the license key saved in the browser is the credential.
    if (req.method === 'GET' && url.searchParams.get('scope') === 'store') {
      const store = await storeForKey(database.pool, licenseKey);
      if (!store) return reply({ error: 'مفتاح التفعيل غير صالح أو تم استبداله' }, 401);
      // Older stores created with an empty menu get the sample products once.
      const seeded = store.active ? withDemoProducts(store.data) : null;
      if (seeded) {
        const { rowCount } = await database.pool.query(`UPDATE saas_stores SET data=$1,updated_at=NOW() WHERE id=$2 AND NOT COALESCE((data->'tenant'->>'demoSeeded')::boolean,false)`, [JSON.stringify(seeded), store.id]);
        if (rowCount) store.data = seeded;
      }
      return reply({ store: publicStore(store) });
    }

    // Owner (platform admin) panel.
    if (req.method === 'GET') {
      if (!(await isOwner(req))) return reply({ error: 'سجّل دخول المالك أولاً', configured: !!ownerPassword() }, 401);
      const licenses = (await database.pool.query(`SELECT id,suffix,plan_id,expires_at,revoked,client_name,claimed_by,created_at FROM saas_licenses ORDER BY created_at DESC LIMIT 500`)).rows;
      return reply({ admin: true, licenses });
    }

    const raw = await req.text();
    if (raw.length > 2000000) return reply({ error: 'البيانات أكبر من الحد المسموح' }, 413);
    const body = JSON.parse(raw);

    if (body.action === 'owner-login') {
      const expected = ownerPassword();
      if (!expected) return reply({ error: 'لم تُضبط كلمة مرور المالك بعد (OWNER_PASSWORD) في إعدادات المشروع' }, 503);
      if (typeof body.password !== 'string' || body.password.length > 200 || !timingSafeEqual(digest(body.password), digest(expected))) {
        await new Promise(r => setTimeout(r, 400));
        return reply({ error: 'كلمة مرور المالك غير صحيحة' }, 401);
      }
      return reply({ token: createOwnerToken(expected) });
    }

    if (['generate', 'revoke'].includes(body.action)) {
      if (!(await isOwner(req))) return reply({ error: 'هذه العملية لمالك المنصة فقط' }, 403);
      if (body.action === 'revoke') {
        if (typeof body.revoked !== 'boolean' || typeof body.id !== 'string') return reply({ error: 'حالة غير صالحة' }, 400);
        await database.pool.query('UPDATE saas_licenses SET revoked=$1 WHERE id=$2', [body.revoked, body.id]);
        return reply({ success: true });
      }
      if (!PLANS.includes(body.planId) || ![30, 365, 0].includes(body.days)) return reply({ error: 'باقة أو مدة غير صالحة' }, 400);
      const code = generateLicenseCode();
      const expiry = body.days ? new Date(Date.now() + body.days * 86400000) : null;
      await database.pool.query('INSERT INTO saas_licenses (id,code_hash,suffix,plan_id,expires_at,client_name) VALUES ($1,$2,$3,$4,$5,$6)', [randomUUID(), hashKey(code), code.slice(7, 16), body.planId, expiry, String(body.clientName || '').slice(0, 150)]);
      return reply({ code });
    }

    const client = await database.pool.connect();
    try {
      await client.query('BEGIN');
      if (body.action === 'activate') {
        if (typeof body.code !== 'string' || !body.code.trim() || body.code.length > 200) { await client.query('ROLLBACK'); return reply({ error: 'أدخل مفتاح التفعيل' }, 400); }
        await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [hashKey(body.code)]);
        const license = (await client.query('SELECT * FROM saas_licenses WHERE code_hash=$1 FOR UPDATE', [hashKey(body.code)])).rows[0];
        if (!license || license.revoked || (license.expires_at && new Date(license.expires_at) <= new Date())) { await client.query('ROLLBACK'); return reply({ error: 'مفتاح التفعيل غير صحيح أو منتهي الصلاحية' }, 409); }
        // Key already linked to a store: just reopen it (e.g. on a new device).
        const current = (await client.query('SELECT id FROM saas_stores WHERE license_id=$1', [license.id])).rows[0];
        if (current) { await client.query('COMMIT'); return reply({ success: true, storeId: current.id }); }
        if (license.claimed_by) { await client.query('ROLLBACK'); return reply({ error: 'هذا المفتاح استُبدل بمفتاح أحدث ولم يعد صالحاً' }, 409); }
        const expiryDate = license.expires_at ? new Date(license.expires_at).toISOString().slice(0, 10) : undefined;
        const previous = typeof body.renewFrom === 'string' ? await storeForKey(client, body.renewFrom, true) : null;
        if (previous) {
          const data = { ...previous.data, tenant: { ...previous.data.tenant, subscriptionStatus: 'active', subscriptionPlanId: license.plan_id, subscriptionExpiryDate: expiryDate } };
          await client.query('UPDATE saas_licenses SET claimed_by=$1 WHERE id=$2', [previous.owner_id, license.id]);
          // The previous key stays claimed so it can never be sold or reused again.
          await client.query('UPDATE saas_stores SET license_id=$1,data=$2,updated_at=NOW() WHERE id=$3', [license.id, JSON.stringify(data), previous.id]);
          await client.query('COMMIT');
          return reply({ success: true, storeId: previous.id });
        }
        const id = randomUUID();
        const ownerId = 'license:' + license.id;
        const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim().slice(0, 150) : (license.client_name || 'متجري');
        const tenant = { id, name, ownerName: license.client_name || '', type: 'family', city: '', district: '', whatsapp: String(body.whatsapp || '').slice(0, 30), avatarImage: '', bannerImage: '', rating: 0, totalOrders: 0, totalRevenue: 0, isOpen: true, demoSeeded: true, subscriptionStatus: 'active', subscriptionPlanId: license.plan_id, subscriptionExpiryDate: expiryDate };
        await client.query('UPDATE saas_licenses SET claimed_by=$1 WHERE id=$2', [ownerId, license.id]);
        await client.query('INSERT INTO saas_stores (id,owner_id,license_id,data) VALUES ($1,$2,$3,$4)', [id, ownerId, license.id, JSON.stringify({ tenant, products: createDemoProducts(), orders: [], reviews: [] })]);
        await client.query('COMMIT');
        return reply({ success: true, storeId: id });
      }
      if (body.action === 'place-order') {
        const input = validateStorefrontOrder(body);
        if ('error' in input) { await client.query('ROLLBACK'); return reply({ error: input.error }, 400); }
        const { rows } = await client.query(`SELECT s.id,s.data FROM saas_stores s JOIN saas_licenses l ON l.id=s.license_id WHERE s.id=$1 AND NOT l.revoked AND (l.expires_at IS NULL OR l.expires_at>NOW()) FOR UPDATE OF s`, [input.storeId]);
        if (!rows[0]) { await client.query('ROLLBACK'); return reply({ error: 'المتجر غير متاح حالياً' }, 404); }
        const data = rows[0].data;
        const result = buildStorefrontOrder(data, input);
        if ('error' in result) { await client.query('ROLLBACK'); return reply({ error: result.error }, 409); }
        const order = result.order;
        const orders = [order, ...(Array.isArray(data.orders) ? data.orders : [])].slice(0, MAX_ORDERS);
        const tenant = { ...data.tenant, totalOrders: (Number(data.tenant?.totalOrders) || 0) + 1, totalRevenue: (Number(data.tenant?.totalRevenue) || 0) + order.totalAmount };
        await client.query('UPDATE saas_stores SET data=$1,updated_at=NOW() WHERE id=$2', [JSON.stringify({ ...data, tenant, orders }), input.storeId]);
        await client.query('COMMIT');
        return reply({ success: true, order });
      }
      if (body.action === 'save') {
        const store = await storeForKey(client, licenseKey, true);
        if (!store || !store.active) { await client.query('ROLLBACK'); return reply({ error: 'الترخيص غير نشط' }, 403); }
        const data = body.data;
        if (!data?.tenant || !Array.isArray(data.products) || !Array.isArray(data.orders) || !Array.isArray(data.reviews) || typeof data.tenant.name !== 'string' || !data.tenant.name.trim()) { await client.query('ROLLBACK'); return reply({ error: 'بيانات المتجر غير صالحة' }, 400); }
        data.tenant = { ...data.tenant, id: store.id, demoSeeded: true, subscriptionStatus: 'active', subscriptionPlanId: store.data.tenant.subscriptionPlanId, subscriptionExpiryDate: store.data.tenant.subscriptionExpiryDate, licenseKey: undefined };
        // Storefront orders may arrive while the dashboard is saving older data: never drop them.
        const sent = new Set(data.orders.map((o: any) => o?.id));
        const missed = (Array.isArray(store.data.orders) ? store.data.orders : []).filter((o: any) => o?.source === 'storefront' && !sent.has(o.id));
        if (missed.length) {
          data.orders = [...missed, ...data.orders];
          data.tenant.totalOrders = (Number(data.tenant.totalOrders) || 0) + missed.length;
          data.tenant.totalRevenue = (Number(data.tenant.totalRevenue) || 0) + missed.reduce((sum: number, o: any) => sum + (Number(o.totalAmount) || 0), 0);
        }
        data.orders = data.orders.map((o: any) => ({ ...o, tenantId: store.id, items: (o.items || []).map(({ activationCodes, ...item }: any) => item) }));
        data.reviews = data.reviews.map((r: any) => ({ ...r, tenantId: store.id }));
        await client.query('UPDATE saas_stores SET data=$1,updated_at=NOW() WHERE id=$2', [JSON.stringify(data), store.id]);
        await client.query('COMMIT');
        return reply({ success: true });
      }
      await client.query('ROLLBACK');
      return reply({ error: 'عملية غير صالحة' }, 400);
    } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
  } catch (error) { return reply({ error: error instanceof SyntaxError ? 'بيانات غير صالحة' : 'تعذر تنفيذ العملية، حاول مجدداً' }, error instanceof SyntaxError ? 400 : 500); }
};
}
export default createSaasHandler();
