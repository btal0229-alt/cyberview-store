import type { Order } from '../../src/types';
export class InputError extends Error { constructor(message: string, public status = 400) { super(message); } }
export const identifier = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= 200;
export interface QueryClient { query(text: string, values?: unknown[]): Promise<{ rows: any[] }> }

// Caller holds a store advisory lock and rolls the transaction back on any error.
export async function fulfillOrder(client: QueryClient, ownerId: string, tenantId: string, order: Order): Promise<Order> {
  if (!order || !identifier(order.id) || order.tenantId !== tenantId || !Array.isArray(order.items) || !order.items.length || order.items.length > 100 || typeof order.customerName !== 'string' || order.customerName.length > 200 || typeof order.customerPhone !== 'string' || order.customerPhone.length > 50 || !Number.isFinite(order.totalAmount) || order.totalAmount < 0) throw new InputError('بيانات الطلب غير صالحة.');
  for (const item of order.items) {
    if (!item || !identifier(item.productId) || typeof item.productName !== 'string' || item.productName.length > 300 || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 1000 || !Number.isFinite(item.unitPrice) || item.unitPrice < 0) throw new InputError('كميات أو منتجات الطلب غير صالحة.');
  }
  const saved = await client.query('SELECT "order" FROM activation_fulfillments WHERE owner_id=$1 AND tenant_id=$2 AND order_id=$3', [ownerId, tenantId, order.id]);
  if (saved.rows.length) {
    const signature = (o: Order) => JSON.stringify([o.customerName, o.customerPhone, o.totalAmount, o.items.map(i => [i.productId, i.quantity, i.unitPrice])]);
    if (signature(saved.rows[0].order) !== signature(order)) throw new InputError('رقم الطلب مستخدم لفاتورة مختلفة. لم يتم خصم أي كود.', 409);
    return saved.rows[0].order;
  } else {
    // Discard any codes supplied by the browser; only database codes are authoritative.
    const fulfilled: Order = { ...order, status: 'delivered', items: order.items.map(({ activationCodes: _ignored, ...item }) => ({ ...item })) };
    for (const item of fulfilled.items) {
      const inventory = await client.query('SELECT id, enabled FROM activation_products WHERE owner_id=$1 AND tenant_id=$2 AND product_id=$3', [ownerId, tenantId, item.productId]);
      if (!inventory.rows[0]?.enabled) continue;
      const available = await client.query('SELECT id, code FROM activation_keys WHERE inventory_id=$1 AND order_id IS NULL ORDER BY created_at, id LIMIT $2 FOR UPDATE', [inventory.rows[0].id, item.quantity]);
      if (available.rows.length !== item.quantity) throw new InputError(`مخزون أكواد «${item.productName}» غير كافٍ. المطلوب ${item.quantity} والمتوفر ${available.rows.length}. لم يتم خصم أي كود.`, 409);
      await client.query('UPDATE activation_keys SET order_id=$1, assigned_at=NOW() WHERE id = ANY($2::text[])', [order.id, available.rows.map((k: { id: string }) => k.id)]);
      item.activationCodes = available.rows.map((k: { code: string }) => k.code);
    }
    await client.query('INSERT INTO activation_fulfillments (id,owner_id,tenant_id,order_id,"order") VALUES ($1,$2,$3,$4,$5::jsonb)', [crypto.randomUUID(), ownerId, tenantId, order.id, JSON.stringify(fulfilled)]);
    return fulfilled;
  }
}
