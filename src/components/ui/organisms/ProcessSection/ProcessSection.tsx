import { processSteps } from '../../../../content/processSteps.ts';
import { Section } from '../../atoms';
import { SectionIntro } from '../../molecules';
import { ProcessTable } from '../ProcessTable';
import type { ProcessSectionProps } from './types.ts';

/** The eight-step process, shared by Home, Services and Projects. */
export const ProcessSection = ({ id }: ProcessSectionProps) => (
    <Section id={id} tone='light' labelledBy='process-title'>
        <SectionIntro
            id='process-title'
            tone='light'
            title='Our process'
            lede='Every website follows the same eight steps — so you always know where you are, what comes next, and why.'
        />
        <ProcessTable steps={processSteps} />
    </Section>
);
