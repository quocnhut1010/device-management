# Security Checklist

Use this checklist whenever adding or modifying an endpoint, controller, service method, upload feature, or query that returns user-visible data.

## Endpoint Authorization

Check every endpoint for:

- `[Authorize]` when authentication is required.
- Correct role restriction for admin-only operations.
- Record-level authorization after loading the target record.
- No trust in route IDs, query IDs, or body IDs without checking ownership/access.

Record-level authorization examples:

- Admin can access all.
- Technician can access repairs assigned to them.
- Employee can access their own assigned devices and incident reports.
- Department manager can access users/devices in their department when that rule exists.

## Query Filtering

For list/search endpoints:

- Non-admin queries must be scoped before returning data.
- Avoid fetching all data and filtering only in frontend.
- If multiple sensitive filters are provided, each filter must be authorized.
- Do not expose all endpoints to broad roles unless the service filters by caller scope.

## File Upload

For upload endpoints:

- Require authentication.
- Check record-level permission before saving files.
- Validate extension allowlist.
- Validate content size.
- Generate server-side file names.
- Avoid trusting original file names.
- Save outside sensitive directories or expose only intended static paths.
- Consider content-type validation if production hardening is requested.

## Debug and Error Exposure

Before production:

- Remove public debug controllers/endpoints.
- Do not return stack traces to normal clients.
- Do not commit secrets in appsettings or source.
- Restrict CORS to known frontend origins.
- Avoid exposing raw exception messages when they may include DB/internal details.

## Data Integrity

Security-sensitive updates should not depend only on controller checks. Service methods should also guard critical mutations, especially when they can be called from more than one endpoint.
