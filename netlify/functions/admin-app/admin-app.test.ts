// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { adminRequest, ENV, memoryBlobs, sessionFor } from '../../shared/admin/testing.ts';

const blobs = vi.hoisted(() => ({ current: null as null | ReturnType<typeof memoryBlobs> }));
vi.mock('../../shared/blobs.ts', () => ({ store: () => blobs.current!.store() }));

import { EXPO_APP } from '../../shared/admin/expo.ts';
import handler from './admin-app.ts';

const PROJECT = 'https://expo.dev/accounts/liuqibasixseveneight/projects/ijji-tracker';

const expo = (reply: () => Response) =>
    vi.stubGlobal(
        'fetch',
        vi.fn(async () => reply()),
    );

const builds = () =>
    Response.json({
        data: {
            app: {
                byId: {
                    builds: [
                        {
                            id: 'b1',
                            status: 'FINISHED',
                            platform: 'IOS',
                            buildProfile: 'production',
                            distribution: 'STORE',
                            appVersion: '1.0.3',
                            appBuildVersion: '12',
                            sdkVersion: '58.0.0',
                            gitCommitHash: 'abcdef1234567890',
                            gitCommitMessage: 'feat: Achievements\n\nLonger body',
                            createdAt: '2026-11-18T10:00:00.000Z',
                            completedAt: '2026-11-18T10:14:00.000Z',
                            isForIosSimulator: false,
                            error: null,
                        },
                        {
                            id: 'b2',
                            status: 'ERRORED',
                            platform: 'ANDROID',
                            buildProfile: 'preview',
                            appVersion: '1.0.3',
                            appBuildVersion: '40',
                            createdAt: '2026-11-17T10:00:00.000Z',
                            completedAt: null,
                            error: {
                                errorCode: 'GRADLE',
                                message:
                                    'Gradle failed for jo@example.com with token eyJhbGciOi.eyJzdWIi.c2lnbmF0',
                            },
                        },
                    ],
                    submissions: [
                        {
                            id: 's1',
                            platform: 'IOS',
                            status: 'FINISHED',
                            createdAt: '2026-11-18T11:00:00.000Z',
                            completedAt: '2026-11-18T11:05:00.000Z',
                            error: null,
                            submittedBuild: {
                                id: 'b1',
                                appVersion: '1.0.3',
                                appBuildVersion: '12',
                            },
                        },
                    ],
                },
            },
        },
    });

const call = async () => handler(adminRequest('/api/admin/app', { cookie: await sessionFor() }));

describe('the IJJI Tracker endpoint', () => {
    beforeEach(() => {
        blobs.current = memoryBlobs();
        Object.assign(process.env, ENV, { EXPO_TOKEN: 'robot-token-robot-token' });
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });
    afterEach(() => {
        delete process.env.EXPO_TOKEN;
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('shows builds and submissions, picked and linked to expo.dev', async () => {
        expo(builds);
        const body = await (await call()).json();

        expect(body.projectUrl).toBe(PROJECT);
        expect(body.builds.data[0]).toEqual({
            id: 'b1',
            status: 'FINISHED',
            platform: 'IOS',
            profile: 'production',
            distribution: 'STORE',
            appVersion: '1.0.3',
            buildNumber: '12',
            sdkVersion: '58.0.0',
            commit: 'abcdef1',
            commitMessage: 'feat: Achievements',
            createdAt: '2026-11-18T10:00:00.000Z',
            completedAt: '2026-11-18T10:14:00.000Z',
            simulator: false,
            error: null,
            url: `${PROJECT}/builds/b1`,
        });
        expect(body.submissions.data[0]).toMatchObject({
            platform: 'IOS',
            status: 'FINISHED',
            appVersion: '1.0.3',
            buildNumber: '12',
            url: `${PROJECT}/submissions/s1`,
        });
    });

    it('scrubs error text, and passes on no token', async () => {
        expo(builds);
        const text = await (await call()).text();
        expect(text).toContain('Gradle failed for [email] with token [token]');
        expect(text).not.toMatch(/jo@example\.com|eyJ|robot-token/);
    });

    it('only asks Expo the one read-only query, for this app, with the robot token', async () => {
        expo(builds);
        await call();
        const [url, init] = vi.mocked(fetch).mock.calls[0] as unknown as [string, RequestInit];
        const body = JSON.parse(String(init.body));

        expect(url).toBe('https://api.expo.dev/graphql');
        expect((init.headers as Record<string, string>).Authorization).toBe(
            'Bearer robot-token-robot-token',
        );
        expect(body.query).toMatch(/^query AdminAppBuilds/);
        expect(body.query).not.toMatch(/mutation/i);
        expect(body.variables).toEqual({ appId: EXPO_APP.id });
    });

    it('says what’s wrong: no token, a refused token, or Expo’s own error', async () => {
        delete process.env.EXPO_TOKEN;
        expect((await (await call()).json()).builds.error).toBe(
            'EXPO_TOKEN isn’t set in Netlify yet.',
        );

        process.env.EXPO_TOKEN = 'robot-token-robot-token';
        expo(() => new Response('', { status: 401 }));
        expect((await (await call()).json()).submissions.error).toMatch(/Expo refused EXPO_TOKEN/);

        expo(() => Response.json({ errors: [{ message: 'App not found' }], data: null }));
        expect((await (await call()).json()).builds.error).toBe(
            'Expo couldn’t answer: App not found',
        );
    });
});
