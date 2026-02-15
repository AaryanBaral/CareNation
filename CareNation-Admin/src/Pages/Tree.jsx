// src/components/Tree.jsx
import React, { useEffect, useRef, useState } from "react";
import "../styles/TreeListing.css";

export default function Tree({ rootNode, onNodeClick, onUpdateParent }) {
  const containerRef = useRef(null);
  const [lines, setLines] = useState([]);

  // ---- draw connectors for ONLY 3 levels (root -> children -> grandchildren) ----
  useEffect(() => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const nodeElements = containerRef.current.querySelectorAll(".tree-node");
    const nodeMap = {};

    // Map each node's position (within container)
    nodeElements.forEach((el) => {
      const id = el.getAttribute("data-id");
      if (!id) return;
      const rect = el.getBoundingClientRect();
      nodeMap[id] = {
        centerX: rect.left - containerRect.left + rect.width / 2,
        topY: rect.top - containerRect.top,
        bottomY: rect.top - containerRect.top + rect.height,
      };
    });

    const newLines = [];

    // Traverse but stop at depth 2 (root=0, children=1, grandchildren=2)
    const traverse = (node, depth = 0) => {
      if (!node || depth >= 2) return; // no lines beyond grandchildren

      const kids = (node.children || []);
      if (kids.length === 0) return;

      const parent = nodeMap[node.id];
      if (!parent) return;

      const childCenters = kids
        .map((child) => nodeMap[child.id]?.centerX)
        .filter((c) => c !== undefined);

      if (childCenters.length > 0) {
        const minX = Math.min(...childCenters);
        const maxX = Math.max(...childCenters);
        const ySplit = parent.bottomY + 20;

        // vertical line from parent to horizontal split
        newLines.push({
          x1: parent.centerX,
          y1: parent.bottomY,
          x2: parent.centerX,
          y2: ySplit,
        });

        // horizontal split
        newLines.push({
          x1: minX,
          y1: ySplit,
          x2: maxX,
          y2: ySplit,
        });

        // vertical lines from split to each child
        kids.forEach((child) => {
          const c = nodeMap[child.id];
          if (c) {
            newLines.push({
              x1: c.centerX,
              y1: ySplit,
              x2: c.centerX,
              y2: c.topY,
            });
          }
        });
      }

      // Go one more level down (at most to grandchildren)
      kids.forEach((child) => traverse(child, depth + 1));
    };

    traverse(rootNode, 0);
    setLines(newLines);
  }, [rootNode]);

  // ---- rendering: ONLY 3 levels (root, children, grandchildren) ----
  const renderNode = (node, isRoot = false) => (
    <div
      key={node.id}
      className={`tree-node ${isRoot ? "root" : ""}`}
      data-id={node.id}
      onClick={() => onNodeClick(node)}
    >
      <div className="node-header">
        <div className="node-name">{node.name}</div>
        <div className="node-id">{node.id}</div>
      </div>

      <div className="node-wallets">
        <div className="wallet-item">
          <span className="wallet-label">Left Sales:</span>
          <span className="wallet-amount">{node.leftWallet}</span>
        </div>
        <div className="wallet-item">
          <span className="wallet-label">Right Sales:</span>
          <span className="wallet-amount">{node.rightWallet}</span>
        </div>
      </div>

      <button
        className="update-parent-btn"
        onClick={(e) => {
          e.stopPropagation();
          onUpdateParent(node);
        }}
      >
        Update Parent
      </button>
    </div>
  );

  // depth: 0=root, 1=children, 2=grandchildren; stop rendering beyond 2
  const renderTree = (node, depth = 0, isRoot = false) => {
    if (!node) return null;

    const showChildren = depth < 2; // only render down to grandchildren

    return (
      <div className="tree-node-wrapper" key={`${node.id}-${depth}`}>
        {renderNode(node, isRoot)}
        {showChildren && node.children && node.children.length > 0 && (
          <div className="tree-children">
            {node.children.map((child) =>
              renderTree(child, depth + 1, false)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="tree-wrapper"
      ref={containerRef}
      style={{ position: "relative" }}
    >
      {/* SVG connectors */}
      <svg
        className="tree-connections"
        width="100%"
        height="100%"
        style={{ position: "absolute", top: 0, left: 0, zIndex: 0, pointerEvents: "none" }}
      >
        {lines.map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#555"
            strokeWidth="2"
          />
        ))}
      </svg>

      {/* root + 2 levels only */}
      {renderTree(rootNode, 0, true)}
    </div>
  );
}
