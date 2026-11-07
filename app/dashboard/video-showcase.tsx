"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ProjectStatus } from "@/lib/projects";
import type { Video } from "@/lib/videos";
import { formatDate, formatDuration, StatusBadge } from "@/app/ui/project-meta";

const ROWS: { status: ProjectStatus; title: string }[] = [
  { status: "in-review", title: "Ready for your review" },
  { status: "in-progress", title: "In progress" },
  { status: "delivered", title: "Delivered" },
];

const HOVER_DELAY_MS = 350;

export function VideoShowcase({ videos }: { videos: Video[] }) {
  const [activeId, setActiveId] = useState(() => pickFeatured(videos).id);
  const [playing, setPlaying] = useState<Video | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const active = videos.find((v) => v.id === activeId) ?? videos[0];

  function previewSoon(id: string) {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setActiveId(id), HOVER_DELAY_MS);
  }
  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  return (
    <div className="flex flex-col gap-10">
      <Hero video={active} onPlay={() => setPlaying(active)} />

      {ROWS.map(({ status, title }) => {
        const row = videos.filter((v) => v.status === status);
        if (row.length === 0) return null;
        return (
          <Row
            key={status}
            title={title}
            videos={row}
            activeId={active.id}
            onSelect={(id) => {
              clearTimeout(hoverTimer.current);
              setActiveId(id);
            }}
            onHover={previewSoon}
            onHoverEnd={() => clearTimeout(hoverTimer.current)}
          />
        );
      })}

      <Player video={playing} onClose={() => setPlaying(null)} />
    </div>
  );
}

// Start on whatever needs the client's attention, then anything playable.
function pickFeatured(videos: Video[]) {
  return (
    videos.find((v) => v.status === "in-review" && v.url) ??
    videos.find((v) => v.url) ??
    videos[0]
  );
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

function Hero({ video, onPlay }: { video: Video; onPlay: () => void }) {
  const [muted, setMuted] = useState(true);
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section className="relative isolate flex min-h-[26rem] items-end overflow-hidden rounded-2xl border border-border bg-black sm:aspect-[21/9] sm:min-h-0">
      {video.url ? (
        <video
          key={`bg-${video.id}`}
          src={reducedMotion ? `${video.url}#t=0.1` : video.url}
          poster={video.posterUrl ?? undefined}
          autoPlay={!reducedMotion}
          muted={muted}
          loop
          playsInline
          preload="auto"
          aria-hidden
          className="animate-fade-in absolute inset-0 -z-10 size-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-surface-2 via-[#2a1a22] to-[#3b1424]" />
      )}
      {/* Netflix-style scrims so text stays readable over any frame */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />

      <div key={`info-${video.id}`} className="animate-fade-in flex text-white w-full flex-col gap-4 p-6 sm:max-w-xl sm:p-10">
        <div className="flex items-center gap-2">
          <StatusBadge status={video.status} />
          <span className="rounded-md bg-black/40 px-1.5 py-0.5 font-mono text-xs text-white/75 backdrop-blur">
            v{video.version}
          </span>
        </div>
        <h2 className="font-display text-4xl leading-none font-normal tracking-tight text-balance drop-shadow sm:text-6xl">
          {video.title}
        </h2>
        <p className="text-sm text-white/80">
          {[
            video.durationSeconds != null && formatDuration(video.durationSeconds),
            video.dueAt ? `Due ${formatDate(video.dueAt)}` : `Updated ${formatDate(video.updatedAt)}`,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={onPlay}
            disabled={!video.url}
            className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-white/85 disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
            {video.url ? "Play" : "Unavailable"}
          </button>
          {video.url && !reducedMotion && (
            <button
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Unmute preview" : "Mute preview"}
              className="grid size-10 place-items-center rounded-full border border-white/40 bg-black/30 backdrop-blur transition-colors hover:border-white"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path d="M11 5 6 9H3v6h3l5 4V5z" strokeLinejoin="round" />
                {muted ? (
                  <path d="m22 9-6 6m0-6 6 6" strokeLinecap="round" />
                ) : (
                  <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" strokeLinecap="round" />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function Row({
  title,
  videos,
  activeId,
  onSelect,
  onHover,
  onHoverEnd,
}: {
  title: string;
  videos: Video[];
  activeId: string;
  onSelect: (id: string) => void;
  onHover: (id: string) => void;
  onHoverEnd: () => void;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const scroll = (direction: 1 | -1) => {
    const track = trackRef.current;
    track?.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="group/row">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-2xl font-normal tracking-tight">
          {title} <span className="text-sm font-normal text-muted">{videos.length}</span>
        </h3>
        <div className="hidden gap-2 sm:flex">
          {([-1, 1] as const).map((direction) => (
            <button
              key={direction}
              onClick={() => scroll(direction)}
              aria-label={direction < 0 ? `Scroll ${title} left` : `Scroll ${title} right`}
              className="grid size-8 place-items-center rounded-full border border-border text-muted transition-colors hover:border-foreground hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path d={direction < 0 ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <ul
        ref={trackRef}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 py-2 sm:-mx-6 sm:scroll-px-6 sm:px-6"
      >
        {videos.map((video) => {
          const isActive = video.id === activeId;
          return (
            <li key={video.id} className="w-64 shrink-0 snap-start sm:w-72">
              <button
                onClick={() => onSelect(video.id)}
                onMouseEnter={() => onHover(video.id)}
                onMouseLeave={onHoverEnd}
                onFocus={() => onSelect(video.id)}
                aria-pressed={isActive}
                aria-label={`Preview ${video.title}`}
                className={`group relative block aspect-video w-full overflow-hidden rounded-lg bg-surface-2 text-left ring-2 transition duration-300 hover:scale-[1.04] focus-visible:outline-none ${
                  isActive ? "ring-accent" : "ring-transparent hover:ring-foreground/20"
                }`}
              >
                {video.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- signed Storage URL
                  <img src={video.posterUrl} alt="" className="size-full object-cover" />
                ) : video.url ? (
                  <video
                    src={`${video.url}#t=0.1`}
                    muted
                    playsInline
                    preload="metadata"
                    aria-hidden
                    className="pointer-events-none size-full object-cover"
                  />
                ) : (
                  <span className="grid size-full place-items-center text-xs text-muted">Unavailable</span>
                )}
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/90 to-transparent p-3 pt-8 text-white">
                  <span className="line-clamp-2 text-sm font-medium">{video.title}</span>
                  {video.durationSeconds != null && (
                    <span className="shrink-0 rounded bg-black/60 px-1.5 py-0.5 font-mono text-xs">
                      {formatDuration(video.durationSeconds)}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Player({ video, onClose }: { video: Video | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (video && !dialog.open) dialog.showModal();
    if (!video && dialog.open) dialog.close();
  }, [video]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-auto w-[min(96vw,80rem)] overflow-visible bg-transparent p-0 text-white backdrop:bg-black/85 backdrop:backdrop-blur-sm"
    >
      {video?.url && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="truncate text-lg font-semibold">{video.title}</h2>
            <button
              onClick={onClose}
              aria-label="Close player"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <video
            key={video.id}
            src={video.url}
            poster={video.posterUrl ?? undefined}
            controls
            autoPlay
            playsInline
            className="aspect-video w-full rounded-xl bg-black"
          />
        </div>
      )}
    </dialog>
  );
}
