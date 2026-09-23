// generate.js
// GitHub contribution calendar -> animated 4-star Dragon Ball SVG.
// No npm packages required. Node.js 20+.
//
// Authentication:
// GitHub Actions automatically provides GITHUB_TOKEN.
// You do NOT need to paste a personal token into this file.

const fs = require("fs");

const USERNAME = process.env.GITHUB_USERNAME || "Aryan5x";
const TOKEN = process.env.GITHUB_TOKEN;

if (!TOKEN) {
  throw new Error("GITHUB_TOKEN is missing. In GitHub Actions this is provided automatically.");
}

const QUERY = `
query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          firstDay
          contributionDays {
            date
            weekday
            contributionCount
            color
          }
        }
      }
    }
  }
}`;

async function fetchCalendar() {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "dragonball-contribution"
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { login: USERNAME }
    })
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(`GitHub API HTTP ${response.status}: ${JSON.stringify(body)}`);
  }

  if (body.errors) {
    throw new Error(`GitHub GraphQL error: ${JSON.stringify(body.errors)}`);
  }

  return body.data.user.contributionsCollection.contributionCalendar;
}

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function starPoints(cx, cy, outer, inner) {
  const points = [];
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + i * Math.PI / 5;
    const radius = i % 2 === 0 ? outer : inner;
    points.push(
      `${(cx + Math.cos(angle) * radius).toFixed(2)},${(cy + Math.sin(angle) * radius).toFixed(2)}`
    );
  }
  return points.join(" ");
}

function dragonBallSvg() {
  // Four red stars arranged like a real 4-star Dragon Ball.
  return `
    <g id="four-star-ball">
      <circle r="13" fill="#ff7b00" stroke="#ffd66b" stroke-width="2"/>
      <circle r="10.5" fill="#ff9700"/>
      <ellipse cx="-4" cy="-4" rx="3.5" ry="2.5" fill="#fff2bd" opacity=".55"/>

      <polygon points="${starPoints(-4.2,-4.0,3.0,1.25)}" fill="#b51f17"/>
      <polygon points="${starPoints(4.2,-4.0,3.0,1.25)}" fill="#b51f17"/>
      <polygon points="${starPoints(-4.2,4.0,3.0,1.25)}" fill="#b51f17"/>
      <polygon points="${starPoints(4.2,4.0,3.0,1.25)}" fill="#b51f17"/>

      <!-- glow -->
      <circle r="17" fill="none" stroke="#ff9d00" stroke-width="3" opacity=".65">
        <animate attributeName="r" values="15;22;15" dur="1s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values=".7;.05;.7" dur="1s" repeatCount="indefinite"/>
      </circle>
    </g>
  `;
}

function makeSvg(calendar) {
  const cells = [];

  calendar.weeks.forEach((week, x) => {
    week.contributionDays.forEach(day => {
      cells.push({
        x,
        y: day.weekday,
        date: day.date,
        count: day.contributionCount,
        color: day.color
      });
    });
  });

  // GitHub's contribution calendar is chronological:
  // each column = one week, each row = Mon..Sun.
  cells.sort((a, b) => a.date.localeCompare(b.date));

  const maxX = Math.max(...cells.map(c => c.x));
  const cols = maxX + 1;

  const cell = 13;
  const gap = 4;
  const step = cell + gap;

  const left = 44;
  const top = 42;
  const right = 18;
  const bottom = 30;

  const width = left + cols * step + right;
  const height = top + 7 * step + bottom;

  const points = cells.map(c => ({
    x: left + c.x * step + cell / 2,
    y: top + c.y * step + cell / 2
  }));

  // One continuous path through every contribution square.
  const path = points.map((p, i) =>
    `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`
  ).join(" ");

  const squares = cells.map(c => `
    <rect
      x="${left + c.x * step}"
      y="${top + c.y * step}"
      width="${cell}"
      height="${cell}"
      rx="2.5"
      fill="${c.color || "#161b22"}">
      <title>${esc(c.date)} — ${c.count} contribution${c.count === 1 ? "" : "s"}</title>
    </rect>
  `).join("");

  const monthLabels = [];
  let previousMonth = "";

  cells.forEach(c => {
    const month = c.date.slice(0, 7);
    if (month !== previousMonth && c.y === 0) {
      monthLabels.push(`
        <text
          x="${left + c.x * step}"
          y="28"
          fill="#8b949e"
          font-family="Arial, Helvetica, sans-serif"
          font-size="10">${esc(c.date.slice(5, 7))}</text>
      `);
      previousMonth = month;
    }
  });

  const duration = Math.max(22, Math.min(55, cells.length * 0.105));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 ${width} ${height}"
  role="img"
  aria-label="Animated four star Dragon Ball traveling across ${esc(USERNAME)}'s GitHub contribution graph">

  <defs>
    <path id="contribution-path" d="${path}"/>

    <filter id="kiGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <linearGradient id="kiGradient" x1="0" x2="1">
      <stop offset="0" stop-color="#ff6a00" stop-opacity="0"/>
      <stop offset=".5" stop-color="#ff9d00" stop-opacity=".85"/>
      <stop offset="1" stop-color="#fff1a6" stop-opacity="1"/>
    </linearGradient>
  </defs>

  <rect width="100%" height="100%" rx="12" fill="#0d1117"/>

  <text x="${left}" y="15"
    fill="#f0f6fc"
    font-family="Arial, Helvetica, sans-serif"
    font-size="11"
    font-weight="700">
    🐉 ${esc(USERNAME)} • ${calendar.totalContributions} contributions
  </text>

  ${monthLabels.join("")}

  ${squares}

  <!-- glowing Ki trail follows the same route -->
  <path
    d="${path}"
    fill="none"
    stroke="url(#kiGradient)"
    stroke-width="5"
    stroke-linecap="round"
    stroke-linejoin="round"
    opacity=".0"
    filter="url(#kiGlow)">
    <animate
      attributeName="opacity"
      values="0;.55;0"
      dur="${duration}s"
      repeatCount="indefinite"/>
  </path>

  <!-- 4-star Dragon Ball -->
  <g filter="url(#kiGlow)">
    ${dragonBallSvg()}
    <animateMotion
      dur="${duration}s"
      repeatCount="indefinite"
      rotate="auto"
      calcMode="linear">
      <mpath xlink:href="#contribution-path"/>
    </animateMotion>
  </g>

  <text x="${left}" y="${height - 10}"
    fill="#8b949e"
    font-family="Arial, Helvetica, sans-serif"
    font-size="9">
    4-star Dragon Ball • collecting contributions
  </text>
</svg>`;
}

async function main() {
  const calendar = await fetchCalendar();

  fs.mkdirSync("output", { recursive: true });

  const svg = makeSvg(calendar);
  fs.writeFileSync("output/dragonball-contribution.svg", svg, "utf8");

  console.log(
    `Done: ${USERNAME} — ${calendar.totalContributions} contributions`
  );
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
