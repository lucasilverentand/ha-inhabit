# Changelog

## [0.12.1](https://github.com/lucasilverentand/ha-inhabit/compare/v0.12.0...v0.12.1) (2026-03-08)


### Bug Fixes

* mmWave targets now trigger room/zone occupancy ([59ec309](https://github.com/lucasilverentand/ha-inhabit/commit/59ec3091cad98279aa9c7438d63a72d165573063))

## [0.12.0](https://github.com/lucasilverentand/ha-inhabit/compare/v0.11.0...v0.12.0) (2026-03-07)


### Features

* color device icons by type in view mode ([412aecd](https://github.com/lucasilverentand/ha-inhabit/commit/412aecdad615526061fe6ec6a944f904ee6adf24))

## [0.11.0](https://github.com/lucasilverentand/ha-inhabit/compare/v0.10.0...v0.11.0) (2026-03-07)


### Features

* mmWave targets match all overlapping rooms and zones ([0a86956](https://github.com/lucasilverentand/ha-inhabit/commit/0a86956736c04791f22b574dca0c29ab64fff989))
* refine view mode — hide labels, sweeps, and clean up device icons ([4110c4c](https://github.com/lucasilverentand/ha-inhabit/commit/4110c4cc798646bc9bcc22e8f075d98c0063cbae))

## [0.10.0](https://github.com/lucasilverentand/ha-inhabit/compare/v0.9.0...v0.10.0) (2026-03-06)


### Features

* add transition predictor with phantom presence for zone chaining ([a25fc28](https://github.com/lucasilverentand/ha-inhabit/commit/a25fc282beecd2c8f0a71faccd5a9ee6fadb48b4))
* improve zone vertex editing, snapping, and canvas UX ([9a1d329](https://github.com/lucasilverentand/ha-inhabit/commit/9a1d329da403e2d266028ac1a0de575b158a9e86))


### Bug Fixes

* resolve all lint violations and broken tests ([8daf6e9](https://github.com/lucasilverentand/ha-inhabit/commit/8daf6e93a192684e1b97728d4535236656978ef1))

## [0.9.0](https://github.com/lucasilverentand/ha-inhabit/compare/v0.8.0...v0.9.0) (2026-03-05)


### Features

* add standalone mmWave target simulation script ([9bf2208](https://github.com/lucasilverentand/ha-inhabit/commit/9bf22080f52423be5e5cde2f9972d3f05602994c))
* render mmWave targets on floor plan with smooth animation ([aa3c144](https://github.com/lucasilverentand/ha-inhabit/commit/aa3c144bb0daed6774151ebd1ca11c41460bfc64))


### Bug Fixes

* correct mmWave local-to-world coordinate transform ([10d852a](https://github.com/lucasilverentand/ha-inhabit/commit/10d852aa7381dd8ce94418bea8181fc18f486ad7))

## [0.8.0](https://github.com/lucasilverentand/ha-inhabit/compare/v0.7.0...v0.8.0) (2026-03-04)


### Features

* add multi-layer room background images with layer panel ([32e3aae](https://github.com/lucasilverentand/ha-inhabit/commit/32e3aaebdc0fdfb944d36d4f9e4eb3b157e77ccb))
* decouple mmWave entity binding and broaden target entity picker ([ade584e](https://github.com/lucasilverentand/ha-inhabit/commit/ade584e6cf5760b0833e89339bfd7f15d18b9acc))

## [0.7.0](https://github.com/lucasilverentand/ha-inhabit/compare/v0.6.0...v0.7.0) (2026-03-04)


### Features

* add "other" device type, mmWave multi-target tracking, viewer device toggle, and unified entity picker ([004b618](https://github.com/lucasilverentand/ha-inhabit/commit/004b618b6636160756c6d99b7c0ccec5af9d9277))

## [0.6.0](https://github.com/lucasilverentand/ha-inhabit/compare/v0.5.0...v0.6.0) (2026-03-02)


### Features

* add Done button to editor toolbar to exit editing mode ([10b4968](https://github.com/lucasilverentand/ha-inhabit/commit/10b4968921f1247a6123816ba72752516c5dff45))

## [0.5.0](https://github.com/lucasilverentand/ha-inhabit/compare/v0.4.1...v0.5.0) (2026-03-02)


### Features

* add pinch-to-zoom and improve mobile touch navigation ([4fb1538](https://github.com/lucasilverentand/ha-inhabit/commit/4fb15386362e57d8f5bdc2e21d1aeb6630e5e1bb))


### Bug Fixes

* move edit button to right side of viewer toolbar and hide on mobile ([bc422cf](https://github.com/lucasilverentand/ha-inhabit/commit/bc422cf014ac53959b7733bff90ecf78439b4f12))

## [0.4.1](https://github.com/lucasilverentand/ha-inhabit/compare/v0.4.0...v0.4.1) (2026-03-01)


### Bug Fixes

* remove floor plan name from viewer toolbar ([ed23b80](https://github.com/lucasilverentand/ha-inhabit/commit/ed23b80621b5fc29fe55b5f1835b4c72822dc671))

## [0.4.0](https://github.com/lucasilverentand/ha-inhabit/compare/v0.3.0...v0.4.0) (2026-02-26)


### Features

* add admin-only guards to all write WebSocket handlers ([03cd5f4](https://github.com/lucasilverentand/ha-inhabit/commit/03cd5f4fff314ef95bf12878e74915b20f7f1ef3))
* clean up HA devices on room/floor/floor plan deletion ([a6bbb9c](https://github.com/lucasilverentand/ha-inhabit/commit/a6bbb9c4fd5a2f89dff7e62f6b5317b54f8d2965))


### Bug Fixes

* bump dependency versions to resolve security vulnerabilities ([93109ee](https://github.com/lucasilverentand/ha-inhabit/commit/93109ee28f7ad7e9fb380e29f6012fb1ae65aa24))

## [0.3.0](https://github.com/lucasilverentand/ha-inhabit/compare/v0.2.1...v0.3.0) (2026-02-25)


### Features

* add adaptive timeouts and time-of-day profiles ([ed02511](https://github.com/lucasilverentand/ha-inhabit/commit/ed0251136024d7f0ad4c73fdd61710ed8b18d080))
* add button as placeable device type on floor plan ([801854b](https://github.com/lucasilverentand/ha-inhabit/commit/801854ba89e2d5168c1ebd01422a658048445f89))
* add CHECKING state events and occupancy history tracking ([2749619](https://github.com/lucasilverentand/ha-inhabit/commit/274961918cd1d4eeb2f3473dd8e545122d8a1453))
* add devcontainer and docker-compose for local development ([88348e0](https://github.com/lucasilverentand/ha-inhabit/commit/88348e0b603ad46d0b67f131a17277cc7fa0faab))
* add door seal logic, house guard, hold-until-exit, and occupies-parent ([2e2a6a0](https://github.com/lucasilverentand/ha-inhabit/commit/2e2a6a03c854ed4f53cabacf1af6cf74e2a6e6cc))
* add entity picker dialog with search, multi-select, and duplicate prevention ([1ebc4fa](https://github.com/lucasilverentand/ha-inhabit/commit/1ebc4fa92ecca77afd6e0563ebd75bfa47e5704a))
* add extend buttons on wall endpoints ([060a18e](https://github.com/lucasilverentand/ha-inhabit/commit/060a18e08fbd0e19752408d26d020c33de56905b))
* add full occupancy sensing with mmWave spatial awareness ([5c971b6](https://github.com/lucasilverentand/ha-inhabit/commit/5c971b624258076596e291232f855b19810a5b88))
* add occupancy override button entity per room/zone ([45e3c59](https://github.com/lucasilverentand/ha-inhabit/commit/45e3c595ca324b8728b5786427014c2491e65053))
* add orphan node cleanup, split-at-point, and pinned node support ([72fb825](https://github.com/lucasilverentand/ha-inhabit/commit/72fb825139f8f3c81e4425cc1820b4acf2a0ec04))
* add override feedback controller for self-correcting occupancy ([d01dcec](https://github.com/lucasilverentand/ha-inhabit/commit/d01dcecfc10d91534c3652e6746cf3da2752a3fe))
* add self-correcting learning system to occupancy engine ([9d14e13](https://github.com/lucasilverentand/ha-inhabit/commit/9d14e1337ddde9f40abccfbe4c8c453595916614))
* add self-correcting occupancy with feedback controller and false vacancy detection ([9c1a447](https://github.com/lucasilverentand/ha-inhabit/commit/9c1a44760be2c27f33e8d1235a631ff371bacf8d))
* add sensor reliability tracking with dynamic weight adjustment ([bda5061](https://github.com/lucasilverentand/ha-inhabit/commit/bda50610f98cc8df27a7c187b057929d88ab17b7))
* add space-to-pan for canvas navigation ([d30c500](https://github.com/lucasilverentand/ha-inhabit/commit/d30c5001ab7d6ccb26fc24198862d7ff237c4727))
* add wall constraint field and batch update API ([5bd7c95](https://github.com/lucasilverentand/ha-inhabit/commit/5bd7c95cf1a3ed088b64290af3832ef2b1538d80))
* add wall constraint solver with tests ([096e3ce](https://github.com/lucasilverentand/ha-inhabit/commit/096e3ced63d84ba32504008418f5a85a77b0d319))
* add zones, furniture shapes, and canvas rendering ([65a28a5](https://github.com/lucasilverentand/ha-inhabit/commit/65a28a5077f9cb5cea23add96f37d368dbc25fb6))
* allow occupancy sensors on rooms/zones without HA area ([2da1c7a](https://github.com/lucasilverentand/ha-inhabit/commit/2da1c7a3945c59fc3330bc6651442e6c35a83d6b))
* animated door/window swing with 85° opening angle ([61bb9d2](https://github.com/lucasilverentand/ha-inhabit/commit/61bb9d230a28aea1f8010c5d10126c3c59544e5c))
* auto-create floor plan without prompting for name ([1c21716](https://github.com/lucasilverentand/ha-inhabit/commit/1c21716b2dc291e9956ee65e74fa7f899a303141))
* auto-fix overconstrained edges on floor load ([20afef8](https://github.com/lucasilverentand/ha-inhabit/commit/20afef8999cd38d234f2c2b52bb02166c91d2fd2))
* batch edge editor, blink feedback, and constraint wall icons ([d9f7743](https://github.com/lucasilverentand/ha-inhabit/commit/d9f774310ad31476e2fa0ac0bc8765902e7c14f4))
* bind physical button press to occupancy override toggle ([2b346b1](https://github.com/lucasilverentand/ha-inhabit/commit/2b346b1e27bd7bbcd8c5e9aab1473b7cc3dba65c))
* click wall to edit length, remove interior/exterior distinction ([9c1d1e7](https://github.com/lucasilverentand/ha-inhabit/commit/9c1d1e77257dbf4d1b7a6aedb224475690aae770))
* derive room name from assigned HA area, add area/room detection support ([8d2813e](https://github.com/lucasilverentand/ha-inhabit/commit/8d2813e9155e9685ed027934e251e9772afbda3c))
* draggable map and inline wall editor ([6580eb2](https://github.com/lucasilverentand/ha-inhabit/commit/6580eb23e13de6afe662522deb0c5628170ad6cf))
* fix coordinate mapping, auto-constrain shift walls, add floor deletion ([df1fb02](https://github.com/lucasilverentand/ha-inhabit/commit/df1fb0262547f0a127fdb374113a74e58ae78f31))
* improve constraint solver with link groups, N-edge angles, and violation tracking ([18baa4b](https://github.com/lucasilverentand/ha-inhabit/commit/18baa4b1dc247a322e3860932355342f91b7bd4f))
* improve occupancy mode with direct room/zone click and mode isolation ([bb2c9f8](https://github.com/lucasilverentand/ha-inhabit/commit/bb2c9f8fc171cef834ac69b743e95199094610ad))
* redesign toolbar header with HA-themed floor selector dropdown ([60df3bc](https://github.com/lucasilverentand/ha-inhabit/commit/60df3bc806c82933ca87b7bf1bb24a93150d2246))
* remove grid, show wall length, auto-detect rooms ([f9f2025](https://github.com/lucasilverentand/ha-inhabit/commit/f9f202535dbeadae075709bcb2843a67f1db0083))
* replace boolean door seal with probabilistic decay ([cb41727](https://github.com/lucasilverentand/ha-inhabit/commit/cb417278be5d80d196ade5e95bbedcd77a32f765))
* replace presence sensor bindings with spatial hitbox detection ([8ca696c](https://github.com/lucasilverentand/ha-inhabit/commit/8ca696cb5e0479e0cf40692f45b208a732b7cf14))
* rewrite wall-solver with iterative Gauss-Seidel relaxation ([bd494dc](https://github.com/lucasilverentand/ha-inhabit/commit/bd494dcbf0348f1450929ee4db16d7a6e3dbd655))
* split devices into typed placements and render HA icons on canvas ([bd56050](https://github.com/lucasilverentand/ha-inhabit/commit/bd56050c4ce328d5309925492a3fc984c8a23bd4))
* update floorplan builder frontend and rebuild bundle ([ab539fc](https://github.com/lucasilverentand/ha-inhabit/commit/ab539fced922492445680483f7f73da40969bb53))
* wire mmWave spatial presence into occupancy state machine ([b0d43dc](https://github.com/lucasilverentand/ha-inhabit/commit/b0d43dc3cb9263c0b51f93f532ff9fc8f6cce905))
* wire PresenceAggregator into occupancy state machine ([aa6ee02](https://github.com/lucasilverentand/ha-inhabit/commit/aa6ee02c01b90a09bc111fced8eca5eecf47db69))


### Bug Fixes

* add simulation toggle within occupancy mode ([c85ae7b](https://github.com/lucasilverentand/ha-inhabit/commit/c85ae7b5861fb280514b88201bbdd7c32481a496))
* address multiple bugs, memory leaks, and UX issues ([9b27f4d](https://github.com/lucasilverentand/ha-inhabit/commit/9b27f4deb1ca17b8d1ccced76c7ff5cf326b4342))
* center room focus animation accounting for occupancy panel offset ([8655dd1](https://github.com/lucasilverentand/ha-inhabit/commit/8655dd126aa9f7aedef104da67f05b1769c53162))
* clean up orphaned sensor entities and configs ([e3be417](https://github.com/lucasilverentand/ha-inhabit/commit/e3be41767ce3b455b939889a9d537a058d28ebb5))
* don't dim zones and wall-mounted devices inside focused room ([777d7a8](https://github.com/lucasilverentand/ha-inhabit/commit/777d7a8e30f2bcf80aad7e8ed21966ca428acf1c))
* resolve Phase 1 merge conflicts and fix seal integration tests ([05f77aa](https://github.com/lucasilverentand/ha-inhabit/commit/05f77aa536b0160dd874da3a7d6ff4ffc4cd5ff9))
* toolbar stability guards + add Playwright E2E tests ([bfd5016](https://github.com/lucasilverentand/ha-inhabit/commit/bfd5016ed371b2bbe170be529ce3e61917ee0f7f))
* update panel registration for HA 2025+ and add setup-dev script ([c8c39b5](https://github.com/lucasilverentand/ha-inhabit/commit/c8c39b596aa9459f8d2c13dd43d508e06f29993d))
* update QoL test mocks for aggregator threshold gate ([5c5bc77](https://github.com/lucasilverentand/ha-inhabit/commit/5c5bc77ffd2b6c9786f96fdc0133f87c1a5ad0ad))
* update qs to 6.15.0 (CVE-2026-2391) ([904bbac](https://github.com/lucasilverentand/ha-inhabit/commit/904bbac2bc4bd9472ab1895a1e1a2773c946bd45))
* use area-weighted shoelace centroid for room label placement ([37ecb31](https://github.com/lucasilverentand/ha-inhabit/commit/37ecb311e8c25738de261547c1cce1260f8a4cc6))
* use HA theme variables for dark mode support ([16d44f9](https://github.com/lucasilverentand/ha-inhabit/commit/16d44f961ae87d297cbce90c51617f4df6dd04b3))
* use official HA image in docker-compose ([dd20861](https://github.com/lucasilverentand/ha-inhabit/commit/dd2086117b87378dd5630fc88f3987f01ba11681))


### Reverts

* restore floor selector dropdown, remove broken tab bar ([5eb4d12](https://github.com/lucasilverentand/ha-inhabit/commit/5eb4d12e3cb78fb60e60c75b6571b9fb698f68ea))

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
