import { site } from '../../../../content/site.ts';
import type { PageMetaProps } from './types.ts';

/**
 * The page's title, description and canonical address. React hoists these into `<head>`,
 * in the browser and in the pre-rendered HTML.
 */
export const PageMeta = ({ title, description, path, noindex }: PageMetaProps) => {
    const fullTitle = title
        ? `${title} · ${site.name}`
        : `${site.name} · Website design studio in Leeds`;
    const url = `${site.url}${path === '/' ? '' : path}`;

    return (
        <>
            <title>{fullTitle}</title>
            <meta name='description' content={description} />
            <link rel='canonical' href={url} />
            <meta property='og:title' content={fullTitle} />
            <meta property='og:description' content={description} />
            <meta property='og:url' content={url} />
            <meta name='twitter:title' content={fullTitle} />
            <meta name='twitter:description' content={description} />
            {noindex && <meta name='robots' content='noindex' />}
        </>
    );
};
