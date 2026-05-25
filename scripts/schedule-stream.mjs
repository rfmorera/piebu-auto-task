import { google } from 'googleapis';

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN,
  TEMPLATE_BROADCAST_ID,
} = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN || !TEMPLATE_BROADCAST_ID) {
  throw new Error('Missing required env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, TEMPLATE_BROADCAST_ID');
}

const TZ = 'America/Montevideo';
const URUGUAY_UTC_OFFSET_HOURS = 3;
const LOCAL_HOUR = 10;
const LOCAL_MIN = 45;

function nextSundayUTC() {
  const now = new Date();
  const target = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    LOCAL_HOUR + URUGUAY_UTC_OFFSET_HOURS,
    LOCAL_MIN,
    0,
  ));
  let addDays = (7 - target.getUTCDay()) % 7;
  if (addDays === 0 && target <= now) addDays = 7;
  target.setUTCDate(target.getUTCDate() + addDays);
  return target;
}

function formatDateDDMMYYYY(date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get('day')}/${get('month')}/${get('year')}`;
}

const oauth2 = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
oauth2.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
const youtube = google.youtube({ version: 'v3', auth: oauth2 });

const { data: tplResp } = await youtube.liveBroadcasts.list({
  part: ['snippet', 'contentDetails', 'status'],
  id: [TEMPLATE_BROADCAST_ID],
});
const tpl = tplResp.items?.[0];
if (!tpl) throw new Error(`Template broadcast ${TEMPLATE_BROADCAST_ID} not found`);

const scheduledStart = nextSundayUTC();
const title = `Servicio Dominical - ${formatDateDDMMYYYY(scheduledStart)}`;

const { data: created } = await youtube.liveBroadcasts.insert({
  part: ['snippet', 'contentDetails', 'status'],
  requestBody: {
    snippet: {
      title,
      description: tpl.snippet.description,
      scheduledStartTime: scheduledStart.toISOString(),
    },
    contentDetails: {
      enableAutoStart: tpl.contentDetails?.enableAutoStart ?? false,
      enableAutoStop: tpl.contentDetails?.enableAutoStop ?? false,
      enableDvr: tpl.contentDetails?.enableDvr ?? true,
      enableContentEncryption: tpl.contentDetails?.enableContentEncryption ?? false,
      enableEmbed: tpl.contentDetails?.enableEmbed ?? true,
      recordFromStart: tpl.contentDetails?.recordFromStart ?? true,
      startWithSlate: tpl.contentDetails?.startWithSlate ?? false,
      latencyPreference: tpl.contentDetails?.latencyPreference ?? 'normal',
      enableClosedCaptions: tpl.contentDetails?.enableClosedCaptions ?? false,
      monitorStream: tpl.contentDetails?.monitorStream ?? { enableMonitorStream: true, broadcastStreamDelayMs: 0 },
      projection: tpl.contentDetails?.projection ?? 'rectangular',
    },
    status: {
      privacyStatus: 'public',
      selfDeclaredMadeForKids: tpl.status?.selfDeclaredMadeForKids ?? false,
    },
  },
});

console.log(`Created broadcast ${created.id} — "${title}" @ ${scheduledStart.toISOString()}`);

