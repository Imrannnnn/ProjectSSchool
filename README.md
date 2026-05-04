# 🎓 ProjectSchool: Student Project Management System

A robust, role-based platform designed to streamline the proposal, review, and management of student project topics. Built with the MERN stack and featuring real-time synchronization.

## 🚀 Features

- **Multi-Role Access**: Dedicated dashboards for Students, Supervisors, and Administrators.
- **Topic Management**: Students can propose topics, and Supervisors can review and approve them in real-time.
- **Real-Time Notifications**: Instant updates via Socket.IO for assignment changes and status updates.
- **Secure Authentication**: JWT-based authentication with cookie-based session management and inactivity auto-logout.
- **Modern UI**: Responsive and sleek design built with React and Vanilla CSS.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Axios, Socket.io-client, Lucide Icons.
- **Backend**: Node.js, Express, Socket.io, Mongoose.
- **Database**: MongoDB.
- **Deployment**: Prepared for Render (Blueprint included).

## 💻 Local Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd ProjectSchool
```

### 2. Backend Configuration
1. Navigate to the backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file based on the environment:
   ```env
   PORT=6001
   MONGO_URI=mongodb://localhost:27017/projectschool
   JWT_SECRET=your_super_secret_key
   FRONTEND_URL=https://projectproposalcss.netlify.app
   ```
4. Start the server: `npm run dev`

### 3. Frontend Configuration
1. Navigate to the frontend folder: `cd ../my-app`
2. Install dependencies: `npm install`
3. Create a `.env` file (Vite requires `VITE_` prefix):
   ```env
   VITE_API_URL=https://projectsschool.onrender.com
   ```
4. Start the app: `npm run dev`

## 🌐 Deployment

### Frontend (Netlify)
1. Push your code to GitHub.
2. Connect the `my-app` folder to Netlify.
3. **Build Command**: `npm run build`
4. **Publish Directory**: `dist`
5. **Environment Variables**: Add `VITE_API_URL` pointing to your Render backend URL.

### Backend (Render)
This project is pre-configured for Render using the `render.yaml` Blueprint.
1. Push your code to GitHub.
2. Go to [Render](https://render.com) and click **New +** -> **Blueprint**.
3. Connect your repository.
4. Provide the environment variables: `MONGO_URI`, `JWT_SECRET`, and `FRONTEND_URL=https://projectproposalcss.netlify.app`.

## 📁 Project Structure

```text
ProjectSchool/
├── backend/            # Express server, models, routes, and controllers
│   ├── db/            # Database connection logic
│   ├── models/        # Mongoose schemas
│   └── server.js      # Entry point
├── my-app/             # React (Vite) frontend
│   ├── src/context/   # Global state & Socket logic
│   ├── src/pages/     # Dashboard and Auth views
│   └── src/components/# Reusable UI elements
└── render.yaml         # Deployment blueprint
```

## 📄 License
This project is licensed under the ISC License.
