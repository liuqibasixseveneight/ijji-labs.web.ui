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
npm run brand-images      # remake public/social-preview.png and the studio mark icons: logo.png, favicon.ico, apple-touch-icon.png, icon-192/512.png (headless Chrome)
```

## Architecture

- **Content lives in `src/content/`**, typed, never inside components: `site.ts` (name, controller, contact email, reply time, deletion and backup periods: one source for every promise), `pages.ts` (each page's title/description and copy), `services.ts`, `projects.ts`, `valueCards.ts`, `processSteps.ts`, `apps.ts`, and the policies in `policies/` as `PolicyDocument` objects (`types.ts`). `src/content/__tests__/content.test.ts` checks there are no placeholders, one reply time, one email address, unique section ids, and that IJJI Tracker's copy never says "study" or "classroom".
- **Paths come from `src/router/paths.ts`** (`paths.about`, `paths.app(slug).privacy`, `contactAbout('support')`), never string literals.
- **Routes** (`src/router/routes.tsx`): one `RootLayout` (skip link, navbar, `<main id='main'>`, footer) with a child per page and a `*` catch-all (`NotFound`). App pages are data-driven: `apps/:appSlug`, `apps/:appSlug/privacy` and so on read `src/content/apps.ts`; an unknown slug renders NotFound. **Adding an app is adding an `AppEntry`** (with its four `PolicyDocument`s, and its icon: the app's own 1024px `icon.png` as `src/assets/images/apps/<slug>.png`, then `npm run images` and an entry in `appIcons`; on the page it's best drawn as vectors, as `IjjiTrackerIcon` in `AppMark`'s `VECTOR_ICONS`, since a raster ring softens at icon sizes); its pages, footer links, prerendering and sitemap entry follow.
- **Pre-rendering**: `npm run build` renders every path in `prerenderPaths()` (`src/entry-server.tsx`) with `react-dom/server` and the same routes, writing `dist/<path>/index.html` and `dist/<path>.html`, plus `404.html`, `sitemap.xml`, `robots.txt` and `site.webmanifest` (`scripts/prerender.mjs`). `main.tsx` hydrates when the root has markup. There is no SPA fallback in `netlify.toml`: unknown addresses get `404.html` with a real 404. A new static page must be added to `prerenderPaths()`. Anything that differs between server and browser (window, the URL's query) must happen in an effect, as `ContactForm` does with `?topic=`.
- **Page metadata**: every page renders `<PageMeta>` (title, description, canonical, Open Graph); React hoists it into `<head>`, and the prerender moves it there in the static HTML. `index.html` holds only site-wide tags.
- **Layout primitives**: pages are built from `Section` (dark or light band, width `wide | grid | media | text`, spacing), `SectionIntro` (heading + lede coloured for the band), `PageHero`, `TextSection`, `CtaBand` and `MoreLink`. Use these rather than repeating the wrapper classes.
- Components follow atomic design: `components/ui/{atoms,molecules,organisms}`, each in its own folder with `Name.tsx`, `types.ts`, `index.ts`. Pages are `components/pages/<Page>/<Page>.tsx`, with sections in `modules/` only when a page needs its own.
- Home's hero (`FluidGradient`) is WebGL. three.js is loaded with `import('./utils/scene')` when the hero comes into view, so no other page downloads it; `FluidGradient/utils` (palettes, types) stays free of three.js at runtime. The palette choice flows up through `RootLayout` (outlet context) so the navbar can turn white over dark palettes.
- **Netlify functions**: `contact` and `account-deletion`, each in its own folder (every top-level file in `netlify/functions/` deploys as a function). Shared code is in `netlify/shared/email.ts` (`readForm` validates against the same zod schema as the form and drops honeypot posts; `deliver` emails the studio inbox; `escapeHtml`/`field` for every value in an email). The deletion function only emails the studio, never the address typed in. The functions import from `src/content` and the form schemas, so those must stay plain TypeScript: no `import.meta.glob`, assets or other Vite-only code (`netlify/shared/bundle.test.ts` bundles each function with esbuild and runs it to catch this). App icons live in `appIcons` in `src/assets/images` for that reason.
- The menu: Esc closes it and returns focus to the hamburger; opening it focuses its first link; closed, it is `inert`.

## Performance, accessibility and SEO

These were measured with Lighthouse (mobile) on the built site: 100 for accessibility, best practices and SEO on every page; performance 96–100 on mobile (simulated slow 4G) and 100 on desktop; CLS about 0. Keep them there.

- **Photos** go through `ResponsiveImage` with a source from `src/assets/images` (AVIF and WebP at 640–1920w, a JPEG fallback, and the real width and height so nothing shifts). Mark a page's first big image `priority`; everything else loads lazily. Remote screenshots go through `cdnImage()` for the right width and format. Never use a bare `<img>` for a photo.
- **three.js** is only imported dynamically by `FluidGradient`; nothing else may import it. With `prefers-reduced-motion`, the hero shows its still gradient, Lenis smooth scrolling is off, and CSS transitions and animations are cut (`index.css`). The fluid also only starts on hardware WebGL (`FluidGradient/utils/renderer.ts`): where WebGL is drawn on the CPU (SwiftShader, as on PageSpeed Insights' test phone), it blocked the main thread for seconds, so the still gradient stays and three.js isn't downloaded. To measure that case locally, run Lighthouse with `--chrome-flags="--headless=new --disable-gpu --use-angle=swiftshader --enable-unsafe-swiftshader"`.
- **Fonts**: Space Grotesk (body) is preloaded by `scripts/prerender.mjs`; Newsreader uses the smaller weight-only file and appears only in the logo and app marks.
- **Focus ring**: yellow on dark sections, near-black on light ones (`--focus-ring`, set by `Section tone='light'`; set it yourself on any other white surface). Yellow on white is about 1.1:1.
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

## Admin dashboard

A private dashboard at `/admin` for the studio's one admin. It covers the website (uptime, Lighthouse, deploys, forms), IJJI Tracker's Supabase projects (counts only), its EAS builds, and the queue of account-deletion requests. `docs/ADMIN.md` is the runbook: env vars, signing in, rotating secrets, and what each alert means.

- **Its own entry, never the public site's.** It lives in `admin/index.html` and `src/admin/main.tsx`, a client-only router with basename `/admin`. It's not in `routes.tsx`, `prerenderPaths()`, the sitemap, `llms*.txt`, `robots.txt` or the screen map. ESLint stops public code importing `src/admin`, and the build check fails if admin code or a secret's name reaches the public bundle. Admin code may import from `src/components`, `src/lib` and `src/content`.
- **Refused at every layer:**
    - The edge gate (`netlify/edge-functions/admin-gate/`) answers 404 to anyone without a valid session, except on `/admin/sign-in`.
    - Every admin function is wrapped in `withAdmin` (`netlify/shared/admin/http.ts`). It checks the HMAC-signed `__Host-ijji_admin` cookie (4 hours, MFA, allowlist, the sign-out-everywhere epoch), the Origin and the `X-Admin-Request` header.
    - Functions live at `/api/admin/*` (Functions v2 `config.path`). `netlify/shared/admin/refusals.test.ts` picks up every `admin-*` function and checks it refuses everyone else.
- **Server side, read-only, privacy first:**
    - Upstream wrappers only GET a fixed list of paths: `netlifyApi.ts`, and `supabaseMgmt.ts` for the Management API, with a token per project.
    - `expo.ts` sends one fixed GraphQL query. `supabaseProject.ts` only calls the app's counts-only `admin_stats()` and `admin_db_stats()`, which live in ijji-tracker.mobile's migrations and only `service_role` can run.
    - Replies are checked against a shape and only picked fields are passed on. Anything from logs, advisors or build errors goes through `scrub.ts`, which removes emails, ids, IPs and tokens.
    - Each page's data comes as parts (`{ data, error }`), so one failing source shows its own reason and the rest still load.
    - The only writes are a deletion request's status, and a Lighthouse run (at most once every 10 minutes per page and device).
- **Blobs** go through `netlify/shared/blobs.ts` (pinned to eu-central-1). Lambda-style functions need `connectBlobs(event)` and eventual consistency.
- **The client:**
    - Loaders don't wait. `src/admin/data.ts` hands each page cached data, or a promise and the last data, through `cache.ts`, which keeps data in memory for a minute and never in browser storage.
    - Pages render with `<Deferred>`, showing a skeleton (`Skeleton.tsx`) the first time.
    - Links prefetch on intent (`prefetchOn`), and opening the menu prefetches the sections.
    - The root loader (session and deletion requests) reloads only after a save or a refresh, not on every page change or URL search change.
    - A section page is `PageHeader` (title, the "Updated" time, Refresh, Collapse all, an optional switcher) plus `Card`s. Cards are collapsible, remembered per card in `localStorage` (`collapsed.ts`), with a `summary` shown while collapsed. Use the same pieces for a new section.
- **Looks:**
    - The navbar is built as the site's (`AdminNavbar`), from the site's `HamburgerIcon`, `NavMenu` and `useNavMenu`, with Lenis scrolling from `src/lib/smoothScroll.ts`. Change the shared pieces with both in mind.
    - Text links use `link-highlight link-marked`, as the policy pages do. Buttons use `secondaryAction`, and are `aria-disabled` rather than `disabled` while busy, so they keep focus.
    - Every page is a `Section tone='light'` (dark focus ring); the navbar keeps the yellow one.
- **Tests:**
    - Render with the admin routes and stub `fetch`. Each admin test file clears the cache and collapsed cards between tests (`clearCache()`, `resetCollapsed()`).
    - Sections are reached through the menu (`src/admin/__tests__/menu.ts`). Wait for a card's region, not its heading, since the skeleton has the same headings.
    - Testing Library waits up to 3 s (`src/test/setup.ts`).

## Conventions

- Named exports with arrow-function components (`export const Foo = () => …`).
- Relative imports with explicit `.ts`/`.tsx` extensions inside a component folder; barrels (`'../../ui'`) across folders.
- Join conditional classes with `clsx`, not `${cond && 'class'}`.
- Text links have one style, on dark and light sections alike: a yellow marker stroke at rest that rises to fill the link on hover or focus (on dark, the text turns dark as it fills). Use `TextLink` or `MoreLink` (both built on `markerLink`), or the `link-highlight link-marked` utilities in `index.css` for links inside running text (a slim yellow underline that the yellow sweeps across on hover). Never a dark or plain underline. Navigation (menu, navbar, footer, breadcrumbs), buttons and cards have their own styles.
- Buttons, text links and footer links roll their label on hover or focus (links inside running text don't, so they can wrap): wrap the text in `RollingText` and mark the link or button `group`. The rolling copy is `aria-hidden` and added only in the browser (`useHydrated` in `src/lib`), so names are read once and the pre-rendered HTML has each label once (`prerender.test.tsx` checks). Never give a rolling link an `aria-label`: its visible text must be in its name (WCAG 2.5.3); use `sr-only` text for extra context, as the footer's legal links do.
- Form fields go inside `FieldWrapper`, which wraps them in their `<label>`; forms get a `Honeypot`.
- With react-hook-form, read live values with `useWatch`, not `watch` (the React Compiler skips components that call `watch`).
- Policies are drafts until reviewed; never present them as legal advice.
- Branching: `feat/*`, `fix/*` and `chore/*` branch from `develop` and go back into `develop` via PR.
