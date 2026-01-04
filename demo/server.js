const express = require('express');
const path = require('path');
const rotaptcha = require('../dist/index').default;

const app = express();
const port = 3000;

// Serve static files from demo directory
app.use(express.static(path.join(__dirname)));
app.use(express.json());

const demoKey = "4b5b2febf41131f086242d87cc4e474b";

// Create captcha endpoint
app.get('/api/create', async (req, res) => {
    try {
        // Get config parameters from query string
        const config = {
            strokeWidth: parseInt(req.query.strokeWidth) || 6,
            noiseDensity: parseInt(req.query.noiseDensity) || 5,
            wobbleIntensity: parseInt(req.query.wobbleIntensity) || 3,
            width: parseInt(req.query.width) || 400,
            height: parseInt(req.query.height) || 400,
            minValue: parseInt(req.query.minValue) || 20,
            maxValue: parseInt(req.query.maxValue) || 90,
            step: parseInt(req.query.step) || 10,
            noise: req.query.noise === 'true' || req.query.noise === true,
            canvasBg: req.query.canvasBg || '#ffffff'
        };

        const result = await rotaptcha.create({
            width: config.width,
            height: config.height,
            minValue: config.minValue,
            maxValue: config.maxValue,
            step: config.step,
            wobbleIntensity: config.wobbleIntensity,
            noise: config.noise,
            strokeWidth: config.strokeWidth,
            noiseDensity: config.noiseDensity,
            canvasBg: config.canvasBg
        }, demoKey);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verify captcha endpoint
app.post('/api/verify', async (req, res) => {
    try {
        const { token, answer } = req.body;
        const result = await rotaptcha.verify({ token, answer, secretKey: demoKey });
        res.json({ success: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Demo server running at http://localhost:${port}`);
});
