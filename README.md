# 🩺 HealingHeaven

**HealingHeaven** is a modern telemedicine platform that connects patients with doctors for secure video consultations, real-time chat, appointment scheduling, and more.

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

yaml
Copy
Edit

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
| Backend       | FastAPI / Django (modular)  |
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
git clone https://github.com/your-username/healingheaven.git
cd healingheaven
2. Backend (FastAPI or Django)
bash
Copy
Edit
cd backend/
cp .env.example .env         # Configure DB, secrets
docker-compose up --build    # Or use poetry/pip/venv
3. Frontend
bash
Copy
Edit
cd frontend/
yarn install
yarn dev                     # Starts React/Vite dev server
🔒 SSL (HTTPS with Certbot)
For NGINX-based SSL:

bash
Copy
Edit
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.healingheaven.live -d www.healingheaven.live
📂 Static File Hosting (Nginx config)
nginx
Copy
Edit
location /static/ {
    alias /var/www/healingheaven/static/;
}
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

 Stripe payment integration

📃 License
This project is licensed under the MIT License. See LICENSE for details.

🧑‍💻 Contributing
Contributions, issues and feature requests are welcome!
Fork it, submit a PR, or raise an issue.

🌐 Live Deployment
🌍 Frontend: healingheaven.live
🔗 API Gateway: api.healingheaven.live

🙌 Author
Mebin Mathew
LinkedIn | Twitter

yaml
Copy
Edit

---

Let me know if:

- You want to include Docker setup or `docker-compose.yaml` details  
- You're using FastAPI-only and want a single-service version  
- You’d like badge icons (build passing, license, etc.)

I can also generate a professional GitHub README with visuals if you're showcasing it in a portfolio.