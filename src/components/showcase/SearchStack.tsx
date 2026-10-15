import { MicIcon, SearchIcon, SparklesIcon } from "lucide-react";
import { siClaude, siGooglegemini, siPerplexity } from "simple-icons";

import { BrandIcon } from "@/components/showcase/BrandIcon";
import { Stage3D } from "@/components/showcase/Stage3D";
import { showcase } from "@/content/showcase";

const s = showcase.search;
const GOOGLE = [
  ["G", "#4285F4"],
  ["o", "#EA4335"],
  ["o", "#FBBC05"],
  ["g", "#4285F4"],
  ["l", "#34A853"],
  ["e", "#EA4335"],
] as const;

function Favicon() {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#f1f3f4]">
      <span className="size-3 rotate-45 rounded-[2px] bg-apricot" />
    </span>
  );
}

/** Simplified Bing mark (the ribbon "b"), drawn for this mock-up. */
function BingMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5">
      <defs>
        <linearGradient id="bing-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#37e1c8" />
          <stop offset="1" stopColor="#0b7ad1" />
        </linearGradient>
      </defs>
      <path
        d="M5 2.2 9.2 3.6v13.1l5.6-3.1-2.6-1.2-1.6-3.9 8.6 3v4.3L9.2 21.8 5 19.6Z"
        fill="url(#bing-mark)"
      />
    </svg>
  );
}

function OtherResult({ domain }: { domain: string }) {
  return (
    <div className="flex h-[58px] flex-col justify-center gap-1.5">
      <div className="flex items-center gap-2">
        <span className="size-5 rounded-full bg-[#f1f3f4]" />
        <span className="text-[10.5px] text-[#4d5156]">{domain}</span>
      </div>
      <span className="h-2.5 w-3/5 rounded-full bg-[#c6d2f5]" />
      <span className="h-2 w-4/5 rounded-full bg-[#ececec]" />
    </div>
  );
}

/**
 * SEO across search engines and AI answers: Bing, Google and an AI assistant as three
 * planes floating in depth, each drifting and turning on its own (Mustafa 2026-10-15,
 * after the Mondragon 4 reel). On Google your result climbs to the top; the AI answer
 * types out and cites you. Decorative (the service text sits beside it).
 */
export function SearchStack() {
  return (
    <Stage3D rest={{ x: 8, y: -14 }} className="h-[500px] w-[760px]">
      {/* Bing: the far plane, tipped away */}
      <div className="loop absolute top-[0px] left-[352px] w-[390px] [transform:translateZ(-150px)_rotateY(-9deg)_rotateX(4deg)] [animation:plane-b_13s_ease-in-out_infinite] rounded-[16px] bg-white p-5 text-[#111] shadow-[0_30px_60px_-24px_rgb(14_18_32/0.45),0_0_0_1px_rgb(14_18_32/0.06)] [transform-style:preserve-3d]">
        <div className="flex items-center gap-2.5">
          <BingMark />
          <span className="text-[13px] font-semibold text-[#444]">Microsoft Bing</span>
        </div>
        <div className="mt-3 flex h-9 items-center gap-2 rounded-full border border-[#d6d6d6] px-3.5 text-[12px] shadow-[0_2px_6px_rgb(0_0_0/0.08)]">
          <span className="flex-1 truncate">{s.query}</span>
          <SearchIcon aria-hidden className="size-3.5 text-[#174ae4]" />
        </div>
        <div className="mt-4">
          <p className="text-[10.5px] text-[#006d21]">https://{s.domain}</p>
          <p className="mt-0.5 text-[14px] leading-snug text-[#1a0dab]">{s.title}</p>
          <p className="mt-1 text-[10.5px] leading-snug text-[#4d5156]">{s.snippet}</p>
        </div>
        <OtherResult domain={s.others[1]} />
        <OtherResult domain={s.others[2]} />
      </div>

      {/* Google: the middle plane, nearly square to you */}
      <div className="loop absolute top-[84px] left-[24px] h-[330px] w-[440px] [transform:translateZ(0px)_rotateY(5deg)] [animation:plane-a_11s_ease-in-out_infinite] overflow-hidden rounded-[16px] bg-white p-5 text-[#202124] shadow-[0_40px_80px_-28px_rgb(14_18_32/0.5),0_0_0_1px_rgb(14_18_32/0.06)] [transform-style:preserve-3d]">
        <div className="flex items-center gap-3">
          <span className="text-[22px] font-medium tracking-[-0.03em]">
            {GOOGLE.map(([letter, color], i) => (
              <span key={i} style={{ color }}>
                {letter}
              </span>
            ))}
          </span>
          <div className="flex h-9 flex-1 items-center gap-2 rounded-full border border-[#dfe1e5] px-3.5 text-[12px] shadow-[0_1px_5px_rgb(32_33_36/0.14)]">
            <span className="flex-1 truncate">{s.query}</span>
            <MicIcon aria-hidden className="size-3.5 text-[#4285f4]" />
            <SearchIcon aria-hidden className="size-3.5 text-[#4285f4]" />
          </div>
        </div>
        <div className="mt-3 flex gap-4 border-b border-[#ebebeb] text-[11px] text-[#5f6368]">
          {s.tabs.map((tab, i) => (
            <span
              key={tab}
              className={i === 0 ? "border-b-2 border-[#1a73e8] pb-1.5 text-[#1a73e8]" : "pb-1.5"}
            >
              {tab}
            </span>
          ))}
        </div>
        <div className="relative mt-3 h-[220px]">
          <div className="loop absolute inset-x-0 top-0 z-10 [animation:rank-ours_8s_var(--ease-out-expo)_infinite_both] bg-white">
            <div className="flex items-center gap-2">
              <Favicon />
              <div className="leading-tight">
                <p className="text-[11.5px]">{s.brand}</p>
                <p className="text-[10.5px] text-[#4d5156]">https://{s.domain}</p>
              </div>
            </div>
            <p className="mt-1.5 text-[15.5px] leading-snug text-[#1a0dab]">{s.title}</p>
            <p className="mt-1 text-[11px] leading-snug text-[#4d5156]">{s.snippet}</p>
            <div className="mt-1.5 flex gap-4 text-[11px] text-[#1a0dab]">
              {s.sitelinks.map((link) => (
                <span key={link}>{link}</span>
              ))}
            </div>
          </div>
          <div className="loop absolute inset-x-0 top-[110px] [animation:rank-other_8s_var(--ease-out-expo)_infinite_both]">
            <OtherResult domain={s.others[0]} />
            <OtherResult domain={s.others[2]} />
          </div>
        </div>
      </div>

      {/* AI answer: the near plane, leaning in */}
      <div className="loop absolute top-[232px] left-[396px] w-[340px] [transform:translateZ(120px)_rotateY(-12deg)_rotateX(-3deg)] [animation:plane-c_9s_ease-in-out_infinite] rounded-[18px] bg-[#18191c] p-4 text-white shadow-[0_44px_80px_-24px_rgb(14_18_32/0.6),0_0_0_1px_rgb(255_255_255/0.08)] [transform-style:preserve-3d]">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-1 text-[10px]">
            <SparklesIcon aria-hidden className="size-3" />
            ChatGPT
          </span>
          {[siGooglegemini, siPerplexity, siClaude].map((icon) => (
            <span
              key={icon.slug}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-1 text-[10px]"
            >
              <BrandIcon icon={icon} className="size-3" />
              {icon.title}
            </span>
          ))}
        </div>
        <p className="mt-3 ml-auto w-fit max-w-[85%] rounded-[14px] rounded-br-[4px] bg-[#2f3034] px-3 py-2 text-[11px] leading-snug text-white/90">
          {s.prompt}
        </p>
        <div className="mt-3 flex gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-[#18191c]">
            <SparklesIcon aria-hidden className="size-3.5" />
          </span>
          <div>
            <p className="relative text-[11px] leading-snug text-white/80">
              {s.answer}
              {/* Typing: a cover in the card colour shrinks away (scale is composited). */}
              <span
                aria-hidden
                className="loop absolute -inset-0.5 origin-right scale-x-0 [animation:unmask_7s_linear_infinite_both] bg-[#18191c]"
              />
            </p>
            <span className="loop mt-2 inline-flex [animation:pop-in_7s_var(--ease-out-back)_infinite_both] items-center gap-1.5 rounded-full bg-white/12 py-1 pr-2.5 pl-1 text-[10px]">
              <span className="flex size-4 items-center justify-center rounded-full bg-white">
                <span className="size-2 rotate-45 rounded-[1px] bg-apricot" />
              </span>
              {s.domain}
            </span>
          </div>
        </div>
        <p className="mt-3 border-t border-white/10 pt-2 text-[10px] text-white/50">{s.aiLabel}</p>
      </div>
    </Stage3D>
  );
}
