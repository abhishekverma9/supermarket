<div align="center">

# 🛒 Shop4Ever — Supermarket Management System

### A Full-Stack Role-Based Supermarket Platform with AI-Powered Shopping Assistant

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-Aiven_Cloud-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://aiven.io/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**Shop4Ever** is a production-grade, full-stack supermarket management system built as a Database & Information Systems (DBIS) course project. It features three distinct user roles — **Owner**, **Employee**, and **Consumer** — each with dedicated dashboards, workflows, and access controls. The platform also integrates an **AI-powered chatbot** using RAG (Retrieval-Augmented Generation) for intelligent product queries.

[Getting Started](#-getting-started) · [Features](#-features) · [Tech Stack](#-tech-stack) · [API Reference](#-api-reference) · [Architecture](#-architecture)

</div>

---

## 📸 Screenshots

<div align="center">

### 🏠 Landing Page
<img src="screenshots/landing_page.png" alt="Shop4Ever Landing Page" width="90%" />

> *Premium dark-themed landing page with animated gradient branding and glowing background effects*

---

### 🔐 Authentication — Role-Based Login
<img src="screenshots/login_page.png" alt="Login Page with Role Selector" width="90%" />

> *Glassmorphism login form with Owner/Employee/Consumer role selector, OTP verification, and forgot password flow*

---

### 🛍️ Consumer Dashboard — Product Browsing
<img src="screenshots/consumer_dashboard.png" alt="Consumer Product Grid" width="90%" />

> *Responsive product grid with category/price filtering, discount badges, dynamic Unsplash images, and add-to-cart functionality*

---

### 📊 Owner Dashboard — Business Analytics
<img src="screenshots/owner_dashboard.png" alt="Owner Analytics Dashboard" width="90%" />

> *Real-time business insights: total orders, revenue, employee stats, low-stock alerts, and customer metrics*

---

### 🤖 AI Shopping Assistant (RAG Chatbot)
<img src="screenshots/ai_chatbot.png" alt="AI Chatbot Widget" width="50%" />

> *Floating chatbot powered by Groq + LangChain RAG pipeline for natural-language product queries*

</div>

---

## ✨ Features

### 🔑 Authentication & Security
- **Multi-role login** — Owner, Employee, Consumer with JWT-based sessions
- **OTP verification** — Email-based OTP for login, signup, and password reset via Nodemailer
- **Password hashing** — bcrypt with salt rounds for secure credential storage
- **Role-based route protection** — Middleware-level access control on every API endpoint
- **Forgot password flow** — 3-step recovery: email → OTP verify → reset password

### 👤 Consumer Portal
- **Product browsing** — Responsive grid with search, category filters, and price range filters
- **Dynamic product images** — Auto-fetched from Unsplash API with ImageKit fallback
- **Product details** — Dedicated page with full description, pricing, and stock info
- **Shopping cart** — Add/update/remove items with real-time quantity management
- **Checkout & orders** — Place orders and track order status (Pending → Shipped → Delivered)
- **Discount display** — Automatic discount calculation with strikethrough original prices

### 👷 Employee Portal
- **Order management** — View all orders and update status (Pending → Shipped → Delivered)
- **Product management** — Add, update, and delete products with image upload via ImageKit
- **Profile management** — Update personal info and profile photo
- **Team visibility** — View team members under the same manager

### 🏢 Owner (Admin) Portal
- **Business dashboard** — 8 real-time KPI cards (revenue, orders, stock, employees, customers)
- **Employee management** — Full CRUD: hire, fire, update salary, assign managers
- **Product oversight** — View all products, manage discounts with description
- **Order monitoring** — View and track all orders across the platform

### 🤖 AI Chatbot (RAG Pipeline)
- **Natural language queries** — Ask about products, prices, and availability in plain English
- **Vector database** — ChromaDB with HuggingFace sentence-transformer embeddings
- **LLM integration** — Groq API running Llama 3.1 8B for answer generation
- **Contextual answers** — Retrieves top-k relevant product data before generating responses
- **Floating UI widget** — Elegant glassmorphism chat interface with typing indicators

---

## 🏗 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 7, TailwindCSS 4, Framer Motion |
| **Backend** | Node.js, Express 5 (ES Modules) |
| **Database** | MySQL on Aiven Cloud (SSL) |
| **Auth** | JWT, bcrypt, OTP via Nodemailer |
| **File Upload** | Multer + ImageKit CDN |
| **AI/Chatbot** | Python, FastAPI, LangChain, ChromaDB, Groq API (Llama 3.1) |
| **Embeddings** | HuggingFace `all-MiniLM-L6-v2` |
| **Styling** | TailwindCSS, Glassmorphism, Dark Theme |
| **Icons** | React Icons, Lucide React |
| **Notifications** | React Toastify |
| **Deployment** | Vercel (Frontend), Aiven (Database) |

---

## 🏛 Architecture

```
supermarket/
├── backend/                    # Express.js REST API
│   ├── config/
│   │   ├── db.js               # MySQL connection pool (Aiven SSL)
│   │   └── imageKit.js         # ImageKit CDN configuration
│   ├── controllers/
│   │   ├── authController.js   # Login, signup, OTP, password reset
│   │   ├── adminController.js  # Employee CRUD, dashboard stats, discounts
│   │   ├── cartController.js   # Cart operations & checkout
│   │   ├── employeeController.js # Orders, profile, team management
│   │   ├── orderController.js  # Order retrieval
│   │   ├── productController.js # Product CRUD with image upload
│   │   └── userController.js   # Consumer profile operations
│   ├── middlewares/
│   │   ├── authRole.js         # JWT verification + role-based access
│   │   └── multer.js           # File upload middleware
│   ├── models/
│   │   ├── admin.js            # Admin operations model
│   │   ├── employee.js         # Employee CRUD model
│   │   └── user.js             # Consumer model
│   ├── routes/
│   │   ├── authRoutes.js       # /api/auth/*
│   │   ├── adminRoutes.js      # /api/admin/*
│   │   ├── cartRoutes.js       # /api/cart/*
│   │   ├── employeeRoutes.js   # /api/employee/*
│   │   ├── orderRoutes.js      # /api/order/*
│   │   └── productRoutes.js    # /api/product/*
│   ├── utils/
│   │   ├── emailService.js     # Nodemailer OTP email templates
│   │   ├── generateToken.js    # JWT token generation
│   │   ├── genHash.js          # Password hashing utility
│   │   ├── otpStore.js         # In-memory OTP storage with expiry
│   │   └── authSessionStore.js # Auth session management
│   ├── certs/                  # SSL certificates for Aiven MySQL
│   ├── server.js               # Express app entry point
│   ├── createAdmin.js          # One-time admin seeding script
│   └── .env                    # Environment variables
│
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── FloatingChatbot.jsx  # AI chatbot widget
│   │   │   ├── Navbar.jsx           # Navigation bar
│   │   │   ├── OrderCard.jsx        # Order display card
│   │   │   └── ProtectedRoute.jsx   # Auth guard component
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth + cart state
│   │   ├── layouts/
│   │   │   ├── ConsumerLayout.jsx   # Consumer shell + sidebar
│   │   │   ├── EmployeeLayout.jsx   # Employee shell + sidebar
│   │   │   └── OwnerLayout.jsx      # Owner shell + sidebar
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Landing page
│   │   │   ├── Login.jsx            # Multi-role auth page
│   │   │   ├── Features.jsx         # Feature showcase
│   │   │   ├── consumer/            # Dashboard, Cart, Orders, Checkout, ProductDetails
│   │   │   ├── employee/            # EmpDashboard, Orders, Products, Profile
│   │   │   ├── owner/               # OwnerDashboard, Employees, Products, Orders
│   │   │   └── chatbot/             # RAG backend (Python) + chat UI
│   │   ├── App.jsx                  # Route definitions
│   │   └── main.jsx                 # React DOM entry
│   └── index.html                   # HTML shell with dark mode support
│
├── tools/
│   └── generate_ppt.py         # Presentation generator utility
│
├── screenshots/                # Project screenshots for README
└── readme.md                   # This file
```

---

## 📡 API Reference

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/signup` | Register new consumer | ❌ |
| `POST` | `/login` | Login (all roles) | ❌ |
| `POST` | `/send-login-otp` | Send OTP for login verification | ❌ |
| `POST` | `/verify-login-otp` | Verify login OTP & get token | ❌ |
| `POST` | `/send-signup-otp` | Send OTP for signup verification | ❌ |
| `POST` | `/verify-signup-otp` | Verify signup OTP & create account | ❌ |
| `POST` | `/forgot-password` | Send password reset OTP | ❌ |
| `POST` | `/verify-otp` | Verify reset OTP | ❌ |
| `POST` | `/reset-password` | Set new password | ❌ |

### Products (`/api/product`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/products` | Get all products | Consumer, Owner, Employee |
| `GET` | `/products/:id` | Get product by ID | ❌ |
| `POST` | `/add` | Add new product (with image) | Admin, Employee |
| `POST` | `/update/:id` | Update product details | Admin, Employee |
| `POST` | `/delete/:id` | Delete a product | Admin, Employee |

### Cart (`/api/cart`) — *Consumer only*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/add` | Add item to cart |
| `GET` | `/get` | Get cart items |
| `POST` | `/update` | Update item quantity |
| `POST` | `/remove/:cart_id` | Remove item from cart |
| `POST` | `/clear` | Clear entire cart |
| `POST` | `/checkout` | Place order from cart |

### Orders (`/api/order`) — *Consumer only*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/orders` | Get consumer's orders |
| `GET` | `/orders/:order_id` | Get order details |

### Employee (`/api/employee`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/orders` | Get all orders | Employee, Owner |
| `POST` | `/status/:order_id` | Update order status | Employee |
| `GET` | `/profile` | Get employee profile | Employee |
| `POST` | `/update-profile` | Update profile (with photo) | Employee |
| `GET` | `/team-member` | Get team members | Employee |

### Admin/Owner (`/api/admin`) — *Owner only*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/employees` | Get all employees |
| `POST` | `/add` | Add new employee (with photo) |
| `POST` | `/delete/:employee_id` | Delete employee |
| `POST` | `/update/:employee_id` | Update employee (salary, manager) |
| `POST` | `/update-discount/:product_Id` | Create/update product discount |
| `GET` | `/dashboard` | Get dashboard statistics |

### AI Chatbot (`localhost:8000`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/chat` | Send query, get RAG-powered response |

---

## 🗄️ Database Schema (MySQL)

The system uses a normalized relational schema on **Aiven Cloud MySQL** with SSL encryption:

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Consumers   │     │   Product    │     │    Employee      │
├─────────────┤     ├──────────────┤     ├─────────────────┤
│ consumer_id  │     │ product_id   │     │ employee_id      │
│ first_name   │     │ name         │     │ first_name       │
│ last_name    │     │ description  │     │ last_name        │
│ email        │     │ price        │     │ role (Admin/Emp) │
│ password     │     │ stock_quantity│    │ salary           │
│ phone        │     │ category     │     │ phone            │
│ house_no     │     │ product_image│     │ email            │
│ street       │     │ discount     │     │ password         │
│ building     │     └──────┬───────┘     │ manager_id (FK)  │
└──────┬──────┘            │              │ profile_photo    │
       │                   │              └─────────────────┘
       │            ┌──────┴───────┐
       │            │   Discount   │     ┌──────────────────┐
       │            ├──────────────┤     │ Product_Discount │
       │            │ discount_id  │◄────┤ product_id (FK)  │
       │            │ value        │     │ discount_id (FK) │
       │            │ description  │     └──────────────────┘
       │            └──────────────┘
       │
  ┌────┴──────┐     ┌──────────────┐
  │  Orders   │     │  Cart_Items  │
  ├───────────┤     ├──────────────┤
  │ order_id  │     │ cart_id      │
  │ consumer_id│    │ consumer_id  │
  │ total_amount│   │ product_id   │
  │ status    │     │ quantity     │
  │ created_at│     └──────────────┘
  └───────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and npm
- **Python** 3.9+ (for AI chatbot)
- **MySQL** database (or Aiven Cloud account)
- **ImageKit** account (for image uploads)
- **Gmail** account with App Password (for OTP emails)
- **Groq** API key (for AI chatbot)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/abhishekverma9/supermarket.git
cd supermarket
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
# Database (MySQL / Aiven)
DB_HOST=your-db-host.aivencloud.com
DB_USER=avnadmin
DB_PASSWORD=your-db-password
DB_NAME=defaultdb
DB_PORT=15127

# JWT
JWT_SECRET=your-secret-key

# Server
PORT=3000

# ImageKit (for product image uploads)
IMAGEKIT_PUBLIC_KEY=your-public-key
IMAGEKIT_PRIVATE_KEY=your-private-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id

# Email (Gmail with App Password)
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
COMPANY_EMAIL=your-email@gmail.com
COMPANY_EMAIL_APP_PASSWORD=your-app-password

# Environment
NODE_ENV=development
```

> **Note:** If using Aiven MySQL, place the CA certificate at `backend/certs/ca.pem`. See [Aiven docs](https://aiven.io/docs) for SSL setup.

**Seed the admin account (first-time only):**

```bash
node createAdmin.js
```

**Start the backend server:**

```bash
npm run server    # Development (with nodemon hot-reload)
# or
npm start         # Production
```

The API will be running at `http://localhost:3000`

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_UNSPLASH_API_KEY=your-unsplash-api-key
```

**Start the development server:**

```bash
npm run dev
```

The frontend will be running at `http://localhost:5173`

### 4️⃣ AI Chatbot Setup (Optional)

```bash
cd frontend/src/pages/chatbot
pip install -r requirements.txt
```

Create a `.env` file in the `chatbot/` directory:

```env
GROQ_API_KEY=your-groq-api-key
```

> **Note:** Ensure `data.txt` contains your product catalog data for the RAG pipeline.

**Start the chatbot server:**

```bash
python backend.py
```

The chatbot API will be running at `http://localhost:8000`

---

## 🔐 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| **Owner/Admin** | `abhishek@admin.com` | `admin123` |
| **Consumer** | *(Sign up via the app)* | — |
| **Employee** | *(Created by Owner)* | — |

---

## 📧 Email Setup (OTP)

The platform uses Gmail SMTP for sending OTP emails. To configure:

1. Enable **2-Step Verification** on your Gmail account
2. Generate an **App Password** at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Add the 16-character App Password to your backend `.env`

> In **development mode** (`NODE_ENV=development`), OTPs are also logged to the console for testing.

---

## 🧪 Testing the Application

### Test the complete workflow:

1. **Start all servers** — Backend (port 3000), Frontend (port 5173), Chatbot (port 8000)
2. **Owner login** — Use default admin credentials to access the Owner Dashboard
3. **Add employees** — Create employee accounts from the Owner panel
4. **Add products** — Use the Employee panel to add products with images
5. **Consumer signup** — Register a new consumer account (OTP verified)
6. **Browse & shop** — Search products, apply filters, add to cart
7. **Checkout** — Place an order and track status
8. **AI Chatbot** — Click the floating chat icon and ask about products

---

## 🎨 Design Philosophy

- **Dark-first design** — `#121212` base with `#F5F5F5` text for reduced eye strain
- **Orange accent palette** — `#FF8C00` primary with `#FF4B91` and `#8A2BE2` gradients
- **Glassmorphism** — Backdrop blur effects on modals and cards
- **Framer Motion** — Page transitions, hover effects, staggered grid animations
- **Responsive** — Mobile-first with breakpoints at `sm`, `md`, `lg`, `xl`
- **Inter font** — Google Fonts for clean, modern typography

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.


<div align="center">

**Built with ❤️ as a DBIS Course Project**

*If you found this project useful, consider giving it a ⭐!*

</div>
