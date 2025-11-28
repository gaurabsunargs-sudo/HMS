# Quick Fix Instructions

## Issue 1: Decryption Errors
The errors you're seeing are because old messages in the database are **not encrypted**, but the code is trying to decrypt them.

## Issue 2: Encryption Key
The `CHAT_ENCRYPTION_KEY` needs to be added to your `.env` file.

---

## Steps to Fix:

### 1. Add Encryption Key to `.env`

Open `server/.env` and add this line at the end:

```env
CHAT_ENCRYPTION_KEY=cb0e63a10b56a8d4b85da38a1f298cdac39ec1ab6f707fb2b3fc1b3b
```

### 2. Delete Old Unencrypted Messages

Run this command to delete all old chat messages:

```bash
cd server
node scripts/delete-old-chats.js
```

This will remove all existing messages from the database.

### 3. Restart the Server

After adding the key and deleting old messages, restart your server:
- Stop the current server (Ctrl+C)
- Run `npm run dev` again

---

## Alternative: Manual Database Cleanup

If you prefer to use a database client:

```sql
DELETE FROM chat_messages;
```

---

## After Fix:

✅ All new messages will be encrypted automatically
✅ No more decryption errors
✅ Messages stored securely in database
