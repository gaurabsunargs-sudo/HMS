const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const socketIo = require("socket.io");
const { PrismaClient } = require("@prisma/client");
const { encryptMessage, decryptMessage } = require("./utils/encryption");
require("dotenv").config();

// Initialize core services
const prisma = new PrismaClient({ log: [] });
const app = express();
const server = http.createServer(app);

// Minimal CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000"
  ],
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"]
};

// Socket.IO with minimal config
const io = socketIo(server, {
  cors: corsOptions,
  transports: ["websocket"]
});

const onlineUsers = new Map();

// Core middleware only
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Static files with minimal headers
app.use("/uploads", express.static("uploads"));
app.use("/storage", express.static("storage"));

// Route imports (consolidate if possible)
const routes = [
  { path: "/api/auth", route: require("./routes/auth") },
  { path: "/api/users", route: require("./routes/users") },
  { path: "/api/doctors", route: require("./routes/doctors") },
  { path: "/api/patients", route: require("./routes/patients") },
  { path: "/api/appointments", route: require("./routes/appointments") },
  { path: "/api/admissions", route: require("./routes/admissions") },
  { path: "/api/beds", route: require("./routes/beds") },
  { path: "/api/medical-records", route: require("./routes/medicalRecords") },
  { path: "/api/prescriptions", route: require("./routes/prescriptions") },
  { path: "/api/bills", route: require("./routes/bills") },
  { path: "/api/payments", route: require("./routes/payments") },
  { path: "/api/chat", route: require("./routes/chat") },
  { path: "/api/dashboard", route: require("./routes/dashboard") },
  { path: "/api/ai", route: require("./routes/predictions") }
];

// Register all routes
routes.forEach(({ path, route }) => app.use(path, route));

// Socket.IO event handlers
const socketEvents = {
  connection: (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-user", async (userId) => {
      socket.userId = userId;
      socket.join(`user_${userId}`);
      onlineUsers.set(userId, { socketId: socket.id, lastSeen: new Date() });

      await updateUserStatus(userId, true);
      io.emit("user-online", { userId });
    });

    socket.on("send-message", async (data) => {
      try {
        const { senderId, receiverId, content } = data;
        const encryptedContent = encryptMessage(String(content));

        const message = await prisma.chatMessage.create({
          data: { senderId, receiverId, content: encryptedContent },
          include: { sender: true, receiver: true }
        });

        const decryptedMessage = {
          ...message,
          content: decryptMessage(message.content)
        };

        socket.emit("message-sent", decryptedMessage);
        io.to(`user_${receiverId}`).emit("new-message", decryptedMessage);
      } catch (error) {
        console.error("Send message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("typing-start", (data) => {
      socket.to(`user_${data.receiverId}`).emit("user-typing", {
        userId: data.senderId,
        typing: true
      });
    });

    socket.on("typing-stop", (data) => {
      socket.to(`user_${data.receiverId}`).emit("user-typing", {
        userId: data.senderId,
        typing: false
      });
    });

    socket.on("mark-messages-read", async (data) => {
      try {
        const { senderId, receiverId } = data;
        await prisma.chatMessage.updateMany({
          where: { senderId, receiverId, isRead: false },
          data: { isRead: true }
        });
        socket.to(`user_${senderId}`).emit("messages-read", { readerId: receiverId });
      } catch (error) {
        console.error("Mark messages read error:", error);
      }
    });

    socket.on("disconnect", async () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        await updateUserStatus(socket.userId, false);
        io.emit("user-offline", { userId: socket.userId });
      }
    });
  }
};

// Register socket events
Object.entries(socketEvents).forEach(([event, handler]) => {
  io.on(event, handler);
});

// Helper function
async function updateUserStatus(userId, isOnline) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isCurrentlyOnline: isOnline,
        lastSeen: isOnline ? null : new Date()
      }
    });
  } catch (error) {
    console.error("Update user status error:", error);
  }
}

// Error handling
app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error"
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});