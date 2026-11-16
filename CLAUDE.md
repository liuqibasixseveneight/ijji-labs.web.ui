# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

The ijji labs site: a small studio that designs and builds websites for clients (it does not offer app work), and makes apps of its own (IJJI Tracker first). The contact form takes website enquiries and requests for help with our apps. React 19 + React Router 7 (data router) + Tailwind 4 on Vite 8, with the React Compiler (Babel preset in `vite.config.ts`). Every page is pre-rendered at build time. Deployed on Netlify; two functions email the studio through Resend. UK English in copy.

**The site hosts our apps' store-required pages.** `/apps/<slug>/privacy`, `/terms`, `/support` and `/delete-account` are linked from App Store Connect and the Play Console. Their URLs must never change (`src/router/__tests__/storeUrls.test.tsx` pins them), and policy changes must move the document's `effectiveDate`.

## Commands

```bash
npm run dev               # vite (renders in the browser; no pre-rendering; no functions, so the forms 404)
npm run preview:netlify   # build, then serve as Netlify does (headers, both functions) on :8888; needs .env, and a valid post sends a real email
npm run build             # tsc -b, vite build, SSR build of src/entry-server.tsx, scripts/prerender.mjs
npm run lint              # eslint
npm run typecheck         # tsc -b (app, tooling, netlify functions, docs tests)
npm run format            # prettier --write (4 spaces, single quotes incl. JSX, width 100, LF)
npm test                  # vitest run
npm run test:coverage     # with thresholds (what CI runs)
npx vitest run path/to/file.test.tsx   # one file
npx vitest run -t 'name of test'       # one test by name
npm run storybook         # storybook dev on :6006
npx vite preview          # serve dist/ after a build, to check the pre-rendered pages
npm run images            # remake the responsive photos after changing src/assets/images/*.jpg
npm run brand-images      # remake public/social-preview.png, logo.png, apple-touch-icon.png (headless Chrome)
```

## Architecture

- **Content lives in `src/content/`**, typed, never inside components: `site.ts` (name, controller, contact email, reply time, deletion and backup periods: one source for every promise), `pages.ts` (each page's title/description and copy), `services.ts`, `projects.ts`, `valueCards.ts`, `processSteps.ts`, `apps.ts`, and the policies in `policies/` as `PolicyDocument` objects (`types.ts`). `src/content/__tests__/content.test.ts` checks there are no placeholders, one reply time, one email address, unique section ids, and that IJJI Tracker's copy never says "study" or "classroom".
- **Paths come from `src/router/paths.ts`** (`paths.about`, `paths.app(slug).privacy`, `contactAbout('support')`), never string literals.
- **Routes** (`src/router/routes.tsx`): one `RootLayout` (skip link, navbar, `<main id='main'>`, footer) with a child per page and a `*` catch-all (`NotFound`). App pages are data-driven: `apps/:appSlug`, `apps/:appSlug/privacy` and so on read `src/content/apps.ts`; an unknown slug renders NotFound. **Adding an app is adding an `AppEntry`** (with its four `PolicyDocument`s, and its icon: the app's own 1024px `icon.png` as `src/assets/images/apps/<slug>.png`, then `npm run images` and an entry in `appIcons`); its pages, footer links, prerendering and sitemap entry follow.
- **Pre-rendering**: `npm run build` renders every path in `prerenderPaths()` (`src/entry-server.tsx`) with `react-dom/server` and the same routes, writing `dist/<path>/index.html` and `dist/<path>.html`, plus `404.html`, `sitemap.xml` and `robots.txt` (`scripts/prerender.mjs`). `main.tsx` hydrates when the root has markup. There is no SPA fallback in `netlify.toml`: unknown addresses get `404.html` with a real 404. A new static page must be added to `prerenderPaths()`. Anything that differs between server and browser (window, the URL's query) must happen in an effect, as `ContactForm` does with `?topic=`.
- **Page metadata**: every page renders `<PageMeta>` (title, description, canonical, Open Graph); React hoists it into `<head>`, and the prerender moves it there in the static HTML. `index.html` holds only site-wide tags.
- **Layout primitives**: pages are built from `Section` (dark or light band, width `wide | grid | media | text`, spacing), `SectionIntro` (heading + lede coloured for the band), `PageHero`, `TextSection`, `CtaBand` and `MoreLink`. Use these rather than repeating the wrapper classes.
- Components follow atomic design: `components/ui/{atoms,molecules,organisms}`, each in its own folder with `Name.tsx`, `types.ts`, `index.ts`. Pages are `components/pages/<Page>/<Page>.tsx`, with sections in `modules/` only when a page needs its own.
- Home's hero (`FluidGradient`) is WebGL. three.js is loaded with `import('./utils/scene')` when the hero comes into view, so no other page downloads it; `FluidGradient/utils` (palettes, types) stays free of three.js at runtime. The palette choice flows up through `RootLayout` (outlet context) so the navbar can turn white over dark palettes.
- **Netlify functions**: `contact` and `account-deletion`, each in its own folder (every top-level file in `netlify/functions/` deploys as a function). Shared code is in `netlify/shared/email.ts` (`readForm` validates against the same zod schema as the form and drops honeypot posts; `deliver` emails the studio inbox; `escapeHtml`/`field` for every value in an email). The deletion function only emails the studio, never the address typed in. The functions import from `src/content` and the form schemas, so those must stay plain TypeScript: no `import.meta.glob`, assets or other Vite-only code (`netlify/shared/bundle.test.ts` bundles each function with esbuild and runs it to catch this). App icons live in `appIcons` in `src/assets/images` for that reason.
- The menu: Esc closes it and returns focus to the hamburger; opening it focuses its first link; closed, it is `inert`.

## Performance, accessibility and SEO

These were measured with Lighthouse (mobile) on the built site: 100 for accessibility, best practices and SEO on every page; performance 96–100 on mobile (simulated slow 4G) and 100 on desktop; CLS about 0. Keep them there.

- **Photos** go through `ResponsiveImage` with a source from `src/assets/images` (AVIF and WebP at 640–1920w, a JPEG fallback, and the real width and height so nothing shifts). Mark a page's first big image `priority`; everything else loads lazily. Remote screenshots go through `cdnImage()` for the right width and format. Never use a bare `<img>` for a photo.
- **three.js** is only imported dynamically by `FluidGradient`; nothing else may import it. With `prefers-reduced-motion`, the hero shows its still gradient, Lenis smooth scrolling is off, and CSS transitions and animations are cut (`index.css`).
- **Fonts**: Space Grotesk (body) is preloaded by `scripts/prerender.mjs`; Newsreader uses the smaller weight-only file and appears only in the logo and app marks.
- **Contrast**: secondary text must reach 4.5:1. On white or #f5f5f5 use neutral-500/600 (not 400); on #121212 use white/60 or neutral-400 (not white/30–40). jsdom can't check contrast; run Lighthouse or Storybook's a11y panel after colour changes.
- **No eval**: zod is imported from `src/lib/zod.ts`, which turns off its eval-based JIT so the CSP isn't tripped. Import zod from there, not from 'zod'.
- **Headers** (`netlify.toml`): a strict Content-Security-Policy (self only, plus images from images.unsplash.com), HSTS, no framing, and year-long caching for `/assets/*`. Adding any third party (analytics, fonts, embeds) means updating the CSP, or it will be blocked.
- **Structured data**: `src/content/structuredData.ts` builds schema.org JSON-LD: the Organization and WebSite on every page (`RootLayout`), and per page a WebPage (AboutPage, ContactPage, CollectionPage…), the services' OfferCatalog and FAQPage, each app's MobileApplication, and the policies with dates, breadcrumbs and (support) FAQPage. Render it with `<StructuredData>`. A new page gets a `webPage()` at least.
- **GEO** (generative engine optimisation): the build writes `/llms.txt` (a summary with links) and `/llms-full.txt` (everything, including each policy in full) from `src/content/llms.ts`, so AI assistants can describe the studio and its apps accurately. robots.txt welcomes AI crawlers by name; the sitemap dates each policy.
- **Titles and descriptions**: titles ≤ 65 characters, descriptions 50–170 (an app's `description` ≤ 160); `src/router/__tests__/seo.test.tsx` checks them.

## Tests, stories and the site map

- Vitest + Testing Library (jsdom). `src/test/renderApp.tsx` renders the whole site at a path with the real routes; use it for anything about navigation. `src/test/axe.ts` runs axe-core.
- `src/router/__tests__/routes.test.tsx`: for every page in `PAGES` (kept equal to the route table): one h1 and no skipped heading levels, title/description/canonical, every `#link` lands, ids are unique, in-site links go to real pages, images have alt, and axe passes. Add new pages to `PAGES`.
- `src/router/__tests__/journeys.test.tsx`: every menu, footer (including legal), navbar, breadcrumb and in-page link clicks through to the right page, with the right `?topic=`. When a page gains a link, add it here and to the site map.
- `src/router/__tests__/storeUrls.test.tsx`: the store-listed URLs, written out in full. Don't edit them to make a test pass.
- `src/__tests__/prerender.test.tsx`: every path renders on the server with a `<title>`, the policy text is in the HTML, and the sitemap dates each policy.
- `src/router/__tests__/seo.test.tsx`: title and description lengths, valid JSON-LD on every page (organisation, page, services, FAQ, app, policies, breadcrumbs), and llms.txt / llms-full.txt.
- `docs/screen-map/` is the site map (serve the folder and open `index.html`; it loads `screens.js`). Update `screens.js` with any navigation change; its test fails when routes, the menu or the footer drift from it.
- Storybook (`@storybook/react-vite`): stories beside components. `Screens` renders each full page via the real routes (`parameters: { router: false }` skips the global MemoryRouter decorator); `Layout`, `Apps` and `Organisms/PolicyDocument` show the building blocks.
- Coverage thresholds are in `vite.config.ts`; lines are the meaningful number because of the React Compiler's output.

## Conventions

- Named exports with arrow-function components (`export const Foo = () => …`).
- Relative imports with explicit `.ts`/`.tsx` extensions inside a component folder; barrels (`'../../ui'`) across folders.
- Join conditional classes with `clsx`, not `${cond && 'class'}`.
- Text links have one style, on dark and light sections alike: a yellow marker stroke at rest that rises to fill the link on hover or focus (on dark, the text turns dark as it fills). Use `TextLink` or `MoreLink` (both built on `markerLink`), or the `link-highlight link-marked` utilities in `index.css` for links inside running text. Never a plain underline. Navigation (menu, navbar, footer, breadcrumbs), buttons and cards have their own styles.
- Buttons, text links and footer links roll their label on hover or focus: wrap the text in `RollingText` and mark the link or button `group`. The rolling copy is `aria-hidden`, so names are read once, but `textContent` holds the text twice: find links in tests by role and name.
- Form fields go inside `FieldWrapper`, which wraps them in their `<label>`; forms get a `Honeypot`.
- With react-hook-form, read live values with `useWatch`, not `watch` (the React Compiler skips components that call `watch`).
- Policies are drafts until reviewed; never present them as legal advice.
- Branching: `feat/*`, `fix/*` into `development` via PR.
