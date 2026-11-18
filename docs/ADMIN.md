# Admin dashboard: runbook

The private dashboard at `ijji-labs.com/admin`, for the studio's one admin. It watches the website, IJJI Tracker's two Supabase projects and its EAS builds, and keeps the queue of account-deletion requests. This is how to set it up, keep it safe and deal with what it tells you. How it's built is in `CLAUDE.md` under "Admin dashboard".

## Signing in

1. Go to `/admin/sign-in` and use `admin@ijji-labs.com`, its password and the six-digit code from your authenticator app.
2. A session lasts **4 hours**. After that you sign in again. There's no "remember me".
3. **Sign out everywhere** (in the menu) ends every session on every device at once. Use it if a device is lost or you think someone else signed in.

Anyone else gets the same "Those details didn't work", whatever was wrong, so a wrong guess learns nothing. Too many failed attempts lock sign-in for an hour and email you (see [Lockout email](#lockout-email)).

### Setting up the authenticator (first time, or a new phone)

1. In Netlify, add `ADMIN_MFA_ENROLL` = `true` and redeploy.
2. Sign in with email and password. The page shows a QR code: scan it, then enter the code to finish.
3. **Remove `ADMIN_MFA_ENROLL` straight away and redeploy.** While it's set, a stolen password alone could add a new authenticator.

To move to a new phone, delete the old factor first: **Supabase → production project → Authentication → Users → admin@ijji-labs.com → MFA factors**. Then follow the steps above.

## Environment variables

All of these go in **Netlify → Site configuration → Environment variables**, marked **secret**, with scope **Functions** only, unless a variable says otherwise. Never give one a `VITE_` prefix: Vite would put it in the browser bundle. The build fails if a secret's name ends up in `dist/`. Never paste values into chat, the repo or an issue.

| Variable                                                   | What it is                                                                                                                                                                                                                                                                                                     | Needed for                            |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `ADMIN_USER_IDS`                                           | The admin account's Supabase user id (comma-separated if ever more than one). **Functions and Edge.**                                                                                                                                                                                                          | Signing in, and the edge gate         |
| `ADMIN_SESSION_SECRET`                                     | At least 32 random bytes, which sign the session cookie. **Functions and Edge.**                                                                                                                                                                                                                               | Signing in, and the edge gate         |
| `ADMIN_MFA_ENROLL`                                         | `true` only while setting up the authenticator; remove straight after.                                                                                                                                                                                                                                         | First sign-in                         |
| `SUPABASE_PROD_URL`                                        | `https://<prod ref>.supabase.co`                                                                                                                                                                                                                                                                               | Sign-in, Supabase page                |
| `SUPABASE_PROD_ANON_KEY`                                   | Production's publishable (anon) key                                                                                                                                                                                                                                                                            | Sign-in                               |
| `SUPABASE_PROD_SERVICE_KEY`                                | Production's **secret** (`sb_secret_…` or legacy `service_role`) key. Only ever calls `admin_stats()` and `admin_db_stats()`.                                                                                                                                                                                  | People, Sessions, Database            |
| `SUPABASE_DEV_URL`, `SUPABASE_DEV_SERVICE_KEY`             | The same for the develop project                                                                                                                                                                                                                                                                               | The Develop tab                       |
| `SUPABASE_PROD_ACCESS_TOKEN`, `SUPABASE_DEV_ACCESS_TOKEN`  | A personal access token for each organisation (they're in separate organisations): **read-only** on Projects, Advisors and Analytics/Logs (and Database if the advisors need it), **no access** to everything else, with an expiry. `SUPABASE_ACCESS_TOKEN` is read as a fallback for one token covering both. | Project status, advisors, API traffic |
| `NETLIFY_API_TOKEN`                                        | A Netlify personal access token. It's only used to read this site's deploys.                                                                                                                                                                                                                                   | Deploys card                          |
| `PSI_API_KEY`                                              | A Google PageSpeed Insights API key (optional; without it, runs share Google's quota).                                                                                                                                                                                                                         | Lighthouse                            |
| `EXPO_TOKEN`                                               | A token for an Expo **robot user with the Viewer role**, which can't build, submit or change anything.                                                                                                                                                                                                         | IJJI Tracker page                     |
| `RESEND_API_KEY`, `CONTACT_EMAIL_FROM`, `CONTACT_EMAIL_TO` | Already set for the contact form. The admin's emails use them too.                                                                                                                                                                                                                                             | Alerts and reminders                  |

To make `ADMIN_SESSION_SECRET` on your own computer (paste the result into Netlify, nowhere else):

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

A card whose variable is missing says which one, so a half-configured dashboard still works.

## Rotating secrets

Rotate after anyone else may have seen a value, when a token expires, and every 90 days for the access tokens.

| What                   | How                                                                                                                                | Effect                       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `ADMIN_SESSION_SECRET` | Make a new one (above), replace it in Netlify (Functions **and** Edge), redeploy.                                                  | Everyone is signed out.      |
| Supabase service keys  | Supabase → Project Settings → API Keys: create a new secret key, put it in Netlify, redeploy, then revoke the old one.             | None, if done in that order. |
| Supabase access tokens | Account → Access Tokens: create a new one (same permissions, with an expiry), replace it in Netlify, redeploy, delete the old one. | None.                        |
| `NETLIFY_API_TOKEN`    | Netlify → User settings → Applications: new token, replace, redeploy, revoke the old.                                              | None.                        |
| `EXPO_TOKEN`           | Expo → Account settings → Robot users: new token for the Viewer robot, replace, redeploy, revoke the old.                          | None.                        |

Every redeploy uses Netlify build credits, so rotate several at once where you can.

## What the dashboard tells you, and what to do

### Deletion requests

Someone asked, on the website, for their IJJI Tracker account to be deleted. **You must act on each one** within the 30 days the policy promises. Each request's page walks you through it:

1. **Confirm:** email them from support@ (the page has the template) to check it's really them.
2. **Delete:** once they confirm, run the SQL the page gives you in production's SQL editor (the page links to it). Deleting from Supabase's Users screen alone can fail, because sessions reference the account.
3. **Close:** mark it **Done**, or **Rejected** if there was no such account or they never confirmed.

Every morning at 08:00 UTC, a reminder email lists any request that's been open a week or more, or has 3 days or fewer left. It gives counts and days left only, never addresses. A closed request keeps its email address for 30 days; after that, the address, the reason and any notes are removed. The record itself is deleted a year after it closed.

### Uptime email

The key pages are checked every 10 minutes. Two failed checks in a row email you, and you get another email when they're back up. The key pages include the App Store and Google Play pages, which must stay up. Check the Website page's Uptime card and Netlify's deploys: a failed deploy is the usual cause.

### Lockout email

Sign-in locked for an hour after too many failures. If it wasn't you, someone is guessing:

- Change the admin account's password in Supabase.
- Use **Sign out everywhere** once you're back in.
- Rotate `ADMIN_SESSION_SECRET` if you think a session was taken.

### Supabase cards say "Not available"

The message next to the badge says why:

- **A variable isn't set:** add it in Netlify and redeploy.
- **"apply the admin_stats migration":** run it on that project, from `ijji-tracker.mobile`:
    ```powershell
    npx supabase link --project-ref <ref>
    ```
    ```powershell
    npx supabase db push
    ```
- **"Supabase refused the key":** the publishable (anon) key was pasted instead of the secret one.
- **"The project is paused":** free projects pause after a week without traffic. Restore it from Supabase's dashboard.

### A failed build or submission

The IJJI Tracker page links each build and submission to its page on expo.dev, with the logs.

## Keeping it private

- Only the admin account (its id in `ADMIN_USER_IDS`, with an authenticator code) can open `/admin`. Anyone else gets the site's ordinary 404 page.
- The dashboard shows **counts only** about the app's users, never anyone's email, name or sessions. The one exception is a deletion request, where the person asked us to act on their email.
- Logs, advisor findings and build errors are scrubbed of emails, ids, IP addresses and tokens before they reach the browser.
- Nothing the dashboard loads is kept in the browser after a reload or sign-out. The only thing it remembers is which cards you collapsed.
