import React, { useState, useCallback, useEffect } from "react";
import "../styles/TreeListing.css";
import Modal from "./Modal";
import Tree from "./Tree";
import baseApi from "../Components/Constants/baseApi"; // Adjust path as needed

function normalizeNode(node) {
  if (!node || typeof node !== "object") return null;
  const children = Array.isArray(node.children) ? node.children : [];
  return { ...node, children: children.map(normalizeNode) };
}

class TreeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("Tree error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="tree-error">
          <h3>Couldn’t render the tree.</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>{String(this.state.error)}</pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="btn btn-secondary"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function TreeListing() {
  const [treeData, setTreeData] = useState(null);
  const [currentRoot, setCurrentRoot] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const fetchTree = useCallback(async () => {
    setLoading(true);
    setErrMsg("");
    let isMounted = true;
    try {
      const res = await baseApi.get("distributor/tree"); // ✅ your endpoint
      if (!isMounted) return;

      const normalized = normalizeNode(res.data);
      setTreeData(normalized);
      setCurrentRoot(normalized); // start at root
    } catch (err) {
      console.error("Error fetching tree:", err);
      setErrMsg("Failed to load tree. Please try again.");
    } finally {
      if (isMounted) setLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // initial load
    fetchTree();
  }, [fetchTree]);

  const findNodeById = useCallback((node, id) => {
    if (!node) return null;
    if (node.id === id) return node;
    for (const child of node.children || []) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
    return null;
  }, []);

  const handleNodeClick = useCallback(
    (node) => {
      if (!treeData || !node) return;
      const foundNode = findNodeById(treeData, node.id);
      if (foundNode) setCurrentRoot(foundNode);
    },
    [treeData, findNodeById]
  );

  const handleUpdateParent = useCallback((node) => {
    setSelectedNode(node);
    setModalOpen(true);
  }, []);

  const handleParentUpdate = useCallback((nodeId, newParentId) => {
    // TODO: call your API to move node under new parent, then refresh:
    // await baseApi.post("distributor/tree/move", { nodeId, newParentId });
    alert(`Demo: Would move node ${nodeId} to parent ${newParentId}`);
    // await fetchTree();
  }, [/* fetchTree */]);

  const handleResetToRoot = () => setCurrentRoot(treeData);

  const isAtOriginalRoot =
    currentRoot && treeData && currentRoot.id === treeData.id;

  return (
    <div className="tree">
      <header className="tree-header">
        <h1 className="tree-title">Binary Network Marketing Tree</h1>
        <p className="tree-subtitle">Interactive network visualization</p>

        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          {!isAtOriginalRoot && (
            <button
              onClick={handleResetToRoot}
              className="btn btn-secondary"
              title="Back to original root"
            >
              ← Back to Root
            </button>
          )}
          <button
            onClick={fetchTree}
            className="btn btn-primary"
            disabled={loading}
            title="Refresh from server"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {loading && (
          <p className="tree-subtitle" style={{ marginTop: 8 }}>
            Loading tree…
          </p>
        )}
        {errMsg && (
          <p className="tree-error" style={{ marginTop: 8 }}>
            {errMsg}
          </p>
        )}
      </header>

      <main className="tree-container">
        {!loading && !treeData && !errMsg && (
          <div className="tree-empty">No tree data available.</div>
        )}

        {!loading && treeData && currentRoot && (
          <TreeErrorBoundary>
            <Tree
              rootNode={currentRoot}
              onNodeClick={handleNodeClick}
              onUpdateParent={handleUpdateParent}
              isRoot={currentRoot.id === treeData.id}
            />
          </TreeErrorBoundary>
        )}
      </main>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpdate={handleParentUpdate}
        currentNode={selectedNode}
      />
    </div>
  );
}

export default TreeListing;
