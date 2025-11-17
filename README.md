# Rotaptcha Node.js SDK

[![npm version](https://img.shields.io/npm/v/rotaptcha-node.svg)](https://www.npmjs.com/package/rotaptcha-node)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Node.js SDK for Rotaptcha - A simple CAPTCHA verification solution for backend applications.

## Installation

```bash
npm install rotaptcha-node
```

## Quick Start

```javascript
const Rotaptcha = require('rotaptcha-node');

// Create a client instance with your secret key
const rotaptcha = new Rotaptcha('your-secret-key');

// Verify a CAPTCHA response token
rotaptcha.verify('user-response-token')
  .then(result => {
    if (result.success) {
      console.log('CAPTCHA verification successful!');
      // Proceed with your application logic
    } else {
      console.log('CAPTCHA verification failed:', result.error);
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

## Usage

### Creating a Client

```javascript
const Rotaptcha = require('rotaptcha-node');

// Basic initialization
const rotaptcha = new Rotaptcha('your-secret-key');

// With custom options
const rotaptcha = new Rotaptcha('your-secret-key', {
  apiEndpoint: 'custom.api.endpoint.com'
});

// Using factory function
const rotaptcha = Rotaptcha.createClient('your-secret-key');
```

### Verifying CAPTCHA Responses

#### Promise-based (Recommended)

```javascript
const result = await rotaptcha.verify(token);

if (result.success) {
  // CAPTCHA verification successful
  console.log('User verified successfully');
} else {
  // CAPTCHA verification failed
  console.error('Verification failed:', result.error);
}
```

#### With Remote IP Address

```javascript
const result = await rotaptcha.verify(token, '192.168.1.1');
```

#### Callback-based

```javascript
rotaptcha.verifyCallback(token, (error, result) => {
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  if (result.success) {
    console.log('CAPTCHA verified!');
  }
});

// With remote IP
rotaptcha.verifyCallback(token, '192.168.1.1', (error, result) => {
  // Handle result
});
```

## API Reference

### Class: `Rotaptcha`

#### Constructor: `new Rotaptcha(secretKey, options)`

Creates a new Rotaptcha client instance.

**Parameters:**
- `secretKey` (string, required): Your Rotaptcha secret key
- `options` (object, optional): Configuration options
  - `apiEndpoint` (string): Custom API endpoint (default: 'api.rotaptcha.com')

**Throws:**
- Error if `secretKey` is not provided or not a string

#### Method: `verify(token, remoteIp)`

Verifies a CAPTCHA response token.

**Parameters:**
- `token` (string, required): The response token from the client
- `remoteIp` (string, optional): Remote IP address of the user

**Returns:** `Promise<object>`
- `success` (boolean): Whether verification was successful
- `error` (string): Error message if verification failed

#### Method: `verifyCallback(token, remoteIp, callback)`

Callback-based version of verify.

**Parameters:**
- `token` (string, required): The response token from the client
- `remoteIp` (string, optional): Remote IP address of the user
- `callback` (function, required): Callback function `(error, result) => {}`

### Function: `createClient(secretKey, options)`

Factory function to create a new Rotaptcha instance.

**Parameters:**
- Same as Rotaptcha constructor

**Returns:** Rotaptcha instance

## Examples

### Express.js Integration

```javascript
const express = require('express');
const Rotaptcha = require('rotaptcha-node');

const app = express();
const rotaptcha = new Rotaptcha(process.env.ROTAPTCHA_SECRET_KEY);

app.use(express.json());

app.post('/submit-form', async (req, res) => {
  const { captchaToken, ...formData } = req.body;
  
  // Verify CAPTCHA
  const result = await rotaptcha.verify(captchaToken, req.ip);
  
  if (!result.success) {
    return res.status(400).json({
      error: 'CAPTCHA verification failed'
    });
  }
  
  // Process form data
  // ...
  
  res.json({ success: true });
});

app.listen(3000);
```

### Async/Await with Error Handling

```javascript
async function handleFormSubmission(token, userIp) {
  try {
    const result = await rotaptcha.verify(token, userIp);
    
    if (result.success) {
      // Process the request
      return { status: 'success' };
    } else {
      return { status: 'error', message: result.error };
    }
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    return { status: 'error', message: 'Verification failed' };
  }
}
```

## Testing

Run the test suite:

```bash
npm test
```

## Requirements

- Node.js >= 12.0.0

## License

MIT

## Support

For issues and questions, please visit:
- GitHub Issues: https://github.com/rotaptcha/rotaptcha-node/issues

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
