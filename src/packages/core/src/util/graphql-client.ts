import {ApolloClient, OperationVariables} from "@apollo/client";
import type {MaybeMasked} from "@apollo/client/masking";

export class GraphqlClient {

    private readonly _client: ApolloClient

    constructor(client: ApolloClient) {
        this._client = client
    }

    async mutate<TData = unknown, TVariables extends OperationVariables = OperationVariables>(
        options: ApolloClient.MutateOptions<TData, TVariables>
    ): Promise<ApolloClient.MutateResult<MaybeMasked<TData>>> {
        return this._client.mutate<TData, TVariables>(options);
    }

    async query<TData = unknown, TVariables extends OperationVariables = OperationVariables>(
        options: ApolloClient.QueryOptions<TData, TVariables>
    ): Promise<ApolloClient.QueryResult<MaybeMasked<TData>>> {
        // 1) Initial request
        const first = await this._client.query<TData, TVariables>(options);
        let aggregated: any = structuredClone(first.data ?? null);
        if (!aggregated || !options.query) return first;

        // 2) AST analysieren: Connection-Spezifikationen sammeln (Pfad + Variablennamen)
        const specs: Array<{ path: string; afterVar?: string; firstVar?: string }> = [];
        const doc: any = options.query;
        const fragments = new Map<string, any>();

        for (const d of doc.definitions ?? []) {
            if (d?.kind === "FragmentDefinition") fragments.set(d.name?.value, d);
        }

        const visitSelections = (set: any, path: string[]) => {
            for (const sel of set?.selections ?? []) {
                if (sel.kind === "Field") {
                    const key = sel.alias?.value ?? sel.name?.value;
                    const nextPath = [...path, key];

                    // Argumente der Connection erfassen (after/first per Variable)
                    let afterVar: string | undefined;
                    let firstVar: string | undefined;
                    for (const arg of sel.arguments ?? []) {
                        const argName = arg.name?.value;
                        if ((argName === "after" || argName === "first") && arg.value?.kind === "Variable") {
                            if (argName === "after") afterVar = arg.value.name?.value;
                            if (argName === "first") firstVar = arg.value.name?.value;
                        }
                    }

                    if (afterVar || firstVar) {
                        specs.push({ path: nextPath.join("."), afterVar, firstVar });
                    }

                    if (sel.selectionSet) visitSelections(sel.selectionSet, nextPath);
                } else if (sel.kind === "InlineFragment") {
                    if (sel.selectionSet) visitSelections(sel.selectionSet, path);
                } else if (sel.kind === "FragmentSpread") {
                    const frag = fragments.get(sel.name?.value);
                    if (frag?.selectionSet) visitSelections(frag.selectionSet, path);
                }
            }
        };

        const op = doc.definitions?.find((d: any) => d.kind === "OperationDefinition");
        if (op?.selectionSet) visitSelections(op.selectionSet, []);

        // uniq by path
        const seen = new Set<string>();
        const uniqSpecs = specs.filter(s => (seen.has(s.path) ? false : (seen.add(s.path), true)));
        if (uniqSpecs.length === 0) return first;

        // 3) Inline-Helfer (lokal)
        const getAt = (obj: any, p: string) =>
            p.split(".").filter(Boolean).reduce((o, k) => (o ? o[k] : undefined), obj);

        const setAt = (obj: any, p: string, v: any) => {
            const ks = p.split(".").filter(Boolean);
            const last = ks.pop();
            if (!last) return;
            const parent = ks.reduce((o, k) => (o[k] ??= {}), obj);
            parent[last] = v;
        };

        const mergeConn = (t: any, s: any) => {
            if (!t || !s) return;
            if (Array.isArray(t.nodes) && Array.isArray(s.nodes)) t.nodes = [...t.nodes, ...s.nodes];
            if (Array.isArray(t.edges) && Array.isArray(s.edges)) t.edges = [...t.edges, ...s.edges];
            if (s.pageInfo) {
                t.pageInfo = {
                    ...t.pageInfo,
                    ...s.pageInfo,
                    endCursor: s.pageInfo.endCursor ?? t.pageInfo?.endCursor,
                };
            }
            if (typeof t.count === "number" && typeof s.count === "number") {
                t.count = Math.max(t.count, s.count);
            }
        };

        // 4) Sequentiell nachladen, bis keine Connection mehr hasNextPage hat
        while (true) {
            // Nächste Connection mit restlichen Seiten finden
            const next = uniqSpecs.find(s => {
                const c = getAt(aggregated, s.path);
                return !!c?.pageInfo?.hasNextPage && !!c?.pageInfo?.endCursor;
            });
            if (!next) break;

            // Variablen für die nächste Page
            const nextVars: Record<string, any> = { ...(options.variables as any) };
            if (next.afterVar) {
                nextVars[next.afterVar] = getAt(aggregated, next.path)?.pageInfo?.endCursor;
            }
            if (next.firstVar && nextVars[next.firstVar] == null && (options.variables as any)?.[next.firstVar] != null) {
                nextVars[next.firstVar] = (options.variables as any)[next.firstVar];
            }

            // Page-Request (netzwerkbasiert, um sicher zu gehen)
            const page = await this._client.query<TData, TVariables>({
                ...options,
                variables: nextVars as TVariables,
                fetchPolicy: options.fetchPolicy ?? "network-only",
            });

            const pageData: any = page.data ?? null;
            if (!pageData) break;

            // Nur die betroffene Connection zusammenführen
            const src = getAt(pageData, next.path);
            const tgt = getAt(aggregated, next.path);
            if (!src || !tgt) break;

            mergeConn(tgt, src);
            setAt(aggregated, next.path, tgt);
        }

        return { ...first, data: aggregated };
    }

}