// Backfill order_items + order_addresses from legacy orders.items (JSONB) + orders.notes (free-text).
// SAFE + IDEMPOTENT: writes ONLY to the new tables. The orders table is never modified.
// Re-runnable: --apply first deletes any existing rows for the orders it touches, then re-inserts.
//
// Usage:
//   node scripts/backfill-order-items-addresses.mjs            # DRY-RUN (report only, no writes)
//   node scripts/backfill-order-items-addresses.mjs --apply    # LIVE (writes to new tables)
//   node scripts/backfill-order-items-addresses.mjs --store zaynahs [--apply]
import fs from 'fs';
import path from 'path';

const APPLY = process.argv.includes('--apply');
const storeArg = (() => { const i = process.argv.indexOf('--store'); return i > -1 ? process.argv[i + 1] : null; })();

const envDir = path.resolve(process.cwd(), 'env-backups');
let envFiles = fs.readdirSync(envDir).filter((f) => f.endsWith('.env.local'));
if (storeArg) envFiles = envFiles.filter((f) => f.startsWith(storeArg));

function creds(file) {
  const c = fs.readFileSync(path.join(envDir, file), 'utf8');
  const ref = (c.match(/SUPABASE_PROJECT_REF=([^\r\n]+)/) || [])[1]?.trim();
  let token = (c.match(/SUPABASE_MGMT_TOKEN=([^\r\n]+)/) || [])[1]?.trim();
  if ((!token || token.includes('placeholder'))) {
    const le = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(le)) token = (fs.readFileSync(le, 'utf8').match(/SUPABASE_MGMT_TOKEN=([^\r\n]+)/) || [])[1]?.trim();
  }
  return { ref, token };
}

async function query(ref, token, sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query: sql }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(data).slice(0, 200)}`);
  return data;
}

const sqlStr = (v) => (v === null || v === undefined || v === '' ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);
const sqlNum = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 'NULL'; };

function mapItemRows(orderId, items, validProductIds) {
  if (!Array.isArray(items)) return [];
  return items.map((it) => {
    const p = it.product || {};
    const img = Array.isArray(p.images) && p.images[0] ? (p.images[0].url || p.images[0].URL) : null;
    const qty = it.quantity ?? 1;
    const unit = Number(it.unit_price ?? it.price ?? p.price ?? 0);
    let pid = p.id ?? it.product_id ?? null;
    // Guard FK: if the product was later deleted, keep the name/sku/image snapshot but null the ref.
    if (pid && validProductIds && !validProductIds.has(pid)) pid = null;
    return {
      order_id: orderId,
      product_id: pid,
      variant_id: it.selected_variant?.id ?? it.variant_id ?? null,
      name: p.name ?? it.name ?? null,
      sku: it.selected_variant?.sku ?? it.sku ?? null,
      image_url: img ?? it.image_url ?? null,
      variant_label: it.selected_variant?.name ?? null,
      unit_price: unit,
      quantity: qty,
      item_discount: Number(it.discountAmount ?? it.item_discount ?? 0),
      line_total: Number(it.total ?? unit * qty),
    };
  });
}

// notes free-text -> structured address. Format: "Key: value" per line.
function parseAddress(orderId, notes) {
  if (!notes || typeof notes !== 'string') return null;
  const map = {};
  for (const line of notes.split(/\r?\n/)) {
    const m = line.match(/^\s*([^:]+?)\s*:\s*(.*)$/);
    if (m) map[m[1].trim().toLowerCase()] = m[2].trim();
  }
  if (Object.keys(map).length === 0) return null;
  const contact = map['contact'] || '';
  const isEmail = /@/.test(contact);
  let lat = null, lng = null;
  if (map['coordinates']) {
    const parts = map['coordinates'].split(',').map((s) => Number(s.trim()));
    if (parts.length === 2 && parts.every(Number.isFinite)) { lat = parts[0]; lng = parts[1]; }
  }
  const addr = {
    order_id: orderId,
    type: 'shipping',
    name: isEmail ? null : (contact || null),
    phone: map['phone'] || null,
    email: isEmail ? contact : null,
    address1: map['address'] || null,
    address2: map['apt/suite'] || map['apt'] || null,
    city: map['city'] || null,
    postal_code: map['postal'] || map['postal code'] || null,
    country: 'Pakistan',
    latitude: lat,
    longitude: lng,
    payment_method: map['payment method'] || null,
  };
  // Only meaningful if we captured at least one real address signal.
  if (!addr.address1 && !addr.city && !addr.phone && !addr.email) return null;
  return addr;
}

function itemInsertSQL(rows) {
  const vals = rows.map((r) => `(${sqlStr(r.order_id)}, ${r.product_id ? sqlStr(r.product_id) : 'NULL'}, ${r.variant_id ? sqlStr(r.variant_id) : 'NULL'}, ${sqlStr(r.name)}, ${sqlStr(r.sku)}, ${sqlStr(r.image_url)}, ${sqlStr(r.variant_label)}, ${sqlNum(r.unit_price)}, ${sqlNum(r.quantity)}, ${sqlNum(r.item_discount)}, ${sqlNum(r.line_total)})`).join(',\n');
  return `INSERT INTO order_items (order_id, product_id, variant_id, name, sku, image_url, variant_label, unit_price, quantity, item_discount, line_total) VALUES\n${vals};`;
}
function addrInsertSQL(a) {
  return `INSERT INTO order_addresses (order_id, type, name, phone, email, address1, address2, city, postal_code, country, latitude, longitude, payment_method) VALUES (${sqlStr(a.order_id)}, ${sqlStr(a.type)}, ${sqlStr(a.name)}, ${sqlStr(a.phone)}, ${sqlStr(a.email)}, ${sqlStr(a.address1)}, ${sqlStr(a.address2)}, ${sqlStr(a.city)}, ${sqlStr(a.postal_code)}, ${sqlStr(a.country)}, ${sqlNum(a.latitude)}, ${sqlNum(a.longitude)}, ${sqlStr(a.payment_method)});`;
}

async function run() {
  console.log(`\n=== Backfill order_items + order_addresses — mode: ${APPLY ? 'APPLY (LIVE)' : 'DRY-RUN (no writes)'} ===\n`);
  const summary = [];
  for (const file of envFiles) {
    const name = file.replace('.env.local', '');
    const { ref, token } = creds(file);
    if (!ref || !token) { summary.push({ store: name, status: 'SKIP (no ref/token)' }); continue; }

    const orders = await query(ref, token, `SELECT id, order_number, items, notes FROM orders ORDER BY created_at`);
    const prodRows = await query(ref, token, `SELECT id FROM products`);
    const validProductIds = new Set((Array.isArray(prodRows) ? prodRows : []).map((r) => r.id));
    let itemsRows = 0, addrRows = 0, ordersWithItems = 0, ordersWithAddr = 0, unparsedNotes = 0, applied = 0, orphanRefs = 0;
    const previews = [];

    for (const o of orders) {
      const iRows = mapItemRows(o.id, o.items, validProductIds);
      orphanRefs += iRows.filter((r) => r.product_id === null).length;
      const addr = parseAddress(o.id, o.notes);
      if (iRows.length > 0) { ordersWithItems++; itemsRows += iRows.length; }
      if (addr) { ordersWithAddr++; addrRows++; }
      else if (o.notes && o.notes.trim()) unparsedNotes++;

      if (previews.length < 2) previews.push({ order: o.order_number, items: iRows.length, itemSample: iRows[0] ? { name: iRows[0].name, unit_price: iRows[0].unit_price, qty: iRows[0].quantity, line_total: iRows[0].line_total } : null, addr: addr ? { name: addr.name, email: addr.email, phone: addr.phone, address1: addr.address1, city: addr.city, coords: addr.latitude ? `${addr.latitude},${addr.longitude}` : null, payment: addr.payment_method } : null });

      if (APPLY && (iRows.length > 0 || addr)) {
        // idempotent: clear prior backfill rows for this order, then insert
        await query(ref, token, `DELETE FROM order_items WHERE order_id = '${o.id}'; DELETE FROM order_addresses WHERE order_id = '${o.id}';`);
        if (iRows.length > 0) await query(ref, token, itemInsertSQL(iRows));
        if (addr) await query(ref, token, addrInsertSQL(addr));
        applied++;
      }
    }

    console.log(`--- STORE: ${name} (${ref}) — ${orders.length} orders ---`);
    console.log(`  order_items:     ${ordersWithItems} orders -> ${itemsRows} rows` + (orphanRefs ? `  (${orphanRefs} items ref a deleted product -> product_id NULL, snapshot kept)` : ''));
    console.log(`  order_addresses: ${ordersWithAddr} orders -> ${addrRows} rows` + (unparsedNotes ? `  (${unparsedNotes} orders had notes we could NOT parse into an address)` : ''));
    if (previews.length) console.log(`  preview:`, JSON.stringify(previews, null, 2).replace(/\n/g, '\n  '));
    if (APPLY) console.log(`  APPLIED: ${applied} orders written ✅`);
    summary.push({ store: name, orders: orders.length, item_rows: itemsRows, addr_rows: addrRows, orphan_refs: orphanRefs, unparsed_notes: unparsedNotes, applied: APPLY ? applied : '(dry-run)' });
  }
  console.log('\n=== SUMMARY ===');
  console.table(summary);
  if (!APPLY) console.log('\nDRY-RUN only — no data written. Re-run with --apply to write to the new tables (safe: orders table untouched, idempotent).');
}
run().catch((e) => { console.error('FATAL:', e); process.exit(1); });
