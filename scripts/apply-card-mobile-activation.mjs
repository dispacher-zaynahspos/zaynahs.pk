import fs from 'fs';
import path from 'path';

const envBackupsDir = path.resolve(process.cwd(), 'env-backups');
const envFiles = fs.readdirSync(envBackupsDir).filter(f => f.endsWith('.env.local'));

const migrationSql = `
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS card_mobile_activation TEXT DEFAULT 'scroll';
DO $$
DECLARE cols text;
BEGIN
  SELECT string_agg(quote_ident(column_name), ', ' ORDER BY ordinal_position) INTO cols
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'store_settings'
    AND column_name NOT IN ('smtp_app_password','postex_api_token','content_keys','vision_keys','ai_model_credentials');
  EXECUTE format('CREATE OR REPLACE VIEW public.store_settings_public AS SELECT %s FROM public.store_settings', cols);
END $$;
GRANT SELECT ON public.store_settings_public TO anon, authenticated;
`;

const verifySql = `SELECT column_name FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'card_mobile_activation';`;

async function query(ref, token, sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ query: sql }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  const results = [];
  for (const file of envFiles) {
    const content = fs.readFileSync(path.join(envBackupsDir, file), 'utf8');
    const ref = (content.match(/SUPABASE_PROJECT_REF=([^\r\n]+)/) || [])[1]?.trim();
    let token = (content.match(/SUPABASE_MGMT_TOKEN=([^\r\n]+)/) || [])[1]?.trim();
    if ((!token || token.includes('placeholder')) && file.includes('zaynahs')) {
      const localEnv = path.resolve(process.cwd(), '.env.local');
      if (fs.existsSync(localEnv)) {
        token = (fs.readFileSync(localEnv, 'utf8').match(/SUPABASE_MGMT_TOKEN=([^\r\n]+)/) || [])[1]?.trim();
      }
    }
    const name = file.replace('.env.local', '');
    if (!ref || !token) { results.push({ name, status: 'SKIPPED (no ref/token)' }); continue; }

    const mig = await query(ref, token, migrationSql);
    if (!mig.ok) { results.push({ name, ref, status: `MIGRATION HTTP ${mig.status}`, err: JSON.stringify(mig.data) }); continue; }
    const ver = await query(ref, token, verifySql);
    const found = Array.isArray(ver.data) && ver.data.some(r => r.column_name === 'card_mobile_activation');
    results.push({ name, ref, status: found ? 'SUCCESS ✅' : 'MISSING ⚠️' });
  }
  console.table(results);
}
main();
