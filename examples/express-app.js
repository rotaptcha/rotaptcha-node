/**
 * Express.js integration example for Rotaptcha Node.js SDK
 * 
 * This example demonstrates how to integrate Rotaptcha
 * into an Express.js application.
 * 
 * Note: This is a demo. You'll need to install express:
 * npm install express
 */

// Uncomment if you have express installed:
// const express = require('express');
const Rotaptcha = require('../index');

// Create Express app (commented out - uncomment when express is installed)
// const app = express();
// app.use(express.json());

// Initialize Rotaptcha
const rotaptcha = new Rotaptcha(process.env.ROTAPTCHA_SECRET_KEY || 'demo-secret-key');

// Middleware to verify CAPTCHA
async function verifyCaptcha(req, res, next) {
  const token = req.body.captchaToken;
  
  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'CAPTCHA token is required'
    });
  }
  
  const result = await rotaptcha.verify(token, req.ip);
  
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: 'CAPTCHA verification failed'
    });
  }
  
  next();
}

// Example route with CAPTCHA protection
// app.post('/api/contact', verifyCaptcha, (req, res) => {
//   const { name, email, message } = req.body;
//   
//   // Process the contact form
//   console.log('Contact form submitted:', { name, email, message });
//   
//   res.json({
//     success: true,
//     message: 'Your message has been received'
//   });
// });

// Example route for form submission
// app.post('/api/register', verifyCaptcha, async (req, res) => {
//   const { username, email, password } = req.body;
//   
//   // Process user registration
//   console.log('User registration:', { username, email });
//   
//   res.json({
//     success: true,
//     message: 'Registration successful'
//   });
// });

// Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// Export for use as a module
module.exports = {
  verifyCaptcha,
  rotaptcha
};

console.log('Express example loaded. Uncomment the code to run with Express installed.');
