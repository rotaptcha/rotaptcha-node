# rotaptcha-node

A modern, gamified CAPTCHA solution for Node.js — no distorted text, no annoyance, just fun interactive challenges that users actually enjoy.

## Features

- **Rotation-based puzzle** – identify the rotation angle of shapes in a circular viewport
- **Zero external dependencies** – uses only Canvas API for shape rendering
- **Framework-agnostic** – works seamlessly with Express, Fastify, Next.js API routes, Hono, Elysia, and any Node.js server
- **Simple UUID-based verification** – generate challenge, verify answer in one line
- **Blazing fast** – sub-millisecond verification, in-memory storage with LokiJS
- **Fully customizable** – adjust canvas size, rotation range, wobble effects, noise, and stroke width

## Installation

```bash
npm install rotaptcha-node
```

```bash
yarn add rotaptcha-node
```

```bash
pnpm add rotaptcha-node
```

```bash
bun add rotaptcha-node
```

## How It Works

rotaptcha generates a visual puzzle where:
1. **Four random shapes** (circles, squares, triangles, pentagons, hexagons) are drawn in quadrants
2. **The center circular area** shows the same shapes but rotated by a specific angle
3. **The user must identify** the rotation angle to solve the challenge

The rotation angle is stored server-side with a unique UUID, and verification happens by comparing the user's answer.

## Quick Start

### Backend Example (Express)

```ts
import express from 'express';
import rotaptcha from 'rotaptcha-node';

const app = express();
app.use(express.json());

// Generate a CAPTCHA challenge
app.get('/captcha/create', async (req, res) => {
  const imageBase64 = await rotaptcha.create({
    width: 400,
    height: 400,
    minValue: 30,
    maxValue: 90,
    step: 5,
    strokeWidth: 5,
    wobble: false,
    noise: true
  });

  // Extract UUID from response (you'll need to return this to frontend)
  res.json({ 
    image: `data:image/png;base64,${imageBase64}`,
    uuid: 'generated-uuid' // This should be extracted from the create method
  });
});

// Verify the user's answer
app.post('/captcha/verify', async (req, res) => {
  const { uuid, answer } = req.body;

  const isValid = await rotaptcha.verify({ uuid, answer });

  if (!isValid) {
    return res.status(400).json({ error: 'Invalid CAPTCHA' });
  }

  res.json({ message: 'Success! CAPTCHA verified.' });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

## API Reference

### `rotaptcha.create(options)`

Generates a CAPTCHA image with rotated shapes in the center.

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `width` | `number` | `400` | Canvas width in pixels |
| `height` | `number` | `400` | Canvas height in pixels |
| `minValue` | `number` | `30` | Minimum rotation angle in degrees |
| `maxValue` | `number` | `90` | Maximum rotation angle in degrees |
| `step` | `number` | `5` | Step size for rotation (e.g., 5 means 30, 35, 40...) |
| `strokeWidth` | `number` | `5` | Line thickness for drawing shapes |
| `wobble` | `boolean` | `false` | Enable wobbly/hand-drawn effect on shapes |
| `noise` | `boolean` | `true` | Add visual noise (dots, lines, speckles) for anti-bot protection |

#### Returns

`Promise<string>` - Base64-encoded PNG image

#### Implementation Details

The `create` method:
1. **Generates a random rotation angle** using `randomWithStep(minValue, maxValue, step)` - ensures the angle is a multiple of the step size (e.g., 30, 35, 40 if step=5)
2. **Creates a unique UUID** with `generateShortUuid()` - an 8-character alphanumeric identifier
3. **Stores the UUID and rotation** in LokiJS in-memory database for later verification
4. **Draws shapes** using HTML5 Canvas:
   - Four quadrants each get a random shape (circle, square, triangle, pentagon, or hexagon)
   - Shapes are drawn with seeded randomness to ensure consistency
   - A circular clipping mask is applied to the center
   - The center area is redrawn with the same shapes rotated by the target angle
5. **Applies optional effects**:
   - **Wobble**: Makes shapes appear hand-drawn with curved edges
   - **Noise**: Adds dots, lines, crosses, and speckles for bot resistance
6. **Returns a Base64 PNG string** ready to be embedded in an `<img>` tag

**Storage mechanism**: Uses LokiJS (in-memory database) to store the UUID-rotation mapping. Each challenge is stored as:
```js
{ uuid: "aB9kP2mX", rotation: 45 }
```

### `rotaptcha.verify(options)`

Verifies if the user's answer matches the stored rotation angle.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | `string` | Yes | The unique identifier returned from `create()` |
| `answer` | `string` | Yes | User's rotation angle guess (as string) |

#### Returns

`Promise<boolean>` - `true` if answer is correct, `false` otherwise

#### Implementation Details

The `verify` method:
1. **Looks up the UUID** in the LokiJS collection
2. **Parses the answer** from string to integer using `parseInt()`
3. **Compares the answer** with the stored rotation value
4. **Returns true** if they match exactly, **false** otherwise

**Important**: The verification is a simple exact match. The user must provide the precise rotation angle (e.g., "45" for 45 degrees).

**Security consideration**: Answers are stored in memory and not automatically cleaned up. In production, consider implementing:
- Time-based expiration (e.g., challenges expire after 5 minutes)
- One-time verification (delete challenge after successful verification)
- Rate limiting to prevent brute-force attacks

## Advanced Usage

### With Custom Styling

```ts
const challenge = await rotaptcha.create({
  width: 600,
  height: 600,
  minValue: 0,
  maxValue: 180,
  step: 10,
  strokeWidth: 8,
  wobble: true,  // Hand-drawn aesthetic
  noise: true    // Extra bot protection
});
```

### With One-Time Verification

```ts
app.post('/captcha/verify', async (req, res) => {
  const { uuid, answer } = req.body;
  
  const isValid = await rotaptcha.verify({ uuid, answer });
  
  if (isValid) {
    // TODO: Delete the challenge from database after verification
    // to prevent replay attacks
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid CAPTCHA' });
  }
});
```

## Frontend Integration Example

```html
<!DOCTYPE html>
<html>
<body>
  <img id="captcha-image" />
  <input type="number" id="rotation-input" placeholder="Enter rotation angle" />
  <button onclick="verify()">Verify</button>

  <script>
    let currentUuid = null;

    // Load CAPTCHA on page load
    async function loadCaptcha() {
      const response = await fetch('/captcha/create');
      const data = await response.json();
      document.getElementById('captcha-image').src = data.image;
      currentUuid = data.uuid;
    }

    // Verify user's answer
    async function verify() {
      const answer = document.getElementById('rotation-input').value;
      
      const response = await fetch('/captcha/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid: currentUuid, answer })
      });

      const result = await response.json();
      alert(result.message || result.error);
    }

    loadCaptcha();
  </script>
</body>
</html>
```

## Architecture

### Shape Generation
- Five shape types: circles, squares, triangles, pentagons, hexagons
- Seeded random function ensures consistency between initial draw and rotated draw
- Shapes are 85% of quadrant size by default for visual balance

### Rotation Mechanism
1. Draw shapes in four quadrants
2. Apply circular clipping mask to center (radius = canvas width / 3)
3. Clear the clipped area
4. Apply rotation transformation
5. Redraw the same shapes (using same seed)
6. Remove clipping mask

### Effects
- **Wobble**: Replaces straight lines with quadratic curves with random control points
- **Noise**: Adds 50 noise elements (dots, lines, crosses) + 100 speckles with 40% opacity

## Why rotaptcha?

Traditional CAPTCHAs frustrate users and hurt conversion rates. rotaptcha turns security into a delightful micro-interaction that's:
- **Accessible** – easier to solve than distorted text
- **Fast** – typical solve time under 5 seconds
- **Effective** – visual puzzles are harder for bots to automate

Start protecting your users today — no more "I can't read this squiggly text" support tickets.

## License

MIT

Made with care for modern web applications.
