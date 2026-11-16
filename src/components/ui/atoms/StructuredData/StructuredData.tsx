import type { StructuredDataProps } from './types.ts';

/**
 * JSON-LD for search engines and AI answer engines (see src/content/structuredData.ts). It
 * is data, not script: browsers don't run it, and `<` is escaped so text can't close the tag.
 */
export const StructuredData = ({ data }: StructuredDataProps) => (
    <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
);
