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

function placeholder(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fg: string) {
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = fg;
  ctx.lineWidth = 3;
  ctx.setLineDash([14, 12]);
  ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);
  ctx.setLineDash([]);
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = fg;
  ctx.font = `500 30px ${MONO}`;
  ctx.textAlign = "center";
  ctx.fillText("[ upload selfie ]", x + w / 2, y + h / 2);
  ctx.restore();
}

function scanlines(ctx: CanvasRenderingContext2D, color: string, alpha: number, step = 4) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  for (let y = 0; y < SIZE; y += step) ctx.fillRect(0, y, SIZE, 1);
  ctx.restore();
}

function fitText(ctx: CanvasRenderingContext2D, text: string, max: number, base: number, font: (s: number) => string) {
  let size = base;
  ctx.font = font(size);
  while (ctx.measureText(text).width > max && size > 18) {
    size -= 2;
    ctx.font = font(size);
  }
  return size;
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  frame: FrameId,
  identity: Identity,
  img: HTMLImageElement | null,
) {
  const name = (identity.name || "YOUR NAME").toUpperCase();
  const handle = identity.handle ? (identity.handle.startsWith("@") ? identity.handle : "@" + identity.handle) : "@handle";
  const college = identity.college || "College / Org";
  const city = identity.city || "City";
  const role = (identity.role || "Builder").toUpperCase();

  ctx.clearRect(0, 0, SIZE, SIZE);

  if (frame === "terminal") {
    ctx.fillStyle = "#03110b";
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.strokeStyle = "rgba(77,255,159,0.10)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= SIZE; i += 45) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(SIZE, i); ctx.stroke();
    }
    const px = 90, py = 150, pw = SIZE - 180, ph = 560;
    ctx.save();
    roundRect(ctx, px, py, pw, ph, 8);
    ctx.clip();
    if (img) drawCover(ctx, img, px, py, pw, ph);
    else { ctx.fillStyle = "#06210f"; ctx.fillRect(px, py, pw, ph); }
    const g = ctx.createLinearGradient(0, py + ph * 0.4, 0, py + ph);
    g.addColorStop(0, "rgba(3,17,11,0)");
    g.addColorStop(1, "rgba(3,17,11,0.92)");
    ctx.fillStyle = g;
    ctx.fillRect(px, py, pw, ph);
    ctx.restore();
    if (!img) placeholder(ctx, px, py, pw, ph, "#4dff9f");
    ctx.strokeStyle = "#4dff9f";
    ctx.lineWidth = 3;
    roundRect(ctx, px, py, pw, ph, 8);
    ctx.stroke();

    ctx.fillStyle = "#4dff9f";
    ctx.textAlign = "left";
    ctx.font = `700 34px ${MONO}`;
    ctx.fillText("FRAME//GOA", 90, 92);
    ctx.font = `500 24px ${MONO}`;
    ctx.fillStyle = "rgba(77,255,159,0.6)";
    ctx.textAlign = "right";
    ctx.fillText("HH GOA 2026", SIZE - 90, 92);

    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(77,255,159,0.65)";
    ctx.font = `500 24px ${MONO}`;
    ctx.fillText("> whoami", 90, 780);
    const s = fitText(ctx, name, SIZE - 180, 80, (n) => `700 ${n}px ${MONO}`);
    ctx.fillStyle = "#eafff3";
    ctx.font = `700 ${s}px ${MONO}`;
    ctx.fillText(name, 90, 858);
    ctx.fillStyle = "#4dff9f";
    ctx.font = `500 28px ${MONO}`;
    ctx.fillText(handle, 90, 902);
    ctx.fillStyle = "rgba(234,255,243,0.7)";
    ctx.font = `400 24px ${MONO}`;
    ctx.fillText(`${college} · ${city}`, 90, 946);

    ctx.fillStyle = "#4dff9f";
    roundRect(ctx, 90, 972, ctx.measureText(role).width + 60, 52, 6);
    ctx.fill();
    ctx.fillStyle = "#03110b";
    ctx.font = `700 24px ${MONO}`;
    ctx.fillText(role, 120, 1006);
    scanlines(ctx, "#4dff9f", 0.05);
    return;
  }

  if (frame === "sunset") {
    const bg = ctx.createLinearGradient(0, 0, 0, SIZE);
    bg.addColorStop(0, "#1b0620");
    bg.addColorStop(0.55, "#5b1233");
    bg.addColorStop(1, "#ff5c39");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.save();
    ctx.globalAlpha = 0.85;
    const sun = ctx.createLinearGradient(0, 300, 0, 620);
    sun.addColorStop(0, "#ffc247");
    sun.addColorStop(1, "#ff5c39");
    ctx.fillStyle = sun;
    ctx.beginPath();
    ctx.arc(SIZE / 2, 470, 300, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 10; i++) ctx.fillRect(0, 470 + i * 26, SIZE, 8 + i * 1.6);
    ctx.restore();

    const cx = SIZE / 2, cy = 470, rad = 230;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.clip();
    if (img) drawCover(ctx, img, cx - rad, cy - rad, rad * 2, rad * 2);
    else { ctx.fillStyle = "#2a0a1d"; ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2); }
    ctx.restore();
    if (!img) placeholder(ctx, cx - rad, cy - rad, rad * 2, rad * 2, "#ffe8c9");
    ctx.strokeStyle = "#ffe0a8";
    ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffe8c9";
    ctx.font = `700 30px ${MONO}`;
    ctx.fillText("FRAME//GOA  ·  HH GOA 2026", SIZE / 2, 92);
    const s = fitText(ctx, name, SIZE - 160, 92, (n) => `700 ${n}px ${SANS}`);
    ctx.font = `700 ${s}px ${SANS}`;
    ctx.fillStyle = "#fff6e8";
    ctx.fillText(name, SIZE / 2, 830);
    ctx.font = `500 30px ${MONO}`;
    ctx.fillStyle = "#ffd9a0";
    ctx.fillText(handle, SIZE / 2, 880);
    ctx.font = `400 26px ${MONO}`;
    ctx.fillStyle = "rgba(255,246,232,0.85)";
    ctx.fillText(`${college} · ${city}`, SIZE / 2, 926);
    ctx.font = `700 26px ${MONO}`;
    const w = ctx.measureText(role).width + 64;
    ctx.strokeStyle = "#fff6e8";
    ctx.lineWidth = 3;
    roundRect(ctx, SIZE / 2 - w / 2, 958, w, 58, 29);
    ctx.stroke();
    ctx.fillStyle = "#fff6e8";
    ctx.fillText(role, SIZE / 2, 996);
    return;
  }

  if (frame === "palm") {
    ctx.fillStyle = "#04191c";
    ctx.fillRect(0, 0, SIZE, SIZE);
    const glow = ctx.createRadialGradient(SIZE / 2, 420, 60, SIZE / 2, 420, 620);
    glow.addColorStop(0, "rgba(10,59,64,0.9)");
    glow.addColorStop(1, "rgba(4,25,28,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, SIZE, SIZE);

    ctx.strokeStyle = "#e8c46a";
    ctx.lineWidth = 2;
    ctx.strokeRect(46, 46, SIZE - 92, SIZE - 92);
    ctx.strokeRect(60, 60, SIZE - 120, SIZE - 120);

    const px = 140, py = 150, pw = SIZE - 280, ph = 620;
    ctx.save();
    roundRect(ctx, px, py, pw, ph, 200);
    ctx.clip();
    if (img) drawCover(ctx, img, px, py, pw, ph);
    else { ctx.fillStyle = "#072a2e"; ctx.fillRect(px, py, pw, ph); }
    const g = ctx.createLinearGradient(0, py + ph * 0.5, 0, py + ph);
    g.addColorStop(0, "rgba(4,25,28,0)");
    g.addColorStop(1, "rgba(4,25,28,0.9)");
    ctx.fillStyle = g;
    ctx.fillRect(px, py, pw, ph);
    ctx.restore();
    if (!img) placeholder(ctx, px, py, pw, ph, "#e8c46a");
    ctx.strokeStyle = "#e8c46a";
    ctx.lineWidth = 3;
    roundRect(ctx, px, py, pw, ph, 200);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = "#e8c46a";
    ctx.font = `500 26px ${MONO}`;
    ctx.fillText("F R A M E / / G O A", SIZE / 2, 112);
    const s = fitText(ctx, name, SIZE - 220, 84, (n) => `700 ${n}px ${SANS}`);
    ctx.font = `700 ${s}px ${SANS}`;
    ctx.fillStyle = "#f4fbf9";
    ctx.fillText(name, SIZE / 2, 858);
    ctx.font = `500 28px ${MONO}`;
    ctx.fillStyle = "#e8c46a";
    ctx.fillText(`${handle}  ·  ${role}`, SIZE / 2, 906);
    ctx.font = `400 25px ${MONO}`;
    ctx.fillStyle = "rgba(244,251,249,0.72)";
    ctx.fillText(`${college} · ${city}`, SIZE / 2, 950);
    ctx.fillStyle = "rgba(232,196,106,0.75)";
    ctx.font = `500 22px ${MONO}`;
    ctx.fillText("HH GOA 2026 — IDENTITY PASS", SIZE / 2, 1002);
    return;
  }

  // susegad
  ctx.fillStyle = "#f2ece1";
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = "rgba(21,19,18,0.05)";
  for (let i = 0; i < 2600; i++) {
    ctx.fillRect(Math.random() * SIZE, Math.random() * SIZE, 2, 2);
  }
  ctx.fillStyle = "#e2452c";
  ctx.fillRect(0, 0, SIZE, 22);
  ctx.fillRect(0, SIZE - 22, SIZE, 22);

  const px = 80, py = 170, pw = SIZE - 160, ph = 580;
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, pw, ph);
  ctx.clip();
  if (img) drawCover(ctx, img, px, py, pw, ph);
  else { ctx.fillStyle = "#e3dbcd"; ctx.fillRect(px, py, pw, ph); }
  ctx.restore();
  if (!img) placeholder(ctx, px, py, pw, ph, "#151312");
  ctx.strokeStyle = "#151312";
  ctx.lineWidth = 6;
  ctx.strokeRect(px, py, pw, ph);

  ctx.textAlign = "left";
  ctx.fillStyle = "#151312";
  ctx.font = `700 36px ${MONO}`;
  ctx.fillText("FRAME//GOA", 80, 118);
  ctx.textAlign = "right";
  ctx.fillStyle = "#e2452c";
  ctx.font = `700 28px ${MONO}`;
  ctx.fillText("HH GOA 2026", SIZE - 80, 118);

  ctx.textAlign = "left";
  const s = fitText(ctx, name, SIZE - 340, 82, (n) => `700 ${n}px ${SANS}`);
  ctx.font = `700 ${s}px ${SANS}`;
  ctx.fillStyle = "#151312";
  ctx.fillText(name, 80, 852);
  ctx.font = `500 27px ${MONO}`;
  ctx.fillStyle = "#e2452c";
  ctx.fillText(handle, 80, 898);
  ctx.font = `400 25px ${MONO}`;
  ctx.fillStyle = "rgba(21,19,18,0.7)";
  ctx.fillText(`${college} · ${city}`, 80, 942);

  ctx.save();
  ctx.translate(SIZE - 210, 900);
  ctx.rotate(-0.12);
  ctx.strokeStyle = "#e2452c";
  ctx.lineWidth = 5;
  ctx.strokeRect(-100, -44, 200, 88);
  ctx.fillStyle = "#e2452c";
  ctx.textAlign = "center";
  const rs = fitText(ctx, role, 170, 30, (n) => `700 ${n}px ${MONO}`);
  ctx.font = `700 ${rs}px ${MONO}`;
  ctx.fillText(role, 0, 10);
  ctx.restore();
}
