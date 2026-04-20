import { servicesData } from './servicesData';
import { ServicesCta, ServicesFaq, ServicesHero, ServicesProcess } from './modules';
import { ServiceDetailBlock } from '../../ui';

export const Services = () => (
    <>
        <ServicesHero />
        {servicesData.map((service, index) => (
            <ServiceDetailBlock key={index} service={service} index={index} />
        ))}
        <ServicesProcess />
        <ServicesFaq />
        <ServicesCta />
    </>
);
