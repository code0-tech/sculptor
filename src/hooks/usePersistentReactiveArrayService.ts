"use client";

import React from "react";
import type {ArrayService} from "@code0-tech/pictor/dist/utils/arrayService";
import type {ReactiveArrayStore} from "@code0-tech/pictor/dist/utils/reactiveArrayService";

export type ArrayServiceCtor<K, S extends ArrayService<K>> = new (store: ReactiveArrayStore<K>) => S;
export type ServiceFactory<K, S extends ArrayService<K>> = ArrayServiceCtor<K, S> | ((store: ReactiveArrayStore<K>) => S);
type InitialArg<K, S extends ArrayService<K>> = K[] | ((svc: S) => K[]);

type Listener = () => void;

type PersistentEntry<K, S extends ArrayService<K>> = {
    service: S;
    store: ReactiveArrayStore<K>;
    getSnapshot: () => K[];
    listeners: Set<Listener>;
};

type Registry = Map<string, PersistentEntry<any, any>>;

declare global {
    // eslint-disable-next-line no-var
    var __sculptorPersistentReactiveServices: Registry | undefined;
}

const registry = (): Registry => {
    if (!globalThis.__sculptorPersistentReactiveServices) {
        globalThis.__sculptorPersistentReactiveServices = new Map();
    }
    return globalThis.__sculptorPersistentReactiveServices;
};

function isConstructor<K, S extends ArrayService<K>>(value: ServiceFactory<K, S>): value is ArrayServiceCtor<K, S> {
    return typeof value === "function" && !!value.prototype && value.prototype.constructor === value;
}

function instantiateService<K, S extends ArrayService<K>>(factory: ServiceFactory<K, S>, store: ReactiveArrayStore<K>): S {
    return isConstructor(factory)
        ? new factory(store)
        : factory(store);
}

function ensureEntry<K, S extends ArrayService<K>>(key: string, factory: ServiceFactory<K, S>, initial: InitialArg<K, S>): PersistentEntry<K, S> {
    const map = registry();
    const existing = map.get(key);
    if (existing) {
        return existing as PersistentEntry<K, S>;
    }

    const listeners = new Set<Listener>();
    let snapshot: K[] = Array.isArray(initial) ? [...initial] : [];

    const store: ReactiveArrayStore<K> = {
        getState: () => snapshot,
        setState: (update) => {
            snapshot = typeof update === "function" ? (update as (prev: K[]) => K[])(snapshot) : update;
            listeners.forEach((listener) => listener());
        },
    };

    const service = instantiateService(factory, store);

    if (typeof initial === "function") {
        snapshot = initial(service);
    }

    const entry: PersistentEntry<K, S> = {
        service,
        store,
        getSnapshot: () => snapshot,
        listeners,
    };

    map.set(key, entry as PersistentEntry<any, any>);
    return entry;
}

export function usePersistentReactiveArrayService<K, S extends ArrayService<K>>(
    key: string,
    factory: ServiceFactory<K, S>,
    initial: InitialArg<K, S> = []
): [K[], S] {
    const entry = React.useMemo(() => ensureEntry(key, factory, initial), [key, factory, initial]);

    const subscribe = React.useCallback((listener: Listener) => {
        entry.listeners.add(listener);
        return () => entry.listeners.delete(listener);
    }, [entry]);

    const state = React.useSyncExternalStore(subscribe, entry.getSnapshot, entry.getSnapshot);

    return [state, entry.service];
}
