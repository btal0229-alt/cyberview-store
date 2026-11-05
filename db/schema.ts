import { pgTable, text, boolean, timestamp, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';
import type { Order } from '../src/types';

export const activationProducts = pgTable('activation_products', {
  id: text().primaryKey(),
  ownerId: text('owner_id').notNull(),
  tenantId: text('tenant_id').notNull(),
  productId: text('product_id').notNull(),
  enabled: boolean().notNull().default(true),
}, t => [uniqueIndex('activation_product_scope').on(t.ownerId, t.tenantId, t.productId)]);

export const activationKeys = pgTable('activation_keys', {
  id: text().primaryKey(),
  inventoryId: text('inventory_id').notNull().references(() => activationProducts.id),
  code: text().notNull(),
  orderId: text('order_id'),
  assignedAt: timestamp('assigned_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, t => [uniqueIndex('activation_code_unique').on(t.code)]);

export const activationFulfillments = pgTable('activation_fulfillments', {
  id: text().primaryKey(),
  ownerId: text('owner_id').notNull(),
  tenantId: text('tenant_id').notNull(),
  orderId: text('order_id').notNull(),
  order: jsonb().$type<Order>().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, t => [uniqueIndex('activation_order_unique').on(t.ownerId, t.tenantId, t.orderId)]);

export const saasLicenses = pgTable('saas_licenses', {
  id: text().primaryKey(),
  codeHash: text('code_hash').notNull().unique(),
  suffix: text().notNull(),
  planId: text('plan_id').notNull(),
  expiresAt: timestamp('expires_at'),
  revoked: boolean().notNull().default(false),
  clientName: text('client_name').notNull().default(''),
  claimedBy: text('claimed_by'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
export const saasStores = pgTable('saas_stores', {
  id: text().primaryKey(),
  ownerId: text('owner_id').notNull().unique(),
  licenseId: text('license_id').notNull().unique().references(() => saasLicenses.id),
  data: jsonb().notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
