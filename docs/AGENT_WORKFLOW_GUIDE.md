# Agent Workflow Guide for Device Management

Use this guide when creating, modifying, or reviewing features in this repository.

The project is a layered application:

```text
React UI -> ASP.NET Core Controllers -> Services -> EF Core DbContext -> SQL Server
```

The goal is to avoid simple CRUD-only changes for business workflows. Important changes should follow this shape:

```text
Controller
  -> authenticate/authorize request
  -> call service

Service
  -> load required records
  -> guard/check whether action is allowed
  -> transaction
  -> mutate records
  -> recalculate derived state
  -> write history/notification records if needed
  -> save/commit
```

## Architecture Rules

- Controllers handle HTTP concerns: route, request DTO, auth attributes, current user, response codes.
- Services own business workflow: state transition, validation, transaction, history, notification orchestration.
- EF Core queries can stay in services for this project; do not add repository/unit-of-work layers unless they reduce real duplication.
- DTOs are not the source of truth for security checks. Query entity data directly for sensitive authorization decisions.
- AutoMapper maps data for responses; it should not decide business state.
- Keep edits narrow unless the task explicitly asks for a larger refactor.

AE21 analogy:

- CheckBeforeSave -> domain guard / validation method.
- CheckBeforeDelete -> delete/dependency guard method.
- Recalc -> state recalculation method.
- Stored procedure transaction -> application service transaction.

## Workflow Guards

Before mutating data, always ask:

- Is the caller authenticated?
- Does the caller have the required role?
- Does the caller have access to this specific record?
- Is the target entity active and not deleted?
- Is the current state valid for this transition?
- Is there an active related record that blocks the action?
- Should this operation be a workflow instead of direct edit/delete?

## Device Assignment Guards

Before assigning a device:

- Device exists and is not deleted.
- Device is not disposed/liquidated.
- Device has no active assignment.
- Device has no active repair that should block assignment.
- Target user exists, is active, and is not deleted.

Before accepting assignment:

- Assignment exists.
- Assignment belongs to the current user.
- Assignment is pending/awaiting confirmation.
- Device still has no conflicting active assignment.

Before returning/revoking:

- Assignment is active.
- Caller is admin/manager or the assigned user when allowed.
- Device is not in a conflicting final state.

## Incident Guards

Before creating incident:

- Device exists and is not deleted.
- Reporter has access to the device.
- Device status allows incident creation.
- Consider blocking duplicate open incidents for the same device/problem.

Before approving incident:

- Incident exists.
- Incident is pending.
- Device exists and is still repair-eligible.
- Creating repair will not conflict with active repair rules.

Before deleting incident:

- Do not delete if approved, rejected with audit meaning, or already generated a repair.
- Prefer status transition/cancel workflow over hard delete.

## Repair Guards

Before assigning technician:

- Repair exists and is pending assignment.
- Technician exists, active, and has technician position.
- Device is still repair-eligible.

Before technician accepts/completes/rejects:

- Repair exists.
- Current user is the assigned technician.
- Repair is in the correct state for the requested transition.

Before uploading repair images:

- Current user is the assigned technician.
- Repair exists and is in a state where images are allowed.
- File validation passes.

## Delete Guards

Do not allow direct delete when records are referenced by workflow data:

- Device with assignment, incident, repair, history, replacement, or disposal records.
- User with assigned devices, repairs, incident reports, or history.
- Department/category/model/supplier referenced by active devices or users.
- Repair that has started, completed, generated history, or has uploaded images.

Prefer soft delete or status transition when the record has business history.

## State Recalculation

Do not blindly set important workflow status if related records can make that status wrong.

Avoid this pattern:

```csharp
device.Status = "Available";
```

Prefer this pattern:

```csharp
await RecalculateDeviceStatusAsync(deviceId);
```

A safe device status recalculation should derive from database facts in priority order:

1. Disposed/liquidated records or final disposal status -> disposed.
2. Active replacement/disposal workflow that blocks use -> pending replacement/disposal when modeled.
3. Active repair -> under repair.
4. Active assignment -> in use.
5. No active assignment/repair/disposal -> available.

Use the exact enum/string names already defined in the project.

Call recalculation after:

- Assigning a device.
- User accepts or rejects assignment.
- Returning/revoking assignment.
- Creating repair from incident.
- Assigning, accepting, completing, rejecting, or confirming repair.
- Creating or approving replacement.
- Creating or approving disposal/liquidation.
- Deleting or soft-deleting records that influence device state.

Suggested method shape:

```csharp
Task RecalculateDeviceStatusAsync(Guid deviceId)
```

It should:

- Load the device.
- Query active related records.
- Pick the correct status by priority.
- Update only if the status changed.
- Run inside the same transaction as the workflow mutation.

## Security Checklist

For every endpoint, check:

- Has `[Authorize]` when authentication is required.
- Has correct role restriction for admin-only operations.
- Has record-level authorization after loading the target record.
- Does not trust route IDs, query IDs, or body IDs without ownership/access checks.

Record-level authorization examples:

- Admin can access all.
- Technician can access repairs assigned to them.
- Employee can access their own assigned devices and incident reports.
- Department manager can access users/devices in their department when that rule exists.

For list/search endpoints:

- Non-admin queries must be scoped before returning data.
- Do not fetch all data and filter only in frontend.
- If multiple sensitive filters are provided, each filter must be authorized.
- Do not expose all endpoints to broad roles unless the service filters by caller scope.

For upload endpoints:

- Require authentication.
- Check record-level permission before saving files.
- Validate extension allowlist.
- Validate content size.
- Generate server-side file names.
- Avoid trusting original file names.
- Save only to intended static paths.

Before production:

- Remove public debug endpoints.
- Do not return stack traces to normal clients.
- Do not commit secrets in appsettings or source.
- Restrict CORS to known frontend origins.
- Avoid exposing raw exception messages when they may include DB/internal details.

## High-Risk Modules

Apply guard, transaction, recalculation, and history checks carefully in:

- Device assignment: assign, accept, reject, return/revoke.
- Incident report: create, approve, reject, create repair.
- Repair: assign technician, accept, complete, reject, confirm completion, upload images.
- Device history: read filtering, manual log creation, bulk log creation.
- Replacement and disposal/liquidation: validate availability and active references.

## Final Change Summary Template

When finishing a change, summarize:

- Workflow protected or changed.
- Guard/recalc/transaction/history behavior added.
- Build/test command run.
- Remaining risk if the environment cannot build or test.
