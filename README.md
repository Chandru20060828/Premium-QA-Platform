# 💬 QA Platform — MERN Stack with Subscription System

A full-stack Q&A platform with **JWT authentication**, **Razorpay payment gateway**, **subscription-based question limits**, **time-restricted payments**, and **email invoices**.

---

## 📁 Project Structure

```
qa-platform/
├── backend/
│   ├── config/          → MongoDB connection
│   ├── controllers/     → Business logic
│   ├── middleware/      → Auth, payment time, question limit
│   ├── models/          → Mongoose schemas
│   ├── routes/          → Express route definitions
│   ├── utils/           → Email service
│   ├── server.js        → Entry point
│   └── .env.example     → Environment variables template
│
└── frontend/
    ├── src/
    │   ├── context/     → Auth state (React Context)
    │   ├── components/  → Navbar, QuotaCard
    │   ├── pages/       → All pages
    │   └── App.jsx      → Router setup
    ├── index.html
    └── .env.example
```

---

## ⚙️ Prerequisites

- Node.js v18+
- MongoDB Atlas account (free tier works)
- Razorpay account (test mode)
- Gmail account with App Password enabled

---

## 🚀 Local Setup

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your actual values
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:5173

---

## 🔑 Environment Variables

### Backend `.env`

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/qa_platform
JWT_SECRET=your_super_secret_key
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
```

---

## 📦 Subscription Plans

| Plan   | Price      | Daily Limit |
|--------|------------|-------------|
| Free   | ₹0         | 1 question  |
| Bronze | ₹100/month | 5 questions |
| Silver | ₹300/month | 10 questions|
| Gold   | ₹1000/month| Unlimited   |

---

## ⏰ Payment Time Restriction

Payments are only allowed between **10:00 AM – 11:00 AM IST**.

Outside this window, the API returns:
```json
{
  "success": false,
  "message": "Payments allowed only between 10AM and 11AM IST"
}
```

---

## 🔗 API Endpoints

### Auth
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |
| GET  | `/api/auth/profile` | Get user profile (protected) |

### Questions
| Method | URL | Description |
|--------|-----|-------------|
| GET  | `/api/questions` | Get all questions |
| POST | `/api/questions` | Post question (protected + limit check) |
| GET  | `/api/questions/:id` | Get single question |
| POST | `/api/questions/:id/answer` | Post answer |
| GET  | `/api/questions/my-questions` | Get my questions |

### Payments
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/payments/create-order` | Create Razorpay order (time-restricted) |
| POST | `/api/payments/verify` | Verify payment & activate subscription |
| GET  | `/api/payments/history` | Get payment history |

### Subscriptions
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/subscriptions/plans` | Get all plan details |
| GET | `/api/subscriptions/my-subscription` | Get my subscription info |

---

## 📧 Gmail App Password Setup

1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to https://myaccount.google.com/apppasswords
4. Create an App Password for "Mail"
5. Copy it into `EMAIL_PASS` in your `.env`

---

## 💳 Razorpay Setup

1. Sign up at https://dashboard.razorpay.com
2. Go to Settings → API Keys
3. Copy **Key ID** and **Key Secret** into your `.env`
4. Use **Test Mode** during development

---

## 🌐 Deployment

### Backend → Render.com

1. Push code to GitHub
2. Create new Web Service on render.com
3. Set root directory: `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add all environment variables in Render dashboard

### Frontend → Vercel.com

1. Push code to GitHub
2. Import project on vercel.com
3. Set root directory: `frontend`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add env variable: `VITE_API_URL=https://your-render-url.onrender.com`

---

## 📋 Sample API Requests

### Register User
```json
POST /api/auth/register
{
  "name": "Chandru G",
  "email": "chandru@example.com",
  "password": "secret123"
}
```

### Post Question
```json
POST /api/questions
Headers: Authorization: Bearer <token>
{
  "title": "How does async/await work in JavaScript?",
  "body": "I'm confused about the event loop and async behavior...",
  "tags": ["javascript", "async", "nodejs"]
}
```

### Create Payment Order
```json
POST /api/payments/create-order
Headers: Authorization: Bearer <token>
{
  "plan": "silver"
}
```

---

## 🛡️ Key Features

- ✅ JWT authentication with protected routes
- ✅ Daily question limits per subscription plan
- ✅ Auto-reset question count at midnight IST
- ✅ Razorpay payment with server-side signature verification
- ✅ Payment window restricted to 10-11 AM IST
- ✅ Email invoice with HTML template after payment
- ✅ Subscription expiry tracking (30-day plans)
- ✅ Auto-downgrade to free after expiry
- ✅ Responsive React frontend
"# Premium-QA-Platform" 
