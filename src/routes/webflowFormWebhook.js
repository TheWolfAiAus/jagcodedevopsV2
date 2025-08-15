// Webflow form submission webhook handler
// Usage: import and call registerWebflowFormRoutes(server, { supabase, db, forwardUrl })

export default function registerWebflowFormRoutes(server, opts = {}) {
  const { supabase = null, db = null, forwardUrl = process.env.WEBFLOW_FORWARD_URL || 'https://us-central1-phoneflow-659b8.cloudfunctions.net/webflowFormSubmissionWebhook?uid=T7SleSRZuUfQGuXIpgAREVgtZBc2&siteName=JageCodeDevOps' } = opts;

  server.post('/webhook/webflow-form', async (req, reply) => {
    try {
      // Optional secret header validation
      const webhookSecret = process.env.WEBFLOW_WEBHOOK_SECRET;
      const incomingSecret = req.headers['x-webhook-token'] || req.headers['x-webhook-secret'];
      if (webhookSecret && webhookSecret !== incomingSecret) {
        server.log.warn({ got: incomingSecret }, 'Invalid webhook secret');
        return reply.code(401).send({ error: 'invalid_webhook_secret' });
      }

      const payload = req.body || {};
      const receivedAt = new Date().toISOString();

      // Persist submission: prefer Supabase, fallback to LevelDB `db`
      if (supabase && typeof supabase.from === 'function') {
        try {
          await supabase.from('form_submissions').insert([{ site: payload.site || payload.siteName || null, data: payload, received_at: receivedAt }]);
        } catch (e) {
          server.log.error({ e }, 'Supabase insert failed for form submission');
        }
      } else if (db && typeof db.put === 'function') {
        try {
          const key = `webflow:form:${payload.site || 'unknown'}:${Date.now()}`;
          await db.put(key, { payload, received_at: receivedAt });
        } catch (e) {
          server.log.error({ e }, 'LevelDB save failed for form submission');
        }
      }

      // Forward the submission to the provided Cloud Function URL (non-blocking)
      try {
        // Use global fetch (Node 18+) or dynamic import of node-fetch if not available
        const doFetch = globalThis.fetch ? globalThis.fetch : (await import('node-fetch')).default;
        // Post JSON payload
        const res = await doFetch(forwardUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ received_at: receivedAt, payload }),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '<no-body>');
          server.log.warn({ status: res.status, body: text }, 'Forward to cloud function returned non-OK');
        }
      } catch (fwErr) {
        server.log.error({ fwErr }, 'Failed to forward form submission to cloud function');
      }

      // Return minimal response to Webflow
      return reply.code(200).send({ ok: true });
    } catch (err) {
      server.log.error({ err }, 'Unhandled error in webflow form webhook');
      return reply.code(500).send({ error: 'internal_error' });
    }
  });
}
