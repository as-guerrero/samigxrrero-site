// The site is static files; this small Worker only handles the connect page's inquiry form.
// It emails each inquiry to sami's inbox through Cloudflare Email Routing (send_email binding).
import { EmailMessage } from 'cloudflare:email';

const FROM = 'inquiry@samigxrrero.com';
const TO = 'samigxrrero@outlook.com';

// field order and labels as they appear in the email
const FIELDS = [
  ['first', 'First name'], ['last', 'Last name'], ['business', 'Business'],
  ['ig', 'Instagram'], ['email', 'Email'], ['subject', 'Subject'],
  ['start', 'Ideal start date'], ['details', 'Project'], ['budget', 'Budget'],
];

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const oneLine = (s) => String(s || '').replace(/[\r\n]+/g, ' ').trim();
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const b64 = (s) => {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/.{76}/g, '$&\r\n');
};
const header = (s) => '=?UTF-8?B?' + b64(oneLine(s)).replace(/\r\n/g, '') + '?=';

async function inquiry(req, env) {
  let d;
  try { d = await req.json(); } catch { return json({ ok: false, error: 'bad request' }, 400); }
  if (d._honey) return json({ ok: true }); // a bot filled the hidden box: pretend it worked
  const v = {};
  for (const [k] of FIELDS) v[k] = String(d[k] || '').slice(0, k === 'details' ? 8000 : 300).trim();
  if (v.ig) v.ig = '@' + v.ig.replace(/@/g, '');
  const email = oneLine(v.email);
  if (!v.first || !v.last || !v.subject || !v.details || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: 'missing fields' }, 400);
  }

  const name = oneLine(v.first + ' ' + v.last);
  const rows = FIELDS.filter(([k]) => v[k]);
  const text = 'New project inquiry\n\n' +
    rows.map(([k, label]) => k === 'details' ? `${label}:\n${v[k]}\n` : `${label}: ${v[k]}`).join('\n') + '\n';
  const html = '<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#111">' +
    '<p style="font-size:18px;margin:0 0 16px">New project inquiry</p><table cellpadding="6" style="border-collapse:collapse">' +
    rows.map(([k, label]) => `<tr><td style="color:#777;vertical-align:top;white-space:nowrap">${label}</td>` +
      `<td style="white-space:pre-wrap">${esc(v[k])}</td></tr>`).join('') +
    '</table><p style="color:#777;font-size:13px;margin-top:20px">Reply to this email to answer ' + esc(name) + ' directly.</p></div>';

  const boundary = 'b' + crypto.randomUUID().replace(/-/g, '');
  const raw = [
    `From: ${header('Samí Guerrero site')} <${FROM}>`,
    `To: <${TO}>`,
    `Reply-To: ${header(name)} <${email}>`,
    `Subject: ${header(v.subject + ' (inquiry from ' + name + ')')}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@samigxrrero.com>`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    b64(text),
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    b64(html),
    `--${boundary}--`,
    '',
  ].join('\r\n');

  try {
    await env.INQUIRY.send(new EmailMessage(FROM, TO, raw));
  } catch (e) {
    console.log('send failed', e && e.message);
    return json({ ok: false, error: 'send failed' }, 502);
  }
  return json({ ok: true });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/api/inquiry') {
      if (req.method !== 'POST') return json({ ok: false, error: 'method not allowed' }, 405);
      return inquiry(req, env);
    }
    return env.ASSETS.fetch(req);
  },
};
