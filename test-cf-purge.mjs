import fs from 'fs';
import path from 'path';

const envBackupsDir = path.resolve('env-backups');
const mainEnvPath = path.resolve('.env.local');

function extractEnv(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const token = content.match(/^CLOUDFLARE_API_TOKEN=(.+)$/m)?.[1]?.trim();
    const zoneId = content.match(/^CLOUDFLARE_ZONE_ID=(.+)$/m)?.[1]?.trim();
    return { token, zoneId };
  } catch (e) {
    return { token: null, zoneId: null };
  }
}

async function testPurge(name, token, zoneId) {
  if (!token || !zoneId) return console.log(`[${name}] Missing token or zone`);
  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ purge_everything: true })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      console.log(`[${name}] SUCCESS`);
    } else {
      console.log(`[${name}] FAILED: ${data.errors?.[0]?.message}`);
    }
  } catch (e) {
    console.log(`[${name}] ERROR: ${e.message}`);
  }
}

async function run() {
  const main = extractEnv(mainEnvPath);
  await testPurge("Main", main.token, main.zoneId);
  
  if (fs.existsSync(envBackupsDir)) {
    const files = fs.readdirSync(envBackupsDir).filter(f => f.endsWith('.env.local'));
    for (const file of files) {
      const { token, zoneId } = extractEnv(path.join(envBackupsDir, file));
      await testPurge(`Backup: ${file}`, token, zoneId);
    }
  }
}

run();
