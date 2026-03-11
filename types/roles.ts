// ── User roles ─────────────────────────────────────────────────────────────
// Matches the `role` field set in Clerk's publicMetadata for each user.
export type UserRole = "admin" | "moderator" | "user";

// ── Navigation link ────────────────────────────────────────────────────────
// Used by NavBar to define each route entry.
export interface NavLink {
    name: string;
    href: string;
    /** If set, only users with this role (or admin) can see the link. */
    requiredRole?: UserRole;
}