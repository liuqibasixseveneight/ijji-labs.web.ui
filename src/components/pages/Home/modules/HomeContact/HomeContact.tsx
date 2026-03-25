export const HomeContact = () => {
    return (
        <div className={'flex-1 w-full bg-red-500'}>
            <div className={'flex flex-1 w-full max-w-420 mx-auto p-30'}>
                <div className={'flex flex-1 items-center justify-center flex-col'}>
                    <h2>Let's have a chat</h2>
                    <form>
                        <div className={'flex flex-1 items-center justify-center flex-col'}>
                            <label htmlFor='name'>Your name</label>
                            <input
                                id={'name'}
                                name={'name'}
                                required
                                minLength={3}
                                maxLength={32}
                                type={'text'}
                            />
                        </div>

                        <div className={'flex flex-1 items-center justify-center flex-col'}>
                            <label htmlFor='company'>Company name</label>
                            <input
                                id={'company'}
                                name={'company'}
                                minLength={3}
                                maxLength={32}
                                type={'text'}
                            />
                        </div>

                        <div className={'flex flex-1 items-center justify-center flex-col'}>
                            <label htmlFor='email'>Email address</label>
                            <input
                                id={'email'}
                                name={'email'}
                                required
                                minLength={3}
                                maxLength={32}
                                type={'email'}
                            />
                        </div>

                        <div className={'flex flex-1 items-center justify-center flex-col'}>
                            <label htmlFor='phoneNumber'>Phone number</label>
                            <input
                                id={'phoneNumber'}
                                name={'phoneNumber'}
                                minLength={3}
                                maxLength={32}
                                type={'tel'}
                            />
                        </div>

                        <div className={'flex flex-1 items-center justify-center flex-col'}>
                            <label htmlFor='project'>Project type</label>
                            <select name={'project'} id={'project'}>
                                <option value={'webDesign'}>Website design</option>
                                <option value={'collaboration'}>Collaboration</option>
                                <option value={'employment'}>Employment</option>
                            </select>
                        </div>

                        <div className={'flex flex-1 items-center justify-center flex-col'}>
                            <label htmlFor='message'>Message</label>
                            <textarea
                                id={'message'}
                                name={'message'}
                                required
                                minLength={3}
                                maxLength={32}
                            />
                        </div>

                        <div className={'flex flex-1 items-center justify-center flex-col'}>
                            <label htmlFor='contactMethod'>Preferred contact method</label>
                            <input
                                id={'contactMethod'}
                                name={'contactMethod'}
                                required
                                minLength={3}
                                maxLength={32}
                                type={'text'}
                            />
                        </div>

                        <div className={'flex flex-1 items-center justify-center flex-col'}>
                            <label htmlFor='referral'>How did you hear about us?</label>
                            <input
                                id={'referral'}
                                name={'referral'}
                                required
                                minLength={3}
                                maxLength={32}
                                type={'text'}
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
