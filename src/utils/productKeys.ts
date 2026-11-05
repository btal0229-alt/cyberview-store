import { getActivation, licenseHeaders } from './license';
export async function productKeysApi(tenantId: string, body?: unknown) {
  if (!getActivation()) throw new Error('فعّل المتجر بمفتاح الترخيص أولاً.');
  const response = await fetch(`/.netlify/functions/product-keys?tenant=${encodeURIComponent(tenantId)}`, {
    method: body ? 'POST' : 'GET',
    credentials: 'same-origin',
    headers: { ...licenseHeaders(), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data;
  try { data = await response.json(); } catch { throw new Error('تعذر الاتصال بخدمة الأكواد. حاول مرة أخرى.'); }
  if (!response.ok) throw new Error(data.error || 'تعذر تنفيذ العملية.');
  return data;
}
