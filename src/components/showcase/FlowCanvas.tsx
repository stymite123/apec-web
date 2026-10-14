import { BotIcon, CheckIcon, DatabaseIcon, SplitIcon, ZapIcon } from "lucide-react";
import type { ReactNode } from "react";
import { siClaude, siGmail, siGooglesheets, siHubspot, siWhatsapp } from "simple-icons";

import { BrandIcon } from "@/components/showcase/BrandIcon";
import { PathMotion } from "@/components/showcase/PathMotion";
import { Stage3D } from "@/components/showcase/Stage3D";
import { showcase } from "@/content/showcase";

const f = showcase.flow;

type Box = { x: number; y: number; w: number; h: number };
const NODES = {
  trigger: { x: 22, y: 112, w: 148, h: 58 },
  agent: { x: 206, y: 96, w: 196, h: 90 },
  branch: { x: 438, y: 112, w: 120, h: 58 },
  crm: { x: 596, y: 46, w: 142, h: 58 },
  reply: { x: 596, y: 178, w: 142, h: 58 },
} satisfies Record<string, Box>;
const TOOLS = [
  { x: 214, y: 228, icon: <BrandIcon icon={siClaude} className="size-4.5" /> },
  { x: 284, y: 228, icon: <DatabaseIcon aria-hidden className="size-4 text-[#9aa3b5]" /> },
  { x: 354, y: 228, icon: <BrandIcon icon={siGooglesheets} className="size-4.5" /> },
];

const right = (b: Box) => [b.x + b.w, b.y + b.h / 2] as const;
const left = (b: Box) => [b.x, b.y + b.h / 2] as const;
const wire = ([x1, y1]: readonly [number, number], [x2, y2]: readonly [number, number]) => {
  const dx = Math.max(30, (x2 - x1) / 2);
  return `M${x1} ${y1}C${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}`;
};
const WIRES = [
  wire(right(NODES.trigger), left(NODES.agent)),
  wire(right(NODES.agent), left(NODES.branch)),
  wire(right(NODES.branch), left(NODES.crm)),
  wire(right(NODES.branch), left(NODES.reply)),
];

function Node({
  box,
  icon,
  title,
  sub,
  step,
  children,
  tone = "#ffffff",
}: {
  box: Box;
  icon: ReactNode;
  title: string;
  sub: string;
  step: number;
  children?: ReactNode;
  tone?: string;
}) {
  return (
    <div
      className="absolute rounded-[12px] border border-[#2b303c] bg-[#181b22] p-2.5 shadow-[0_10px_24px_-10px_rgb(0_0_0/0.7)]"
      style={{ left: box.x, top: box.y, width: box.w, minHeight: box.h }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-[9px]"
          style={{ background: tone }}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[12px] font-semibold text-white">{title}</p>
          <p className="truncate text-[10.5px] text-[#9aa3b5]">{sub}</p>
        </div>
      </div>
      {children}
      <span className="absolute top-1/2 -left-[5px] size-2.5 -translate-y-1/2 rounded-full border-2 border-[#181b22] bg-[#5b6475]" />
      <span className="absolute top-1/2 -right-[5px] size-2.5 -translate-y-1/2 rounded-full border-2 border-[#181b22] bg-[#5b6475]" />
      <span
        className="loop absolute -top-2 -right-2 flex size-5 [animation:step-in_6s_ease-out_infinite_both] items-center justify-center rounded-full bg-[#22c55e] text-[#0f1115]"
        style={{ animationDelay: `${step * 0.55}s` }}
      >
        <CheckIcon aria-hidden className="size-3" strokeWidth={3.5} />
      </span>
    </div>
  );
}

/**
 * Automation, drawn like a real workflow editor: a mail trigger feeds an AI agent
 * (with its model, memory and tool), a branch, the CRM and a WhatsApp reply. Data
 * runs along the wires, nodes tick off, the execution log fills in.
 */
export function FlowCanvas() {
  const times = ["0.21s", "1.38s", "0.02s", "0.44s", "0.31s"];
  return (
    <Stage3D rest={{ x: 12, y: 13 }} className="h-[500px] w-[760px]">
      <div className="absolute inset-x-0 top-[6px] overflow-hidden rounded-[18px] border border-[#252a35] bg-[#0f1115] text-white shadow-[0_50px_90px_-30px_rgb(14_18_32/0.7)]">
        {/* Title bar */}
        <div className="flex h-11 items-center gap-3 border-b border-[#232733] px-4">
          <span className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="text-[12px] text-[#9aa3b5]">
            Workflows / <span className="text-white">{f.name}</span>
          </span>
          <span className="ml-auto flex items-center gap-2 rounded-full bg-[#22c55e]/15 px-2.5 py-1 text-[11px] text-[#4ade80]">
            <span className="h-3 w-5 rounded-full bg-[#22c55e] p-0.5">
              <span className="ml-auto block size-2 rounded-full bg-white" />
            </span>
            {f.status}
          </span>
        </div>

        {/* Canvas */}
        <div className="relative h-[282px] bg-[radial-gradient(circle,rgb(255_255_255/0.07)_1px,transparent_1.3px)] bg-size-[16px_16px]">
          <svg aria-hidden viewBox="0 0 760 282" className="absolute inset-0 size-full">
            {WIRES.map((d) => (
              <path key={d} d={d} fill="none" stroke="#3b4252" strokeWidth="2" />
            ))}
            {TOOLS.map((tool, i) => (
              <path
                key={i}
                d={`M${NODES.agent.x + 34 + i * 66} ${NODES.agent.y + NODES.agent.h} L${tool.x + 20} ${tool.y}`}
                stroke="#5b4fd6"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                fill="none"
              />
            ))}
          </svg>
          {/* Data packets running along each wire. */}
          {WIRES.map((d, i) => (
            <PathMotion
              key={d}
              d={d}
              duration={1.6}
              delay={i * 0.4}
              className="absolute top-0 left-0 -mt-[3.5px] -ml-[3.5px] size-[7px] rounded-full bg-apricot"
            />
          ))}

          <Node
            box={NODES.trigger}
            icon={<BrandIcon icon={siGmail} className="size-5" />}
            title={f.nodes.trigger.title}
            sub={f.nodes.trigger.sub}
            step={0}
          >
            <span className="absolute -top-2 -left-2 flex size-5 items-center justify-center rounded-full bg-[#f3a86b] text-[#0f1115]">
              <ZapIcon aria-hidden className="size-3" />
            </span>
          </Node>
          <Node
            box={NODES.agent}
            icon={<BotIcon aria-hidden className="size-5 text-white" />}
            tone="#5b4fd6"
            title={f.nodes.agent.title}
            sub={f.nodes.agent.sub}
            step={1}
          >
            <div className="mt-2 flex justify-between border-t border-[#2b303c] pt-1.5 text-[9.5px] text-[#9aa3b5]">
              {f.tools.map((tool) => (
                <span key={tool} className="flex items-center gap-1">
                  <span className="size-1.5 rotate-45 bg-[#7c70f0]" />
                  {tool}
                </span>
              ))}
            </div>
          </Node>
          <Node
            box={NODES.branch}
            icon={<SplitIcon aria-hidden className="size-4.5 text-[#0f1115]" />}
            tone="#f3a86b"
            title={f.nodes.branch.title}
            sub={f.nodes.branch.sub}
            step={2}
          />
          <Node
            box={NODES.crm}
            icon={<BrandIcon icon={siHubspot} className="size-5" />}
            title={f.nodes.crm.title}
            sub={f.nodes.crm.sub}
            step={3}
          />
          <Node
            box={NODES.reply}
            icon={<BrandIcon icon={siWhatsapp} className="size-5" />}
            title={f.nodes.reply.title}
            sub={f.nodes.reply.sub}
            step={4}
          />
          {TOOLS.map((tool, i) => (
            <span
              key={i}
              className="absolute flex size-10 items-center justify-center rounded-full border border-[#3a3f80] bg-[#181b22]"
              style={{ left: tool.x, top: tool.y }}
            >
              {tool.icon}
            </span>
          ))}
        </div>

        {/* Execution log */}
        <div className="h-[164px] border-t border-[#232733] px-4 py-3 font-mono text-[11px]">
          <div className="mb-2 flex items-center justify-between font-sans text-[11.5px] text-[#9aa3b5]">
            <span>Executions</span>
            <span className="rounded-full bg-[#22c55e]/15 px-2 py-0.5 text-[#4ade80]">
              Succeeded
            </span>
          </div>
          {f.log.map((step, i) => (
            <div
              key={step}
              className="loop flex [animation:step-in_6s_ease-out_infinite_both] items-center gap-2 py-[3px] text-[#d6dbe6]"
              style={{ animationDelay: `${i * 0.55 + 0.2}s` }}
            >
              <CheckIcon aria-hidden className="size-3 text-[#4ade80]" strokeWidth={3} />
              <span>{step}</span>
              <span className="ml-auto text-[#6b7385]">{times[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </Stage3D>
  );
}
