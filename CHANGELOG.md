# Changelog

## [0.3.0](https://github.com/lucasilverentand/ha-inhabit/compare/v0.2.1...v0.3.0) (2026-02-13)


### Features

* add devcontainer and docker-compose for local development ([88348e0](https://github.com/lucasilverentand/ha-inhabit/commit/88348e0b603ad46d0b67f131a17277cc7fa0faab))
* add extend buttons on wall endpoints ([060a18e](https://github.com/lucasilverentand/ha-inhabit/commit/060a18e08fbd0e19752408d26d020c33de56905b))
* add full occupancy sensing with mmWave spatial awareness ([5c971b6](https://github.com/lucasilverentand/ha-inhabit/commit/5c971b624258076596e291232f855b19810a5b88))
* add orphan node cleanup, split-at-point, and pinned node support ([72fb825](https://github.com/lucasilverentand/ha-inhabit/commit/72fb825139f8f3c81e4425cc1820b4acf2a0ec04))
* add wall constraint field and batch update API ([5bd7c95](https://github.com/lucasilverentand/ha-inhabit/commit/5bd7c95cf1a3ed088b64290af3832ef2b1538d80))
* add wall constraint solver with tests ([096e3ce](https://github.com/lucasilverentand/ha-inhabit/commit/096e3ced63d84ba32504008418f5a85a77b0d319))
* add zones, furniture shapes, and canvas rendering ([65a28a5](https://github.com/lucasilverentand/ha-inhabit/commit/65a28a5077f9cb5cea23add96f37d368dbc25fb6))
* allow occupancy sensors on rooms/zones without HA area ([2da1c7a](https://github.com/lucasilverentand/ha-inhabit/commit/2da1c7a3945c59fc3330bc6651442e6c35a83d6b))
* animated door/window swing with 85° opening angle ([61bb9d2](https://github.com/lucasilverentand/ha-inhabit/commit/61bb9d230a28aea1f8010c5d10126c3c59544e5c))
* auto-create floor plan without prompting for name ([1c21716](https://github.com/lucasilverentand/ha-inhabit/commit/1c21716b2dc291e9956ee65e74fa7f899a303141))
* auto-fix overconstrained edges on floor load ([20afef8](https://github.com/lucasilverentand/ha-inhabit/commit/20afef8999cd38d234f2c2b52bb02166c91d2fd2))
* batch edge editor, blink feedback, and constraint wall icons ([d9f7743](https://github.com/lucasilverentand/ha-inhabit/commit/d9f774310ad31476e2fa0ac0bc8765902e7c14f4))
* click wall to edit length, remove interior/exterior distinction ([9c1d1e7](https://github.com/lucasilverentand/ha-inhabit/commit/9c1d1e77257dbf4d1b7a6aedb224475690aae770))
* derive room name from assigned HA area, add area/room detection support ([8d2813e](https://github.com/lucasilverentand/ha-inhabit/commit/8d2813e9155e9685ed027934e251e9772afbda3c))
* draggable map and inline wall editor ([6580eb2](https://github.com/lucasilverentand/ha-inhabit/commit/6580eb23e13de6afe662522deb0c5628170ad6cf))
* fix coordinate mapping, auto-constrain shift walls, add floor deletion ([df1fb02](https://github.com/lucasilverentand/ha-inhabit/commit/df1fb0262547f0a127fdb374113a74e58ae78f31))
* improve constraint solver with link groups, N-edge angles, and violation tracking ([18baa4b](https://github.com/lucasilverentand/ha-inhabit/commit/18baa4b1dc247a322e3860932355342f91b7bd4f))
* improve occupancy mode with direct room/zone click and mode isolation ([bb2c9f8](https://github.com/lucasilverentand/ha-inhabit/commit/bb2c9f8fc171cef834ac69b743e95199094610ad))
* redesign toolbar header with HA-themed floor selector dropdown ([60df3bc](https://github.com/lucasilverentand/ha-inhabit/commit/60df3bc806c82933ca87b7bf1bb24a93150d2246))
* remove grid, show wall length, auto-detect rooms ([f9f2025](https://github.com/lucasilverentand/ha-inhabit/commit/f9f202535dbeadae075709bcb2843a67f1db0083))
* rewrite wall-solver with iterative Gauss-Seidel relaxation ([bd494dc](https://github.com/lucasilverentand/ha-inhabit/commit/bd494dcbf0348f1450929ee4db16d7a6e3dbd655))
* split devices into typed placements and render HA icons on canvas ([bd56050](https://github.com/lucasilverentand/ha-inhabit/commit/bd56050c4ce328d5309925492a3fc984c8a23bd4))
* update floorplan builder frontend and rebuild bundle ([ab539fc](https://github.com/lucasilverentand/ha-inhabit/commit/ab539fced922492445680483f7f73da40969bb53))


### Bug Fixes

* update panel registration for HA 2025+ and add setup-dev script ([c8c39b5](https://github.com/lucasilverentand/ha-inhabit/commit/c8c39b596aa9459f8d2c13dd43d508e06f29993d))
* use area-weighted shoelace centroid for room label placement ([37ecb31](https://github.com/lucasilverentand/ha-inhabit/commit/37ecb311e8c25738de261547c1cce1260f8a4cc6))
* use HA theme variables for dark mode support ([16d44f9](https://github.com/lucasilverentand/ha-inhabit/commit/16d44f961ae87d297cbce90c51617f4df6dd04b3))
* use official HA image in docker-compose ([dd20861](https://github.com/lucasilverentand/ha-inhabit/commit/dd2086117b87378dd5630fc88f3987f01ba11681))

## [0.2.0](https://github.com/lucasilverentand/ha-inhabit/compare/v0.1.0...v0.2.0) (2026-01-29)


### Features

* add floor plan icon for integration ([41eaa1e](https://github.com/lucasilverentand/ha-inhabit/commit/41eaa1e8d4c0ae55be01311d5948561304c2eab9))


### Bug Fixes

* add backwards compatibility for ConfigFlowResult ([ea9feb1](https://github.com/lucasilverentand/ha-inhabit/commit/ea9feb1dcce8aa77591cf5648fe9b12a27c1e7c8))
* add binary_sensor.py platform file at integration root ([e05d6b5](https://github.com/lucasilverentand/ha-inhabit/commit/e05d6b5e237a311629baad09b91ba81430e49f43))
* check if panel already registered before re-registering ([88f86f6](https://github.com/lucasilverentand/ha-inhabit/commit/88f86f6156829c00eaefc55681a031baa2017f0c))
* improve HA version compatibility and fix integration tests ([a22ec95](https://github.com/lucasilverentand/ha-inhabit/commit/a22ec95b7010af2d37af3d53bcb6ad3b9e89c517))
* remove editable install that conflicts with integration tests ([0a37a2c](https://github.com/lucasilverentand/ha-inhabit/commit/0a37a2ca0108038765fa61dacc8109afbb2dfabd))
* use async_register_static_paths for HA 2024.7+ compatibility ([a813462](https://github.com/lucasilverentand/ha-inhabit/commit/a8134623ab1c6fc00b7aa9f324634cc45ba61cc2))
* use MockConfigEntry for integration tests ([3a21243](https://github.com/lucasilverentand/ha-inhabit/commit/3a212433462badd7613c7aa53fb3042cf33f7c05))
