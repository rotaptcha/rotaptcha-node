/**
 * Rotaptcha Node.js SDK
 * 
 * A simple CAPTCHA verification solution for Node.js backend applications.
 */

const https = require('https');

/**
 * Rotaptcha client for verifying CAPTCHA responses
 */
class Rotaptcha {
  /**
   * Create a new Rotaptcha instance
   * @param {string} secretKey - Your Rotaptcha secret key
   * @param {object} options - Optional configuration
   * @param {string} options.apiEndpoint - Custom API endpoint (default: api.rotaptcha.com)
   */
  constructor(secretKey, options = {}) {
    if (!secretKey || typeof secretKey !== 'string') {
      throw new Error('Secret key is required and must be a string');
    }
    
    this.secretKey = secretKey;
    this.apiEndpoint = options.apiEndpoint || 'api.rotaptcha.com';
  }

  /**
   * Verify a CAPTCHA response token
   * @param {string} token - The response token from the client
   * @param {string} remoteIp - Optional remote IP address of the user
   * @returns {Promise<object>} Verification result
   */
  async verify(token, remoteIp = null) {
    if (!token || typeof token !== 'string') {
      return {
        success: false,
        error: 'Token is required and must be a string'
      };
    }

    const postData = JSON.stringify({
      secret: this.secretKey,
      response: token,
      remoteip: remoteIp
    });

    const options = {
      hostname: this.apiEndpoint,
      path: '/verify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (error) {
            resolve({
              success: false,
              error: 'Failed to parse response from verification server'
            });
          }
        });
      });

      req.on('error', (error) => {
        resolve({
          success: false,
          error: `Network error: ${error.message}`
        });
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Verify a CAPTCHA response token (callback style)
   * @param {string} token - The response token from the client
   * @param {string} remoteIp - Optional remote IP address of the user
   * @param {function} callback - Callback function(error, result)
   */
  verifyCallback(token, remoteIp, callback) {
    // Handle optional remoteIp parameter
    if (typeof remoteIp === 'function') {
      callback = remoteIp;
      remoteIp = null;
    }

    this.verify(token, remoteIp)
      .then(result => callback(null, result))
      .catch(error => callback(error, null));
  }
}

/**
 * Create a new Rotaptcha instance
 * @param {string} secretKey - Your Rotaptcha secret key
 * @param {object} options - Optional configuration
 * @returns {Rotaptcha} Rotaptcha instance
 */
function createClient(secretKey, options) {
  return new Rotaptcha(secretKey, options);
}

// Export the main class and factory function
module.exports = Rotaptcha;
module.exports.Rotaptcha = Rotaptcha;
module.exports.createClient = createClient;
