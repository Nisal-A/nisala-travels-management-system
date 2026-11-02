# Admin UI Spec (from the reference dashboard)

Colours: theme tokens ONLY. Never use slate-*, brand-*, gray-*, hex, or hardcoded Tailwind colours.
Font: the project's configured sans font (not Inter, no Google Fonts). Icons: lucide-react only.
Token map: page bg = bg-background | surfaces = bg-card | borders = border-border |
muted fills (search box, table head) = bg-muted, bg-muted/50 | text = text-foreground,
text-muted-foreground | active/brand = bg-primary/10 text-primary | semantic tints =
bg-success/10 text-success border-success/20 (same for warning, info, destructive) |
focus = focus-visible:ring-2 ring-ring.
If a tinted text colour fails WCAG AA contrast, use text-foreground plus a small coloured dot.
Do NOT edit tokens or theme.css. Sidebar may use the existing --sidebar-* tokens.

## Shell
- Sidebar: w-64, flex-col, border-r. Logo row h-16 px-6 border-b with the real logo
  (public/images/nisala-travels-logo.png, h-8 w-auto, links to the dashboard).
  Nav: flex-1 overflow-y-auto py-4 px-3 space-y-1.
  Item: flex items-center gap-3 px-3 py-2 rounded-lg text-sm, icon size-5.
  Inactive: text-muted-foreground hover:bg-muted hover:text-foreground.
  Active: bg-primary/10 text-primary font-medium.
  Group label: px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground.
  Footer: p-4 border-t, "Log out" text-sm with LogOut icon size-4.
  Below lg: same content in a Sheet drawer opened by a hamburger in the header.
- Header: h-16 border-b bg-card px-4 sm:px-6 lg:px-8, flex items-center justify-between, sticky top-0 z-10.
  Left: page title text-sm font-semibold (hamburger below lg).
  Right (gap-6): search button w-64 h-9 rounded-lg bg-muted pl-10 text-sm text-muted-foreground
  (Search icon size-4 at left-3; "Ctrl" and "K" kbd chips text-[10px] border rounded px-1.5 py-0.5 bg-card,
  hidden below md; whole search hidden below sm), divider h-6 w-px bg-border,
  bell icon size-5 with unread dot size-2 rounded-full bg-destructive ring-2 ring-card,
  profile: name text-sm font-semibold + role text-xs text-muted-foreground (hidden below sm),
  avatar size-9 rounded-full border-2 border-card shadow-sm (initials fallback, bg-primary text-primary-foreground).
- Main: bg-background, p-4 sm:p-6 lg:p-8, inner wrapper max-w-7xl mx-auto space-y-8.

## Page header
flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-5.
Title text-2xl font-bold tracking-tight. Description text-sm text-muted-foreground mt-1. Actions on the right.
Section heading: text-lg font-bold flex items-center gap-2 mb-4, icon size-5 text-primary.

## Cards
Card: rounded-xl border bg-card shadow-sm. Padding p-6 (compact p-5). Clickable card = whole card is a Link,
hover:shadow-md transition-shadow, visible focus ring.
Icon tile: size-8 rounded-lg grid place-items-center, icon size-4, tinted bg-X/10 text-X;
neutral = bg-muted text-muted-foreground, group-hover:bg-primary/10 group-hover:text-primary.
Category label: text-xs (compact: text-[10px]) font-bold uppercase tracking-wider text-muted-foreground.
Title text-lg font-bold (compact text-base). Description text-sm text-muted-foreground mt-2 line-clamp-2
(compact text-xs mt-1). Link row: mt-6 text-sm font-medium text-primary + ChevronRight size-4.
Summary tile: p-5, label text-xs uppercase tracking-wider text-muted-foreground, value text-2xl font-semibold.

## Tables
Wrapper: rounded-xl border bg-card shadow-sm overflow-hidden.
Toolbar: px-6 py-4 border-b bg-muted/50 flex items-center justify-between (title font-bold, actions right).
Table: w-full text-left text-sm. thead bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground border-b.
th: px-6 py-3 font-semibold. td: px-6 py-4. tbody divide-y. Row hover:bg-muted/50 transition-colors.
Reference/ID column font-medium text-foreground. Money columns right-aligned font-semibold (use MoneyText).
Status = StatusBadge: inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium with semantic tints.
Below md rows become stacked cards (keep the existing fallback).
Secondary toolbar button: h-9 px-3 rounded-md border bg-card text-sm font-medium shadow-sm gap-1, icon size-4.

## Forms and settings
Label text-sm font-medium mb-1. Input px-3 py-2.5 rounded-lg border text-sm, focus ring-2.
Grid grid-cols-1 md:grid-cols-2 gap-6; wide fields col-span-2. Disabled: bg-muted text-muted-foreground cursor-not-allowed.
Helper text text-xs text-muted-foreground. Form section title text-base font-bold mb-4; divider my-8.
Toggle rows: label text-sm font-medium + helper text-xs, existing Switch on the right.
Settings layout: flex-col md:flex-row gap-8. Left nav w-full md:w-64 shrink-0 space-y-1; tab = block px-4 py-2.5
rounded-lg border text-sm; active bg-card shadow-sm border-border text-primary font-semibold;
inactive border-transparent text-muted-foreground hover:bg-muted.
Right panel = card, overflow-hidden, flex-col: body p-6 md:p-8 (scrolls), sticky footer px-6 py-4 border-t
bg-muted/50 flex justify-end gap-3 with Cancel (ghost) + Save changes (primary, px-6 py-2 font-semibold).
Cancel resets the form or uses an Inertia Link; never window.history.back().
Logo tile: size-20 rounded-xl border bg-muted showing the real logo (object-contain p-2).

## States and motion
Every page: skeleton shaped like the real content, EmptyState inside the card, ErrorState with retry.
Only transition-colors / transition-shadow. Respect prefers-reduced-motion. Must work at 360px.