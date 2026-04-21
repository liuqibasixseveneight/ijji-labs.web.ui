import { useState } from 'react';

import type { AccordionProps } from './types.ts';
import { AccordionItem } from '../../molecules';

export const Accordion = ({ items }: AccordionProps) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className='flex flex-col divide-y divide-neutral-200'>
            {items.map((item, index) => (
                <AccordionItem
                    key={index}
                    question={item.question}
                    answer={item.answer}
                    isOpen={openIndex === index}
                    onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                />
            ))}
        </div>
    );
};
