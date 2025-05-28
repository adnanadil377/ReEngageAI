// ModeToggleButton.js
import React from 'react';
import './ModeToggleButton.css'; // Import the CSS

const ModeToggleButton = ({ isAiMode, onToggle, disabled = false }) => {
  const currentModeText = isAiMode ? "AI" : "Human";

  return (
    <div className="toggle-switch-container items-center">
      {/* Optional: Label visible on larger screens */}
      <span className="toggle-mode-label hidden sm:inline mr-2">
        {currentModeText}
      </span>
      <label
        htmlFor="mode-toggle-switch"
        className="toggle-switch"
        title={`Switch to ${isAiMode ? 'Human' : 'AI'} Mode`}
      >
        <input
          type="checkbox"
          id="mode-toggle-switch"
          checked={isAiMode}
          onChange={onToggle}
          disabled={disabled}
          className="sr-only" // Visually hide, but keep accessible
        />
        <span className="slider">
          <span className="icon-human" aria-hidden="true">🧑</span>
          <span className="icon-ai" aria-hidden="true">🤖</span>
        </span>
      </label>
    </div>
  );
};

export default ModeToggleButton;