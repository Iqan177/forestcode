// Forest Code — Status Update Email Function
// Sendet Status-Änderungs-E-Mails an Kunden via Brevo

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const OWNER_EMAIL = 'info.forestcode@gmail.com';

var statusMessages = {
  neu: {
    label: 'Erhalten',
    subject: 'Ihre Anfrage wurde erhalten – Forest Code',
    text: 'wir haben Ihre Anfrage erhalten und werden diese in Kürze bearbeiten. Unser Team meldet sich bei Ihnen.'
  },
  bearbeitung: {
    label: 'In Bearbeitung',
    subject: 'Ihre Website wird erstellt – Forest Code',
    text: 'Ihr Projekt befindet sich jetzt in der aktiven Bearbeitung. Unser Team arbeitet an Ihrer Website und wird sich bei Ihnen melden, sobald diese fertiggestellt ist.'
  },
  abgeschlossen: {
    label: 'Abgeschlossen',
    subject: 'Ihre Website ist fertiggestellt – Forest Code',
    text: 'wir freuen uns, Ihnen mitteilen zu können, dass Ihre Website fertiggestellt wurde. Wir werden Ihnen in Kürze die finale Version präsentieren und die Rechnung zusenden.'
  },
  bezahlt: {
    label: 'Bezahlt',
    subject: 'Zahlungseingang bestätigt – Forest Code',
    text: 'vielen Dank für Ihre Zahlung. Der Eingang wurde bestätigt. Ihr Projekt wird nun finalisiert und übergeben.'
  },
  abgenommen: {
    label: 'Abgenommen',
    subject: 'Projekt abgeschlossen – Forest Code',
    text: 'Ihr Projekt wurde erfolgreich abgeschlossen und übergeben. Vielen Dank für Ihr Vertrauen in Forest Code! Bei Fragen oder zukünftigen Projekten stehen wir Ihnen jederzeit zur Verfügung.'
  },
  zahlungserinnerung: {
    label: 'Zahlungserinnerung',
    subject: 'Zahlungserinnerung – Forest Code',
    text: 'wir möchten Sie freundlich daran erinnern, dass die Rechnung für Ihr Projekt noch offen ist. Bitte überweisen Sie den fälligen Betrag auf unser Konto. Bei Fragen stehen wir Ihnen gerne zur Verfügung.'
  },
  'angebots-nachfass': {
    label: 'Angebots-Nachfass',
    subject: 'Ihr Angebot von Forest Code – Noch Fragen?',
    text: 'wir haben Ihnen vor einigen Tagen ein Angebot für Ihr Website-Projekt zugesendet. Haben Sie noch Fragen dazu? Wir beraten Sie gerne und stehen für Anpassungen zur Verfügung. Antworten Sie einfach auf diese E-Mail.'
  },
  'kundenportal-zugang': {
    label: 'Kundenportal-Zugang',
    subject: 'Ihr Zugang zum Kundenportal – Forest Code',
    text: 'Ihr Projekt ist jetzt in Bearbeitung! Wir haben für Sie einen Zugang zu unserem Kundenportal erstellt, wo Sie den aktuellen Status Ihres Projekts jederzeit einsehen können.'
  }
};

exports.handler = async function(event) {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY ist nicht gesetzt!');
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  var data;
  try { data = JSON.parse(event.body); } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  var { name, email, status, customerId, invoiceNumber, amount, quoteNumber, tempPassword } = data;
  if (!email || !status) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email und Status sind erforderlich' }) };
  }

  var msg = statusMessages[status];
  if (!msg) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unbekannter Status: ' + status }) };
  }

  try {
    const result = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'Forest Code', email: OWNER_EMAIL },
        to: [{ email: email, name: name || 'Kunde' }],
        subject: msg.subject,
        htmlContent: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">' +
          '<div style="background:linear-gradient(135deg,#0b1121 0%,#1e3a5f 60%,#2563eb 100%);padding:24px;border-radius:12px 12px 0 0">' +
            '<h1 style="color:#fff;margin:0;font-size:20px;">Status-Update: ' + msg.label + '</h1>' +
          '</div>' +
          '<div style="background:#fff;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">' +
            '<p style="font-size:15px;color:#334155;line-height:1.6">Guten Tag ' + (name || 'Kunde') + ',</p>' +
            '<p style="font-size:15px;color:#334155;line-height:1.6">' + msg.text + '</p>' +
            '<div style="margin:24px 0;padding:16px;background:#f1f5f9;border-radius:8px;text-align:center">' +
              '<p style="margin:0 0 4px;font-size:13px;color:#64748b">Aktueller Status</p>' +
              '<p style="margin:0;font-size:18px;font-weight:bold;color:#2563eb">' + msg.label + '</p>' +
              (customerId ? '<p style="margin:4px 0 0;font-size:12px;color:#94a3b8">Referenz: ' + customerId + '</p>' : '') +
              (invoiceNumber ? '<p style="margin:8px 0 0;font-size:14px;color:#334155">Rechnung: <strong>' + invoiceNumber + '</strong>' + (amount ? ' — ' + Number(amount).toLocaleString('de-DE') + ' €' : '') + '</p>' : '') +
              (quoteNumber ? '<p style="margin:8px 0 0;font-size:14px;color:#334155">Angebot: <strong>' + quoteNumber + '</strong>' + (amount ? ' — ' + Number(amount).toLocaleString('de-DE') + ' €' : '') + '</p>' : '') +
            '</div>' +
            (tempPassword ? '<div style="margin:0 0 24px;padding:16px;background:#ecfdf5;border:1px solid #6ee7b7;border-radius:8px">' +
              '<p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#065f46">Ihre Zugangsdaten:</p>' +
              '<p style="margin:0;font-size:14px;color:#334155"><strong>E-Mail:</strong> ' + email + '</p>' +
              '<p style="margin:0;font-size:14px;color:#334155"><strong>Passwort:</strong> ' + tempPassword + '</p>' +
              '<p style="margin:8px 0 0;font-size:13px;color:#64748b">Bitte ändern Sie Ihr Passwort nach der ersten Anmeldung.</p>' +
              '<a href="https://forestcode.de/dashboard.html?portal=1" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Zum Kundenportal</a>' +
            '</div>' : '') +
            '<p style="font-size:15px;color:#334155">Bei Fragen erreichen Sie uns jederzeit unter <a href="mailto:' + OWNER_EMAIL + '" style="color:#2563eb">' + OWNER_EMAIL + '</a>.</p>' +
            '<p style="font-size:15px;color:#334155">Mit freundlichen Grüßen,<br><strong>Ihr Forest Code Team</strong></p>' +
            '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">' +
            '<p style="font-size:12px;color:#94a3b8;margin:0">mominSys UG (haftungsbeschränkt) &middot; Handelsname: Forest Code<br>Hammerwerkstr. 1 A, 79183 Waldkirch &middot; HRB 725099</p>' +
          '</div>' +
        '</div>'
      })
    });

    const responseBody = await result.text();

    if (!result.ok) {
      console.error('Brevo API error:', result.status, responseBody);
      return { statusCode: 200, headers, body: JSON.stringify({ success: false, brevoStatus: result.status, brevoError: responseBody }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, brevoStatus: result.status }) };

  } catch (error) {
    console.error('Status-Email Fehler:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Email sending failed', details: error.message }) };
  }
};
