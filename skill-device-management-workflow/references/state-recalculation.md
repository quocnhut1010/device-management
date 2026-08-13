# State Recalculation

Use recalculation when a status can be affected by more than one module. Do not blindly set a status if related records can make that status wrong.

## Device Status Priority

A safe recalculation should derive from database facts in priority order:

1. Disposed/liquidated records or final disposal status -> disposed.
2. Active replacement/disposal workflow that blocks use -> pending replacement/disposal when modeled.
3. Active repair -> under repair.
4. Active assignment -> in use.
5. No active assignment/repair/disposal -> available.

The exact enum/string names must match the existing project model.

## When To Recalculate Device Status

Call recalculation after:

- Assigning a device.
- User accepts or rejects assignment.
- Returning/revoking assignment.
- Creating repair from incident.
- Assigning, accepting, completing, rejecting, or confirming repair.
- Creating or approving replacement.
- Creating or approving disposal/liquidation.
- Deleting or soft-deleting records that influence device state.

## Suggested Service Shape

Prefer one central method:

```csharp
Task RecalculateDeviceStatusAsync(Guid deviceId)
```

It should:

- Load the device.
- Query active related records.
- Pick the correct status by priority.
- Update only if the status changed.
- Be called inside the same transaction as the workflow mutation.

## Related Recalculations

Consider similar recalculation methods when the project needs them:

- `RecalculateIncidentStatusAsync(incidentId)`
- `RecalculateRepairStatusAsync(repairId)`
- `RecalculateAssignmentStatusAsync(assignmentId)`
- `RecalculateUserDeviceSummaryAsync(userId)`

## History

When recalculation changes a visible business state, write history/audit once with:

- Device ID.
- Action/action type.
- User who caused the workflow.
- Short description of the state transition.

Avoid writing duplicate history for the same transition.
