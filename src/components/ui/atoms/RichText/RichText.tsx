import { Fragment } from 'react';
import { Link } from 'react-router-dom';

import type { RichTextProps } from './types.ts';

const linkClasses =
    'underline underline-offset-4 decoration-1 hover:decoration-2 hover:text-ui-background-primary transition-colors';

/** Renders content text: plain strings, links (in-site, email or external) and bold runs. */
export const RichText = ({ text }: RichTextProps) => (
    <>
        {text.map((part, index) => {
            if (typeof part === 'string') return <Fragment key={index}>{part}</Fragment>;

            if ('strong' in part) {
                return (
                    <strong key={index} className='font-semibold text-neutral-900'>
                        {part.strong}
                    </strong>
                );
            }

            if (part.href.startsWith('/')) {
                return (
                    <Link key={index} to={part.href} className={linkClasses}>
                        {part.text}
                    </Link>
                );
            }

            const external = part.href.startsWith('http');

            return (
                <a
                    key={index}
                    href={part.href}
                    className={linkClasses}
                    {...(external && { target: '_blank', rel: 'noreferrer' })}
                >
                    {part.text}
                    {external && <span className='sr-only'> (opens in a new tab)</span>}
                </a>
            );
        })}
    </>
);
