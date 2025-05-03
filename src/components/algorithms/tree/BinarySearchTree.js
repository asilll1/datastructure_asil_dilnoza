import React, { useState } from "react";

// Node structure for BST
function createNode(value, left = null, right = null) {
    return { value, left, right };
}

// Insert value into BST
function insertNode(root, value, path = []) {
    if (!root) {
        path.push({ value, side: "root" });
        return { node: createNode(value), path };
    }
    path.push({ value: root.value, side: value < root.value ? "left" : "right" });
    if (value < root.value) {
        const res = insertNode(root.left, value, path);
        return { node: { ...root, left: res.node }, path: res.path };
    }
    if (value > root.value) {
        const res = insertNode(root.right, value, path);
        return { node: { ...root, right: res.node }, path: res.path };
    }
    // No duplicates
    return { node: root, path };
}

// Traverse tree to get nodes with positions for SVG
function getTreeLayout(root, x = 300, y = 40, dx = 80, depth = 0, nodes = [], edges = []) {
    if (!root) return { nodes, edges };
    nodes.push({ value: root.value, x, y, depth });
    if (root.left) {
        edges.push({ from: { x, y }, to: { x: x - dx / (depth + 1), y: y + 60 } });
        getTreeLayout(root.left, x - dx / (depth + 1), y + 60, dx, depth + 1, nodes, edges);
    }
    if (root.right) {
        edges.push({ from: { x, y }, to: { x: x + dx / (depth + 1), y: y + 60 } });
        getTreeLayout(root.right, x + dx / (depth + 1), y + 60, dx, depth + 1, nodes, edges);
    }
    return { nodes, edges };
}

// Generate random unique values
function getRandomValues(size, min = 1, max = 99) {
    let values = [];
    while (values.length < size) {
        let v = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!values.includes(v)) values.push(v);
    }
    return values;
}

export default function BSTConstructionVisualizer() {
    const [values, setValues] = useState(getRandomValues(6));
    const [customInput, setCustomInput] = useState("");
    const [step, setStep] = useState(0);
    const [bst, setBST] = useState(null);
    const [paths, setPaths] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [inputError, setInputError] = useState("");

    // Build BST up to current step and record paths
    React.useEffect(() => {
        let root = null;
        let allPaths = [];
        for (let i = 0; i < step; i++) {
            const res = insertNode(root, values[i], []);
            root = res.node;
            allPaths.push(res.path.map(p => p.value));
        }
        setBST(root);
        setPaths(allPaths);
        // eslint-disable-next-line
    }, [step, values]);

    const handleRandom = () => {
        setValues(getRandomValues(6));
        setStep(0);
        setBST(null);
        setPaths([]);
        setCustomInput("");
        setInputError("");
    };

    const handleAutoPlay = async () => {
        setIsAnimating(true);
        for (let i = step + 1; i <= values.length; i++) {
            await new Promise((res) => setTimeout(res, 800));
            setStep(i);
        }
        setIsAnimating(false);
    };

    const handleCustomInput = (e) => {
        setCustomInput(e.target.value);
        setInputError("");
    };

    const handleSetSequence = () => {
        // Parse and validate input
        let arr = customInput
            .split(",")
            .map(s => Number(s.trim()))
            .filter((v, i, a) => !isNaN(v) && v !== "" && a.indexOf(v) === i);
        if (arr.length === 0) {
            setInputError("Please enter at least one valid number.");
            return;
        }
        setValues(arr);
        setStep(0);
        setBST(null);
        setPaths([]);
        setInputError("");
    };

    // Layout for SVG
    const { nodes, edges } = getTreeLayout(bst);

    // Highlight path for current insertion
    const highlightPath = step > 0 ? paths[step - 1] : [];

    return (
        <div className="visualizer-fullscreen">
            <div className="visualizer-title">BST Construction (Step-by-Step)</div>
            <div className="visualizer-desc">
                Watch how a Binary Search Tree is built by inserting values one by one.
            </div>
            <div style={{ margin: "16px 0", fontWeight: 500 }}>
                Values to insert:{" "}
                {values.map((v, i) => (
                    <span
                        key={i}
                        style={{
                            color: i < step ? "#8bc34a" : i === step ? "#ffb703" : "#4a4e69",
                            fontWeight: i === step ? "bold" : "normal",
                            fontSize: i === step ? "1.2em" : "1em",
                            marginRight: 8
                        }}
                    >
            {v}
          </span>
                ))}
            </div>
            <div className="visualizer-controls" style={{ flexWrap: "wrap", gap: 8 }}>
                <button
                    className="visualizer-btn"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0 || isAnimating}
                >
                    Previous
                </button>
                <button
                    className="visualizer-btn"
                    onClick={() => setStep((s) => Math.min(values.length, s + 1))}
                    disabled={step === values.length || isAnimating}
                >
                    Next
                </button>
                <button
                    className="visualizer-btn"
                    onClick={handleAutoPlay}
                    disabled={isAnimating || step === values.length}
                >
                    Auto Play
                </button>
                <button className="visualizer-btn" onClick={handleRandom} disabled={isAnimating}>
                    Randomize
                </button>
                <input
                    type="text"
                    placeholder="e.g. 5, 2, 8, 1, 3"
                    value={customInput}
                    onChange={handleCustomInput}
                    style={{
                        width: 180,
                        borderRadius: 4,
                        border: "1px solid #bfc0c0",
                        padding: "4px 8px",
                        fontSize: "1rem",
                        marginLeft: 8
                    }}
                    disabled={isAnimating}
                />
                <button
                    className="visualizer-btn"
                    onClick={handleSetSequence}
                    disabled={isAnimating}
                >
                    Set Sequence
                </button>
            </div>
            {inputError && (
                <div style={{ color: "#d32f2f", fontWeight: "bold", margin: "8px 0" }}>
                    {inputError}
                </div>
            )}
            <div style={{ width: 600, height: 320, margin: "0 auto", background: "none" }}>
                <svg width={600} height={320}>
                    {/* Edges */}
                    {edges.map((edge, i) => (
                        <line
                            key={i}
                            x1={edge.from.x}
                            y1={edge.from.y}
                            x2={edge.to.x}
                            y2={edge.to.y}
                            stroke="#bfc0c0"
                            strokeWidth="2"
                        />
                    ))}
                    {/* Nodes */}
                    {nodes.map((node, i) => {
                        let color = "#a3cef1";
                        if (highlightPath && highlightPath.includes(node.value)) color = "#ffb703";
                        if (step > 0 && node.value === values[step - 1]) color = "#8bc34a";
                        return (
                            <g key={i}>
                                <circle
                                    cx={node.x}
                                    cy={node.y}
                                    r={20}
                                    fill={color}
                                    stroke="#4a4e69"
                                    strokeWidth="2"
                                />
                                <text
                                    x={node.x}
                                    y={node.y + 6}
                                    textAnchor="middle"
                                    fontWeight="bold"
                                    fontSize="1.1rem"
                                    fill="#22223b"
                                >
                                    {node.value}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
            <div style={{ margin: "18px 0", fontWeight: "bold", fontSize: "1.1rem", color: "#1976d2" }}>
                {step === 0
                    ? "Start inserting values to build the BST."
                    : step < values.length
                        ? `Inserting ${values[step - 1]}`
                        : "BST construction complete!"}
            </div>
            <div>
                <h4 style={{ color: "#4a4e69", marginTop: 32, marginBottom: 8 }}>BST Insertion (JavaScript)</h4>
                <pre className="visualizer-code">
{`function insertNode(root, value) {
  if (!root) return { value, left: null, right: null };
  if (value < root.value) root.left = insertNode(root.left, value);
  else if (value > root.value) root.right = insertNode(root.right, value);
  return root;
}`}
        </pre>
            </div>
        </div>
    );
}