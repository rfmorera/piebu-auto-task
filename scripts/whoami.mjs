import { google } from 'googleapis';

const oauth2 = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
oauth2.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
const youtube = google.youtube({ version: 'v3', auth: oauth2 });

const { data } = await youtube.channels.list({ part: ['snippet'], mine: true });
for (const c of data.items ?? []) {
  console.log(`channel id: ${c.id}  title: ${c.snippet.title}`);
}
