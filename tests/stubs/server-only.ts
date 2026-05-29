// Stub for the `server-only` package used during Vitest runs.
//
// In Next.js builds, `server-only` resolves to an empty module under the
// `react-server` export condition. Vitest uses Node's default condition,
// which would otherwise throw at module load. This stub keeps the import
// inert so server modules can be unit-tested in isolation.
export {}
