// JSDoc typedefs are documentation-only — runtime is plain JS so Vercel can
// build these functions without an extra TypeScript toolchain.

/**
 * @typedef {Object} IndexedPolicy
 * @property {string} policyId
 * @property {string} hash
 * @property {string} uri
 * @property {boolean} active
 * @property {number} updatedAt
 */

/**
 * @typedef {Object} IndexedWorkflow
 * @property {string} runId
 * @property {string} workflowId
 * @property {string} policyId
 * @property {"succeeded"|"reverted"|"partial_fill"|"timed_out"|"cancelled"|"running"|"denied"} state
 * @property {string} auditPath
 * @property {number} updatedAt
 * @property {("safe"|"escalated"|"blocked")=} pathType
 */

/**
 * @typedef {"healthy"|"degraded"|"fallback"} TrustStatus
 */

/**
 * @template T
 * @typedef {Object} SourceResult
 * @property {T} data
 * @property {"live"|"fallback"} source
 * @property {TrustStatus} trustStatus
 * @property {string=} reasonCode
 * @property {string=} recoveryAction
 */

export {};
