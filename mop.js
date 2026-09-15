/*
 * MOP — Mobile Optimization Plugin
 * Lightweight, mobile-first Blockbench performance helper.
 */

let mopToggle;
let previousSettings = null;
let enabled = false;

const MOP_SETTINGS = [
    'background_rendering'
];

function readSetting(key) {
    return typeof settings !== 'undefined' && settings[key] ? settings[key].value : undefined;
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

    // Do not keep rendering the viewport when Blockbench is in the background.
    writeSetting('background_rendering', false);
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
    version: '0.1.0',
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
                Blockbench.showQuickMessage(
                    enabled ? 'MOP enabled' : 'MOP disabled',
                    1000
                );
            }
        });

        mopToggle.updateEnabledState = function() {
            this.setIcon(enabled ? 'speed' : 'speed');
            this.setName(enabled ? 'MOP: Mobile Optimization ✓' : 'MOP: Mobile Optimization');
        };

        // Put the toggle in Blockbench's Tools/Toolbox menu.
        if (MenuBar && MenuBar.menus && MenuBar.menus.tools) {
            MenuBar.menus.tools.addAction(mopToggle);
        }

        // Mobile users get the optimization enabled by default; desktop users can
        // still enable it manually from the Tools menu.
        if (Blockbench && Blockbench.isMobile) {
            setMOPEnabled(true);
        }
    },

    onunload() {
        disableMOP();
        if (mopToggle) {
            mopToggle.delete();
            mopToggle = null;
        }
    }
});
