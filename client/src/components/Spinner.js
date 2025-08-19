import React from 'react';
import './Spinner.css'; // We will create this new CSS file

/**
 * A flexible loading spinner component.
 * @param {object} props
 * @param {boolean} [props.fullscreen=false] - If true, the spinner covers the whole screen.
 * @param {string} [props.text] - Optional text to display below the spinner (only in fullscreen mode).
 */
const Spinner = ({ fullscreen, text }) => {
  // If fullscreen is true, wrap the spinner in a full-page container
  if (fullscreen) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        {text && <p className="spinner-text">{text}</p>}
      </div>
    );
  }

  // Otherwise, return just the inline spinner
  return <div className="spinner-inline"></div>;
};

export default Spinner;