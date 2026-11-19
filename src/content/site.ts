/** How many days a web request to delete an app account can take: the promise and the admin queue's due dates. */
const DELETION_DAYS = 30;

/** Facts about ijji labs used across pages and policies. Change them here, nowhere else. */
export const site = {
    name: 'ijji labs',
    url: 'https://www.ijji-labs.com',
    /** Who is responsible for personal data, as the policies name them. */
    controller: 'ijji labs, a sole trader based in Leeds, United Kingdom',
    location: 'Leeds, United Kingdom',
    /** For the apps and the policies: support, privacy and deletion requests. */
    email: 'support@ijji-labs.com',
    /** For the studio: website enquiries, as the footer and the menu give it. */
    studioEmail: 'hello@ijji-labs.com',
    /** How quickly we answer messages, everywhere it's promised. */
    replyTime: 'within one business day',
    /** How long a web request to delete an app account can take. */
    deletionTime: `within ${DELETION_DAYS} days`,
    deletionDays: DELETION_DAYS,
    /**
     * How long we keep a web deletion request after dealing with it (the admin dashboard
     * enforces both): its email, reason and notes, then the rest of the record.
     */
    deletionRequestDetailsDays: 30,
    deletionRequestRecordDays: 365,
    tagline: 'A small studio designing and building websites, and making apps of its own.',
    description:
        'ijji labs is an independent studio in Leeds. We design and build fast, considered websites for businesses, and make apps of our own, starting with IJJI Tracker.',
} as const;
