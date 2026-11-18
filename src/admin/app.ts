// The IJJI Tracker section's data, as GET /api/admin/app sends it (netlify/functions/
// admin-app), and the small helpers its page uses. Plain TypeScript only.

import type { Part } from './website.ts';

export type Platform = 'IOS' | 'ANDROID';

export type Build = {
    id: string;
    status: string;
    platform: Platform;
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
    /** The build's page on expo.dev. */
    url: string;
};

export type Submission = {
    id: string;
    status: string;
    platform: Platform;
    createdAt: string;
    completedAt: string | null;
    appVersion: string | null;
    buildNumber: string | null;
    error: string | null;
    url: string;
};

export type AppData = {
    now: number;
    /** The project's page on expo.dev. */
    projectUrl: string;
    builds: Part<Build[]>;
    submissions: Part<Submission[]>;
};

export const PLATFORMS: Platform[] = ['IOS', 'ANDROID'];
export const PLATFORM_LABELS: Record<Platform, string> = { IOS: 'iOS', ANDROID: 'Android' };

/** The app's EAS profiles (eas.json), most important first, with what each makes. */
export const PROFILES = [
    { id: 'production', label: 'Production', what: 'For the App Store and Google Play' },
    { id: 'preview', label: 'Preview', what: 'Internal: an installable APK on Android' },
    { id: 'development', label: 'Development', what: 'Development client, for testing' },
] as const;

type Level = 'good' | 'warning' | 'critical' | 'neutral';

/** A build's state in words, and how it should look. */
export const buildStatus = (status: string): { label: string; level: Level } =>
    status === 'FINISHED'
        ? { label: 'Built', level: 'good' }
        : status === 'ERRORED'
          ? { label: 'Failed', level: 'critical' }
          : status === 'CANCELED' || status === 'PENDING_CANCEL'
            ? { label: 'Cancelled', level: 'neutral' }
            : status === 'IN_PROGRESS'
              ? { label: 'Building', level: 'warning' }
              : { label: 'Queued', level: 'warning' };

/** A store submission's state in words, and how it should look. */
export const submissionStatus = (status: string): { label: string; level: Level } =>
    status === 'FINISHED'
        ? { label: 'Submitted', level: 'good' }
        : status === 'ERRORED'
          ? { label: 'Failed', level: 'critical' }
          : status === 'CANCELED'
            ? { label: 'Cancelled', level: 'neutral' }
            : status === 'AWAITING_BUILD'
              ? { label: 'Waiting for build', level: 'warning' }
              : { label: 'Submitting', level: 'warning' };

/** "1.0.3 (12)", or as much of it as there is. */
export const version = (appVersion: string | null, buildNumber: string | null) =>
    [appVersion, buildNumber && `(${buildNumber})`].filter(Boolean).join(' ') || null;

/** The newest build of each profile on each platform (builds come newest first). */
export const latestBuilds = (builds: Build[]) => {
    const latest = new Map<string, Build>();
    for (const build of builds) {
        const key = `${build.profile}/${build.platform}`;
        if (!latest.has(key)) latest.set(key, build);
    }
    return (profile: string, platform: Platform) => latest.get(`${profile}/${platform}`) ?? null;
};

/** How long a build took, in minutes: "12 min". */
export const duration = (build: Build) => {
    if (!build.completedAt) return null;
    const minutes = Math.round(
        (Date.parse(build.completedAt) - Date.parse(build.createdAt)) / 60_000,
    );
    return Number.isFinite(minutes) && minutes >= 0 ? `${minutes} min` : null;
};
