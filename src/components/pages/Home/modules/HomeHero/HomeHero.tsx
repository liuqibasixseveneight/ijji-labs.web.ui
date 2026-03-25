export const HomeHero = () => {
    return (
        <div className={'flex flex-col flex-1 w-full min-h-[90vh] max-w-420 mx-auto px-30'}>
            <div className={'flex-1 flex items-start justify-center flex-col'}>
                <div className={'uppercase text-brand-primary mb-20'}>
                    Digital design &amp; development
                </div>
                <h1
                    className={
                        'font-newsreader text-[clamp(2.5rem,8vw,6rem)] leading-none font-light mb-20 max-w-350'
                    }
                >
                    We craft <span className={'italic'}>elevated</span> digital experiences for{' '}
                    <span className={'font-normal'}>the web.</span>
                </h1>
                <div className={'max-w-162.5 text-xl leading-relaxed'}>
                    An independent studio specialising in premium web design, creating thoughtful
                    digital products with purpose and soul.
                </div>
            </div>
        </div>
    );
};
