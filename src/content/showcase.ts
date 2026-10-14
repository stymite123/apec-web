/**
 * Words inside the illustrated device mock-ups in "What we do". They are part of the
 * pictures (hidden from screen readers), not claims: "yourbrand.com" stands for a client,
 * prices and times are demo values. Listed in docs/COPY_REVIEW.md.
 */
export const showcase = {
  search: {
    query: "ai agents for small business",
    brand: "Your Brand",
    domain: "yourbrand.com",
    title: "AI agents that answer every lead, 24/7",
    snippet: "Custom AI agents and automations for sales, support and operations.",
    sitelinks: ["Services", "Work", "Contact"],
    tabs: ["All", "Images", "News", "Videos", "Shopping"],
    others: ["example-directory.com", "agency-list.net", "tech-review.org"],
    prompt: "Who can build an AI agent that answers our customer messages?",
    answer:
      "Look for a team that designs the agent, connects it to your CRM and inbox, and keeps a human in the loop.",
    aiLabel: "Cited in AI answers",
  },
  flow: {
    name: "Lead intake",
    status: "Active",
    nodes: {
      trigger: { title: "Gmail", sub: "New email" },
      agent: { title: "AI Agent", sub: "Qualify and draft" },
      branch: { title: "If", sub: "Hot lead?" },
      crm: { title: "HubSpot", sub: "Create deal" },
      reply: { title: "WhatsApp", sub: "Send reply" },
    },
    tools: ["Claude", "Memory", "Sheets"],
    log: ["Gmail trigger", "AI Agent", "If", "HubSpot", "WhatsApp"],
  },
  exchange: {
    name: "Exchange",
    nav: ["Markets", "Trade", "Earn"],
    connect: "Connect wallet",
    headline: ["Trade the", "next market."],
    sub: "Spot, earn and portfolio tracking in one fast, secure app.",
    actions: ["Start trading", "Markets"],
    columns: ["Asset", "Price", "24h", "7d"],
    timeframes: ["1H", "4H", "1D", "1W"],
    pairs: [
      { symbol: "BTC", price: 67412.3, change: 2.41 },
      { symbol: "ETH", price: 3518.72, change: 1.86 },
      { symbol: "SOL", price: 171.09, change: -0.92 },
    ],
  },
  apps: {
    track: "Neon Summit",
    artist: "Night Drive Club",
    eta: "Arriving in 4 min",
    rideLabel: "Your ride",
  },
  brand: {
    poster: "Ascent",
    render: "3D render",
    logo: "Logo system",
  },
} as const;
