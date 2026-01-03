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
        const result = await rotaptcha.create({
            width: 400,
            height: 400,
            minValue: 20,
            maxValue: 90,
            step: 10,
            strokeWidth: 5,
            wobble: true,
            noise: true,
            secretKey: demoKey,
        });
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
