import fs from 'fs';
import os from 'os';
const mod = await import('../node_modules/@google/clasp/build/src/auth/oauth_client.js');
const CLIENT_ID = mod.DEFAULT_CLASP_OAUTH_CLIENT_ID;
const CLIENT_SECRET = mod.DEFAULT_CLASP_OAUTH_CLIENT_SECRET;
const rc = JSON.parse(fs.readFileSync(os.homedir() + '/.clasprc.json', 'utf8')).tokens.default;
const body = new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, refresh_token: rc.refresh_token, grant_type: 'refresh_token' });
const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body });
const j = await r.json();
if (!j.access_token) { console.log('REFRESH ERROR', JSON.stringify(j).slice(0, 300)); process.exit(1); }
fs.writeFileSync(new URL('../.tok', import.meta.url), j.access_token, { mode: 0o600 });
console.log('refresh ok, expires_in', j.expires_in);
const info = await (await fetch('https://oauth2.googleapis.com/tokeninfo?access_token=' + j.access_token)).json();
console.log('scopes:', info.scope);
