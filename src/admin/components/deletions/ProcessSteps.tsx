import { site } from '../../../content/site.ts';
import { STEPS } from './steps.ts';

/** The process at a glance, above the board: four numbered steps and the deadline. */
export const ProcessSteps = () => (
    <section aria-labelledby='process-title' className='mb-10'>
        <h2 id='process-title' className='sr-only'>
            How to handle a request
        </h2>
        <ol className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            {STEPS.map((step, index) => (
                <li key={step.title} className='flex gap-3 bg-neutral-100 rounded-xl p-4'>
                    <span
                        aria-hidden='true'
                        className='shrink-0 w-8 h-8 rounded-full bg-ui-background-primary text-brand-primary font-extrabold flex items-center justify-center'
                    >
                        {index + 1}
                    </span>
                    <span className='flex flex-col gap-1'>
                        <span className='font-bold'>{step.title}</span>
                        <span className='text-sm text-neutral-600'>{step.description}</span>
                    </span>
                </li>
            ))}
        </ol>
        <p className='text-sm text-neutral-600 mt-3'>
            Every request has to be finished {site.deletionTime} of arriving.
        </p>
    </section>
);
