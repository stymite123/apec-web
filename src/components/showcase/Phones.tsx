import {
  HeartIcon,
  MessageCircleIcon,
  PauseIcon,
  PhoneIcon,
  RepeatIcon,
  ShuffleIcon,
  SkipBackIcon,
  SkipForwardIcon,
  UserIcon,
} from "lucide-react";
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

import { PathMotion } from "@/components/showcase/PathMotion";
import { Stage3D } from "@/components/showcase/Stage3D";
import { showcase } from "@/content/showcase";

const a = showcase.apps;

/** A phone with real depth: a titanium body extruded from stacked layers, then the screen. */
function Phone({
  width,
  height,
  style,
  children,
}: {
  width: number;
  height: number;
  style: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div className="absolute [transform-style:preserve-3d]" style={{ width, height, ...style }}>
      <div
        className="absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,rgb(14_18_32/0.28),transparent)]"
        style={{ transform: "translateZ(-40px) translateY(30px)" }}
      />
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-[46px]"
          style={{
            transform: `translateZ(${-(i + 1) * 2.3}px)`,
            background: i % 2 === 0 ? "#6d7179" : "#575b62",
          }}
        />
      ))}
      <div className="absolute inset-0 rounded-[46px] bg-black p-[9px] shadow-[inset_0_0_0_1.5px_#8a8e96,inset_0_0_0_3px_#1a1b1e]">
        <div className="relative size-full overflow-hidden rounded-[38px]">{children}</div>
        <span className="absolute top-[18px] left-1/2 h-[24px] w-[84px] -translate-x-1/2 rounded-full bg-black" />
      </div>
    </div>
  );
}

function StatusBar({ dark }: { dark?: boolean }) {
  return (
    <div
      className={`flex h-[44px] items-end justify-between px-6 pb-1 text-[11px] font-semibold ${dark ? "text-white" : "text-black"}`}
    >
      <span>9:41</span>
      <span className="flex items-center gap-1">
        <span className="flex h-[9px] items-end gap-[1.5px]">
          {[4, 6, 8, 9].map((h) => (
            <span key={h} className="w-[2.5px] rounded-[1px] bg-current" style={{ height: h }} />
          ))}
        </span>
        <span className="ml-1 h-[10px] w-[20px] rounded-[3px] border border-current p-[1.5px] opacity-90">
          <span className="block h-full w-3/4 rounded-[1px] bg-current" />
        </span>
      </span>
    </div>
  );
}

const BARS = Array.from({ length: 30 }, (_, i) =>
  Math.round(22 + Math.abs(Math.sin(i * 0.9) * 50 + Math.cos(i * 0.37) * 28)),
);

function MusicApp() {
  return (
    <div className="relative size-full bg-[linear-gradient(180deg,#3a2150_0%,#1b1230_45%,#0b0a12_100%)] text-white">
      <StatusBar dark />
      <div className="px-5 pt-3">
        {/* Album art: the site's own anime artwork. */}
        <div className="loop relative aspect-square [animation:breathe_6s_ease-in-out_infinite] overflow-hidden rounded-[18px] shadow-[0_24px_40px_-14px_rgb(0_0_0/0.8)]">
          {["dawn-sky", "dawn-clouds-mid", "dawn-pole"].map((layer) => (
            <Image
              key={layer}
              src={`/art/${layer}.webp`}
              alt=""
              fill
              className="object-cover object-[92%_35%]"
            />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-[15px] font-bold">{a.track}</p>
            <p className="text-[11.5px] text-white/60">{a.artist}</p>
          </div>
          <HeartIcon aria-hidden className="size-5 fill-[#ff4d6d] text-[#ff4d6d]" />
        </div>
        {/* Waveform scrubber */}
        <div className="relative mt-4 flex h-[34px] items-center gap-[2px]">
          {BARS.map((h, i) => (
            <span
              key={i}
              className={`loop w-[3.5px] origin-center [animation:eq_1.1s_ease-in-out_infinite] rounded-full ${i < 12 ? "bg-white" : "bg-white/30"}`}
              style={{ height: `${h}%`, animationDelay: `${-(i % 7) * 0.13}s` }}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[9.5px] text-white/50 tabular-nums">
          <span>1:12</span>
          <span>3:48</span>
        </div>
        <div className="mt-3 flex items-center justify-between px-1">
          <ShuffleIcon aria-hidden className="size-4 text-white/60" />
          <SkipBackIcon aria-hidden className="size-5 fill-white" />
          <span className="flex size-13 items-center justify-center rounded-full bg-white text-black">
            <PauseIcon aria-hidden className="size-5 fill-black" />
          </span>
          <SkipForwardIcon aria-hidden className="size-5 fill-white" />
          <RepeatIcon aria-hidden className="size-4 text-white/60" />
        </div>
      </div>
    </div>
  );
}

const ROUTE = "M30 330 C 60 300, 40 250, 90 230 S 160 200, 150 150 S 120 90, 170 60";

function RideApp() {
  return (
    <div className="relative size-full bg-[#e8ebee] text-black">
      {/* Map */}
      <svg aria-hidden viewBox="0 0 192 412" className="absolute inset-0 size-full">
        <rect width="192" height="412" fill="#eceff2" />
        <path
          d="M-10 120 C 60 140, 120 90, 210 120 L210 150 C 120 120, 60 170, -10 150Z"
          fill="#c8def5"
        />
        <rect x="104" y="250" width="70" height="56" rx="8" fill="#d3ead0" />
        <rect x="14" y="20" width="56" height="44" rx="6" fill="#d3ead0" />
        {[40, 92, 150, 205, 262, 318, 372].map((y) => (
          <path key={y} d={`M0 ${y}H192`} stroke="#ffffff" strokeWidth={y % 3 ? 6 : 9} />
        ))}
        {[34, 88, 138, 172].map((x) => (
          <path key={x} d={`M${x} 0V412`} stroke="#ffffff" strokeWidth={x % 2 ? 6 : 8} />
        ))}
        <path
          d={ROUTE}
          fill="none"
          stroke="#2563eb"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.25"
        />
        <path d={ROUTE} fill="none" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" />
        <circle cx="170" cy="60" r="9" fill="#111" />
        <circle cx="170" cy="60" r="3.5" fill="#fff" />
      </svg>
      {/* The car follows the route (in the screen's own pixels). */}
      <PathMotion
        d={ROUTE}
        duration={8}
        rotate
        className="absolute top-0 left-0 -mt-[11px] -ml-[11px] flex size-[22px] items-center justify-center rounded-full bg-black shadow-[0_3px_8px_rgb(0_0_0/0.35)] after:size-0 after:border-x-[5px] after:border-b-[9px] after:border-x-transparent after:border-b-white after:content-['']"
      />
      <div className="absolute inset-x-0 top-0">
        <StatusBar />
      </div>
      {/* Bottom sheet */}
      <div className="absolute inset-x-2 bottom-2 rounded-[26px] bg-white p-4 shadow-[0_-8px_24px_rgb(0_0_0/0.12)]">
        <span className="mx-auto block h-1 w-9 rounded-full bg-black/15" />
        <p className="mt-3 text-[15px] font-bold">{a.eta}</p>
        <p className="text-[11px] text-black/50">{a.rideLabel}</p>
        <div className="mt-3 flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-[#eef0f3]">
            <UserIcon aria-hidden className="size-4.5 text-black/60" />
          </span>
          <span className="h-2 w-16 rounded-full bg-black/10" />
          <span className="ml-auto flex size-8 items-center justify-center rounded-full bg-[#eef0f3]">
            <MessageCircleIcon aria-hidden className="size-4" />
          </span>
          <span className="flex size-8 items-center justify-center rounded-full bg-black text-white">
            <PhoneIcon aria-hidden className="size-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

/** Mobile apps: two phones with depth — a music player and live ride tracking. */
export function Phones() {
  return (
    <Stage3D rest={{ x: 6, y: -12 }} className="h-[500px] w-[760px]">
      <Phone
        width={210}
        height={430}
        style={{ left: 150, top: 46, transform: "translateZ(-90px) rotateY(18deg) rotateZ(-3deg)" }}
      >
        <RideApp />
      </Phone>
      <Phone
        width={232}
        height={474}
        style={{ left: 392, top: 10, transform: "translateZ(40px) rotateY(-14deg) rotateZ(2deg)" }}
      >
        <MusicApp />
      </Phone>
    </Stage3D>
  );
}
