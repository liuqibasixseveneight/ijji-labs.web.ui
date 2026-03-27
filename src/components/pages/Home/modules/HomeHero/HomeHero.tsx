export const HomeHero = () => {
    return (
        <div className='flex flex-col w-full min-h-[90vh] max-w-420 mx-auto px-6 sm:px-10 md:px-16 lg:px-24 xl:px-30 relative overflow-hidden'>
            <div className='flex-1 flex items-start justify-center flex-col'>
                <div className='uppercase text-brand-primary mb-6 sm:mb-8 md:mb-10 lg:mb-14 xl:mb-20 text-sm sm:text-base md:text-lg xl:text-xl tracking-wide'>
                    Digital design &amp; development
                </div>

                <h1 className='font-newsreader text-[clamp(3.5rem,7vw,8rem)] leading-[1.05] sm:leading-tight font-medium mb-6 sm:mb-10 md:mb-14 lg:mb-16 xl:mb-20 max-w-5xl xl:max-w-7xl text-ui-background-secondary mix-blend-difference'>
                    We craft <span className='italic'>elevated</span> digital experiences for{' '}
                    <span className='font-bold'>the web.</span>
                </h1>

                <div className='max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-162.5 text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed text-ui-background-primary'>
                    An independent studio specialising in premium web design, creating thoughtful
                    digital products with purpose and soul.
                </div>
            </div>

            <div
                className={
                    'absolute text-ui-background-primary/5 text-[clamp(20rem,40vw,80rem)] font-newsreader font-bold top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mix-blend-difference overflow-hidden [user-select:none]'
                }
            >
                ijji
            </div>
        </div>
    );
};
