import { homeCopy } from '../../../../../content';
import { ContactForm, Section, SectionIntro } from '../../../../ui';

export const HomeContact = () => (
    <Section tone='light' labelledBy='home-contact-title'>
        <SectionIntro
            id='home-contact-title'
            tone='light'
            title={homeCopy.contact.title}
            lede={homeCopy.contact.lede}
        />
        <ContactForm />
    </Section>
);
