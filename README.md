# Interactive User Relationship & Hobby Network
**Stack:** Node.js (Express + TypeScript) backend + PostgreSQL (Supabase)  
**Frontend:** React + TypeScript + React Flow

## Live demo
- Backend: [https://cybernautes.onrender.com/]
- Frontend: [https://cybernautes.vercel.app/]

## Run Project 
🚀 Run Project (Locally)
1️⃣ Clone the repository
git clone https://github.com/<your-username>/cybernautes.git
cd cybernautes

2️⃣ Setup environment files

Create .env files in both folders based on .env.example:

cp backend/.env.example backend/.env
PORT=4000
SUPABASE_URL=xxxx  //replace 
SUPABASE_ANON_KEY=xxxx //replace 

cp frontend/.env.example frontend/.env
VITE_API_URL={BASE URL}


Make sure to fill in your Supabase URL and keys.

3️⃣ Install dependencies
cd backend
npm install
cd ../frontend
npm install

4️⃣ Run the backend (Express + TypeScript)
cd backend
npm run dev


By default runs on → http://localhost:4000

5️⃣ Run the frontend (React + Vite
You said:
Please write fully I will be coping that and adding to read.md
ChatGPT said:

Perfect 👍 — here’s the complete and ready-to-copy version for your README.md:

🚀 Run Project (Locally)
1️⃣ Clone the repository
git clone https://github.com/<your-username>/cybernautes.git
cd cybernautes

2️⃣ Setup environment files

Create .env files in both folders based on .env.example:

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env


Fill in your Supabase URL, service key, and API base URLs in these files.

3️⃣ Install dependencies

Install dependencies separately for both backend and frontend:

# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install

4️⃣ Run the backend (Express + TypeScript)
cd backend
npm run dev


By default, it runs on → http://localhost:4000

5️⃣ Run the frontend (React + Vite)
cd frontend
npm run dev


By default, it runs on → http://localhost:5173

## Project structure
cybernautes/
├── backend/                  # Express + TypeScript API
│   ├── src/
│   │   ├── config/           # Supabase
│   │   ├── routes/           # API route definitions (users, links, etc.)
│   │   ├── services/         # Business logic (createUser, linkFriend, etc.)
│   │   └── index.ts          # Express app entry
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md             # Backend-specific notes

├── frontend/                 # React + TypeScript + React Flow UI
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Context (Users, Graph)
│   │   ├── hooks/            # Custom hooks (useUsers, useGraph, etc.)
│   │   ├── pages/            # Main views like UserManagementPanel, GraphView
│   │   ├── api/              # Axios instance & helpers
│   │   └── main.tsx          # App entry point
│   ├── vite.config.ts
│   ├── package.json
│   └── README.md             # Frontend-specific notes

├── shared/                   # (Optional) Shared types/interfaces between FE & BE
│   └── types/
│       └── user.ts
├── .gitignore
├── package.json              # Root dependencies (scripts, linting, etc.)
└── README.md                 # Main documentation (you’re reading this!)