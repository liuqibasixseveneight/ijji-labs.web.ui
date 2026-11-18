import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

import { RollingText } from '../../components/ui/atoms/RollingText/RollingText.tsx';
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
            // Styled where it's used (the menu's footer). Its label rolls, as the site's links do.
            className={clsx('group cursor-pointer', className)}
        >
            <RollingText>Sign out everywhere</RollingText>
        </button>
    );
};
