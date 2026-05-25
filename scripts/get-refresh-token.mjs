import { google } from 'googleapis';
import http from 'node:http';
import { URL } from 'node:url';

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET first');
}

const REDIRECT = 'http://localhost:53682/oauth2callback';
const oauth2 = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT);

const authUrl = oauth2.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/youtube'],
});

console.log('\nOpen this URL in your browser:\n');
console.log(authUrl);
console.log('');

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT);
  if (url.pathname !== '/oauth2callback') return res.end();
  const code = url.searchParams.get('code');
  const { tokens } = await oauth2.getToken(code);
  res.end('OK — check your terminal. You can close this tab.');
  console.log('\n=== REFRESH TOKEN (save as GOOGLE_REFRESH_TOKEN secret) ===');
  console.log(tokens.refresh_token);
  console.log('==========================================================\n');
  server.close();
});
server.listen(53682);
