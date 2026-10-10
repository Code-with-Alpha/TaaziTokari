// ==============================================================================
// ANTIGRAVITY: AES-256-GCM DATA ENCRYPTION AT REST
// Used for PII fields: Resident phone numbers, flat numbers, and delivery notes.
// ==============================================================================

import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for AES GCM
const AUTH_TAG_LENGTH = 16;

/**
 * Returns the 32-byte binary key from hex string or defaults for local dev.
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY_AES256;
  if (envKey && envKey.length === 64) {
    return Buffer.from(envKey, 'hex');
  }
  // Safe fallback 32-byte key for local development
  return crypto.scryptSync('lucknow_antigravity_salt_2026', 'antigravity_pepper', 32);
}

/**
 * Encrypts a UTF-8 plaintext string using AES-256-GCM with a randomized IV.
 * Format: "iv:ciphertext:authTag" in hex
 */
export function encryptData(plainText: string): string {
  if (!plainText) return plainText;
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${encrypted}:${authTag}`;
}

/**
 * Decrypts an "iv:ciphertext:authTag" string back to original plaintext.
 */
export function decryptData(cipherPackage: string): string {
  if (!cipherPackage || !cipherPackage.includes(':')) return cipherPackage;
  try {
    const parts = cipherPackage.split(':');
    if (parts.length !== 3) return cipherPackage;

    const [ivHex, encryptedHex, authTagHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    // If decryption fails (e.g. key mismatch or tampering), throw security error
    throw new Error('Cryptographic integrity failure: Unable to decrypt sensitive field');
  }
}
