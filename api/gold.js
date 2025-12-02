// ---- GLOBAL LIMIT (shared between gold.js and gold-stat.js) ----
let requestCount = 0;
let resetTime = new Date();
resetTime.setMonth(resetTime.getMonth() + 1);
// ---------------------------------------------------------------

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const now = new Date();
  if (now > resetTime) {
    requestCount = 0;
    resetTime = new Date();
    resetTime.setMonth(resetTime.getMonth() + 1);
  }

  if (requestCount >= 100) {
    return res.status(429).json({ error: "Monthly API request limit reached" });
  }

  const currency = req.query.currency || "USD";

  try {
    const goldRes = await fetch(`https://www.goldapi.io/api/XAU/${currency}`, {
      headers: { "x-access-token": "goldapi-16vzcc19miogmox2-io" },
    });
    const goldData = await goldRes.json();

    const silverRes = await fetch(`https://www.goldapi.io/api/XAG/${currency}`, {
      headers: { "x-access-token": "goldapi-16vzcc19miogmox2-io" },
    });
    const silverData = await silverRes.json();

    requestCount++;

    return res.status(200).json({
      source: "live",
      requestCount,
      gold: goldData.price,
      silver: silverData.price,
      currency,
      timestamp: new Date().toISOString(),
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch metal prices" });
  }
}

// Export for shared usage by gold-stat.js
export { requestCount, resetTime };
