/*
 * MOP — Mobile Optimization Plugin
 * Lightweight, mobile-first Blockbench performance helper.
 */

let mopToggle;
let previousSettings = null;
let enabled = false;

// Only use settings that are known to be live and reversible.
// Hardware acceleration and anti-aliasing are intentionally excluded because
// Blockbench marks those settings as requiring a restart.
const MOP_SETTINGS = [
    'background_rendering',
    'shading',
    'fps_limit',
    'motion_trails'
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

    // Avoid rendering the viewport while Blockbench is in the background.
    writeSetting('background_rendering', false);

    // Disable live preview shading. Blockbench applies this through its normal
    // shading update path, so MOP does not create another render loop.
    writeSetting('shading', false);

    // Cap the preview render loop at a mobile-friendly 30 FPS. Blockbench's
    // own preview loop reads this setting every frame, so no extra timer is
    // needed in MOP.
    writeSetting('fps_limit', 30);

    // Motion trails add scene/animation work and are not needed for ordinary
    // modeling. They are restored exactly when MOP is disabled.
    writeSetting('motion_trails', false);

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
    version: '0.3.0',
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
                    Blockbench.showQuickMessage(
                        enabled ? 'MOP enabled' : 'MOP disabled',
                        1000
                    );
                }
            }
        });

        mopToggle.updateEnabledState = function() {
            this.setName(enabled ? 'MOP: Mobile Optimization ✓' : 'MOP: Mobile Optimization');
        };

        // Put the toggle in Blockbench's Tools menu.
        if (typeof MenuBar !== 'undefined' && MenuBar.menus && MenuBar.menus.tools) {
            MenuBar.menus.tools.addAction(mopToggle);
        }

        // Mobile users get the optimization enabled by default; desktop/web
        // users can still enable it manually from the Tools menu.
        if (typeof Blockbench !== 'undefined' && Blockbench.isMobile) {
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
