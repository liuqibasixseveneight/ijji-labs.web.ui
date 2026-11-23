import { createEvent, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { scrollToHash } from './smoothScroll.ts';

const setUp = (href: string) => {
    const link = document.createElement('a');
    link.href = href;
    link.addEventListener('click', (event) =>
        scrollToHash(event as unknown as Parameters<typeof scrollToHash>[0]),
    );
    const section = document.createElement('section');
    section.id = 'our-story';
    document.body.append(link, section);
    return { link, section };
};

describe('scrollToHash', () => {
    const scrollIntoView = vi.fn();

    beforeEach(() => {
        Element.prototype.scrollIntoView = scrollIntoView;
        window.matchMedia = vi.fn().mockReturnValue({ matches: false });
        window.history.replaceState({ idx: 3 }, '', '/about');
    });

    afterEach(() => {
        document.body.innerHTML = '';
        scrollIntoView.mockReset();
    });

    it('glides to the section, puts its hash in the address and focuses it', () => {
        const { link, section } = setUp('#our-story');
        const click = createEvent.click(link, { button: 0 });

        fireEvent(link, click);

        expect(click.defaultPrevented).toBe(true);
        expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
        expect(window.location.hash).toBe('#our-story');
        expect(window.history.state).toEqual({ idx: 3 });
        expect(section).toHaveAttribute('tabindex', '-1');
        expect(section).toHaveFocus();
    });

    it('leaves a modified click to the browser, as for a new tab', () => {
        const { link } = setUp('#our-story');
        const click = createEvent.click(link, { button: 0, metaKey: true });

        fireEvent(link, click);

        expect(click.defaultPrevented).toBe(false);
        expect(scrollIntoView).not.toHaveBeenCalled();
    });

    it('leaves a link whose section is not on the page to the browser', () => {
        const { link } = setUp('#nowhere');
        const click = createEvent.click(link, { button: 0 });

        fireEvent(link, click);

        expect(click.defaultPrevented).toBe(false);
        expect(scrollIntoView).not.toHaveBeenCalled();
    });
});
