import { clsx } from 'clsx';

import { Section } from '../../atoms';
import { SectionIntro } from '../../molecules';
import type { TextSectionProps } from './types.ts';

/** A heading and a few paragraphs at reading width: Our story, Why independent? */
export const TextSection = ({
    id,
    title,
    paragraphs,
    tone = 'light',
    children,
}: TextSectionProps) => (
    <Section id={id} tone={tone} width='text' spacing='sm' labelledBy={id && `${id}-title`}>
        <SectionIntro id={id && `${id}-title`} title={title} tone={tone} size='heading' />
        <div className='flex flex-col gap-8'>
            {paragraphs.map((paragraph, index) => (
                <p key={index} className={clsx('text-xl', tone === 'dark' && 'text-white/70')}>
                    {paragraph}
                </p>
            ))}
        </div>
        {children && <div className='mt-10 flex flex-col'>{children}</div>}
    </Section>
);
