# Workflow Guards

A workflow guard answers: is this user allowed to perform this action on this record in its current state?

Use guards before mutating data.

## Common Guard Questions

- Is the caller authenticated?
- Does the caller have the required role?
- Does the caller have record-level access to this specific entity?
- Is the target entity active and not deleted?
- Is the entity in a state where this transition is valid?
- Is there an active related record that blocks this action?
- Should this operation be done through a workflow instead of direct edit/delete?

## Device Assignment

Before assigning a device:

- Device exists and is not deleted.
- Device is not disposed/liquidated.
- Device has no active assignment.
- Device has no active repair that should block assignment.
- Target user exists, is active, and is not deleted.

Before accepting assignment:

- Assignment exists.
- Assignment is assigned to current user.
- Assignment is pending/awaiting confirmation.
- Device still has no conflicting active assignment.

Before returning/revoking:

- Assignment is active.
- Caller is admin/manager or the assigned user when allowed.
- Device is not in a conflicting final state.

## Incident Report

Before creating incident:

- Device exists and is not deleted.
- Reporter has access to the device.
- Device status allows incident creation.
- Optional: no duplicate open incident exists for the same device and issue category.

Before approving incident:

- Incident exists.
- Incident is pending.
- Device exists and is still eligible for repair.
- Creating repair will not conflict with active repair rules.

Before deleting incident:

- Do not delete if approved, rejected with audit meaning, or already generated a repair.
- Prefer status transition/cancel workflow over hard delete.

## Repair

Before assigning technician:

- Repair exists and is pending assignment.
- Technician exists, active, and has technician position.
- Device is still repair-eligible.

Before technician accepts/completes/rejects:

- Repair exists.
- Current user is assigned technician.
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
