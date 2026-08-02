export type PermissionCode =
  | "dashboard.view"
  | "member.view"
  | "member.create"
  | "member.update"
  | "member.delete"
  | "merchant.view"
  | "merchant.create"
  | "merchant.update"
  | "merchant.approve"
  | "dealer.view"
  | "dealer.create"
  | "dealer.update"
  | "dealer.approve"
  | "mall.view"
  | "mall.create"
  | "mall.update"
  | "mall.publish"
  | "travel.view"
  | "travel.create"
  | "travel.update"
  | "travel.publish"
  | "finance.view"
  | "finance.manage"
  | "ai.view"
  | "ai.manage"
  | "system.view"
  | "system.manage";


export interface UserPermissionContext {
  permissions: PermissionCode[];
}


export function hasPermission(
  context: UserPermissionContext,
  permission: PermissionCode
): boolean {

  return context.permissions.includes(
    permission
  );

}


export function hasAnyPermission(
  context: UserPermissionContext,
  permissions: PermissionCode[]
): boolean {

  return permissions.some(
    (permission)=>
      context.permissions.includes(permission)
  );

}


export function hasAllPermissions(
  context: UserPermissionContext,
  permissions: PermissionCode[]
): boolean {

  return permissions.every(
    (permission)=>
      context.permissions.includes(permission)
  );

}