/**
 * Tests for Rotaptcha Node.js SDK
 */

const Rotaptcha = require('../index');
const assert = require('assert');

// Track test results
let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`✓ ${description}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(`  ${error.message}`);
    failed++;
  }
}

async function asyncTest(description, fn) {
  try {
    await fn();
    console.log(`✓ ${description}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(`  ${error.message}`);
    failed++;
  }
}

console.log('Running Rotaptcha tests...\n');

// Test 1: Constructor validation
test('should throw error when secret key is missing', () => {
  assert.throws(() => {
    new Rotaptcha();
  }, /Secret key is required/);
});

test('should throw error when secret key is not a string', () => {
  assert.throws(() => {
    new Rotaptcha(123);
  }, /Secret key is required and must be a string/);
});

test('should create instance with valid secret key', () => {
  const client = new Rotaptcha('test-secret-key');
  assert.strictEqual(client.secretKey, 'test-secret-key');
  assert.strictEqual(client.apiEndpoint, 'api.rotaptcha.com');
});

test('should accept custom API endpoint', () => {
  const client = new Rotaptcha('test-secret-key', { apiEndpoint: 'custom.api.com' });
  assert.strictEqual(client.apiEndpoint, 'custom.api.com');
});

// Test 2: Factory function
test('createClient should return Rotaptcha instance', () => {
  const client = Rotaptcha.createClient('test-secret-key');
  assert(client instanceof Rotaptcha);
});

// Test 3: Verify method validation
(async () => {
  await asyncTest('verify should return error for missing token', async () => {
    const client = new Rotaptcha('test-secret-key');
    const result = await client.verify();
    assert.strictEqual(result.success, false);
    assert(result.error.includes('Token is required'));
  });

  await asyncTest('verify should return error for non-string token', async () => {
    const client = new Rotaptcha('test-secret-key');
    const result = await client.verify(123);
    assert.strictEqual(result.success, false);
    assert(result.error.includes('Token is required'));
  });

  await asyncTest('verify should accept valid token format', async () => {
    const client = new Rotaptcha('test-secret-key');
    // This will fail to connect to the actual API, but we're testing the input validation
    const result = await client.verify('test-token-12345');
    // Should return an error object (network or API error), but not an input validation error
    assert(result.error !== 'Token is required and must be a string');
  });

  // Test 4: Callback interface
  await asyncTest('verifyCallback should work with callback', (done) => {
    const client = new Rotaptcha('test-secret-key');
    return new Promise((resolve) => {
      client.verifyCallback('test-token', (error, result) => {
        assert(!error || result);
        resolve();
      });
    });
  });

  await asyncTest('verifyCallback should handle optional remoteIp', (done) => {
    const client = new Rotaptcha('test-secret-key');
    return new Promise((resolve) => {
      client.verifyCallback('test-token', '127.0.0.1', (error, result) => {
        assert(!error || result);
        resolve();
      });
    });
  });

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(50));

  if (failed > 0) {
    process.exit(1);
  }
})();
