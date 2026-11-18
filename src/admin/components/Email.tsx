import { Fragment } from 'react';

/**
 * An email address that wraps tidily on narrow screens: it may break after the @ and after
 * each dot (and, for one very long part, anywhere), never in the middle of a word first.
 */
export const Email = ({ address }: { address: string }) => (
    <span className='[overflow-wrap:anywhere]'>
        {address.split(/(?<=[@.])/).map((part, index) => (
            <Fragment key={index}>
                {index > 0 && <wbr />}
                {part}
            </Fragment>
        ))}
    </span>
);
