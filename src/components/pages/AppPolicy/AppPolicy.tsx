import { useParams } from 'react-router-dom';

import { findApp } from '../../../content';
import { paths } from '../../../router/paths.ts';
import { DeletionRequestForm, PageMeta, PolicyDocument, StructuredData } from '../../ui';
import * as ld from '../../../content/structuredData.ts';

import { NotFound } from '../NotFound';
import type { AppPolicyProps } from './types.ts';

const PATH_KEY = {
    privacy: 'privacy',
    terms: 'terms',
    support: 'support',
    deletion: 'deleteAccount',
} as const;

const LABEL = {
    privacy: 'Privacy policy',
    terms: 'Terms of use',
    support: 'Support',
    deletion: 'Delete your account',
} as const;

/**
 * An app's privacy policy, terms, support or account deletion page. Their URLs are in the
 * App Store and Play Console listings: see `paths.app` before changing anything here.
 */
export const AppPolicy = ({ kind }: AppPolicyProps) => {
    const app = findApp(useParams().appSlug);
    if (!app) return <NotFound />;

    const document = app.policies[kind];
    const to = paths.app(app.slug);

    return (
        <>
            <PageMeta
                title={`${LABEL[kind]} · ${app.name}`}
                description={document.summary}
                path={to[PATH_KEY[kind]]}
            />

            <StructuredData
                data={ld.policyPage(
                    to[PATH_KEY[kind]],
                    document,
                    ld.mobileApplication(app)['@id'] as string,
                )}
            />
            <StructuredData
                data={ld.breadcrumbs([
                    { name: 'Apps', path: paths.apps },
                    { name: app.name, path: to.root },
                    { name: LABEL[kind], path: to[PATH_KEY[kind]] },
                ])}
            />
            {kind === 'support' && <StructuredData data={ld.policyFaqs(document)} />}

            <PolicyDocument
                document={document}
                breadcrumb={[
                    { label: 'Apps', to: paths.apps },
                    { label: app.name, to: to.root },
                    { label: LABEL[kind], to: to[PATH_KEY[kind]] },
                ]}
                after={
                    kind === 'deletion'
                        ? { 'without-the-app': <DeletionRequestForm app={app} /> }
                        : undefined
                }
            />
        </>
    );
};
