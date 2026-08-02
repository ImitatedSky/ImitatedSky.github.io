## Context

Original pochunyeh.com (Butterfly) CSS:
- `.layout`: `max-width: 1200px; padding: 40px 15px`
- Article column: `width: 74%; padding: 50px 40px` → inner text ~808px at max layout
- **No max-width on article text** — prose fills the full column width

Our React app: `max-w-6xl` (1152px) page, `w-72` sidebar, `gap-8` → article card ~800px. With `px-10` (40px) side padding → inner text ~720px, close to original ~808px.

## Goals / Non-Goals

**Goals:**
- Match the original site's article padding (40px sides, 50px top/bottom)
- Prose fills the full card width (`max-w-none`), same as original

**Non-Goals:**
- Artificially constraining prose to a narrower reading width (differs from original)

## Decisions

**`max-w-none` + `px-10 py-12`**: Matches the original's full-width prose with similar padding proportions. `px-10` = 40px sides (matches original exactly), `py-12` = 48px top/bottom (close to original 50px).

## Risks / Trade-offs

- [Wide code blocks] `overflow-x-auto` on pre handles this gracefully.
