import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Option {
  id: number;
  label: string;
  votes: number;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode; // Add this line to accept children
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose}>Close</button>
        {children} {/* Render children */}
      </div>
    </div>
  );
};

export default Modal;
