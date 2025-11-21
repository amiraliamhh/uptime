/**
 * Application-wide configuration limits
 */
export const limits = {
  // Maximum number of organizations a user can create
  maxOrganizationsPerUser: 3,
  
  // Maximum number of monitors per organization
  maxMonitorsPerOrganization: 20,
} as const;

export type Limits = typeof limits;

