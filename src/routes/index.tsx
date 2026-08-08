import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Upload, Share2, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FRAMES, SIZE, drawFrame, type FrameId, type Identity } from "@/lib/frames";

const TITLE = "FRAME//GOA — HH Goa 2026 Identity Frame Generator";
const DESC =
  "Generate your HH Goa 2026 identity frame: upload a selfie, pick one of four hacker-meets-Goa designs, and download or share your badge. No login required.";

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

function Index() {
  const [identity, setIdentity] = useState<Identity>(EMPTY);
  const [frame, setFrame] = useState<FrameId>("terminal");
  const [img, setImg] = useState<HTMLImageElement | null>(null);
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
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => setImg(image);
      image.onerror = () => toast.error("Couldn't read that image.");
      image.src = reader.result as string;
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

  const shareText = `I'm heading to HH Goa 2026 ${identity.handle ? `— ${identity.handle} ` : ""}as ${identity.role || "a builder"}${identity.city ? ` from ${identity.city}` : ""}. Made my identity frame with FRAME//GOA. #HHGoa2026 #FRAMEGOA`;

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
    <div className="min-h-screen grid-lines">
      <Toaster position="top-center" />
      <header className="border-b border-border/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-baseline gap-3">
            <span className="font-sans text-xl font-bold tracking-tight text-gradient-goa">FRAME//GOA</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">v1.0 · no login</span>
          </div>
          <span className="rounded-full border border-primary/40 px-3 py-1 text-[11px] tracking-widest text-primary">
            HH GOA 2026
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10">
        <section className="mb-10 max-w-2xl">
          <p className="text-xs tracking-[0.3em] text-primary">$ ./generate --identity</p>
          <h1 className="mt-3 font-sans text-4xl font-bold leading-tight sm:text-5xl">
            Your hacker badge for the <span className="text-gradient-goa">Goa coast</span>.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Upload a selfie, drop your details, pick a frame. Everything renders locally in your
            browser — nothing is uploaded anywhere.
          </p>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_460px]">
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card/70 p-5">
              <Label className="text-xs tracking-widest text-muted-foreground">01 · SELFIE</Label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
              <div className="mt-3 flex flex-wrap gap-3">
                <Button onClick={() => fileRef.current?.click()} className="gap-2">
                  <Upload className="size-4" /> {img ? "Replace photo" : "Upload selfie"}
                </Button>
                {img && (
                  <Button variant="outline" className="gap-2" onClick={() => setImg(null)}>
                    <RefreshCw className="size-4" /> Clear
                  </Button>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card/70 p-5">
              <Label className="text-xs tracking-widest text-muted-foreground">02 · IDENTITY</Label>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Name" value={identity.name} onChange={set("name")} placeholder="Riya Naik" />
                <Field label="Handle" value={identity.handle} onChange={set("handle")} placeholder="@riyabuilds" />
                <Field label="College / Org" value={identity.college} onChange={set("college")} placeholder="BITS Goa" />
                <Field label="City" value={identity.city} onChange={set("city")} placeholder="Panaji" />
                <div className="sm:col-span-2">
                  <Field label="Role" value={identity.role} onChange={set("role")} placeholder="Frontend Hacker" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card/70 p-5">
              <Label className="text-xs tracking-widest text-muted-foreground">03 · FRAME</Label>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {FRAMES.map((f) => {
                  const active = f.id === frame;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFrame(f.id)}
                      className={`rounded-md border p-4 text-left transition-colors ${
                        active
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-secondary/40"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {f.swatch.map((c) => (
                          <span
                            key={c}
                            className="size-4 rounded-sm border border-border/70"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <p className="mt-3 font-sans text-sm font-bold tracking-wide">{f.name}</p>
                      <p className="mt-1 text-xs leading-snug text-muted-foreground">{f.tagline}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-lg border border-border bg-card/70 p-5">
              <div className="mb-3 flex items-center justify-between">
                <Label className="text-xs tracking-widest text-muted-foreground">LIVE PREVIEW</Label>
                <span className="text-[11px] text-muted-foreground">1080 × 1080</span>
              </div>
              <canvas
                ref={canvasRef}
                width={SIZE}
                height={SIZE}
                className="aspect-square w-full rounded-md border border-border"
              />
              <div className="mt-4 grid gap-2">
                <Button onClick={download} className="gap-2">
                  <Download className="size-4" /> Download PNG
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={shareX} className="gap-2">
                    <Share2 className="size-4" /> Share on X
                  </Button>
                  <Button variant="outline" onClick={copyText} className="gap-2">
                    <Copy className="size-4" /> Copy text
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
      </main>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        FRAME//GOA · built for HH Goa 2026 · renders entirely on-device
      </footer>
    </div>
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
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input value={value} onChange={onChange} placeholder={placeholder} maxLength={40} />
    </div>
  );
}
