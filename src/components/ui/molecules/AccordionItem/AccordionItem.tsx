import type { AccordionItemProps } from './types.ts';

export const AccordionItem = ({ question, answer, isOpen, onToggle }: AccordionItemProps) => (
    <div>
        <button
            onClick={onToggle}
            className='w-full text-left py-6 flex items-center justify-between gap-6 group cursor-pointer'
            aria-expanded={isOpen}
        >
            <span className='text-lg font-medium text-ui-background-primary group-hover:text-neutral-600 transition-colors'>
                {question}
            </span>
            <span
                className={`shrink-0 w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 transition-transform duration-300 ${
                    isOpen ? 'rotate-45' : ''
                }`}
                aria-hidden='true'
            >
                <svg
                    width='12'
                    height='12'
                    viewBox='0 0 12 12'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                >
                    <path
                        d='M6 1V11M1 6H11'
                        stroke='currentColor'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                    />
                </svg>
            </span>
        </button>

        <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-96 pb-6' : 'max-h-0'
            }`}
        >
            <div className='text-base text-neutral-600 leading-relaxed max-w-2xl'>{answer}</div>
        </div>
    </div>
);
