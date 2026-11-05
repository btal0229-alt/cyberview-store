import { getStore } from '@netlify/blobs';
import { getDatabase } from '@netlify/database';
import { verifyRequestOrigin } from '@netlify/identity';
import { randomUUID } from 'node:crypto';
import { LICENSE_HEADER, storeForKey } from '../lib/license-auth';

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
const reply = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });

/** Uploads meal photos (from the phone gallery/camera) and serves them back by key. */
export default async (req: Request) => {
  const images = getStore('meal-images');
  const url = new URL(req.url);
  const prefix = '/api/meal-images/';

  if (req.method === 'GET') {
    const key = decodeURIComponent(url.pathname.slice(prefix.length));
    if (!/^[\w-]+\/[\w-]+\.(jpg|png|webp|gif)$/.test(key)) return new Response('Not found', { status: 404 });
    const result = await images.getWithMetadata(key, { type: 'stream' });
    if (!result) return new Response('Not found', { status: 404 });
    return new Response(result.data, { headers: { 'Content-Type': String(result.metadata.contentType || 'image/jpeg'), 'Cache-Control': 'public, max-age=31536000, immutable' } });
  }

  if (req.method !== 'POST') return reply({ error: 'طريقة غير مدعومة' }, 405);
  try { verifyRequestOrigin(req); } catch { return reply({ error: 'مصدر غير مسموح' }, 403); }

  const store = await storeForKey(getDatabase().pool, req.headers.get(LICENSE_HEADER));
  if (!store || !store.active) return reply({ error: 'يجب تفعيل المتجر قبل رفع الصور' }, 401);

  const contentType = (req.headers.get('content-type') || '').split(';')[0].trim();
  const ext = TYPES[contentType];
  if (!ext) return reply({ error: 'نوع الملف غير مدعوم، استخدم صورة JPG أو PNG أو WEBP' }, 415);
  const body = await req.arrayBuffer();
  if (!body.byteLength) return reply({ error: 'الملف فارغ' }, 400);
  if (body.byteLength > MAX_BYTES) return reply({ error: 'حجم الصورة كبير جداً (الحد 5 ميجابايت)' }, 413);

  const key = `${store.id.replace(/[^\w-]/g, '')}/${randomUUID()}.${ext}`;
  await images.set(key, body, { metadata: { contentType } });
  return reply({ url: prefix + key });
};

export const config = { path: '/api/meal-images/*' };
