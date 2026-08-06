import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env.local');

const env = {};
try {
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const t = line.trim();
    if (t && !t.startsWith('#')) {
      const eq = t.indexOf('=');
      if (eq > 0) env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
    }
  }
} catch (e) {
  console.error("Could not read .env.local", e);
  process.exit(1);
}

const token = env.VERCEL_TOKEN;
const cloudflareToken = env.CLOUDFLARE_API_TOKEN;

if (!token) {
  console.error("Missing VERCEL_TOKEN in .env.local");
  process.exit(1);
}

if (!cloudflareToken) {
  console.error("Missing CLOUDFLARE_API_TOKEN in .env.local");
  process.exit(1);
}

async function run() {
  console.log("Fetching Vercel projects...");
  const res = await fetch('https://api.vercel.com/v9/projects', {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    console.error("Failed to fetch projects:", await res.text());
    process.exit(1);
  }

  const data = await res.json();
  const projects = data.projects || [];
  console.log(`Found ${projects.length} projects.`);

  for (const project of projects) {
    console.log(`\nProcessing project: ${project.name} (${project.id})`);
    
    // Get existing env vars
    const envRes = await fetch(`https://api.vercel.com/v9/projects/${project.id}/env`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!envRes.ok) {
      console.error(`Failed to fetch envs for ${project.name}`);
      continue;
    }
    
    const envData = await envRes.json();
    const existingEnv = envData.envs?.find(e => e.key === 'CLOUDFLARE_API_TOKEN');
    
    if (existingEnv) {
      console.log(`Updating existing CLOUDFLARE_API_TOKEN (ID: ${existingEnv.id})...`);
      const updateRes = await fetch(`https://api.vercel.com/v9/projects/${project.id}/env/${existingEnv.id}`, {
        method: 'PATCH',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          value: cloudflareToken,
          target: existingEnv.target || ['production', 'preview', 'development']
        })
      });
      if (updateRes.ok) console.log("✅ Updated successfully.");
      else console.error("❌ Update failed:", await updateRes.text());
    } else {
      console.log("Creating new CLOUDFLARE_API_TOKEN...");
      const createRes = await fetch(`https://api.vercel.com/v10/projects/${project.id}/env`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: 'CLOUDFLARE_API_TOKEN',
          value: cloudflareToken,
          type: 'encrypted',
          target: ['production', 'preview', 'development']
        })
      });
      if (createRes.ok) console.log("✅ Created successfully.");
      else console.error("❌ Create failed:", await createRes.text());
    }
  }
}

run();
