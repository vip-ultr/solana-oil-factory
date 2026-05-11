// Cross-browser "share this URL" helper. Uses the Web Share API
// when available (mobile / Safari / Chrome desktop on HTTPS);
// otherwise falls back to copying the URL to the clipboard.
//
// Returns "shared" if the OS picker handled it, "copied" if we
// fell back to the clipboard, or "failed" if neither worked.

export type ShareResult = "shared" | "copied" | "failed";

export async function shareUrl(
  url: string,
  title?: string,
  text?: string,
): Promise<ShareResult> {
  if (typeof window === "undefined") return "failed";
  const nav = window.navigator as Navigator & {
    share?: (data: ShareData) => Promise<void>;
  };
  if (typeof nav.share === "function") {
    try {
      await nav.share({ url, title, text });
      return "shared";
    } catch {
      // User cancelled the picker, or the host rejected. Fall
      // through to the clipboard path — better than silent failure.
    }
  }
  try {
    await nav.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}
