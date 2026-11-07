// Forest Code — Brevo Contact Function
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const OWNER_EMAIL = 'info.forestcode@gmail.com';
const OWNER_NAME = 'Forest Code';

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  try {
    const data = JSON.parse(event.body);
    const { name, email, phone, company, message, konfiguration } = data;
    if (!name || !email) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Name und E-Mail sind erforderlich' }) };
    }
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Forest Code Website', email: OWNER_EMAIL },
        to: [{ email: OWNER_EMAIL, name: OWNER_NAME }],
        subject: 'Neue Anfrage von ' + name + ' - ' + (company || 'Kein Unternehmen'),
        htmlContent: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#0b1121 0%,#1e3a5f 60%,#2563eb 100%);padding:24px;border-radius:12px 12px 0 0;"><h1 style="color:#fff;margin:0;font-size:20px;">Neue Projektanfrage</h1></div><div style="background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;"><table style="width:100%;border-collapse:collapse;font-size:14px;"><tr><td style="padding:8px 12px;font-weight:bold;color:#0b1121;width:140px;">Name:</td><td style="padding:8px 12px;color:#334155;">' + name + '</td></tr><tr style="background:#fff;"><td style="padding:8px 12px;font-weight:bold;color:#0b1121;">E-Mail:</td><td style="padding:8px 12px;"><a href="mailto:' + email + '" style="color:#2563eb;">' + email + '</a></td></tr><tr><td style="padding:8px 12px;font-weight:bold;color:#0b1121;">Telefon:</td><td style="padding:8px 12px;color:#334155;">' + (phone || '-') + '</td></tr><tr style="background:#fff;"><td style="padding:8px 12px;font-weight:bold;color:#0b1121;">Unternehmen:</td><td style="padding:8px 12px;color:#334155;">' + (company || '-') + '</td></tr>' + (message ? '<tr><td style="padding:8px 12px;font-weight:bold;color:#0b1121;">Mitteilung:</td><td style="padding:8px 12px;color:#334155;">' + message + '</td></tr>' : '') + '</table>' + (konfiguration ? '<div style="margin-top:16px;padding:16px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;"><h3 style="margin:0 0 8px;font-size:14px;color:#0b1121;">Konfiguration:</h3><pre style="white-space:pre-wrap;font-size:13px;color:#475569;margin:0;">' + konfiguration + '</pre></div>' : '') + '</div></div>'
      })
    });
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Forest Code', email: OWNER_EMAIL },
        to: [{ email: email, name: name }],
        subject: 'Ihre Anfrage bei Forest Code - Bestaetigung',
        htmlContent: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#0b1121 0%,#1e3a5f 60%,#2563eb 100%);padding:24px;border-radius:12px 12px 0 0;"><h1 style="color:#fff;margin:0;font-size:20px;">Vielen Dank fuer Ihre Anfrage!</h1></div><div style="background:#fff;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;"><p style="font-size:15px;color:#334155;line-height:1.6;">Guten Tag ' + name + ',<br><br>vielen Dank fuer Ihr Interesse an einer professionellen Website von <strong>Forest Code</strong>. Wir haben Ihre Anfrage erfolgreich erhalten und werden uns <strong>innerhalb von 24 Stunden</strong> bei Ihnen melden.</p><p style="font-size:15px;color:#334155;">E-Mail: <a href="mailto:info.forestcode@gmail.com" style="color:#2563eb;">info.forestcode@gmail.com</a><br>Web: <a href="https://forestcode.de" style="color:#2563eb;">forestcode.de</a></p><hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;"><p style="font-size:12px;color:#94a3b8;">mominSys UG (haftungsbeschraenkt) - Handelsname: Forest Code<br>Hammerwerkstr. 1 A, 79183 Waldkirch - HRB 725099</p></div></div>'
      })
    });
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({ email: email, attributes: { VORNAME: name.split(' ')[0], NACHNAME: name.split(' ').slice(1).join(' ') || '', FIRMA: company || '', SMS: phone || '' }, updateEnabled: true })
    }).catch(function(err) { console.error('Contact error:', err); });
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Anfrage erfolgreich gesendet' }) };
  } catch (error) {
    console.error('Function error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Serverfehler' }) };
  }
};
