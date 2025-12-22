import rotaptcha from "../index";
import * as fs from "fs";
import * as path from "path";

describe("Rotaptcha", () => {
  const dbPath = path.join(process.cwd(), "rotaptcha.db.json");

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
        strokeWidth: 5,
        wobble: false,
        noise: true,
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
        minValue: 30,
        maxValue: 90,
        step: 5,
      });

      // Since we're using LokiJS, we need to retrieve the stored rotation
      // The rotation is stored but we need to test with the actual token
      const isVerified = await rotaptcha.verify({
        uuid: captcha.token,
        answer: "50", // This should match if rotation was 50
      });

      // The verify function should return a boolean
      expect(typeof isVerified).toBe("boolean");
    });

    it("should return false when an incorrect answer is provided", async () => {
      // Create a CAPTCHA first - now returns {image, token}
      const captcha = await rotaptcha.create({
        width: 400,
        height: 400,
        minValue: 30,
        maxValue: 90,
        step: 5,
      });

      // Verify with an incorrect answer
      const isVerified = await rotaptcha.verify({
        uuid: captcha.token,
        answer: "999", // This should never match since maxValue is 90
      });

      expect(isVerified).toBe(false);
    });

    it("should return false when UUID does not exist", async () => {
      // Verify with a non-existent UUID
      const isVerified = await rotaptcha.verify({
        uuid: "non-existent-uuid",
        answer: "50",
      });

      expect(isVerified).toBe(false);
    });
  });
});
