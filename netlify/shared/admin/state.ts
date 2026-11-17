import { store } from '../blobs.ts';

// The admin's own state in Blobs: the session epoch ("sign out everywhere") and recent failed
// sign-ins. No IP addresses or other details about who tried are kept: only times.

const admin = () => store('admin');

/** Failed sign-ins in this window, from anyone, lock sign-in. */
export const FAILURE_WINDOW_MS = 15 * 60 * 1000;
export const MAX_FAILURES = 10;
export const LOCK_MS = 60 * 60 * 1000;

type SignInState = { failures: number[]; lockedUntil?: number };

export const getEpoch = async () => {
    const value = (await admin().get('epoch', { type: 'json' })) as { epoch: number } | null;
    return value?.epoch ?? 0;
};

/** Ends every session signed in so far. */
export const bumpEpoch = async () => {
    const epoch = (await getEpoch()) + 1;
    await admin().setJSON('epoch', { epoch });
    return epoch;
};

const readSignIn = async (now: number): Promise<SignInState> => {
    const value = (await admin().get('sign-in', { type: 'json' })) as SignInState | null;
    return {
        failures: (value?.failures ?? []).filter((at) => now - at < FAILURE_WINDOW_MS),
        lockedUntil: value?.lockedUntil && value.lockedUntil > now ? value.lockedUntil : undefined,
    };
};

/** Whether sign-in is locked after too many failures. */
export const isLocked = async (now = Date.now()) => Boolean((await readSignIn(now)).lockedUntil);

/**
 * Records a failed sign-in. Returns true when this one locked sign-in, so the caller can
 * tell you by email.
 */
export const recordFailure = async (now = Date.now()) => {
    const state = await readSignIn(now);
    const failures = [...state.failures, now];
    const locks = !state.lockedUntil && failures.length >= MAX_FAILURES;

    await admin().setJSON('sign-in', {
        failures: locks ? [] : failures,
        lockedUntil: locks ? now + LOCK_MS : state.lockedUntil,
    });

    return locks;
};
