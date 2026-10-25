import Script from "next/script";
import { profile } from "@/lib/content";

// Avatar Studio's own embed, so the portfolio shows the product it talks about.
// It loads in browser idle time, after everything else, so it never delays the page.
export function AvatarWidget() {
  const { src, key } = profile.avatarEmbed;
  if (!src || !key) return null;
  return <Script src={src} data-key={key} strategy="lazyOnload" />;
}
