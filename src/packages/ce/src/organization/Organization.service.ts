import {DOrganizationReactiveService, DOrganizationView} from "@code0-tech/pictor";
import type {
    Organization,
    OrganizationsCreateInput,
    OrganizationsCreatePayload,
    OrganizationsDeleteInput, OrganizationsDeletePayload
} from "@code0-tech/sagittarius-graphql-types";

export class OrganizationService extends DOrganizationReactiveService {

    values(): DOrganizationView[] {
        if (super.values().length > 0) return super.values()
        return super.values()
    }

    deleteById(id: Organization["id"]): void {
        const index = this.values().findIndex(o => o.id === id)
        this.delete(index)
    }

    hasById(id: Organization["id"]): boolean {
        const organization = super.values().find(o => o.id === id)
        return organization !== undefined
    }

    organizationCreate(payload: OrganizationsCreateInput): Promise<OrganizationsCreatePayload | undefined> {
        return Promise.resolve(undefined)
    }

    organizationDelete(payload: OrganizationsDeleteInput): Promise<OrganizationsDeletePayload | undefined> {
        return Promise.resolve(undefined)
    }

}