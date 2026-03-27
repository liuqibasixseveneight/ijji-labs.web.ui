import { ProjectList } from '../../../../ui';
import { projectListItems } from './projectListItems.ts';

export const HomeProjects = () => {
    return (
        <div className={'flex-1 w-full bg-ui-background-primary'}>
            <div className={'flex flex-col flex-1 w-full max-w-420 mx-auto p-30'}>
                <div className={'flex-1'}>
                    <div className={'uppercase text-brand-primary mb-8'}>
                        What your website could look like
                    </div>
                    <h2 className={'font-newsreader text-8xl mb-10'}>Concepts</h2>
                </div>

                <ProjectList listItems={projectListItems} />
            </div>
        </div>
    );
};
