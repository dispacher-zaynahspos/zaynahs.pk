import { readFileSync, readdirSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const files = readdirSync('env-backups').filter(f => f.endsWith('.env.local') && !f.includes('totvogue'));

for (const file of files) {
  const envPath = join('env-backups', file);
  console.log(`\n=== Pushing to ${file} ===`);
  const envContent = readFileSync(envPath, 'utf-8');
  
  let token = '', username = '', repo = '';
  for (const line of envContent.split('\n')) {
    if (line.startsWith('GITHUB_TOKEN=')) token = line.split('=')[1].trim();
    if (line.startsWith('GITHUB_USERNAME=')) username = line.split('=')[1].trim();
    if (line.startsWith('GITHUB_REPO=')) repo = line.split('=')[1].trim();
  }
  
  if (!token || !username || !repo) {
    console.log(`Skipping ${file}: Missing credentials`);
    continue;
  }
  
  const remoteName = username;
  const remoteUrl = `https://${token}@github.com/${username}/${repo}.git`;
  
  try {
    // Add remote if it doesn't exist
    try {
      execSync(`git remote add ${remoteName} ${remoteUrl}`, { stdio: 'ignore' });
    } catch (e) {
      // Remote probably already exists, update URL just in case
      execSync(`git remote set-url ${remoteName} ${remoteUrl}`, { stdio: 'ignore' });
    }
    
    // Push to the remote
    console.log(`Pushing to ${username}/${repo}...`);
    execSync(`git push ${remoteName} main`, { stdio: 'inherit' });
    console.log(`✅ Successfully pushed to ${username}/${repo}`);
  } catch (e) {
    console.error(`❌ Failed to push to ${username}/${repo}`);
  }
}
