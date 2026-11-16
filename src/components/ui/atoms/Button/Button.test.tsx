import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button.tsx';

describe('Button', () => {
    it('is a plain button by default, so it never submits a form by accident', async () => {
        const onClick = vi.fn();
        render(<Button label='Go' onClick={onClick} />);

        const button = screen.getByRole('button', { name: 'Go' });
        await userEvent.click(button);

        expect(button).toHaveAttribute('type', 'button');
        expect(onClick).toHaveBeenCalledOnce();
    });

    it('reads its label once: the copy that rolls in on hover is hidden from screen readers', () => {
        render(<Button label='Send message' />);

        const button = screen.getByRole('button', { name: 'Send message' });
        const copies = [...button.querySelectorAll('span span')];

        expect(copies.map((copy) => copy.textContent)).toEqual(['Send message', 'Send message']);
        expect(copies.map((copy) => copy.getAttribute('aria-hidden'))).toEqual([null, 'true']);
    });

    it('is disabled and says Sending... while loading', () => {
        render(<Button label='Send message' type='submit' isLoading />);

        const button = screen.getByRole('button', { name: 'Sending...' });
        expect(button).toBeDisabled();
        expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('as an internal link, routes without leaking its own props onto the element', () => {
        render(
            <MemoryRouter>
                <Button type='internal-link' to='/contact' label='Get in touch' cutSize={20} />
            </MemoryRouter>,
        );

        const link = screen.getByRole('link', { name: 'Get in touch' });
        expect(link).toHaveAttribute('href', '/contact');
        for (const attribute of ['type', 'label', 'cutsize', 'cutSize', 'isloading']) {
            expect(link).not.toHaveAttribute(attribute);
        }
    });
});
