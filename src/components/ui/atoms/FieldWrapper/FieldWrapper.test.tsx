import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TextInput } from '../TextInput/TextInput.tsx';
import { FieldWrapper } from './FieldWrapper.tsx';

describe('FieldWrapper', () => {
    it('names the field by its label, and marks it required without reading the asterisk', () => {
        render(
            <FieldWrapper label='Your name' required>
                <TextInput />
            </FieldWrapper>,
        );

        const field = screen.getByRole('textbox', { name: 'Your name' });
        expect(field).toHaveAttribute('aria-required', 'true');
        expect(field).not.toHaveAttribute('aria-invalid');
        expect(field).not.toHaveAccessibleDescription();
    });

    it('marks the field invalid and points it at the error, which is announced', () => {
        render(
            <FieldWrapper label='Email address' error='Please enter a valid email address'>
                <TextInput />
            </FieldWrapper>,
        );

        const field = screen.getByRole('textbox', { name: 'Email address' });
        expect(field).toHaveAttribute('aria-invalid', 'true');
        expect(field).toHaveAccessibleDescription('Please enter a valid email address');
        expect(screen.getByRole('alert')).toHaveTextContent('Please enter a valid email address');
    });
});
