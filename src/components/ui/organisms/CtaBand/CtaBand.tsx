import { Button, Section } from '../../atoms';
import { SectionIntro } from '../../molecules';
import type { CtaBandProps } from './types.ts';

/** The closing call to action of a page: a big question, a line, and one button. */
export const CtaBand = ({ title, lede, action, tone = 'dark' }: CtaBandProps) => (
    <Section tone={tone} innerClassName='items-center'>
        <SectionIntro title={title} lede={lede} tone={tone} align='center' />
        <Button type='internal-link' to={action.to} label={action.label} className='self-center' />
    </Section>
);
