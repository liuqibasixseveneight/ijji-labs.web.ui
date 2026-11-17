import { useFetcher } from 'react-router-dom';

import { adminPaths } from '../../paths.ts';
import { isClosing, STATUS_LABELS, type Status } from '../../deletionRequests.ts';

/**
 * Moves a request to another status (and/or adds a note), from the board or the request
 * panel. One shared fetcher, so both see the move in flight and any error. Closing a request
 * (Done, Rejected) asks first.
 */
export const useMove = () => {
    const fetcher = useFetcher<{ saved?: string; error?: string }>({ key: 'deletion-move' });

    const move = (
        id: string,
        status: Status,
        { note = '', from }: { note?: string; from?: Status } = {},
    ) => {
        if (
            isClosing(status) &&
            status !== from &&
            !window.confirm(`Mark this request as ${STATUS_LABELS[status].toLowerCase()}?`)
        ) {
            return false;
        }
        fetcher.submit(
            { id, status, note },
            { method: 'post', action: adminPaths.deletionRequests },
        );
        return true;
    };

    const pending =
        fetcher.state !== 'idle' && fetcher.formData
            ? {
                  id: String(fetcher.formData.get('id')),
                  status: String(fetcher.formData.get('status')) as Status,
              }
            : null;

    return { move, pending, error: fetcher.state === 'idle' ? fetcher.data?.error : undefined };
};
