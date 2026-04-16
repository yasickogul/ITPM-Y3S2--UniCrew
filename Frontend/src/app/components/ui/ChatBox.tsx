import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Chip,
} from "@mui/material";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

interface Message {
  id: string;
  sender: string;
  text?: string;
  fileUrl?: string | null;
  filename?: string | null;
  edited?: boolean;
  timestamp: number | string;
}

const socket = io("http://localhost:5000");

const ChatBox = (): React.ReactElement => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [lastSentTime, setLastSentTime] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [username] = useState<string>("You");

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const badWords = ["badword1", "badword2"];

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const isUserNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight < 200;
  };

  useEffect(() => {
    if (isUserNearBottom()) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    socket.on("previousMessages", (prevMessages: Message[]) => setMessages(prevMessages));
    socket.on("receiveMessage", (newMessage: Message) => setMessages((prev) => [...prev, newMessage]));
    socket.on("messageUpdated", (updatedMsg: Message) => {
      setMessages((prev) => prev.map((msg) => (msg.id === updatedMsg.id ? updatedMsg : msg)));
    });
    socket.on("messageDeleted", ({ id }: { id: string }) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    });

    return () => {
      socket.off("previousMessages");
      socket.off("receiveMessage");
      socket.off("messageUpdated");
      socket.off("messageDeleted");
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File must be less than 5MB");
      return;
    }
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only JPG, PNG, PDF, DOCX allowed");
      return;
    }
    if (selectedFile.name.length > 50) {
      setError("File name too long");
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    const inputElement = document.getElementById("file") as HTMLInputElement | null;
    if (inputElement) {
      inputElement.value = "";
    }
  };

  const sendMessage = async () => {
    const trimmed = input.trim();

    if (!trimmed && !file) {
      setError("Message or file required");
      return;
    }
    if (trimmed.length > 300) {
      setError("Message too long (max 300 characters)");
      return;
    }

    const now = Date.now();
    if (now - lastSentTime < 1000) {
      setError("You're sending messages too fast");
      return;
    }

    const containsBadWord = badWords.some((word) => trimmed.toLowerCase().includes(word));
    if (containsBadWord) {
      setError("Message contains inappropriate words");
      return;
    }

    setError("");
    setLastSentTime(now);
    setUploading(true);

    let fileUrl: string | null = null;
    let filename: string | null = null;

    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("http://localhost:5000/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          fileUrl = data.fileUrl;
          filename = data.filename;
        } else {
          setError("File upload failed");
          setUploading(false);
          return;
        }
      } catch (err) {
        setError("Cannot upload file. Check if backend is running.");
        setUploading(false);
        return;
      }
    }

    const timestamp = Date.now();
    const outgoingMessage: Message = {
      id: `${timestamp}-${Math.random().toString(36).slice(2)}`,
      sender: username,
      text: trimmed,
      fileUrl,
      filename,
      edited: false,
      timestamp,
    };

    setMessages((prev) => [...prev, outgoingMessage]);

    socket.emit("sendMessage", {
      ...outgoingMessage,
    });

    setInput("");
    setFile(null);
    setUploading(false);
  };

  const handleEdit = (id: string, currentText: string = "") => {
    const newText = prompt("Edit your message:", currentText);
    if (newText && newText.trim() !== currentText) {
      const trimmedText = newText.trim();
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id ? { ...msg, text: trimmedText, edited: true } : msg
        )
      );
      socket.emit("editMessage", { id, newText: trimmedText });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this message?")) {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
      socket.emit("deleteMessage", { id });
    }
  };

  const isImage = (filename?: string | null): boolean => {
    if (!filename) return false;
    const ext = filename.toLowerCase().split(".").pop();
    return Boolean(ext && ["jpg", "jpeg", "png"].includes(ext));
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        bgcolor: "#ffffff",
        borderRadius: 3,
        border: "1px solid #93c5fd",
        boxShadow: "0 6px 18px rgba(59,130,246,0.12)",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          p: 1,
          borderBottom: "1px solid #e2e8f0",
          bgcolor: "#b0d4f7",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ fontWeight: "bold", color: "#0f172a" }}>
          (IT) 2023 June Batch - 3 rd Year
        </Typography>

        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
          <MoreVertIcon />
        </IconButton>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => navigate("/groupinfo")}>Group Info</MenuItem>
          <MenuItem onClick={() => navigate("/settings")}>Settings</MenuItem>
          <MenuItem onClick={() => navigate("/help")}>Help</MenuItem>
        </Menu>
      </Box>

      <Box
        ref={messagesContainerRef}
        sx={{
          flex: 1,
          minHeight: 0,
          p: 2,
          bgcolor: "#f1f5f9",
          overflowY: "auto",
          overflowX: "hidden",
          "&::-webkit-scrollbar": {
            width: "12px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#e2e8f0",
            borderRadius: "20px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#64748b",
            borderRadius: "20px",
            border: "3px solid #e2e8f0",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#475569",
          },
          scrollbarWidth: "thin",
          scrollbarColor: "#64748b #e2e8f0",
        }}
      >
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: "flex",
              justifyContent: msg.sender === username ? "flex-end" : "flex-start",
              mb: 2,
            }}
          >
            <Box
              sx={{
                bgcolor: msg.sender === username ? "#3b82f6" : "#e2e8f0",
                color: msg.sender === username ? "#fff" : "#0f172a",
                p: 1.5,
                borderRadius: 2,
                maxWidth: "65%",
                border:
                  msg.sender === username
                    ? "1px solid rgba(255,255,255,0.5)"
                    : "1px solid rgba(148,163,184,0.5)",
              }}
            >
              {msg.text && <Typography sx={{ mb: msg.fileUrl ? 1 : 0 }}>{msg.text}</Typography>}

              {msg.fileUrl && isImage(msg.filename) ? (
                <Box sx={{ mt: 1 }}>
                  <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={msg.fileUrl}
                      alt={msg.filename ?? "attachment"}
                      style={{ maxWidth: "100%", maxHeight: "280px", borderRadius: "8px", cursor: "pointer" }}
                    />
                  </a>
                </Box>
              ) : msg.fileUrl ? (
                <Typography sx={{ fontSize: 12, mt: 1 }}>
                  📎 <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>
                    {msg.filename}
                  </a>
                </Typography>
              ) : null}

              {msg.edited && <Typography variant="caption">(edited)</Typography>}

              <Typography variant="caption" sx={{ display: "block", mt: 0.5, opacity: 0.7 }}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Typography>

              {msg.sender === username && (
                <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                  <Button size="small" variant="text" sx={{ color: "#fff", fontSize: "0.75rem" }} onClick={() => handleEdit(msg.id, msg.text ?? "")}
                  >
                    Edit
                  </Button>
                  <Button size="small" variant="text" color="error" sx={{ fontSize: "0.75rem" }} onClick={() => handleDelete(msg.id)}>
                    Delete
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {error && <Typography sx={{ color: "red", pl: 2, pb: 1 }}>{error}</Typography>}

      <Box sx={{ p: 1.5, borderTop: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
        {file && (
          <Box sx={{ mb: 1 }}>
            <Chip
              label={file.name}
              onDelete={removeFile}
              color="primary"
              variant="outlined"
              size="small"
              icon={<AttachFileIcon />}
            />
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <input type="file" hidden id="file" onChange={handleFileChange} />

          <label htmlFor="file">
            <IconButton component="span" disabled={uploading}>
              <AttachFileIcon />
            </IconButton>
          </label>

          <TextField
            fullWidth
            size="small"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type message..."
            onKeyDown={(e) => e.key === "Enter" && !uploading && sendMessage()}
            disabled={uploading}
          />

          <Button
            variant="contained"
            sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" } }}
            onClick={sendMessage}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Send"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatBox;
