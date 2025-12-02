let cachedData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export default async function handler(req, res) {
  const { base = "USD" } = req.query;

  try {
    const now = Date.now();

    if (cachedData && now - lastFetchTime < CACHE_DURATION) {
      return res.status(200).json({ source: "cache", ...cachedData });
    }

    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/75b5f33668e01d5cefc564dc/latest/${base}`
    );
    const data = await response.json();

    cachedData = data;
    lastFetchTime = now;

    res.status(200).json({ source: "live", ...data });
  } catch (err) {
    res.status(500).json({ error: "Failed to load exchange rates" });
  }
}
