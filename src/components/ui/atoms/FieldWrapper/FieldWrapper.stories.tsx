import type { Meta, StoryObj } from '@storybook/react-vite';

import { SelectInput } from '../SelectInput';
import { TextareaInput } from '../TextareaInput';
import { TextInput } from '../TextInput';
import { FieldWrapper } from './FieldWrapper.tsx';

/** A labelled form field: the label wraps the input, and an error shows underneath. */
const meta = {
    title: 'Atoms/Field',
    component: FieldWrapper,
    args: { label: 'Your name', children: <TextInput placeholder='Jane Smith' /> },
    decorators: [
        (Story) => (
            <div className='max-w-md'>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof FieldWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Text: Story = {};

export const Required: Story = { args: { required: true } };

export const WithError: Story = {
    args: { required: true, error: 'Name must be at least 2 characters' },
};

export const Select: Story = {
    args: {
        label: 'Project type',
        required: true,
        children: (
            <SelectInput defaultValue=''>
                <option value='' disabled>
                    Select a project type
                </option>
                <option>New website project</option>
                <option>Website redesign</option>
            </SelectInput>
        ),
    },
};

export const Textarea: Story = {
    args: {
        label: 'Message',
        required: true,
        children: <TextareaInput rows={5} placeholder='Tell us about your project...' />,
    },
};
