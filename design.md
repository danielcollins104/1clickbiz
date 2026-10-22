# 1 Click Business — Design System (Blunt)

Neo-brutalist editorial storefront. Electric-blue page, black and white everything else. Fashion-campaign layout
(giant headline over hero photo, ticker band, product rails) rendered with thick borders and hard shadows.

## Color
- `--background` #3B74FF electric blue (page), `--surface` #D4E1FF ice blue (soft fills), `--surface-high` #FFFFFF
- `--primary` / `--text` #131313 (ink, black blocks, buttons). Black on #3B74FF = 5.1:1, so body copy can sit on the blue.
- `--on-primary` #3B74FF (blue text on black, 4.5:1; fine for body, best for big type)
- `--accent-dim` #1F4FD6 deep blue, `--text-muted` #1B2338 navy
- Tailwind token names are unchanged from the yellow version (`sun` = electric blue, `cream` = ice blue) so classes didn't move.
- `--accent-green` #79E784 mint — spot colour for badges/highlights only, never a section background
- No gradients, no grey, no blur.

## Typography
- Display: Archivo Black, uppercase, letter-spacing -0.03em, line-height 0.9–1
- Body: Inter 500/700/800
- Hero headline uses viewport-scaled type (clamp up to ~14vw)

## Shape
- Borders: 3px solid #131313 everywhere. No hairlines.
- Shadows: hard offset `6px 6px 0 #131313` (cards, buttons). Pressed state translates 3px, shadow 3px.
- Radius 0.

## Components
- `.btn` black / `.btn-quiet` white / `.btn-yellow` (now blue; name kept)
- `.card` surface + border + hard shadow; hover lifts -3px with 9px shadow
- Ticker band: black strip, blue uppercase text, star separators, marquee
- Product poster: square art tile, flat colour (blue/black/white/green), huge lucide glyph, index number, tag sticker
- Cart drawer: right-side panel, white, border-left heavy, overlay solid black at 60%

## Motion
- Page load: staggered rise of hero words + hero image slide-up (CSS keyframes)
- Marquee ticker loop
- Hover: hard-shadow lift; nothing soft

## Photography
- Site photos were generated on yellow/green backdrops and recoloured to blue (selective HSV remap: yellows and their
  saturated cast shadows go to electric blue, greens to a lighter sky blue; skin is left untouched).
  Yellow originals are kept in /home/user/oneclick-images-yellow.

## Launch surfaces
- Control Room: dense white bordered tables on electric blue, black tab controls, mint status chips. Customer outputs are read-only structured blocks, not editable tools.
- Getting started: inline white six-step checklist with numbered black markers; no modal tour. Dismissal persists per user.
- Legal/contact/reset: readable narrow text columns, oversized Archivo Black titles, bordered form controls and explicit inline success/error states.
- Email: white document, electric-blue masthead, black typography/borders/CTA; escaped user content.
- Small screens: stack tables and customer detail; admin navigation belongs inside the hamburger menu rather than crowding the header.
