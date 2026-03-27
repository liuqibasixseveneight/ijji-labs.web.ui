export const HomeServices = () => {
    return (
        <div className={'flex-1 w-full bg-ui-background-secondary'}>
            <div className={'flex flex-1 w-full max-w-420 mx-auto p-30'}>
                <div className='flex-1'>
                    <div className={'uppercase text-brand-primary mb-8'}>What we do</div>
                    <h2 className={'font-newsreader text-7xl mb-10'}>Our services</h2>
                    <div className={'max-w-140 text-xl leading-relaxed'}>
                        We don't just build websites; we create digital experiences that command
                        attention and foster deep trust, all whilst ensuring that your brand takes
                        center stage.
                    </div>
                </div>

                <div className='flex-1'>
                    <div className='flex flex-col items-start justify-between gap-20'>
                        <div>
                            <span className={'text-brand-primary2'}>01.</span>
                            <div className={'font-newsreader italic text-5xl font-light mt-4 mb-6'}>
                                Website development
                            </div>
                            <div className={'text-xl text-ui-text-secondary'}>
                                Full websites from start to finish
                            </div>
                        </div>

                        <div>
                            <span className={'text-brand-primary2'}>02.</span>
                            <div className={'font-newsreader italic text-5xl font-light mt-4 mb-6'}>
                                Landing pages
                            </div>
                            <div className={'text-xl text-ui-text-secondary'}>
                                Pages designed to convert visitors
                            </div>
                        </div>

                        <div>
                            <span className={'text-brand-primary2'}>03.</span>
                            <div className={'font-newsreader italic text-5xl font-light mt-4 mb-6'}>
                                Brand-focused development
                            </div>
                            <div className={'text-xl text-ui-text-secondary'}>
                                Built to match and enhance your brand
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
