# TaskFlow - Real-Time Collaborative Task Manager

<p align="center">
  <img src="https://img.shields.io/badge/MERN-Stack-blue?style=for-the-badge&logo=mongodb&logoColor=white" alt="MERN Stack">
  <img src="https://img.shields.io/badge/Socket.IO-Real--Time-black?style=for-the-badge&logo=socket.io" alt="Socket.IO">
  <img src="https://img.shields.io/badge/Material–UI-Design-blue?style=for-the-badge&logo=mui" alt="Material-UI">
  <img src="https://img.shields.io/badge/JWT-Authentication-black?style=for-the-badge&logo=jsonwebtokens" alt="JWT">
</p>

**TaskFlow** is a full-stack, real-time collaborative task management application designed from the ground up for teams that require clarity, power, and seamless communication. It provides a robust platform for organizing projects, assigning tasks, and tracking progress with a clear hierarchical role system and a beautiful, intuitive user interface.

---

## ✨ Key Features

TaskFlow is packed with features designed to enhance productivity and streamline your team's workflow.

### 👥 **Real-Time Collaboration & Presence**
- **Live Online Status:** See who's online at a glance with real-time presence indicators for all users across the application.
- **Instant Notifications:** A fully-featured notification system delivers immediate alerts for critical events, including new task assignments, team invitations, and role changes.
- **Real-Time UI Updates:** The entire UI updates in real-time for all connected clients without needing a page refresh, powered by **Socket.IO**.

### 🔐 **Hierarchical Role System**
- **Superadmin:** The highest level of control. Superadmins can create and delete teams, manage all users, assign Team Leader roles, and have a complete overview of the entire system.
- **Team Leader:** Manage your own team's roster. Add or remove members, assign tasks to individuals within your team, and delete tasks created by your team members.
- **User:** The core of the team. Users can create tasks, assign them to their own team or collaborate with other teams, and track their progress.

### ✅ **Comprehensive Task Management**
- **Create & Assign:** Create detailed tasks with titles, descriptions, and deadlines.
- **Flexible Assignment:** Assign tasks to entire teams for large-scale projects, or to specific individuals for focused, accountable work.
- **Private Tasks:** Tasks assigned only to yourself are kept private and are not visible to other users.
- **Status Tracking:** Update task status from "Pending" to "In-Progress" to "Completed" to keep everyone informed.
- **Task Filtering:** Filter the task board by team to focus on specific projects.

### 🗓️ **Multiple Project Views**
- **Task Board:** A clean, scrollable list of all relevant tasks, designed for clarity and quick updates.
- **Interactive Calendar:** A full-featured calendar view powered by **FullCalendar** that displays all tasks with deadlines. Supports month, week, day, and agenda views.
- **Detailed Task View:** Click on any task in the list or calendar to open a modal with its full details, including description, deadline, assignees, and associated teams.

### ⚙️ **Seamless Administration**
- **Full Admin Dashboard:** A dedicated control panel for Superadmins to manage all users and teams in the system.
- **Team Management Modals:** Team Leaders and Admins can manage team members and leader assignments through intuitive modals directly from the main dashboard.
- **Automatic Cleanup:** When a team is deleted, all associated user roles are automatically demoted and team-specific tasks are cleanly removed from the database.
- **Secure Authentication:** User accounts are protected with a robust **JWT (JSON Web Token)** based authentication system with password hashing via **bcryptjs**.

---

## 🛠️ Technology Stack

TaskFlow is built with a modern, reliable, and scalable technology stack.

| Category          | Technology                                                                                                                                                                                                                                                                                                                          |
|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Frontend** | ![React](https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react&logoColor=black) ![Material-UI](https://img.shields.io/badge/-Material--UI-0081CB?style=flat-square&logo=mui&logoColor=white) ![FullCalendar](https://img.shields.io/badge/-FullCalendar-3174ad?style=flat-square) ![Axios](https://img.shields.io/badge/-Axios-5A29E4?style=flat-square&logo=axios&logoColor=white) ![Socket.io-client](https://img.shields.io/badge/-Socket.io_Client-black?style=flat-square&logo=socket.io) |
| **Backend** | ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/-Express.js-000000?style=flat-square&logo=express&logoColor=white) ![Socket.IO](https://img.shields.io/badge/-Socket.IO-010101?style=flat-square&logo=socket.io&logoColor=white)                                                                                                    |
| **Database** | ![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white) ![Mongoose](https://img.shields.io/badge/-Mongoose-880000?style=flat-square)                                                                                                                                                   |
| **Authentication**| ![JWT](https://img.shields.io/badge/-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white) ![Bcrypt](https://img.shields.io/badge/-Bcrypt-3178C6?style=flat-square)                                                                                                                                                              |
| **Deployment** | ![Vercel](https://img.shields.io/badge/-Vercel-000000?style=flat-square&logo=vercel&logoColor=white) (Frontend) / ![Render](https://img.shields.io/badge/-Render-46E3B7?style=flat-square&logo=render&logoColor=white) (Backend)                                                                                                                |

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or later)
- npm
- MongoDB (a local instance or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/Fizzfreshers/TaskFlow.git](https://github.com/Fizzfreshers/TaskFlow.git)
    cd TaskFlow
    ```

2.  **Install Backend Dependencies:**
    ```sh
    cd server
    npm install
    ```

3.  **Install Frontend Dependencies:**
    ```sh
    cd ../client
    npm install
    ```

### Configuration

1.  **Backend Environment Variables:**
    - In the `server` directory, create a `.env` file.
    - Add the following variables, replacing the placeholder values:
      ```env
      MONGO_URI=your_mongodb_connection_string
      JWT_SECRET=your_super_secret_key_for_jwt
      PORT=5000
      ```

2.  **Frontend:**
    - The frontend is already configured to connect to the backend on port 5000 for local development. No changes are needed.

### Running the Application

1.  **Start the Backend Server:**
    - From the `server` directory, run:
      ```sh
      npm start
      ```
    - The server will be running on `http://localhost:5000`.

2.  **Start the Frontend Application:**
    - In a new terminal, from the `client` directory, run:
      ```sh
      npm start
      ```
    - The application will open in your browser at `http://localhost:3000`.

---

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.
