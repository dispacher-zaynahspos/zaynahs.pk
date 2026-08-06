/**
 * test-cf-tokens.mjs
 * 
 * Automatically reads all Cloudflare tokens from .env.local and env-backups/
 * and verifies them against the Cloudflare API. This ensures Cache Purge Webhooks
 * will function correctly for all store projects.
 * 
 * Usage: node scripts/test-cf-tokens.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envBackupsDir = path.resolve(__dirname, '..', 'env-backups');
const mainEnvPath = path.resolve(__dirname, '..', '.env.local');

function extractToken(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/^CLOUDFLARE_API_TOKEN=(.+)$/m);
    return match ? match[1].trim() : null;
  } catch (e) {
    return null;
  }
}

async function testToken(name, token) {
  if (!token) {
    console.log(`⚠️ [${name}] No CLOUDFLARE_API_TOKEN found.`);
    return;
  }
  
  try {
    const res = await fetch("https://api.cloudflare.com/client/v4/user/tokens/verify", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    const data = await res.json();
    if (data.success) {
      console.log(`✅ [${name}] Token is VALID (Status: Active). Webhooks will work.`);
    } else {
      console.log(`❌ [${name}] Token is INVALID or EXPIRED.`);
      console.log(`   Response: ${JSON.stringify(data.errors)}`);
      console.log(`   (Note: Cloudflare API Tokens usually start with 'cfut_'. Ensure you created an API Token, not a Global API Key.)`);
    }
  } catch (e) {
    console.log(`❌ [${name}] Network Error checking token: ${e.message}`);
  }
}

async function run() {
  console.log("🔍 Verifying Cloudflare API Tokens across all projects...\n");
  
  // Test Main Env
  await testToken("Main .env.local", extractToken(mainEnvPath));
  
  // Test Backups
  if (fs.existsSync(envBackupsDir)) {
    const files = fs.readdirSync(envBackupsDir).filter(f => f.endsWith('.env.local'));
    for (const file of files) {
      const name = file.replace('.env.local', '');
      await testToken(`Backup: ${name}`, extractToken(path.join(envBackupsDir, file)));
    }
  }
  
  console.log("\nDone.");
}

run();
