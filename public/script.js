// State
let currentTimeInterval;
let statePollInterval;
let isConnected = false;
let apiErrorCount = 0;

// DOM refs
const videoInput = document.getElementById('videoInput');
const videoPlayer = document.getElementById('videoPlayer');
const videoOverlay = document.getElementById('videoOverlay');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const responseAlert = document.getElementById('response');

// Navigation
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');
const pageTitle = document.getElementById('pageTitle');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        sections.forEach(s => s.classList.remove('active'));
        document.getElementById(section).classList.add('active');
        pageTitle.textContent = item.textContent.trim();
    });
});

// Helpers
function showAlert(message, type = 'success') {
    console.log(`[Toast] ${type}: ${message}`);
    responseAlert.textContent = message;
    responseAlert.className = `alert show ${type}`;
    void responseAlert.offsetWidth;
    setTimeout(() => responseAlert.classList.remove('show'), 6000);
}

function showApiError(message) {
    apiErrorCount++;
    const badge = document.getElementById('apiErrorBadge');
    if (badge) {
        badge.textContent = apiErrorCount;
        badge.style.display = 'flex';
    }
    showAlert(message, 'error');
}

function clearApiErrors() {
    apiErrorCount = 0;
    const badge = document.getElementById('apiErrorBadge');
    if (badge) badge.style.display = 'none';
}

function setConnected(connected) {
    isConnected = connected;
    statusDot.classList.toggle('connected', connected);
    statusText.textContent = connected ? 'Connected' : 'Disconnected';
}

function formatJson(obj) {
    return JSON.stringify(obj, null, 2);
}

// Token / Init
document.getElementById('tokenForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const deviceToken = document.getElementById('deviceToken').value;
    localStorage.setItem('deviceToken', deviceToken);
    fetchData(deviceToken);
});

function fetchData(deviceToken) {
    fetch('/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: deviceToken })
    })
    .then(response => response.text())
    .then(data => {
        showAlert(data, 'success');
        setConnected(true);
        return Promise.all([
            fetch('/info').then(r => r.json()),
            fetch('/state').then(r => r.json()),
            fetch('/connection-info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId: deviceToken })
            }).then(r => r.json())
        ]);
    })
    .then(([info, state, connectionInfo]) => {
        document.getElementById('info').textContent = formatJson(info);
        document.getElementById('state').textContent = formatJson(state);
        document.getElementById('connectionInfo').textContent = formatJson(connectionInfo);
        startStatePolling();
        loadDashboardStats();
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('Failed to initialize device', 'error');
        setConnected(false);
    });
}

// State polling
function startStatePolling() {
    if (statePollInterval) clearInterval(statePollInterval);
    statePollInterval = setInterval(() => {
        fetch('/state')
            .then(r => r.json())
            .then(state => {
                document.getElementById('state').textContent = formatJson(state);
                const ms = state.syncScriptCurrentTime || 0;
                document.getElementById('currentTime').textContent = (ms / 1000).toFixed(2) + 's';
            })
            .catch(() => {});
    }, 5000);
}

// Dashboard stats auto-load
function loadDashboardStats() {
    displayConnectedCluster();
    fetch('/state')
        .then(r => r.json())
        .then(state => {
            const ms = state.syncScriptCurrentTime || 0;
            document.getElementById('currentTime').textContent = (ms / 1000).toFixed(2) + 's';
        })
        .catch(() => {});
}

// Latency
function requestLatency() {
    fetch('/latency')
        .then(response => response.json())
        .then(data => {
            document.getElementById('latency').textContent = data.latency + ' ms';
        })
        .catch(error => console.error('Error:', error));
}

// Connected Cluster
function displayConnectedCluster() {
    fetch('/connected-cluster')
        .then(response => response.json())
        .then(data => {
            document.getElementById('connectedCluster').textContent = data.connectedCluster;
        })
        .catch(error => console.error('Error:', error));
}

// Oscillation
function startOscillation() {
    fetch('/oscillate-start', { method: 'POST' })
        .then(response => response.text())
        .then(data => showAlert(data, 'success'))
        .catch(error => console.error('Error:', error));
}

function stopOscillation() {
    fetch('/oscillate-stop', { method: 'POST' })
        .then(response => response.text())
        .then(data => showAlert(data, 'success'))
        .catch(error => console.error('Error:', error));
}

document.getElementById('oscillationForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const speed = document.getElementById('oscillationSpeed').value;
    const minY = document.getElementById('minY').value;
    const maxY = document.getElementById('maxY').value;

    fetch('/oscillate-set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speed, minY, maxY })
    })
    .then(response => response.json())
    .then(data => showAlert('Oscillation settings applied', 'success'))
    .catch(error => console.error('Error:', error));
});

// Local Script
document.getElementById('localScriptForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const localScriptIndex = document.getElementById('localScriptIndex').value;
    const speedIndex = document.getElementById('speedIndex').value;
    localStorage.setItem('localScriptIndex', localScriptIndex);
    localStorage.setItem('speedIndex', speedIndex);

    fetch('/local-script-set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localScriptIndex, speedIndex })
    })
    .then(response => response.json())
    .then(data => showAlert('Local script loaded', 'success'))
    .catch(error => console.error('Error:', error));
});

document.getElementById('startLocalScript').addEventListener('click', function() {
    fetch('/local-script-start', { method: 'POST' })
        .then(response => response.json())
        .then(data => showAlert('Local script started', 'success'))
        .catch(error => console.error('Error:', error));
});

document.getElementById('stopLocalScript').addEventListener('click', function() {
    fetch('/local-script-stop', { method: 'POST' })
        .then(response => response.json())
        .then(data => showAlert('Local script stopped', 'success'))
        .catch(error => console.error('Error:', error));
});

// Sync Script Upload
document.getElementById('syncScriptForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const funscriptUrl = document.getElementById('funscriptUrl').value;

    fetch('/sync-script-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ funscriptUrl })
    })
    .then(response => response.json())
    .then(data => {
        const token = data.syncScriptToken;
        if (token) {
            localStorage.setItem('syncScriptToken', token);
            document.getElementById('syncScriptToken').textContent = token;
            showAlert('Sync script uploaded', 'success');
        }
    })
    .catch(error => console.error('Error:', error));
});

// Local funscript file upload
document.getElementById('funscriptFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const funscript = JSON.parse(e.target.result);
            fetch('/sync-script-upload-file', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(funscript)
            })
            .then(response => response.json())
            .then(data => {
                const token = data.syncScriptToken;
                if (token) {
                    localStorage.setItem('syncScriptToken', token);
                    document.getElementById('syncScriptToken').textContent = token;
                    showAlert('Funscript file uploaded', 'success');
                }
            })
            .catch(error => console.error('Error:', error));
        } catch (err) {
            showAlert('Invalid funscript JSON file', 'error');
        }
    };
    reader.readAsText(file);
});

// Alternate Sync Script (by token)
document.getElementById('alternateSyncScriptForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const token = document.getElementById('alternateSyncScriptToken').value;

    fetch('/sync-script-load-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    })
    .then(response => response.json())
    .then(data => {
        localStorage.setItem('syncScriptToken', token);
        document.getElementById('syncScriptToken').textContent = token;
        showAlert('Sync script token loaded', 'success');
    })
    .catch(error => console.error('Error:', error));
});

// Sync Script Start/Stop
let syncLoopInterval = null;
let lastSyncTime = 0;
let isSyncing = false;
let seekTimeout = null;
let isSeekPending = false;

function debouncedSeek(timeMs) {
    if (seekTimeout) clearTimeout(seekTimeout);
    seekTimeout = setTimeout(() => {
        if (!isSyncing || isSeekPending) return;
        isSeekPending = true;
        fetch('/sync-script-seek', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timeMs })
        })
        .then(() => { lastSyncTime = timeMs; })
        .catch(() => {})
        .finally(() => { isSeekPending = false; });
    }, 500);
}

function startSyncLoop() {
    if (syncLoopInterval) clearInterval(syncLoopInterval);
    syncLoopInterval = setInterval(() => {
        if (!isSyncing || videoPlayer.paused || isSeekPending) return;
        const videoTimeMs = Math.round(videoPlayer.currentTime * 1000);
        const drift = Math.abs(videoTimeMs - lastSyncTime);
        // Only re-sync if drift > 1.5s — reduces API spam
        if (drift > 1500) {
            debouncedSeek(videoTimeMs);
        }
    }, 3000);
}

function stopSyncLoop() {
    if (syncLoopInterval) clearInterval(syncLoopInterval);
    syncLoopInterval = null;
    isSyncing = false;
    if (seekTimeout) clearTimeout(seekTimeout);
}

document.getElementById('startSyncScript').addEventListener('click', function() {
    const startTimeMs = Math.round(videoPlayer.currentTime * 1000);
    if (videoPlayer.paused) {
        videoPlayer.play();
    }
    isSyncing = true;
    lastSyncTime = startTimeMs;
    currentTimeInterval = setInterval(updateCurrentTime, 1000);
    startSyncLoop();

    fetch('/sync-script-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startTimeMs })
    })
        .then(response => response.json())
        .then(data => console.log('Sync Script Started:', data))
        .catch(error => console.error('Error:', error));
});

document.getElementById('stopSyncScript').addEventListener('click', function() {
    videoPlayer.pause();
    clearInterval(currentTimeInterval);
    stopSyncLoop();

    fetch('/sync-script-stop', { method: 'POST' })
        .then(response => response.json())
        .then(data => console.log('Sync Script Stopped:', data))
        .catch(error => console.error('Error:', error));
});

// Keep device in sync when user scrubs
videoPlayer.addEventListener('seeking', () => {
    if (!isSyncing) return;
    const timeMs = Math.round(videoPlayer.currentTime * 1000);
    debouncedSeek(timeMs);
});

// Sync play/pause with device (debounced)
let playPauseTimeout = null;

videoPlayer.addEventListener('pause', () => {
    if (!isSyncing) return;
    if (playPauseTimeout) clearTimeout(playPauseTimeout);
    playPauseTimeout = setTimeout(() => {
        fetch('/sync-script-stop', { method: 'POST' }).catch(() => {});
    }, 300);
});

videoPlayer.addEventListener('play', () => {
    if (!isSyncing) return;
    if (playPauseTimeout) clearTimeout(playPauseTimeout);
    const timeMs = Math.round(videoPlayer.currentTime * 1000);
    lastSyncTime = timeMs;
    playPauseTimeout = setTimeout(() => {
        fetch('/sync-script-start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startTimeMs: timeMs })
        }).catch(() => {});
    }, 300);
});

// Video Upload
videoInput.addEventListener('change', function (e) {
    const files = Array.from(e.target.files);
    console.log('Selected files:', files.map(f => f.name));
    const videoFile = files.find(f => f.type.startsWith('video/'));
    const funscriptFile = files.find(f => f.name.endsWith('.funscript'));

    if (videoFile) {
        const objectURL = URL.createObjectURL(videoFile);
        videoPlayer.src = objectURL;
        videoOverlay.classList.add('hidden');
    }

    // Auto-load matching .funscript if present
    if (funscriptFile) {
        console.log('Found funscript file:', funscriptFile.name);
        const reader = new FileReader();
        reader.onload = function(ev) {
            try {
                const funscript = JSON.parse(ev.target.result);
                console.log('Parsed funscript, uploading...');
                fetch('/sync-script-upload-file', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(funscript)
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Upload response:', data);
                    const token = data.syncScriptToken;
                    if (token) {
                        localStorage.setItem('syncScriptToken', token);
                        document.getElementById('syncScriptToken').textContent = token;
                        showAlert(`Auto-loaded funscript: ${funscriptFile.name}`, 'success');
                        console.log('Toast should be visible now');
                    } else {
                        console.warn('No syncScriptToken in response');
                    }
                })
                .catch(error => console.error('Upload error:', error));
            } catch (err) {
                console.error('Parse error:', err);
                showAlert('Invalid funscript JSON file', 'error');
            }
        };
        reader.readAsText(funscriptFile);
    } else if (videoFile) {
        // Try to find a .funscript with the same base name in the selected files
        const baseName = videoFile.name.replace(/\.[^/.]+$/, '');
        const matched = files.find(f => f.name === `${baseName}.funscript`);
        if (matched) {
            console.log('Matched funscript by basename:', matched.name);
            const reader = new FileReader();
            reader.onload = function(ev) {
                try {
                    const funscript = JSON.parse(ev.target.result);
                    fetch('/sync-script-upload-file', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(funscript)
                    })
                    .then(response => response.json())
                    .then(data => {
                        const token = data.syncScriptToken;
                        if (token) {
                            localStorage.setItem('syncScriptToken', token);
                            document.getElementById('syncScriptToken').textContent = token;
                            showAlert(`Auto-loaded funscript: ${matched.name}`, 'success');
                        }
                    })
                    .catch(error => console.error('Error:', error));
                } catch (err) {
                    showAlert('Invalid funscript JSON file', 'error');
                }
            };
            reader.readAsText(matched);
        } else {
            console.log('No matching funscript found in selection');
        }
    }
});

videoOverlay.addEventListener('click', () => videoInput.click());
videoInput.addEventListener('click', (e) => e.stopPropagation());

// Current Time
function updateCurrentTime() {
    fetch('/state')
        .then(response => response.json())
        .then(state => {
            const ms = state.syncScriptCurrentTime || 0;
            document.getElementById('currentTime').textContent = (ms / 1000).toFixed(2) + 's';
        })
        .catch(error => console.error('Error:', error));
}

// Refresh button
document.getElementById('refreshBtn').addEventListener('click', () => {
    const token = localStorage.getItem('deviceToken');
    if (token) fetchData(token);
    refreshDiagnostics();
});

// Settings helpers
function clearToken() {
    localStorage.removeItem('deviceToken');
    document.getElementById('deviceToken').value = '';
    document.getElementById('savedToken').textContent = 'None';
    setConnected(false);
    showAlert('Device token cleared', 'success');
}

function clearScriptToken() {
    localStorage.removeItem('syncScriptToken');
    document.getElementById('syncScriptToken').textContent = 'None';
    document.getElementById('savedScriptToken').textContent = 'None';
    showAlert('Script token cleared', 'success');
}

// Diagnostics
function refreshDiagnostics() {
    clearApiErrors();
    Promise.all([
        fetch('/info').then(r => { if (!r.ok) throw new Error(`Info ${r.status}`); return r.json(); }),
        fetch('/state').then(r => { if (!r.ok) throw new Error(`State ${r.status}`); return r.json(); }),
        fetch('/latency').then(r => { if (!r.ok) throw new Error(`Latency ${r.status}`); return r.json(); }),
        fetch('/connected-cluster').then(r => { if (!r.ok) throw new Error(`Cluster ${r.status}`); return r.json(); }),
        fetch('/local-script-list').then(r => { if (!r.ok) throw new Error(`Scripts ${r.status}`); return r.json(); })
    ]).then(([info, state, latency, cluster, scripts]) => {
        // Info
        if (info) {
            document.getElementById('diagInfo').textContent =
                `Device Type: ${info.deviceType || 'N/A'}\n` +
                `Firmware: ${info.firmwareVersion || 'N/A'} (${info.firmwareBranch || 'N/A'})\n` +
                `Hardware: ${info.hardwareVersion || 'N/A'}\n` +
                `Firmware Status: ${info.firmwareStatus || 'N/A'}\n` +
                `MAC: ${info.mac || 'N/A'}`;
        }

        // State
        if (state) {
            document.getElementById('diagState').textContent =
                `Mode: ${state.operationalMode || 'N/A'}\n` +
                `Motor Temp: ${state.motorTemperature != null ? state.motorTemperature + '°C' : 'N/A'}\n` +
                `Local Script: #${state.localScript != null ? state.localScript : 'N/A'} @ speed ${state.localScriptSpeed != null ? state.localScriptSpeed : 'N/A'}\n` +
                `Oscillator: speed ${state.oscillatorTargetSpeed != null ? state.oscillatorTargetSpeed : 'N/A'}, range ${state.oscillatorLowPoint != null ? state.oscillatorLowPoint : 'N/A'}-${state.oscillatorHighPoint != null ? state.oscillatorHighPoint : 'N/A'}\n` +
                `Sync Script Token: ${state.syncScriptToken || 'None'}\n` +
                `Sync Time: ${state.syncScriptCurrentTime != null ? (state.syncScriptCurrentTime / 1000).toFixed(2) + 's' : 'N/A'}\n` +
                `Sync Offset: ${state.syncScriptOffsetTime != null ? state.syncScriptOffsetTime + 'ms' : 'N/A'}\n` +
                `Sync Loop: ${state.syncScriptLoop != null ? state.syncScriptLoop : 'N/A'}`;
        }

        // Connection
        document.getElementById('diagConnection').textContent =
            cluster ? `Cluster: ${cluster.connectedCluster || 'N/A'}` : 'N/A';

        // Latency
        document.getElementById('diagLatency').textContent =
            latency ? `${latency.latency} ms` : 'N/A';

        // Cluster
        document.getElementById('diagCluster').textContent =
            cluster ? cluster.connectedCluster || 'N/A' : 'N/A';

        // Scripts
        document.getElementById('diagScripts').textContent =
            scripts ? JSON.stringify(scripts.scripts, null, 2) : 'N/A';

        showAlert('Diagnostics refreshed', 'success');
    }).catch(error => {
        console.error('Diagnostics error:', error);
        showApiError(`API Error: ${error.message}`);
    });
}

// Init on load
window.addEventListener('DOMContentLoaded', () => {
    // Check if server already initialized from .env
    fetch('/init-status')
        .then(r => r.json())
        .then(status => {
            if (status.initialized) {
                setConnected(true);
                showAlert('Device auto-connected from .env', 'success');
                return Promise.all([
                    fetch('/info').then(r => r.json()),
                    fetch('/state').then(r => r.json()),
                    fetch('/connection-info', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ deviceId: status.deviceId })
                    }).then(r => r.json())
                ]);
            } else {
                // Fall back to localStorage token
                const deviceToken = localStorage.getItem('deviceToken');
                if (deviceToken) {
                    document.getElementById('deviceToken').value = deviceToken;
                    fetchData(deviceToken);
                }
                return null;
            }
        })
        .then(result => {
            if (result) {
                const [info, state, connectionInfo] = result;
                document.getElementById('info').textContent = formatJson(info);
                document.getElementById('state').textContent = formatJson(state);
                document.getElementById('connectionInfo').textContent = formatJson(connectionInfo);
                startStatePolling();
                loadDashboardStats();
            }
        })
        .catch(() => {
            // Silent fail — let user input manually
        });

    const localScriptIndex = localStorage.getItem('localScriptIndex');
    const speedIndex = localStorage.getItem('speedIndex');
    if (localScriptIndex !== null) document.getElementById('localScriptIndex').value = localScriptIndex;
    if (speedIndex !== null) document.getElementById('speedIndex').value = speedIndex;

    const lastSyncScriptToken = localStorage.getItem('syncScriptToken');
    if (lastSyncScriptToken) {
        document.getElementById('syncScriptToken').textContent = lastSyncScriptToken;
    }

    // Settings page values
    const savedToken = localStorage.getItem('deviceToken');
    document.getElementById('savedToken').textContent = savedToken || 'None';
    document.getElementById('savedScriptToken').textContent = lastSyncScriptToken || 'None';
});

