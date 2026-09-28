import { usePage } from '@inertiajs/react';
import type { PageProps, NavigationGroups, User } from '@/types';

/**
 * Hook to access the current user and their role-aware navigation.
 *
 * Returns the authenticated user (or null) and the navigation groups
 * that the server has determined this user is allowed to see.
 *
 * Navigation visibility is a UX convenience only — every route is
 * protected server-side by middleware regardless of what appears here.
 */
export function useAuth() {
    const { auth, navigation } = usePage<PageProps>().props;

    return {
        user: auth.user,
        navigation: navigation ?? ({} as NavigationGroups),
        /** Check if the user holds any of the given roles */
        hasRole: (...roles: string[]) => {
            if (!auth.user) return false;
            return roles.some((r) => auth.user!.roles.includes(r as User['roles'][number]));
        },
    };
}
