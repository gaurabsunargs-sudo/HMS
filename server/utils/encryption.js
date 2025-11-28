const crypto = require("crypto");

// Algorithm configuration
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

function getEncryptionKey() {
    const secret = process.env.CHAT_ENCRYPTION_KEY;

    if (!secret) {
        throw new Error("CHAT_ENCRYPTION_KEY environment variable is not set");
    }

    return crypto.pbkdf2Sync(secret, "chat-salt", 100000, KEY_LENGTH, "sha256");
}


function encryptMessage(plaintext) {
    if (!plaintext || typeof plaintext !== "string") {
        throw new Error("Plaintext must be a non-empty string");
    }
    try {
        const key = getEncryptionKey();
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(plaintext, "utf8", "hex");
        encrypted += cipher.final("hex");
        const authTag = cipher.getAuthTag();
        const combined = Buffer.concat([
            iv,
            Buffer.from(encrypted, "hex"),
            authTag,
        ]);

        return combined.toString("base64");
    } catch (error) {
        console.error("Encryption error:", error);
        throw new Error("Failed to encrypt message");
    }
}

function decryptMessage(encryptedData) {
    if (!encryptedData || typeof encryptedData !== "string") {
        throw new Error("Encrypted data must be a non-empty string");
    }

    try {
        const key = getEncryptionKey();
        const combined = Buffer.from(encryptedData, "base64");
        const iv = combined.slice(0, IV_LENGTH);
        const authTag = combined.slice(-AUTH_TAG_LENGTH);
        const encrypted = combined.slice(IV_LENGTH, -AUTH_TAG_LENGTH);
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encrypted, undefined, "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch (error) {
        console.error("Decryption error:", error);
        throw new Error("Failed to decrypt message - data may be corrupted or key is incorrect");
    }
}

function isEncryptionConfigured() {
    try {
        getEncryptionKey();
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = {
    encryptMessage,
    decryptMessage,
    isEncryptionConfigured,
};
