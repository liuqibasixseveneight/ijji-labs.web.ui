import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { MoreLink } from '../MoreLink/MoreLink.tsx';
import { TextLink } from '../TextLink/TextLink.tsx';
import { RollingText } from './RollingText.tsx';

const inRouter = (ui: React.ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('RollingText', () => {
    it('shows the text, plus a copy to roll in that screen readers skip', () => {
        const { container } = render(
            <a href='/x' className='group'>
                <RollingText rollInClassName='text-dark'>Hello</RollingText>
            </a>,
        );

        expect(screen.getByRole('link', { name: 'Hello' })).toBeInTheDocument();
        const [shown, copy] = container.querySelectorAll('a > span > span');
        expect(shown).toHaveTextContent('Hello');
        expect(shown).not.toHaveAttribute('aria-hidden');
        expect(copy).toHaveTextContent('Hello');
        expect(copy).toHaveAttribute('aria-hidden', 'true');
        expect(copy).toHaveClass('text-dark');
    });
});

describe('TextLink', () => {
    it('is named once, rolls, and takes the section’s tone', () => {
        inRouter(
            <>
                <TextLink to='/contact'>just ask</TextLink>
                <TextLink to='/about' tone='light'>
                    about us
                </TextLink>
            </>,
        );

        const dark = screen.getByRole('link', { name: 'just ask' });
        const light = screen.getByRole('link', { name: 'about us' });
        expect(dark).toHaveAttribute('href', '/contact');
        expect(dark).toHaveClass('group', 'text-white');
        expect(light).toHaveClass('text-ui-background-primary');
        // The yellow fills on hover.
        expect(dark.className).toContain('hover:before:scale-y-100');
    });
});

describe('MoreLink', () => {
    it('is named once, and rolls its text and arrow without a hover fill', () => {
        inRouter(<MoreLink to='/services'>All services</MoreLink>);

        const link = screen.getByRole('link', { name: 'All services' });
        expect(link).toHaveAttribute('href', '/services');
        expect(link.className).not.toContain('hover:before:scale-y-100');

        const [row, copy] = link.querySelectorAll(':scope > span > span');
        expect(row.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
        expect(copy).toHaveAttribute('aria-hidden', 'true');
        expect(copy.querySelector('svg')).not.toBeNull();
    });

    it('is dark text on light sections', () => {
        inRouter(
            <MoreLink to='/about' tone='light'>
                More about us
            </MoreLink>,
        );

        expect(screen.getByRole('link', { name: 'More about us' })).toHaveClass(
            'text-ui-background-primary',
        );
    });
});
