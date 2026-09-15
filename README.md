# MOP — Mobile Optimization Plugin

A lightweight Blockbench plugin designed to reduce unnecessary editor workload on mobile devices.

## First prototype

- Adds a **MOP: Mobile Optimization** toggle to the **Tools** menu.
- Automatically enables itself on Blockbench mobile.
- Disables background preview rendering while Blockbench is unfocused.
- Restores the user's previous setting when MOP is disabled or unloaded.
- Keeps its own runtime overhead intentionally tiny.

## Roadmap

MOP will grow through measured, reversible optimizations rather than a custom renderer or heavy background processing.

Potential future optimizations will be tested individually so we can verify that they actually improve mobile responsiveness without changing the modeling workflow.
