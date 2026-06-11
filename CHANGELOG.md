# Changelog

## [Unreleased]

### Added

- Project initialization and scaffold setup.
- WeChat Mini Game config (game.json, project.config.json).
- Core framework: SceneManager, GameLoop, InputManager, PixelRenderer.
- UI components: Button, ProgressBar, DialogBox, StatsPanel.
- Data layer: rules, monsters, items, achievements definitions.
- Entity system: Player, Monster, Particle.
- Scenes: Boot, Title, Home, Challenge, Battle, Boss, GameOver.
- Storage system with cross-day detection and auto-reset logic.
- 8-bit audio generation via Web Audio API.
- Testing guide (docs/TESTING.md) with full test checklist.
- Deployment guide (docs/DEPLOY.md) with submission process.

### Fixed

- Cross-day detection logic: `completedRules` no longer cleared in `completeDay()`; `checkNewDay()` handles clearing and reset.
- BOSS milestone detection: use `completedDays` instead of `day` for correct 7/14/21/... trigger.
- BOSS tracking: `defeatedBosses` now records `completedDays`.
- Pixel sprite rendering: direct Canvas fillRect with proper scaling.
- Label text: replace generic `constructor.name` with "勇者".
- Removed unused PixelRenderer import from HomeScene.
- .gitignore: added WeChat Mini Game entries.
