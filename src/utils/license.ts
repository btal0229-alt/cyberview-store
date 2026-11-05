const STORAGE_KEY = 'store_license_activation';
export const KEY_PATTERN = /^PRO-SA-[A-Z0-9]{4}-[A-Z0-9]{4}-\d{4}$/;

export interface SavedActivation { key: string; storeId: string; activatedAt: string }

export function getActivation(): SavedActivation | null {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return value && typeof value.key === 'string' && typeof value.storeId === 'string' ? value : null;
  } catch { return null; }
}
export const saveActivation = (key: string, storeId: string) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ key, storeId, activatedAt: new Date().toISOString() }));
export const clearActivation = () => localStorage.removeItem(STORAGE_KEY);
export const licenseHeaders = (): Record<string, string> => { const a = getActivation(); return a ? { 'X-License-Key': a.key } : {}; };

/** Formats typed or pasted input into PRO-SA-XXXX-XXXX-2026 as the user types. */
export function formatKeyInput(raw: string): string {
  let chars = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (chars.startsWith('PROSA')) chars = chars.slice(5);
  else if ('PROSA'.startsWith(chars)) return chars.length > 3 ? 'PRO-' + chars.slice(3) : chars;
  const body = chars.slice(0, 12);
  const parts = [body.slice(0, 4), body.slice(4, 8), body.slice(8, 12)].filter(Boolean);
  return ['PRO-SA', ...parts].join('-');
}

const OWNER_KEY = 'store_owner_session';
export const getOwnerToken = () => { try { return localStorage.getItem(OWNER_KEY) || ''; } catch { return ''; } };
export const saveOwnerToken = (token: string) => localStorage.setItem(OWNER_KEY, token);
export const clearOwnerToken = () => localStorage.removeItem(OWNER_KEY);
