# Regulatory Mapping

This MVP maps policy controls to institutional control objectives aligned with MiCA and MiFID II RTS 6 style requirements.

## Pre-trade controls
- `limits.max_trade_value`, `limits.max_single_trade`, `limits.max_daily_notional`
  - Used in deterministic pre-trade checks to block oversized orders.

## Kill function
- `controls.kill_switch_enabled`
  - Engine-level deny.
- Contract-level guardian pause:
  - `PolicyRegistry.pause()` halts registry mutation paths quickly.

## Routing and market integrity
- `privacy.large_trade_threshold`, `privacy.large_trade_route`
- `routing.routing_threshold`, `routing.allowed_dexes`
  - Enforces route choice based on policy and trade size.

## Reporting and audit
- `reporting.enabled`, `reporting.report_on`, `reporting.regulator_endpoint`
  - Triggers reporting steps in workflow plans.
- Reconciliation logs terminal workflow outcomes with redaction + encryption at rest.
