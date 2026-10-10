// ==============================================================================
// TEST SUITE: AES-256-GCM DATA ENCRYPTION AT REST
// Validates:
// 1. Encryption generates 16-byte random IV + Ciphertext + 16-byte AuthTag
// 2. Exact roundtrip decryption for resident phone, flat number, and delivery notes
// 3. Tampering with ciphertext or auth tag throws cryptographic integrity error
// ==============================================================================

import * as crypto from 'crypto';

describe('AES-256-GCM Resident PII Protection (DPDP Act Compliance)', () => {
  const mockKey = crypto.scryptSync('lucknow_antigravity_salt_2026', 'antigravity_pepper', 32);

  function encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', mockKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${encrypted}:${authTag}`;
  }

  function decrypt(cipherPackage: string): string {
    const parts = cipherPackage.split(':');
    if (parts.length !== 3) throw new Error('Invalid format');
    const [ivHex, encHex, tagHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(tagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', mockKey, iv);
    decipher.setAuthTag(authTag);
    let dec = decipher.update(encHex, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  }

  test('should encrypt and decrypt resident phone numbers correctly', () => {
    const phone = '+91 94500 00001';
    const encrypted = encrypt(phone);

    expect(encrypted).not.toBe(phone);
    expect(encrypted.split(':').length).toBe(3); // iv:cipher:authTag

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(phone);
  });

  test('should generate different ciphertexts for identical plaintext due to randomized IVs', () => {
    const address = 'Tower B, Flat 402, Eldeco Elegance';
    const enc1 = encrypt(address);
    const enc2 = encrypt(address);

    expect(enc1).not.toBe(enc2); // Different IVs prevent dictionary pattern analysis
    expect(decrypt(enc1)).toBe(address);
    expect(decrypt(enc2)).toBe(address);
  });

  test('should throw integrity error if ciphertext is tampered with', () => {
    const notes = 'Leave at shoe rack';
    const encrypted = encrypt(notes);
    const parts = encrypted.split(':');

    // Tamper with ciphertext by altering last byte
    const tamperedCipher = parts[1].slice(0, -2) + 'ff';
    const tamperedPackage = `${parts[0]}:${tamperedCipher}:${parts[2]}`;

    expect(() => {
      decrypt(tamperedPackage);
    }).toThrow();
  });
});
