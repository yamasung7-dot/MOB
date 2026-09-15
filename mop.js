/*
 * MOP — Mobile Optimization Plugin
 * Lightweight, mobile-first Blockbench performance helper.
 */

let mopToggle;
let previousSettings = null;
let enabled = false;

const MOP_SETTINGS = [
    'background_rendering', 'shading', 'fps_limit', 'motion_trails',
    'highlight_cubes', 'grids', 'base_grid', 'large_grid', 'full_grid',
    'large_box', 'ground_plane', 'flipbook_textures_in_animation'
];

function readSetting(key) {
    if (typeof settings === 'undefined' || !settings[key]) return undefined;
    return settings[key].value;
}

function writeSetting(key, value) {
    if (typeof settings === 'undefined' || !settings[key]) return false;
    settings[key].value = value;
    return true;
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

    enabled = true;
}

function disableMOP() {
    if (!enabled) return;
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
    version: '0.6.0',
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
