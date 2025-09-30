import express from 'express';
import fetch from 'node-fetch';
import rateLimit from 'express-rate-limit';

const app = express();
app.use(express.json());
const limiter = rateLimit({ windowMs: 60_000, max: 20 });
app.use('/api/', limiter);

const IMMICH_BASE = process.env.IMMICH_BASE_URL || 'https://your-immich.local';
const IMMICH_KEY = process.env.IMMICH_API_KEY || 'REPLACE_ME';

app.get('/api/gallery', async (req, res) => {
  const page = Number(req.query.page || 1);
  const per = 24;
  try {
    // Pseudo: adapt to your Immich API endpoints
    const resp = await fetch(`${IMMICH_BASE}/api/v1/assets?limit=${per}&page=${page}`, {
      headers: { Authorization: `Bearer ${IMMICH_KEY}` }
    });
    if (!resp.ok) return res.status(502).json({ error: 'Immich fetch failed' });
    const data = await resp.json();
    const items = data.map(a => ({ id: a.id, caption: a.fileName, previewUrl: `${IMMICH_BASE}/assets/${a.id}/preview` }));
    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/immich/upload', async (req, res) => {
  const { name, size, type } = req.body;
  if (!name || !size) return res.status(400).json({ error: 'invalid' });
  try {
    // Pseudo: create upload session in Immich
    const create = await fetch(`${IMMICH_BASE}/api/v1/uploads/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${IMMICH_KEY}` },
      body: JSON.stringify({ fileName: name, fileSize: size, mimeType: type })
    });
    if (!create.ok) return res.status(502).json({ error: 'immich init failed' });
    const json = await create.json();
    res.json({ uploadUrl: json.uploadUrl, assetId: json.assetId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/immich/complete', async (req, res) => {
  const { assetId } = req.body;
  try {
    await fetch(`${IMMICH_BASE}/api/v1/uploads/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${IMMICH_KEY}` },
      body: JSON.stringify({ assetId })
    });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

if (require.main === module) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`Immich proxy running on ${port}`));
}

export default app;
