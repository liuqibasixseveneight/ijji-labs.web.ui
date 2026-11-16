export interface PageMetaProps {
    /** The page's own title; `· ijji labs` is added. Leave out for the home page. */
    title?: string;
    description: string;
    /** The page's path, e.g. `/about`, for its canonical address. */
    path: string;
    /** Keep the page out of search results (Page not found). */
    noindex?: boolean;
}
