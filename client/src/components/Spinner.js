import React from 'react';
import './Spinner.css';

const Spinner = ({ fullscreen, text }) => {
  if (fullscreen) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        {text && <p className="spinner-text">{text}</p>}
      </div>
    );
  }
  return <div className="spinner-inline"></div>;
};
export default Spinner;