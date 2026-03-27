import type { ProjectListProps } from './types.ts';
import { ProjectListItem } from '../../molecules';

export const ProjectList = ({ listItems }: ProjectListProps) => {
    return (
        <ul className={'flex flex-1 flex-col items-center justify-center gap-20'}>
            {listItems?.map((item, index) => {
                return (
                    <li key={`${item?.title}-${index}`}>
                        <ProjectListItem {...item} />
                    </li>
                );
            })}
        </ul>
    );
};
