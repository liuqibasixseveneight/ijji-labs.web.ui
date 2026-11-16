import type { AppEntry } from '../../../../content/types.ts';

export interface DeletionRequestFormProps {
    app: Pick<AppEntry, 'slug' | 'name'>;
}
