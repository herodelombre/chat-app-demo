# Chat App Example

A simple demo chat application built with React frontend and Node.js backend, using polling for real-time updates instead of WebSocket connections. All data is stored in memory only (no database required).

## Features

- 📱 Minimal, responsive chat interface
- 🔄 Real-time updates via HTTP polling (every 2 seconds)
- 👤 Username-based messaging
- 💾 In-memory storage (resets on server restart)
- 🚀 Simple setup with no database dependencies
- ⚡ Fast and lightweight

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
   Navigate to `http://localhost:3000` to use the chat application.

## Manual Setup

If you prefer to run the server and client separately:

### Server Setup
```bash
cd server
npm install
npm start
```
Server will run on `http://localhost:3001`

### Client Setup
```bash
cd client
npm install
npm start
```
Client will run on `http://localhost:3000`

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

## Usage

1. **Enter your username** in the top input field
2. **Type your message** in the bottom input field
3. **Click "Send"** or press Enter to send the message
4. **Watch messages appear** in real-time as others chat
5. **Messages auto-scroll** to show the latest content

## Limitations

- **Memory only**: All messages are lost when server restarts
- **No persistence**: No database or file storage
- **Message limit**: Only keeps last 100 messages
- **No authentication**: Anyone can use any username
- **Polling delay**: 2-second delay for new messages
- **Single room**: All users share the same chat room

## Development

### Available Scripts

- `npm start` - Run both server and client
- `npm run server` - Run server only
- `npm run client` - Run client only
- `npm run dev` - Run server with nodemon and client
- `npm run install-all` - Install all dependencies
- `npm run build` - Build client for production

### Development Mode

For development with auto-reload:
```bash
npm run dev
```

This runs the server with nodemon (auto-restarts on changes) and the React development server.

## Customization

### Polling Interval
To change the polling frequency, modify the interval in `client/src/App.js`:
```javascript
// Current: polls every 2 seconds
const interval = setInterval(fetchMessages, 2000);

// Example: poll every 5 seconds
const interval = setInterval(fetchMessages, 5000);
```

### Message Limit
To change the message history limit, modify `server/server.js`:
```javascript
// Current: keeps last 100 messages
if (messages.length > 100) {
  messages = messages.slice(-100);
}

// Example: keep last 50 messages
if (messages.length > 50) {
  messages = messages.slice(-50);
}
```

### Styling
All styles are in `client/src/App.css` and can be customized as needed.

## Troubleshooting

### Port Already in Use
If ports 3000 or 3001 are in use:
- Change server port in `server/server.js`
- Update proxy in `client/package.json`

### CORS Issues
The server includes CORS middleware to allow cross-origin requests from the React app.

### Messages Not Updating
- Check that both server and client are running
- Verify the proxy setting in `client/package.json`
- Check browser console for errors

## License

MIT License - Feel free to use this code for learning and development purposes.
