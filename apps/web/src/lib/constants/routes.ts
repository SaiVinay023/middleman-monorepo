export const ROUTES = {
  AUTH: {
    LOGIN: '/login',
    SIGNUP: '/signup',
  },
  FREELANCER: {
    DASHBOARD: '/freelancer',
    GIGS: '/freelancer/gigs',
    MY_WORK: '/freelancer/my-gigs',
    PROFILE: '/freelancer/profile',
  },
  COMPANY: {
    DASHBOARD: '/company',
    POST_GIG: '/company/post',
  }
} as const;