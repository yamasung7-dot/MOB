# MOP — Mobile Optimization Plugin

A lightweight Blockbench plugin designed to reduce unnecessary editor workload on mobile devices.

## Current prototype — v0.2.0

- Adds a **MOP: Mobile Optimization** toggle to the **Tools** menu.
- Automatically enables itself on Blockbench mobile.
- Disables background preview rendering while Blockbench is unfocused.
- Disables live preview shading while MOP is enabled.
- Restores the user's exact previous settings when MOP is disabled or unloaded.
- Avoids custom render loops and keeps its own runtime overhead intentionally tiny.

## Important design rule

MOP only changes settings that can be applied safely at runtime. Settings that Blockbench marks as requiring a restart, such as anti-aliasing, are deliberately not changed by the live toggle.

## Roadmap

MOP will grow through measured, reversible optimizations rather than a custom renderer or heavy background processing.

Each optimization will be tested individually so we can verify that it actually improves mobile responsiveness without unnecessarily changing the modeling workflow.
