// captchaUtils.ts

import {
  CompactEncrypt,
  compactDecrypt
} from 'jose';

/**
 * Payload type for your CAPTCHA token
 */
interface CaptchaPayload {
  answer: number;
  iat: number;          // issued at
  exp: number;          // expiration timestamp
  jti: string;          // unique ID (for future replay protection)
}

/**
 * Encrypts the CAPTCHA payload into a secure JWE token
 * @param payload The data to encrypt (including answer)
 * @param secretKey String secret key (will be converted to Uint8Array)
 * @returns Promise<string> - compact JWE token
 */
export async function encryptCaptchaToken(
  payload: CaptchaPayload,
  secretKey: string
): Promise<string> {
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(secretKey);
  
  const jwe = await new CompactEncrypt(new TextEncoder().encode(JSON.stringify(payload)))
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .encrypt(uint8Array);

  return jwe;
}

/**
 * Decrypts and verifies a JWE token, returning the payload
 * @param token The JWE string from the client
 * @param secretKey String secret key (will be converted to Uint8Array)
 * @returns Promise<CaptchaPayload | null> - payload if valid, null if invalid/expired/tampered
 */
export async function decryptCaptchaToken(
  token: string,
  secretKey: string
): Promise<CaptchaPayload | null> {
  try {
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(secretKey);
    
    const { plaintext, protectedHeader } = await compactDecrypt(token, uint8Array);

    // Verify algorithm
    if (protectedHeader.alg !== 'dir' || protectedHeader.enc !== 'A256GCM') {
      return null;
    }

    const payloadStr = new TextDecoder().decode(plaintext);
    const payload: CaptchaPayload = JSON.parse(payloadStr);

    // Basic expiration check
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null; // expired
    }

    return payload;
  } catch (error) {
    // Any decryption or parsing error = invalid token
    return null;
  }
}


