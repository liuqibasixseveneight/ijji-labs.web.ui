import axe from 'axe-core';

/**
 * Accessibility problems axe finds in `container`, as short readable lines. jsdom has no
 * layout, so checks that need one (colour contrast) are left to Storybook's a11y panel.
 */
export const axeViolations = async (container: Element) => {
    const results = await axe.run(container, {
        rules: {
            'color-contrast': { enabled: false },
            // A rendered fragment, not a whole document.
            region: { enabled: false },
        },
    });

    return results.violations.map(
        (violation) =>
            `${violation.id}: ${violation.help} (${violation.nodes
                .map((node) => node.target.join(' '))
                .join(', ')})`,
    );
};
