import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

import { signOut } from '../api.ts';
import { adminPaths } from '../paths.ts';

/** Ends every session signed in so far (on every device), then back to sign in. */
export const SignOutEverywhere = ({ className }: { className?: string }) => {
    const navigate = useNavigate();

    return (
        <button
            type='button'
            onClick={async () => {
                await signOut({ everywhere: true });
                navigate(adminPaths.signIn, { replace: true });
            }}
            // Styled where it's used: as a text link on the Overview, as a header control.
            className={clsx('text-sm cursor-pointer', className)}
        >
            Sign out everywhere
        </button>
    );
};
