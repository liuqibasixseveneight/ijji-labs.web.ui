/**
 * An admin page's title. Admin pages are never indexed, so there's no description,
 * canonical or Open Graph, unlike the public site's PageMeta.
 */
export const AdminMeta = ({ title }: { title: string }) => (
    <>
        <title>{`${title} · Admin · ijji labs`}</title>
        <meta name='robots' content='noindex, nofollow' />
    </>
);
