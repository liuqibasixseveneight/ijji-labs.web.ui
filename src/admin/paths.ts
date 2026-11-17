/** Admin paths, under the router's `/admin` basename. Never linked from the public site. */
export const adminPaths = {
    overview: '/',
    signIn: '/sign-in',
    deletionRequests: '/deletion-requests',
} as const;
