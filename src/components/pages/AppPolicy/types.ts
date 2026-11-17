import type { AppEntry } from '../../../content/types.ts';

export interface AppPolicyProps {
    /** Which of the app's documents this page shows. */
    kind: keyof AppEntry['policies'];
}
