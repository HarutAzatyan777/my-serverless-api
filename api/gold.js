let requestCount = 0;
let resetTime = new Date();
resetTime.setMonth(resetTime.getMonth() + 1); // ամսվա reset

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle OPTIONS
  if (req.method === "OPTIONS") return res.status(200).end();

  const now = new Date();
  if (now > resetTime) {
    requestCount = 0; // reset counter
    resetTime = new Date();
    resetTime.setMonth(resetTime.getMonth() + 1);
  }

  if (requestCount >= 100) {
    return res.status(429).json({ error: "Monthly API request limit reached" });
  }

  const currency = req.query.currency || "USD";

  try {
    // Gold price
    const goldRes = await fetch(`https://www.goldapi.io/api/XAU/${currency}`, {
      headers: { "x-access-token": "goldapi-16vzcc19miogmox2-io" },
    });
    const goldData = await goldRes.json();

    // Silver price
    const silverRes = await fetch(`https://www.goldapi.io/api/XAG/${currency}`, {
      headers: { "x-access-token": "goldapi-16vzcc19miogmox2-io" },
    });
    const silverData = await silverRes.json();

    requestCount++; // հաշվել request

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
