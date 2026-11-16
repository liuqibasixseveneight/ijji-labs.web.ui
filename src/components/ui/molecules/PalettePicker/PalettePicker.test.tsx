import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PalettePicker } from './PalettePicker.tsx';

describe('PalettePicker', () => {
    it('offers every palette, light ones first, and marks the active one', () => {
        render(<PalettePicker activeKey='pearl' onChange={vi.fn()} />);

        const swatches = screen.getAllByRole('button');
        expect(swatches.map((s) => s.getAttribute('aria-label'))).toEqual([
            'Silk',
            'Pearl',
            'Solar',
            'Dusk',
            'Steel',
            'Arrakis',
        ]);
        expect(screen.getByRole('button', { name: 'Pearl' })).toHaveAttribute(
            'aria-pressed',
            'true',
        );
    });

    it('names a swatch on hover, and reports the one chosen', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<PalettePicker activeKey='silk' onChange={onChange} />);

        await user.hover(screen.getByRole('button', { name: 'Steel' }));
        expect(screen.getByText('Steel', { selector: 'div' })).toBeVisible();

        await user.click(screen.getByRole('button', { name: 'Steel' }));
        expect(onChange).toHaveBeenCalledWith('steel');

        await user.unhover(screen.getByRole('button', { name: 'Steel' }));
        expect(screen.queryByText('Steel', { selector: 'div' })).not.toBeInTheDocument();
    });
});
