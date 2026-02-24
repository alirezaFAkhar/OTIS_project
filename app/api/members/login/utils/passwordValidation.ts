import { comparePassword } from '@/lib/auth';

/**
 * Validate member password
 * Supports both bcrypt-hashed passwords and legacy plain-text passwords
 */
export async function isMemberPasswordValid(
  rawPassword: string,
  storedPassword: string
): Promise<boolean> {
  // Try bcrypt comparison first
  try {
    const isHashedValid = await comparePassword(rawPassword, storedPassword);
    if (isHashedValid) return true;
  } catch {
    // Ignore bcrypt parsing errors and try plain text comparison
  }

  // Fallback to plain text comparison for legacy passwords
  return rawPassword === storedPassword;
}

