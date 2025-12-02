import { requestCount, resetTime } from "./gold";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const limit = 100;
  const remaining = Math.max(0, limit - requestCount);

  return res.status(200).json({
    used: requestCount,
    limit,
    remaining,
    resetTime,
  });
}
