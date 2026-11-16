import { websitePrivacy } from '../../../content';
import { paths } from '../../../router/paths.ts';
import { PageMeta, PolicyDocument, StructuredData } from '../../ui';
import * as ld from '../../../content/structuredData.ts';

/** /privacy: the website's own privacy policy. */
export const Privacy = () => (
    <>
        <PageMeta
            title='Website privacy policy'
            description={websitePrivacy.summary}
            path={paths.privacy}
        />
        <StructuredData data={ld.policyPage(paths.privacy, websitePrivacy)} />
        <PolicyDocument document={websitePrivacy} />
    </>
);
