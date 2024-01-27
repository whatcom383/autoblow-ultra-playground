import express from 'express';
import {
    Autoblow
} from '@xsense/autoblow-sdk';
import fetch from 'node-fetch';
global.fetch = fetch;
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public')); // Serve static files from 'public' directory

const autoblow = new Autoblow();

app.post('/init', async (req, res) => {
    try {
        // Assuming the device token is sent in the request body
        const {
            deviceId
        } = req.body;

        // Initialize the device with the provided token
        await autoblow.init(deviceId);

        res.send("Device initialized successfully");
    } catch (error) {
        console.error("Error initializing the device:", error);
        res.status(500).send("Failed to initialize the device");
    }
});

app.get('/info', async (req, res) => {
    try {
        const info = await autoblow.getInfo();
        res.json(info);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.get('/state', async (req, res) => {
    try {
        const state = await autoblow.getState();
        res.json(state);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.get('/latency', async (req, res) => {
    try {
        const latency = await autoblow.estimateLatency();
        res.json({
            latency
        });
    } catch (error) {
        console.error("Error estimating latency:", error);
        res.status(500).send("Failed to estimate latency");
    }
});

app.post('/oscillate-start', async (req, res) => {
    try {
        const state = await autoblow.oscillateStart();
        res.send("Oscillation started successfully");
    } catch (error) {
        console.error("Error starting oscillation:", error);
        res.status(500).send("Failed to start oscillation");
    }
});


app.post('/oscillate-stop', async (req, res) => {
    try {
        const state = await autoblow.oscillateStop();
        res.send("Oscillation stopped successfully");
    } catch (error) {
        console.error("Error stopping oscillation:", error);
        res.status(500).send("Failed to stop oscillation");
    }
});

app.get('/connected-cluster', async (req, res) => {
    try {
        const connectedCluster = autoblow.getConnectedCluster();
        res.json({
            connectedCluster
        });
    } catch (error) {
        console.error("Error getting connected cluster:", error);
        res.status(500).send("Failed to get connected cluster");
    }
});


app.post('/connection-info', async (req, res) => {
    try {
        const {
            deviceId
        } = req.body;
        const connectionInfo = await autoblow.getConnectionInfo(deviceId);
        res.json(connectionInfo);
    } catch (error) {
        console.error("Error getting connection info:", error);
        res.status(500).send("Failed to get connection info");
    }
});

app.post('/local-script-set', async (req, res) => {
    try {
        const {
            localScriptIndex,
            speedIndex
        } = req.body;
        const state = await autoblow.localScriptSet(localScriptIndex, speedIndex);
        res.json(state);
    } catch (error) {
        console.error("Error setting local script:", error);
        res.status(500).send("Failed to set local script");
    }
});

app.post('/local-script-start', async (req, res) => {
    try {
        const state = await autoblow.localScriptStart();
        res.json(state);
    } catch (error) {
        console.error("Error starting local script:", error);
        res.status(500).send("Failed to start local script");
    }
});

app.post('/local-script-stop', async (req, res) => {
    try {
        const state = await autoblow.localScriptStop();
        res.json(state);
    } catch (error) {
        console.error("Error stopping local script:", error);
        res.status(500).send("Failed to stop local script");
    }
});

app.post('/oscillate-set', async (req, res) => {
    try {
        const {
            speed,
            minY,
            maxY
        } = req.body;
        const state = await autoblow.oscillateSet(speed, minY, maxY);
        res.json(state);
    } catch (error) {
        console.error("Error setting oscillation:", error);
        res.status(500).send("Failed to set oscillation");
    }
});

app.post('/sync-script-upload', async (req, res) => {
    try {
        const {
            funscriptUrl
        } = req.body;
        const state = await autoblow.syncScriptUploadFunscriptUrl(funscriptUrl);
        res.json(state);
    } catch (error) {
        console.error("Error uploading sync script:", error);
        res.status(500).send("Failed to upload sync script");
    }
});

app.post('/sync-script-load-token', async (req, res) => {
    try {
        const {
            token
        } = req.body;
        const state = await autoblow.syncScriptLoadToken(token);
        res.json(state);
    } catch (error) {
        console.error("Error loading sync script with token:", error);
        res.status(500).send("Failed to load sync script with token");
    }
});

app.post('/sync-script-start', async (req, res) => {
    try {
        const state = await autoblow.syncScriptStart();
        res.json(state);
    } catch (error) {
        console.error("Error starting sync script:", error);
        res.status(500).send("Failed to start sync script");
    }
});

app.post('/sync-script-stop', async (req, res) => {
    try {
        const state = await autoblow.syncScriptStop();
        res.json(state);
    } catch (error) {
        console.error("Error stopping sync script:", error);
        res.status(500).send("Failed to stop sync script");
    }
});




app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});