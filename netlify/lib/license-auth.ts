import { createHash } from 'node:crypto';
import type { QueryClient } from './fulfill-order';

export const LICENSE_HEADER = 'x-license-key';
export const LICENSE_PATTERN = /^PRO-SA-[A-Z0-9]{4}-[A-Z0-9]{4}-\d{4}$/;
export const normalizeKey = (code: string) => code.replace(/\s+/g, '').toUpperCase();
export const hashKey = (code: string) => createHash('sha256').update(normalizeKey(code)).digest('hex');

export interface KeyStore { id: string; owner_id: string; data: any; plan_id: string; revoked: boolean; expires_at: string | null; active: boolean }

/** Resolves the store whose *current* license matches the key sent by the browser. */
export async function storeForKey(db: QueryClient, key: string | null | undefined, lock = false): Promise<KeyStore | null> {
  if (!key || key.length > 200) return null;
  const { rows } = await db.query(`SELECT s.id,s.owner_id,s.data,l.plan_id,l.revoked,l.expires_at FROM saas_stores s JOIN saas_licenses l ON l.id=s.license_id WHERE l.code_hash=$1${lock ? ' FOR UPDATE OF s,l' : ''}`, [hashKey(key)]);
  const row = rows[0];
  if (!row) return null;
  return { ...row, active: !row.revoked && (!row.expires_at || new Date(row.expires_at) > new Date()) };
}
