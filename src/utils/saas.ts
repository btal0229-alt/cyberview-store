import { getOwnerToken, licenseHeaders } from './license';
export async function saasApi(body?: unknown, query = '') {
  const response = await fetch('/.netlify/functions/saas' + query, { method: body ? 'POST' : 'GET', credentials: 'same-origin', headers: { ...licenseHeaders(), ...(getOwnerToken() ? { 'X-Owner-Token': getOwnerToken() } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
  let data;
  try { data = await response.json(); } catch { throw new Error('تعذر الاتصال بالخادم'); }
  if (!response.ok) throw Object.assign(new Error(data.error || 'تعذر الاتصال'), { status: response.status });
  return data;
}
