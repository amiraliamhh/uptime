# Database Schema Documentation

This document describes all database models and their API handling requirements for the Uptime monitoring backend.

## Table of Contents

- [User Model](#user-model)
- [Organization Model](#organization-model)
- [OrganizationMember Model](#organizationmember-model)
- [Monitoring Model](#monitoring-model)
- [API Validation Rules](#api-validation-rules)
- [Data Relationships](#data-relationships)

---

## User Model

The User model represents authenticated users in the system.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String (ObjectId) | Yes | Unique user identifier |
| `email` | String | Yes | User email address (unique) |
| `password` | String | No | Hashed password (null for OAuth users) |
| `name` | String | No | User's full name |
| `avatar` | String | No | URL to user's avatar image |
| `provider` | String | Yes | Authentication provider ("local" or "google") |
| `googleId` | String | No | Google OAuth ID (unique) |
| `isVerified` | Boolean | Yes | Email verification status (default: false) |
| `resetToken` | String | No | Password reset token |
| `resetExpires` | DateTime | No | Password reset token expiration |
| `createdAt` | DateTime | Yes | Account creation timestamp |
| `updatedAt` | DateTime | Yes | Last update timestamp |

### API Handling

- **Email validation**: Must be a valid email format
- **Password requirements**: Minimum 6 characters (for local auth)
- **Provider validation**: Must be either "local" or "google"
- **Google OAuth**: `googleId` required when `provider` is "google"
- **Password reset**: Tokens expire after 1 hour

---

## Organization Model

The Organization model represents groups of users and their monitoring configurations.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String (ObjectId) | Yes | Unique organization identifier |
| `name` | String | Yes | Organization name |
| `description` | String | No | Organization description |
| `createdAt` | DateTime | Yes | Creation timestamp |
| `updatedAt` | DateTime | Yes | Last update timestamp |

### API Handling

- **Name validation**: Required, minimum 1 character, maximum 100 characters
- **Description validation**: Optional, maximum 500 characters
- **Auto-creation**: Every new user gets a "default" organization
- **Cascade delete**: Deleting organization removes all associated monitorings and members

---

## OrganizationMember Model

The OrganizationMember model manages the many-to-many relationship between users and organizations.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String (ObjectId) | Yes | Unique membership identifier |
| `organizationId` | String (ObjectId) | Yes | Reference to organization |
| `userId` | String (ObjectId) | Yes | Reference to user |
| `role` | String | Yes | Member role ("admin" or "member") |
| `joinedAt` | DateTime | Yes | Join timestamp |

### API Handling

- **Role validation**: Must be either "admin" or "member"
- **Unique constraint**: User can only have one role per organization
- **Admin permissions**: Only admins can add/remove members
- **Cascade delete**: Deleting user or organization removes membership

---

## Monitoring Model

The Monitoring model defines uptime check configurations for websites and services.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String (ObjectId) | Yes | Unique monitoring identifier |
| `organizationId` | String (ObjectId) | Yes | Reference to organization |
| `type` | String | Yes | Monitoring type ("https" or "tcp") |
| `name` | String | Yes | Monitoring name |
| `failThreshold` | Integer | Yes | Failures before alert (default: 3) |
| `checkInterval` | Integer | Yes | Check interval in seconds (default: 300) |
| `checkTimeout` | Integer | Yes | Check timeout in seconds (default: 30) |
| `url` | String | Yes | Target URL for monitoring |
| `httpMethod` | String | Yes | HTTP method (default: "HEAD") |
| `requestHeaders` | JSON | Yes | Request headers array |
| `followRedirects` | Boolean | Yes | Follow redirects (default: true) |
| `expectedStatusCodes` | String[] | Yes | Expected status codes array |
| `expectedResponseHeaders` | JSON | Yes | Expected response headers array |
| `contacts` | String[] | Yes | User IDs to notify on failures |
| `isActive` | Boolean | Yes | Monitoring active status (default: true) |
| `createdAt` | DateTime | Yes | Creation timestamp |
| `updatedAt` | DateTime | Yes | Last update timestamp |

### API Validation Rules

#### Type Validation
- **Required**: Must be present
- **Values**: Only "https" or "tcp" allowed
- **Case sensitive**: Must be lowercase

#### Name Validation
- **Required**: Must be present
- **Length**: 1-100 characters
- **Uniqueness**: Must be unique within organization

#### URL Validation
- **Required**: Must be present
- **Format**: Must be valid URL format
- **Protocols**: 
  - For "https" type: Must start with "https://" or "http://"
  - For "tcp" type: Must be in format "hostname:port"

#### Numeric Field Validation

**Fail Threshold:**
- **Range**: 1-10
- **Default**: 3
- **Type**: Integer

**Check Interval:**
- **Range**: 60-3600 seconds (1 minute to 1 hour)
- **Default**: 300 seconds (5 minutes)
- **Type**: Integer

**Check Timeout:**
- **Range**: 5-120 seconds
- **Default**: 30 seconds
- **Type**: Integer
- **Constraint**: Must be less than checkInterval

#### HTTP Method Validation
- **Required**: Must be present
- **Values**: "GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"
- **Default**: "HEAD"
- **Case sensitive**: Must be uppercase

#### Request Headers (JSON)
- **Format**: Array of objects with "key" and "value" properties
- **Example**: `[{"key": "Authorization", "value": "Bearer token123"}]`
- **Validation**: 
  - Each object must have both "key" and "value"
  - Keys must be valid HTTP header names
  - Values must be strings

#### Expected Status Codes
- **Format**: Array of strings
- **Patterns**: 
  - Single code: "200"
  - Range: "200-299"
  - Multiple: "200", "201", "202"
- **Examples**: `["200-299", "300", "301", "400-499"]`
- **Validation**: Must match pattern `^\d+(-\d+)?$`

#### Expected Response Headers (JSON)
- **Format**: Array of objects with "key" and "value" properties
- **Example**: `[{"key": "Content-Type", "value": "application/json"}]`
- **Validation**: Same as request headers

#### Contacts Validation
- **Format**: Array of user IDs (strings)
- **Required**: At least one contact
- **Validation**: All user IDs must exist in the system
- **Constraint**: All contacts must be members of the same organization

#### Follow Redirects
- **Type**: Boolean
- **Default**: true
- **Note**: Only applicable for "https" type monitoring

---

## API Validation Rules

### General Rules

1. **Authentication**: All endpoints except signup/login require valid JWT token
2. **Authorization**: Users can only access resources from their organizations
3. **Input Validation**: All input must be validated before processing
4. **Error Handling**: Return appropriate HTTP status codes and error messages
5. **Rate Limiting**: Implement rate limiting for sensitive endpoints

### Monitoring-Specific Rules

1. **Organization Access**: Users can only create/modify monitorings in their organizations
2. **Contact Validation**: All contacts must be valid users and organization members
3. **URL Validation**: URLs must be reachable and valid for the specified type
4. **Interval Constraints**: Check timeout must be less than check interval
5. **Status Code Parsing**: Implement proper parsing for status code ranges

### Data Integrity Rules

1. **Cascade Deletes**: 
   - Deleting organization removes all monitorings and members
   - Deleting user removes all memberships
2. **Unique Constraints**:
   - Email addresses must be unique
   - Google IDs must be unique
   - Organization memberships must be unique per user/organization
3. **Foreign Key Constraints**:
   - All foreign key references must exist
   - Use proper ObjectId format for MongoDB references

---

## Data Relationships

```
User (1) ←→ (N) OrganizationMember (N) ←→ (1) Organization (1) ←→ (N) Monitoring
```

### Relationship Details

- **User ↔ OrganizationMember**: One-to-many (user can be in multiple organizations)
- **Organization ↔ OrganizationMember**: One-to-many (organization can have multiple members)
- **Organization ↔ Monitoring**: One-to-many (organization can have multiple monitorings)
- **User ↔ Monitoring**: Many-to-many (through organization membership and contacts)

### Access Patterns

1. **User Access**: Users can only access monitorings from organizations they belong to
2. **Admin Access**: Organization admins can manage all monitorings in their organization
3. **Contact Access**: Users listed as contacts receive notifications for monitoring failures
4. **Public Access**: Health check endpoint is publicly accessible

---

## Example API Payloads

### Create Monitoring

```json
{
  "type": "https",
  "name": "API Health Check",
  "url": "https://api.example.com/health",
  "httpMethod": "GET",
  "checkInterval": 300,
  "checkTimeout": 30,
  "failThreshold": 3,
  "followRedirects": true,
  "requestHeaders": [
    {"key": "Authorization", "value": "Bearer token123"},
    {"key": "Content-Type", "value": "application/json"}
  ],
  "expectedStatusCodes": ["200-299"],
  "expectedResponseHeaders": [
    {"key": "Content-Type", "value": "application/json"}
  ],
  "contacts": ["user_id_1", "user_id_2"]
}
```

### Update Monitoring

```json
{
  "name": "Updated API Health Check",
  "checkInterval": 600,
  "isActive": false
}
```

---

## Error Handling

### Common Error Responses

```json
{
  "error": "Validation failed",
  "details": {
    "type": "Must be 'https' or 'tcp'",
    "checkTimeout": "Must be between 5 and 120 seconds"
  }
}
```

### HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate resource)
- **500**: Internal Server Error

---

## Security Considerations

1. **Input Sanitization**: Sanitize all user inputs
2. **SQL Injection**: Use parameterized queries (Prisma handles this)
3. **XSS Prevention**: Validate and escape output
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **Authentication**: Secure JWT token handling
6. **Authorization**: Proper role-based access control
7. **Data Validation**: Comprehensive input validation
8. **Error Information**: Don't expose sensitive information in errors
