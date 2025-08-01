# 🩺 HealingHeaven

**HealingHeaven** is a modern mental health platform that connects patients with doctors for secure video consultations, real-time chat, appointment scheduling, and more.

---

## 🧩 Project Structure

healingheaven/
├── backend/
│ ├── user_service/ # User registration, login, profiles
│ ├── doctor_service/ # Doctor profiles, availability
│ ├── consultation_service/ # Booking, chat, video calls
│ └── api_gateway/ # Unified entrypoint (FastAPI + NGINX)
├── frontend/ # React or Next.js frontend
└── nginx/ # NGINX reverse proxy config

---

## 🚀 Features

- ✅ User and doctor authentication (Google OAuth support)
- 💬 Real-time chat with WebSocket integration
- 📹 Secure WebRTC video calls
- 📅 Appointment booking with availability tracking
- 📁 File upload and sharing in chat
- 🔐 HTTPS and domain-based routing (with NGINX + SSL)

---

## ⚙️ Tech Stack

| Layer         | Tech                        |
|---------------|-----------------------------|
| Frontend      | React + Tailwind CSS        |
| Backend       | FastAPI   |
| Database      | PostgreSQL                  |
| WebSocket     | FastAPI + Starlette         |
| Video Calls   | WebRTC + custom signaling   |
| Auth          | JWT + Google OAuth          |
| Hosting       | Vercel (Frontend) + AWS EC2 (Backend) |
| SSL/Proxy     | NGINX + Let's Encrypt       |

---

## 🛠️ Setup Instructions

### 1. Clone the repo
```bash
git clone https://github.com/mebinmathew006/HealingHeaven.git
cd HealingHeaven
2. Backend (FastAPI )
cd backend/
cp .env.example .env         # Configure DB, secrets
docker-compose up --build    # Or use poetry/pip/venv
3. Frontend

cd frontend/
yarn install
yarn dev                     # Starts React/Vite dev server

⚡ API Endpoints (Sample)
Method	Endpoint	Description
GET	/api/user/me	Authenticated user info
POST	/api/auth/login	Login with JWT
GET	/api/consultations/active	Current active sessions
WS	/ws/chat/{room_id}	Real-time chat
WS	/ws/video/{room_id}	WebRTC signaling

✅ To-Do
 JWT Authentication

 WebSocket chat

 WebRTC video calling

 Push notifications

 Doctor rating and feedback

 Razorpay payment integration


🧑‍💻 Contributing
Contributions, issues and feature requests are welcome!
Fork it, submit a PR, or raise an issue.

🌐 Live Deployment
🌍 Frontend: healingheaven.live
🔗 API Gateway: api.healingheaven.live

🙌 Author
Mebin Mathew

🧑‍💻 Sample .env
USER_DATABASE_URL=''
CORS_ORIGINS=''
MAIL_USERNAME=''
MAIL_PASSWORD=''
MAIL_FROM_NAME=''
MAIL_FROM=''
MAIL_SERVER=''
MAIL_PORT=''
SECRET_KEY=''
REDIS_HOST =''
REDIS_PORT= ''
CLOUD_NAME=''
CLOUDINARY_API_KEY=''
CLOUDINARY_SECRET_KEY=''
POSTGRES_DB=''
POSTGRES_USER=''
POSTGRES_PASSWORD=''
GOOGLE_CLIENT_ID=''


