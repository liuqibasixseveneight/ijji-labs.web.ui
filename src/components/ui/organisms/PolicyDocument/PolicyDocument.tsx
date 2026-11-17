import { Link } from 'react-router-dom';

import type { PolicyBlock } from '../../../../content/types.ts';
import { RichText, Section } from '../../atoms';
import type { PolicyDocumentProps } from './types.ts';

const formatDate = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });

const Block = ({ block }: { block: PolicyBlock }) => {
    switch (block.type) {
        case 'paragraph':
            return (
                <p>
                    <RichText text={block.text} />
                </p>
            );
        case 'note':
            return (
                <p className='border-l-4 border-brand-primary bg-neutral-100 px-5 py-4 text-neutral-800'>
                    <RichText text={block.text} />
                </p>
            );
        case 'list':
            return (
                <ul className='list-disc pl-6 flex flex-col gap-2 marker:text-neutral-400'>
                    {block.items.map((item, index) => (
                        <li key={index}>
                            <RichText text={item} />
                        </li>
                    ))}
                </ul>
            );
        case 'table':
            return (
                <div className='overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0'>
                    <table className='w-full min-w-xl text-left text-base border-collapse'>
                        <thead>
                            <tr className='border-b border-neutral-300'>
                                {block.head.map((cell) => (
                                    <th
                                        key={cell}
                                        scope='col'
                                        className='py-3 pr-6 text-xs font-bold tracking-widest uppercase text-neutral-500'
                                    >
                                        {cell}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {block.rows.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className='border-b border-neutral-200 align-top'
                                >
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex} className='py-4 pr-6'>
                                            <RichText text={cell} />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
    }
};

/**
 * A policy, terms or support page: a dark header with the title, summary and effective
 * date, then a contents list and the sections on white, for easy reading and printing.
 */
export const PolicyDocument = ({ document, breadcrumb, after, children }: PolicyDocumentProps) => (
    <>
        <Section tone='dark' spacing='md'>
            {breadcrumb && (
                <nav aria-label='Breadcrumb' className='pt-[6svh] mb-6' data-print='hide'>
                    <ol className='flex flex-wrap items-center gap-2 text-sm text-white/50'>
                        {breadcrumb.map((crumb, index) => (
                            <li key={crumb.to} className='flex items-center gap-2'>
                                {index > 0 && <span aria-hidden='true'>/</span>}
                                <Link
                                    to={crumb.to}
                                    className='hover:text-brand-primary transition-colors'
                                >
                                    {crumb.label}
                                </Link>
                            </li>
                        ))}
                    </ol>
                </nav>
            )}

            <h1
                className={`text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 ${breadcrumb ? '' : 'pt-[6svh]'}`}
            >
                {document.title}
            </h1>
            <p className='text-xl text-white/60 max-w-2xl mb-6'>{document.summary}</p>
            <p className='text-sm text-white/60 uppercase tracking-widest'>
                Effective{' '}
                <time dateTime={document.effectiveDate}>{formatDate(document.effectiveDate)}</time>
            </p>
        </Section>

        <Section tone='light' width='text' spacing='md'>
            {document.sections.length > 2 && (
                <nav
                    aria-labelledby='contents-title'
                    className='mb-12 pb-10 border-b border-neutral-200'
                    data-print='hide'
                >
                    <h2
                        id='contents-title'
                        className='text-xs font-bold tracking-widest uppercase text-neutral-500 mb-4'
                    >
                        On this page
                    </h2>
                    <ol className='grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-base'>
                        {document.sections.map((section) => (
                            <li key={section.id}>
                                <a href={`#${section.id}`} className='link-highlight link-marked'>
                                    {section.heading}
                                </a>
                            </li>
                        ))}
                    </ol>
                </nav>
            )}

            <div className='flex flex-col gap-14 text-lg leading-relaxed text-neutral-700'>
                {document.sections.map((section) => (
                    <section
                        key={section.id}
                        id={section.id}
                        aria-labelledby={`${section.id}-title`}
                    >
                        <h2
                            id={`${section.id}-title`}
                            className='text-2xl md:text-3xl font-semibold text-ui-background-primary mb-6'
                        >
                            {section.heading}
                        </h2>

                        <div className='flex flex-col gap-5'>
                            {section.blocks.map((block, index) => (
                                <Block key={index} block={block} />
                            ))}
                        </div>

                        {section.faqs && (
                            <dl className='flex flex-col divide-y divide-neutral-200 border-y border-neutral-200'>
                                {section.faqs.map((faq) => (
                                    <div key={faq.question} className='py-6'>
                                        <dt className='font-semibold text-ui-background-primary mb-2'>
                                            {faq.question}
                                        </dt>
                                        <dd>
                                            <RichText text={faq.answer} />
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        )}

                        {after?.[section.id] && <div className='mt-8'>{after[section.id]}</div>}
                    </section>
                ))}
            </div>

            {children}
        </Section>
    </>
);
