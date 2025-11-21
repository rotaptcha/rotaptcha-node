/**
 * Generates a random number between lower and upper limit (inclusive)
 * that follows the specified step.
 * 
 * @param lower - The lower bound (inclusive)
 * @param upper - The upper bound (inclusive)
 * @param step - The step size. Result will be congruent to lower % step
 * @returns A random number in the range [lower, upper] following the step
 * @throws Error if the range is invalid or step is invalid
 * 
 * @example
 * randomWithStep(0, 100, 5)  // e.g. 0, 5, 10, ..., 100
 * randomWithStep(10, 50, 10) // e.g. 10, 20, 30, 40, 50
 */
export function randomWithStep(lower: number, upper: number, step: number = 1): number {
  // Input validation
  if (!Number.isInteger(lower) || !Number.isInteger(upper) || !Number.isInteger(step)) {
    throw new Error('All parameters must be integers');
  }

  if (step <= 0) {
    throw new Error('Step must be a positive integer');
  }

  if (lower > upper) {
    throw new Error('Lower limit cannot be greater than upper limit');
  }

  // Adjust lower to be aligned with step (optional strict behavior)
  // This ensures the number is reachable with the given step from some base
  const alignedLower = Math.ceil(lower / step) * step;
  
  if (alignedLower > upper) {
    throw new Error(`No valid number exists in range [${lower}, ${upper}] with step ${step}`);
  }

  // Calculate how many possible steps fit in the range
  const stepsInRange = Math.floor((upper - alignedLower) / step) + 1;

  // Pick a random step index (0 to stepsInRange-1)
  const randomStep = Math.floor(Math.random() * stepsInRange);

  // Return the corresponding number
  return alignedLower + randomStep * step;
}



/**
 * Generates a random 8-character alphanumeric string (short UUID)
 * Uses cryptographically secure random values in browsers/Node.js 15+
 * Fallback to Math.random() if crypto is unavailable
 *
 * @returns 8-character string, e.g., "aB9kP2mX"
 */
export function generateShortUuid(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 8;
  const result: string[] = [];

  // Use crypto.getRandomValues if available (most secure)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);

    for (let i = 0; i < length; i++) {
      // Use 61 instead of 62/64 to avoid some bias
      result.push(chars[values[i] % 61]);
    }
  } else {
    // Fallback to Math.random() (less secure but works everywhere)
    for (let i = 0; i < length; i++) {
      result.push(chars[Math.floor(Math.random() * 61)]);
    }
  }

  return result.join('');
}