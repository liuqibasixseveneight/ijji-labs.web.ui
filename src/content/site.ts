/** Facts about ijji labs used across pages and policies. Change them here, nowhere else. */
export const site = {
    name: 'ijji labs',
    url: 'https://www.ijji-labs.com',
    /** Who is responsible for personal data, as the policies name them. */
    controller: 'ijji labs, a sole trader based in Leeds, United Kingdom',
    location: 'Leeds, United Kingdom',
    email: 'support@ijji-labs.com',
    /** How quickly we answer messages, everywhere it's promised. */
    replyTime: 'within one business day',
    /** How long a web request to delete an app account can take. */
    deletionTime: 'within 30 days',
    /** How soon deleted data leaves our database provider's backups. Confirm against the Supabase plan. */
    backupRetention: 'within 30 days',
    tagline: 'A small studio designing and building websites, and making apps of its own.',
    description:
        'ijji labs is an independent studio in Leeds. We design and build fast, considered websites for businesses, and make apps of our own, starting with IJJI Tracker.',
} as const;
