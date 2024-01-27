const videoInput = document.getElementById('videoInput');
const videoPlayer = document.getElementById('videoPlayer');
const playButton = document.getElementById('playButton');
// Variable to keep track of the timer interval
let currentTimeInterval;

document.getElementById('tokenForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const deviceToken = document.getElementById('deviceToken').value;
    localStorage.setItem('deviceToken', deviceToken); // Save token to local storage

    fetchData(deviceToken);
});

function fetchData(deviceToken) {
    fetch('/init', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                deviceId: deviceToken
            })
        })
        .then(response => response.text())
        .then(data => {
            document.getElementById('response').innerText = data;
            return Promise.all([
                fetch('/info').then(response => response.json()),
                fetch('/state').then(response => response.json()),
                fetch('/connection-info', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        deviceId: deviceToken
                    })
                }).then(response => response.json())
            ]);
        })
        .then(([info, state, connectionInfo]) => {
            document.getElementById('info').innerText = 'Device Info: ' + JSON.stringify(info, null, 2);
            document.getElementById('state').innerText = 'Device State: ' + JSON.stringify(state, null, 2);
            document.getElementById('connectionInfo').innerText = 'Connection Info: ' + JSON.stringify(connectionInfo, null, 2);
        })
        .catch(error => {
            console.error('Error:', error);
        });

}

document.getElementById('localScriptForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const localScriptIndex = document.getElementById('localScriptIndex').value;
    const speedIndex = document.getElementById('speedIndex').value;

    localStorage.setItem('localScriptIndex', localScriptIndex);
    localStorage.setItem('speedIndex', speedIndex);

    fetch('/local-script-set', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                localScriptIndex,
                speedIndex
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Local Script Set:', data);
            window.location.reload(); // Add this line
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

// Add similar listeners for localScriptStart and localScriptStop buttons



document.getElementById('startLocalScript').addEventListener('click', function() {
    fetch('/local-script-start', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            console.log('Local Script Started:', data);
            window.location.reload(); // Add this line
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

document.getElementById('stopLocalScript').addEventListener('click', function() {
    fetch('/local-script-stop', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            console.log('Local Script Stopped:', data);
            window.location.reload(); // Add this line
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

document.getElementById('tokenForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const deviceToken = document.getElementById('deviceToken').value;
    localStorage.setItem('deviceToken', deviceToken); // Save token to local storage

    // ... existing fetch/init code ...
});


document.getElementById('oscillationForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const speed = document.getElementById('oscillationSpeed').value;
    const minY = document.getElementById('minY').value;
    const maxY = document.getElementById('maxY').value;

    fetch('/oscillate-set', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                speed,
                minY,
                maxY
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Oscillation Set:', data);
            window.location.reload(); // Add this line
        })
        .catch(error => {
            console.error('Error:', error);
        });
});


document.getElementById('syncScriptForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const funscriptUrl = document.getElementById('funscriptUrl').value;

    fetch('/sync-script-upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                funscriptUrl
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Sync Script Uploaded:', data);

            // Extract the syncScriptToken from the response data
            const syncScriptToken = data.syncScriptToken;

            // Save the syncScriptToken to local storage
            localStorage.setItem('syncScriptToken', syncScriptToken);

            // Display the syncScriptToken in the container
            const syncScriptTokenContainer = document.getElementById('syncScriptTokenContainer');
            const syncScriptTokenElement = document.getElementById('syncScriptToken');
            syncScriptTokenElement.textContent = syncScriptToken;

            // Optionally, you can reload the page if needed
            // window.location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
        });
});



// Event listener for the 'Start Sync Script' button
document.getElementById('startSyncScript').addEventListener('click', function() {
    if (videoPlayer.paused) {
        videoPlayer.play();
        playButton.textContent = 'Pause';
        // Start the timer to update current time periodically
        currentTimeInterval = setInterval(updateCurrentTime, 1000); // Update every second
    } else {
        videoPlayer.pause();
        playButton.textContent = 'Play';
        // Stop the timer when the sync script is paused
        clearInterval(currentTimeInterval);
    }

    fetch('/sync-script-start', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            console.log('Sync Script Started:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

// Event listener for the 'Stop Sync Script' button
document.getElementById('stopSyncScript').addEventListener('click', function() {
    if (videoPlayer.paused) {
        videoPlayer.play();
        playButton.textContent = 'Pause';
    } else {
        videoPlayer.pause();
        playButton.textContent = 'Play';
    }

    fetch('/sync-script-stop', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            console.log('Sync Script Stopped:', data);
            // Stop the timer when the sync script is stopped
            clearInterval(currentTimeInterval);
        })
        .catch(error => {
            console.error('Error:', error);
        });
});



videoInput.addEventListener('change', function(e) {
    const file = e.target.files[0];

    if (file) {
        const objectURL = URL.createObjectURL(file);
        videoPlayer.src = objectURL;
    } else {
        videoPlayer.src = '';
    }
});

playButton.addEventListener('click', function() {
    if (videoPlayer.paused) {
        videoPlayer.play();
        playButton.textContent = 'Pause';
    } else {
        videoPlayer.pause();
        playButton.textContent = 'Play';
    }
});



// Update the event listener for the 'alternateSyncScriptForm'
document.getElementById('alternateSyncScriptForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const alternateSyncScriptToken = document.getElementById('alternateSyncScriptToken').value;

    // Send a POST request to the '/sync-script-load-token' endpoint
    fetch('/sync-script-load-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: alternateSyncScriptToken
            }) // Send the token in the request body
        })
        .then(response => response.json())
        .then(data => {
            console.log('Alternate Sync Script Set:', data);
            window.location.reload(); // Add this line if needed

            localStorage.setItem('syncScriptToken', alternateSyncScriptToken);

            // Extract the syncScriptToken from the response data
            const altsyncScriptToken = data.syncScriptToken;

            // Display the updated syncScriptToken in the container
            const altSyncScriptTokenElement = document.getElementById('alttSyncScriptToken');
            altSyncScriptTokenElement.textContent = altsyncScriptToken;
        })
        .catch(error => {
            console.error('Error setting alternate sync script:', error);
            // Optionally, display an error message or handle the error
        });
});




window.onload = () => {
    const deviceToken = localStorage.getItem('deviceToken');
    if (deviceToken) {
        document.getElementById('deviceToken').value = deviceToken;
        fetchData(deviceToken);
    }

    // Load local script settings
    const localScriptIndex = localStorage.getItem('localScriptIndex');
    const speedIndex = localStorage.getItem('speedIndex');
    if (localScriptIndex !== null) {
        document.getElementById('localScriptIndex').value = localScriptIndex;
    }

    if (speedIndex !== null) {
        document.getElementById('speedIndex').value = speedIndex;
    }

    // Load the last sync script token
    const lastSyncScriptToken = localStorage.getItem('syncScriptToken');
    if (lastSyncScriptToken !== null) {
        const syncScriptTokenElement = document.getElementById('syncScriptToken');
        syncScriptTokenElement.textContent = lastSyncScriptToken;
    }

    // Load the alternate sync script token if it exists in local storage
    const alternateSyncScriptToken = localStorage.getItem('syncScriptToken');
    if (alternateSyncScriptToken !== null) {
        const alternateSyncScriptTokenInput = document.getElementById('alttSyncScriptToken');
        alternateSyncScriptTokenInput.textContent = alternateSyncScriptToken;
    }
};

// Function to update the displayed current time
function updateCurrentTime() {
    fetch('/state')
        .then(response => response.json())
        .then(state => {
            const syncScriptCurrentTimeMs = state.syncScriptCurrentTime;
            const syncScriptCurrentTimeSeconds = syncScriptCurrentTimeMs / 1000; // Convert milliseconds to seconds
            const currentTimeElement = document.getElementById('currentTime');
            currentTimeElement.textContent = syncScriptCurrentTimeSeconds.toFixed(2) + ' seconds'; // Display with two decimal places
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function requestLatency() {
    fetch('/latency')
        .then(response => response.json())
        .then(data => {
            document.getElementById('latency').innerText = 'Latency: ' + data.latency + ' ms';
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


function startOscillation() {
    fetch('/oscillate-start', {
            method: 'POST'
        })
        .then(response => response.text())
        .then(data => {
            console.log('Oscillation Started:', data);
            window.location.reload(); // Add this line
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function stopOscillation() {
    fetch('/oscillate-stop', {
            method: 'POST'
        })
        .then(response => response.text())
        .then(data => {
            console.log('Oscillation Stopped:', data);
            window.location.reload(); // Add this line
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function displayConnectedCluster() {
    fetch('/connected-cluster')
        .then(response => response.json())
        .then(data => {
            document.getElementById('connectedCluster').innerText = 'Connected Cluster: ' + data.connectedCluster;
        })
        .catch(error => {
            console.error('Error:', error);
        });
}