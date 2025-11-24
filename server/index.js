const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const socketIo = require("socket.io");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://127.0.0.1:3000",
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  },
  allowEIO3: true,
  transports: ["websocket", "polling"],
});

const onlineUsers = new Map();

const updateUserOnlineStatus = async (userId, isOnline) => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isCurrentlyOnline: isOnline,
        lastSeen: isOnline ? null : new Date(),
      },
    });
  } catch (error) {
    console.error("Error updating user online status:", error);
  }
};

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/uploads", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use("/storage", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use("/uploads", express.static("uploads"));
app.use("/storage", express.static("storage"));

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const doctorRoutes = require("./routes/doctors");
const patientRoutes = require("./routes/patients");
const appointmentRoutes = require("./routes/appointments");
const admissionRoutes = require("./routes/admissions");
const bedRoutes = require("./routes/beds");
const medicalRecordRoutes = require("./routes/medicalRecords");
const prescriptionRoutes = require("./routes/prescriptions");
const billRoutes = require("./routes/bills");
const paymentRoutes = require("./routes/payments");
const chatRoutes = require("./routes/chat");
const dashboardRoutes = require("./routes/dashboard");
const predictionRoutes = require("./routes/predictions");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admissions", admissionRoutes);
app.use("/api/beds", bedRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", predictionRoutes);

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("connect_error", (error) => {
    console.error("❌ Socket connection error:", error);
  });

  socket.on("error", (error) => {
    console.error("❌ Socket error:", error);
  });

  socket.on("join-user", async (userId) => {
    socket.userId = userId;
    socket.join(`user_${userId}`);

    onlineUsers.set(userId, {
      socketId: socket.id,
      lastSeen: new Date(),
    });

    await updateUserOnlineStatus(userId, true);

    io.emit("user-online", { userId, lastSeen: new Date() });

    console.log(`User ${userId} joined their room`);
  });

  socket.on("send-message", async (data) => {
    try {
      const { senderId, receiverId, content } = data;

      const message = await prisma.chatMessage.create({
        data: {
          senderId: String(senderId),
          receiverId: String(receiverId),
          content: String(content),
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
      });

      socket.emit("message-sent", message);

      io.to(`user_${receiverId}`).emit("new-message", message);

      io.emit("message-update", {
        type: "new_message",
        message,
        senderId,
        receiverId,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("typing-start", (data) => {
    const { receiverId, senderId } = data;
    socket.to(`user_${receiverId}`).emit("user-typing", {
      userId: senderId,
      typing: true,
    });
  });

  socket.on("typing-stop", (data) => {
    const { receiverId, senderId } = data;
    socket.to(`user_${receiverId}`).emit("user-typing", {
      userId: senderId,
      typing: false,
    });
  });

  socket.on("mark-messages-read", async (data) => {
    try {
      const { senderId, receiverId } = data;

      await prisma.chatMessage.updateMany({
        where: {
          senderId: String(senderId),
          receiverId: String(receiverId),
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      socket.to(`user_${senderId}`).emit("messages-read", {
        readerId: receiverId,
      });

      io.emit("message-update", {
        type: "messages_read",
        senderId,
        readerId: receiverId,
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });

  socket.on("user-activity", (userId) => {
    if (onlineUsers.has(userId)) {
      onlineUsers.get(userId).lastSeen = new Date();
    }
  });

  socket.on("get-online-users", () => {
    const onlineUsersList = Array.from(onlineUsers.keys());
    socket.emit("online-users-list", onlineUsersList);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    if (socket.userId) {
      onlineUsers.delete(socket.userId);

      updateUserOnlineStatus(socket.userId, false);

      io.emit("user-offline", {
        userId: socket.userId,
        lastSeen: new Date(),
      });
    }
  });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.IO server ready for connections`);
});
