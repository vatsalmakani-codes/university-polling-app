# University Student Polling System

A full-stack MERN application designed for universities to conduct polls among students and faculty. The system features role-based access control, multiple poll types, and an advanced admin dashboard with data visualization and reporting.

## Key Features

### Three User Roles:
*   **Student:**
    *   View and vote on available polls (single or multiple choice).
    *   View poll results graphically after voting.
    *   View personal voting history.
    *   Manage their own profile (update name, change password, delete account).
*   **Faculty:**
    *   All student permissions.
    *   Create new polls (single or multiple choice).
    *   View results for polls they have created.
*   **Admin:**
    *   View a comprehensive dashboard with system statistics (total users, polls, votes).
    *   Visualize user role distribution with dynamic charts.
    *   Manage all users and polls (filter, search, and delete).
    *   Export dashboard reports as a PDF.

### Advanced Features:
*   **Multiple Poll Types:** Supports both "Single Choice" and "Multiple Choice" voting.
*   **Dynamic UI:** The interface intelligently shows voting status and role-specific actions.
*   **Secure Authentication:** Uses JSON Web Tokens (JWT) for secure user sessions.
*   **Data Visualization:** The admin dashboard and poll results pages use Chart.js for graphical representation.
*   **PDF Export:** Admins can export a full snapshot of the dashboard analytics.
*   **Fully Responsive Design:** A seamless experience on desktop, tablet, and mobile devices.

---

## Tech Stack

*   **Frontend:** React.js, React Router, Context API (for state management), Chart.js, Axios
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB with Mongoose
*   **Authentication:** JSON Web Tokens (JWT), bcrypt.js
*   **Deployment:** (e.g., Vercel for frontend, Render for backend)

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

*   Node.js (v14 or higher)
*   npm
*   MongoDB (local installation or a free cluster from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/vatsalmakani-codes/university-polling-app.git
    cd university-polling-app
    ```

2.  **Install all dependencies for both server and client:**
    (This single command will run `npm install` in both the `server` and `client` directories)
    ```bash
    npm run install-all
    ```

3.  **Set up Environment Variables:**
    *   Navigate to the `server` directory.
    *   Create a `.env` file by duplicating the `.env.example` file.
    *   Open your `.env` file and add your MongoDB connection string and a JWT secret.

    ```
    # server/.env
    MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
    JWT_SECRET=YOUR_SUPER_SECRET_KEY
    PORT=5000
    ```

4.  **How to Create an Admin User:**
    *   Register a new user through the application's register page.
    *   Connect to your MongoDB database using MongoDB Compass or the Mongo Shell.
    *   Navigate to the `university_polling` database and the `users` collection.
    *   Find the user you just created and change their `role` field from `"student"` to `"admin"`.

### Running the Application

Run the following command from the **root directory** to start both the backend and frontend servers concurrently:

```bash
npm run dev
```
*   The backend API will be running on `http://localhost:5000`
*   The frontend React app will open on `http://localhost:3000`

---