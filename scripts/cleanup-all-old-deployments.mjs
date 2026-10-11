// scripts/cleanup-all-old-deployments.mjs
// Safely deletes all old, failed, preview, and superseded Vercel deployments
// while strictly preserving the current active live production deployment for every project.
// Reads credentials dynamically from env-backups/ or environment variables (no hardcoded secrets).

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backupDir = path.resolve(__dirname, '..', 'env-backups');

function loadStoreConfigs() {
  const configs = [];
  const seenTokens = new Set();

  if (fs.existsSync(backupDir)) {
    const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.env.local') || f.endsWith('.env'));
    for (const file of files) {
      const fullPath = path.resolve(backupDir, file);
      if (fs.statSync(fullPath).isDirectory()) continue;
      const content = fs.readFileSync(fullPath, 'utf-8');
      const bEnv = {};
      for (const line of content.split('\n')) {
        const t = line.trim();
        if (t && !t.startsWith('#')) {
          const eq = t.indexOf('=');
          if (eq > 0) bEnv[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
        }
      }
      if (bEnv.VERCEL_TOKEN && !seenTokens.has(bEnv.VERCEL_TOKEN)) {
        seenTokens.add(bEnv.VERCEL_TOKEN);
        configs.push({
          store: bEnv.NEXT_PUBLIC_BRAND_NAME || bEnv.VERCEL_PROJECT_NAME || file.replace('.env.local', ''),
          token: bEnv.VERCEL_TOKEN,
          teamId: bEnv.VERCEL_TEAM_ID || bEnv.VERCEL_ORG_ID || null,
        });
      }
    }
  }

  // Also fallback to process.env if available
  if (process.env.VERCEL_TOKEN && !seenTokens.has(process.env.VERCEL_TOKEN)) {
    configs.push({
      store: process.env.VERCEL_PROJECT_NAME || 'Current Project',
      token: process.env.VERCEL_TOKEN,
      teamId: process.env.VERCEL_TEAM_ID || null,
    });
  }

  return configs;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson(url, token) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

async function deleteDeployment(uid, token, teamId) {
  const url = `https://api.vercel.com/v13/deployments/${uid}${teamId ? `?teamId=${teamId}` : ''}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete ${uid}: HTTP ${res.status} - ${text}`);
  }
  return res.json();
}

async function cleanupStore(config) {
  console.log(`\n======================================================`);
  console.log(`🔍 Checking Store / Team: ${config.store}`);
  console.log(`======================================================`);

  const teamParam = config.teamId ? `teamId=${config.teamId}&` : '';
  let projects = [];

  try {
    const projData = await fetchJson(
      `https://api.vercel.com/v9/projects?${teamParam}limit=100`,
      config.token
    );
    projects = projData.projects || [];
  } catch (err) {
    console.error(`❌ Could not fetch projects for ${config.store}:`, err.message);
    return { store: config.store, deletedCount: 0, keptCount: 0 };
  }

  console.log(`Found ${projects.length} project(s) in this account/team.`);

  let totalDeleted = 0;
  let totalKept = 0;

  for (const proj of projects) {
    console.log(`\n📦 Project: [${proj.name}] (ID: ${proj.id})`);

    // 1. Identify active production deployment ID
    let activeProdId = proj.targets?.production?.id || null;

    // First fetch to locate active prod if not in targets
    try {
      const initData = await fetchJson(
        `https://api.vercel.com/v6/deployments?${teamParam}projectId=${proj.id}&limit=20`,
        config.token
      );
      const initList = initData.deployments || [];
      if (initList.length === 0) {
        console.log(`   ℹ️ No deployments found.`);
        continue;
      }
      if (!activeProdId) {
        const newestReadyProd = initList.find(
          (d) => d.target === 'production' && d.state === 'READY'
        );
        activeProdId = newestReadyProd ? newestReadyProd.uid : initList[0].uid;
      }
    } catch (err) {
      console.error(`   ⚠️ Failed initial check for ${proj.name}:`, err.message);
      continue;
    }

    console.log(`   🔒 Current Live Production Deployment (KEEP): ${activeProdId}`);

    // 2. Loop until only the active production deployment remains
    while (true) {
      let deployments = [];
      try {
        const dplData = await fetchJson(
          `https://api.vercel.com/v6/deployments?${teamParam}projectId=${proj.id}&limit=100`,
          config.token
        );
        deployments = dplData.deployments || [];
      } catch (err) {
        console.error(`   ⚠️ Failed to list deployments for ${proj.name}:`, err.message);
        break;
      }

      const toDelete = deployments.filter((d) => d.uid !== activeProdId);
      if (toDelete.length === 0) {
        console.log(`   ✨ All old deployments cleaned up for [${proj.name}]! Only active production remains.`);
        if (deployments.some((d) => d.uid === activeProdId)) {
          totalKept++;
        }
        break;
      }

      console.log(`   Found ${toDelete.length} old deployment(s) to delete in this batch...`);

      for (const dpl of toDelete) {
        // Skip in-progress builds
        if (dpl.state === 'BUILDING' || dpl.readyState === 'BUILDING' || dpl.state === 'INITIALIZING') {
          console.log(`   ⏳ Skipping in-progress build: ${dpl.uid}`);
          continue;
        }

        process.stdout.write(`   🗑️ DELETING: ${dpl.uid} (${new Date(dpl.created).toLocaleDateString()} - ${dpl.state})... `);
        try {
          await deleteDeployment(dpl.uid, config.token, config.teamId);
          console.log(`✓ Deleted`);
          totalDeleted++;
          await sleep(150); // Respect rate limits
        } catch (delErr) {
          console.log(`❌ Error: ${delErr.message}`);
          await sleep(500);
        }
      }
    }
  }

  return { store: config.store, deletedCount: totalDeleted, keptCount: totalKept };
}

async function main() {
  console.log(`🚀 Starting Vercel Old Deployments Cleanup across all stores...`);
  console.log(`Strict Rule: Latest Live Active Deployment is ALWAYS kept safe!\n`);

  const configs = loadStoreConfigs();
  if (configs.length === 0) {
    console.error(`❌ No Vercel tokens found in env-backups or environment.`);
    process.exit(1);
  }

  const summary = [];

  for (const config of configs) {
    try {
      const res = await cleanupStore(config);
      summary.push(res);
    } catch (err) {
      console.error(`❌ Unexpected error in ${config.store}:`, err);
    }
  }

  console.log(`\n======================================================`);
  console.log(`🎉 CLEANUP SUMMARY`);
  console.log(`======================================================`);
  let grandTotalDeleted = 0;
  for (const s of summary) {
    console.log(`• ${s.store}: Deleted ${s.deletedCount} old deployments | Kept ${s.keptCount} active live deployment(s)`);
    grandTotalDeleted += s.deletedCount;
  }
  console.log(`------------------------------------------------------`);
  console.log(`Total Deployments Removed: ${grandTotalDeleted}`);
  console.log(`Vercel Function Storage has been significantly freed!`);
}

main().catch(console.error);
