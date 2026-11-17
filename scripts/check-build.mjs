// The last step of `npm run build`: checks the built site in dist/ before it can deploy.
// - The public pages load none of the admin dashboard's code.
// - No secret's name (or Supabase's service-role marker) is anywhere in what's published.
// - The sitemap, robots.txt and llms*.txt never mention /admin.
// Fails the build (exit 1) with what it found.
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(import.meta.dirname, '..', 'dist');
const problems = [];

const read = (file) => fs.readFileSync(path.join(dist, file), 'utf8');

const filesIn = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        return entry.isDirectory() ? filesIn(full) : [full];
    });

// 1. Every script the public home page can load, following static and dynamic imports.
const ADMIN_MARKERS = ['/api/admin/', 'X-Admin-Request'];
const referenced = (text) =>
    [...text.matchAll(/(?:assets\/|\.\/)([\w.-]+\.js)/g)].map((match) => `assets/${match[1]}`);

const seen = new Set();
const queue = referenced(read('index.html'));
while (queue.length) {
    const file = queue.pop();
    if (seen.has(file) || !fs.existsSync(path.join(dist, file))) continue;
    seen.add(file);
    const text = read(file);
    for (const marker of ADMIN_MARKERS) {
        if (text.includes(marker))
            problems.push(`${file} (loaded by the public site) has admin code: "${marker}"`);
    }
    queue.push(...referenced(text));
}
if (!seen.size) problems.push('Found no scripts loaded by dist/index.html: update this check');

// 2. No secret names anywhere in the published files (text files only).
const SECRETS = [
    'service_role',
    'sb_secret_',
    'SUPABASE_',
    'ADMIN_SESSION_SECRET',
    'ADMIN_USER_IDS',
    'RESEND_API_KEY',
    'NETLIFY_API_TOKEN',
    'EXPO_TOKEN',
];
for (const file of filesIn(dist)) {
    if (!/\.(html|js|css|txt|xml|json|webmanifest|map)$/.test(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    for (const secret of SECRETS) {
        if (text.includes(secret)) problems.push(`${path.relative(dist, file)} mentions ${secret}`);
    }
}

// 3. The admin dashboard is never listed for crawlers or AI assistants.
for (const file of ['sitemap.xml', 'robots.txt', 'llms.txt', 'llms-full.txt']) {
    if (/\/admin\b/.test(read(file))) problems.push(`${file} mentions /admin`);
}

if (problems.length) {
    console.error(`Build check failed:\n- ${problems.join('\n- ')}`);
    process.exit(1);
}

console.log(
    `Build check passed: ${seen.size} public scripts free of admin code, no secret names, no /admin listed`,
);
