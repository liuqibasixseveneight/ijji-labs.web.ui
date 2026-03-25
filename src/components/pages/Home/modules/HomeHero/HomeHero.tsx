export const HomeHero = () => {
    return (
        <div className={'flex flex-col flex-1 w-full p-30 min-h-[75vh] max-w-420 mx-auto'}>
            <div className={'flex-1 max-w-350 flex items-start justify-center flex-col'}>
                <div className={'uppercase text-brand-primary mb-20'}>
                    Digital design &amp; development
                </div>
                <h1
                    className={
                        'font-newsreader text-[clamp(2.5rem,8vw,6rem)] leading-none font-light mb-20'
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
