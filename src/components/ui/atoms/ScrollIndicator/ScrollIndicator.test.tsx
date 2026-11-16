import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ScrollIndicator } from './ScrollIndicator.tsx';

const scrollTo = (y: number) =>
    act(() => {
        Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
        window.dispatchEvent(new Event('scroll'));
    });

describe('ScrollIndicator', () => {
    it('fades out once the page is scrolled, and back at the top', () => {
        render(<ScrollIndicator isGradientDark={false} />);
        const indicator = () => screen.getByText('Scroll to explore').parentElement!;

        expect(indicator()).toHaveClass('opacity-100');

        scrollTo(200);
        expect(indicator()).toHaveClass('opacity-0');

        scrollTo(0);
        expect(indicator()).toHaveClass('opacity-100');
    });
});
