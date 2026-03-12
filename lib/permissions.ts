export type AccessLevel = "Root" | "Administrator" | "Officer" | "Technical";
export type Department =
    | "Warehouse & Logistics"
    | "Procurement & Supply"
    | "Finance & Accounting"
    | "Sales & Distribution"
    | "Executive Admin"
    | "Quality Control";

interface User {
    accessLevel: AccessLevel;
    department: Department;
}

export const PERMISSIONS = {
    VIEW_INVENTORY: (user: User) => true, // Everyone can see inventory
    MANAGE_INVENTORY: (user: User) =>
        user.accessLevel === "Root" ||
        user.accessLevel === "Administrator" ||
        user.department === "Warehouse & Logistics" ||
        user.department === "Quality Control",

    VIEW_FINANCE: (user: User) =>
        user.accessLevel === "Root" ||
        user.department === "Finance & Accounting" ||
        user.department === "Executive Admin",

    MANAGE_FINANCE: (user: User) =>
        user.accessLevel === "Root" ||
        (user.accessLevel === "Administrator" && user.department === "Finance & Accounting"),

    VIEW_STAFF: (user: User) =>
        user.accessLevel === "Root" ||
        user.department === "Executive Admin",

    MANAGE_STAFF: (user: User) =>
        user.accessLevel === "Root" ||
        (user.accessLevel === "Administrator" && user.department === "Executive Admin"),

    VIEW_SUPPLIERS: (user: User) => true,
    MANAGE_SUPPLIERS: (user: User) =>
        user.accessLevel === "Root" ||
        user.department === "Procurement & Supply" ||
        user.department === "Executive Admin",

    VIEW_CUSTOMERS: (user: User) => true,
    MANAGE_CUSTOMERS: (user: User) =>
        user.accessLevel === "Root" ||
        user.department === "Sales & Distribution" ||
        user.department === "Executive Admin",

    MANAGE_SETTINGS: (user: User) => user.accessLevel === "Root",
};

export function hasPermission(user: User, permission: keyof typeof PERMISSIONS): boolean {
    if (!user) return false;
    return PERMISSIONS[permission](user);
}
