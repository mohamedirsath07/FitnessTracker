<div align="center">
  <img src="Logo.png" alt="LevelUp Fitness Logo" width="200"/>
  <h1>🏋️ LevelUp Fitness Tracker</h1>
  <p><strong>A premium, full-stack MERN application with 3D cybernetic body visualization.</strong></p>

  [![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Three.js](https://img.shields.io/badge/Three.js-3D-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
  
  <br />

  <h3><a href="https://levelup123.vercel.app/login">🌐 Live Demo (Vercel)</a></h3>
</div>

<br/>

## ✨ Features

LevelUp is designed to bring gamification and high-end visualization to fitness tracking:

- 🎮 **Gamification System** - Earn XP, level up ranks (E → S → National), and maintain daily streaks.
- 🧍 **3D Cybernetic Body Visualization** - Interactive 3D human model built with React Three Fiber featuring a premium glowing wireframe shader that reacts to calorie burn.
- 🩺 **Advanced Premium Metrics** - Tracks Skeletal Muscle Mass, Visceral Fat, Hydration Levels, and BMI/BMR.
- 🏃 **Workout Tracking** - Log exercises with MET-based calorie calculations.
- 🥗 **Nutrition Logging** - Track meals, calories, and macros (protein, carbs, fats).
- 📊 **Progress Charts** - Visual analytics with Recharts for daily and weekly progress.
- 🔐 **JWT Authentication** - Secure login and registration system.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **React 19** + **Vite** - Lightning-fast development and build tool.
- **TailwindCSS** - Utility-first styling for a sleek, dark-mode premium UI.
- **React Three Fiber / Drei** - 3D model rendering and post-processing effects (Bloom).
- **Framer Motion** - Fluid micro-animations and page transitions.
- **Recharts** - Responsive data visualization.

### Backend (Server)
- **Node.js** + **Express.js** - Robust REST API architecture.
- **MongoDB** + **Mongoose** - NoSQL database and Object Data Modeling.
- **JWT & bcrypt** - Secure authentication and password hashing.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (Local instance or MongoDB Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/mohamedirsath07/FitnessTracker.git
cd FitnessTracker
```

### 2. Setup Backend Environment
```bash
cd server
npm install
```
Create a `.env` file in the `/server` directory:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fitness-tracker?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key
PORT=5000
NODE_ENV=development
```
Start the backend server:
```bash
npm run dev
```

### 3. Setup Frontend Environment
Open a new terminal and navigate to the client folder:
```bash
cd client
npm install
npm run dev
```
Navigate to `http://localhost:5173` to view the application!

---

## 📁 Repository Structure

Our repository follows a clean, professional monorepo-style structure:

```text
FitnessTracker/
├── docs/                   # System architecture and design documentation
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   └── DESIGN_SYSTEM.md
├── client/                 # React Frontend
│   ├── public/models/      # 3D GLB character models
│   ├── src/
│   │   ├── components/     # Reusable UI components & 3D visualizers
│   │   ├── context/        # React Context providers (Auth)
│   │   ├── pages/          # Full page layouts
│   │   └── services/       # API integration layers
│   └── vite.config.js      # Vite build configuration
├── server/                 # Node.js Backend
│   ├── config/             # Database connection setups
│   ├── middleware/         # Express middleware (Auth protection)
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express API routers
│   └── server.js           # Server entry point
└── README.md
```
*(For detailed architecture and design guidelines, please check the [`docs/`](./docs/) directory.)*

---

## 🔑 Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create a new user account |
| POST | `/api/auth/login` | Authenticate and retrieve JWT |
| GET | `/api/auth/me` | Fetch current authenticated user |
| PUT | `/api/users/profile` | Update user metrics and goals |
| GET | `/api/users/stats` | Retrieve dashboard gamification stats |
| GET/POST | `/api/workouts` | Retrieve or log workouts |
| GET/POST | `/api/meals` | Retrieve or log nutrition meals |

---

## 🎮 Gamification Ranks

The system uses an RPG-style ranking system to keep users motivated:

| Rank | XP Required |
|------|-------------|
| E Rank | 0 |
| D Rank | 500 |
| C Rank | 1,500 |
| B Rank | 4,000 |
| A Rank | 10,000 |
| S Rank | 25,000 |
| National Level | 50,000+ |

---

## 📄 License

This project is licensed under the MIT License - feel free to use this project for learning and personal growth!

<br />
<p align="center">Built with ❤️ by Mohamed Irsath</p>
