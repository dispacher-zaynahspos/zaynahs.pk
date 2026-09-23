import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envBackupsDir = path.resolve(process.cwd(), 'env-backups');
const envFiles = fs.readdirSync(envBackupsDir).filter(f => f.endsWith('.env.local'));

function parseEnv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  }
  return env;
}

async function updateStoreAI(envFile) {
  const filePath = path.join(envBackupsDir, envFile);
  const env = parseEnv(filePath);

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const geminiKey = env.GEMINI_API_KEY?.trim() || '';

  if (!supabaseUrl || !serviceKey) {
    console.error(`❌ [${envFile}] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY`);
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  console.log(`\n===============================================================`);
  console.log(`📦 Updating AI Settings for: ${envFile} (${supabaseUrl})`);
  console.log(`===============================================================`);

  const { data: current, error: fetchErr } = await supabase
    .from('store_settings')
    .select('id, ai_enabled, content_provider, content_model, content_keys, vision_provider, vision_model, vision_keys, ai_model_credentials')
    .eq('id', '00000000-0000-4000-8000-000000000001')
    .single();

  if (fetchErr) {
    console.error(`❌ [${envFile}] Fetch store_settings error:`, fetchErr.message);
    return;
  }

  let creds = {};
  try {
    creds = typeof current.ai_model_credentials === 'string'
      ? JSON.parse(current.ai_model_credentials)
      : (current.ai_model_credentials || {});
  } catch (e) {
    creds = {};
  }

  if (!creds.vision) creds.vision = {};
  if (!creds.content) creds.content = {};

  if (!creds.vision.gemini || creds.vision.gemini.length < 10) {
    creds.vision.gemini = geminiKey;
  }
  if (!creds.content.gemini || creds.content.gemini.length < 10) {
    creds.content.gemini = geminiKey;
  }

  const newVisionModel = 'gemini-3.6-flash';
  let newContentModel = current.content_model || 'llama-3.3-70b-versatile';
  if (current.content_provider === 'gemini' || newContentModel.includes('2.5') || newContentModel.includes('1.5') || newContentModel.includes('2.0') || newContentModel.includes('3.5')) {
    newContentModel = 'gemini-3.6-flash';
  }

  const { data: updated, error: updateErr } = await supabase
    .from('store_settings')
    .update({
      ai_enabled: true,
      vision_provider: current.vision_provider || 'gemini',
      vision_model: newVisionModel,
      content_model: newContentModel,
      ai_model_credentials: creds,
      auto_content_seo: true,
      auto_media_ai: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', '00000000-0000-4000-8000-000000000001')
    .select('id, ai_enabled, content_provider, content_model, vision_provider, vision_model')
    .single();

  if (updateErr) {
    console.error(`❌ [${envFile}] Update error:`, updateErr.message);
  } else {
    console.log(`✅ [${envFile}] Successfully updated AI Settings:`, updated);
  }
}

async function main() {
  for (const file of envFiles) {
    await updateStoreAI(file);
  }
  console.log(`\n🎉 All stores processed!`);
}

main().catch(console.error);
