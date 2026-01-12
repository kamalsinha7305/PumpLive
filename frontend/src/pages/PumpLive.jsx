import React, { useEffect, useState } from "react";
import { getNewStreams, getTopStreamTokens } from "../api/bitqueryClient";

import {
  Search,
  Bell,
  Star,
  ChevronDown,
  Settings,
  ArrowUpRight,
  Wallet,
  CircleDollarSign,
  Shield,
  Copy,
} from "lucide-react";

/**
 * ✅ Pump Live UI + Backend Integration
 * Backend endpoints expected:
 * 1) GET http://localhost:5000/api/bitquery/new-streams
 * 2) GET http://localhost:5000/api/bitquery/top-stream-tokens
 */

// ---------- Static UI lists ----------
const NAV_ITEMS = [
  "Discover",
  "Pulse",
  "Trackers",
  "Perpetuals",
  "Yield",
  "Vision",
  "Portfolio",
  "Rewards",
];

const FILTER_TABS = ["Top", "Trending", "Surge", "DEX Screener", "Pump Live"];

// ---------- Small UI helpers ----------
const PillAvatar = () => (
  <div className="h-16 w-20 rounded-xl bg-gradient-to-br from-black via-zinc-900 to-black flex items-center justify-center">
    <div className="h-10 w-14 rounded-full bg-gradient-to-r from-emerald-400 to-teal-200 rotate-[-25deg] shadow-[0_0_18px_rgba(52,211,153,0.25)] relative">
      <div className="absolute inset-0 rounded-full border border-white/20" />
      <div className="absolute left-1 top-1 h-8 w-7 rounded-full bg-white/90" />
    </div>
  </div>
);

const CoinAvatar = () => (
  <div className="h-16 w-20 rounded-xl bg-zinc-950 flex items-center justify-center">
    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-200 to-yellow-500 shadow-[0_0_18px_rgba(250,204,21,0.18)] border border-black/30 flex items-center justify-center text-xs font-black text-zinc-900">
      2
    </div>
  </div>
);

const LogoAvatar = () => (
  <div className="h-16 w-20 rounded-xl bg-zinc-950 flex items-center justify-center border border-white/5">
    <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center text-zinc-900 font-black">
      α
    </div>
  </div>
);

const VideoAvatar = () => (
  <div className="h-16 w-20 rounded-xl bg-gradient-to-br from-zinc-950 to-zinc-900 flex items-center justify-center border border-white/5">
    <div className="h-10 w-14 rounded-lg bg-white/10" />
  </div>
);

const TokenThumb = ({ type }) => {
  const base = "h-16 w-20 rounded-xl border border-white/5 overflow-hidden";

  if (type === "photo")
    return (
      <div
        className={`${base} bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center`}
      >
        <div className="h-full w-full bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.35),transparent_45%),radial-gradient(circle_at_70%_70%,rgba(34,197,94,0.25),transparent_45%)]" />
      </div>
    );

  if (type === "coin")
    return (
      <div className={`${base} bg-zinc-950 flex items-center justify-center`}>
        <CoinAvatar />
      </div>
    );

  if (type === "banner")
    return (
      <div className={`${base} bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-zinc-950`}>
        <div className="h-full w-full bg-[radial-gradient(circle_at_20%_30%,rgba(236,72,153,0.35),transparent_45%),radial-gradient(circle_at_70%_70%,rgba(168,85,247,0.25),transparent_45%)]" />
      </div>
    );

  if (type === "photo2")
    return (
      <div className={`${base} bg-gradient-to-br from-blue-500/20 via-zinc-950 to-zinc-950`}>
        <div className="h-full w-full bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.35),transparent_45%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.10),transparent_45%)]" />
      </div>
    );

  return (
    <div className={`${base} bg-gradient-to-br from-zinc-950 to-zinc-900 flex items-center justify-center`}>
      <div className="h-10 w-14 rounded-lg bg-white/10" />
    </div>
  );
};

const IconText = ({ icon: Icon, children, className = "" }) => (
  <div className={`flex items-center gap-1 text-xs text-zinc-400 ${className}`}>
    <Icon className="h-3.5 w-3.5" />
    <span>{children}</span>
  </div>
);

const CircleButton = ({ children, className = "" }) => (
  <button
    className={`h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-[0_8px_20px_rgba(37,99,235,0.25)] ${className}`}
  >
    {children}
  </button>
);

const Panel = ({ title, rightSlot, children }) => (
  <div className="bg-gradient-to-b from-zinc-900/60 to-zinc-950/60 border border-white/5 rounded-2xl overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
    <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
      <div className="text-white font-semibold">{title}</div>
      {rightSlot}
    </div>
    {children}
  </div>
);

const Row = ({ left, mid, right }) => (
  <div className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition border-b border-white/5 last:border-b-0">
    {left}
    <div className="flex-1 min-w-0">{mid}</div>
    <div className="flex items-center gap-3">{right}</div>
  </div>
);

// ---------- Main Page ----------
function PumpLive() {
  // ✅ backend driven data
  const [newStreams, setNewStreams] = useState([]);
  const [topStreamTokens, setTopStreamTokens] = useState([]);

  // ✅ UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Backend base URL
  const API_BASE = "http://localhost:5000";

const fetchAll = async () => {
  try {
    setError("");
    setLoading(true);

    const [res1, res2] = await Promise.all([
      fetch(`${API_BASE}/api/bitquery/new-streams`),
      fetch(`${API_BASE}/api/bitquery/top-stream-tokens`),
    ]);

    if (!res1.ok) throw new Error("Failed to fetch new streams");
    if (!res2.ok) throw new Error("Failed to fetch top tokens");

    const data1 = await res1.json();
    const data2 = await res2.json();

    setNewStreams(Array.isArray(data1) ? data1 : []);
    setTopStreamTokens(Array.isArray(data2) ? data2 : []);
  } catch (err) {
    console.error(err);
    setError(err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchAll();

  const id = setInterval(fetchAll, 8000);
  return () => clearInterval(id);
}, []);

  return (
    <div className="min-h-screen bg-[#0b0f16] text-white">
      {/* Top Navbar */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#0b0f16]/90 backdrop-blur">
        <div className="flex items-center gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-md bg-white/10 flex items-center justify-center font-black">
              ▲
            </div>
            <div className="font-semibold tracking-wide">
              Eclipse <span className="text-zinc-400 font-normal">Pro</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-5 text-sm">
            {NAV_ITEMS.map((item) => (
              <a
                key={item}
                href="#"
                className={`${
                  item === "Discover" ? "text-blue-400" : "text-zinc-300"
                } hover:text-white transition`}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/5 rounded-full px-3 h-10 w-[360px]">
            <Search className="h-4 w-4 text-zinc-400" />
            <input
              className="bg-transparent outline-none text-sm placeholder:text-zinc-500 w-full"
              placeholder="Search by token or CA..."
            />
          </div>

          <button className="h-10 px-3 rounded-full bg-white/5 border border-white/5 text-sm flex items-center gap-2 hover:bg-white/10 transition">
            <div className="h-4 w-4 rounded-sm bg-gradient-to-br from-purple-500 to-blue-500" />
            SOL <ChevronDown className="h-4 w-4 text-zinc-400" />
          </button>

          <button className="h-10 px-4 rounded-full bg-blue-600 hover:bg-blue-500 transition font-semibold text-sm">
            Deposit
          </button>

          <button className="h-10 w-10 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition flex items-center justify-center">
            <Star className="h-5 w-5 text-zinc-300" />
          </button>
          <button className="h-10 w-10 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition flex items-center justify-center">
            <Bell className="h-5 w-5 text-zinc-300" />
          </button>

          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center font-semibold text-sm">
            34
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-6 py-5">
        {/* status messages */}
        {loading && (
          <div className="mb-3 text-sm text-zinc-400">
            Loading live data...
          </div>
        )}

        {error && (
          <div className="mb-3 text-sm text-red-400">
            {error} (Is backend running on port 5000?)
          </div>
        )}

        {/* Sub tabs */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6 text-sm text-zinc-400">
            {FILTER_TABS.map((t) => (
              <button
                key={t}
                className={`hover:text-white transition ${
                  t === "Pump Live" ? "text-white font-semibold" : ""
                }`}
              >
                {t}
                {t === "Pump Live" && (
                  <ChevronDown className="inline ml-1 h-4 w-4 text-zinc-400" />
                )}
              </button>
            ))}
          </div>

          {/* Right mini controls */}
          <div className="hidden lg:flex items-center gap-2">
            <button className="h-9 w-9 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition flex items-center justify-center">
              <Settings className="h-4 w-4 text-zinc-300" />
            </button>

            <div className="h-9 rounded-full bg-white/5 border border-white/5 flex items-center px-3 gap-2 text-sm">
              <span className="text-zinc-400">0</span>
              <span className="text-zinc-400">|</span>
              <span className="text-zinc-400">0</span>
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            </div>

            <div className="h-9 rounded-full bg-white/5 border border-white/5 flex items-center px-3 text-sm text-zinc-400">
              Quick Buy <span className="ml-2 text-white/70">0.0</span>
            </div>

            <div className="h-9 rounded-full bg-white/5 border border-white/5 flex items-center px-3 gap-2 text-sm">
              <span className="text-blue-400 font-semibold">P1</span>
              <span className="text-zinc-500">P2</span>
              <span className="text-zinc-500">P3</span>
            </div>
          </div>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left panel */}
          <Panel
            title="New Streams"
            rightSlot={
              <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-full px-3 h-9 w-[260px]">
                <Search className="h-4 w-4 text-zinc-400" />
                <input
                  className="bg-transparent outline-none text-sm placeholder:text-zinc-500 w-full"
                  placeholder="Search by ticker or name"
                />
              </div>
            }
          >
            <div className="max-h-[640px] overflow-auto">
              {(newStreams || []).map((s) => (
                <Row
                  key={s.mint || s.name}
                  left={
                    s.avatarType === "pill" ? (
                      <PillAvatar />
                    ) : s.avatarType === "coin" ? (
                      <CoinAvatar />
                    ) : s.avatarType === "video" ? (
                      <VideoAvatar />
                    ) : (
                      <LogoAvatar />
                    )
                  }
                  mid={
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{s.name}</div>
                        <div className="text-xs text-zinc-500">{s.sub}</div>
                        <Copy className="h-3.5 w-3.5 text-zinc-600" />
                      </div>

                      <div className="flex items-center gap-3 mt-1">
                        <IconText icon={Shield}>{s.stats?.watchers ?? 0}</IconText>
                        <IconText icon={CircleDollarSign}>{s.stats?.tx ?? 0}</IconText>
                        <IconText icon={Wallet}> </IconText>
                        <IconText icon={ArrowUpRight}> </IconText>
                      </div>
                    </div>
                  }
                  right={
                    <>
                      <div className="text-right">
                        <div className="text-xs text-emerald-400">{s.age}</div>
                        <div className="text-xs text-zinc-500">
                          MC{" "}
                          <span className="text-blue-400 font-semibold">
                            {s.mc}
                          </span>
                        </div>
                      </div>
                      <CircleButton>
                        <ArrowUpRight className="h-4 w-4" />
                      </CircleButton>
                    </>
                  }
                />
              ))}
            </div>
          </Panel>

          {/* Right panel */}
          <Panel
            title="Top Stream Tokens"
            rightSlot={
              <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-full px-3 h-9 w-[260px]">
                <Search className="h-4 w-4 text-zinc-400" />
                <input
                  className="bg-transparent outline-none text-sm placeholder:text-zinc-500 w-full"
                  placeholder="Search by ticker or name"
                />
              </div>
            }
          >
            <div className="max-h-[640px] overflow-auto">
              {(topStreamTokens || []).map((t) => (
                <Row
                  key={t.mint || t.name}
                  left={<TokenThumb type={t.thumbType || "photo"} />}
                  mid={
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{t.name}</div>
                        <div className="text-xs text-zinc-500">{t.sub}</div>
                        <Copy className="h-3.5 w-3.5 text-zinc-600" />
                      </div>

                      <div className="flex items-center gap-3 mt-1">
                        <IconText icon={Shield}>{t.stats?.watchers ?? 0}</IconText>
                        <IconText icon={CircleDollarSign}>{t.stats?.tx ?? 0}</IconText>
                        <IconText icon={Wallet}> </IconText>
                        <IconText icon={ArrowUpRight}> </IconText>
                      </div>
                    </div>
                  }
                  right={
                    <>
                      <div className="text-right">
                        <div className="text-xs text-emerald-400">{t.age}</div>
                        <div className="text-xs text-zinc-500">
                          MC{" "}
                          <span className="text-blue-400 font-semibold">
                            {t.mc}
                          </span>
                        </div>
                      </div>
                      <CircleButton>
                        <ArrowUpRight className="h-4 w-4" />
                      </CircleButton>
                    </>
                  }
                />
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* Footer bar */}
      <div className="fixed bottom-0 left-0 right-0 h-12 bg-[#0b0f16]/95 border-t border-white/5 backdrop-blur flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="px-2 py-1 rounded bg-blue-600/20 text-blue-300 border border-blue-500/20">
            PRESET 1
          </span>
          <span className="text-zinc-600">|</span>
          <span>Twitter</span>
          <span className="text-zinc-600">•</span>
          <span>Discover</span>
          <span className="text-zinc-600">•</span>
          <span>Pulse</span>
          <span className="text-zinc-600">•</span>
          <span>PnL</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <span className="text-amber-300">$90.7K</span>
          <span className="text-blue-300">$3106</span>
          <span className="text-emerald-300">$136.9</span>
          <span className="px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-300">
            Connection is stable
          </span>
          <span className="text-zinc-500">GLOBAL</span>
        </div>
      </div>
    </div>
  );
}

export default PumpLive;
