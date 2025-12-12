# Documentation Audit Report

## 1. Summary
The project root contains several markdown files that appear to be transient (migration instructions) or misplaced (documentation mixed with config). I propose cleaning up the root directory and consolidating documentation into the `docs/` folder.

## 2. Files to Delete (Obsolete/Transient)

| File | Reason |
|------|--------|
| `APPLY_MIGRATION_NOW.md` | Transient instruction file for a specific migration that appears to be completed (`20251212000000_create_feature_access_system.sql`). |
| `MIGRATION_INSTRUCTIONS.md` | Redundant with above, detailed steps for a past migration. |
| `plan.md` | Implementation plan for "Granular Feature Access Control". This feature is now implemented (see `IMPLEMENTATION_SUMMARY.md` and `docs/feature-access-control.md`). |

## 3. Files to Move (Consolidation)

I recommend moving these files to `docs/` to unclutter the project root:

| Current Path | New Path | Reason |
|--------------|----------|--------|
| `bonus-calculation-design.md` | `docs/bonus-calculation-design.md` | Core design documentation should be grouped. |
| `PRODUCT_REQUIREMENTS.md` | `docs/product-requirements.md` | Core PRD should be grouped. |
| `IMPLEMENTATION_SUMMARY.md` | `docs/feature-access-implementation-summary.md` | Rename for clarity and group with other docs. |

## 4. Files to Update

| File | Update Required |
|------|----------------|
| `README.md` | 1. Update links to the moved files above.<br>2. Add missing reference to `docs/payroll-calculation-system.md`.<br>3. Add missing reference to `docs/feature-access-control.md`. |

## 5. Files to Keep (No Changes)

- `docs/employee-detail-page.md`
- `docs/feature-access-control.md`
- `docs/payroll-calculation-system.md`
- `package.json` (Not a doc, but checked)

## 6. Action Plan
1. Delete the 3 obsolete files.
2. Create `docs/product-requirements.md`, `docs/bonus-calculation-design.md`, `docs/feature-access-implementation-summary.md` with content from root files.
3. Delete the original files from root.
4. Update `README.md` to reflect new paths and add missing documentation links.
