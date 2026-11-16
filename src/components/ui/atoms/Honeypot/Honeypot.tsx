import type { HoneypotProps } from './types.ts';

/**
 * A field people never see or reach, named to tempt bots. The Netlify functions drop any
 * post that fills it in, quietly, so the bot thinks it worked.
 */
export const Honeypot = (props: HoneypotProps) => (
    <div aria-hidden='true' className='absolute -left-[9999px] w-px h-px overflow-hidden'>
        <label>
            Website
            <input type='text' tabIndex={-1} autoComplete='off' {...props} />
        </label>
    </div>
);
