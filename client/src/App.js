import { AnimatePresence } from 'framer-motion';
import { useContext } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

// Import Context
import { AuthContext } from './context/AuthContext';

// --- NEW: Import Layouts ---
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';

// Import Core Wrapper Components
import AnimatedPage from './components/AnimatedPage';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import Spinner from './components/Spinner';

// Import All Page Components
// Public Pages
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LandingPage from './pages/LandingPage';

// Authentication Pages (assuming they are in /pages/Auth/)
import AdminLoginPage from './pages/Auth/AdminLoginPage';
import FacultyLoginPage from './pages/Auth/FacultyLoginPage';
import FacultyRegisterPage from './pages/Auth/FacultyRegisterPage';
import StudentLoginPage from './pages/Auth/StudentLoginPage';
import StudentRegisterPage from './pages/Auth/StudentRegisterPage';

// Private Pages (rendered within MainLayout)
import HistoryPage from './pages/HistoryPage';
import HomePage from './pages/HomePage'; // The user's dashboard
import PollDetail from './pages/PollDetail';
import ProfilePage from './pages/ProfilePage';

// Admin-Only Pages (rendered within MainLayout)
import AdminDashboard from './pages/AdminDashboard';
import CreatePollPage from './pages/CreatePollPage';
import LivePollPage from './pages/LivePollPage';

// Import Global Styles
import './App.css';
import 'react-datepicker/dist/react-datepicker.css';
import LoginPortalPage from './pages/LoginPortalPage';

function App() {
  const { isLoading } = useContext(AuthContext);
  const location = useLocation(); // Required for AnimatePresence to detect route changes

  // Display a full-screen loader while the app determines authentication status
  if (isLoading) {
    return <Spinner fullscreen text="Loading University Polling System..." />;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPage><LandingPage /></AnimatedPage>} />

        {/* Static pages, also full-screen */}
        <Route path="/about" element={<AnimatedPage><AboutPage /></AnimatedPage>} />
        <Route path="/contact" element={<AnimatedPage><ContactPage /></AnimatedPage>} />

        <Route path="/login" element={<PublicRoute><AnimatedPage><LoginPortalPage /></AnimatedPage></PublicRoute>} />
        {/* Role-Specific Login Routes (wrapped in PublicRoute & AuthLayout) */}
        <Route path="/login/student" element={<PublicRoute><AuthLayout><AnimatedPage><StudentLoginPage /></AnimatedPage></AuthLayout></PublicRoute>} />
        <Route path="/login/faculty" element={<PublicRoute><AuthLayout><AnimatedPage><FacultyLoginPage /></AnimatedPage></AuthLayout></PublicRoute>} />
        <Route path="/login/admin" element={<PublicRoute><AuthLayout><AnimatedPage><AdminLoginPage /></AnimatedPage></AuthLayout></PublicRoute>} />

        {/* Role-Specific Register Routes */}
        <Route path="/register/student" element={<PublicRoute><AuthLayout><AnimatedPage><StudentRegisterPage /></AnimatedPage></AuthLayout></PublicRoute>} />
        <Route path="/register/faculty" element={<PublicRoute><AuthLayout><AnimatedPage><FacultyRegisterPage /></AnimatedPage></AuthLayout></PublicRoute>} />

        {/* Main dashboard for authenticated users */}
        <Route path="/dashboard" element={<PrivateRoute><MainLayout><AnimatedPage><HomePage /></AnimatedPage></MainLayout></PrivateRoute>} />

        {/* User Profile Page */}
        <Route path="/profile" element={<PrivateRoute><MainLayout><AnimatedPage><ProfilePage /></AnimatedPage></MainLayout></PrivateRoute>} />

        {/* View a single poll */}
        <Route path="/poll/:id" element={<PrivateRoute><MainLayout><AnimatedPage><PollDetail /></AnimatedPage></MainLayout></PrivateRoute>} />

        {/* Role-Restricted Route for Students */}
        <Route path="/my-history" element={<PrivateRoute roles={['student']}><MainLayout><AnimatedPage><HistoryPage /></AnimatedPage></MainLayout></PrivateRoute>} />

        {/* Admin-Only Routes */}
        <Route path="/admin" element={<PrivateRoute roles={['admin']}><MainLayout><AnimatedPage><AdminDashboard /></AnimatedPage></MainLayout></PrivateRoute>} />
        <Route path="/admin/create-poll" element={<PrivateRoute roles={['admin']}><MainLayout><AnimatedPage><CreatePollPage /></AnimatedPage></MainLayout></PrivateRoute>} />
        <Route path="/admin/polls/:id/live" element={<PrivateRoute roles={['admin']}><MainLayout><AnimatedPage><LivePollPage /></AnimatedPage></MainLayout></PrivateRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;