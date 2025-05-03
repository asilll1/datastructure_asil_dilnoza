import React, { useState, useEffect } from "react";

// Red-Black Tree Node
function createNode(value, color = "red", left = null, right = null, parent = null) {
    return { value, color, left, right, parent };
}

// Helper to deep clone a tree (ignoring parent pointers for visualization)
function deepClone(node) {
    if (!node) return null;
    return {
        value: node.value,
        color: node.color,
        left: deepClone(node.left),
        right: deepClone(node.right),
    };
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

// Traverse tree to get nodes with positions for SVG
function getTreeLayout(root, x = 300, y = 40, dx = 120, depth = 0, nodes = [], edges = []) {
    if (!root) return { nodes, edges };
    nodes.push({ value: root.value, x, y, depth, color: root.color });
    if (root.left) {
        edges.push({ from: { x, y }, to: { x: x - dx / (depth + 1), y: y + 80 } });
        getTreeLayout(root.left, x - dx / (depth + 1), y + 80, dx, depth + 1, nodes, edges);
    }
    if (root.right) {
        edges.push({ from: { x, y }, to: { x: x + dx / (depth + 1), y: y + 80 } });
        getTreeLayout(root.right, x + dx / (depth + 1), y + 80, dx, depth + 1, nodes, edges);
    }
    return { nodes, edges };
}

// Red-Black Tree Insertion (step-by-step, simplified for visualization)
function insertRBT(root, value, steps) {
    // Standard BST insert, then fixup
    let path = [];
    let inserted = null;
    function bstInsert(node, parent = null) {
        if (!node) {
            inserted = createNode(value, "red", null, null, parent);
            return inserted;
        }
        path.push(node.value);
        if (value < node.value) {
            node.left = bstInsert(node.left, node);
        } else if (value > node.value) {
            node.right = bstInsert(node.right, node);
        }
        return node;
    }
    root = bstInsert(root);

    // Fixup (simplified, not all cases for brevity)
    function fixup(node) {
        while (node !== root && node.parent && node.parent.color === "red") {
            let parent = node.parent;
            let grandparent = parent.parent;
            if (!grandparent) break;
            let uncle = grandparent.left === parent ? grandparent.right : grandparent.left;
            // Case 1: Uncle is red
            if (uncle && uncle.color === "red") {
                parent.color = "black";
                uncle.color = "black";
                grandparent.color = "red";
                node = grandparent;
                steps.push({
                    tree: deepClone(root),
                    highlight: [node.value, parent.value, uncle.value],
                    inserted: value,
                    action: "Recoloring (Uncle Red)",
                    path: [...path, node.value]
                });
            } else {
                // Case 2/3: Uncle is black or null
                if (parent === grandparent.left) {
                    if (node === parent.right) {
                        // Left-Right
                        node = parent;
                        leftRotateRBT(node, root);
                        steps.push({
                            tree: deepClone(root),
                            highlight: [node.value, parent.value, grandparent.value],
                            inserted: value,
                            action: "Left Rotate (LR)",
                            path: [...path, node.value]
                        });
                    }
                    // Left-Left
                    parent.color = "black";
                    grandparent.color = "red";
                    rightRotateRBT(grandparent, root);
                    steps.push({
                        tree: deepClone(root),
                        highlight: [parent.value, grandparent.value],
                        inserted: value,
                        action: "Right Rotate (LL)",
                        path: [...path, parent.value, grandparent.value]
                    });
                } else {
                    if (node === parent.left) {
                        // Right-Left
                        node = parent;
                        rightRotateRBT(node, root);
                        steps.push({
                            tree: deepClone(root),
                            highlight: [node.value, parent.value, grandparent.value],
                            inserted: value,
                            action: "Right Rotate (RL)",
                            path: [...path, node.value]
                        });
                    }
                    // Right-Right
                    parent.color = "black";
                    grandparent.color = "red";
                    leftRotateRBT(grandparent, root);
                    steps.push({
                        tree: deepClone(root),
                        highlight: [parent.value, grandparent.value],
                        inserted: value,
                        action: "Left Rotate (RR)",
                        path: [...path, parent.value, grandparent.value]
                    });
                }
                break;
            }
        }
        root.color = "black";
        steps.push({
            tree: deepClone(root),
            highlight: [value],
            inserted: value,
            action: "Root is always black",
            path: [...path, value]
        });
    }

    // Helper rotations for RBT (update parent pointers)
    function leftRotateRBT(x, rootRef) {
        let y = x.right;
        x.right = y.left;
        if (y.left) y.left.parent = x;
        y.parent = x.parent;
        if (!x.parent) {
            rootRef = y;
        } else if (x === x.parent.left) {
            x.parent.left = y;
        } else {
            x.parent.right = y;
        }
        y.left = x;
        x.parent = y;
    }
    function rightRotateRBT(x, rootRef) {
        let y = x.left;
        x.left = y.right;
        if (y.right) y.right.parent = x;
        y.parent = x.parent;
        if (!x.parent) {
            rootRef = y;
        } else if (x === x.parent.right) {
            x.parent.right = y;
        } else {
            x.parent.left = y;
        }
        y.right = x;
        x.parent = y;
    }

    fixup(inserted);
    steps.push({
        tree: deepClone(root),
        highlight: [value],
        inserted: value,
        action: `Inserted ${value}`,
        path: [...path, value]
    });
    return root;
}

function Legend() {
    return (
        <div style={{ display: "flex", gap: 16, margin: "16px 0", flexWrap: "wrap" }}>
            <LegendItem color="#d32f2f" label="Red Node" />
            <LegendItem color="#22223b" label="Black Node" />
            <LegendItem color="#ffb703" label="Path/Highlight" />
            <LegendItem color="#8bc34a" label="Inserted Node" />
        </div>
    );
}

function LegendItem({ color, label }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
                width: 18, height: 18, borderRadius: "50%",
                background: color, border: "2px solid #4a4e69"
            }} />
            <span style={{ color: "#4a4e69", fontSize: 14 }}>{label}</span>
        </div>
    );
}

export default function RedBlackTreeVisualizer() {
    const [values, setValues] = useState(getRandomValues(6));
    const [customInput, setCustomInput] = useState("");
    const [step, setStep] = useState(0);
    const [steps, setSteps] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [inputError, setInputError] = useState("");

    // Build RBT and record steps
    useEffect(() => {
        let root = null;
        let allSteps = [];
        for (let i = 0; i < values.length; i++) {
            root = insertRBT(root, values[i], allSteps);
        }
        setSteps(allSteps);
        setStep(0);
        // eslint-disable-next-line
    }, [values]);

    const handleRandom = () => {
        setValues(getRandomValues(6));
        setCustomInput("");
        setInputError("");
    };

    const handleAutoPlay = async () => {
        setIsAnimating(true);
        for (let i = step + 1; i <= steps.length; i++) {
            await new Promise((res) => setTimeout(res, 900));
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
        setInputError("");
    };

    // Layout for SVG
    const currentStep = steps[step - 1] || { tree: null, highlight: [], inserted: null, action: "", path: [] };
    const { nodes, edges } = getTreeLayout(currentStep.tree);

    return (
        <div className="visualizer-fullscreen">
            <div className="visualizer-title">Red-Black Tree Construction (Step-by-Step)</div>
            <div className="visualizer-desc">
                Red-Black Tree is a self-balancing BST. Watch how it balances itself after each insertion.
            </div>
            <Legend />
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
                    onClick={() => setStep((s) => Math.min(steps.length, s + 1))}
                    disabled={step === steps.length || isAnimating}
                >
                    Next
                </button>
                <button
                    className="visualizer-btn"
                    onClick={handleAutoPlay}
                    disabled={isAnimating || step === steps.length}
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
            <div style={{ width: 600, height: 400, margin: "0 auto", background: "none", position: "relative" }}>
                <svg width={600} height={400} style={{ position: "absolute", left: 0, top: 0 }}>
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
                </svg>
                {/* Nodes as absolutely positioned divs for animation */}
                {nodes.map((node) => {
                    let background = node.color === "red" ? "#d32f2f" : "#22223b";
                    let border = "2px solid #4a4e69";
                    let textColor = "#fff";
                    if (currentStep.inserted === node.value) border = "4px solid #8bc34a";
                    else if (currentStep.highlight && currentStep.highlight.includes(node.value)) border = "4px solid #ffb703";
                    return (
                        <div
                            key={node.value}
                            style={{
                                position: "absolute",
                                left: node.x - 20,
                                top: node.y - 20,
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                background: background,
                                border: border,
                                color: textColor,
                                fontWeight: "bold",
                                fontSize: "1.1rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "left 0.6s, top 0.6s, background 0.3s, border 0.3s"
                            }}
                        >
                            {node.value}
                        </div>
                    );
                })}
            </div>
            <div style={{ margin: "18px 0", fontWeight: "bold", fontSize: "1.1rem", color: "#1976d2" }}>
                {step === 0
                    ? "Start inserting values to build the Red-Black tree."
                    : step < steps.length
                        ? currentStep.action
                        : "Red-Black tree construction complete!"}
            </div>
            <div>
                <h4 style={{ color: "#4a4e69", marginTop: 32, marginBottom: 8 }}>Red-Black Insertion (JavaScript)</h4>
                <pre className="visualizer-code">
{`// Standard BST insert, then fixup with rotations and recoloring
// Root is always black`}
        </pre>
            </div>
        </div>
    );
}