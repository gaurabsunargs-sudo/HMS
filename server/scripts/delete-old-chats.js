const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function deleteAllChatMessages() {
    try {
        console.log("🗑️  Deleting all chat messages...");

        const result = await prisma.chatMessage.deleteMany({});

        console.log(`✅ Successfully deleted ${result.count} chat messages`);
        console.log("💡 All old unencrypted messages have been removed");
        console.log("📝 New messages will be encrypted with AES-256");

        await prisma.$disconnect();
        process.exit(0);
    } catch (error) {
        console.error("❌ Error deleting chat messages:", error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

deleteAllChatMessages();
