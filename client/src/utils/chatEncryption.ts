/**
 * Client-Side AES-256-GCM Encryption Utility for Chat Messages
 * 
 * This module provides encryption and decryption functions using the Web Crypto API
 * to match the server-side encryption implementation.
 */

const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits (included in ciphertext by Web Crypto API)
const KEY_LENGTH = 32; // 256 bits

/**
 * Derives a 256-bit encryption key from a secret passphrase
 * This must match the server-side key derivation
 */
async function deriveKey(secret: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );

    return window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode('chat-salt'), // Must match server salt
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: ALGORITHM, length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Gets the encryption key from environment or throws error
 */
async function getEncryptionKey(): Promise<CryptoKey> {
    // In a real app, this should come from a secure source
    // For now, using a hardcoded value that matches server
    const secret = import.meta.env.VITE_CHAT_ENCRYPTION_KEY || 'your-secret-encryption-key-min-32-chars';

    if (!secret || secret.length < 32) {
        throw new Error('Encryption key must be at least 32 characters');
    }

    return deriveKey(secret);
}

/**
 * Encrypts a message using AES-256-GCM
 * @param plaintext - The message to encrypt
 * @returns Base64 encoded string containing IV + encrypted data + auth tag
 */
export async function encryptMessage(plaintext: string): Promise<string> {
    if (!plaintext || typeof plaintext !== 'string') {
        throw new Error('Plaintext must be a non-empty string');
    }

    try {
        const key = await getEncryptionKey();
        const encoder = new TextEncoder();

        // Generate a random IV for this message
        const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));

        // Encrypt the message
        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: ALGORITHM,
                iv: iv,
            },
            key,
            encoder.encode(plaintext)
        );

        // Combine IV + encrypted data (which includes auth tag)
        const combined = new Uint8Array(iv.length + encryptedData.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encryptedData), iv.length);

        // Return as base64
        return btoa(String.fromCharCode(...combined));
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt message');
    }
}

/**
 * Decrypts a message encrypted with encryptMessage
 * @param encryptedData - Base64 encoded encrypted message
 * @returns Decrypted plaintext message
 */
export async function decryptMessage(encryptedData: string): Promise<string> {
    if (!encryptedData || typeof encryptedData !== 'string') {
        throw new Error('Encrypted data must be a non-empty string');
    }

    try {
        const key = await getEncryptionKey();

        // Decode from base64
        const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

        // Extract IV (first 16 bytes)
        const iv = combined.slice(0, IV_LENGTH);

        // Extract encrypted data (everything after IV, includes auth tag)
        const encryptedBytes = combined.slice(IV_LENGTH);

        // Decrypt the message
        const decryptedData = await window.crypto.subtle.decrypt(
            {
                name: ALGORITHM,
                iv: iv,
            },
            key,
            encryptedBytes
        );

        const decoder = new TextDecoder();
        return decoder.decode(decryptedData);
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt message - data may be corrupted or key is incorrect');
    }
}

/**
 * Checks if encryption is properly configured
 */
export async function isEncryptionConfigured(): Promise<boolean> {
    try {
        await getEncryptionKey();
        return true;
    } catch (error) {
        return false;
    }
}
