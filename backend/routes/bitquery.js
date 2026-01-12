import express from "express";
import dotenv from "dotenv";
import {
  QUERY_NEW_PUMPFUN_TOKENS,
  QUERY_TOP_PUMPFUN_TOKENS_5MIN,
} from "../queries/pumpfunQueries.js";

dotenv.config();
const router = express.Router();

async function callBitquery(query) {
  const response = await fetch(process.env.BITQUERY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.BITQUERY_API_KEY}`,
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();

  if (data.errors) {
    throw new Error(data.errors?.[0]?.message || "Bitquery error");
  }

  return data;
}

function getAgeLabel(isoTime) {
  if (!isoTime) return "new";
  const diff = Date.now() - new Date(isoTime).getTime();

  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;

  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

// ✅ LEFT panel: New Streams
router.get("/new-streams", async (req, res) => {
  try {
    const data = await callBitquery(QUERY_NEW_PUMPFUN_TOKENS);

    const rows = data?.data?.Solana?.TokenSupplyUpdates || [];

    const list = rows.map((x) => {
      const symbol = x?.TokenSupplyUpdate?.Currency?.Symbol || "UNKNOWN";
      const name = x?.TokenSupplyUpdate?.Currency?.Name || "No name";
      const mint = x?.TokenSupplyUpdate?.Currency?.MintAddress || "";

      return {
        name: symbol,
        sub: name,
        mc: "$0",
        age: getAgeLabel(x?.Block?.Time),
        mint,
        avatarType: "pill",
        stats: { watchers: 0, tx: 0 },
      };
    });

    res.json(list);
  } catch (err) {
    console.log("BITQUERY ERROR /new-streams:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ RIGHT panel: Top Stream Tokens (real) using 5min marketcap change
router.get("/top-stream-tokens", async (req, res) => {
  try {
    const data = await callBitquery(QUERY_TOP_PUMPFUN_TOKENS_5MIN);

    const rows = data?.data?.Solana?.DEXTradeByTokens || [];

    const list = rows.map((x) => {
      const token = x?.Trade?.Currency;
      const symbol = token?.Symbol || "UNKNOWN";
      const name = token?.Name || "No name";
      const mint = token?.MintAddress || "";

      const change5m = Number(x?.Marketcap_Change_5min || 0);
      const currentPrice = Number(x?.Trade?.CurrentPrice || 0);

      return {
        name: symbol,
        sub: name,
        mc: `${change5m.toFixed(2)}% (5m)`,
        age: currentPrice ? `$${currentPrice.toFixed(6)}` : "live",
        mint,
        thumbType: "photo",
        stats: { watchers: 0, tx: 0 },
      };
    });

    res.json(list);
  } catch (err) {
    console.log("BITQUERY ERROR /top-stream-tokens:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
