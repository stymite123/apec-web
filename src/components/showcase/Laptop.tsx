import { siBitcoin, siEthereum, siSolana, type SimpleIcon } from "simple-icons";

import { BrandIcon } from "@/components/showcase/BrandIcon";
import { LivePrice } from "@/components/showcase/LivePrice";
import { Stage3D } from "@/components/showcase/Stage3D";
import { showcase } from "@/content/showcase";

const e = showcase.exchange;
const COINS: Record<string, { icon: SimpleIcon; color?: string }> = {
  BTC: { icon: siBitcoin },
  ETH: { icon: siEthereum, color: "#8c8cff" },
  SOL: { icon: siSolana },
};

/** Deterministic demo series (no randomness, so server and client markup match). */
function series(n: number, seed: number, drift: number) {
  const out: number[] = [];
  let v = 50;
  for (let i = 0; i < n; i++) {
    v += Math.sin(i * 1.7 + seed) * 4 + Math.cos(i * 0.6 + seed * 2) * 3 + drift;
    out.push(v);
  }
  return out;
}

function toPath(values: number[], w: number, h: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * (h - 6) - 3;
      return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join("");
}

const MAIN = toPath(series(48, 1.3, 0.9), 248, 104);

function Exchange() {
  const tape = [...e.pairs, ...e.pairs];
  return (
    <div className="relative size-full overflow-hidden bg-[#0a0d14] text-white">
      {/* Price tape */}
      <div className="flex h-[18px] items-center overflow-hidden border-b border-white/5 bg-[#0e121b] text-[8.5px]">
        <div className="loop flex w-max [animation:ticker_16s_linear_infinite] gap-6 pl-4">
          {[...tape, ...tape].map((p, i) => (
            <span key={i} className="flex gap-1.5">
              <span className="text-white/60">{p.symbol}/USDT</span>
              <span>{p.price.toLocaleString("en-US")}</span>
              <span className={p.change >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}>
                {p.change >= 0 ? "+" : ""}
                {p.change}%
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Nav */}
      <div className="flex h-[30px] items-center gap-4 px-4">
        <span className="flex items-center gap-1.5 text-[11px] font-bold">
          <span className="size-3 rotate-45 rounded-[2px] bg-linear-to-br from-[#f7c948] to-[#f08a24]" />
          {e.name}
        </span>
        {e.nav.map((link) => (
          <span key={link} className="text-[9px] text-white/55">
            {link}
          </span>
        ))}
        <span className="ml-auto rounded-full bg-[#f7c948] px-2.5 py-1 text-[8.5px] font-semibold text-black">
          {e.connect}
        </span>
      </div>

      <div className="grid grid-cols-[0.9fr_1.1fr] gap-3 px-4 pt-2">
        <div className="pt-2">
          <p className="text-[24px] leading-[1.02] font-extrabold tracking-[-0.03em]">
            {e.headline[0]}
            <br />
            <span className="bg-linear-to-r from-[#f7c948] to-[#f08a24] bg-clip-text text-transparent">
              {e.headline[1]}
            </span>
          </p>
          <p className="mt-2 text-[9px] leading-snug text-white/55">{e.sub}</p>
          <div className="mt-3 flex gap-2 text-[8.5px] font-semibold">
            <span className="rounded-full bg-[#f7c948] px-3 py-1.5 text-black">{e.actions[0]}</span>
            <span className="rounded-full border border-white/20 px-3 py-1.5">{e.actions[1]}</span>
          </div>
          <div className="mt-3 flex gap-1.5">
            {e.pairs.map((p) => (
              <span
                key={p.symbol}
                className="flex size-6 items-center justify-center rounded-full bg-white/8"
              >
                <BrandIcon
                  icon={COINS[p.symbol]!.icon}
                  color={COINS[p.symbol]!.color}
                  className="size-3.5"
                />
              </span>
            ))}
          </div>
        </div>

        {/* Chart card */}
        <div className="rounded-[10px] border border-white/6 bg-[#10141e] p-2.5">
          <div className="flex items-center gap-1.5">
            <BrandIcon icon={siBitcoin} className="size-3.5" />
            <span className="text-[9.5px] text-white/70">BTC/USDT</span>
            <span className="ml-auto rounded bg-[#22c55e]/15 px-1 text-[8.5px] text-[#22c55e]">
              +{e.pairs[0].change}%
            </span>
          </div>
          <LivePrice
            base={e.pairs[0].price}
            className="mt-0.5 block text-[15px] font-bold tabular-nums"
          />
          <div className="mt-1 flex gap-2 text-[8px] text-white/40">
            {e.timeframes.map((t, i) => (
              <span key={t} className={i === 2 ? "text-white" : ""}>
                {t}
              </span>
            ))}
          </div>
          <div className="relative mt-1.5">
            <svg viewBox="0 0 248 104" className="w-full overflow-visible">
              <defs>
                <linearGradient id="ex-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#22c55e" stopOpacity="0.32" />
                  <stop offset="1" stopColor="#22c55e" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[26, 52, 78].map((y) => (
                <path key={y} d={`M0 ${y}H248`} stroke="white" strokeOpacity="0.05" />
              ))}
              <path d={`${MAIN}L248 104L0 104Z`} fill="url(#ex-area)" />
              <path
                d={MAIN}
                fill="none"
                stroke="#22c55e"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
            {/* The chart draws left to right: a cover in the card colour shrinks away. */}
            <span
              aria-hidden
              className="loop absolute -inset-1 origin-right scale-x-0 [animation:unmask_6s_ease-out_infinite_both] bg-[#10141e]"
            />
          </div>
        </div>
      </div>

      {/* Markets */}
      <div className="mx-4 mt-2.5 rounded-[10px] border border-white/6 bg-[#10141e] px-2.5 py-1.5 text-[8.5px]">
        <div className="grid grid-cols-[1.2fr_1fr_0.6fr_0.8fr] pb-1 text-white/35">
          {e.columns.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
        {e.pairs.map((p, i) => (
          <div
            key={p.symbol}
            className="grid grid-cols-[1.2fr_1fr_0.6fr_0.8fr] items-center border-t border-white/5 py-1"
          >
            <span className="flex items-center gap-1.5">
              <BrandIcon
                icon={COINS[p.symbol]!.icon}
                color={COINS[p.symbol]!.color}
                className="size-3"
              />
              {p.symbol}
            </span>
            <LivePrice base={p.price} className="tabular-nums" />
            <span className={p.change >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}>
              {p.change >= 0 ? "+" : ""}
              {p.change}%
            </span>
            <svg viewBox="0 0 48 12" className="h-3 w-12">
              <path
                d={toPath(series(14, i * 2.1, p.change >= 0 ? 0.6 : -0.6), 48, 12)}
                fill="none"
                stroke={p.change >= 0 ? "#22c55e" : "#ef4444"}
                strokeWidth="1.2"
              />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

const KEY_ROWS = [14, 14, 13, 12, 11];

/**
 * Web development: a CSS-3D laptop (lid with thickness, bezel, keyboard, trackpad)
 * running a live crypto exchange — moving price tape, a chart that draws itself,
 * drifting prices.
 */
export function Laptop() {
  return (
    <Stage3D rest={{ x: -16, y: -22 }} className="h-[500px] w-[760px]">
      {/* Lid: stands on the hinge and leans back. */}
      <div
        className="absolute top-[-8px] left-[100px] h-[350px] w-[560px] [transform-style:preserve-3d]"
        style={{ transformOrigin: "50% 100%", transform: "rotateX(10deg)" }}
      >
        {[2, 4].map((z) => (
          <div
            key={z}
            className="absolute inset-0 rounded-[18px] bg-[#8d929a]"
            style={{ transform: `translateZ(${-z}px)` }}
          />
        ))}
        <div
          className="absolute inset-0 rounded-[18px] bg-[linear-gradient(135deg,#dfe2e6,#a8adb5)]"
          style={{ transform: "translateZ(-6px) rotateY(180deg)" }}
        />
        <div className="absolute inset-0 rounded-[18px] bg-[#0b0c0e] p-[12px] shadow-[inset_0_0_0_1.5px_#3a3d44]">
          <div className="relative size-full overflow-hidden rounded-[6px]">
            <Exchange />
            <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgb(255_255_255/0.07),transparent_42%)]" />
          </div>
          <span className="absolute top-[4px] left-1/2 size-[5px] -translate-x-1/2 rounded-full bg-[#202227]" />
        </div>
      </div>

      {/* Base: lies flat from the hinge toward you. */}
      <div
        className="absolute top-[342px] left-[80px] h-[340px] w-[600px] [transform-style:preserve-3d]"
        style={{ transformOrigin: "50% 0%", transform: "rotateX(90deg)" }}
      >
        <div
          className="absolute -inset-16 bg-[radial-gradient(closest-side,rgb(14_18_32/0.32),transparent)]"
          style={{ transform: "translateZ(-14px)" }}
        />
        {[2, 4, 7].map((z) => (
          <div
            key={z}
            className="absolute inset-0 rounded-[18px] bg-[#9ea3ab]"
            style={{ transform: `translateZ(${-z}px)` }}
          />
        ))}
        <div className="absolute inset-0 rounded-[18px] bg-[linear-gradient(180deg,#e4e7eb,#c8ccd2)] shadow-[inset_0_1px_0_white]">
          <div className="absolute top-[28px] right-[40px] left-[40px] flex flex-col gap-[5px] rounded-[9px] bg-[#1b1d21] p-[7px]">
            {KEY_ROWS.map((count, r) => (
              <div key={r} className="flex gap-[5px]">
                {Array.from({ length: count }, (_, k) => (
                  <span
                    key={k}
                    className="h-[26px] flex-1 rounded-[4px] bg-[#2b2e34] shadow-[inset_0_-1.5px_0_#141518]"
                    style={{ flexGrow: r === 4 && k === 5 ? 6 : 1 }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="absolute top-[206px] left-1/2 h-[110px] w-[200px] -translate-x-1/2 rounded-[12px] bg-[#c4c8ce] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.07)]" />
        </div>
      </div>
    </Stage3D>
  );
}
