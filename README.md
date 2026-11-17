# ijji labs website

The site for ijji labs, a small studio in Leeds that designs and builds websites for clients, and makes apps of its own. It also hosts the pages the App Store and Google Play require for our apps: privacy policy, terms, support and account deletion.

React 19, React Router 7, Tailwind 4 and Vite 8, with the React Compiler. Every page is pre-rendered to static HTML at build time. Hosted on Netlify, where two functions email the studio through Resend.

## Getting started

```bash
npm install
npm run dev            # http://localhost:5173
```

The forms post to Netlify functions (`/.netlify/functions/contact` and `/.netlify/functions/account-deletion`), which `npm run dev` doesn't run, so the forms get a 404 there. To try them locally, run `npm run preview:netlify` (it builds first) and open http://localhost:8888, with these set in `.env`:

| Variable             | What it is                                     |
| -------------------- | ---------------------------------------------- |
| `RESEND_API_KEY`     | Resend API key                                 |
| `CONTACT_EMAIL_FROM` | The verified sender, e.g. `site@ijji-labs.com` |
| `CONTACT_EMAIL_TO`   | Where messages and deletion requests go        |

## Scripts

| Command                   | Does                                                                     |
| ------------------------- | ------------------------------------------------------------------------ |
| `npm run dev`             | Vite dev server (no functions: the forms 404)                            |
| `npm run preview:netlify` | Build, then serve as Netlify does, with the functions, on :8888          |
| `npm run build`           | Typecheck, build, and pre-render every page, 404, sitemap and robots.txt |
| `npx vite preview`        | Serve the built `dist/`                                                  |
| `npm run lint`            | ESLint                                                                   |
| `npm run typecheck`       | `tsc -b` over the app, tooling and Netlify functions                     |
| `npm run format`          | Prettier, in place (`format:check` to only check)                        |
| `npm test`                | Vitest, once (`test:watch` to keep running)                              |
| `npm run test:coverage`   | Tests with coverage thresholds, as CI runs them                          |
| `npm run images`          | Remake the responsive photos (AVIF/WebP) from `src/assets/images`        |
| `npm run brand-images`    | Remake the social preview, logo and touch icon in `public/`              |
| `npm run storybook`       | Storybook on http://localhost:6006                                       |
| `npm run build-storybook` | Static Storybook in `storybook-static/`                                  |

CI (`.github/workflows/ci.yml`) runs format, lint, typecheck, tests with coverage, and both builds on every PR.

## Performance, accessibility and search

Measured with Lighthouse (mobile) on the built site: accessibility, best practices and SEO 100 on every page, performance 96–100 on mobile and 100 on desktop, no layout shift. Photos are served as AVIF/WebP at the size each screen needs; three.js loads only on the home page; fonts are self-hosted; pages are pre-rendered; and `netlify.toml` sets a strict Content-Security-Policy and long caching for built assets. Every page describes itself with schema.org structured data, and the build writes `/llms.txt` and `/llms-full.txt` so AI assistants can describe the studio and its apps accurately. See CLAUDE.md for the rules that keep it that way.

## Changing content

Everything visitors read is in `src/content/`:

- **Studio facts** (`site.ts`): contact email, reply time, the data controller, deletion and backup periods. Change a promise here and it changes everywhere.
- **Pages** (`pages.ts`, `services.ts`, `projects.ts`, …): copy and each page's title and description.
- **Photos**: put the original in `src/assets/images/`, run `npm run images`, and export it from `src/assets/images/index.ts`.
- **Apps** (`apps.ts`): one entry per app, with its icon (copy the app's 1024px `icon.png` to `src/assets/images/apps/<slug>.png`, run `npm run images` and add it to `appIcons` in `src/assets/images/index.ts`), a `description` of 160 characters at most for search results. An entry gets its own page at `/apps/<slug>`, four policy pages, footer links and a sitemap entry. Add store links to `platforms` when an app goes live.
- **Policies** (`policies/`): structured documents. Move `effectiveDate` whenever one changes, and have changes reviewed: they are not legal advice.

**Never change an app's slug or its policy URLs** once they're in a store listing. A test pins them.

## Site map

`docs/screen-map/` maps every page, how people reach it, every link on it and the key journeys, with review notes. It loads `screens.js`, so serve the folder (e.g. `npx serve docs/screen-map`) and open it in a browser. Keep `screens.js` current with navigation changes; a test checks it against the routes, menu and footer.

## Layout

```
src/
  components/
    ui/          atoms → molecules → organisms (shared building blocks)
    templates/   RootLayout: skip link, navbar, page outlet, footer
    pages/       one folder per route
  content/       everything visitors read, typed
  router/        paths.ts, routes.tsx (the route table), router.tsx (the browser router)
  entry-server.tsx   renders a path to HTML for the pre-render
  test/          test setup, renderApp() and axe
scripts/prerender.mjs        writes the static pages after the build
netlify/functions/           contact and account-deletion
netlify/shared/              code both functions share
docs/screen-map/             the site map
```
