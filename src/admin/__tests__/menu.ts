import { fireEvent, screen, within } from '@testing-library/react';

/**
 * Opens the dashboard's menu, as the site's: the sections are in it, behind the menu button.
 * Waits for the page first (the menu closes as a page opens, so opening it mid-load would see
 * it shut again), then for the menu. Returns the sections' list, and the whole menu (its
 * footer has sign-out).
 */
export const openMenu = async () => {
    await screen.findByRole('heading', { level: 1 });
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    const sections = await screen.findByRole('navigation', { name: 'Admin sections' });
    return {
        sections: within(sections),
        menu: within(document.getElementById('admin-menu')!),
    };
};

/**
 * A section's link in the menu, by its label ("Website"). Its full name also has the row's
 * number and description ("01Website Uptime, Lighthouse, deploys"), so this matches within it.
 */
export const sectionLink = async (name: string) =>
    (await openMenu()).sections.getByRole('link', { name: new RegExp(name) });
