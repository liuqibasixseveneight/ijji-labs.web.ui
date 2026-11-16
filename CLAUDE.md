# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

The ijji labs marketing site: React 19 + React Router 7 (data router) + Tailwind 4 on Vite 8, with the React Compiler (Babel preset in `vite.config.ts`). Deployed on Netlify; `netlify/functions/contact` emails enquiries via Resend. UK English in copy.

## Commands

```bash
npm run dev               # vite
npm run build             # tsc -b && vite build
npm run lint              # eslint
npm run typecheck         # tsc -b (app, tooling, netlify function, docs tests)
npm run format            # prettier --write (4 spaces, single quotes incl. JSX, width 100, LF)
npm test                  # vitest run
npm run test:coverage     # with thresholds (what CI runs)
npx vitest run path/to/file.test.tsx   # one file
npx vitest run -t 'name of test'       # one test by name
npm run storybook         # storybook dev on :6006
```

## Architecture

- `src/router/routes.tsx` is the route table: one `RootLayout` (navbar, `<Outlet>`, footer) with a child per page and a `*` catch-all (`NotFound`). `router.tsx` wraps it in `createBrowserRouter`; tests and Storybook use the same `routes` with a memory router.
- Components follow atomic design: `components/ui/{atoms,molecules,organisms}`, each component in its own folder with `Name.tsx`, `types.ts`, `index.ts` (barrel). Pages are `components/pages/<Page>/<Page>.tsx` composed of sections in `modules/`. Copy used by more than one page lives in `src/content/`.
- Home's hero (`FluidGradient`) is WebGL (three.js). Its palette choice flows up through `RootLayout` (`handlePaletteChange` via outlet context) so the navbar can turn white over dark palettes.
- `netlify.toml` serves `index.html` for every path (SPA fallback). Don't remove it: deep links and refreshes would 404.
- Every top-level file in `netlify/functions/` deploys as a function. Put helpers in the function's own folder (`netlify/functions/contact/`), not beside it.
- The contact function validates with the same zod schema as the form (`ContactForm/schema.ts`) and HTML-escapes everything it puts in the email.

## Tests, stories and the site map

- Vitest + Testing Library (jsdom). `src/test/renderApp.tsx` renders the whole site at a path with the real routes; use it for anything about navigation.
- `src/router/__tests__/routes.test.tsx`: every page renders with one h1, navbar and footer; every in-page `#link` has a target; images have alt text; unknown paths show Page not found. Add new pages to its `PAGES`.
- `src/router/__tests__/journeys.test.tsx`: every menu, footer, navbar and in-page link clicks through to the right page. When a page gains a link, add it here and to the site map.
- `docs/screen-map/` is the site map (open `index.html`). Update `screens.js` in the same change as any navigation change; `docs/screen-map/__tests__/screenMap.test.ts` fails when routes, the menu or the footer drift from it.
- Storybook (`@storybook/react-vite`): stories sit beside components (`*.stories.tsx`). `Screens` renders each full page via the real routes (`parameters: { router: false }` skips the global MemoryRouter decorator).
- Coverage thresholds are in `vite.config.ts`. The React Compiler adds memo branches, so lines and functions are the meaningful numbers. `FluidGradient/utils` (WebGL) is excluded.

## Conventions

- Named exports with arrow-function components (`export const Foo = () => …`).
- Relative imports with explicit `.ts`/`.tsx` extensions inside a component folder; barrels (`'../../ui'`) across folders.
- Join conditional classes with `clsx`, not `${cond && 'class'}` (which leaves `false` in the class list).
- Form fields go inside `FieldWrapper`, which wraps them in their `<label>`.
- Branching: `feat/*`, `fix/*` into `master` via PR.
