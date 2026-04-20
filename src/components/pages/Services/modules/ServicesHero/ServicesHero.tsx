const JUMP_LINKS = [
    { label: 'Design & Development', href: '#service-1' },
    { label: 'Handover & Training', href: '#service-2' },
    { label: 'Post-Launch Support', href: '#service-3' },
    { label: 'FAQ', href: '#faq' },
];

export const ServicesHero = () => (
    <div className='flex-1 h-full flex flex-col items-center justify-center w-full bg-ui-background-primary'>
        <div className='max-w-380 w-full flex-1 py-[10vh] flex flex-col px-6 md:px-8 pt-[calc(10vh+6dvh)]'>
            <span className='text-sm font-mono tracking-widest uppercase text-white/30 mb-6'>
                What we do
            </span>
            <h1 className='text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white mb-10 leading-none'>
                Services
            </h1>
            <p className='text-lg sm:text-xl text-neutral-400 max-w-2xl leading-relaxed mb-6'>
                We design and build websites for businesses that care about quality — based in
                Leeds, working across the UK. Our offering is deliberately focused: three core
                services, delivered properly, every time.
            </p>
            <p className='text-base text-neutral-500 max-w-xl leading-relaxed'>
                No account managers. No junior teams. You work directly with the people doing the
                work.
            </p>

            <div className='flex flex-wrap gap-3 mt-14'>
                {JUMP_LINKS.map(({ label, href }) => (
                    <a
                        key={href}
                        href={href}
                        className='px-4 py-2 rounded-full border border-white/20 text-sm text-white/60 hover:border-white/50 hover:text-white/90 transition-colors'
                    >
                        {label}
                    </a>
                ))}
            </div>
        </div>
    </div>
);
