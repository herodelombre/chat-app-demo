# Chat App Example

A simple demo chat application built with React frontend and Node.js backend, using polling for real-time updates instead of WebSocket connections. All data is stored in memory only (no database required).

## Architecture

- **Frontend**: React application running on port 3000
- **Backend**: Express.js server running on port 3001
- **Communication**: REST API with polling mechanism
- **Storage**: In-memory arrays (maximum 100 messages)

## Project Structure

```
chat_app_example/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── App.js         # Main chat component
│   │   ├── App.css        # Styles
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Base styles
│   └── package.json
├── server/                 # Node.js backend
│   ├── server.js          # Express server
│   └── package.json
├── package.json           # Main project file
└── README.md
```

## Prerequisites

- Node.js (v16 or higher)
- npm

## Quick Start

1. **Clone and navigate to the project directory**

   ```bash
   cd chat_app_example
   ```

2. **Install all dependencies**

   ```bash
   npm run install-all
   ```

3. **Start the application**
   ```bash
   npm start
   ```

This will start both the server (port 3001) and client (port 3000) concurrently.

4. **Open your browser**
   Navigate to `http://localhost:3001` to use the chat application.

## API Endpoints

### GET /api/messages

Retrieves all messages from memory.

**Response:**

```json
{
  "success": true,
  "messages": [
    {
      "id": 1,
      "username": "John",
      "message": "Hello everyone!",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### POST /api/messages

Sends a new message.

**Request Body:**

```json
{
  "username": "John",
  "message": "Hello everyone!"
}
```

**Response:**

```json
{
  "success": true,
  "message": {
    "id": 1,
    "username": "John",
    "message": "Hello everyone!",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### GET /api/health

Health check endpoint.

**Response:**

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "totalMessages": 5
}
```

## How Polling Works

The React frontend uses `setInterval` to fetch messages every 2 seconds:

1. Component mounts and immediately fetches messages
2. Sets up polling interval (2000ms)
3. Continuously fetches messages in background
4. Updates UI when new messages are detected
5. Cleans up interval on component unmount

## License

MIT License - Feel free to use this code for learning and development purposes.
