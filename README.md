# MOP — Mobile Optimization Plugin

A lightweight Blockbench plugin designed to reduce unnecessary editor workload on mobile devices.

## Current prototype — v0.3.0

- Adds a **MOP: Mobile Optimization** toggle to the **Tools** menu.
- Automatically enables itself on Blockbench mobile.
- Disables background preview rendering while Blockbench is unfocused.
- Disables live preview shading while MOP is enabled.
- Caps Blockbench's preview rendering at **30 FPS** while enabled.
- Disables animation motion trails while enabled.
- Restores the user's exact previous settings when MOP is disabled or unloaded.
- Avoids custom render loops and keeps its own runtime overhead intentionally tiny.

## Why 30 FPS?

The goal of MOP is to reduce sustained GPU/CPU work rather than make Blockbench render faster. A 30 FPS cap gives the preview a predictable upper bound while leaving Blockbench's normal rendering and input systems in control.

## Important design rule

MOP only changes settings that can be applied safely at runtime. Settings that Blockbench marks as requiring a restart, such as anti-aliasing, are deliberately not changed by the live toggle.

## Roadmap

MOP will grow through measured, reversible optimizations rather than a custom renderer or heavy background processing.

Future candidates will be added only after checking Blockbench's source to confirm that they are live, reversible, and likely to reduce work on mobile hardware.
