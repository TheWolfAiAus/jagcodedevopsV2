import express, {Request, Response} from 'express';

const router = express.Router();

router.post('/webhook/webflow-form', async (req: Request, res: Response) => {
  try {
    const webhookSecret = process.env.WEBFLOW_WEBHOOK_SECRET;
    const incomingSecret = req.headers['x-webhook-token'] || req.headers['x-webhook-secret'];
    if (webhookSecret && webhookSecret !== incomingSecret) {
      console.warn('Invalid webhook secret');
      return res.status(401).send({ error: 'invalid_webhook_secret' });
    }

    const payload = req.body || {};
    const receivedAt = new Date().toISOString();

    // Persistence must be implemented by you (Supabase, Firestore, etc.). For now, we do minimal logging.
    console.log('Received webflow form submission', { receivedAt, site: payload.site || payload.siteName || null });

    // Forward to configured cloud function if provided
    const forwardUrl = process.env.WEBFLOW_FORWARD_URL;
    if (forwardUrl) {
      try {
        // dynamic import of node-fetch
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fetch = require('node-fetch');
        fetch(forwardUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ received_at: receivedAt, payload }),
        }).catch((fwErr: any) => console.error('Forward error', fwErr));
      } catch (fwErr) {
        console.error('Failed to forward form submission to cloud function', fwErr);
      }
    }

    return res.status(200).send({ ok: true });
  } catch (err) {
    console.error('Unhandled error in webflow form webhook', err);
    return res.status(500).send({ error: 'internal_error' });
  }
});

export default router;
