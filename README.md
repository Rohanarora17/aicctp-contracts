# AI YieldFlow Move Contracts

- Build: `aptos move compile --package-dir .`
- Test:  `aptos move test --package-dir .`
- Lint/Format: `move fmt` (from Aptos CLI)

Scaffolded folders:
- `sources/`   — your Move modules go here
- `scripts/`   — Move scripts (optional)
- `tests/`     — Move unit tests

To publish on testnet later, configure `addresses` in `Move.toml` and set your profile via `aptos init`.
