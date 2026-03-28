const aboutImgSrc =
    'https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?q=80&w=1744&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
const valuesImgSrc =
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

export const HomeAbout = () => {
    return (
        <>
            <div className='flex-1 h-full flex flex-col items-center justify-center w-full bg-ui-background-primary'>
                <div className={'max-w-360 w-full flex-1 py-[10vh] flex flex-col'}>
                    <h2 className={'text-8xl font-extrabold text-white mb-10'}>About us</h2>
                    <img
                        src={aboutImgSrc}
                        alt={'Shared computer working space'}
                        className={
                            'rounded-4xl flex-1 object-cover max-h-[65vh] w-full select-none [-webkit-user-drag:none] pointer-events-none'
                        }
                    />
                </div>
            </div>

            <div className='flex-1 h-full flex flex-col items-center justify-center w-full py-[10vh] bg-white'>
                <div className={'max-w-260 w-full flex-1 flex flex-col mb-[5vh]'}>
                    <h3 className={'text-4xl font-medium mb-10'}>
                        At ijji labs, we focus on what matters most - your users
                    </h3>

                    <div className='flex-1 flex flex-col gap-8'>
                        <p className={'text-xl'}>
                            Founded in Leeds in 2026, ijji labs is an independent digital studio
                            dedicated to crafting fast, modern websites. We work closely with every
                            client, taking a hands-on approach to deliver thoughtful, high-quality
                            results that make an impact.
                        </p>
                        <p className={'text-xl'}>
                            As an independent studio, we value simplicity, clarity, and performance
                            in everything we create. We avoid unnecessary complexity, focusing
                            instead on delivering websites that are fast, reliable, and designed to
                            stand the test of time.
                        </p>
                        <p className={'text-xl'}>
                            From concept to launch, we work side by side with our clients, keeping
                            the process clear, collaborative, and focused. Once your website is
                            live, we ensure a smooth handover, equipping you with the knowledge and
                            confidence to take ownership moving forward.
                        </p>
                    </div>
                </div>

                <div className={'max-w-300 w-full flex-1 flex flex-col mb-[5vh]'}>
                    <img
                        src={valuesImgSrc}
                        alt={'Values'}
                        className={
                            'rounded-4xl flex-1 object-cover max-h-[65vh] w-full select-none [-webkit-user-drag:none] pointer-events-none'
                        }
                    />
                </div>

                <div className={'max-w-260 w-full flex-1 flex flex-col'}>
                    <h3 className={'text-4xl font-medium mb-10'}>What are our values?</h3>

                    <div className='flex-1 flex flex-col gap-8'>
                        <p className={'text-xl'}>
                            <span className='font-bold'>Quality:</span> We build fast, reliable
                            websites with attention to detail and thoughtful design - delivering
                            results that last.
                        </p>
                        <p className={'text-xl'}>
                            <span className='font-bold'>Collaboration:</span> We work closely with
                            you from start to finish, ensuring every decision is clear, aligned, and
                            purposeful.
                        </p>
                        <p className={'text-xl'}>
                            <span className='font-bold'>Confidence:</span> After launch, we provide
                            a smooth handover and guidance, giving you the confidence to manage and
                            grow your website independently.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};
