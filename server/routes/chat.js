const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { auth: authenticateToken } = require("../middleware/auth");
const { encryptMessage, decryptMessage } = require("../utils/encryption");
// Emoji suggestion is now handled by Python service (serverpy)
// See endpoints: POST /emoji-suggest/random-forest and POST /emoji-suggest/naive-bayes

const prisma = new PrismaClient();
const router = express.Router();

// Get recent chats for current user
router.get("/recent", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get recent conversations with last message
    const recentChats = await prisma.$queryRaw`
      SELECT DISTINCT ON (other_user_id) 
        other_user_id,
        other_user_name,
        other_user_profile,
        last_message_content,
        last_message_time,
        unread_count
      FROM (
        SELECT 
          CASE 
            WHEN cm."senderId" = ${currentUserId} THEN cm."receiverId"
            ELSE cm."senderId"
          END as other_user_id,
          CASE 
            WHEN cm."senderId" = ${currentUserId} THEN 
              CONCAT(u2."firstName", ' ', u2."lastName")
            ELSE 
              CONCAT(u1."firstName", ' ', u1."lastName")
          END as other_user_name,
          CASE 
            WHEN cm."senderId" = ${currentUserId} THEN u2.profile
            ELSE u1.profile
          END as other_user_profile,
          cm.content as last_message_content,
          cm."createdAt" as last_message_time,
          CASE 
            WHEN cm."senderId" != ${currentUserId} AND cm."isRead" = false THEN 1
            ELSE 0
          END as unread_count
        FROM "chat_messages" cm
        JOIN "users" u1 ON cm."senderId" = u1.id
        JOIN "users" u2 ON cm."receiverId" = u2.id
        WHERE cm."senderId" = ${currentUserId} OR cm."receiverId" = ${currentUserId}
      ) sub
      ORDER BY other_user_id, last_message_time DESC
    `;

    // Decrypt last message content for each chat
    const decryptedChats = recentChats.map((chat) => {
      try {
        return {
          ...chat,
          last_message_content: chat.last_message_content
            ? decryptMessage(chat.last_message_content)
            : null,
        };
      } catch (error) {
        console.error("Failed to decrypt last message:", error);
        return {
          ...chat,
          last_message_content: "[Encrypted]",
        };
      }
    });

    res.json({
      success: true,
      data: decryptedChats,
    });
  } catch (error) {
    console.error("Error fetching recent chats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent chats",
    });
  }
});

// Get unread message count
router.get("/unread/count", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const unreadCount = await prisma.chatMessage.count({
      where: {
        receiverId: currentUserId,
        isRead: false,
      },
    });

    res.json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread count",
    });
  }
});

// Get online users (this will be handled by Socket.IO in real-time)
router.get("/online/users", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get all users except current user
    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        isActive: true,
        // If a patient is looking for online users, only show doctors
        ...(req.user.role === "PATIENT" && { role: "DOCTOR" }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profile: true,
        role: true,
      },
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
});

// Get all users for chat purposes (without admin restriction)
router.get("/chat/users", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { page = 1, limit = 50, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      id: { not: currentUserId },
      isActive: true,
      // If a patient is searching, only show doctors
      ...(req.user.role === "PATIENT" && { role: "DOCTOR" }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profile: true,
          role: true,
          isActive: true,
          isCurrentlyOnline: true,
          lastSeen: true,
          patient: {
            select: {
              contactNumber: true,
              dateOfBirth: true,
            },
          },
          doctor: {
            select: {
              specialization: true,
              experience: true,
            },
          },
        },
        orderBy: { firstName: "asc" },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        users,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching chat users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
});

// Get a specific user for chat purposes (without admin restriction)
router.get("/user/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Don't allow users to get their own data through this route
    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "Cannot get your own user data through this route",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profile: true,
        role: true,
        isActive: true,
        isCurrentlyOnline: true,
        lastSeen: true,
        patient: {
          select: {
            contactNumber: true,
            dateOfBirth: true,
          },
        },
        doctor: {
          select: {
            specialization: true,
            experience: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user for chat:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user data",
    });
  }
});

// Get chat history between two users
router.get("/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          {
            senderId: currentUserId,
            receiverId: userId,
          },
          {
            senderId: userId,
            receiverId: currentUserId,
          },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profile: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 100, // Limit to last 100 messages
    });

    // Decrypt messages for the authorized user
    const decryptedMessages = messages.map((msg) => {
      try {
        return {
          ...msg,
          content: decryptMessage(msg.content),
        };
      } catch (error) {
        console.error("Failed to decrypt message:", error);
        return {
          ...msg,
          content: "[Encrypted message - decryption failed]",
        };
      }
    });

    res.json({
      success: true,
      data: decryptedMessages,
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chat messages",
    });
  }
});

// Mark messages as read
router.put("/:userId/read", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    await prisma.chatMessage.updateMany({
      where: {
        senderId: userId,
        receiverId: currentUserId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    res.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
    });
  }
});

// Send a chat message via REST (fallback to socket)
router.post("/send", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { receiverId, content } = req.body;

    if (!receiverId || !content || !String(content).trim()) {
      return res.status(400).json({
        success: false,
        message: "receiverId and content are required",
      });
    }

    // Encrypt the message content before storing
    const encryptedContent = encryptMessage(String(content).trim());

    const message = await prisma.chatMessage.create({
      data: {
        senderId: String(currentUserId),
        receiverId: String(receiverId),
        content: encryptedContent,
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, profile: true },
        },
        receiver: {
          select: { id: true, firstName: true, lastName: true, profile: true },
        },
      },
    });

    // Decrypt for response
    const decryptedMessage = {
      ...message,
      content: decryptMessage(message.content),
    };

    return res.json({ success: true, data: decryptedMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
});

// Emoji suggestion endpoint (proxies to Python)
router.post("/emoji-suggestions", authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        message: "Text is required and must be a string",
      });
    }

    // Forward request to Python service (Python handles all emoji logic now)
    const fetch = (await import("node-fetch")).default;
    const pythonResponse = await fetch("http://localhost:8000/emoji-suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, top_n: 5 }),
    });

    if (!pythonResponse.ok) {
      throw new Error(`Python service error: ${pythonResponse.statusText}`);
    }

    const data = await pythonResponse.json();

    // Python now returns the complete response with emotion groups and names
    res.json({
      success: data.success,
      needsEmoji: data.confidence > 0.15,
      confidence: data.confidence,
      classification: data.confidence > 0.15 ? "emotional" : "neutral",
      originalText: text,
      processedText: text,
      suggestions: data.suggestions,
      emotion: data.emotion,
      algorithm: data.algorithm,
    });
  } catch (error) {
    console.error("Error getting emoji suggestions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get emoji suggestions",
      error: error.message,
    });
  }
});

module.exports = router;
