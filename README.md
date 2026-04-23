# 💬 GroupChat — Real-Time Group Messaging App

A full-stack real-time group chat application built with the **MERN stack** (MongoDB, Express, React, Node.js) and **Socket.IO** for live messaging. Users can send text messages, share files, edit and delete messages, and manage their profile settings.

---

## 🚀 Features

- **Real-time messaging** powered by Socket.IO
- **Persistent message history** stored in MongoDB
- **File sharing** — supports JPG, PNG, PDF, and DOCX (up to 5 MB)
- **Edit & delete messages** with live sync across all connected clients
- **Group sidebar** showing multiple chat groups
- **Group info page** — view members and group details
- **Settings page** — update profile name, email, password, notifications, and dark mode toggle
- **Help & Support page** — FAQ section and contact support form
- **Bad word filtering** on messages
- **Rate limiting** to prevent message spam
- **Auto-scroll** to the latest message (smart — only scrolls if user is near the bottom)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 (TypeScript) | UI framework |
| React Router DOM v7 | Client-side routing |
| Material UI (MUI) v7 | Component library & styling |
| Socket.IO Client v4 | Real-time WebSocket communication |
| Axios | HTTP requests |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express v5 | REST API server |
| Socket.IO v4 | WebSocket server |
| MongoDB + Mongoose | Database & ODM |
| Multer | File upload handling |
| CORS | Cross-origin resource sharing |

---

## 📁 Project Structure

```
GroupChat/
├── backend/
│   ├── app.js            # Main Express app, Socket.IO, MongoDB connection
│   ├── server.js         # Alternate lightweight server (in-memory mode)
│   ├── model.js          # Mongoose Message schema
│   ├── controller.js     # CRUD controllers for messages
│   ├── routes.js         # REST API route definitions
│   ├── uploads/          # Uploaded files stored here
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.tsx           # Landing / welcome page
    │   ├── ChatPage.tsx      # Main chat layout (sidebar + chat area)
    │   ├── ChatBox.tsx       # Message list, send/edit/delete logic
    │   ├── MessageInput.tsx  # Message input component
    │   ├── GroupList.tsx     # Left sidebar with group list
    │   ├── GroupInfoPage.tsx # Group details and members
    │   ├── SettingsPage.tsx  # User profile and preferences
    │   └── HelpPage.tsx      # FAQ and contact support
    └── package.json
```

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas connection string
- npm or yarn

---

### 1. Clone the repository

```bash
git clone https://github.com/himashasl/GroupChat.git
cd GroupChat
```

---

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder (optional — defaults will be used if not set):

```env
MONGO_URI=mongodb://localhost:27017/groupchat
PORT=5000
```

Start the backend server:

```bash
node app.js
```

The backend will be running at **http://localhost:5000**

---

### 3. Set up the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

The frontend will be running at **http://localhost:3000**

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/messages` | Fetch all chat messages |
| `POST` | `/api/messages` | Create a new message (REST fallback) |
| `PUT` | `/api/messages/:id` | Edit a message by ID |
| `DELETE` | `/api/messages/:id` | Delete a message by ID |
| `POST` | `/upload` | Upload a file (JPG, PNG, PDF, DOCX) |
| `GET` | `/uploads/:filename` | Serve an uploaded file |

---

## 🔁 Socket.IO Events

| Event | Direction | Description |
|---|---|---|
| `sendMessage` | Client → Server | Send a new message |
| `receiveMessage` | Server → Client | Broadcast a new message to all clients |
| `previousMessages` | Server → Client | Send message history to newly connected client |
| `editMessage` | Client → Server | Edit an existing message |
| `messageUpdated` | Server → Client | Broadcast updated message to all clients |
| `deleteMessage` | Client → Server | Delete a message |
| `messageDeleted` | Server → Client | Notify all clients of deletion |

---

## 📸 Pages Overview

| Page | Route | Description |
|---|---|---|
| Welcome | `/` | Landing page with Enroll button |
| Chat | `/chat` | Main group chat interface |
| Group Info | `/group-info` | Group name, members, and roles |
| Settings | `/settings` | Update profile, password, notifications |
| Help | `/help` | FAQ accordion and contact support form |

---

## 🗄️ Database Schema

**Message**

```js
{
  sender:    String (required),
  text:      String (max 300 chars),
  fileUrl:   String | null,
  filename:  String | null,
  edited:    Boolean (default: false),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## 📂 File Upload Rules

- **Allowed types:** JPEG, PNG, PDF, DOCX
- **Max file size:** 5 MB
- **Storage:** Files are saved to `backend/uploads/` with a timestamp-based filename
- **Access URL:** `http://localhost:5000/uploads/<filename>`

---

## 👤 Author

Built and maintained by **Himasha Fernando** — [@himashasl](https://github.com/himashasl)

---

## 📄 License

This project is licensed under the **ISC License**.
