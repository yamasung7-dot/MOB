/*
 * MOP — Mobile Optimization Plugin
 * Lightweight, mobile-first Blockbench performance helper.
 */

let mopToggle;
let previousSettings = null;
let previousPixelRatios = new Map();
let enabled = false;
let resizeHandler = null;

const MOP_SETTINGS = [
    'background_rendering', 'shading', 'fps_limit', 'motion_trails',
    'highlight_cubes', 'grids', 'base_grid', 'large_grid', 'full_grid',
    'large_box', 'ground_plane', 'flipbook_textures_in_animation',
    'brush_cursor_3d', 'outlines_in_paint_mode', 'pixel_grid', 'painting_grid'
];

// High-DPI phone screens can make the preview render 4–9× as many pixels
// as a 1× display. Keep the renderer at a modest mobile render scale while
// leaving Blockbench's CSS/layout resolution untouched.
const MOBILE_PIXEL_RATIO_CAP = 1.5;

function readSetting(key) {
    if (typeof settings === 'undefined' || !settings[key]) return undefined;
    return settings[key].value;
}

function writeSetting(key, value) {
    if (typeof settings === 'undefined' || !settings[key]) return false;
    settings[key].value = value;
    return true;
}

function getPreviewCanvases() {
    if (typeof document === 'undefined') return [];
    return Array.from(document.querySelectorAll('.preview canvas'));
}

function applyMobilePixelRatio() {
    if (typeof Blockbench === 'undefined' || !Blockbench.isMobile) return;

    for (const canvas of getPreviewCanvases()) {
        const preview = canvas.preview;
        const renderer = preview && preview.renderer;
        if (!renderer || typeof renderer.setPixelRatio !== 'function') continue;

        if (!previousPixelRatios.has(renderer)) {
            const current = typeof renderer.getPixelRatio === 'function'
                ? renderer.getPixelRatio()
                : window.devicePixelRatio || 1;
            previousPixelRatios.set(renderer, current);
        }

        const target = Math.min(window.devicePixelRatio || 1, MOBILE_PIXEL_RATIO_CAP);
        if (typeof renderer.getPixelRatio !== 'function' || renderer.getPixelRatio() !== target) {
            renderer.setPixelRatio(target);
            if (preview.width && preview.height && typeof renderer.setSize === 'function') {
                renderer.setSize(preview.width, preview.height, false);
            }
        }
    }
}

function restoreMobilePixelRatio() {
    for (const [renderer, ratio] of previousPixelRatios) {
        if (!renderer || typeof renderer.setPixelRatio !== 'function') continue;
        renderer.setPixelRatio(ratio);

        const canvas = renderer.domElement;
        const preview = canvas && canvas.preview;
        if (preview && preview.width && preview.height && typeof renderer.setSize === 'function') {
            renderer.setSize(preview.width, preview.height, false);
        }
    }
    previousPixelRatios.clear();
}

function enableMOP() {
    if (enabled) return;
    previousSettings = {};
    for (const key of MOP_SETTINGS) {
        const value = readSetting(key);
        if (value !== undefined) previousSettings[key] = value;
    }

    writeSetting('background_rendering', false);
    writeSetting('shading', false);
    writeSetting('fps_limit', 30);
    writeSetting('motion_trails', false);
    writeSetting('highlight_cubes', false);
    writeSetting('grids', false);
    writeSetting('base_grid', false);
    writeSetting('large_grid', false);
    writeSetting('full_grid', false);
    writeSetting('large_box', false);
    // Blockbench's ground plane is a 4096×4096 Three.js plane.
    writeSetting('ground_plane', false);
    writeSetting('flipbook_textures_in_animation', false);
    // Paint-mode helpers can add extra viewport geometry/update work.
    writeSetting('brush_cursor_3d', false);
    writeSetting('outlines_in_paint_mode', false);
    // Pixel/painting grids add extra grid geometry and update work in paint/UV modes.
    writeSetting('pixel_grid', false);
    writeSetting('painting_grid', false);

    enabled = true;

    // Blockbench reapplies window.devicePixelRatio during preview resize.
    // Re-apply our cap only after resize events; this is event-driven, not a
    // permanent render loop, so MOP adds no per-frame work of its own.
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        resizeHandler = () => {
            if (!enabled) return;
            if (typeof requestAnimationFrame === 'function') {
                requestAnimationFrame(applyMobilePixelRatio);
            } else {
                applyMobilePixelRatio();
            }
        };
        window.addEventListener('resize', resizeHandler, {passive: true});
    }

    applyMobilePixelRatio();
}

function disableMOP() {
    if (!enabled) return;

    if (resizeHandler && typeof window !== 'undefined') {
        window.removeEventListener('resize', resizeHandler);
        resizeHandler = null;
    }

    restoreMobilePixelRatio();

    if (previousSettings) {
        for (const [key, value] of Object.entries(previousSettings)) {
            writeSetting(key, value);
        }
    }
    previousSettings = null;
    enabled = false;
}

function setMOPEnabled(value) {
    value ? enableMOP() : disableMOP();
    if (mopToggle) mopToggle.updateEnabledState();
}

Plugin.register('mop', {
    title: 'MOP — Mobile Optimization Plugin',
    author: 'yamasung7-dot',
    description: 'Lightweight performance optimizations for Blockbench on mobile devices.',
    icon: 'speed',
    version: '0.9.0',
    variant: 'both',
    min_version: '4.10.0',

    onload() {
        mopToggle = new Action('mop_toggle', {
            name: 'MOP: Mobile Optimization',
            description: 'Toggle MOP mobile performance optimizations',
            icon: 'speed',
            condition: () => true,
            click() {
                setMOPEnabled(!enabled);
                if (typeof Blockbench !== 'undefined' && Blockbench.showQuickMessage) {
                    Blockbench.showQuickMessage(enabled ? 'MOP enabled' : 'MOP disabled', 1000);
                }
            }
        });
        mopToggle.updateEnabledState = function() {
            this.setName(enabled ? 'MOP: Mobile Optimization ✓' : 'MOP: Mobile Optimization');
        };
        if (typeof MenuBar !== 'undefined' && MenuBar.menus && MenuBar.menus.tools) {
            MenuBar.menus.tools.addAction(mopToggle);
        }
        if (typeof Blockbench !== 'undefined' && Blockbench.isMobile) setMOPEnabled(true);
    },

    onunload() {
        disableMOP();
        if (mopToggle) {
            mopToggle.delete();
            mopToggle = null;
        }
    }
});
