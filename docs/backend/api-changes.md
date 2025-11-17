# API Changes Documentation

## Overview
This document outlines the recent changes made to existing APIs in the backend.

## Changes Summary

### 1. Profile API - Added `hasOrganization` Property

**Endpoint:** `GET /api/v1/auth/profile`

**Change:** Added a new boolean property `hasOrganization` to the user object in the response.

**Response Structure:**
```json
{
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "avatar": "...",
    "provider": "...",
    "isVerified": false,
    "roles": [],
    "hasOrganization": true,  // NEW: Indicates if user belongs to at least one organization
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Purpose:** Allows frontend to determine if a user needs to create or join an organization before accessing organization-specific features.

---

### 2. Signup API - Removed Default Organization Creation

**Endpoint:** `POST /api/v1/auth/signup`

**Change:** Removed automatic creation of a default organization during user signup.

**Before:**
- User signup automatically created a "default" organization
- User was automatically added as admin of that organization
- Response included organization details

**After:**
- User signup only creates the user account
- No organization is created automatically
- Response includes `hasOrganization: false`
- Users must create or join an organization separately

**Response Structure:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "...",
    "email": "...",
    "hasOrganization": false  // NEW: Always false on signup
  },
  "token": "..."
}
```

**Breaking Change:** Yes - clients expecting an organization in the signup response will need to be updated.

---

### 3. Monitor APIs - Organization ID Now Required as Path Parameter

**Change:** All monitor endpoints now require `organizationId` as a path parameter instead of inferring it from the user's organizations.

**New Route Structure:**
All monitor endpoints are now nested under organizations:
- `GET /api/v1/organizations/:organizationId/monitors`
- `POST /api/v1/organizations/:organizationId/monitors`
- `GET /api/v1/organizations/:organizationId/monitors/:id`
- `PUT /api/v1/organizations/:organizationId/monitors/:id`
- `DELETE /api/v1/organizations/:organizationId/monitors/:id`
- `GET /api/v1/organizations/:organizationId/monitors/:id/logs`
- `GET /api/v1/organizations/:organizationId/monitors/:id/summaries`
- `GET /api/v1/organizations/:organizationId/monitors/:id/uptime`

**Old Routes (Deprecated):**
- `GET /api/v1/monitors`
- `POST /api/v1/monitors`
- `GET /api/v1/monitors/:id`
- `PUT /api/v1/monitors/:id`
- `DELETE /api/v1/monitors/:id`
- `GET /api/v1/monitors/:id/logs`
- `GET /api/v1/monitors/:id/summaries`
- `GET /api/v1/monitors/:id/uptime`

**Security Changes:**
- All endpoints now verify that the user is a member of the specified organization
- Returns `403 Forbidden` if user is not a member
- Validates that the monitor belongs to the specified organization

**Breaking Change:** Yes - all monitor API calls must be updated to include `organizationId` in the path.

**Example:**
```bash
# Old
GET /api/v1/monitors/:id

# New
GET /api/v1/organizations/:organizationId/monitors/:id
```

---

## Migration Guide

### For Frontend Developers

1. **Update Profile Handling:**
   - Check `user.hasOrganization` to determine if user needs to create/join an organization
   - Show organization creation/join UI if `hasOrganization === false`

2. **Update Signup Flow:**
   - Remove any code expecting an organization in the signup response
   - After signup, redirect users to organization creation/join flow if needed

3. **Update Monitor API Calls:**
   - All monitor endpoints now require `organizationId` in the URL path
   - Update all API calls to use the new nested route structure
   - Ensure you have the `organizationId` available before making monitor API calls

### Example Code Updates

**Before:**
```javascript
// Get monitors
GET /api/v1/monitors

// Get monitor details
GET /api/v1/monitors/123
```

**After:**
```javascript
// Get monitors (requires organizationId)
GET /api/v1/organizations/org-123/monitors

// Get monitor details (requires organizationId)
GET /api/v1/organizations/org-123/monitors/123
```

---

## Benefits

1. **Explicit Organization Context:** All monitor operations now explicitly require organization context, making the API more RESTful and clear.

2. **Better Security:** Organization membership is verified on every request, preventing unauthorized access.

3. **Flexible User Management:** Users can exist without organizations, allowing for invitation-based workflows.

4. **Clearer API Design:** Nested routes make the relationship between organizations and monitors explicit.

---

## Date of Changes
January 2024

