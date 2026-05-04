# 🎓 Student Project Management System

A role-based web application designed to manage the submission, review, approval, and documentation of student project topics.

## 📌 Overview

This system enables seamless interaction between **Students**, **Project Supervisors (Lecturers)**, and the **Project Committee (Admin)**. It ensures structured project allocation, real-time communication, a transparent approval workflow, and a duplication detection system to prevent identical or highly similar topics from being approved.

## 🧱 Technology Stack

*   **Frontend:** React.js, Vite, React Router DOM, Vanilla CSS (Glassmorphism design), Lucide React (Icons).
*   **Backend:** Node.js, Express.js.
*   **Database:** MongoDB via Mongoose.
*   **Real-time Communication:** Socket.IO.
*   **Authentication:** Multi-tier JWT system (Access + Refresh tokens).
*   **Session Management:** Secure HTTP-only cookies, server-side session tracking, and inactivity-based automatic logout.

## 👥 User Roles & Permissions

### 1. Student
*   **Authentication:** Logs in with a Registration Number (Prefix selectable via dropdown).
*   **Capabilities:** 
    *   Submit project topics and abstracts (minimun of 2 topics required).
    *   Track approval status in real-time.
    *   Communicate with their Supervisor via the integrated chat system.

### 2. Project Supervisor (Lecturer)
*   **Authentication:** Dedicated Lecturer Portal.
*   **Capabilities:**
    *   Review topics submitted by assigned students.
    *   Approve topics (sends to Admin), Request Corrections, or Reject.
    *   Real-time chat feedback for students.

### 3. Project Committee (Admin)
*   **Capabilities:**
    *   Bulk student-to-supervisor assignments.
    *   Final authority on all project approvals.
    *   Duplication Detection System: Algorithmical similarity check against existing projects.

---

## 🚀 Installation & Setup

### Requirements
*   Node.js installed
*   MongoDB running (locally or Atlas)

### Steps to Run

1.  **Backend Setup (`/backend`):**
    ```bash
    cd backend
    npm install
    
    # Run the database seeder (Creates default Admin + Supervisor)
    node seed.js 
    
    # Start the backend server
    npm run dev
    # Server runs on http://localhost:6001
    ```

2.  **Frontend Setup (`/my-app`):**
    ```bash
    cd my-app
    npm install
    
    # Start the development server
    npm run dev
    # Client runs on http://localhost:5173
    ```

---

## 🔐 Admin Creation & Security

### How to Create an Admin Account
There are two ways to create a Project Committee (Admin) account:

2.  **Secret Registration Route:**
    Navigate to the hidden registration link while the app is running:
    `http://localhost:5173/admin/secret-register`
    This allows you to create unique administrative accounts through the UI.

### Security Features
- **Inactivity Timeout:** Users are automatically logged out after 30 minutes of inactivity. A warning modal appears 5 minutes before the session expires.
- **HTTP-only Cookies:** Protects against XSS by storing authentication tokens in browser-managed cookies.
- **Token Rotation:** Refresh tokens are rotated on each use to prevent session hijacking.

---

## 🧪 Testing Data Credentials

*   **Admin Login:** `admin` / `password`
*   **Supervisor Login Example:** `dr_smith` / `password`
*   **Student Registration:** Use the "Register" portal.
    - Default prefixes: `HND II/swd/` or `HND II/NCC/` followed by digits (e.g., `054`)
