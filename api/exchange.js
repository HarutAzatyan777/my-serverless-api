let cachedData = null;
let lastFetchTime = 0;

// Cache for 1 hour
const CACHE_DURATION = 60 * 60 * 1000;

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow all origins
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const now = Date.now();

    if (cachedData && now - lastFetchTime < CACHE_DURATION) {
      return res.status(200).json({ source: "cache", ...cachedData });
    }

    const response = await fetch(
      "https://v6.exchangerate-api.com/v6/75b5f33668e01d5cefc564dc/latest/USD"
    );

    const data = await response.json();

    cachedData = data;
    lastFetchTime = now;

    return res.status(200).json({ source: "live", ...data });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load exchange rates" });
  }
}
