import { readFileSync, readdirSync } from 'fs';
import { spawnSync } from 'child_process';
import { join } from 'path';

const files = readdirSync('env-backups').filter(f => f.endsWith('.env.local'));
for (const file of files) {
  const envPath = join('env-backups', file);
  console.log(`\n=== Deploying ${file} ===`);
  const envContent = readFileSync(envPath, 'utf-8');
  let token = '', project = '', team = '';
  for (const line of envContent.split('\n')) {
    if (line.startsWith('VERCEL_TOKEN=')) token = line.split('=')[1].trim();
    if (line.startsWith('VERCEL_PROJECT_NAME=')) project = line.split('=')[1].trim();
    if (line.startsWith('VERCEL_TEAM_ID=')) team = line.split('=')[1].trim();
  }
  
  if (!token || !project) {
    console.log(`Skipping ${file}: Missing VERCEL_TOKEN or VERCEL_PROJECT_NAME`);
    continue;
  }
  
  const args = ['-y', 'vercel@latest', 'deploy', '--prod', '--project', project, '--token', token, '--yes'];
  if (team) args.push('--scope', team);
  
  console.log(`Running: npx ${args.join(' ')}`);
  const out = spawnSync('npx', args, { stdio: 'inherit' });
  if (out.status !== 0) {
    console.log(`Deployment failed for ${project}`);
  } else {
    console.log(`Deployment triggered for ${project}`);
  }
}
