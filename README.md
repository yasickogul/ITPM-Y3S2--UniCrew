# UniCrew

UniCrew is a university collaboration platform with role-based experiences for students, university admins, and system admins.

The repository is split into two applications:

- `Frontend/`: Vite + React client application
- `Backend/`: Node.js + Express + MongoDB API

## Repository Structure

```text
UniCrew/
├── Backend/
│   ├── app.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── routes/
├── Frontend/
│   ├── src/
│   ├── index.html
│   └── vite.config.ts
└── README.md
```

## Tech Stack

### Frontend

- React 18
- React Router
- Vite
- Tailwind CSS
- Radix UI components
- MUI (Material UI)

### Backend

- Node.js
- Express
- MongoDB + Mongoose
- CORS + dotenv

## Prerequisites

- Node.js 18+ (recommended)
- npm 9+ (recommended)
- MongoDB connection string (Atlas or local)

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd UniCrew
```

### 2. Backend setup

```bash
cd Backend
npm install
```

Create environment file:

```bash
cp .env.example .env
```

Set required variables in `Backend/.env`:

```env
PORT=5050
MONGO_URI=<your_mongodb_connection_string>
```

Start backend server:

```bash
# Development (nodemon)
npm run dev

# Production-like run
npm start
```

Backend API base URL:

```text
http://localhost:5050
```

### 3. Frontend setup

Open a new terminal:

```bash
cd Frontend
npm install
npm run dev
```

Vite will print the local URL (typically `http://localhost:5173`).

## Current API Endpoints (Universities)

Base path: `/api/universities`

- `POST /` - Create a university
- `GET /` - Get all universities
- `GET /:id` - Get a university by ID
- `PUT /:id` - Update a university by ID
- `DELETE /:id` - Delete a university by ID

Example payload for create/update:

```json
{
	"name": "University of Example",
	"email": "contact@example.edu",
	"domain": "example.edu"
}
```

## Application Routes (Frontend)

### Public

- `/`
- `/login`
- `/register`

### Student

- `/dashboard`
- `/communities`
- `/communities/:id`
- `/discussions`
- `/discussions/create`
- `/discussions/:id`
- `/chat/:communityId?`
- `/events`
- `/events/create`
- `/events/:id`
- `/profile`
- `/students/:id`

### University Admin

- `/university-admin`
- `/university-admin/communities`
- `/university-admin/posts`
- `/university-admin/reports`

### System Admin

- `/system-admin`
- `/system-admin/universities`
- `/system-admin/admins`

## Notes

- Use port `5050` for backend to avoid conflicts on macOS where AirPlay Receiver may occupy port `5000`.
- Do not commit `.env` files with real secrets.
- Some frontend sections currently rely on mock data in `Frontend/src/app/data/mockData.ts`.
