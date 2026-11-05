import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fulfillOrder, type QueryClient } from '../netlify/lib/fulfill-order';
import type { Order } from '../src/types';

const order = (items = [{ productId: 'p1', productName: 'منتج تجريبي', quantity: 2, unitPrice: 10 }]): Order => ({
  id: 'test-order', tenantId: 'test-store', customerName: 'عميل تجريبي', customerPhone: '0500000000',
  status: 'ready', items, totalAmount: 20, createdAt: '2026-11-04', deliveryType: 'pickup',
});
function fixture(stock = 3) {
  const keys = Array.from({ length: stock }, (_, i) => ({ id: `key-${i}`, code: `fixture-${i}`, assigned: false }));
  let stored: Order | undefined;
  let inserts = 0;
  const client: QueryClient = { async query(sql, values = []) {
    if (sql.startsWith('SELECT "order"')) {
      assert.deepEqual(values, ['test-owner', 'test-store', 'test-order']);
      return { rows: stored ? [{ order: stored }] : [] };
    }
    if (sql.startsWith('SELECT id, enabled')) {
      assert.equal(values[0], 'test-owner'); assert.equal(values[1], 'test-store');
      return { rows: values[2] === 'food' ? [] : [{ id: 'inventory', enabled: true }] };
    }
    if (sql.startsWith('SELECT id, code')) return { rows: keys.filter(k => !k.assigned).slice(0, values[1] as number) };
    if (sql.startsWith('UPDATE activation_keys')) {
      for (const key of keys) if ((values[1] as string[]).includes(key.id)) key.assigned = true;
      return { rows: [] };
    }
    if (sql.startsWith('INSERT INTO activation_fulfillments')) {
      stored = JSON.parse(values[4] as string); inserts++;
      return { rows: [] };
    }
    throw new Error('Unexpected database operation');
  } };
  return { client, keys, get inserts() { return inserts; } };
}

test('allocates one distinct code per unit and discards codes submitted by browser', async () => {
  const f = fixture(); const input = order(); input.items[0].activationCodes = ['untrusted-fixture'];
  const result = await fulfillOrder(f.client, 'test-owner', 'test-store', input);
  assert.equal(result.status, 'delivered');
  assert.equal(result.items[0].activationCodes?.length, 2);
  assert.equal(new Set(result.items[0].activationCodes).size, 2);
  assert.ok(!result.items[0].activationCodes?.includes('untrusted-fixture'));
  assert.equal(f.keys.filter(k => !k.assigned).length, 1);
});

test('retry returns the original invoice without consuming more stock', async () => {
  const f = fixture();
  const first = await fulfillOrder(f.client, 'test-owner', 'test-store', order());
  const retry = await fulfillOrder(f.client, 'test-owner', 'test-store', order());
  assert.deepEqual(retry, first);
  assert.equal(f.inserts, 1);
  assert.equal(f.keys.filter(k => !k.assigned).length, 1);
});

test('insufficient stock rejects completion with conflict and saves no invoice', async () => {
  const f = fixture(1);
  await assert.rejects(fulfillOrder(f.client, 'test-owner', 'test-store', order()), { status: 409 });
  assert.equal(f.inserts, 0);
  assert.equal(f.keys.filter(k => k.assigned).length, 0);
});

test('repeated product lines receive different codes', async () => {
  const f = fixture(); const item = order().items[0];
  const result = await fulfillOrder(f.client, 'test-owner', 'test-store', order([{ ...item, quantity: 1 }, { ...item, quantity: 1 }]));
  assert.notEqual(result.items[0].activationCodes?.[0], result.items[1].activationCodes?.[0]);
});

test('ordinary products complete without an activation code', async () => {
  const f = fixture(); const input = order([{ productId: 'food', productName: 'وجبة', quantity: 1, unitPrice: 10 }]);
  const result = await fulfillOrder(f.client, 'test-owner', 'test-store', input);
  assert.equal(result.items[0].activationCodes, undefined);
  assert.equal(f.keys.filter(k => k.assigned).length, 0);
});

test('rejects invalid quantities and tenant mismatch before querying', async () => {
  const client: QueryClient = { query() { throw new Error('Database must not be called'); } };
  for (const quantity of [0, -1, 1.5, 1001]) {
    const input = order(); input.items[0].quantity = quantity;
    await assert.rejects(fulfillOrder(client, 'test-owner', 'test-store', input), { status: 400 });
  }
  await assert.rejects(fulfillOrder(client, 'test-owner', 'wrong-store', order()), { status: 400 });
});

test('rejects a different order reusing an already fulfilled order number', async () => {
  const f = fixture();
  await fulfillOrder(f.client, 'test-owner', 'test-store', order());
  const different = order(); different.customerName = 'عميل آخر';
  await assert.rejects(fulfillOrder(f.client, 'test-owner', 'test-store', different), { status: 409 });
  assert.equal(f.inserts, 1);
  assert.equal(f.keys.filter(k => !k.assigned).length, 1);
});
