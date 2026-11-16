# Site map

Every page on the ijji labs site, how people reach it, what they can click on it and where that leads, plus the key journeys through the site and points to review.

- **View it:** open `index.html` in a browser. Nothing to build or install.
- **Change it:** edit `screens.js`, the map's data. The comment at its top describes the format. `index.html` only draws it.
- **Keep it current:** update it in the same change as the site, whenever a route is added, moved or removed, or a page gains, loses or changes a link. Use the link's exact copy.

`__tests__/screenMap.test.ts` runs with the rest of the tests (`npm test`). It fails if a route in `src/router/routes.tsx` has no screen here, a screen points at a route that's gone, a link or journey names a screen that isn't on the map, or the menu and footer here differ from `navbarItems.ts` and `footerLinks.ts`. It can't see a new link between pages that are already mapped, so check those by hand; `src/router/__tests__/journeys.test.tsx` clicks through every mapped link for real.
