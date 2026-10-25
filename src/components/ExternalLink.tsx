import type { ReactNode } from "react";

// A link that opens in a new tab, says so to screen readers, and shows ↗.
export function ExternalLink({
  href,
  className,
  arrow = true,
  children,
}: {
  href: string;
  className?: string;
  arrow?: boolean;
  children: ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      {arrow && <span aria-hidden> ↗</span>}
      <span className="sr-only"> (opens in new tab)</span>
    </a>
  );
}
