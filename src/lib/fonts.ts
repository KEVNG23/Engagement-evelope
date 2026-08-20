import { Allura, Bodoni_Moda, Cormorant_Garamond } from "next/font/google";

/** Body / Vietnamese text — only weights actually used */
export const serifFont = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

/** Didot-style caps — “YOU'VE GOT INVITED FROM” */
export const displayFont = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

/** Canva-like calligraphy — “Annie & Dũng” */
export const scriptFont = Allura({
  variable: "--font-allura",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});
