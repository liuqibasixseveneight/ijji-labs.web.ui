import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Accordion } from './Accordion.tsx';

const items = [
    { question: 'How much?', answer: 'It depends.' },
    { question: 'How long?', answer: 'Six to twelve weeks.' },
];

describe('Accordion', () => {
    it('starts with every answer closed', () => {
        render(<Accordion items={items} />);

        for (const button of screen.getAllByRole('button')) {
            expect(button).toHaveAttribute('aria-expanded', 'false');
        }
    });

    it('opens one answer at a time, and closes it on a second press', async () => {
        const user = userEvent.setup();
        render(<Accordion items={items} />);
        const first = screen.getByRole('button', { name: 'How much?' });
        const second = screen.getByRole('button', { name: 'How long?' });

        await user.click(first);
        expect(first).toHaveAttribute('aria-expanded', 'true');

        await user.click(second);
        expect(first).toHaveAttribute('aria-expanded', 'false');
        expect(second).toHaveAttribute('aria-expanded', 'true');

        await user.click(second);
        expect(second).toHaveAttribute('aria-expanded', 'false');
    });
});
