import { useSyncExternalStore } from 'react';

// Which cards are collapsed: a choice of the person viewing, remembered in this browser
// (localStorage, which only ever holds card ids). If storage is blocked, it still works for
// the visit; it just isn't remembered.

const KEY = 'ijji-admin:collapsed';

const read = (): Set<string> => {
    try {
        const value = JSON.parse(window.localStorage.getItem(KEY) ?? '[]');
        return new Set(Array.isArray(value) ? value.filter((id) => typeof id === 'string') : []);
    } catch {
        return new Set();
    }
};

let collapsed: Set<string> | null = null;
const listeners = new Set<() => void>();

const current = () => (collapsed ??= read());

const save = (next: Set<string>) => {
    collapsed = next;
    try {
        window.localStorage.setItem(KEY, JSON.stringify([...next]));
    } catch {
        // Not remembered, but still collapsed for now.
    }
    for (const listener of listeners) listener();
};

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

/** Whether a card is collapsed, and a way to change it. */
export const useCollapsed = (id: string) => {
    const isCollapsed = useSyncExternalStore(subscribe, () => current().has(id));
    const setCollapsed = (value: boolean) => {
        const next = new Set(current());
        if (value) next.add(id);
        else next.delete(id);
        save(next);
    };
    return [isCollapsed, setCollapsed] as const;
};

/** Whether all of a page's cards are collapsed, and a way to collapse or open them all. */
export const useAllCollapsed = (ids: readonly string[]) => {
    const all = useSyncExternalStore(subscribe, () => ids.every((id) => current().has(id)));
    const setAll = (value: boolean) => {
        const next = new Set(current());
        for (const id of ids) {
            if (value) next.add(id);
            else next.delete(id);
        }
        save(next);
    };
    return [all, setAll] as const;
};

/** Forgets every choice (between tests). */
export const resetCollapsed = () => {
    collapsed = new Set();
    try {
        window.localStorage.removeItem(KEY);
    } catch {
        // Nothing to forget.
    }
    for (const listener of listeners) listener();
};
