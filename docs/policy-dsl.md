# Policy DSL

Policy files are YAML and validated by `dsl/schemas/policy.schema.json`.

## Required top-level keys
- `id`, `version`, `schema_version`
- `jurisdiction`, `regulation`
- `assets`, `privacy`, `routing`, `limits`, `reporting`, `controls`

## Versioning and compatibility
- `schema_version` is required and currently locked to `1.0.0`.
- Unsupported schema versions are rejected during validation.
- Compiler outputs include:
  - `schemaVersion`
  - `compilerVersion`
  - `compiledAt`

## Example
See `dsl/samples/eurofund.mica.yaml`.
