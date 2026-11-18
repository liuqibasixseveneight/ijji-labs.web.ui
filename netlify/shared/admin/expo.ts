import { scrub } from './scrub.ts';

// IJJI Tracker's EAS builds and store submissions, from Expo's GraphQL API, for the admin
// dashboard. The token (EXPO_TOKEN) belongs to a robot user with the Viewer role, so it can't
// build, submit or change anything; even so, this only ever sends the one read-only query
// below (never a mutation), and passes on picked fields, with error text scrubbed.

const API = 'https://api.expo.dev/graphql';

/** The app on Expo, as in ijji-tracker.mobile's app.json (public: it ships in the app). */
export const EXPO_APP = {
    id: '32737dbe-4aa4-4754-a662-b90eeedb26f0',
    owner: 'liuqibasixseveneight',
    slug: 'ijji-tracker',
} as const;

export const projectUrl = `https://expo.dev/accounts/${EXPO_APP.owner}/projects/${EXPO_APP.slug}`;

const QUERY = `query AdminAppBuilds($appId: String!) {
  app {
    byId(appId: $appId) {
      builds(offset: 0, limit: 30) {
        id status platform buildProfile distribution appVersion appBuildVersion sdkVersion
        gitCommitHash gitCommitMessage createdAt completedAt isForIosSimulator
        error { errorCode message }
      }
      submissions(filter: {}, offset: 0, limit: 10) {
        id platform status createdAt completedAt
        error { errorCode message }
        submittedBuild { id appVersion appBuildVersion buildProfile }
      }
    }
  }
}`;

export type Build = {
    id: string;
    status: string;
    platform: 'IOS' | 'ANDROID';
    profile: string;
    distribution: string | null;
    appVersion: string | null;
    buildNumber: string | null;
    sdkVersion: string | null;
    commit: string | null;
    commitMessage: string | null;
    createdAt: string;
    completedAt: string | null;
    simulator: boolean;
    error: string | null;
    url: string;
};

export type Submission = {
    id: string;
    status: string;
    platform: 'IOS' | 'ANDROID';
    createdAt: string;
    completedAt: string | null;
    appVersion: string | null;
    buildNumber: string | null;
    error: string | null;
    url: string;
};

export type AppBuilds = { projectUrl: string; builds: Build[]; submissions: Submission[] };

type Raw = Record<string, unknown>;
const text = (value: unknown, max = 120) => (typeof value === 'string' ? scrub(value, max) : null);
const platform = (value: unknown) => (value === 'IOS' ? 'IOS' : 'ANDROID') as Build['platform'];
const errorText = (value: unknown) => {
    if (!value || typeof value !== 'object') return null;
    const error = value as Raw;
    return text(error.message, 300) ?? text(error.errorCode);
};

/** The app's last 30 builds and 10 store submissions, newest first. Throws if Expo refuses. */
export const appBuilds = async (token: string): Promise<AppBuilds> => {
    const response = await fetch(API, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'ijji-labs-admin',
        },
        body: JSON.stringify({ query: QUERY, variables: { appId: EXPO_APP.id } }),
        signal: AbortSignal.timeout(10_000),
    });
    if (response.status === 401 || response.status === 403) {
        throw new Error('Expo refused EXPO_TOKEN: check it’s a robot token for this account.');
    }
    if (!response.ok) throw new Error(`Expo answered ${response.status}`);

    const body = (await response.json()) as {
        data?: { app?: { byId?: { builds?: Raw[]; submissions?: Raw[] } } };
        errors?: { message?: string }[];
    };
    const app = body.data?.app?.byId;
    if (!app) {
        const reason = body.errors?.[0]?.message;
        throw new Error(
            reason
                ? `Expo couldn’t answer: ${scrub(reason, 160)}`
                : 'Expo didn’t find the app: check EXPO_TOKEN can see it.',
        );
    }

    return {
        projectUrl,
        builds: (app.builds ?? []).map((b) => ({
            id: String(b.id),
            status: String(b.status ?? 'UNKNOWN'),
            platform: platform(b.platform),
            profile: text(b.buildProfile, 40) ?? 'unknown',
            distribution: text(b.distribution, 20),
            appVersion: text(b.appVersion, 30),
            buildNumber: text(b.appBuildVersion, 30),
            sdkVersion: text(b.sdkVersion, 20),
            commit: typeof b.gitCommitHash === 'string' ? b.gitCommitHash.slice(0, 7) : null,
            commitMessage: text(
                typeof b.gitCommitMessage === 'string' ? b.gitCommitMessage.split('\n')[0] : null,
                100,
            ),
            createdAt: String(b.createdAt),
            completedAt: typeof b.completedAt === 'string' ? b.completedAt : null,
            simulator: b.isForIosSimulator === true,
            error: errorText(b.error),
            url: `${projectUrl}/builds/${String(b.id)}`,
        })),
        submissions: (app.submissions ?? []).map((s) => {
            const build = (s.submittedBuild ?? {}) as Raw;
            return {
                id: String(s.id),
                status: String(s.status ?? 'UNKNOWN'),
                platform: platform(s.platform),
                createdAt: String(s.createdAt),
                completedAt: typeof s.completedAt === 'string' ? s.completedAt : null,
                appVersion: text(build.appVersion, 30),
                buildNumber: text(build.appBuildVersion, 30),
                error: errorText(s.error),
                url: `${projectUrl}/submissions/${String(s.id)}`,
            };
        }),
    };
};
