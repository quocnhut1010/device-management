---
name: device-management-workflow
description: Use when creating, modifying, or reviewing features in the Device Management project, especially workflow guards, state recalculation, transactions, history logging, and endpoint security.
---

# Device Management Workflow

Use this skill for the `device-management` repository.

The project is a layered application:

```text
React UI -> ASP.NET Core Controllers -> Services -> EF Core DbContext -> SQL Server
```

The main goal is to move feature work away from simple CRUD and toward explicit production workflow rules:

- Guard before changing data.
- Use transaction for multi-table workflows.
- Recalculate derived state after mutations.
- Write history/notification records when needed.
- Check endpoint security and record-level authorization.

## First Steps

1. Read the relevant controller, service, entity, DTO, AutoMapper profile, and DB script/migration before editing.
2. Identify the workflow, not just the endpoint.
3. Ask what state transitions and related records can be affected.
4. Keep edits aligned with the existing layered style unless the task asks for a larger refactor.
5. Prefer narrow production-useful changes over broad architecture rewrites.

## Reference Routing

- For architectural placement and file responsibilities, read `references/architecture.md`.
- For add/edit/delete/approve/assign workflow checks, read `references/workflow-guards.md`.
- For device, assignment, incident, repair, replacement, and disposal state updates, read `references/state-recalculation.md`.
- For endpoint security, upload handling, secrets, debug endpoints, and record-level authorization, read `references/security-checklist.md`.

## Default Implementation Shape

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
  -> write device/history/notification records as applicable
  -> save/commit
```

Do not set important workflow status blindly when it can be derived from active related records. Prefer a method such as:

```csharp
await RecalculateDeviceStatusAsync(deviceId);
```

## High-Risk Modules

Prioritize careful guard, transaction, recalculation, and security checks in:

- Device assignment: assign, accept, reject, return/revoke.
- Incident report: create, approve, reject, create repair.
- Repair: assign technician, accept, complete, reject, confirm completion, upload images.
- Device history: read filtering, manual log creation, bulk log creation.
- Replacement and disposal/liquidation: validate availability and active references.

## Output Expectations

When finishing a change, summarize:

- The workflow protected or changed.
- The guard/recalc/transaction/history behavior added.
- Any build or test command run.
- Any remaining risk if the environment cannot build or test.
