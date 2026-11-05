import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createSaasHandler } from '../netlify/functions/saas.mts';
const digest = (code: string) => createHash('sha256').update(code).digest('hex');
function fixture(user: any, respond: (sql: string, args: any[]) => any[] = () => []) {
  const queries: {sql: string; args: any[]}[] = [];
  let released = false;
  const query = async (sql: string, args: any[] = []) => { queries.push({sql,args}); return { rows: respond(sql,args) }; };
  const client = { query, release: () => { released = true; } };
  const handler = createSaasHandler({ getUser: async () => user, getDatabase: () => ({ pool: { query, connect: async () => client } }) as any, verifyRequestOrigin: () => {}, ownerPassword: () => 'owner-secret-123' } as any);
  return { handler, queries, released: () => released };
}
const URL_ = 'https://example.com/.netlify/functions/saas';
const post = (body: any, key?: string) => new Request(URL_, { method: 'POST', headers: {'Content-Type':'application/json', ...(key ? {'X-License-Key': key} : {})}, body: JSON.stringify(body) });
const isLicense = (sql: string) => sql.startsWith('SELECT * FROM saas_licenses');
const isKeyStore = (sql: string) => sql.includes('WHERE l.code_hash=$1');

test('anonymous users cannot read owner data', async () => {
  const f = fixture(null); assert.equal((await f.handler(new Request(URL_))).status,401); assert.equal(f.queries.length,0);
});
test('store session without a known key is rejected', async () => {
  const f = fixture(null);
  assert.equal((await f.handler(new Request(URL_+'?scope=store', { headers: {'X-License-Key':'PRO-SA-AAAA-BBBB-2026'} }))).status,401);
  assert.equal((await f.handler(new Request(URL_+'?scope=store'))).status,401);
});
test('store session returns the store tied to the saved key', async () => {
  const code = 'PRO-SA-ABCD-EFGH-2026';
  const f = fixture(null, (sql,args) => isKeyStore(sql) && args[0]===digest(code) ? [{id:'store-a',owner_id:'license:l1',data:{tenant:{name:'متجر'}},plan_id:'plan-pro',revoked:false,expires_at:null}] : []);
  const res = await f.handler(new Request(URL_+'?scope=store', { headers: {'X-License-Key':code.toLowerCase()} }));
  assert.equal(res.status,200); const data = await res.json(); assert.equal(data.store.id,'store-a'); assert.equal(data.store.active,true); assert.equal(data.store.owner_id,undefined);
});
test('customers cannot generate or revoke platform licenses', async () => {
  for (const user of [null, {id:'customer',roles:[]}]) {
    const f = fixture(user);
    for (const action of ['generate','revoke']) assert.equal((await f.handler(post({action}))).status,403);
    assert.equal(f.queries.length,0);
  }
});
test('unknown keys fail and the transaction rolls back', async () => {
  const f = fixture(null);
  assert.equal((await f.handler(post({action:'activate',code:'PRO-SA-ZZZZ-ZZZZ-2026'}))).status,409);
  assert.ok(f.queries.some(q => q.sql==='ROLLBACK')); assert.ok(f.released());
  assert.ok(!f.queries.some(q => q.sql.startsWith('INSERT')));
});
test('expired, revoked and superseded licenses cannot activate', async () => {
  for (const record of [{expires_at:'2000-01-01'}, {revoked:true}, {claimed_by:'license:old'}]) {
    const f = fixture(null, sql => isLicense(sql) ? [{id:'license', ...record}] : []);
    assert.equal((await f.handler(post({action:'activate',code:'PRO-SA-AAAA-AAAA-2026'}))).status,409);
    assert.ok(f.queries.some(q => q.sql==='ROLLBACK'));
  }
});
test('valid key without login creates an isolated store with sample products and returns its id', async () => {
  const code = 'PRO-SA-ABCD-EFGH-2026';
  const f = fixture(null, (sql,args) => isLicense(sql) && args[0]===digest(code) ? [{id:'license',plan_id:'plan-pro',claimed_by:null,expires_at:null,client_name:''}] : []);
  const res = await f.handler(post({action:'activate',code:'  '+code.toLowerCase()+' '}));
  assert.equal(res.status,200); const body = await res.json();
  const insert = f.queries.find(q => q.sql.startsWith('INSERT INTO saas_stores'))!;
  const data = JSON.parse(insert.args[3]); assert.ok(data.products.length >= 5); assert.ok(data.products.every((p: any) => p.isDemo && p.name && p.price > 0 && p.imageUrl && p.category)); assert.equal(data.tenant.demoSeeded,true); assert.equal(insert.args[1],'license:license'); assert.equal(data.tenant.id,insert.args[0]); assert.equal(body.storeId,insert.args[0]);
  assert.equal(data.tenant.name,'متجري'); assert.equal(data.tenant.subscriptionStatus,'active');
  assert.ok(f.queries.some(q => q.sql==='COMMIT'));
});
test('re-entering an already activated key reopens the same store', async () => {
  const f = fixture(null, sql => isLicense(sql) ? [{id:'license',claimed_by:'license:license'}] : sql.startsWith('SELECT id FROM saas_stores') ? [{id:'store-a'}] : []);
  const res = await f.handler(post({action:'activate',code:'PRO-SA-AAAA-AAAA-2026'}));
  assert.equal(res.status,200); assert.equal((await res.json()).storeId,'store-a');
  assert.ok(!f.queries.some(q => q.sql.startsWith('INSERT') || q.sql.startsWith('UPDATE')));
});
test('renewal moves the store to the new key and preserves its data', async () => {
  const oldData = {tenant:{id:'existing-store',name:'متجر سابق'},products:[{id:'product'}],orders:[{id:'order'}],reviews:[]};
  const f = fixture(null, (sql,args) => isLicense(sql) ? [{id:'new-license',plan_id:'plan-enterprise',claimed_by:null}] : isKeyStore(sql) && args[0]===digest('PRO-SA-OLDD-KEYY-2026') ? [{id:'existing-store',owner_id:'user-1',data:oldData,expires_at:'2000-01-01'}] : []);
  assert.equal((await f.handler(post({action:'activate',code:'PRO-SA-NEWW-KEYY-2026',renewFrom:'PRO-SA-OLDD-KEYY-2026'}))).status,200);
  const update = f.queries.find(q => q.sql.startsWith('UPDATE saas_stores'))!;
  const data = JSON.parse(update.args[1]); assert.equal(update.args[0],'new-license'); assert.equal(update.args[2],'existing-store'); assert.deepEqual(data.products,oldData.products); assert.equal(data.tenant.subscriptionPlanId,'plan-enterprise');
  assert.deepEqual(f.queries.find(q => q.sql.startsWith('UPDATE saas_licenses'))!.args,['user-1','new-license']);
});
test('save requires the key of an active store', async () => {
  const f = fixture(null);
  assert.equal((await f.handler(post({action:'save',data:{tenant:{id:'someone-else'}}}))).status,403);
  assert.equal((await f.handler(post({action:'save',data:{tenant:{id:'x'}}}, 'PRO-SA-AAAA-AAAA-2026'))).status,403);
  assert.ok(f.queries.some(q => q.sql.includes('FOR UPDATE OF s,l'))); assert.ok(f.released());
});
test('public catalog excludes orders, reviews and license key', async () => {
  const f = fixture(null, () => [{data:{tenant:{id:'store-a',name:'متجر',licenseKey:'hidden'},products:[],orders:[{customerPhone:'private'}],reviews:[]}}]);
  const response = await f.handler(new Request(URL_+'?public=store-a'));
  const data = await response.json(); assert.deepEqual(Object.keys(data).sort(),['products','tenant']); assert.equal(data.tenant.licenseKey,undefined); assert.deepEqual(f.queries[0].args,['store-a']);
});
test('admin generation stores a digest and reveals the formatted key only in creation response', async () => {
  const f = fixture({id:'admin',roles:['admin']});
  const response = await f.handler(post({action:'generate',planId:'plan-pro',days:365,clientName:'عميل'}));
  assert.equal(response.status,200); const data = await response.json();
  assert.match(data.code,/^PRO-SA-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-2026$/);
  const insert = f.queries.find(q => q.sql.startsWith('INSERT INTO saas_licenses'))!;
  assert.equal(insert.args[1], digest(data.code)); assert.ok(!insert.args.includes(data.code)); assert.equal(insert.args[2], data.code.slice(7,16));
});

test('owner logs in with password only and can generate keys with the session token', async () => {
  const f = fixture(null);
  assert.equal((await f.handler(post({action:'owner-login',password:'wrong'}))).status,401);
  const login = await f.handler(post({action:'owner-login',password:'owner-secret-123'}));
  assert.equal(login.status,200); const { token } = await login.json(); assert.ok(token);
  const panel = await f.handler(new Request(URL_, { headers: {'X-Owner-Token': token} }));
  assert.equal(panel.status,200); assert.equal((await panel.json()).admin,true);
  const gen = await f.handler(new Request(URL_, { method:'POST', headers: {'Content-Type':'application/json','X-Owner-Token':token}, body: JSON.stringify({action:'generate',planId:'plan-pro',days:30}) }));
  assert.equal(gen.status,200);
  const forged = await f.handler(new Request(URL_, { method:'POST', headers: {'Content-Type':'application/json','X-Owner-Token':token.replace(/.$/, (c: string) => c==='0'?'1':'0')}, body: JSON.stringify({action:'generate',planId:'plan-pro',days:30}) }));
  assert.equal(forged.status,403);
});

test('older stores with an empty menu get sample products once', async () => {
  const code = 'PRO-SA-ABCD-EFGH-2026';
  const row = (data: any) => [{id:'store-a',owner_id:'license:l1',data,plan_id:'plan-pro',revoked:false,expires_at:null}];
  const f = fixture(null, (sql) => isKeyStore(sql) ? row({tenant:{name:'متجر'},products:[],orders:[],reviews:[]}) : []);
  const res = await f.handler(new Request(URL_+'?scope=store', { headers: {'X-License-Key':code} }));
  const update = f.queries.find(q => q.sql.startsWith('UPDATE saas_stores'));
  assert.ok(update); assert.ok(JSON.parse(update!.args[0] as string).tenant.demoSeeded);
  assert.equal(res.status,200);
  for (const data of [{tenant:{name:'متجر',demoSeeded:true},products:[],orders:[],reviews:[]}, {tenant:{name:'متجر'},products:[{id:'p1'}],orders:[],reviews:[]}]) {
    const g = fixture(null, (sql) => isKeyStore(sql) ? row(data) : []);
    const r = await g.handler(new Request(URL_+'?scope=store', { headers: {'X-License-Key':code} }));
    const body = await r.json();
    if (data.tenant.demoSeeded) assert.ok(!g.queries.some(q => q.sql.startsWith('UPDATE')));
    else assert.deepEqual(body.store.data.products.map((p: any) => p.id), ['p1']);
  }
});
