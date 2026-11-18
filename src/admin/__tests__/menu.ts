import { fireEvent, screen, within } from '@testing-library/react';

/**
 * Opens the dashboard's menu, as the site's: the sections are in it, behind the menu button.
 * Returns the sections' list, and the whole menu (its footer has sign-out).
 */
export const openMenu = async () => {
    fireEvent.click(await screen.findByRole('button', { name: 'Open menu' }));
    return {
        sections: within(screen.getByRole('navigation', { name: 'Admin sections' })),
        menu: within(document.getElementById('admin-menu')!),
    };
};

/**
 * A section's link in the menu, by its label ("Website"). Its full name also has the row's
 * number and description ("01Website Uptime, Lighthouse, deploys"), so this matches within it.
 */
export const sectionLink = async (name: string) =>
    (await openMenu()).sections.getByRole('link', { name: new RegExp(name) });
