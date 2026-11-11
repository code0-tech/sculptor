import {Flow} from "@code0-tech/sagittarius-graphql-types";

export const chatSetting = (flow: Flow | undefined, identifier: string): string | undefined =>
    flow?.settings?.nodes?.find(setting => setting?.flowSettingIdentifier === identifier)?.value ?? undefined
