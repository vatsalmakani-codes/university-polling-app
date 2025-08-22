import React, { useContext } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthContext } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Wrappers
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import AnimatedPage from './components/AnimatedPage';
import Spinner from './components/Spinner';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPortalPage from './pages/LoginPortalPage';
import StudentLoginPage from './pages/Auth/StudentLoginPage';
import FacultyLoginPage from './pages/Auth/FacultyLoginPage';
import AdminLoginPage from './pages/Auth/AdminLoginPage';
import StudentRegisterPage from './pages/Auth/StudentRegisterPage';
import FacultyRegisterPage from './pages/Auth/FacultyRegisterPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import PollDetail from './pages/PollDetail';
import HistoryPage from './pages/HistoryPage';
import AdminDashboard from './pages/AdminDashboard';
import CreatePollPage from './pages/CreatePollPage';
import LivePollPage from './pages/LivePollPage';

import './App.css';

function App() {
  const { isLoading } = useContext(AuthContext);
  const location = useLocation();

  if (isLoading) {
    return <Spinner fullscreen text="Loading University Polling System..." />;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Full Screen Routes */}
        <Route path="/" element={<AnimatedPage><LandingPage /></AnimatedPage>} />
        <Route path="/about" element={<AnimatedPage><AboutPage /></AnimatedPage>} />
        <Route path="/contact" element={<AnimatedPage><ContactPage /></AnimatedPage>} />
        <Route path="/login" element={<PublicRoute><AuthLayout><LoginPortalPage /></AuthLayout></PublicRoute>} />
        <Route path="/login/student" element={<PublicRoute><AuthLayout><StudentLoginPage /></AuthLayout></PublicRoute>} />
        <Route path="/login/faculty" element={<PublicRoute><AuthLayout><FacultyLoginPage /></AuthLayout></PublicRoute>} />
        <Route path="/login/admin" element={<PublicRoute><AuthLayout><AdminLoginPage /></AuthLayout></PublicRoute>} />
        <Route path="/register/student" element={<PublicRoute><AuthLayout><StudentRegisterPage /></AuthLayout></PublicRoute>} />
        <Route path="/register/faculty" element={<PublicRoute><AuthLayout><FacultyRegisterPage /></AuthLayout></PublicRoute>} />
        
        {/* Main App Routes with Dashboard Layout */}
        <Route path="/dashboard" element={<PrivateRoute><MainLayout><AnimatedPage><HomePage /></AnimatedPage></MainLayout></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><MainLayout><AnimatedPage><ProfilePage /></AnimatedPage></MainLayout></PrivateRoute>} />
        <Route path="/poll/:id" element={<PrivateRoute><MainLayout><AnimatedPage><PollDetail /></AnimatedPage></MainLayout></PrivateRoute>} />
        <Route path="/my-history" element={<PrivateRoute roles={['student', 'faculty']}><MainLayout><AnimatedPage><HistoryPage /></AnimatedPage></MainLayout></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute roles={['super-admin', 'sub-admin']}><MainLayout><AnimatedPage><AdminDashboard /></AnimatedPage></MainLayout></PrivateRoute>} />
        <Route path="/admin/create-poll" element={<PrivateRoute roles={['super-admin', 'sub-admin']}><MainLayout><AnimatedPage><CreatePollPage /></AnimatedPage></MainLayout></PrivateRoute>} />
        <Route path="/admin/polls/:id/live" element={<PrivateRoute roles={['super-admin']}><MainLayout><AnimatedPage><LivePollPage /></AnimatedPage></MainLayout></PrivateRoute>} />
      </Routes>
    </AnimatePresence>
  );
}
export default App;