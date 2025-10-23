"use strict";
import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages from server
  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages");
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
      } else {
        setError("Failed to fetch messages");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Fetch error:", err);
    }
  };

  // Send a new message
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!username.trim() || !newMessage.trim()) {
      setError("Both username and message are required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          message: newMessage.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewMessage("");
        // Immediately fetch messages to show the new one
        fetchMessages();
      } else {
        setError(data.error || "Failed to send message");
      }
    } catch (err) {
      setError("Error sending message");
      console.error("Send error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Send invalid payload to test error handling
  const sendInvalidPayload = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Invalid payload - missing username and message
          invalidField: "this should cause an error",
          anotherInvalidField: null,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(`Test Error: ${data.error || "Server returned error"}`);
      } else {
        setError("Unexpected: Server accepted invalid payload");
      }
    } catch (err) {
      setError(`Network Error: ${err.message}`);
      console.error("Invalid payload test error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up polling for new messages
  useEffect(() => {
    // Initial fetch
    fetchMessages();

    // Set up polling every 2 seconds
    const interval = setInterval(fetchMessages, 2000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format timestamp for display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Chat App Demo</h1>
            <p>Using polling for real-time updates</p>
          </div>
          <button
            className="test-error-button"
            onClick={sendInvalidPayload}
            disabled={isLoading}
            title="Send invalid payload to test error handling"
          >
            {isLoading ? "Testing..." : "Test Error"}
          </button>
        </div>
      </header>

      <main className="chat-container">
        {/* Messages Display */}
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="no-messages">
              No messages yet. Be the first to say something!
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="message">
                <div className="message-header">
                  <span className="username">{msg.username}</span>
                  <span className="timestamp">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="message-content">{msg.message}</div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Form */}
        <form className="message-form" onSubmit={sendMessage}>
          <div className="form-row">
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="username-input"
              maxLength={50}
            />
          </div>

          <div className="form-row">
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="message-input"
              maxLength={500}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !username.trim() || !newMessage.trim()}
              className="send-button"
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </form>

        {/* Error Display */}
        {error && <div className="error-message">{error}</div>}
      </main>

      <footer className="app-footer">
        <p>
          Messages: {messages.length} | Last update:{" "}
          {new Date().toLocaleTimeString()}
        </p>
      </footer>
    </div>
  );
}

export default App;
