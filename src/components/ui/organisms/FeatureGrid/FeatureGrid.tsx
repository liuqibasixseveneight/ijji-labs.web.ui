import { InfoCard } from '../../molecules';
import type { FeatureGridProps } from './types.ts';

/** What an app does, as numbered cards (the same cards as the studio's values). */
export const FeatureGrid = ({ features }: FeatureGridProps) => (
    <ul className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
        {features.map((feature, index) => (
            <li key={feature.title}>
                <InfoCard
                    number={String(index + 1).padStart(2, '0')}
                    title={feature.title}
                    description={feature.description}
                />
            </li>
        ))}
    </ul>
);
