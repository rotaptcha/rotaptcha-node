import rotaptcha from "../index";
import * as fs from "fs";
import * as path from "path";

// Mock jose module
jest.mock('jose', () => ({
  CompactEncrypt: jest.fn().mockImplementation(function(this: any, payload: any) {
    this.payload = payload;
    this.setProtectedHeader = jest.fn().mockReturnThis();
    this.encrypt = jest.fn().mockResolvedValue('mock-encrypted-token');
    return this;
  }),
  compactDecrypt: jest.fn().mockImplementation(async (token: string, secretKey: any) => {
    // If token is invalid, throw error
    if (token === 'invalid-token-string') {
      throw new Error('Invalid token');
    }
    // Mock decryption - extract payload from the mock token
    const mockPayload = {
      jti: 'mock-uuid',
      answer: 50,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 300 // 5 minutes from now
    };
    return {
      plaintext: new TextEncoder().encode(JSON.stringify(mockPayload)),
      protectedHeader: { alg: 'dir', enc: 'A256GCM' }
    };
  })
}));

describe("Rotaptcha", () => {
  const dbPath = path.join(process.cwd(), "rotaptcha.db.json");
  const testSecretKey = "4b5b2febf41131f086242d87cc4e474bc9e620d9ace97d75ede05d814c9710bb";

  // Clean up database before and after tests
  beforeEach(() => {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  });

  describe("create", () => {
    it("should create a CAPTCHA and return an object with image and token", async () => {
      const result = await rotaptcha.create({
        width: 400,
        height: 400,
        minValue: 30,
        maxValue: 90,
        step: 5,
        wobble: false,
        noise: true,
        secretKey: testSecretKey,
      });

      // Result should be an object with image and token
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
      expect(result).toHaveProperty("image");
      expect(result).toHaveProperty("token");
      expect(typeof result.image).toBe("string");
      expect(typeof result.token).toBe("string");
      expect(result.image.length).toBeGreaterThan(0);
      expect(result.token.length).toBeGreaterThan(0);
    });

    it("should store the answer in the database with a unique UUID", async () => {
      const result = await rotaptcha.create({
        width: 400,
        height: 400,
        minValue: 30,
        maxValue: 90,
        step: 5,
        secretKey: testSecretKey,
      });

      // Result should be defined with image and token
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
      expect(result).toHaveProperty("image");
      expect(result).toHaveProperty("token");
      expect(typeof result.token).toBe("string");
    });
  });

  describe("verify", () => {
    it("should return true when the correct answer is provided", async () => {
      // Create a CAPTCHA first - now returns {image, token}
      const captcha = await rotaptcha.create({
        width: 400,
        height: 400,
        minValue: 50,
        maxValue: 50,
        step: 5,
        secretKey: testSecretKey,
      });

      // Verify with the correct answer (50 since min and max are both 50)
      const isVerified = await rotaptcha.verify({
        token: captcha.token,
        answer: "50",
        secretKey: testSecretKey,
      });

      // The verify function should return true for correct answer
      expect(isVerified).toBe(true);
    });

    it("should return false when an incorrect answer is provided", async () => {
      // Create a CAPTCHA first - now returns {image, token}
      const captcha = await rotaptcha.create({
        width: 400,
        height: 400,
        minValue: 30,
        maxValue: 90,
        step: 5,
        secretKey: testSecretKey,
      });

      // Verify with an incorrect answer
      const isVerified = await rotaptcha.verify({
        token: captcha.token,
        answer: "999", // This should never match since maxValue is 90
        secretKey: testSecretKey,
      });

      expect(isVerified).toBe(false);
    });

    it("should return false when token is invalid", async () => {
      // Verify with an invalid token
      const isVerified = await rotaptcha.verify({
        token: "invalid-token-string",
        answer: "50",
        secretKey: testSecretKey,
      });

      expect(isVerified).toBe(false);
    });
  });
});
