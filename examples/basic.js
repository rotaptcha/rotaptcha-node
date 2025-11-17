/**
 * Basic usage example for Rotaptcha Node.js SDK
 */

const Rotaptcha = require('../index');

// Replace with your actual secret key
const SECRET_KEY = 'your-secret-key-here';

// Create a Rotaptcha client
const rotaptcha = new Rotaptcha(SECRET_KEY);

// Example 1: Basic verification
async function basicExample() {
  console.log('Example 1: Basic CAPTCHA verification');
  
  const token = 'sample-captcha-token';
  const result = await rotaptcha.verify(token);
  
  console.log('Verification result:', result);
  console.log('');
}

// Example 2: Verification with IP address
async function verifyWithIP() {
  console.log('Example 2: CAPTCHA verification with IP address');
  
  const token = 'sample-captcha-token';
  const userIP = '192.168.1.1';
  const result = await rotaptcha.verify(token, userIP);
  
  console.log('Verification result:', result);
  console.log('');
}

// Example 3: Using callback style
function callbackExample() {
  console.log('Example 3: Callback-style verification');
  
  const token = 'sample-captcha-token';
  
  rotaptcha.verifyCallback(token, (error, result) => {
    if (error) {
      console.error('Error:', error);
      return;
    }
    console.log('Verification result:', result);
    console.log('');
  });
}

// Example 4: Error handling
async function errorHandlingExample() {
  console.log('Example 4: Error handling');
  
  try {
    // This will return an error because token is invalid
    const result = await rotaptcha.verify('');
    console.log('Result:', result);
  } catch (error) {
    console.error('Caught error:', error.message);
  }
  console.log('');
}

// Run all examples
(async () => {
  await basicExample();
  await verifyWithIP();
  callbackExample();
  
  // Give callback time to complete
  setTimeout(async () => {
    await errorHandlingExample();
  }, 1000);
})();
