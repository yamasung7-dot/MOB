# MOP — Mobile Optimization Plugin

A lightweight Blockbench plugin designed to reduce unnecessary editor workload on mobile devices.

## Current prototype — v0.7.0

- Adds a **MOP: Mobile Optimization** toggle to the **Tools** menu.
- Automatically enables itself on Blockbench mobile.
- Disables background preview rendering while Blockbench is unfocused.
- Disables live preview shading while MOP is enabled.
- Caps Blockbench's preview rendering at **30 FPS** while enabled.
- Disables animation motion trails while enabled.
- Disables element highlighting while enabled to reduce repeated highlight updates during pointer movement and selection changes.
- Disables optional viewport grid geometry while enabled to reduce grid line rendering.
- Disables the large ground-plane mesh while enabled.
- Disables flipbook texture playback during animation previews while enabled to avoid per-frame flipbook updates.
- Disables the 3D paint brush cursor while enabled to avoid extra brush-outline viewport work.
- Disables selection outlines in paint mode while enabled to reduce additional outline rendering.
- Restores the user's exact previous settings when MOP is disabled or unloaded.
- Avoids custom render loops and keeps its own runtime overhead intentionally tiny.

## Why the grid and ground plane are disabled

Blockbench's grid settings feed into `Canvas.buildGrid()`, which constructs viewport grid line geometry. MOP turns off the optional grid layers while optimization mode is active, reducing extra viewport geometry and draw work. Blockbench's ground plane is also a large 4096×4096 Three.js plane, so hiding it removes another persistent viewport mesh from rendering. The original settings are restored when MOP is disabled.

## Why paint helpers are disabled

The 3D brush cursor uses a viewport outline that is updated while painting, and Blockbench's paint-mode selection outlines add additional visible outline geometry. MOP disables these optional helpers during optimization mode. This only affects their visual helpers; painting itself remains available.

## Why flipbook animation is disabled

Blockbench listens for animation frame display events and, when this option is enabled, updates texture flipbook playback for displayed animation frames. MOP disables that optional feature during optimization mode because it is unnecessary during ordinary modeling. The original setting is restored when MOP is disabled.

## Why 30 FPS?

The goal of MOP is to reduce sustained GPU/CPU work rather than make Blockbench render faster. A 30 FPS cap gives the preview a predictable upper bound while leaving Blockbench's normal rendering and input systems in control.

## Important design rule

MOP only changes settings that can be applied safely at runtime. Settings that Blockbench marks as requiring a restart, such as anti-aliasing, are deliberately not changed by the live toggle.

## Roadmap

MOP will grow through measured, reversible optimizations rather than a custom renderer or heavy background processing.

Future candidates will be added only after checking Blockbench's source to confirm that they are live, reversible, and likely to reduce work on mobile hardware.
