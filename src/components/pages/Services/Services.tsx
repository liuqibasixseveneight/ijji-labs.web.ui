import { servicesImageOne } from '../../../assets/images';
import { faqs, pageMeta, services } from '../../../content';
import { contactAbout } from '../../../router/paths.ts';
import {
    CtaBand,
    PageHero,
    PageMeta,
    ProcessSection,
    ServiceDetailBlock,
    StructuredData,
} from '../../ui';
import { ServicesFaq } from './modules';
import * as ld from '../../../content/structuredData.ts';

const LINKS = [
    { label: 'Websites', href: '#websites' },
    { label: 'Handover & Training', href: '#handover' },
    { label: 'Post-Launch Support', href: '#support' },
    { label: 'FAQ', href: '#faq' },
];

export const Services = () => (
    <>
        <PageMeta {...pageMeta.services} />
        <StructuredData
            data={ld.webPage(pageMeta.services.path, 'Services', pageMeta.services.description)}
        />
        <StructuredData data={ld.serviceCatalog(services)} />
        <StructuredData data={ld.servicesFaq(faqs)} />

        <PageHero
            title='Services'
            lede={[
                'We design and build websites for businesses that care about quality — based in Leeds, working across the UK.',
                'No account managers. No junior teams. You work directly with the people doing the work.',
            ]}
            links={LINKS}
            image={{ source: servicesImageOne, alt: 'Web design and development workspace' }}
        />

        {services.map((service, index) => (
            <ServiceDetailBlock key={service.id} service={service} index={index} />
        ))}

        <ProcessSection />
        <ServicesFaq />

        <CtaBand
            tone='light'
            title='Ready to start?'
            lede='Tell us about your website. We’ll arrange a short discovery call, then follow up with a clear proposal and fixed quote — no obligation.'
            action={{ label: 'Get in touch', to: contactAbout('website') }}
        />
    </>
);
