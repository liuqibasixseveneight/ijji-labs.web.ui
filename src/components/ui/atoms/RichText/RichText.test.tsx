import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { RichText } from './RichText.tsx';

const renderText = (text: Parameters<typeof RichText>[0]['text']) =>
    render(
        <MemoryRouter>
            <p>
                <RichText text={text} />
            </p>
        </MemoryRouter>,
    );

describe('RichText', () => {
    it('renders plain text and bold runs', () => {
        const { container } = renderText(['Read ', { strong: 'this' }, ' first.']);

        expect(container.querySelector('p')).toHaveTextContent('Read this first.');
        expect(screen.getByText('this').tagName).toBe('STRONG');
    });

    it('routes in-site links, and gives every link the marker style', () => {
        renderText(['See ', { text: 'our privacy policy', href: '/privacy' }, '.']);

        const link = screen.getByRole('link', { name: 'our privacy policy' });
        expect(link).toHaveAttribute('href', '/privacy');
        expect(link).not.toHaveAttribute('target');
        expect(link).toHaveClass('link-highlight', 'link-marked');
    });

    it('opens email links in place', () => {
        renderText([{ text: 'support@ijji-labs.com', href: 'mailto:support@ijji-labs.com' }]);

        const link = screen.getByRole('link', { name: 'support@ijji-labs.com' });
        expect(link).toHaveAttribute('href', 'mailto:support@ijji-labs.com');
        expect(link).not.toHaveAttribute('target');
    });

    it('opens other sites in a new tab, and says so to screen readers', () => {
        renderText([{ text: 'the ICO', href: 'https://ico.org.uk' }]);

        // jsdom trims the space before the hidden note; browsers keep it.
        const link = screen.getByRole('link', { name: /^the ICO\s*\(opens in a new tab\)$/ });
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noreferrer');
    });
});
