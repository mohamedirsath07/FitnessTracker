# 🏋️ FitnessTracker

A full-stack **MERN** (MongoDB, Express.js, React, Node.js) fitness tracking application with **3D body visualization** using React Three Fiber.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
![Three.js](https://img.shields.io/badge/Three.js-3D-000000?logo=three.js)

## 🌐 Live Demo

**[🚀 level-up-lime.vercel.app](https://level-up-lime.vercel.app/)**

## ✨ Features

- 🎮 **Gamification System** - Earn XP, level up ranks (E → S → National), maintain streaks
- 🧍 **3D Body Visualization** - Interactive 3D human model that scales based on your metrics
- 🏃 **Workout Tracking** - Log exercises with MET-based calorie calculations
- 🥗 **Nutrition Logging** - Track meals, calories, and macros (protein, carbs, fats)
- 📊 **Progress Charts** - Visual analytics with Recharts
- 🔐 **JWT Authentication** - Secure login/register system

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API server
- **MongoDB** + **Mongoose** - Database & ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **React 19** + **Vite** - Fast development
- **TailwindCSS** - Styling
- **React Three Fiber** - 3D visualization
- **Recharts** - Analytics charts
- **Axios** - API communication

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/mohamedirsath07/FitnessTracker.git
cd FitnessTracker
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create `.env` file in `/server`:
```env
MONGO_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/fitness-tracker
JWT_SECRET=your-super-secret-key
PORT=5000
NODE_ENV=development
```

Start the server:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

### 4. Open the app
Navigate to `http://localhost:5173`

## 📁 Project Structure

```
FitnessTracker/
├── client/                 # React Frontend
│   ├── public/models/      # 3D GLB models
│   ├── src/
│   │   ├── components/     # UI components + 3D visualizer
│   │   ├── context/        # Auth context
│   │   ├── pages/          # App pages
│   │   └── services/       # API client
│   └── vite.config.js
│
├── server/                 # Node.js Backend
│   ├── config/             # DB connection
│   ├── middleware/         # Auth middleware
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   └── server.js
│
└── README.md
```

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/users/profile` | Update profile |
| GET | `/api/users/stats` | Dashboard stats |
| GET/POST | `/api/workouts` | Workout CRUD |
| GET/POST | `/api/meals` | Meal CRUD |
| GET | `/api/progress/today` | Daily progress |

## 🎮 Gamification Ranks

| Rank | XP Required |
|------|-------------|
| E Rank | 0 |
| D Rank | 500 |
| C Rank | 1,500 |
| B Rank | 4,000 |
| A Rank | 10,000 |
| S Rank | 25,000 |
| National Level | 50,000+ |

## 📸 Screenshots

*Dashboard with 3D body visualization, stats, and charts*

## 📄 License

MIT License - feel free to use this project for learning!

---

Built with ❤️ by Mohamed Irsath
 
