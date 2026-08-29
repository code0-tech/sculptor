import {ReactiveArrayService, ReactiveArrayStore} from "@code0-tech/pictor";
import {Query} from "@code0-tech/sagittarius-graphql-types";
import {Payload, View} from "@code0-tech/pictor/dist/utils/view";
import {GraphqlClient} from "@core/util/graphql-client";
import applicationUsageQuery from "@edition/usage/services/queries/ApplicationUsage.query.graphql";
import namespaceUsageQuery from "@edition/usage/services/queries/NamespaceUsage.query.graphql";
import projectUsageQuery from "@edition/usage/services/queries/ProjectUsage.query.graphql";
import flowUsageQuery from "@edition/usage/services/queries/FlowUsage.query.graphql";

export type UsageLevel = "application" | "namespace" | "project" | "flow"

export type LicenseLevel = "application" | "namespace"

export interface UsageLimits {
    workflow: number | undefined
    ai: number | undefined
}

export interface UsageRange {
    afterDate: string
    beforeDate: string
}

export interface UsageEntry extends Payload {
    id: string
    level: UsageLevel
    aiCount: number
    aiValue: number
    runtimeCount: number
    runtimeValue: number
}

export class UsageService extends ReactiveArrayService<UsageEntry> {

    protected readonly client: GraphqlClient

    constructor(client: GraphqlClient, store: ReactiveArrayStore<View<UsageEntry>>) {
        super(store)
        this.client = client
    }

    getApplicationUsage(range: UsageRange): UsageEntry | undefined {
        const cached = this.values().find(entry => entry && entry.id === "application")
        if (cached) return cached

        this.client.query<Query>({
            query: applicationUsageQuery,
            variables: {
                afterDate: range.afterDate,
                beforeDate: range.beforeDate,
                aggregation: "MONTH"
            }
        }).then(result => {
            const application = result.data?.application
            if (!application || this.values().find(entry => entry && entry.id === "application")) return
            this.add(new View({
                id: "application",
                level: "application",
                aiCount: (application.aiUsage ?? []).reduce((total, bucket) => total + (bucket?.usage ?? 0), 0),
                aiValue: (application.aiUsage ?? []).reduce((total, bucket) => total + (bucket?.value ?? 0), 0),
                runtimeCount: (application.runtimeUsage ?? []).reduce((total, bucket) => total + (bucket?.usage ?? 0), 0),
                runtimeValue: (application.runtimeUsage ?? []).reduce((total, bucket) => total + (bucket?.value ?? 0), 0)
            }))
        })

        return undefined
    }

    getNamespaceUsage(namespaceId: string, range: UsageRange): UsageEntry | undefined {
        const cached = this.values().find(entry => entry && entry.id === namespaceId)
        if (cached) return cached

        this.client.query<Query>({
            query: namespaceUsageQuery,
            variables: {
                namespaceId,
                afterDate: range.afterDate,
                beforeDate: range.beforeDate,
                aggregation: "MONTH"
            }
        }).then(result => {
            const namespace = result.data?.namespace
            if (!namespace || this.values().find(entry => entry && entry.id === namespaceId)) return
            this.add(new View({
                id: namespaceId,
                level: "namespace",
                aiCount: (namespace.aiUsage ?? []).reduce((total, bucket) => total + (bucket?.usage ?? 0), 0),
                aiValue: (namespace.aiUsage ?? []).reduce((total, bucket) => total + (bucket?.value ?? 0), 0),
                runtimeCount: (namespace.runtimeUsage ?? []).reduce((total, bucket) => total + (bucket?.usage ?? 0), 0),
                runtimeValue: (namespace.runtimeUsage ?? []).reduce((total, bucket) => total + (bucket?.value ?? 0), 0)
            }))
        })

        return undefined
    }

    getProjectUsage(namespaceId: string, projectId: string, range: UsageRange): UsageEntry | undefined {
        const cached = this.values().find(entry => entry && entry.id === projectId)
        if (cached) return cached

        this.client.query<Query>({
            query: projectUsageQuery,
            variables: {
                namespaceId,
                projectId,
                afterDate: range.afterDate,
                beforeDate: range.beforeDate,
                aggregation: "MONTH"
            }
        }).then(result => {
            const project = result.data?.namespace?.project
            if (!project || this.values().find(entry => entry && entry.id === projectId)) return
            this.add(new View({
                id: projectId,
                level: "project",
                aiCount: (project.aiUsage ?? []).reduce((total, bucket) => total + (bucket?.usage ?? 0), 0),
                aiValue: (project.aiUsage ?? []).reduce((total, bucket) => total + (bucket?.value ?? 0), 0),
                runtimeCount: (project.runtimeUsage ?? []).reduce((total, bucket) => total + (bucket?.usage ?? 0), 0),
                runtimeValue: (project.runtimeUsage ?? []).reduce((total, bucket) => total + (bucket?.value ?? 0), 0)
            }))
        })

        return undefined
    }

    getFlowUsage(namespaceId: string, projectId: string, flowId: string, range: UsageRange): UsageEntry | undefined {
        const cached = this.values().find(entry => entry && entry.id === flowId)
        if (cached) return cached

        this.client.query<Query>({
            query: flowUsageQuery,
            variables: {
                namespaceId,
                projectId,
                flowId,
                afterDate: range.afterDate,
                beforeDate: range.beforeDate,
                aggregation: "MONTH"
            }
        }).then(result => {
            const flow = result.data?.namespace?.project?.flow
            if (!flow || this.values().find(entry => entry && entry.id === flowId)) return
            this.add(new View({
                id: flowId,
                level: "flow",
                aiCount: (flow.aiUsage ?? []).reduce((total, bucket) => total + (bucket?.usage ?? 0), 0),
                aiValue: (flow.aiUsage ?? []).reduce((total, bucket) => total + (bucket?.value ?? 0), 0),
                runtimeCount: (flow.runtimeUsage ?? []).reduce((total, bucket) => total + (bucket?.usage ?? 0), 0),
                runtimeValue: (flow.runtimeUsage ?? []).reduce((total, bucket) => total + (bucket?.value ?? 0), 0)
            }))
        })

        return undefined
    }

}
