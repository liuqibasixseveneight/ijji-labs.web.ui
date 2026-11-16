// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';

import { routes } from '../../../src/router/routes.tsx';

type Exit = { tap: string; kind: string; to?: string };
type Screen = { id: string; col: string; title: string; path?: string; exits: Exit[] };
type ScreenMap = {
    columns: { id: string }[];
    screens: Screen[];
    journeys: { title: string; steps: [string, string][] }[];
};

const KINDS = ['page', 'jump', 'menu', 'submit', 'auto', 'inplace', 'external'];

const dir = path.resolve(import.meta.dirname, '..');

/** Loads screens.js as the page does, where it sets `window.SCREEN_MAP`. */
const loadMap = (): ScreenMap => {
    const window: { SCREEN_MAP?: ScreenMap } = {};
    vm.runInNewContext(fs.readFileSync(path.join(dir, 'screens.js'), 'utf8'), { window });
    return window.SCREEN_MAP!;
};

/** Every path in the route table, as written on the map: '/', '/about', '*'. */
const routePaths = () =>
    routes[0].children!.map((route) => {
        if (route.index) return '/';
        return route.path === '*' ? '*' : `/${route.path}`;
    });

describe('the site map (docs/screen-map)', () => {
    const map = loadMap();
    const ids = new Set(map.screens.map((screen) => screen.id));

    it('has a screen for every route', () => {
        const mapped = new Set(map.screens.map((screen) => screen.path));

        // Add a screen to docs/screen-map/screens.js for each path listed here.
        expect(routePaths().filter((route) => !mapped.has(route))).toEqual([]);
    });

    it('only points at routes that exist', () => {
        const routes = new Set(routePaths());
        const stale = map.screens
            .filter((screen) => screen.path && !routes.has(screen.path))
            .map((screen) => `${screen.id}: ${screen.path}`);

        expect(stale).toEqual([]);
    });

    it('gives every screen its own id, in a column that exists', () => {
        const columns = new Set(map.columns.map((column) => column.id));

        expect(ids.size).toBe(map.screens.length);
        expect(map.screens.filter((s) => !columns.has(s.col)).map((s) => s.id)).toEqual([]);
    });

    it('links only to screens on the map, with a known kind', () => {
        const broken = map.screens.flatMap((screen) =>
            screen.exits
                .filter((exit) => !KINDS.includes(exit.kind) || (exit.to && !ids.has(exit.to)))
                .map((exit) => `${screen.id} → ${exit.tap}`),
        );

        expect(broken).toEqual([]);
    });

    it('walks journeys through screens on the map', () => {
        const unknown = map.journeys.flatMap((journey) =>
            journey.steps.filter(([id]) => !ids.has(id)).map(([id]) => `${journey.title}: ${id}`),
        );

        expect(unknown).toEqual([]);
    });

    it('lists the same menu and footer links as the site', async () => {
        const { navbarItems } =
            await import('../../../src/components/ui/organisms/Navbar/navbarItems.ts');
        const { footerLinks, legalLinks } =
            await import('../../../src/components/ui/organisms/Footer/footerLinks.ts');
        const byId = Object.fromEntries(map.screens.map((s) => [s.id, s]));
        // The map shows IJJI Tracker's pages; the routes are written for any app.
        const pathOf = (id?: string) =>
            id ? byId[id].path?.replace(':appSlug', 'ijji-tracker') : undefined;

        const menu = byId.menu.exits.filter((e) => e.kind === 'page').map((e) => pathOf(e.to));
        const footerExits = byId.footer.exits.filter((e) => pathOf(e.to) !== '/');
        const footer = footerExits.filter((e) => !e.tap.includes(':')).map((e) => pathOf(e.to));
        const legal = footerExits.filter((e) => e.tap.includes(':'));

        expect(menu).toEqual(navbarItems.map((item) => item.to));
        expect(footer).toEqual(footerLinks.map((link) => link.to));
        expect(legal.map((e) => [e.tap, pathOf(e.to)])).toEqual(
            legalLinks.flatMap(({ group, links }) =>
                links.map((link) => [`${group}: ${link.text}`, link.to]),
            ),
        );
    });
});
