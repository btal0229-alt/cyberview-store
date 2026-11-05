import { verifyRequestOrigin } from '@netlify/identity';
import { getDatabase } from '@netlify/database';
import { and, eq, desc } from 'drizzle-orm';
import { db } from '../../db/index';
import { activationProducts, activationKeys, activationFulfillments } from '../../db/schema';
import { InputError, identifier, fulfillOrder } from '../lib/fulfill-order';
import { LICENSE_HEADER, storeForKey } from '../lib/license-auth';

const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export default async (req: Request) => {
  if (req.method === 'POST') {
    try { verifyRequestOrigin(req); } catch { return reply({ error: 'مصدر الطلب غير مسموح.' }, 403); }
  }
  const tenantId = new URL(req.url).searchParams.get('tenant');
  if (!identifier(tenantId)) return reply({ error: 'المتجر غير صالح.' }, 400);
  try {
    const store = await storeForKey(getDatabase().pool, req.headers.get(LICENSE_HEADER));
    if (!store || !store.active || store.id !== tenantId) return reply({ error: 'فعّل المتجر بمفتاح ترخيص صالح أولاً.' }, 403);
    // Inventory stays scoped to the store owner recorded at activation.
    const user = { id: store.owner_id };
    if (req.method === 'GET') {
      const products = await db.select().from(activationProducts).where(and(eq(activationProducts.ownerId, user.id), eq(activationProducts.tenantId, tenantId)));
      const keys = await db.select({ id: activationKeys.id, inventoryId: activationKeys.inventoryId, code: activationKeys.code, orderId: activationKeys.orderId })
        .from(activationKeys).innerJoin(activationProducts, eq(activationProducts.id, activationKeys.inventoryId))
        .where(and(eq(activationProducts.ownerId, user.id), eq(activationProducts.tenantId, tenantId)));
      const history = await db.select({ orderId: activationFulfillments.orderId, order: activationFulfillments.order, createdAt: activationFulfillments.createdAt })
        .from(activationFulfillments).where(and(eq(activationFulfillments.ownerId, user.id), eq(activationFulfillments.tenantId, tenantId))).orderBy(desc(activationFulfillments.createdAt)).limit(50);
      return reply({ products: products.map(p => ({ productId: p.productId, enabled: p.enabled, keys: keys.filter(k => k.inventoryId === p.id).map(k => ({ id: k.id, masked: '••••' + k.code.slice(-4), orderId: k.orderId })) })), history: history.map(h => ({ orderId: h.orderId, customerName: h.order.customerName, createdAt: h.createdAt })) });
    }
    if (req.method !== 'POST') return reply({ error: 'طريقة غير مدعومة.' }, 405);
    const body = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new InputError('بيانات غير صالحة.');
    const client = await getDatabase().pool.connect();
    try {
      await client.query('BEGIN');
      // One lock per owner/store serializes stock changes and retries across all products.
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [JSON.stringify([user.id, tenantId])]);
      let result: unknown;
      if (body.action === 'invoice') {
        if (!identifier(body.orderId)) throw new InputError('رقم الطلب غير صالح.');
        const saved = await client.query('SELECT "order" FROM activation_fulfillments WHERE owner_id=$1 AND tenant_id=$2 AND order_id=$3', [user.id, tenantId, body.orderId]);
        result = { order: saved.rows[0]?.order ?? null };
      } else if (body.action === 'fulfill') {
        result = { order: await fulfillOrder(client, user.id, tenantId, body.order) };
      } else {
        if (!identifier(body.productId)) throw new InputError('المنتج غير صالح.');
        await client.query('INSERT INTO activation_products (id,owner_id,tenant_id,product_id) VALUES ($1,$2,$3,$4) ON CONFLICT (owner_id,tenant_id,product_id) DO NOTHING', [crypto.randomUUID(), user.id, tenantId, body.productId]);
        const inventory = await client.query('SELECT id FROM activation_products WHERE owner_id=$1 AND tenant_id=$2 AND product_id=$3', [user.id, tenantId, body.productId]);
        const inventoryId = inventory.rows[0].id;
        if (body.action === 'configure') {
          if (typeof body.enabled !== 'boolean') throw new InputError('حالة التفعيل غير صالحة.');
          await client.query('UPDATE activation_products SET enabled=$1 WHERE id=$2', [body.enabled, inventoryId]);
          result = { success: true };
        } else if (body.action === 'import') {
          if (!Array.isArray(body.codes) || !body.codes.length || body.codes.length > 500 || body.codes.some((c: unknown) => typeof c !== 'string' || !c.trim() || c.length > 500)) throw new InputError('أدخل حتى 500 كود، كل كود في سطر مستقل (بحد أقصى 500 حرف).');
          const codes = [...new Set<string>(body.codes.map((c: string) => c.trim()))];
          const inserted = await client.query('INSERT INTO activation_keys (id,inventory_id,code) SELECT gen_random_uuid()::text,$1,code FROM unnest($2::text[]) AS code ON CONFLICT (code) DO NOTHING RETURNING id', [inventoryId, codes]);
          const added = inserted.rows.length;
          result = { added, skipped: body.codes.length - added };
        } else if (body.action === 'delete') {
          if (!identifier(body.keyId)) throw new InputError('الكود غير صالح.');
          const deleted = await client.query('DELETE FROM activation_keys WHERE id=$1 AND inventory_id=$2 AND order_id IS NULL RETURNING id', [body.keyId, inventoryId]);
          if (!deleted.rows.length) throw new InputError('لا يمكن حذف كود مستخدم أو غير موجود.', 409);
          result = { success: true };
        } else throw new InputError('عملية غير صالحة.');
      }
      await client.query('COMMIT');
      return reply(result);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
  } catch (error) {
    if (error instanceof InputError) return reply({ error: error.message }, error.status);
    if (error instanceof SyntaxError) return reply({ error: 'بيانات غير صالحة.' }, 400);
    return reply({ error: 'تعذر تنفيذ العملية. حاول مرة أخرى.' }, 500);
  }
};
