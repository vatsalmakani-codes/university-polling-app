import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserShield, FaUsers, FaLock, FaBroadcastTower } from 'react-icons/fa';
import './StaticPage.css'; // Uses the shared CSS file for static pages

// Array to make rendering principles cleaner and more maintainable
const principles = [
  {
    icon: <FaUserShield />,
    title: 'Admin-Controlled Integrity',
    text: 'All polls are created and managed by university administrators to ensure official relevance, prevent misuse, and maintain a high standard of quality.',
  },
  {
    icon: <FaUsers />,
    title: 'Targeted & Relevant Participation',
    text: 'Polls can be targeted specifically to students, faculty, or the entire university community, ensuring feedback is always gathered from the right audience.',
  },
  {
    icon: <FaLock />,
    title: 'Secure & Confidential',
    text: 'Each user can only vote once per poll. Results are kept confidential and are only published after being officially declared by an administrator.',
  },
  {
    icon: <FaBroadcastTower />,
    title: 'Real-time Administrative Insights',
    text: 'Administrators have access to a secure, live dashboard to monitor poll engagement and voter turnout as it happens, ensuring a transparent process.',
  },
];

const AboutPage = () => {
  return (
    <div className="static-page-wrapper">
      {/* --- A simple, clean navbar for static pages --- */}
      <nav className="static-page-nav">
        <Link to="/" className="static-logo">📊 PollingSys</Link>
        <Link to="/login" className="btn-nav-primary">Login / Register</Link>
      </nav>

      {/* --- Page Hero Section --- */}
      <div className="page-hero-static">
        <h1>About PollingSys</h1>
        <p>Empowering Voices, Shaping the Future of Our University.</p>
      </div>

      {/* --- Main Content Area --- */}
      <div className="static-page-content">
        <div className="static-card">
          <h2>Our Vision</h2>
          <p>
            We believe that a connected campus is a stronger campus. By giving every member of the university community a secure and official platform to share their voice, we aim to foster a more collaborative, transparent, and responsive environment. This system is designed to be the central hub for official university-wide polls, from academic feedback to important campus life initiatives.
          </p>
        </div>

        <div className="static-card">
          <h2>Our Key Principles</h2>
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
          <p>Your voice is essential to our community. Log in or register to make an impact on the decisions that shape your university experience.</p>
          <Link to="/login" className="btn-cta-primary">Get Started</Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;