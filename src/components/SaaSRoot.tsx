import React, { useCallback, useEffect, useRef, useState } from 'react';
import { logout } from '@netlify/identity';
import { KeyRound, Store, ShieldCheck, LogOut, Copy, Check, Sparkles, ArrowLeft, Settings } from 'lucide-react';
import App from '../App';
import { Storefront } from './Storefront';
import { saasApi } from '../utils/saas';
import { KEY_PATTERN, clearActivation, clearOwnerToken, getOwnerToken, saveOwnerToken, formatKeyInput, getActivation, saveActivation } from '../utils/license';

const PLAN_NAMES: Record<string, string> = { 'plan-starter': 'البداية', 'plan-pro': 'الاحتراف', 'plan-enterprise': 'الأعمال' };
const input = 'w-full border border-stone-300 bg-white rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600';
const button = 'rounded-xl px-5 py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold disabled:opacity-50 transition';
const maskKey = (key: string) => key.replace(/^(PRO-SA-)[A-Z0-9]{4}-[A-Z0-9]{4}/, '$1••••-••••');

function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const run = async (fn: () => Promise<void>) => { setBusy(true); setError(''); setNotice(''); try { await fn(); } catch (e: any) { setError(e.message); } finally { setBusy(false); } };
  return { busy, error, notice, setError, setNotice, run };
}

function Alerts({ error, notice }: { error: string; notice: string }) {
  return <>{error && <p role="alert" className="p-4 bg-red-50 text-red-800 rounded-xl">{error}</p>}{notice && <p role="status" className="p-4 bg-emerald-50 text-emerald-800 rounded-xl">{notice}</p>}</>;
}

function CopyButton({ text, label = 'نسخ' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); }
    catch { const area = document.createElement('textarea'); area.value = text; document.body.appendChild(area); area.select(); document.execCommand('copy'); area.remove(); }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  return <button type="button" onClick={() => void copy()} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold transition ${copied ? 'bg-emerald-600 text-white' : 'bg-stone-900 text-white hover:bg-stone-700'}`}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'تم النسخ' : label}</button>;
}

function KeyField({ value, onChange, autoFocus }: { value: string; onChange: (v: string) => void; autoFocus?: boolean }) {
  return <input aria-label="مفتاح التفعيل" className={input + ' font-mono text-lg text-center tracking-[0.15em]'} dir="ltr" required autoFocus={autoFocus} placeholder="PRO-SA-XXXX-XXXX-2026" value={value} maxLength={21} onChange={e => onChange(formatKeyInput(e.target.value))} autoComplete="off" autoCapitalize="characters" spellCheck={false} />;
}

function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <main dir="rtl" className="min-h-screen bg-stone-100 text-stone-900 px-4 py-10"><div className="max-w-3xl mx-auto space-y-6"><header className="flex items-center gap-4"><div className="p-4 bg-amber-700 rounded-2xl text-white"><Store /></div><div><p className="text-amber-800 text-sm font-bold">{subtitle}</p><h1 className="text-3xl font-bold">{title}</h1></div></header>{children}</div></main>;
}

/* ---------------- Customer: first-run activation ---------------- */
function ActivationScreen({ onActivated, reason }: { onActivated: () => void; reason?: string }) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const { busy, error, notice, run } = useAction();
  const valid = KEY_PATTERN.test(code);
  return <main dir="rtl" className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-amber-900 text-white flex items-center justify-center px-4 py-10">
    <div className="w-full max-w-lg space-y-6">
      <div className="text-center space-y-3"><div className="inline-flex p-4 bg-amber-600 rounded-3xl shadow-lg"><KeyRound size={32} /></div><h1 className="text-3xl font-extrabold">تفعيل نسختك</h1><p className="text-stone-300">أدخل مفتاح التفعيل الذي استلمته عند الشراء لفتح لوحة تحكم متجرك.</p></div>
      <form className="bg-white text-stone-900 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl" onSubmit={e => { e.preventDefault(); void run(async () => {
        if (!valid) throw new Error('صيغة المفتاح غير صحيحة. مثال: PRO-SA-XXXX-XXXX-2026');
        const result = await saasApi({ action: 'activate', code, name });
        saveActivation(code, result.storeId);
        onActivated();
      }); }}>
        {reason && <p className="p-4 bg-amber-100 text-amber-900 rounded-xl text-sm">{reason}</p>}
        <Alerts error={error} notice={notice} />
        <label className="block space-y-2"><span className="font-bold">مفتاح التفعيل (License Key)</span><KeyField value={code} onChange={setCode} autoFocus /><span className="block text-xs text-stone-500">يمكنك لصق المفتاح مباشرة؛ تُضاف الشرطات تلقائياً.</span></label>
        <label className="block space-y-2"><span className="font-bold">اسم المتجر <span className="font-normal text-stone-500">(اختياري، يمكن تغييره لاحقاً)</span></span><input className={input} value={name} maxLength={150} onChange={e => setName(e.target.value)} placeholder="متجري" /></label>
        <button disabled={busy || !valid} className={button + ' w-full text-lg flex items-center justify-center gap-2'}>{busy ? 'جارٍ التحقق…' : <>تفعيل وفتح لوحة التحكم <ArrowLeft size={18} /></>}</button>
        <p className="text-xs text-stone-500 text-center">يُحفظ التفعيل على هذا الجهاز، ويمكنك استخدام المفتاح نفسه لفتح متجرك من جهاز آخر.</p>
      </form>
      <p className="text-center text-sm text-stone-400"><a className="underline hover:text-white" href="/?view=owner">دخول المالك</a></p>
    </div>
  </main>;
}

/* ---------------- Customer: account & license settings ---------------- */
function AccountPanel({ store, onBack, onReload, onDeactivate, flush, pending }: { store: any; onBack: () => void; onReload: () => Promise<void>; onDeactivate: () => void; flush: () => Promise<void>; pending: () => boolean }) {
  const tenant = store.data.tenant;
  const [name, setName] = useState(tenant.name);
  const [whatsapp, setWhatsapp] = useState(tenant.whatsapp || '');
  const [logo, setLogo] = useState(tenant.avatarImage || '');
  const [code, setCode] = useState('');
  const { busy, error, notice, setNotice, run } = useAction();
  const key = getActivation()?.key || '';
  const link = `${location.origin}/?view=store&tenant=${store.id}`;
  return <Shell title={store.active ? 'إعدادات متجرك' : 'تجديد الترخيص'} subtitle="منصة المتاجر">
    <Alerts error={error} notice={notice} />
    <div className="flex gap-4 flex-wrap">{store.active && <button className={button} onClick={onBack}>فتح لوحة المتجر</button>}<button onClick={() => { if (confirm('إلغاء التفعيل من هذا الجهاز؟ ستحتاج إلى المفتاح لفتح المتجر مجدداً.')) onDeactivate(); }} className="flex items-center gap-2 text-stone-700"><LogOut size={16} /> إلغاء التفعيل من هذا الجهاز</button></div>
    <section className="bg-white rounded-3xl border p-6 space-y-3"><h2 className="font-bold text-xl flex gap-2"><ShieldCheck className="text-amber-700" />الترخيص</h2>
      <dl className="grid sm:grid-cols-3 gap-3 text-sm"><div className="bg-stone-50 rounded-xl p-3"><dt className="text-stone-500">المفتاح</dt><dd className="font-mono" dir="ltr">{maskKey(key)}</dd></div><div className="bg-stone-50 rounded-xl p-3"><dt className="text-stone-500">الباقة</dt><dd className="font-bold">{PLAN_NAMES[store.planId] || store.planId}</dd></div><div className="bg-stone-50 rounded-xl p-3"><dt className="text-stone-500">الصلاحية</dt><dd className="font-bold">{store.expiresAt ? new Date(store.expiresAt).toLocaleDateString('ar-SA') : 'دائم'}</dd></div></dl>
      {!store.active && <p className="p-4 bg-amber-100 rounded-xl">انتهى الترخيص أو تم إيقافه. أدخل مفتاحاً جديداً للتجديد مع الاحتفاظ بكل بيانات متجرك.</p>}
    </section>
    {store.active && <section className="bg-white rounded-3xl border p-6 space-y-4"><h2 className="font-bold text-xl">هوية المتجر</h2><label className="block">اسم المتجر<input className={input} value={name} onChange={e => setName(e.target.value)} /></label><label className="block">واتساب مع رمز الدولة<input className={input} dir="ltr" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} /></label><label className="block">رابط الشعار<input className={input} type="url" dir="ltr" value={logo} onChange={e => setLogo(e.target.value)} /></label><button disabled={busy || !name.trim()} className={button} onClick={() => void run(async () => { await flush(); if (pending()) throw new Error('احفظ التغييرات المعلقة أولاً'); const latest = await saasApi(undefined, '?scope=store'); await saasApi({ action: 'save', data: { ...latest.store.data, tenant: { ...latest.store.data.tenant, name, whatsapp, avatarImage: logo } } }); await onReload(); setNotice('حُفظت هوية المتجر'); })}>حفظ الهوية</button>
      <div className="space-y-2"><p className="font-bold">رابط متجرك للعملاء:</p><div className="flex gap-2 items-center flex-wrap"><a className="break-all text-amber-800 underline flex-1" href={link}>{link}</a><CopyButton text={link} label="نسخ الرابط" /></div></div></section>}
    <form className="bg-white border rounded-3xl p-6 space-y-4" onSubmit={e => { e.preventDefault(); void run(async () => {
      if (!KEY_PATTERN.test(code)) throw new Error('صيغة المفتاح غير صحيحة. مثال: PRO-SA-XXXX-XXXX-2026');
      const result = await saasApi({ action: 'activate', code, renewFrom: key });
      saveActivation(code, result.storeId); setCode(''); await onReload(); setNotice('تم تجديد الترخيص بنجاح');
    }); }}><h2 className="text-xl font-bold flex gap-2"><KeyRound />تجديد أو ترقية الترخيص</h2><KeyField value={code} onChange={setCode} /><button disabled={busy || !KEY_PATTERN.test(code)} className={button}>{busy ? 'جارٍ التحقق…' : 'تفعيل المفتاح الجديد'}</button></form>
  </Shell>;
}

/* ---------------- Owner: key generation panel ---------------- */
function OwnerPanel() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [configured, setConfigured] = useState(true);
  const [password, setPassword] = useState('');
  const [planId, setPlanId] = useState('plan-pro');
  const [days, setDays] = useState(365);
  const [clientName, setClientName] = useState('');
  const [generated, setGenerated] = useState<{ code: string; clientName: string; planId: string }[]>([]);
  const { busy, error, notice, setError, run } = useAction();
  const load = useCallback(async () => {
    try { setSession(await saasApi()); }
    catch (e: any) { if (e.status === 401) { clearOwnerToken(); setSession(null); } else throw e; }
  }, []);
  useEffect(() => {
    // Probe the owner status once so we can tell whether a password has been configured.
    fetch('/.netlify/functions/saas', { headers: getOwnerToken() ? { 'X-Owner-Token': getOwnerToken() } : {} })
      .then(async r => { const data = await r.json(); if (r.ok) setSession(data); else { if (r.status === 401) clearOwnerToken(); if (data.configured === false) setConfigured(false); } })
      .catch(() => setError('تعذر الاتصال بالخادم'))
      .finally(() => setReady(true));
  }, [setError]);
  if (!ready) return <Shell title="لوحة المالك" subtitle="منصة المتاجر"><p>جارٍ التحقق…</p></Shell>;
  if (!session) return <Shell title="لوحة المالك" subtitle="منصة المتاجر"><Alerts error={error} notice={notice} />
    {!configured && <p className="p-4 bg-amber-100 text-amber-900 rounded-xl">لم تُضبط كلمة مرور المالك بعد. أضف متغير البيئة <bdi className="font-mono">OWNER_PASSWORD</bdi> في إعدادات المشروع على Netlify ثم أعد النشر.</p>}
    <form className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4" onSubmit={e => { e.preventDefault(); void run(async () => {
      const result = await saasApi({ action: 'owner-login', password });
      saveOwnerToken(result.token); setPassword(''); await load();
    }); }}><h2 className="text-xl font-bold flex gap-2"><ShieldCheck className="text-amber-700" />دخول المالك</h2><p className="text-stone-600">أدخل كلمة مرور المالك لفتح لوحة توليد مفاتيح التفعيل مباشرة — بدون بريد إلكتروني.</p>
      <label className="block">كلمة مرور المالك<input className={input} type="password" dir="ltr" required autoFocus autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} /></label>
      <div className="flex gap-5 items-center flex-wrap"><button disabled={busy || !password} className={button}>{busy ? 'جارٍ الدخول…' : 'دخول'}</button><a href="/" className="text-sm underline text-stone-500">صفحة تفعيل العملاء</a></div></form></Shell>;
  const signOut = <button onClick={() => { clearOwnerToken(); void logout().catch(() => {}); setSession(null); }} className="flex items-center gap-2"><LogOut size={16} /> تسجيل الخروج</button>;
  const latest = generated[0];
  return <Shell title="لوحة المالك" subtitle="إدارة مفاتيح التفعيل"><Alerts error={error} notice={notice} />
    <div className="flex gap-4 flex-wrap items-center text-sm text-stone-600"><span>مرحباً بك أيها المالك</span>{signOut}</div>
    <section className="bg-stone-900 text-stone-100 rounded-3xl p-6 space-y-5">
      <h2 className="text-xl font-bold flex gap-2"><ShieldCheck />توليد مفتاح تفعيل جديد</h2>
      <p className="text-sm text-stone-300">عند كل عملية شراء، ولّد مفتاحاً وانسخه وأرسله للعميل. الصيغة: <bdi className="font-mono">PRO-SA-XXXX-XXXX-2026</bdi></p>
      <form className="space-y-3" onSubmit={e => { e.preventDefault(); void run(async () => { const result = await saasApi({ action: 'generate', planId, days, clientName }); setGenerated(list => [{ code: result.code, clientName, planId }, ...list]); setClientName(''); await load(); }); }}>
        <input aria-label="اسم العميل" className={input} placeholder="اسم العميل (اختياري)" value={clientName} maxLength={150} onChange={e => setClientName(e.target.value)} />
        <div className="grid sm:grid-cols-2 gap-3"><select aria-label="الباقة" className={input} value={planId} onChange={e => setPlanId(e.target.value)}>{Object.entries(PLAN_NAMES).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select><select aria-label="الصلاحية" className={input} value={days} onChange={e => setDays(Number(e.target.value))}><option value={30}>30 يوماً من الإصدار</option><option value={365}>سنة من الإصدار</option><option value={0}>دائم</option></select></div>
        <button disabled={busy} className={button + ' w-full sm:w-auto text-lg flex items-center justify-center gap-2'}><Sparkles size={18} />{busy ? 'جارٍ التوليد…' : 'توليد مفتاح تفعيل جديد'}</button>
      </form>
      {latest && <div className="bg-amber-50 text-stone-900 p-5 rounded-2xl space-y-3"><p className="text-sm font-bold text-amber-900">المفتاح الجديد{latest.clientName && ` — ${latest.clientName}`} ({PLAN_NAMES[latest.planId]})</p><code dir="ltr" className="block text-center text-xl sm:text-2xl font-mono font-bold tracking-wider bg-white rounded-xl p-4 select-all break-all">{latest.code}</code><div className="flex gap-3 flex-wrap items-center"><CopyButton text={latest.code} label="نسخ المفتاح" /><CopyButton text={`مفتاح تفعيل متجرك: ${latest.code}\nافتح ${location.origin} وأدخل المفتاح لتفعيل لوحة التحكم.`} label="نسخ رسالة للعميل" /></div><p className="text-xs text-stone-600">لأمان العملاء يُحفظ المفتاح مشفّراً، ولا يظهر كاملاً إلا في هذه الجلسة. انسخه قبل مغادرة الصفحة.</p></div>}
      {generated.length > 1 && <div className="space-y-2"><p className="text-sm text-stone-300">مفاتيح أخرى وُلّدت في هذه الجلسة:</p>{generated.slice(1).map(g => <div key={g.code} className="flex items-center justify-between gap-3 bg-stone-800 rounded-xl p-3"><code dir="ltr" className="font-mono">{g.code}</code><span className="text-xs text-stone-400 flex-1">{g.clientName}</span><CopyButton text={g.code} /></div>)}</div>}
    </section>
    <section className="bg-white rounded-3xl border p-6 space-y-3"><h2 className="text-xl font-bold">المفاتيح المُصدرة</h2><div className="overflow-x-auto"><table className="w-full text-sm text-right"><thead><tr className="text-stone-500"><th className="p-2">المفتاح / العميل</th><th>الباقة</th><th>الحالة</th><th>الانتهاء</th><th>الإدارة</th></tr></thead><tbody>{session.licenses.map((l: any) => <tr key={l.id} className="border-t border-stone-200"><td className="p-3"><code dir="ltr">PRO-SA-{l.suffix}-…</code><p className="text-stone-500">{l.client_name}</p></td><td>{PLAN_NAMES[l.plan_id] || l.plan_id}</td><td>{l.revoked ? 'موقوف' : l.expires_at && new Date(l.expires_at) <= new Date() ? 'منتهي' : l.claimed_by ? 'مُفعّل' : 'متاح'}</td><td>{l.expires_at ? new Date(l.expires_at).toLocaleDateString('ar-SA') : 'دائم'}</td><td><button disabled={busy} className="underline text-amber-800" onClick={() => void run(async () => { await saasApi({ action: 'revoke', id: l.id, revoked: !l.revoked }); await load(); })}>{l.revoked ? 'إعادة التفعيل' : 'إيقاف'}</button></td></tr>)}</tbody></table>{!session.licenses.length && <p className="py-4 text-stone-400">لم تُصدر مفاتيح بعد.</p>}</div></section>
  </Shell>;
}

/* ---------------- Root ---------------- */
export default function SaaSRoot() {
  const params = new URLSearchParams(location.search);
  const view = params.get('view') || '';
  const publicId = ['', 'store', 'customer'].includes(view) ? params.get('tenant') || params.get('store') : null;
  const ownerView = view === 'owner';
  if (publicId) return <PublicCatalog publicId={publicId} />;
  if (ownerView) return <OwnerPanel />;
  return <CustomerApp />;
}

function PublicCatalog({ publicId }: { publicId: string }) {
  const [catalog, setCatalog] = useState<any>(null);
  const [error, setError] = useState('');
  useEffect(() => { saasApi(undefined, '?public=' + encodeURIComponent(publicId)).then(setCatalog).catch(e => setError(e.message)); }, [publicId]);
  if (error) return <main dir="rtl" className="min-h-screen bg-stone-100 p-10 text-center"><p role="alert" className="text-stone-700">{error}</p></main>;
  if (!catalog) return <main dir="rtl" className="min-h-screen bg-stone-100 p-10 text-center text-stone-500"><p>جارٍ تحميل المتجر…</p></main>;
  return <Storefront tenant={catalog.tenant} products={catalog.products} onSubmitOrder={async input => (await saasApi({ action: 'place-order', storeId: publicId, ...input })).order} />;
}

function CustomerApp() {
  const [activated, setActivated] = useState(() => !!getActivation());
  const [store, setStore] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [loadError, setLoadError] = useState('');
  const [account, setAccount] = useState(false);
  const [saved, setSaved] = useState('');
  const pending = useRef<any>(null);
  const saving = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const load = useCallback(async () => {
    setLoadError('');
    try { const data = await saasApi(undefined, '?scope=store'); setStore(data.store); if (!data.store.active) setAccount(true); }
    catch (e: any) {
      if (e.status === 401) { clearActivation(); setActivated(false); setStore(null); setReason('المفتاح المحفوظ على هذا الجهاز لم يعد صالحاً. أدخل مفتاح تفعيل صحيحاً.'); }
      else setLoadError(e.message);
    }
  }, []);
  useEffect(() => { if (activated) void load(); return () => clearTimeout(timer.current); }, [activated, load]);

  const flush = useCallback(async () => {
    if (saving.current || !pending.current) return;
    const data = pending.current; pending.current = null; saving.current = true;
    try { await saasApi({ action: 'save', data }); setSaved('تم حفظ بيانات المتجر'); }
    catch (e: any) { if (!pending.current) pending.current = data; setSaved('تعذر الحفظ: ' + e.message + ' — اضغط لإعادة المحاولة'); }
    finally { saving.current = false; }
    if (pending.current && pending.current !== data) void flush();
  }, []);
  const persist = useCallback((data: any) => { setStore((previous: any) => previous ? { ...previous, data } : previous); pending.current = data; setSaved('جارٍ حفظ التغييرات…'); clearTimeout(timer.current); timer.current = setTimeout(flush, 600); }, [flush]);

  if (!activated) return <ActivationScreen reason={reason} onActivated={() => { setReason(''); setAccount(false); setActivated(true); }} />;
  if (!store) return <main dir="rtl" className="min-h-screen bg-stone-100 p-12 text-stone-600 space-y-4">{loadError ? <><p role="alert" className="text-red-800">{loadError}</p><button className={button} onClick={() => void load()}>إعادة المحاولة</button></> : <p>جارٍ فتح لوحة متجرك…</p>}</main>;
  if (account || !store.active) return <AccountPanel store={store} onBack={() => setAccount(false)} onReload={load} flush={flush} pending={() => !!pending.current}
    onDeactivate={() => { clearTimeout(timer.current); pending.current = null; clearActivation(); setStore(null); setAccount(false); setActivated(false); }} />;
  return <><div dir="rtl" className="bg-stone-900 text-stone-100 px-5 py-2 flex justify-between items-center text-sm"><button className="flex items-center gap-2" onClick={() => setAccount(true)}><Settings size={14} /> الترخيص وإعدادات المتجر</button><button onClick={() => void flush()}>{saved || 'متجرك مفعّل ومتصل'}</button></div><App key={store.id} initial={store.data} onPersist={persist} onManage={() => setAccount(true)} /></>;
}
