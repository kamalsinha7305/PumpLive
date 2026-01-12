

const API_BASE = "http://localhost:5000"; 

export async function getNewStreams() {
  const res = await fetch(`${API_BASE}/api/bitquery/new-streams`);
  if (!res.ok) throw new Error("Failed to fetch new streams");
  return res.json();
}

export async function getTopStreamTokens() {
  const res = await fetch(`${API_BASE}/api/bitquery/top-stream-tokens`);
  if (!res.ok) throw new Error("Failed to fetch top stream tokens");
  return res.json();
}
