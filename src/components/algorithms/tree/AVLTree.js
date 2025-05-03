import React, { useState, useRef, useEffect } from "react";

// Node structure for AVL
function createNode(value, left = null, right = null, height = 1) {
    return { value, left, right, height };
}

function getHeight(node) {
    return node ? node.height : 0;
}

function getBalance(node) {
    return node ? getHeight(node.left) - getHeight(node.right) : 0;
}

function deepClone(node) {
    if (!node) return null;
    return {
        value: node.value,
        left: deepClone(node.left),
        right: deepClone(node.right),
        height: node.height,
    };
}

// Right rotate
function rightRotate(y) {
    const x = y.left;
    const T2 = x.right;
    const newY = { ...y, left: T2 };
    const newX = { ...x, right: newY };
    newY.height = Math.max(getHeight(newY.left), getHeight(newY.right)) + 1;
    newX.height = Math.max(getHeight(newX.left), getHeight(newX.right)) + 1;
    return newX;
}

// Left rotate
function leftRotate(x) {
    const y = x.right;
    const T2 = y.left;
    const newX = { ...x, right: T2 };
    const newY = { ...y, left: newX };
    newX.height = Math.max(getHeight(newX.left), getHeight(newX.right)) + 1;
    newY.height = Math.max(getHeight(newY.left), getHeight(newY.right)) + 1;
    return newY;
}

// Insert value into AVL, record steps
function insertAVL(node, value, steps, highlightPath = [], rotationNodes = []) {
    if (!node) {
        const newNode = createNode(value);
        steps.push({
            tree: deepClone(newNode),
            highlight: [value],
            inserted: value,
            rotationNodes: [],
            action: `Insert ${value}`,
        });
        return newNode;
    }
    highlightPath = [...highlightPath, node.value];
    let newNode;
    if (value < node.value) {
        newNode = { ...node, left: insertAVL(node.left, value, steps, highlightPath, rotationNodes) };
    } else if (value > node.value) {
        newNode = { ...node, right: insertAVL(node.right, value, steps, highlightPath, rotationNodes) };
    } else {
        // No duplicates
        steps.push({
            tree: deepClone(node),
            highlight: highlightPath,
            inserted: null,
            rotationNodes: [],
            action: `Duplicate ${value} ignored`,
        });
        return node;
    }

    newNode.height = 1 + Math.max(getHeight(newNode.left), getHeight(newNode.right));
    const balance = getBalance(newNode);

    // Left Left
    if (balance > 1 && value < newNode.left.value) {
        steps.push({
            tree: deepClone(newNode),
            highlight: highlightPath,
            inserted: value,
            rotationNodes: [newNode.value, newNode.left.value],
            action: `Right Rotate at ${newNode.value} (LL)`,
        });
        const rotated = rightRotate(newNode);
        steps.push({
            tree: deepClone(rotated),
            highlight: highlightPath,
            inserted: value,
            rotationNodes: [rotated.value],
            action: `After Right Rotate at ${newNode.value}`,
        });
        return rotated;
    }
    // Right Right
    if (balance < -1 && value > newNode.right.value) {
        steps.push({
            tree: deepClone(newNode),
            highlight: highlightPath,
            inserted: value,
            rotationNodes: [newNode.value, newNode.right.value],
            action: `Left Rotate at ${newNode.value} (RR)`,
        });
        const rotated = leftRotate(newNode);
        steps.push({
            tree: deepClone(rotated),
            highlight: highlightPath,
            inserted: value,
            rotationNodes: [rotated.value],
            action: `After Left Rotate at ${newNode.value}`,
        });
        return rotated;
    }
    // Left Right
    if (balance > 1 && value > newNode.left.value) {
        steps.push({
            tree: deepClone(newNode),
            highlight: highlightPath,
            inserted: value,
            rotationNodes: [newNode.value, newNode.left.value, newNode.left.right.value],
            action: `Left-Right Rotate at ${newNode.value} (LR)`,
        });
        newNode = { ...newNode, left: leftRotate(newNode.left) };
        const rotated = rightRotate(newNode);
        steps.push({
            tree: deepClone(rotated),
            highlight: highlightPath,
            inserted: value,
            rotationNodes: [rotated.value],
            action: `After Left-Right Rotate at ${newNode.value}`,
        });
        return rotated;
    }
    // Right Left
    if (balance < -1 && value < newNode.right.value) {
        steps.push({
            tree: deepClone(newNode),
            highlight: highlightPath,
            inserted: value,
            rotationNodes: [newNode.value, newNode.right.value, newNode.right.left.value],
            action: `Right-Left Rotate at ${newNode.value} (RL)`,
        });
        newNode = { ...newNode, right: rightRotate(newNode.right) };
        const rotated = leftRotate(newNode);
        steps.push({
            tree: deepClone(rotated),
            highlight: highlightPath,
            inserted: value,
            rotationNodes: [rotated.value],
            action: `After Right-Left Rotate at ${newNode.value}`,
        });
        return rotated;
    }

    steps.push({
        tree: deepClone(newNode),
        highlight: highlightPath,
        inserted: value,
        rotationNodes: [],
        action: `Inserted ${value}`,
    });
    return newNode;
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

function Legend() {
    return (
        <div style={{ display: "flex", gap: 16, margin: "16px 0", flexWrap: "wrap" }}>
            <LegendItem color="#ffb703" label="Path Traversed" />
            <LegendItem color="#8bc34a" label="Inserted Node" />
            <LegendItem color="#e76f51" label="Rotation Node(s)" />
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

export default function AVLTreeVisualizer() {
    const [values, setValues] = useState(getRandomValues(6));
    const [customInput, setCustomInput] = useState("");
    const [step, setStep] = useState(0);
    const [steps, setSteps] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [inputError, setInputError] = useState("");

    // Build AVL and record steps
    useEffect(() => {
        let root = null;
        let allSteps = [];
        for (let i = 0; i < values.length; i++) {
            root = insertAVL(root, values[i], allSteps, []);
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
    const currentStep = steps[step - 1] || { tree: null, highlight: [], inserted: null, rotationNodes: [], action: "" };
    const { nodes, edges } = getTreeLayout(currentStep.tree);

    return (
        <div className="visualizer-fullscreen">
            <div className="visualizer-title">AVL Tree Construction (Step-by-Step)</div>
            <div className="visualizer-desc">
                AVL Tree is a self-balancing BST. Watch how it balances itself after each insertion.
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
            <div style={{ width: 600, height: 320, margin: "0 auto", background: "none", position: "relative" }}>
                <svg width={600} height={320} style={{ position: "absolute", left: 0, top: 0 }}>
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
                    let color = "#a3cef1";
                    if (currentStep.rotationNodes && currentStep.rotationNodes.includes(node.value)) color = "#e76f51";
                    else if (currentStep.inserted === node.value) color = "#8bc34a";
                    else if (currentStep.highlight && currentStep.highlight.includes(node.value)) color = "#ffb703";
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
                                background: color,
                                border: "2px solid #4a4e69",
                                color: "#22223b",
                                fontWeight: "bold",
                                fontSize: "1.1rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "left 0.6s, top 0.6s, background 0.3s"
                            }}
                        >
                            {node.value}
                        </div>
                    );
                })}
            </div>
            <div style={{ margin: "18px 0", fontWeight: "bold", fontSize: "1.1rem", color: "#1976d2" }}>
                {step === 0
                    ? "Start inserting values to build the AVL tree."
                    : step < steps.length
                        ? currentStep.action
                        : "AVL tree construction complete!"}
            </div>
            <div>
                <h4 style={{ color: "#4a4e69", marginTop: 32, marginBottom: 8 }}>AVL Insertion (JavaScript)</h4>
                <pre className="visualizer-code">
{`function insertAVL(node, value) {
  // Standard BST insert, then update height and balance
  // Perform rotations if needed
}`}
        </pre>
            </div>
        </div>
    );
}