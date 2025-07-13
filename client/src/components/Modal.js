import React from 'react';
import './Modal.css'; // We'll create this CSS file next

const Modal = ({ children, onClose }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose}>×</button>
                {children}
            </div>
        </div>
    );
};

export default Modal;