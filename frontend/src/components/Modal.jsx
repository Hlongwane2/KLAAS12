import React from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="modal" aria-hidden="false">
            <div className="modal-overlay" onClick={onClose}></div>
            <div className="modal-content" role="dialog" aria-modal="true">
                {title && <h2 id="modalTitle">{title}</h2>}
                {children}
            </div>
        </div>
    );
}
