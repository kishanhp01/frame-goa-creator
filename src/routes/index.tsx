import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Download,
  Upload,
  Share2,
  Copy,
  RefreshCw,
  PenLine,
  Palette,
  Eye,
  type LucideIcon,
} from "lucide-react";
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

  const shareText = `I'm heading to HH Goa 2026 ${identity.handle ? `— ${identity.handle} ` : ""}as ${identity.role || "a builder"}${identity.city ? ` from ${identity.city}` : ""}. Made my frame with FRAME//GOA — make yours in seconds, no login: https://frame-goa-creator.vercel.app/ #FrameInGoa #HHGoa2026`;

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

      <header className="sticky top-0 z-40 border-b border-primary/15 bg-background/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-8">
          <a href="#top" className="flex min-w-0 items-baseline gap-2">
            <span className="font-brush text-2xl leading-none text-primary sm:text-3xl">HH GOA</span>
            <span className="font-sans text-[11px] font-bold tracking-[0.2em] text-accent">’26</span>
          </a>

          <nav className="ml-auto hidden items-center gap-7 sm:flex">
            {NAV.map((n) => (
              <a
                key={n.label}
                href={n.href}
                className="story-link text-[11px] uppercase tracking-[0.24em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <a
            href="https://hhgoa.com/"
            target="_blank"
            rel="noreferrer"
            className="blob-btn ml-auto shrink-0 border border-accent/60 bg-accent/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground sm:ml-6"
          >
            Join HHGOA ’26
          </a>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="scanlines relative isolate overflow-hidden border-b border-primary/15">
        <div className="ornament animate-spin-slow absolute left-1/2 top-1/2 -z-20 aspect-square w-[135vw] max-w-[1400px] -translate-x-1/2 -translate-y-1/2 opacity-70" />
        <div className="grid-lines absolute inset-0 -z-10" />
        <div className="dotted-rails pointer-events-none absolute inset-y-0 left-4 right-4 -z-10 opacity-40 sm:left-8 sm:right-8" />
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px animate-sweep bg-primary/50" />

        <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div className="min-w-0">
            <p className="animate-rise text-[10px] uppercase tracking-[0.34em] text-accent">
              HH Goa ’26 <span className="text-primary/70">•</span> Homecoming of Hustlers
            </p>

            <h1 className="animate-rise mt-5 font-brush text-[clamp(3.4rem,15vw,10rem)] uppercase leading-[0.82] tracking-[0.005em]">
              <span className="block text-foreground">Frame the</span>
              <span className="brush-stroke relative -ml-1 block text-primary sm:ml-6">
                Goa energy
              </span>
            </h1>

            <p className="animate-rise mt-7 font-sans text-[clamp(0.95rem,2.4vw,1.35rem)] font-bold uppercase tracking-[0.12em] text-foreground/90">
              Your pass. Your vibe. <span className="text-accent">Your homeground.</span>
            </p>

            <p className="animate-rise mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Build your HH Goa identity, personalize your frame, and let your vibe do the talking.
            </p>

            <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <a
                href="#builder"
                className="blob-btn inline-flex items-center justify-center gap-2 bg-primary px-8 py-4 font-sans text-sm font-bold uppercase tracking-[0.1em] text-primary-foreground"
              >
                Create my frame →
              </a>
              <a
                href="https://hhgoa.com/"
                target="_blank"
                rel="noreferrer"
                className="blob-btn inline-flex items-center justify-center gap-2 border border-primary/35 px-8 py-4 font-sans text-sm uppercase tracking-[0.1em] text-foreground"
              >
                What is HHGOA? →
              </a>
            </div>
          </div>

          <div className="animate-rise relative lg:mb-3">
            <div className="bracketed border border-primary/20 bg-card/40 p-5 backdrop-blur-sm">
              <p className="text-[9px] uppercase tracking-[0.3em] text-primary/80">Gate closes in</p>
              <p className="mt-2 font-sans text-lg font-bold tracking-tight text-foreground">
                {countdown ?? "—"}
              </p>
              <p className="mt-4 border-t border-primary/15 pt-4 text-[10px] uppercase leading-relaxed tracking-[0.18em] text-muted-foreground">
                Aug 13 · 11:59 PM IST
                <br />
                No login · Renders on-device
              </p>
            </div>
            <span className="mt-4 inline-block rotate-[-2deg] font-brush text-2xl text-accent">
              #FrameInGoa
            </span>
          </div>
        </div>

        <div className="flex overflow-hidden border-t border-primary/15 bg-primary/5 py-2">
          <div className="animate-marquee flex shrink-0 gap-8 whitespace-nowrap pr-8">
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="text-[10px] tracking-[0.35em] text-primary/70">
                {t} <span className="text-accent/50">//</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section id="steps" className="relative overflow-hidden border-b border-primary/15">
        <div className="topo absolute inset-0 -z-10 opacity-50" />
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-brush text-[clamp(2.2rem,7vw,4.5rem)] uppercase leading-[0.85] text-foreground">
              Five moves.
              <br />
              <span className="text-primary">One identity.</span>
            </h2>
            <p className="max-w-xs text-[11px] uppercase leading-relaxed tracking-[0.18em] text-muted-foreground">
              Everything happens in your browser. Nothing uploaded, nothing stored.
            </p>
          </div>

          <ul className="mt-12 divide-y divide-primary/10 border-y border-primary/15">
            {STEPS.map(({ n, title, desc, Icon }) => (
              <li
                key={n}
                className="step-row group flex items-center gap-4 border-l-2 border-l-transparent px-2 py-6 sm:gap-8 sm:px-4"
              >
                <span className="font-sans text-xs font-bold tracking-[0.2em] text-primary/50 transition-colors group-hover:text-primary">
                  {n}
                </span>
                <Icon className="size-4 shrink-0 text-accent transition-transform duration-300 group-hover:scale-110" />
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-base font-bold uppercase tracking-[0.06em] sm:text-xl">
                    {title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{desc}</p>
                </div>
                <span className="hidden font-brush text-xl text-primary/0 transition-colors duration-300 group-hover:text-primary sm:block">
                  →
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-16 text-center">
            <p className="font-brush text-[clamp(1.8rem,6vw,3.4rem)] uppercase leading-[0.9] text-primary">
              Code. Chaos. Community.
            </p>
            <p className="mt-2 font-sans text-[11px] uppercase tracking-[0.34em] text-accent">
              This is HHGOA.
            </p>
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
