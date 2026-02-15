import React from 'react';

const TreeNode = ({ node, isRoot, onNodeClick, onUpdateParent }) => {
  const handleNodeClick = (e) => {
    // Don't trigger node click if clicking the button
    if (e.target.tagName === 'BUTTON') {
      return;
    }
    onNodeClick(node);
  };

  const handleUpdateParent = (e) => {
    e.stopPropagation();
    onUpdateParent(node);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div 
      className={`tree-node ${isRoot ? 'root' : ''}`}
      data-node-id={node.id}
      onClick={handleNodeClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleNodeClick(e);
        }
      }}
    >
      <div className="node-header">
        <div className="node-name">{node.name}</div>
        <div className="node-email">{node.email}</div>
      </div>
      
      <div className="node-id">
        ID: {node.id}
      </div>
      
      <div className="node-wallets">
        <div className="wallet-item">
          <span className="wallet-label">Left Carryover:</span>
          <span className="wallet-amount">
            {formatCurrency(node.leftWallet)}
          </span>
        </div>
        <div className="wallet-item">
          <span className="wallet-label">Right Carryover:</span>
          <span className="wallet-amount">
            {formatCurrency(node.rightWallet)}
          </span>
        </div>
      </div>
      
      <button
        className="update-parent-btn"
        onClick={handleUpdateParent}
        type="button"
      >
        Update Parent
      </button>
    </div>
  );
};

export default TreeNode;