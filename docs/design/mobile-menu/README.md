# Mobile menu studies

Open `index.html` for the comparison, or open any of the three variant HTML files to try the menu. All page styles, fonts, and images are saved locally. Navigation links lead to the live site.

These are standalone design prototypes based on the landing page captured from https://letitsniff.gr on 2026-11-19. The original three concepts are preserved below. Option 2 has now been refined and implemented in the application source; nothing has been deployed.

## Selected option: refined side panel

The implementation is in `site/components/Navbar.tsx` and `site/app/globals.css`, with compact mobile descriptions managed in `docs/site/global.md`. It uses a 280 × 324 px panel, covering 28% of a 390 × 844 viewport. Icon tiles group each link, a dedicated close button sits beside the title, and the contact action has a clear arrow. The backdrop stays light so the page remains visible.

- `2-side-panel-refined-open.png`: actual exported site, menu open.
- `2-side-panel-refined-closed.png`: actual exported site, menu closed.
- `2-side-panel-refined-desktop.png`: desktop layout.
- `refined-verification.json`: browser checks and dimensions.

Verification passed for toggle / close button / outside tap / Escape dismissal, focus restoration and trapping, scroll locking, background inert behavior, navigation and active-page indication, fixed viewport placement after scrolling, desktop resize cleanup, and touch targets / bounds at 320, 390, 430, and landscape 667 px. No browser errors occurred. Changed TypeScript files passed ESLint, and the site exported 161 routes. The existing Next.js 16.4.4 dependency raised a security advisory; upgrading it is recommended separately.

## Original options

| Option | Menu dimensions at 390 × 844 | Screen area covered by the menu panel |
| --- | --- | --- |
| Current menu | 390 × 501 px | 59% |
| 1. Compact dropdown | 366 × 224 px | 25% |
| 2. Narrow side panel | 268 × 304 px | 25% |
| 3. Bottom sheet | 390 × 263 px | 31% |

Percentages exclude the navigation header and translucent backdrop. All prototypes use a 56 px mobile header, versus the current 64 px header. The closed state is the same across the three options. The dropdown removes link descriptions; the side panel keeps shorter descriptions; the bottom sheet presents three destinations and contact in a two-column grid.

Screenshots include each option open and closed at 390 × 844 CSS pixels, with 2× image resolution. `comparison.png` shows the three options together.

Verified in headless Chrome: opening and closing, Escape dismissal, outside-tap dismissal, no horizontal overflow at 320/390/430 px, and menu links at least 44 px tall. The prototypes support a keyboard focus loop while open, scroll locking, and a desktop navigation layout.

To regenerate the previews and individual screenshots, install `playwright-core` in a temporary directory and run:

```sh
npm install --prefix /tmp/letitsniff-menu-tools playwright-core
node docs/design/mobile-menu/generate.cjs /tmp/letitsniff-menu-tools/node_modules/playwright-core
```

Set `CHROME_BIN` if Chrome is installed somewhere other than `/opt/google/chrome/chrome`. The generator reads the current production page; regenerating later may capture different page content. The comparison page and combined image are presentation artifacts maintained separately.
