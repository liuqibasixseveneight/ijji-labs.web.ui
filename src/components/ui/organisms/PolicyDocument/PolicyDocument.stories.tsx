import type { Meta, StoryObj } from '@storybook/react-vite';

import { apps, websitePrivacy } from '../../../../content';
import { paths } from '../../../../router/paths.ts';
import { DeletionRequestForm } from '../DeletionRequestForm';
import { PolicyDocument } from './PolicyDocument.tsx';

const tracker = apps[0];
const to = paths.app(tracker.slug);

/**
 * A policy, terms or support page. Print it (Ctrl/Cmd + P) to see the print view: the
 * navbar, footer, breadcrumb and contents list are left out.
 */
const meta = {
    title: 'Organisms/PolicyDocument',
    component: PolicyDocument,
    parameters: { layout: 'fullscreen' },
    args: {
        document: tracker.policies.privacy,
        breadcrumb: [
            { label: 'Apps', to: paths.apps },
            { label: tracker.name, to: to.root },
            { label: 'Privacy policy', to: to.privacy },
        ],
    },
} satisfies Meta<typeof PolicyDocument>;

export default meta;

type Story = StoryObj<typeof meta>;

/** With tables, lists, a note and links. */
export const Privacy: Story = {};

export const Terms: Story = { args: { document: tracker.policies.terms } };

/** Questions and answers under each heading. */
export const Support: Story = { args: { document: tracker.policies.support } };

/** The deletion page, with the request form inside "Without the app". */
export const Deletion: Story = {
    args: {
        document: tracker.policies.deletion,
        after: { 'without-the-app': <DeletionRequestForm app={tracker} /> },
    },
};

/** The website's own policy, without a breadcrumb. */
export const WebsitePrivacy: Story = {
    args: { document: websitePrivacy, breadcrumb: undefined },
};
