import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserShield, FaUsers, FaLock, FaBroadcastTower } from 'react-icons/fa';
import './StaticPage.css'; // The shared CSS file

// Array to make rendering principles cleaner
const principles = [
  {
    icon: <FaUserShield />,
    title: 'Admin-Controlled',
    text: 'All polls are created and managed by university administrators to ensure relevance and prevent misuse.',
  },
  {
    icon: <FaUsers />,
    title: 'Role-Based Participation',
    text: 'Polls can be targeted specifically to students, faculty, or the entire university community.',
  },
  {
    icon: <FaLock />,
    title: 'Data Integrity',
    text: 'Each user can only vote once per poll, and results are only published after being officially declared by an admin.',
  },
  {
    icon: <FaBroadcastTower />,
    title: 'Real-time Insights',
    text: 'Administrators have access to a live dashboard to monitor poll engagement as it happens.',
  },
];

const AboutPage = () => {
  return (
    <div className="static-page-wrapper">
      <div className="page-hero-static">
        <h1>About PollingSys</h1>
        <p>Empowering Voices, Shaping the Future of Our University.</p>
      </div>

      <div className="static-page-content">
        <div className="static-card">
          <h2>Our Vision</h2>
          <p>
            We believe that a connected campus is a stronger campus. By giving every member a voice, we aim to foster a more collaborative and responsive university environment. This system is designed to be the central hub for official university-wide polls, from academic feedback to campus life initiatives.
          </p>
        </div>

        <div className="static-card">
          <h2>Key Principles</h2>
          <div className="principles-grid">
            {principles.map((principle, index) => (
              <div className="principle-item" key={index}>
                <div className="principle-icon">{principle.icon}</div>
                <div className="principle-text">
                  <h3>{principle.title}</h3>
                  <p>{principle.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="static-card cta-card">
          <h2>Ready to Participate?</h2>
          <p>Your voice is essential to our community. Log in or register to make an impact.</p>
          <Link to="/login" className="btn-cta-primary">Get Started</Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;