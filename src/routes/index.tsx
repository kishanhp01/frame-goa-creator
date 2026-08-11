import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Upload, Share2, Copy, RefreshCw, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FRAMES, SIZE, drawFrame, type FrameId, type Identity } from "@/lib/frames";

const TITLE = "FRAME//GOA — HH Goa 2026 Frame / ID Card Generator";
const DESC =
  "Design your own HH Goa 2026 themed photo frame. Bring teammates into one combined frame, download in 1 click and share to X with #FrameInGoa. No login, no manual cropping.";

const DEADLINE = Date.parse("2026-08-13T23:59:00+05:30");

const NAV = [
  { label: "Gallery", href: "#builder" },
  { label: "Leaderboard", href: "#steps" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const EMPTY: Identity = { name: "", handle: "", college: "", city: "", role: "" };

const TICKER = [
  "HH GOA ’26",
  "#FRAMEINGOA",
  "CODE. CHAOS. COMMUNITY.",
  "NO LOGIN",
  "4 FRAMES",
  "1080×1080 PNG",
];

const STEPS: { n: string; title: string; desc: string; Icon: LucideIcon }[] = [
  { n: "01", title: "PERSONALIZE", desc: "Add your details & make it yours", Icon: PenLine },
  { n: "02", title: "PICK YOUR STYLE", desc: "Choose your HHGOA frame", Icon: Palette },
  { n: "03", title: "PREVIEW LIVE", desc: "See your identity come alive", Icon: Eye },
  { n: "04", title: "DOWNLOAD", desc: "Save your frame instantly", Icon: Download },
  { n: "05", title: "SHARE & FLEX", desc: "Post it. Tag it. Own it.", Icon: Share2 },
];

function useCountdown(target: number) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  if (now === null) return null;
  const ms = Math.max(0, target - now);
  const s = Math.floor(ms / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${Math.floor(s / 86400)}D ${pad(Math.floor(s / 3600) % 24)}H ${pad(Math.floor(s / 60) % 60)}M ${pad(s % 60)}S`;
}


function Index() {
  const [identity, setIdentity] = useState<Identity>(EMPTY);
  const [frame, setFrame] = useState<FrameId>("terminal");
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealKey, setRevealKey] = useState(0);
  const countdown = useCountdown(DEADLINE);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof Identity) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setIdentity((p) => ({ ...p, [k]: e.target.value }));

  const render = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    drawFrame(ctx, frame, identity, img);
  }, [frame, identity, img]);

  useEffect(() => {
    render();
    if (typeof document !== "undefined" && "fonts" in document) {
      (document as Document).fonts.ready.then(render).catch(() => {});
    }
  }, [render]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("That file isn't an image.");
      return;
    }
    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        setImg(image);
        setRevealKey((k) => k + 1);
        // let the scan pass finish before dropping the overlay
        window.setTimeout(() => setLoading(false), 420);
      };
      image.onerror = () => {
        setLoading(false);
        toast.error("Couldn't read that image.");
      };
      image.src = reader.result as string;
    };
    reader.onerror = () => {
      setLoading(false);
      toast.error("Couldn't read that file.");
    };
    reader.readAsDataURL(file);
  };


  const download = () => {
    const c = canvasRef.current;
    if (!c) return;
    const link = document.createElement("a");
    link.download = `frame-goa-${(identity.name || "identity").toLowerCase().replace(/\s+/g, "-")}.png`;
    link.href = c.toDataURL("image/png");
    link.click();
    toast.success("PNG downloaded — go post it.");
  };

  const shareText = `I'm heading to HH Goa 2026 ${identity.handle ? `— ${identity.handle} ` : ""}as ${identity.role || "a builder"}${identity.city ? ` from ${identity.city}` : ""}. Made my frame with FRAME//GOA — make yours in seconds, no login. #FrameInGoa #HHGoa2026`;

  const shareX = () => {
    const url = `https://x.com/intent/post?text=${encodeURIComponent(shareText)}`;
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win) copyText();
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success("Share text copied to clipboard.");
    } catch {
      toast.error("Copy failed — select the text manually.");
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Toaster position="top-center" />

      <header className="sticky top-0 z-40 border-b border-primary/20 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center border border-primary/50 bg-primary/10 font-sans text-[11px] font-bold text-primary">
              HH
            </span>
            <div className="min-w-0">
              <p className="truncate font-sans text-sm font-bold tracking-[-0.02em] sm:text-base">
                Frame In Goa
              </p>
              <p className="truncate text-[9px] tracking-[0.24em] text-muted-foreground">
                2026 EDITION · IDENTITY STUDIO
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href="#formats"
              className="hidden rounded-full border border-border px-4 py-1.5 text-[11px] tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
            >
              Formats
            </a>
            <a
              href="#builder"
              className="hover-glow whitespace-nowrap rounded-full bg-primary px-4 py-1.5 text-[11px] font-bold tracking-[0.1em] text-primary-foreground"
            >
              Generator
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="scanlines relative isolate overflow-hidden border-b border-primary/20">
        <div className="ornament animate-spin-slow absolute left-1/2 top-1/2 -z-20 aspect-square w-[135vw] max-w-[1400px] -translate-x-1/2 -translate-y-1/2 opacity-70" />
        <div className="grid-lines absolute inset-0 -z-10" />
        <div className="dotted-rails pointer-events-none absolute inset-y-0 left-4 right-4 -z-10 opacity-40 sm:left-8 sm:right-8" />
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px animate-sweep bg-primary/50" />

        <div className="mx-auto max-w-5xl px-5 pb-20 pt-16 text-center sm:px-8 sm:pb-28 sm:pt-24">
          <span className="animate-rise inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-4 py-1.5 text-[10px] tracking-[0.3em] text-primary">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            OPEN NOW · OCT 2026 · #FRAMEINGOA
          </span>

          <h1 className="animate-rise mt-8 font-sans text-[clamp(2.8rem,12vw,8rem)] font-bold uppercase leading-[0.86] tracking-[-0.045em]">
            <span className="block">Get your</span>
            <span className="block">
              <span className="text-primary">Goa</span>{" "}
              <span className="align-super text-accent text-[0.42em] tracking-normal">गोवा</span>
            </span>
            <span className="block animate-flicker">Frame</span>
          </h1>

          <p className="animate-rise mx-auto mt-7 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Drop your photo. Personalise your pass. Post with{" "}
            <span className="font-bold text-primary">#FrameInGoa</span> and claim your spot at
            Hacker House Goa 2026.
          </p>

          <div id="formats" className="mt-12 grid gap-3 text-left sm:grid-cols-2 lg:grid-cols-4">
            {FORMATS.map((f) => (
              <div
                key={f.name}
                className="hover-lift rounded-md border border-primary/20 bg-card/60 p-5 backdrop-blur-sm"
              >
                <p className="font-sans text-sm font-bold">{f.name}</p>
                <p className="mt-1 text-[11px] tracking-[0.12em] text-primary">{f.size}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#builder"
              className="hover-glow group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold tracking-[0.08em] text-primary-foreground sm:w-auto"
            >
              Create Your Frame ✦
              <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" />
            </a>
            <a
              href="https://hhgoa.com/"
              target="_blank"
              rel="noreferrer"
              className="hover-glow inline-flex w-full items-center justify-center rounded-full border border-border px-8 py-4 text-sm tracking-[0.08em] text-foreground sm:w-auto"
            >
              Learn about HH Goa →
            </a>
          </div>

          <p className="mt-6 text-[11px] tracking-[0.2em] text-muted-foreground">
            CLOSES IN {countdown ?? "—"} · NO LOGIN
          </p>
        </div>

        <div className="flex overflow-hidden border-t border-primary/20 bg-primary/5 py-2">
          <div className="animate-marquee flex shrink-0 gap-8 whitespace-nowrap pr-8">
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="text-[10px] tracking-[0.35em] text-primary/70">
                {t} <span className="text-accent/50">//</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="relative overflow-hidden border-b border-primary/20">
        <div className="topo absolute inset-0 -z-10 opacity-50" />
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="animate-float bracketed relative aspect-[4/3] overflow-hidden rounded-md border border-primary/25 bg-card/50">
            <div className="ornament absolute inset-0 opacity-90" />
            <div className="absolute inset-0 grid place-items-center px-8 text-center">
              <p className="font-sans text-[clamp(1.8rem,6vw,3.5rem)] font-bold uppercase leading-[0.9] tracking-[-0.04em] text-primary/80">
                Hacker
                <br />
                House
                <br />
                <span className="text-accent/80">Goa</span>
              </p>
            </div>
          </div>

          <div>
            <p className="text-[10px] tracking-[0.32em] text-primary">OFFICIAL EVENT FRAME</p>
            <h2 className="mt-4 font-sans text-[clamp(2rem,5vw,3.4rem)] font-bold uppercase leading-[0.95] tracking-[-0.04em]">
              Your ticket to Goa
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground">
              247 builders. 4 days. One beach house on the Arabian Sea. Less noise, more ships.
              Generate your personalised HH Goa identity card and share it on X with{" "}
              <span className="text-primary">#FrameInGoa</span> to land on the Radar.
            </p>

            <ul className="mt-8 grid gap-2.5">
              {PERKS.map((p) => (
                <li key={p} className="flex gap-3 text-sm leading-snug text-muted-foreground">
                  <span className="text-accent">✦</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 grid grid-cols-2 gap-px border border-primary/25 bg-primary/20 sm:grid-cols-4">
              {[
                ["247", "BUILDERS"],
                ["4", "DAYS"],
                ["20K+", "APPLICANTS"],
                ["1", "PARADISE"],
              ].map(([n, l]) => (
                <div key={l} className="min-w-0 bg-background/85 px-3 py-4">
                  <p className="font-sans text-2xl font-bold tracking-tight text-primary">{n}</p>
                  <p className="mt-1 text-[9px] tracking-[0.18em] text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* BUILDER */}
      <main id="builder" className="relative">
        <div className="grid-fine pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="grid gap-10 sm:gap-14 lg:grid-cols-[1fr_440px]">
            <div className="order-2 space-y-8 sm:space-y-10 lg:order-1">
              <Panel step="01" title="SELFIE">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
                <div className="grid gap-3 sm:flex sm:flex-wrap">
                  <Button
                    disabled={loading}
                    onClick={() => fileRef.current?.click()}
                    className="hover-glow w-full gap-2 rounded-none tracking-[0.1em] sm:w-auto"
                  >
                    <Upload className={`size-4 ${loading ? "animate-pulse" : ""}`} />{" "}
                    {loading ? "READING…" : img ? "REPLACE PHOTO" : "UPLOAD SELFIE"}
                  </Button>
                  {img && (
                    <Button
                      variant="outline"
                      className="hover-glow w-full gap-2 rounded-none tracking-[0.1em] sm:w-auto"
                      onClick={() => {
                        setImg(null);
                        setRevealKey((k) => k + 1);
                      }}
                    >
                      <RefreshCw className="size-4" /> CLEAR
                    </Button>
                  )}
                </div>
              </Panel>


              <Panel step="02" title="IDENTITY">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name" value={identity.name} onChange={set("name")} placeholder="Riya Naik" />
                  <Field label="Handle" value={identity.handle} onChange={set("handle")} placeholder="@riyabuilds" />
                  <Field
                    label="College / Org"
                    value={identity.college}
                    onChange={set("college")}
                    placeholder="BITS Goa"
                  />
                  <Field label="City" value={identity.city} onChange={set("city")} placeholder="Panaji" />
                  <div className="sm:col-span-2">
                    <Field
                      label="Role"
                      value={identity.role}
                      onChange={set("role")}
                      placeholder="Frontend Hacker"
                    />
                  </div>
                </div>
              </Panel>

              <Panel step="03" title="FRAME">
                <div className="grid gap-3 sm:grid-cols-2">
                  {FRAMES.map((f) => {
                    const active = f.id === frame;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFrame(f.id)}
                        className={`group relative overflow-hidden rounded-none border p-5 text-left transition-all duration-300 ${
                          active
                            ? "border-primary bg-primary/10"
                            : "border-border hover-lift hover:bg-card"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {f.swatch.map((c) => (
                              <span
                                key={c}
                                className="size-4 border border-border/70"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                          <span
                            className={`text-[10px] tracking-[0.2em] ${active ? "text-primary" : "text-muted-foreground/60"}`}
                          >
                            {active ? "ACTIVE" : "SELECT"}
                          </span>
                        </div>
                        <p className="mt-3 font-sans text-base font-bold uppercase tracking-tight">{f.name}</p>
                        <p className="mt-1 text-xs leading-snug text-muted-foreground">{f.tagline}</p>
                      </button>
                    );
                  })}
                </div>
              </Panel>
            </div>

            <aside className="order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start">
              <div className="bracketed border border-primary/25 bg-card/60 p-5 backdrop-blur-sm sm:p-7">
                <div className="mb-3 flex items-center justify-between gap-2 text-[10px] tracking-[0.25em]">
                  <span className="truncate text-primary">LIVE PREVIEW</span>
                  <span className="shrink-0 text-muted-foreground">1080 × 1080</span>
                </div>
                <div className="scanlines relative mx-auto w-full max-w-[420px] overflow-hidden lg:max-w-none">
                  <canvas
                    key={revealKey}
                    ref={canvasRef}
                    width={SIZE}
                    height={SIZE}
                    className="animate-reveal aspect-square w-full border border-border"
                  />
                  {loading && (
                    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-background/40 backdrop-blur-[1px]">
                      <div className="animate-scan-pass h-1/6 w-full bg-gradient-to-b from-transparent via-primary/35 to-transparent" />
                      <span className="absolute bottom-3 left-3 text-[10px] tracking-[0.3em] text-primary">
                        PROCESSING SUBJECT…
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-4 grid gap-2">
                  <Button onClick={download} className="hover-glow h-12 gap-2 rounded-none tracking-[0.12em]">
                    <Download className="size-4" /> DOWNLOAD PNG
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={shareX}
                      className="hover-glow h-11 gap-2 rounded-none tracking-[0.1em]"
                    >
                      <Share2 className="size-4" /> SHARE ON X
                    </Button>
                    <Button
                      variant="outline"
                      onClick={copyText}
                      className="hover-glow h-11 gap-2 rounded-none tracking-[0.1em]"
                    >
                      <Copy className="size-4" /> COPY TEXT
                    </Button>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    X can't attach images automatically — download the PNG first, then attach it to
                    the pre-filled post.
                  </p>
                </div>
              </div>
            </aside>

          </div>
        </div>
      </main>

      <footer className="relative border-t border-primary/20">
        <div className="topo absolute inset-0 -z-10 opacity-30" />
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-12 sm:px-8 text-[10px] sm:px-5 tracking-[0.25em] text-muted-foreground">
          <span>FRAME//GOA · HH GOA 2026</span>
          <span className="text-primary/70">RENDERS ENTIRELY ON-DEVICE</span>
        </div>
      </footer>
    </div>
  );
}

function Panel({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bracketed hover-lift border border-border bg-card/60 p-6 backdrop-blur-sm sm:p-8">
      <div className="mb-6 flex items-baseline gap-3 border-b border-border/70 pb-4">
        <span className="font-sans text-2xl font-bold leading-none text-primary/40">{step}</span>
        <h2 className="text-xs tracking-[0.3em] text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] tracking-[0.2em] text-muted-foreground">{label.toUpperCase()}</Label>
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={40}
        className="rounded-none border-border bg-background/60"
      />
    </div>
  );
}
