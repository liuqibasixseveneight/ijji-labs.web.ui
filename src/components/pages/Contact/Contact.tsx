import { contactCopy, pageMeta } from '../../../content';
import { ContactForm, PageHero, PageMeta, Section, StructuredData } from '../../ui';
import * as ld from '../../../content/structuredData.ts';

export const Contact = () => (
    <>
        <PageMeta {...pageMeta.contact} />
        <StructuredData
            data={ld.webPage(
                pageMeta.contact.path,
                'Contact ijji labs',
                pageMeta.contact.description,
                'ContactPage',
            )}
        />

        <PageHero title={contactCopy.hero.title} lede={[...contactCopy.hero.lede]} />

        <Section tone='light' spacing='md' labelledBy='contact-form-title'>
            <div className='flex flex-col lg:flex-row gap-16 lg:gap-24'>
                <div className='flex-1'>
                    <h2 id='contact-form-title' className='text-2xl font-semibold mb-10'>
                        Send us a message
                    </h2>
                    <ContactForm />
                </div>

                <aside
                    aria-label='What to expect'
                    className='lg:max-w-xs w-full flex flex-col divide-y divide-neutral-200 self-start lg:pt-13'
                >
                    {contactCopy.expectations.map(({ title, description }) => (
                        <div key={title} className='py-8 flex flex-col gap-2'>
                            <h3 className='text-base font-semibold'>{title}</h3>
                            <p className='text-base text-neutral-500 leading-relaxed'>
                                {description}
                            </p>
                        </div>
                    ))}
                </aside>
            </div>
        </Section>
    </>
);
