# Supermarket Management System

A full-stack web application for managing supermarket operations, built with modern technologies. This project provides a comprehensive platform for inventory management, user authentication, and e-commerce functionality.

**Live Demo:** [https://supermarket-fawn-three.vercel.app](https://supermarket-fawn-three.vercel.app)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## ✨ Features

- **User Authentication** - Secure login and registration with JWT tokens and bcrypt password hashing
- **User Management** - Role-based access control and user profiles
- **Product Management** - Manage supermarket inventory with image uploads
- **Shopping Cart** - Add/remove products and manage orders
- **Email Notifications** - Order confirmations and user notifications via Nodemailer
- **Image Management** - Upload and manage product images using ImageKit
- **Responsive UI** - Modern, mobile-friendly interface with Tailwind CSS
- **Real-time Updates** - Smooth animations and transitions with Framer Motion

## 🛠 Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Framer Motion** - Animation library
- **React Icons** - Icon library
- **React Toastify** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Nodemailer** - Email service
- **ImageKit** - Image hosting and optimization
- **CORS** - Cross-origin resource sharing

## 📂 Project Structure

```
supermarket/
├── frontend/              # React application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── backend/               # Node.js/Express server
│   ├── server.js
│   ├── package.json
│   └── node_modules/
├── tools/                 # Utility scripts and tools
├── readme.md
└── package-lock.json
```

## 📦 Prerequisites

Make sure you have the following installed:
- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **MySQL** (v5.7 or higher)

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/ankur556/supermarket.git
cd supermarket
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## ▶️ Running the Application

### Backend Setup

1. Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=supermarket

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint

# Email Configuration (Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Server Configuration
PORT=5000
NODE_ENV=development
```

2. Start the backend server:

```bash
cd backend
npm start
# or for development with auto-reload
npm run server
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:5000
```

2. Start the development server:

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## ⚙️ Configuration

### Database Setup

Create a MySQL database and run the schema setup:

```sql
CREATE DATABASE supermarket;
USE supermarket;
-- Run your migration scripts here
```

### Environment Variables

- **Backend** (`backend/.env`) - Database credentials, JWT secrets, ImageKit API keys, and email configuration
- **Frontend** (`frontend/.env`) - API base URL for connecting to the backend

## 📚 API Documentation

The backend provides RESTful APIs for:

- **Authentication** - `/api/auth/register`, `/api/auth/login`
- **Products** - `/api/products` (CRUD operations)
- **Users** - `/api/users` (user management)
- **Orders** - `/api/orders` (order management)
- **Cart** - `/api/cart` (shopping cart operations)

### Example API Calls

```bash
# Register a user
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

# Login
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

## 📖 Scripts

### Backend Scripts
```bash
npm start          # Start the production server
npm run server     # Start with nodemon (auto-reload)
npm test           # Run tests
```

### Frontend Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👤 Author

Created by [ankur556](https://github.com/ankur556)

Original repository: [abhishekverma9/supermarket](https://github.com/abhishekverma9/supermarket)

## 🙏 Acknowledgments

- Thanks to all contributors and users of this project
- Built with [Vite](https://vitejs.dev/), [React](https://react.dev/), [Express](https://expressjs.com/), and [Tailwind CSS](https://tailwindcss.com/)

---

For issues or questions, please open an issue on the [GitHub repository](https://github.com/ankur556/supermarket/issues).
