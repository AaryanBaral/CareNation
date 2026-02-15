import React, { useState } from 'react';

const Modal = ({ isOpen, onClose, onUpdate, currentNode }) => {
  const [newParentId, setNewParentId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newParentId.trim()) {
      onUpdate(currentNode.id, newParentId.trim());
      setNewParentId('');
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Update Parent</h2>
          <p className="modal-subtitle">
            Moving: <strong>{currentNode?.name}</strong> ({currentNode?.id})
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="parentId" className="form-label">
              New Parent ID:
            </label>
            <input
              type="text"
              id="parentId"
              value={newParentId}
              onChange={(e) => setNewParentId(e.target.value)}
              className="form-input"
              placeholder="Enter parent node ID..."
              autoFocus
            />
          </div>
        </form>
        
        <div className="modal-actions">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={!newParentId.trim()}
          >
            Update Parent
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;