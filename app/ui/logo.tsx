import Link from "next/link";

// Text wordmark until the real logo file is added (e.g. public/logo.svg).
export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="font-display text-[1.65rem] leading-[0.85] font-medium tracking-tight">
      Cerise
      <br />
      Studios
    </Link>
  );
}
