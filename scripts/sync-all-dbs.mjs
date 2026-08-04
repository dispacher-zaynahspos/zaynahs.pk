import { execSync } from 'child_process';
import { readdirSync, copyFileSync, unlinkSync, existsSync } from 'fs';
import { resolve } from 'path';

const backupsDir = resolve('env-backups');
const envLocalPath = resolve('.env.local');
const tempEnvPath = resolve('.env.local.temp');

const backupFiles = readdirSync(backupsDir).filter(f => f.includes('.env') || f.includes('env.'));
console.log('Found env backups:', backupFiles);

// Backup current .env.local
if (existsSync(envLocalPath)) {
  copyFileSync(envLocalPath, tempEnvPath);
}

for (const file of backupFiles) {
  const filePath = resolve(backupsDir, file);
  console.log(`\n======================================`);
  console.log(`Syncing DB for project: ${file}`);
  console.log(`======================================`);
  
  try {
    copyFileSync(filePath, envLocalPath);
    execSync('node scripts/init-db.mjs', { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to sync DB for ${file}:`, error.message);
  }
}

// Restore .env.local
if (existsSync(tempEnvPath)) {
  copyFileSync(tempEnvPath, envLocalPath);
  unlinkSync(tempEnvPath);
  console.log('\nRestored original .env.local');
}
