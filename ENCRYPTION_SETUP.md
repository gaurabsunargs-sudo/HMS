# AES-256 Chat Encryption Setup Instructions

## Quick Setup

1. **Add Encryption Key to `.env`**
   
   Add this line to your `server/.env` file:
   ```
   CHAT_ENCRYPTION_KEY=your-super-secret-encryption-key-must-be-at-least-32-characters-long
   ```

2. **Generate a Secure Key (Recommended for Production)**
   
   Run this command to generate a secure random key:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   
   Copy the output and use it as your `CHAT_ENCRYPTION_KEY` value.

3. **Restart Your Server**
   
   After adding the encryption key, restart your Node.js server for the changes to take effect.

## How It Works

- **Encryption**: All chat messages are encrypted using AES-256-GCM before being stored in the database
- **Decryption**: Messages are automatically decrypted when retrieved by authorized users (sender or receiver)
- **Security**: Only users with the correct encryption key can decrypt messages
- **Database**: Messages in the database are stored in encrypted format and are not human-readable

## Testing

1. Send a chat message through the application
2. Check the database `chat_messages` table - the `content` field should contain encrypted data (base64 string)
3. View the message in the chat interface - it should display the original text (decrypted automatically)

## Important Notes

- **Existing Messages**: Messages sent before implementing encryption will remain unencrypted in the database
- **Key Security**: Keep your `CHAT_ENCRYPTION_KEY` secret and never commit it to version control
- **Key Changes**: Changing the encryption key will make old messages unreadable
