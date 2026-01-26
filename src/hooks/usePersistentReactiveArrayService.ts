"use client";

import React from "react";
import type {ArrayService} from "@code0-tech/pictor/dist/utils/arrayService";
import type {ReactiveArrayStore} from "@code0-tech/pictor/dist/utils/reactiveArrayService";
import {Payload, View} from "@code0-tech/pictor/dist/utils/view";

export type ArrayServiceCtor<R extends Payload, S extends ArrayService<View<R>, R>> = new (store: ReactiveArrayStore<View<R>>) => S;
export type ServiceFactory<R extends Payload, S extends ArrayService<View<R>, R>> = ArrayServiceCtor<R, S> | ((store: ReactiveArrayStore<View<R>>) => S);
type InitialArg<R extends Payload, S extends ArrayService<View<R>, R>> = View<R>[] | ((svc: S) => View<R>[]);

type Listener = () => void;

type PersistentEntry<R extends Payload, S extends ArrayService<View<R>, R>> = {
    service: S;
    store: ReactiveArrayStore<View<R>>;
    getSnapshot: () => View<R>[];
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

function isConstructor<R extends Payload, S extends ArrayService<View<R>, R>>(value: ServiceFactory<R, S>): value is ArrayServiceCtor<R, S> {
    return typeof value === "function" && !!value.prototype && value.prototype.constructor === value;
}

function instantiateService<R extends Payload, S extends ArrayService<View<R>, R>>(factory: ServiceFactory<R, S>, store: ReactiveArrayStore<View<R>>): S {
    return isConstructor(factory)
        ? new factory(store)
        : factory(store);
}

function ensureEntry<R extends Payload, S extends ArrayService<View<R>, R>>(key: string, factory: ServiceFactory<R, S>, initial: InitialArg<R, S>): PersistentEntry<R, S> {
    const map = registry();
    const existing = map.get(key);
    if (existing) {
        return existing as PersistentEntry<R, S>;
    }

    const listeners = new Set<Listener>();
    let snapshot: View<R>[] = Array.isArray(initial) ? [...initial] : [];

    const store: ReactiveArrayStore<View<R>> = {
        getState: () => snapshot,
        setState: (update) => {
            snapshot = typeof update === "function" ? (update as (prev: View<R>[]) => View<R>[])(snapshot) : update;
            listeners.forEach((listener) => listener());
        },
    };

    const service = instantiateService(factory, store);

    if (typeof initial === "function") {
        snapshot = initial(service);
    }

    const entry: PersistentEntry<R, S> = {
        service,
        store,
        getSnapshot: () => snapshot,
        listeners,
    };

    map.set(key, entry as PersistentEntry<any, any>);
    return entry;
}

export function usePersistentReactiveArrayService<R extends Payload, S extends ArrayService<View<R>, R>>(
    key: string,
    factory: ServiceFactory<R, S>,
    initial: InitialArg<R, S> = []
): [View<R>[], S] {
    const entry = React.useMemo(() => ensureEntry(key, factory, initial), [key, factory, initial]);

    const subscribe = React.useCallback((listener: Listener) => {
        entry.listeners.add(listener);
        return () => entry.listeners.delete(listener);
    }, [entry]);

    const state = React.useSyncExternalStore(subscribe, entry.getSnapshot, entry.getSnapshot);

    return [state, entry.service];
}
