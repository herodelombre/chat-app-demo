const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";

// Middleware
app.use(cors());
app.use(express.json());

// Build verification for production
const buildPath = path.join(__dirname, "../client/build");
const indexPath = path.join(buildPath, "index.html");

if (NODE_ENV === "production") {
  console.log("🔍 Verifying frontend build...");

  if (!fs.existsSync(buildPath)) {
    console.error("❌ Frontend build directory not found at:", buildPath);
    console.error('   Run "npm run build" in the client directory first');
    process.exit(1);
  }

  if (!fs.existsSync(indexPath)) {
    console.error("❌ Frontend index.html not found");
    console.error("   Frontend build appears to be incomplete");
    process.exit(1);
  }

  console.log("✅ Frontend build verified");
}

// Serve static files from React build
app.use(express.static(buildPath));

// In-memory storage for messages
let messages = [];
let messageIdCounter = 1;

// GET /api/messages - Fetch all messages
app.get("/api/messages", (req, res) => {
  res.json({
    success: true,
    messages: messages,
  });
});

// POST /api/messages - Send a new message
app.post("/api/messages", (req, res) => {
  const { username, message } = req.body;

  // Basic validation
  if (!username || !message) {
    return res.status(400).json({
      success: false,
      error: "Username and message are required",
    });
  }

  if (message.trim() === "") {
    return res.status(400).json({
      success: false,
      error: "Message cannot be empty",
    });
  }

  // Create new message object
  const newMessage = {
    id: messageIdCounter++,
    username: username.trim(),
    message: message.trim(),
    timestamp: new Date().toISOString(),
  };

  // Add to messages array
  messages.push(newMessage);

  // Keep only last 100 messages to prevent memory issues
  if (messages.length > 100) {
    messages = messages.slice(-100);
  }

  res.status(201).json({
    success: true,
    message: newMessage,
  });
});

// GET /api/health - Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    totalMessages: messages.length,
  });
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// Start server
app.listen(PORT, "192.168.56.1", () => {
  console.log(`🚀 Chat server is running on http://0.0.0.0:${PORT}`);
  console.log(`📦 Environment: ${NODE_ENV}`);
  console.log(`🌐 Frontend: http://0.0.0.0:${PORT}/`);
  console.log(`🔗 Health check: http://0.0.0.0:${PORT}/api/health`);
  console.log(`💬 Messages endpoint: http://0.0.0.0:${PORT}/api/messages`);

  if (NODE_ENV === "production") {
    console.log("✅ Production mode: Frontend bundled and served from backend");
  } else {
    console.log(
      "🔧 Development mode: Make sure frontend is built or run separately",
    );
  }
});
