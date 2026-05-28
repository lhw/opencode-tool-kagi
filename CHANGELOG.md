# Changelog

## [1.0.4](https://github.com/lhw/opencode-tool-kagi/compare/v1.0.3...v1.0.4) (2026-05-28)


### Bug Fixes

* hoist files variable out of try block in setup ([04e9968](https://github.com/lhw/opencode-tool-kagi/commit/04e9968c977491a9e6f936d07b9024b671d0a0f3))

## [1.0.3](https://github.com/lhw/opencode-tool-kagi/compare/v1.0.2...v1.0.3) (2026-05-28)


### Bug Fixes

* add --uninstall flag and fix tsx+Node26 module resolution ([95a53e4](https://github.com/lhw/opencode-tool-kagi/commit/95a53e4422c1e65ef4047e0b3919fd4f55de1133))
* make tool files self-contained with zod import, drop _factories dependency ([df94f64](https://github.com/lhw/opencode-tool-kagi/commit/df94f64536133305ae4cc8304063104610e541f0))

## [1.0.2](https://github.com/lhw/opencode-tool-kagi/compare/v1.0.1...v1.0.2) (2026-05-28)


### Bug Fixes

* define tool() locally to avoid tsx+Node26 exports resolution bug ([50224a0](https://github.com/lhw/opencode-tool-kagi/commit/50224a083a18282658afbb18d54859031dfeab7b))
* remove registry-url from publish workflow for OIDC compat ([6bde96e](https://github.com/lhw/opencode-tool-kagi/commit/6bde96e642e93131bd29282b47750e3857eac81b))
* restore registry-url and add --provenance for OIDC ([5e9b2a6](https://github.com/lhw/opencode-tool-kagi/commit/5e9b2a6dc4349a0b9c8c90a32f6203a1561bb832))
* switch publish workflow to npm trusted publishing (OIDC) ([df8b259](https://github.com/lhw/opencode-tool-kagi/commit/df8b25953420b4e0e5aabb37212b35cddfa48ab6))
* use PAT for release-please to trigger publish workflow ([9d9cb8f](https://github.com/lhw/opencode-tool-kagi/commit/9d9cb8f056e1dccb06449981fb8fd73487709e18))

## [1.0.1](https://github.com/lhw/opencode-tool-kagi/compare/v1.0.0...v1.0.1) (2026-05-28)


### Bug Fixes

* ensure .env and build artifacts in gitignore ([d4df8f5](https://github.com/lhw/opencode-tool-kagi/commit/d4df8f563f6953bcf9c4d1fe46d98f4c6600f01c))
* ensure node_modules in gitignore ([1105faa](https://github.com/lhw/opencode-tool-kagi/commit/1105faa5818cbf102f8687ee60171737471eb3d4))

## 1.0.0 (2026-05-28)


### Features

* add release-please and npm publish workflows ([1073b58](https://github.com/lhw/opencode-tool-kagi/commit/1073b58e131fbadee3a07f68f3d9dd00a9d4091a))


### Bug Fixes

* add types node to tsconfig for TypeScript 6 compat ([ee4ed90](https://github.com/lhw/opencode-tool-kagi/commit/ee4ed900cacbc18c10aabc44ae893adaedcd4f2a))
* add types node to tsconfig for TypeScript 6, revert TS dep to ^5.0.0 on main ([d8aa68c](https://github.com/lhw/opencode-tool-kagi/commit/d8aa68c0876e2abc0cdb9b67c2ccbccde9d0651b))
* bin/setup.mjs ([37d755c](https://github.com/lhw/opencode-tool-kagi/commit/37d755c0d17190a422bb8b308b73a79c46973861))
* grant write permissions to release-please workflow ([0386299](https://github.com/lhw/opencode-tool-kagi/commit/038629993178266a407988f41a1633bb3376f389))
* revert to GITHUB_TOKEN, repo now allows Actions PR creation ([244d7ca](https://github.com/lhw/opencode-tool-kagi/commit/244d7ca57b5f2c43dd2148878f08885973dd5b74))
* use PAT instead of GITHUB_TOKEN for release-please ([eb0e28f](https://github.com/lhw/opencode-tool-kagi/commit/eb0e28f438e37dcfea55d62b1e7522c97ccd44fb))
