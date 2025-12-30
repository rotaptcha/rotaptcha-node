# Rotaptcha Demo

A simple web demo to test the Rotaptcha create and verify methods.

## Setup

1. Build the project first:
   ```bash
   npm run build
   ```

2. Install Express (if not already installed):
   ```bash
   npm install express
   ```

3. Start the demo server:
   ```bash
   node demo/server.js
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## How It Works

The demo webpage:
- Loads a captcha image from the `/api/create` endpoint
- Displays the rotated shape
- Provides an input field for the user to guess the rotation angle
- Verifies the answer using the `/api/verify` endpoint
- Shows success/error messages
- Allows refreshing to get a new captcha

## API Endpoints

- `GET /api/create` - Creates a new captcha and returns the image and token
- `POST /api/verify` - Verifies the user's answer
  - Body: `{ uuid: string, answer: string }`
  - Returns: `{ success: boolean }`
