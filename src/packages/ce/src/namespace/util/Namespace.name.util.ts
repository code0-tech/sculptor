import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {UserService} from "@edition/user/services/User.service";

/**
 * A namespace has no own name. Its display name is derived from its parent:
 * the organization name or the username of the user it belongs to.
 */
export const getNamespaceName = (
    namespace: Namespace | undefined | null,
    organizationService: OrganizationService,
    userService: UserService
): string | undefined => {
    if (!namespace?.parent) return undefined
    if (namespace.parent.__typename === "Organization")
        return organizationService.getById(namespace.parent.id)?.name ?? undefined
    if (namespace.parent.__typename === "User")
        return userService.getById(namespace.parent.id)?.username ?
            `@${userService.getById(namespace.parent.id)?.username}'s workspace` : undefined
    return undefined
}
