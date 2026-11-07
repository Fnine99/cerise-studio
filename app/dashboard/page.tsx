import type { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getMyVideos } from "@/lib/videos";
import { VideoShowcase } from "./video-showcase";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<div className="h-8 w-48 animate-pulse rounded-lg bg-surface" />}>
        <Greeting />
      </Suspense>
      <Suspense fallback={<ShowcaseSkeleton />}>
        <Videos />
      </Suspense>
    </div>
  );
}

async function Greeting() {
  const user = await getCurrentUser();
  return (
    <h1 className="font-display text-4xl font-normal tracking-tight sm:text-5xl">
      Hi, {user.name.split(" ")[0]}
    </h1>
  );
}

async function Videos() {
  const videos = await getMyVideos();

  if (videos.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-16 text-center text-sm text-muted">
        No videos yet. They&apos;ll show up here as soon as a cut is ready.
      </p>
    );
  }
  return <VideoShowcase videos={videos} />;
}

function ShowcaseSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      <div className="min-h-[26rem] animate-pulse rounded-2xl bg-surface sm:aspect-[21/9] sm:min-h-0" />
      <div className="flex gap-3 overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="aspect-video w-64 shrink-0 animate-pulse rounded-lg bg-surface sm:w-72" />
        ))}
      </div>
    </div>
  );
}
