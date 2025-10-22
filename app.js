// ===== TG Data Inspector - Main Application =====

// Global State
let dataSrc = null;
let sensorIntervals = {
    accelerometer: null,
    gyroscope: null
};

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    if (dataSrc && dataSrc.logs) {
        logEvent('error:global', e.error?.message || 'Unknown error');
    }
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    if (dataSrc && dataSrc.logs) {
        logEvent('error:promise', e.reason?.message || 'Promise rejection');
    }
});

// Sensor update functions for Telegram WebApp API
function updateAccelerometerData() {
    try {
        if (window.Telegram?.WebApp?.Accelerometer) {
            const accel = window.Telegram.WebApp.Accelerometer;
            if (accel.isStarted) {
                dataSrc.sensors.accelerometer.x = accel.x || 0;
                dataSrc.sensors.accelerometer.y = accel.y || 0;
                dataSrc.sensors.accelerometer.z = accel.z || 0;
            }
        }
    } catch (e) {
        console.error('Error updating accelerometer:', e);
    }
}

function updateGyroscopeData() {
    try {
        if (window.Telegram?.WebApp?.Gyroscope) {
            const gyro = window.Telegram.WebApp.Gyroscope;
            if (gyro.isStarted) {
                dataSrc.sensors.gyroscope.alpha = gyro.x || 0;
                dataSrc.sensors.gyroscope.beta = gyro.y || 0;
                dataSrc.sensors.gyroscope.gamma = gyro.z || 0;
            }
        }
    } catch (e) {
        console.error('Error updating gyroscope:', e);
    }
}

function updateOrientationData() {
    try {
        if (window.Telegram?.WebApp?.DeviceOrientation) {
            const orient = window.Telegram.WebApp.DeviceOrientation;
            if (orient.isStarted) {
                // DeviceOrientation provides absolute and relative data
                dataSrc.sensors.gyroscope.alpha = orient.alpha || 0;
                dataSrc.sensors.gyroscope.beta = orient.beta || 0;
                dataSrc.sensors.gyroscope.gamma = orient.gamma || 0;
            }
        }
    } catch (e) {
        console.error('Error updating orientation:', e);
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    try {
        initializeDataSource();
        setupTabs();
        setupTheme();
        renderAllSections();
        setupEventListeners();
        
        // Track orientation changes
        if (window.matchMedia) {
            const updateOrientation = () => {
                try {
                    dataSrc.sensors.orientation.type = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
                    renderPermissions();
                } catch (e) {
                    console.error('Error updating orientation:', e);
                }
            };
            window.matchMedia('(orientation: portrait)').addEventListener('change', updateOrientation);
            updateOrientation();
        }
        
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.ready();
            logEvent('app:ready', 'Telegram WebApp');
        }
    } catch (error) {
        console.error('Initialization error:', error);
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; text-align: center; font-family: system-ui, -apple-system, sans-serif;">
                <div style="max-width: 400px;">
                    <h1 style="font-size: 48px; margin-bottom: 20px;">❌</h1>
                    <h2 style="margin-bottom: 10px; color: #ff6b6b;">Initialization Error</h2>
                    <p style="color: #666; line-height: 1.6;">${error.message}</p>
                    <p style="color: #666; line-height: 1.6; margin-top: 20px;">Please refresh the page or contact support.</p>
                </div>
            </div>
        `;
    }
});

// Initialize Data Source
function initializeDataSource() {
    if (window.Telegram?.WebApp) {
        dataSrc = extractTelegramData();
        logEvent('datasource', 'Telegram WebApp API');
        setupTelegramEventListeners();
    } else {
        // Show error if not in Telegram
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; text-align: center; font-family: system-ui, -apple-system, sans-serif;">
                <div style="max-width: 400px;">
                    <h1 style="font-size: 48px; margin-bottom: 20px;">⚠️</h1>
                    <h2 style="margin-bottom: 10px; color: #ff6b6b;">Telegram WebApp Not Found</h2>
                    <p style="color: #666; line-height: 1.6;">This app must be opened from inside Telegram.</p>
                    <p style="color: #666; line-height: 1.6; margin-top: 20px;">Please open this app through your Telegram bot.</p>
                </div>
            </div>
        `;
        return;
    }
}

// Extract Telegram Data
function extractTelegramData() {
    const tg = window.Telegram.WebApp;
    return {
        initData: tg.initData || "",
        initDataUnsafe: tg.initDataUnsafe || {},
        platform: tg.platform || "unknown",
        version: tg.version || "unknown",
        colorScheme: tg.colorScheme || "light",
        themeParams: tg.themeParams || {},
        viewport: {
            height: tg.viewportHeight || 0,
            stableHeight: tg.viewportStableHeight || 0,
            isStateStable: tg.isVersionAtLeast?.('6.1') ? (tg.isExpanded || false) : false
        },
        safeAreaInset: tg.safeAreaInset || { top: 0, right: 0, bottom: 0, left: 0 },
        contentSafeAreaInset: tg.contentSafeAreaInset || { top: 0, right: 0, bottom: 0, left: 0 },
        buttons: {
            mainButton: {
                text: tg.MainButton?.text || "",
                color: tg.MainButton?.color || "",
                text_color: tg.MainButton?.textColor || "",
                isVisible: tg.MainButton?.isVisible || false,
                isEnabled: tg.MainButton?.isActive || false
            },
            secondaryButton: {
                text: tg.SecondaryButton?.text || "",
                isVisible: tg.SecondaryButton?.isVisible || false,
                isEnabled: tg.SecondaryButton?.isActive || false
            },
            backButton: { isVisible: tg.BackButton?.isVisible || false },
            settingsButton: { isVisible: tg.SettingsButton?.isVisible || false }
        },
        permissions: {
            writeAccess: "unknown",
            contact: "unknown",
            emoji_status: "unknown",
            biometric: "unknown",
            location: "unknown"
        },
        storage: {
            cloud: { keys: [], values: {} },
            secure: { keys: [], values: {} }
        },
        share: { story: {}, message: {} },
        homeScreen: { status: "unknown" },
        sensors: {
            accelerometer: { x: 0, y: 0, z: 0, enabled: false },
            gyroscope: { alpha: 0, beta: 0, gamma: 0, enabled: false },
            orientation: { type: "portrait", locked: false }
        },
        locationManager: { enabled: false, last: null, status: "disabled" },
        logs: [],
        launchSource: detectLaunchSource(tg.initDataUnsafe),
        isExpanded: tg.isExpanded || false,
        isFullscreen: false
    };
}

function detectLaunchSource(initDataUnsafe) {
    if (!initDataUnsafe) return "Unknown";
    if (initDataUnsafe.query_id) return "Inline";
    if (initDataUnsafe.chat_type === "sender") return "Keyboard";
    if (initDataUnsafe.start_param) return "DirectLink";
    return "Menu";
}

// Setup Telegram Event Listeners
function setupTelegramEventListeners() {
    const tg = window.Telegram.WebApp;
    
    tg.onEvent?.('viewportChanged', () => {
        dataSrc.viewport.height = tg.viewportHeight;
        dataSrc.viewport.stableHeight = tg.viewportStableHeight;
        logEvent('viewportChanged', `${tg.viewportHeight}px`);
        renderViewport();
    });
    
    tg.onEvent?.('themeChanged', () => {
        dataSrc.themeParams = tg.themeParams;
        dataSrc.colorScheme = tg.colorScheme;
        logEvent('themeChanged', tg.colorScheme);
        setupTheme();
        renderTheme();
    });
    
    tg.MainButton?.onClick?.(() => {
        addButtonEvent('mainButtonClicked');
        logEvent('mainButtonClicked', '');
    });
    
    tg.SecondaryButton?.onClick?.(() => {
        addButtonEvent('secondaryButtonClicked');
        logEvent('secondaryButtonClicked', '');
    });
    
    tg.BackButton?.onClick?.(() => {
        addButtonEvent('backButtonClicked');
        logEvent('backButtonClicked', '');
    });
    
    tg.SettingsButton?.onClick?.(() => {
        addButtonEvent('settingsButtonClicked');
        logEvent('settingsButtonClicked', '');
    });
}

// Setup Theme
function setupTheme() {
    const theme = dataSrc.themeParams;
    const root = document.documentElement;
    
    if (theme.bg_color) root.style.setProperty('--tg-theme-bg-color', theme.bg_color);
    if (theme.text_color) root.style.setProperty('--tg-theme-text-color', theme.text_color);
    if (theme.hint_color) root.style.setProperty('--tg-theme-hint-color', theme.hint_color);
    if (theme.link_color) root.style.setProperty('--tg-theme-link-color', theme.link_color);
    if (theme.button_color) root.style.setProperty('--tg-theme-button-color', theme.button_color);
    if (theme.button_text_color) root.style.setProperty('--tg-theme-button-text-color', theme.button_text_color);
    if (theme.secondary_bg_color) root.style.setProperty('--tg-theme-secondary-bg-color', theme.secondary_bg_color);
    if (theme.header_bg_color) root.style.setProperty('--tg-theme-header-bg-color', theme.header_bg_color);
    if (theme.bottom_bar_bg_color) root.style.setProperty('--tg-theme-bottom-bar-bg-color', theme.bottom_bar_bg_color);
    if (theme.accent_text_color) root.style.setProperty('--tg-theme-accent-text-color', theme.accent_text_color);
    if (theme.section_bg_color) root.style.setProperty('--tg-theme-section-bg-color', theme.section_bg_color);
    if (theme.section_header_text_color) root.style.setProperty('--tg-theme-section-header-text-color', theme.section_header_text_color);
    if (theme.section_separator_color) root.style.setProperty('--tg-theme-section-separator-color', theme.section_separator_color);
    if (theme.subtitle_text_color) root.style.setProperty('--tg-theme-subtitle-text-color', theme.subtitle_text_color);
    if (theme.destructive_text_color) root.style.setProperty('--tg-theme-destructive-text-color', theme.destructive_text_color);
    
    root.setAttribute('data-theme', dataSrc.colorScheme);
}

// Tab Management
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            switchTab(targetTab);
        });
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    document.getElementById(`tab-${tabName}`)?.classList.add('active');
}

// Render All Sections
function renderAllSections() {
    renderOverview();
    renderTheme();
    renderViewport();
    renderContext();
    renderButtons();
    renderPermissions();
    renderStorage();
    renderShare();
    renderDebug();
}

// Render Overview
function renderOverview() {
    const user = dataSrc.initDataUnsafe.user || {};
    
    // User Card
    const avatar = document.getElementById('userAvatar');
    if (user.photo_url) {
        avatar.style.backgroundImage = `url(${user.photo_url})`;
    } else {
        avatar.textContent = (user.first_name?.[0] || '?').toUpperCase();
    }
    
    document.getElementById('userName').textContent = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';
    document.getElementById('userUsername').textContent = user.username ? `@${user.username}` : '@--';
    document.getElementById('langBadge').textContent = user.language_code || '--';
    document.getElementById('premiumBadge').style.display = user.is_premium ? 'inline-block' : 'none';
    
    // App Info
    document.getElementById('appPlatform').textContent = dataSrc.platform;
    document.getElementById('appVersion').textContent = dataSrc.version;
    document.getElementById('appColorScheme').textContent = dataSrc.colorScheme;
    document.getElementById('appIsExpanded').textContent = dataSrc.isExpanded ? 'Yes' : 'No';
    document.getElementById('appIsFullscreen').textContent = dataSrc.isFullscreen ? 'Yes' : 'No';
    document.getElementById('appLaunchSource').textContent = dataSrc.launchSource;
    
    // Init Data
    document.getElementById('initDataRaw').textContent = dataSrc.initData || '--';
    document.getElementById('initDataUnsafe').textContent = JSON.stringify(dataSrc.initDataUnsafe, null, 2);
}

// Render Theme
function renderTheme() {
    const swatchContainer = document.getElementById('colorSwatches');
    swatchContainer.innerHTML = '';
    
    const themeKeys = [
        'bg_color', 'text_color', 'hint_color', 'link_color', 'button_color', 'button_text_color',
        'secondary_bg_color', 'header_bg_color', 'bottom_bar_bg_color', 'accent_text_color',
        'section_bg_color', 'section_header_text_color', 'section_separator_color',
        'subtitle_text_color', 'destructive_text_color'
    ];
    
    themeKeys.forEach(key => {
        const value = dataSrc.themeParams[key];
        if (value) {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.innerHTML = `
                <div class="color-preview" style="background-color: ${value}"></div>
                <div class="color-name">${key}</div>
                <div class="color-value">${value}</div>
            `;
            swatchContainer.appendChild(swatch);
        }
    });
    
    // CSS Variables
    let cssVarsText = ':root {\n';
    themeKeys.forEach(key => {
        const value = dataSrc.themeParams[key];
        if (value) cssVarsText += `  --tg-theme-${key.replace(/_/g, '-')}: ${value};\n`;
    });
    cssVarsText += '}';
    document.getElementById('cssVars').textContent = cssVarsText;
}

// Render Viewport
function renderViewport() {
    document.getElementById('vpHeight').textContent = dataSrc.viewport.height + 'px';
    document.getElementById('vpStableHeight').textContent = dataSrc.viewport.stableHeight + 'px';
    document.getElementById('vpIsStable').textContent = dataSrc.viewport.isStateStable ? 'Yes' : 'No';
    
    // Safe Area
    const { top, right, bottom, left } = dataSrc.safeAreaInset;
    document.getElementById('safeTopValue').textContent = top;
    document.getElementById('safeRightValue').textContent = right;
    document.getElementById('safeBottomValue').textContent = bottom;
    document.getElementById('safeLeftValue').textContent = left;
    
    document.getElementById('safeTop').style.height = Math.max(top, 16) + 'px';
    document.getElementById('safeRight').style.width = Math.max(right, 16) + 'px';
    document.getElementById('safeBottom').style.height = Math.max(bottom, 16) + 'px';
    document.getElementById('safeLeft').style.width = Math.max(left, 16) + 'px';
    
    // Content Safe Area
    const csa = dataSrc.contentSafeAreaInset;
    document.getElementById('csaTop').textContent = csa.top + 'px';
    document.getElementById('csaRight').textContent = csa.right + 'px';
    document.getElementById('csaBottom').textContent = csa.bottom + 'px';
    document.getElementById('csaLeft').textContent = csa.left + 'px';
}

// Render Context
function renderContext() {
    const unsafe = dataSrc.initDataUnsafe;
    document.getElementById('ctxStartParam').textContent = unsafe.start_param || '--';
    document.getElementById('ctxQueryId').textContent = unsafe.query_id || '--';
    document.getElementById('ctxCanSendAfter').textContent = unsafe.can_send_after?.toString() || '--';
    document.getElementById('ctxAuthDate').textContent = unsafe.auth_date ? new Date(unsafe.auth_date * 1000).toLocaleString() : '--';
    
    if (unsafe.chat) {
        document.getElementById('chatType').textContent = unsafe.chat.type || '--';
        document.getElementById('chatTitle').textContent = unsafe.chat.title || '--';
        document.getElementById('chatId').textContent = unsafe.chat.id?.toString() || '--';
    } else {
        document.getElementById('chatInfoCard').style.display = 'none';
    }
}

// Render Buttons
function renderButtons() {
    const mb = dataSrc.buttons.mainButton;
    document.getElementById('mainBtnText').value = mb.text;
    document.getElementById('mainBtnColor').value = mb.color;
    document.getElementById('mainBtnTextColor').value = mb.text_color;
    document.getElementById('mainBtnVisible').checked = mb.isVisible;
    document.getElementById('mainBtnEnabled').checked = mb.isEnabled;
    
    const sb = dataSrc.buttons.secondaryButton;
    document.getElementById('secBtnText').value = sb.text;
    document.getElementById('secBtnVisible').checked = sb.isVisible;
    document.getElementById('secBtnEnabled').checked = sb.isEnabled;
}

// Render Permissions
function renderPermissions() {
    const p = dataSrc.permissions;
    document.getElementById('permWrite').textContent = p.writeAccess;
    document.getElementById('permContact').textContent = p.contact;
    document.getElementById('permEmoji').textContent = p.emoji_status;
    document.getElementById('permBiometric').textContent = p.biometric;
    
    document.getElementById('locStatus').textContent = dataSrc.locationManager.status;
    document.getElementById('locLast').textContent = dataSrc.locationManager.last || '--';
    
    const s = dataSrc.sensors;
    document.getElementById('accelX').textContent = s.accelerometer.x.toFixed(2);
    document.getElementById('accelY').textContent = s.accelerometer.y.toFixed(2);
    document.getElementById('accelZ').textContent = s.accelerometer.z.toFixed(2);
    document.getElementById('gyroAlpha').textContent = s.gyroscope.alpha.toFixed(2);
    document.getElementById('gyroBeta').textContent = s.gyroscope.beta.toFixed(2);
    document.getElementById('gyroGamma').textContent = s.gyroscope.gamma.toFixed(2);
    document.getElementById('orientType').textContent = s.orientation.type;
    document.getElementById('orientLocked').textContent = s.orientation.locked ? 'Yes' : 'No';
    
    document.getElementById('btnAccelToggle').textContent = s.accelerometer.enabled ? 'Stop' : 'Start';
    document.getElementById('btnGyroToggle').textContent = s.gyroscope.enabled ? 'Stop' : 'Start';
}

// Render Storage
function renderStorage() {
    renderStorageList('cloud', dataSrc.storage.cloud);
    renderStorageList('secure', dataSrc.storage.secure);
}

function renderStorageList(type, storage) {
    const listEl = document.getElementById(`${type}List`);
    listEl.innerHTML = '';
    
    if (storage.keys.length === 0) {
        listEl.innerHTML = '<p class="text-muted">No items</p>';
        return;
    }
    
    storage.keys.forEach(key => {
        const item = document.createElement('div');
        item.className = 'storage-item';
        item.innerHTML = `
            <span class="storage-item-key">${key}</span>
            <span class="storage-item-value">${storage.values[key]}</span>
        `;
        listEl.appendChild(item);
    });
}

// Render Share
function renderShare() {
    const story = dataSrc.share.story;
    document.getElementById('storyMediaUrl').value = story.media_url || '';
    document.getElementById('storyCaption').value = story.caption || '';
    
    const msg = dataSrc.share.message;
    document.getElementById('shareMsg').value = msg.prepared_inline_message || '';
}

// Render Debug
function renderDebug() {
    document.getElementById('homeStatus').textContent = dataSrc.homeScreen.status;
    renderEventStream();
}

function renderEventStream() {
    const streamEl = document.getElementById('eventStream');
    streamEl.innerHTML = '';
    
    dataSrc.logs.forEach(log => {
        const entry = document.createElement('div');
        entry.className = 'event-entry';
        entry.innerHTML = `<span class="event-time">[${log.t}]</span><span class="event-name">${log.event}</span><span class="event-detail">${log.detail}</span>`;
        streamEl.appendChild(entry);
    });
    
    streamEl.scrollTop = streamEl.scrollHeight;
}

// Event Logging
function logEvent(event, detail) {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    dataSrc.logs.push({ t: time, event, detail });
    renderEventStream();
}

function addButtonEvent(eventName) {
    const listEl = document.getElementById('buttonEventList');
    if (listEl.querySelector('.text-muted')) listEl.innerHTML = '';
    
    const now = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = 'event-entry';
    entry.innerHTML = `<span class="event-time">[${now}]</span><span class="event-name">${eventName}</span>`;
    listEl.appendChild(entry);
}

function addShareEvent(eventName, detail) {
    const listEl = document.getElementById('shareEventList');
    if (listEl.querySelector('.text-muted')) listEl.innerHTML = '';
    
    const now = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = 'event-entry';
    entry.innerHTML = `<span class="event-time">[${now}]</span><span class="event-name">${eventName}</span><span class="event-detail">${detail}</span>`;
    listEl.appendChild(entry);
}

// Event Listeners Setup
function setupEventListeners() {
    // Overview
    document.getElementById('btnExpand').addEventListener('click', () => {
        window.Telegram.WebApp.expand();
    });
    
    document.getElementById('btnReady').addEventListener('click', () => {
        window.Telegram.WebApp.ready();
        logEvent('ready', 'called');
    });
    
    document.getElementById('btnToggleFullscreen').addEventListener('click', () => {
        if (window.Telegram.WebApp.requestFullscreen) {
            window.Telegram.WebApp.requestFullscreen();
        }
    });
    
    document.getElementById('btnHideKeyboard').addEventListener('click', () => {
        window.Telegram.WebApp.isClosingConfirmationEnabled = false;
        logEvent('hideKeyboard', 'called');
    });
    
    // Copy buttons
    document.querySelectorAll('.btn-copy').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.copy;
            const text = document.getElementById(targetId).textContent;
            navigator.clipboard.writeText(text).then(() => {
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = 'Copy', 1500);
            });
        });
    });
    
    // Theme
    document.getElementById('btnSetHeaderColor').addEventListener('click', () => {
        const color = prompt('Enter header color (hex):', '#2ea043');
        if (color && window.Telegram.WebApp.setHeaderColor) {
            window.Telegram.WebApp.setHeaderColor(color);
        }
    });
    
    document.getElementById('btnSetBgColor').addEventListener('click', () => {
        const color = prompt('Enter background color (hex):', '#0d1117');
        if (color && window.Telegram.WebApp.setBackgroundColor) {
            window.Telegram.WebApp.setBackgroundColor(color);
        }
    });
    
    document.getElementById('btnSetBottomBarColor').addEventListener('click', () => {
        const color = prompt('Enter bottom bar color (hex):', '#0b0f14');
        if (color && window.Telegram.WebApp.setBottomBarColor) {
            window.Telegram.WebApp.setBottomBarColor(color);
        }
    });
    
    // Viewport
    document.getElementById('btnSimViewport').addEventListener('click', () => {
        alert('Viewport simulation not available in Live mode');
    });
    
    // Context
    document.getElementById('btnSendData').addEventListener('click', () => {
        const data = prompt('Enter data to send:', '{"action":"test"}');
        if (data && window.Telegram.WebApp.sendData) {
            window.Telegram.WebApp.sendData(data);
        }
    });
    
    document.getElementById('btnSwitchInline').addEventListener('click', () => {
        if (window.Telegram.WebApp.switchInlineQuery) {
            window.Telegram.WebApp.switchInlineQuery('demo', ['users', 'groups']);
        }
    });
    
    document.getElementById('btnOpenLink').addEventListener('click', () => {
        const url = prompt('Enter URL:', 'https://example.com');
        if (url) {
            window.Telegram.WebApp.openLink(url);
        }
    });
    
    document.getElementById('btnOpenTgLink').addEventListener('click', () => {
        const url = prompt('Enter Telegram link:', 't.me/username');
        if (url && window.Telegram.WebApp.openTelegramLink) {
            window.Telegram.WebApp.openTelegramLink(url);
        }
    });
    
    document.getElementById('btnOpenInvoice').addEventListener('click', () => {
        const url = prompt('Enter invoice URL:', 'https://t.me/$invoice_link');
        if (url && window.Telegram.WebApp.openInvoice) {
            window.Telegram.WebApp.openInvoice(url);
        }
    });
    
    setupButtonsListeners();
    setupPermissionsListeners();
    setupStorageListeners();
    setupShareListeners();
    setupDebugListeners();
}

function setupButtonsListeners() {
    document.getElementById('btnApplyMain').addEventListener('click', () => {
        const text = document.getElementById('mainBtnText').value;
        const color = document.getElementById('mainBtnColor').value;
        const textColor = document.getElementById('mainBtnTextColor').value;
        const visible = document.getElementById('mainBtnVisible').checked;
        const enabled = document.getElementById('mainBtnEnabled').checked;
        
        const mb = window.Telegram.WebApp.MainButton;
        mb.setText(text);
        mb.setParams({ color, text_color: textColor });
        visible ? mb.show() : mb.hide();
        enabled ? mb.enable() : mb.disable();
    });
    
    document.getElementById('btnApplySec').addEventListener('click', () => {
        const text = document.getElementById('secBtnText').value;
        const visible = document.getElementById('secBtnVisible').checked;
        const enabled = document.getElementById('secBtnEnabled').checked;
        
        if (window.Telegram.WebApp.SecondaryButton) {
            const sb = window.Telegram.WebApp.SecondaryButton;
            sb.setText(text);
            visible ? sb.show() : sb.hide();
            enabled ? sb.enable() : sb.disable();
        }
    });
    
    document.getElementById('btnToggleBack').addEventListener('click', () => {
        const bb = window.Telegram.WebApp.BackButton;
        bb.isVisible ? bb.hide() : bb.show();
    });
    
    document.getElementById('btnToggleSettings').addEventListener('click', () => {
        if (window.Telegram.WebApp.SettingsButton) {
            const sb = window.Telegram.WebApp.SettingsButton;
            sb.isVisible ? sb.hide() : sb.show();
        }
    });
    
    document.getElementById('btnHapticImpact').addEventListener('click', () => {
        if (window.Telegram.WebApp.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }
    });
    
    document.getElementById('btnHapticNotify').addEventListener('click', () => {
        if (window.Telegram.WebApp.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
    });
    
    document.getElementById('btnHapticSelect').addEventListener('click', () => {
        if (window.Telegram.WebApp.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.selectionChanged();
        }
    });
}

function setupPermissionsListeners() {
    document.getElementById('btnReqWrite').addEventListener('click', () => {
        if (window.Telegram.WebApp.requestWriteAccess) {
            window.Telegram.WebApp.requestWriteAccess((granted) => {
                dataSrc.permissions.writeAccess = granted ? 'allowed' : 'denied';
                logEvent('requestWriteAccess', granted ? 'granted' : 'denied');
                renderPermissions();
            });
        }
    });
    
    document.getElementById('btnReqContact').addEventListener('click', () => {
        if (window.Telegram.WebApp.requestContact) {
            window.Telegram.WebApp.requestContact((granted) => {
                dataSrc.permissions.contact = granted ? 'allowed' : 'denied';
                logEvent('requestContact', granted ? 'granted' : 'denied');
                renderPermissions();
            });
        }
    });
    
    document.getElementById('btnReqEmoji').addEventListener('click', () => {
        alert('Emoji status access request not yet implemented');
    });
    
    document.getElementById('btnSetEmoji').addEventListener('click', () => {
        const emoji = prompt('Enter custom emoji ID:', '5368324170671202286');
        if (emoji) {
            logEvent('setEmojiStatus', emoji);
        }
    });
    
    document.getElementById('btnBiometricCheck').addEventListener('click', () => {
        if (window.Telegram.WebApp.BiometricManager) {
            const bioManager = window.Telegram.WebApp.BiometricManager;
            
            // cSpell:ignore isInited
            if (!bioManager.isInited) {
                bioManager.init(() => {
                    logEvent('biometric:init', 'initialized');
                    updateBiometricStatus(bioManager);
                });
            } else {
                updateBiometricStatus(bioManager);
            }
        } else {
            alert('Biometric Manager is not supported');
            logEvent('biometric:error', 'not supported');
        }
    });
    
    function updateBiometricStatus(bioManager) {
        document.getElementById('bioAvailable').textContent = bioManager.isBiometricAvailable ? 'Yes' : 'No';
        document.getElementById('bioAccessGranted').textContent = bioManager.isBiometricAccessGranted ? 'Yes' : 'No';
        document.getElementById('bioType').textContent = bioManager.biometricType || 'unknown';
        
        logEvent('biometric:status', `available: ${bioManager.isBiometricAvailable}, type: ${bioManager.biometricType}`);
    }
    
    document.getElementById('btnBiometricAuth').addEventListener('click', () => {
        if (window.Telegram.WebApp.BiometricManager) {
            const bioManager = window.Telegram.WebApp.BiometricManager;
            
            // cSpell:ignore isInited
            if (!bioManager.isInited) {
                bioManager.init(() => {
                    logEvent('biometric:init', 'initialized');
                    updateBiometricStatus(bioManager);
                    performBiometricAuth(bioManager);
                });
            } else {
                performBiometricAuth(bioManager);
            }
        } else {
            alert('Biometric authentication is not supported');
            logEvent('biometric:error', 'not supported');
        }
    });
    
    function performBiometricAuth(bioManager) {
        if (!bioManager.isBiometricAvailable) {
            alert('Biometric sensors not available on this device');
            logEvent('biometric:error', 'sensors not available');
            return;
        }
        
        if (!bioManager.isBiometricAccessGranted) {
            // Request access first
            bioManager.requestAccess({
                reason: 'Test biometric authentication'
            }, (granted) => {
                if (granted) {
                    dataSrc.permissions.biometric = 'allowed';
                    logEvent('biometric:access', 'granted');
                    renderPermissions();
                    // Now authenticate
                    authenticateUser(bioManager);
                } else {
                    dataSrc.permissions.biometric = 'denied';
                    logEvent('biometric:access', 'denied');
                    renderPermissions();
                    alert('Biometric access denied');
                }
            });
        } else {
            // Access already granted, just authenticate
            authenticateUser(bioManager);
        }
    }
    
    function authenticateUser(bioManager) {
        bioManager.authenticate({
            reason: 'Verify your identity'
        }, (success, token) => {
            if (success) {
                dataSrc.permissions.biometric = 'authenticated';
                logEvent('biometric:authenticate', `success - token: ${token ? 'received' : 'none'}`);
                alert('Biometric authentication successful!');
            } else {
                logEvent('biometric:authenticate', 'failed');
                alert('Biometric authentication failed');
            }
            renderPermissions();
        });
    }
    
    document.getElementById('btnLocStart').addEventListener('click', () => {
        if (navigator.geolocation) {
            dataSrc.locationManager.status = 'requesting';
            logEvent('location:requesting', 'asking for permission');
            renderPermissions();
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    dataSrc.locationManager.enabled = true;
                    dataSrc.locationManager.status = 'active';
                    dataSrc.locationManager.last = `${position.coords.latitude.toFixed(4)},${position.coords.longitude.toFixed(4)}`;
                    logEvent('location:success', dataSrc.locationManager.last);
                    renderPermissions();
                },
                (error) => {
                    dataSrc.locationManager.status = 'denied';
                    logEvent('location:error', error.message);
                    renderPermissions();
                    alert('Location access denied: ' + error.message);
                }
            );
        } else {
            alert('Geolocation not supported');
            logEvent('location:error', 'not supported');
        }
    });
    
    document.getElementById('btnLocStop').addEventListener('click', () => {
        dataSrc.locationManager.enabled = false;
        dataSrc.locationManager.status = 'disabled';
        logEvent('location:stop', '');
        renderPermissions();
    });
    
    // Sensors - Using Telegram WebApp API
    document.getElementById('btnAccelToggle').addEventListener('click', () => {
        const enabled = dataSrc.sensors.accelerometer.enabled;
        dataSrc.sensors.accelerometer.enabled = !enabled;
        
        if (!enabled) {
            // Start Telegram Accelerometer
            if (window.Telegram?.WebApp?.Accelerometer) {
                const accel = window.Telegram.WebApp.Accelerometer;
                
                accel.start({
                    refresh_rate: 100 // Update every 100ms
                }, (started) => {
                    if (started) {
                        logEvent('accelerometer:start', 'Telegram API');
                        
                        // Update data periodically
                        sensorIntervals.accelerometer = setInterval(() => {
                            updateAccelerometerData();
                            renderPermissions();
                        }, 100);
                    } else {
                        logEvent('accelerometer:error', 'failed to start');
                        dataSrc.sensors.accelerometer.enabled = false;
                        renderPermissions();
                    }
                });
            } else {
                alert('Accelerometer not supported');
                dataSrc.sensors.accelerometer.enabled = false;
                logEvent('accelerometer:error', 'not supported');
            }
        } else {
            // Stop Telegram Accelerometer
            if (window.Telegram?.WebApp?.Accelerometer) {
                window.Telegram.WebApp.Accelerometer.stop(() => {
                    logEvent('accelerometer:stop', '');
                });
            }
            
            if (sensorIntervals.accelerometer) {
                clearInterval(sensorIntervals.accelerometer);
                sensorIntervals.accelerometer = null;
            }
        }
        renderPermissions();
    });
    
    document.getElementById('btnGyroToggle').addEventListener('click', () => {
        const enabled = dataSrc.sensors.gyroscope.enabled;
        dataSrc.sensors.gyroscope.enabled = !enabled;
        
        if (!enabled) {
            // Try Gyroscope first, fallback to DeviceOrientation
            if (window.Telegram?.WebApp?.Gyroscope) {
                const gyro = window.Telegram.WebApp.Gyroscope;
                
                gyro.start({
                    refresh_rate: 100
                }, (started) => {
                    if (started) {
                        logEvent('gyroscope:start', 'Telegram Gyroscope API');
                        
                        sensorIntervals.gyroscope = setInterval(() => {
                            updateGyroscopeData();
                            renderPermissions();
                        }, 100);
                    } else {
                        logEvent('gyroscope:error', 'failed to start');
                        dataSrc.sensors.gyroscope.enabled = false;
                        renderPermissions();
                    }
                });
            } else if (window.Telegram?.WebApp?.DeviceOrientation) {
                // Fallback to DeviceOrientation
                const orient = window.Telegram.WebApp.DeviceOrientation;
                
                orient.start({
                    refresh_rate: 100,
                    need_absolute: false
                }, (started) => {
                    if (started) {
                        logEvent('gyroscope:start', 'Telegram DeviceOrientation API');
                        
                        sensorIntervals.gyroscope = setInterval(() => {
                            updateOrientationData();
                            renderPermissions();
                        }, 100);
                    } else {
                        logEvent('gyroscope:error', 'failed to start');
                        dataSrc.sensors.gyroscope.enabled = false;
                        renderPermissions();
                    }
                });
            } else {
                alert('Gyroscope/DeviceOrientation not supported');
                dataSrc.sensors.gyroscope.enabled = false;
                logEvent('gyroscope:error', 'not supported');
            }
        } else {
            // Stop sensors
            if (window.Telegram?.WebApp?.Gyroscope?.isStarted) {
                window.Telegram.WebApp.Gyroscope.stop(() => {
                    logEvent('gyroscope:stop', 'Gyroscope stopped');
                });
            }
            
            if (window.Telegram?.WebApp?.DeviceOrientation?.isStarted) {
                window.Telegram.WebApp.DeviceOrientation.stop(() => {
                    logEvent('gyroscope:stop', 'DeviceOrientation stopped');
                });
            }
            
            if (sensorIntervals.gyroscope) {
                clearInterval(sensorIntervals.gyroscope);
                sensorIntervals.gyroscope = null;
            }
        }
        renderPermissions();
    });
    
    document.getElementById('btnOrientLock').addEventListener('click', () => {
        dataSrc.sensors.orientation.locked = !dataSrc.sensors.orientation.locked;
        
        // Use Telegram's lockOrientation/unlockOrientation
        if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            
            if (dataSrc.sensors.orientation.locked) {
                if (tg.lockOrientation) {
                    tg.lockOrientation(() => {
                        logEvent('orientation:lock', 'locked via Telegram API');
                    });
                } else {
                    logEvent('orientation:lock', 'lockOrientation not available');
                }
            } else {
                if (tg.unlockOrientation) {
                    tg.unlockOrientation(() => {
                        logEvent('orientation:unlock', 'unlocked via Telegram API');
                    });
                } else {
                    logEvent('orientation:unlock', 'unlockOrientation not available');
                }
            }
        } else {
            logEvent('orientation:lock', 'Telegram API not available');
        }
        renderPermissions();
    });
}

function setupStorageListeners() {
    // Cloud Storage
    document.getElementById('btnCloudSet').addEventListener('click', () => {
        const key = document.getElementById('cloudKey').value;
        const value = document.getElementById('cloudValue').value;
        
        if (!key || !value) {
            alert('Please enter both key and value');
            return;
        }
        
        if (window.Telegram?.WebApp?.CloudStorage) {
            window.Telegram.WebApp.CloudStorage.setItem(key, value, (error, success) => {
                if (error) {
                    alert(`Error: ${error}`);
                    logEvent('cloudStorage:error', error);
                } else {
                    // Update local cache
                    if (!dataSrc.storage.cloud.keys.includes(key)) {
                        dataSrc.storage.cloud.keys.push(key);
                    }
                    dataSrc.storage.cloud.values[key] = value;
                    
                    logEvent('cloudStorage:set', `${key}=${value}`);
                    renderStorage();
                    document.getElementById('cloudKey').value = '';
                    document.getElementById('cloudValue').value = '';
                }
            });
        } else {
            alert('Cloud Storage not supported');
        }
    });
    
    document.getElementById('btnCloudGet').addEventListener('click', () => {
        const key = document.getElementById('cloudKey').value;
        if (!key) {
            alert('Please enter a key');
            return;
        }
        
        if (window.Telegram?.WebApp?.CloudStorage) {
            window.Telegram.WebApp.CloudStorage.getItem(key, (error, value) => {
                if (error) {
                    alert(`Error: ${error}`);
                    logEvent('cloudStorage:error', error);
                } else if (value) {
                    alert(`Value: ${value}`);
                    logEvent('cloudStorage:get', `${key}=${value}`);
                    
                    // Update local cache
                    if (!dataSrc.storage.cloud.keys.includes(key)) {
                        dataSrc.storage.cloud.keys.push(key);
                    }
                    dataSrc.storage.cloud.values[key] = value;
                    renderStorage();
                } else {
                    alert('Key not found');
                    logEvent('cloudStorage:get', `${key} not found`);
                }
            });
        } else {
            alert('Cloud Storage not supported');
        }
    });
    
    document.getElementById('btnCloudRemove').addEventListener('click', () => {
        const key = document.getElementById('cloudKey').value;
        if (!key) {
            alert('Please enter a key');
            return;
        }
        
        if (window.Telegram?.WebApp?.CloudStorage) {
            window.Telegram.WebApp.CloudStorage.removeItem(key, (error, success) => {
                if (error) {
                    alert(`Error: ${error}`);
                    logEvent('cloudStorage:error', error);
                } else {
                    dataSrc.storage.cloud.keys = dataSrc.storage.cloud.keys.filter(k => k !== key);
                    delete dataSrc.storage.cloud.values[key];
                    
                    logEvent('cloudStorage:remove', key);
                    renderStorage();
                    document.getElementById('cloudKey').value = '';
                }
            });
        } else {
            alert('Cloud Storage not supported');
        }
    });
    
    document.getElementById('btnCloudGetKeys').addEventListener('click', () => {
        if (window.Telegram?.WebApp?.CloudStorage) {
            window.Telegram.WebApp.CloudStorage.getKeys((error, keys) => {
                if (error) {
                    alert(`Error: ${error}`);
                    logEvent('cloudStorage:error', error);
                } else if (keys && keys.length > 0) {
                    logEvent('cloudStorage:getKeys', `Found ${keys.length} keys`);
                    
                    // Load all values
                    keys.forEach(key => {
                        window.Telegram.WebApp.CloudStorage.getItem(key, (err, value) => {
                            if (!err && value) {
                                if (!dataSrc.storage.cloud.keys.includes(key)) {
                                    dataSrc.storage.cloud.keys.push(key);
                                }
                                dataSrc.storage.cloud.values[key] = value;
                                renderStorage();
                            }
                        });
                    });
                    
                    alert(`Loaded ${keys.length} keys from Cloud Storage`);
                } else {
                    alert('No keys found in Cloud Storage');
                    logEvent('cloudStorage:getKeys', 'No keys found');
                }
            });
        } else {
            alert('Cloud Storage not supported');
        }
    });
    
    // Secure Storage
    document.getElementById('btnSecureSet').addEventListener('click', () => {
        const key = document.getElementById('secureKey').value;
        const value = document.getElementById('secureValue').value;
        
        if (!key || !value) {
            alert('Please enter both key and value');
            return;
        }
        
        if (window.Telegram?.WebApp?.SecureStorage) {
            window.Telegram.WebApp.SecureStorage.setItem(key, value, (error, success) => {
                if (error) {
                    alert(`Error: ${error}`);
                    logEvent('secureStorage:error', error);
                } else {
                    // Update local cache (only keys, not values for security)
                    if (!dataSrc.storage.secure.keys.includes(key)) {
                        dataSrc.storage.secure.keys.push(key);
                    }
                    dataSrc.storage.secure.values[key] = '***ENCRYPTED***';
                    
                    logEvent('secureStorage:set', `${key}=***`);
                    renderStorage();
                    document.getElementById('secureKey').value = '';
                    document.getElementById('secureValue').value = '';
                }
            });
        } else {
            alert('Secure Storage not supported');
        }
    });
    
    document.getElementById('btnSecureGet').addEventListener('click', () => {
        const key = document.getElementById('secureKey').value;
        if (!key) {
            alert('Please enter a key');
            return;
        }
        
        if (window.Telegram?.WebApp?.SecureStorage) {
            window.Telegram.WebApp.SecureStorage.getItem(key, (error, value) => {
                if (error) {
                    alert(`Error: ${error}`);
                    logEvent('secureStorage:error', error);
                } else if (value) {
                    alert(`Value: ${value}`);
                    logEvent('secureStorage:get', `${key} retrieved`);
                } else {
                    alert('Key not found');
                    logEvent('secureStorage:get', `${key} not found`);
                }
            });
        } else {
            alert('Secure Storage not supported');
        }
    });
    
    document.getElementById('btnSecureRemove').addEventListener('click', () => {
        const key = document.getElementById('secureKey').value;
        if (!key) {
            alert('Please enter a key');
            return;
        }
        
        if (window.Telegram?.WebApp?.SecureStorage) {
            window.Telegram.WebApp.SecureStorage.removeItem(key, (error, success) => {
                if (error) {
                    alert(`Error: ${error}`);
                    logEvent('secureStorage:error', error);
                } else {
                    dataSrc.storage.secure.keys = dataSrc.storage.secure.keys.filter(k => k !== key);
                    delete dataSrc.storage.secure.values[key];
                    
                    logEvent('secureStorage:remove', key);
                    renderStorage();
                    document.getElementById('secureKey').value = '';
                }
            });
        } else {
            alert('Secure Storage not supported');
        }
    });
}

function setupShareListeners() {
    document.getElementById('btnShareStory').addEventListener('click', () => {
        const mediaUrl = document.getElementById('storyMediaUrl').value;
        const caption = document.getElementById('storyCaption').value;
        
        if (window.Telegram.WebApp.shareToStory) {
            window.Telegram.WebApp.shareToStory(mediaUrl, { text: caption });
        }
    });
    
    document.getElementById('btnShareMsg').addEventListener('click', () => {
        const msgId = document.getElementById('shareMsg').value;
        
        if (window.Telegram.WebApp.shareMessage) {
            window.Telegram.WebApp.shareMessage(msgId);
        }
    });
    
    document.getElementById('btnInvoice').addEventListener('click', () => {
        const url = document.getElementById('invoiceUrl').value;
        
        if (window.Telegram.WebApp.openInvoice) {
            window.Telegram.WebApp.openInvoice(url);
        }
    });
}

function setupDebugListeners() {
    document.getElementById('btnShowPopup').addEventListener('click', () => {
        if (window.Telegram.WebApp.showPopup) {
            window.Telegram.WebApp.showPopup({
                title: 'Test Popup',
                message: 'This is a test popup',
                buttons: [{ type: 'ok' }]
            });
        }
    });
    
    document.getElementById('btnShowAlert').addEventListener('click', () => {
        if (window.Telegram.WebApp.showAlert) {
            window.Telegram.WebApp.showAlert('This is a test alert');
        }
    });
    
    document.getElementById('btnShowConfirm').addEventListener('click', () => {
        if (window.Telegram.WebApp.showConfirm) {
            window.Telegram.WebApp.showConfirm('Confirm this action?', (confirmed) => {
                logEvent('confirmResult', confirmed ? 'yes' : 'no');
            });
        }
    });
    
    document.getElementById('btnScanQr').addEventListener('click', () => {
        if (window.Telegram.WebApp.showScanQrPopup) {
            window.Telegram.WebApp.showScanQrPopup({}, (text) => {
                logEvent('qrTextReceived', text);
                return true;
            });
        }
    });
    
    document.getElementById('btnCloseQr').addEventListener('click', () => {
        if (window.Telegram.WebApp.closeScanQrPopup) {
            window.Telegram.WebApp.closeScanQrPopup();
        }
    });
    
    document.getElementById('btnReadClipboard').addEventListener('click', () => {
        if (window.Telegram.WebApp.readTextFromClipboard) {
            window.Telegram.WebApp.readTextFromClipboard((text) => {
                logEvent('clipboardTextReceived', text || 'empty');
            });
        }
    });
    
    document.getElementById('btnAddHome').addEventListener('click', () => {
        if (window.Telegram.WebApp.addToHomeScreen) {
            window.Telegram.WebApp.addToHomeScreen();
        }
    });
    
    document.getElementById('btnCheckHome').addEventListener('click', () => {
        if (window.Telegram.WebApp.checkHomeScreenStatus) {
            window.Telegram.WebApp.checkHomeScreenStatus((status) => {
                dataSrc.homeScreen.status = status;
                logEvent('homeScreenStatus', status);
                renderDebug();
            });
        }
    });
    
    document.getElementById('btnClearEvents').addEventListener('click', () => {
        dataSrc.logs = [];
        renderEventStream();
    });
}

