// ---------------------------------------------------------------------------
// TUMBUH's brand, written once as a Hyper Elements theme and handed to all
// four roots (Email, Page, Document, Canvas). One theme, one palette —
// warm cream, terracotta and sage: a baby's first year, not an emergency.
// The status colour IS the information (sage = done, amber = due soon,
// slate = upcoming), so the same three colours run through every output
// and a parent reads the schedule at a glance, in any format. Headings
// are a warm serif (Georgia) on the email and page; the PDF and the card
// use DejaVu, the font the renderers can load.
// ---------------------------------------------------------------------------

import { defineTheme } from "@hyper-elements/react";
import type { VisitStatus } from "./data.js";

/** Monospace stack for figures (dates, ages, child IDs). */
export const MONO_FONT = "'DejaVu Sans Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

/** Font stack for the PDF and the reminder card, loaded from assets/fonts. */
export const PRINT_FONT = "'DejaVu Sans', sans-serif";

/** Semantic colours shared by all four outputs. */
export const C = {
  ink: "#3B2F2F",
  page: "#FDF8F1",
  card: "#FFFFFF",
  muted: "#6B5B53",
  faint: "#C4B5AC",
  border: "#EBDDD3",
  zebra: "#FBF6EF",
  track: "#F0E6DC",
  white: "#FFFFFF",
  terra: "#C96F4A",
  terraDark: "#9C4A2A",
  terraTint: "#FBEDE6",
  sun: "#F2C94C",
} as const;

/** Status colours — the schedule's traffic light, shared by all outputs. */
export const STATUS_COLORS: Record<
  VisitStatus,
  { color: string; dark: string; tint: string }
> = {
  done: { color: "#6B8F71", dark: "#3F5D45", tint: "#E6F0E7" },
  "due-soon": { color: "#D97706", dark: "#92400E", tint: "#FEF3C7" },
  upcoming: { color: "#64748B", dark: "#334155", tint: "#E8EEF4" },
  overdue: { color: "#DC2626", dark: "#991B1B", tint: "#FEE2E2" },
};

export const tumbuhTheme = defineTheme({
  colors: {
    background: C.page,
    foreground: C.ink,
    primary: C.terraDark,
    primaryForeground: "#FFFFFF",
    muted: C.muted,
    border: C.border,
  },
  fonts: {
    body: "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
    heading: "Georgia, 'Times New Roman', serif",
  },
  fontSizes: { body: 15 },
  lineHeights: { body: 1.6 },
  elements: {
    Heading: {
      by: {
        level: {
          1: { fontSize: 30, lineHeight: 1.2, mobile: { fontSize: 25 } },
          2: { fontSize: 20, lineHeight: 1.25, mobile: { fontSize: 18 } },
          // Section kickers: small, tracked-out, uppercase, muted.
          3: {
            fontSize: 12,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: "{colors.muted}",
          },
        },
      },
    },
    Button: {
      borderRadius: 999,
      hover: { backgroundColor: "#9C4A2A" },
    },
  },
  styles: {
    // The white card every content section lives in.
    card: {
      backgroundColor: "#FFFFFF",
      padding: 28,
      gap: 20,
      borderRadius: 16,
      border: "1px solid #EBDDD3",
    },
  },
});

/** Font files for the Document (PDF) and Canvas (reminder card) roots.
 *  The CLI's `render` loads them from the paths the template names; the
 *  Email and Page roots use the system stack from the theme instead.
 *  DejaVu ships only Regular (400) and Bold (700), but the theme's headings
 *  and badges use weight 800 — so each Bold file is registered for the
 *  whole 700–900 range, and 800 draws as Bold instead of warning about a
 *  missing file. */
export const PRINT_FONTS = [
  {
    family: "DejaVu Sans",
    src: "../assets/fonts/DejaVuSans.ttf",
    weight: 400 as const,
    style: "normal" as const,
  },
  {
    family: "DejaVu Sans",
    src: "../assets/fonts/DejaVuSans-Bold.ttf",
    weight: 700 as const,
    style: "normal" as const,
  },
  {
    // The renderers register a file per weight: the range string above did
    // not satisfy them, so Bold is registered again at 800 explicitly.
    family: "DejaVu Sans",
    src: "../assets/fonts/DejaVuSans-Bold.ttf",
    weight: 800 as const,
    style: "normal" as const,
  },
  {
    family: "DejaVu Sans Mono",
    src: "../assets/fonts/DejaVuSansMono.ttf",
    weight: 400 as const,
    style: "normal" as const,
  },
  {
    family: "DejaVu Sans Mono",
    src: "../assets/fonts/DejaVuSansMono-Bold.ttf",
    weight: 700 as const,
    style: "normal" as const,
  },
  {
    // Same as above: Bold registered again at 800 explicitly.
    family: "DejaVu Sans Mono",
    src: "../assets/fonts/DejaVuSansMono-Bold.ttf",
    weight: 800 as const,
    style: "normal" as const,
  },
];
