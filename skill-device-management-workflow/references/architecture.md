# Architecture Guide

Treat this repository as a layered application:

```text
frontend React
backend Controllers
backend Services/Interfaces
backend Services/Implementations
backend Data/DeviceManagementDbContext
backend Models/Entities and Models/DTOs
SQL Server schema/scripts
```

## Placement Rules

- Controllers handle HTTP concerns: route, request DTO, auth attributes, current user extraction, response codes.
- Services own business workflow: state transition, validation, transaction boundary, history, notification orchestration.
- EF Core queries can remain in services in this codebase; do not introduce a repository layer unless it removes real duplication or the user asks.
- DTOs should not become the source of truth for authorization checks when entity data can be queried directly.
- AutoMapper should map presentation data, not decide business state.

## Change Workflow

Before editing:

- Find the controller endpoint.
- Find the service method it calls.
- Find the entity relationships involved.
- Check DTO mapping for nullable IDs mapped to non-nullable DTO IDs.
- Check whether related modules need state recalculation or history.

During editing:

- Keep controller changes thin when possible.
- Move repeated rule checks into private helper methods or service-level guard methods.
- Do not spread the same authorization rule across many endpoints if a reusable service/helper already exists nearby.
- Avoid large Clean Architecture rewrites inside a feature fix.

## AE21 Analogy

Use this mapping from AE21 concepts:

- `CheckBeforeSave` -> domain guard methods.
- `CheckBeforeDelete` -> delete/dependency guard methods.
- `recalc` -> explicit state recalculation after mutation.
- stored procedure transaction -> application service transaction.

Do not copy AE21 names literally unless requested. Translate the pattern into idiomatic ASP.NET Core service code.
