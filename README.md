# ijji labs website

The ijji labs studio site: React 19, React Router 7, Tailwind 4 and Vite 8, with the React Compiler. Hosted on Netlify, where one function (`netlify/functions/contact`) emails contact-form enquiries through Resend.

## Getting started

```bash
npm install
npm run dev            # http://localhost:5173
```

The contact form posts to `/.netlify/functions/contact`, which only runs under Netlify. To try it locally, run `npx netlify dev` with these set in `.env`:

| Variable             | What it is                                     |
| -------------------- | ---------------------------------------------- |
| `RESEND_API_KEY`     | Resend API key                                 |
| `CONTACT_EMAIL_FROM` | The verified sender, e.g. `site@ijji-labs.com` |
| `CONTACT_EMAIL_TO`   | Where enquiries go                             |

## Scripts

| Command                   | Does                                                |
| ------------------------- | --------------------------------------------------- |
| `npm run dev`             | Vite dev server                                     |
| `npm run build`           | Typecheck, then build to `dist/`                    |
| `npm run lint`            | ESLint                                              |
| `npm run typecheck`       | `tsc -b` over the app, tooling and Netlify function |
| `npm run format`          | Prettier, in place (`format:check` to only check)   |
| `npm test`                | Vitest, once (`test:watch` to keep running)         |
| `npm run test:coverage`   | Tests with coverage thresholds, as CI runs them     |
| `npm run storybook`       | Storybook on http://localhost:6006                  |
| `npm run build-storybook` | Static Storybook in `storybook-static/`             |

CI (`.github/workflows/ci.yml`) runs format, lint, typecheck, tests with coverage, and both builds on every PR.

## Site map

`docs/screen-map/index.html` maps every page, how people reach it, every link on it and the key journeys, with review notes. Open it in a browser. Its data is `docs/screen-map/screens.js`; keep it current with navigation changes (a test checks it against the routes).

## Layout

```
src/
  components/
    ui/          atoms → molecules → organisms (shared building blocks)
    templates/   RootLayout: navbar, page outlet, footer
    pages/       one folder per route; each page's sections live in its modules/
  content/       copy shared between pages (projects, values, process steps)
  router/        routes.tsx (the route table) and router.tsx (the browser router)
  test/          test setup and renderApp()
netlify/functions/contact/   the contact endpoint
docs/screen-map/             the site map
```
