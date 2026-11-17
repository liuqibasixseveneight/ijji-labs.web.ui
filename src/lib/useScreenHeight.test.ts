import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resetScreenHeight, useScreenHeight } from './useScreenHeight.ts';

const original = { width: window.innerWidth, height: window.innerHeight };

const resize = (width: number, height: number) =>
    act(() => {
        Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: height, configurable: true });
        window.dispatchEvent(new Event('resize'));
    });

describe('useScreenHeight', () => {
    beforeEach(() => resetScreenHeight());
    afterEach(() => resize(original.width, original.height));

    it('is the visible height when the page opens', () => {
        resize(390, 664);
        const { result } = renderHook(() => useScreenHeight());

        expect(result.current).toBe(664);
    });

    it("holds steady while the browser's toolbars slide away (only the height changes)", () => {
        resize(390, 664);
        const { result } = renderHook(() => useScreenHeight());

        resize(390, 750);

        expect(result.current).toBe(664);
    });

    it('measures again when the phone rotates (the width changes)', () => {
        resize(390, 664);
        const { result } = renderHook(() => useScreenHeight());

        resize(844, 340);

        expect(result.current).toBe(340);
    });
});
