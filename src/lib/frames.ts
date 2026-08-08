import qrcode from "qrcode-generator";

export type FrameId = "terminal" | "sunset" | "palm" | "susegad";

export type FrameTheme = {
  id: FrameId;
  name: string;
  tagline: string;
  swatch: [string, string, string];
};

export const FRAMES: FrameTheme[] = [
  {
    id: "terminal",
    name: "TERMINAL",
    tagline: "green-on-black, scanlines, root access",
    swatch: ["#03110b", "#0d3b26", "#4dff9f"],
  },
  {
    id: "sunset",
    name: "SUNSET RUN",
    tagline: "arambol dusk, coral gradient bands",
    swatch: ["#170617", "#ff5c39", "#ffc247"],
  },
  {
    id: "palm",
    name: "PALM NOIR",
    tagline: "deep tide teal with gold hairlines",
    swatch: ["#04191c", "#0a3b40", "#e8c46a"],
  },
  {
    id: "susegad",
    name: "SUSEGAD",
    tagline: "paper white, ink black, stamp red",
    swatch: ["#f2ece1", "#151312", "#e2452c"],
  },
];

export type Identity = {
  name: string;
  handle: string;
  college: string;
  city: string;
  role: string;
};

export const SIZE = 1080;

const MONO = "'JetBrains Mono', ui-monospace, monospace";
const SANS = "'Space Grotesk', system-ui, sans-serif";

type Palette = {
  bg: string;
  panel: string;
  ink: string;
  dim: string;
  accent: string;
  accent2: string;
  chipInk: string;
  grid: string;
  scan?: number;
  grain?: number;
};

const PALETTES: Record<FrameId, Palette> = {
  terminal: {
    bg: "#03110b",
    panel: "#06210f",
    ink: "#eafff3",
    dim: "rgba(234,255,243,0.55)",
    accent: "#4dff9f",
    accent2: "#1c7a4d",
    chipInk: "#03110b",
    grid: "rgba(77,255,159,0.10)",
    scan: 0.05,
  },
  sunset: {
    bg: "#160518",
    panel: "#2a0a1d",
    ink: "#fff6e8",
    dim: "rgba(255,246,232,0.6)",
    accent: "#ff7a45",
    accent2: "#ffc247",
    chipInk: "#1b0620",
    grid: "rgba(255,194,71,0.10)",
  },
  palm: {
    bg: "#04191c",
    panel: "#072a2e",
    ink: "#f4fbf9",
    dim: "rgba(244,251,249,0.55)",
    accent: "#e8c46a",
    accent2: "#3fb6a8",
    chipInk: "#04191c",
    grid: "rgba(232,196,106,0.09)",
  },
  susegad: {
    bg: "#f2ece1",
    panel: "#e3dbcd",
    ink: "#151312",
    dim: "rgba(21,19,18,0.6)",
    accent: "#e2452c",
    accent2: "#151312",
    chipInk: "#f7f3ea",
    grid: "rgba(21,19,18,0.08)",
    grain: 2200,
  },
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const ir = img.width / img.height;
  const r = w / h;
  let sw = img.width;
  let sh = img.height;
  let sx = 0;
  let sy = 0;
  if (ir > r) {
    sw = img.height * r;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / r;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  max: number,
  base: number,
  font: (s: number) => string,
  min = 18,
) {
  let size = base;
  ctx.font = font(size);
  while (ctx.measureText(text).width > max && size > min) {
    size -= 2;
    ctx.font = font(size);
  }
  return size;
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function participantCode(identity: Identity) {
  const seed = hash(
    `${identity.name}|${identity.handle}|${identity.college}|${identity.city}`,
  );
  const alpha = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const a = alpha[seed % 24];
  const b = alpha[(seed >> 5) % 24];
  const n = (seed % 9000) + 1000;
  return `HHG26-${a}${b}-${n}`;
}

function drawQR(
  ctx: CanvasRenderingContext2D,
  data: string,
  x: number,
  y: number,
  size: number,
  fg: string,
  bg: string,
) {
  const qr = qrcode(0, "M");
  qr.addData(data || "https://hackerhouse.goa");
  qr.make();
  const n = qr.getModuleCount();
  const cell = size / n;
  ctx.save();
  ctx.fillStyle = bg;
  ctx.fillRect(x - cell, y - cell, size + cell * 2, size + cell * 2);
  ctx.fillStyle = fg;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) {
        ctx.fillRect(
          Math.floor(x + c * cell),
          Math.floor(y + r * cell),
          Math.ceil(cell),
          Math.ceil(cell),
        );
      }
    }
  }
  ctx.restore();
}

function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  size = 17,
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `500 ${size}px ${MONO}`;
  ctx.textAlign = "left";
  ctx.letterSpacing = "2px";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function field(
  ctx: CanvasRenderingContext2D,
  key: string,
  value: string,
  x: number,
  y: number,
  p: Palette,
  maxW: number,
) {
  label(ctx, key, x, y, p.dim, 15);
  ctx.save();
  ctx.fillStyle = p.ink;
  const s = fitText(ctx, value, maxW, 25, (n) => `700 ${n}px ${MONO}`, 14);
  ctx.font = `700 ${s}px ${MONO}`;
  ctx.textAlign = "left";
  ctx.fillText(value, x, y + 30);
  ctx.restore();
}

function ticks(ctx: CanvasRenderingContext2D, p: Palette) {
  ctx.save();
  ctx.strokeStyle = p.accent;
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 2;
  for (let x = 60; x < SIZE - 60; x += 20) {
    const long = x % 100 === 0;
    ctx.beginPath();
    ctx.moveTo(x, SIZE - 34);
    ctx.lineTo(x, SIZE - 34 - (long ? 14 : 7));
    ctx.stroke();
  }
  ctx.restore();
}

function corners(ctx: CanvasRenderingContext2D, p: Palette) {
  const m = 34;
  const l = 46;
  ctx.save();
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = 3;
  const pts: [number, number, number, number][] = [
    [m, m, 1, 1],
    [SIZE - m, m, -1, 1],
    [m, SIZE - m, 1, -1],
    [SIZE - m, SIZE - m, -1, -1],
  ];
  for (const [x, y, dx, dy] of pts) {
    ctx.beginPath();
    ctx.moveTo(x + dx * l, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + dy * l);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  frame: FrameId,
  identity: Identity,
  img: HTMLImageElement | null,
) {
  const p = PALETTES[frame];
  const name = (identity.name || "YOUR NAME").toUpperCase();
  const handle = identity.handle
    ? identity.handle.startsWith("@")
      ? identity.handle
      : "@" + identity.handle
    : "@handle";
  const college = (identity.college || "College / Org").toUpperCase();
  const city = (identity.city || "City").toUpperCase();
  const role = (identity.role || "Builder").toUpperCase();
  const code = participantCode(identity);

  ctx.clearRect(0, 0, SIZE, SIZE);

  // ---- background
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  if (frame === "sunset") {
    const g = ctx.createRadialGradient(760, 240, 40, 760, 240, 820);
    g.addColorStop(0, "rgba(255,122,69,0.55)");
    g.addColorStop(0.5, "rgba(91,18,51,0.55)");
    g.addColorStop(1, "rgba(22,5,24,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SIZE, SIZE);
  }
  if (frame === "palm") {
    const g = ctx.createRadialGradient(300, 300, 60, 300, 300, 780);
    g.addColorStop(0, "rgba(63,182,168,0.22)");
    g.addColorStop(1, "rgba(4,25,28,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SIZE, SIZE);
  }

  // grid
  ctx.save();
  ctx.strokeStyle = p.grid;
  ctx.lineWidth = 1;
  for (let i = 0; i <= SIZE; i += 45) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(SIZE, i); ctx.stroke();
  }
  ctx.restore();

  if (p.grain) {
    ctx.save();
    ctx.fillStyle = "rgba(21,19,18,0.05)";
    for (let i = 0; i < p.grain; i++) {
      ctx.fillRect(Math.random() * SIZE, Math.random() * SIZE, 2, 2);
    }
    ctx.restore();
  }

  // ---- top brand bar
  const M = 60;
  ctx.save();
  ctx.textAlign = "left";
  ctx.fillStyle = p.ink;
  ctx.font = `700 30px ${SANS}`;
  ctx.letterSpacing = "1px";
  ctx.fillText("HACKER HOUSE", M, 82);
  const hw = ctx.measureText("HACKER HOUSE ").width;
  ctx.fillStyle = p.accent;
  ctx.fillText("GOA", M + hw, 82);
  ctx.restore();

  label(ctx, "IDENTITY SYSTEM / V2.6", M, 112, p.dim, 15);

  ctx.save();
  ctx.textAlign = "right";
  ctx.fillStyle = p.accent;
  ctx.font = `700 20px ${MONO}`;
  ctx.letterSpacing = "3px";
  ctx.fillText("EDITION 2026", SIZE - M, 74);
  ctx.fillStyle = p.dim;
  ctx.font = `500 15px ${MONO}`;
  ctx.fillText("15\u00B035'N 73\u00B045'E \u00B7 ANJUNA", SIZE - M, 104);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = p.accent;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(M, 134);
  ctx.lineTo(SIZE - M, 134);
  ctx.stroke();
  ctx.restore();

  // ---- asymmetrical selfie panel (focal point)
  const px = M;
  const py = 168;
  const pw = 610;
  const ph = 620;

  ctx.save();
  ctx.shadowColor = frame === "susegad" ? "rgba(21,19,18,0.25)" : "rgba(0,0,0,0.55)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 18;
  roundRect(ctx, px, py, pw, ph, 4);
  ctx.fillStyle = p.panel;
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundRect(ctx, px, py, pw, ph, 4);
  ctx.clip();
  if (img) {
    drawCover(ctx, img, px, py, pw, ph);
    const g = ctx.createLinearGradient(0, py + ph * 0.55, 0, py + ph);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, frame === "susegad" ? "rgba(21,19,18,0.45)" : "rgba(0,0,0,0.65)");
    ctx.fillStyle = g;
    ctx.fillRect(px, py, pw, ph);
  } else {
    ctx.strokeStyle = p.accent;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 10]);
    ctx.strokeRect(px + 18, py + 18, pw - 36, ph - 36);
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = p.accent;
    ctx.font = `500 26px ${MONO}`;
    ctx.textAlign = "center";
    ctx.fillText("[ UPLOAD SELFIE ]", px + pw / 2, py + ph / 2);
    ctx.font = `400 16px ${MONO}`;
    ctx.fillStyle = p.dim;
    ctx.fillText("SUBJECT CAPTURE PENDING", px + pw / 2, py + ph / 2 + 34);
  }
  // reticle marks over the portrait
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = 2;
  const rl = 22;
  const cpts: [number, number, number, number][] = [
    [px + 16, py + 16, 1, 1],
    [px + pw - 16, py + 16, -1, 1],
    [px + 16, py + ph - 16, 1, -1],
    [px + pw - 16, py + ph - 16, -1, -1],
  ];
  for (const [x, y, dx, dy] of cpts) {
    ctx.beginPath();
    ctx.moveTo(x + dx * rl, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + dy * rl);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = 3;
  roundRect(ctx, px, py, pw, ph, 4);
  ctx.stroke();
  ctx.restore();

  // portrait footer strip
  ctx.save();
  ctx.fillStyle = p.accent;
  ctx.fillRect(px, py + ph - 44, pw, 44);
  ctx.fillStyle = p.chipInk;
  ctx.font = `700 17px ${MONO}`;
  ctx.letterSpacing = "3px";
  ctx.textAlign = "left";
  ctx.fillText("SUBJECT / " + code, px + 18, py + ph - 15);
  ctx.textAlign = "right";
  ctx.fillText(img ? "CAPTURE OK" : "NO SIGNAL", px + pw - 18, py + ph - 15);
  ctx.restore();

  // ---- right technical column
  const rx = px + pw + 40;
  const rw = SIZE - M - rx;

  label(ctx, "PARTICIPANT", rx, py + 18, p.dim, 15);
  ctx.save();
  ctx.fillStyle = p.accent;
  const cs = fitText(ctx, code, rw, 30, (n) => `700 ${n}px ${MONO}`, 16);
  ctx.font = `700 ${cs}px ${MONO}`;
  ctx.textAlign = "left";
  ctx.fillText(code, rx, py + 52);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = p.dim;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(rx, py + 74); ctx.lineTo(rx + rw, py + 74); ctx.stroke();
  ctx.restore();

  field(ctx, "ROLE", role, rx, py + 108, p, rw);
  field(ctx, "ORG", college, rx, py + 186, p, rw);
  field(ctx, "CITY", city, rx, py + 264, p, rw);
  field(ctx, "CLEARANCE", "LEVEL 3 / BUILD", rx, py + 342, p, rw);

  // QR block
  const qs = 168;
  const qy = py + ph - qs - 6;
  drawQR(
    ctx,
    `HHGOA2026|${code}|${handle}`,
    rx + 6,
    qy,
    qs,
    frame === "susegad" ? "#151312" : "#0a0a0a",
    frame === "susegad" ? "#f7f3ea" : "#f4f4f4",
  );
  label(ctx, "SCAN / VERIFY", rx + 6, qy + qs + 34, p.dim, 14);

  // ---- name block (bottom left, asymmetrical)
  const by = 852;
  ctx.save();
  ctx.textAlign = "left";
  const ns = fitText(ctx, name, pw + 30, 96, (n) => `700 ${n}px ${SANS}`, 34);
  ctx.font = `700 ${ns}px ${SANS}`;
  ctx.fillStyle = p.ink;
  ctx.fillText(name, M, by);
  ctx.restore();

  ctx.save();
  ctx.textAlign = "left";
  ctx.fillStyle = p.accent;
  ctx.font = `500 27px ${MONO}`;
  ctx.fillText(handle, M, by + 44);
  ctx.restore();

  // role chip
  ctx.save();
  ctx.font = `700 20px ${MONO}`;
  ctx.letterSpacing = "2px";
  const chipW = ctx.measureText(role).width + 46;
  ctx.font = `500 27px ${MONO}`;
  const handleW = ctx.measureText(handle).width;
  ctx.font = `700 20px ${MONO}`;
  const chipX = Math.min(M + handleW + 28, px + pw - chipW);
  ctx.fillStyle = p.accent;
  roundRect(ctx, chipX, by + 18, chipW, 38, 4);
  ctx.fill();
  ctx.fillStyle = p.chipInk;
  ctx.textAlign = "left";
  ctx.fillText(role, chipX + 23, by + 44);
  ctx.restore();

  // ---- bottom technical footer
  ctx.save();
  ctx.strokeStyle = p.accent;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(M, by + 78);
  ctx.lineTo(SIZE - M, by + 78);
  ctx.stroke();
  ctx.restore();

  label(ctx, `ISSUED 2026 \u00B7 GOA, IN`, M, by + 112, p.dim, 15);
  label(ctx, `FRAME//${frame.toUpperCase()}`, M + 340, by + 112, p.dim, 15);

  ctx.save();
  ctx.textAlign = "right";
  ctx.fillStyle = p.accent;
  ctx.font = `700 16px ${MONO}`;
  ctx.letterSpacing = "3px";
  ctx.fillText("FRAME//GOA \u2014 IDENTITY PASS", SIZE - M, by + 112);
  ctx.restore();

  ticks(ctx, p);
  corners(ctx, p);

  if (p.scan) {
    ctx.save();
    ctx.globalAlpha = p.scan;
    ctx.fillStyle = p.accent;
    for (let y = 0; y < SIZE; y += 4) ctx.fillRect(0, y, SIZE, 1);
    ctx.restore();
  }
}
