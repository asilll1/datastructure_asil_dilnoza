import React, { useState, useEffect } from "react";

class Node {
    constructor(key) {
        this.key = key;
        this.left = null;
        this.right = null;
        this.height = 1;
    }
}

function height(node) {
    if (node === null) return 0;
    return node.height;
}

function getBalance(node) {
    if (node === null) return 0;
    return height(node.left) - height(node.right);
}

function rightRotate(y) {
    const x = y.left;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    y.height = Math.max(height(y.left), height(y.right)) + 1;
    x.height = Math.max(height(x.left), height(x.right)) + 1;

    return x;
}

function leftRotate(x) {
    const y = x.right;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    x.height = Math.max(height(x.left), height(x.right)) + 1;
    y.height = Math.max(height(y.left), height(y.right)) + 1;

    return y;
}

function minValueNode(node) {
    let current = node;
    while (current.left !== null) {
        current = current.left;
    }
    return current;
}

function insert(node, key, steps = []) {
    if (node === null) {
        const newNode = new Node(key);
        steps.push({
            tree: deepClone(newNode),
            action: `Insert ${key}`,
            highlight: [key],
            rotationNodes: []
        });
        return newNode;
    }

    if (key < node.key) {
        node.left = insert(node.left, key, steps);
    } else if (key > node.key) {
        node.right = insert(node.right, key, steps);
    } else {
        steps.push({
            tree: deepClone(node),
            action: `Duplicate key ${key} ignored`,
            highlight: [key],
            rotationNodes: []
        });
        return node;
    }

    node.height = Math.max(height(node.left), height(node.right)) + 1;
    const balance = getBalance(node);

    // Left Left Case
    if (balance > 1 && key < node.left.key) {
        steps.push({
            tree: deepClone(node),
            action: `Right Rotate at ${node.key} (LL)`,
            highlight: [node.key, node.left.key],
            rotationNodes: [node.key, node.left.key]
        });
        const rotated = rightRotate(node);
        steps.push({
            tree: deepClone(rotated),
            action: `After Right Rotate at ${node.key}`,
            highlight: [rotated.key],
            rotationNodes: [rotated.key]
        });
        return rotated;
    }

    // Right Right Case
    if (balance < -1 && key > node.right.key) {
        steps.push({
            tree: deepClone(node),
            action: `Left Rotate at ${node.key} (RR)`,
            highlight: [node.key, node.right.key],
            rotationNodes: [node.key, node.right.key]
        });
        const rotated = leftRotate(node);
        steps.push({
            tree: deepClone(rotated),
            action: `After Left Rotate at ${node.key}`,
            highlight: [rotated.key],
            rotationNodes: [rotated.key]
        });
        return rotated;
    }

    // Left Right Case
    if (balance > 1 && key > node.left.key) {
        steps.push({
            tree: deepClone(node),
            action: `Left-Right Rotate at ${node.key} (LR)`,
            highlight: [node.key, node.left.key, node.left.right.key],
            rotationNodes: [node.key, node.left.key, node.left.right.key]
        });
        node.left = leftRotate(node.left);
        const rotated = rightRotate(node);
        steps.push({
            tree: deepClone(rotated),
            action: `After Left-Right Rotate at ${node.key}`,
            highlight: [rotated.key],
            rotationNodes: [rotated.key]
        });
        return rotated;
    }

    // Right Left Case
    if (balance < -1 && key < node.right.key) {
        steps.push({
            tree: deepClone(node),
            action: `Right-Left Rotate at ${node.key} (RL)`,
            highlight: [node.key, node.right.key, node.right.left.key],
            rotationNodes: [node.key, node.right.key, node.right.left.key]
        });
        node.right = rightRotate(node.right);
        const rotated = leftRotate(node);
        steps.push({
            tree: deepClone(rotated),
            action: `After Right-Left Rotate at ${node.key}`,
            highlight: [rotated.key],
            rotationNodes: [rotated.key]
        });
        return rotated;
    }

    steps.push({
        tree: deepClone(node),
        action: `Inserted ${key}`,
        highlight: [key],
        rotationNodes: []
    });
    return node;
}

function deleteNode(root, key, steps = []) {
    if (root === null) {
        steps.push({
            tree: null,
            action: `Key ${key} not found`,
            highlight: [],
            rotationNodes: []
        });
        return root;
    }

    if (key < root.key) {
        root.left = deleteNode(root.left, key, steps);
    } else if (key > root.key) {
        root.right = deleteNode(root.right, key, steps);
    } else {
        steps.push({
            tree: deepClone(root),
            action: `Found node ${key} to delete`,
            highlight: [key],
            rotationNodes: [key]
        });

        if (root.left === null || root.right === null) {
            const temp = root.left ? root.left : root.right;
            if (temp === null) {
                root = null;
            } else {
                root = temp;
            }
            steps.push({
                tree: deepClone(root),
                action: `Deleted ${key} (single child)`,
                highlight: [],
                rotationNodes: []
            });
        } else {
            const temp = minValueNode(root.right);
            root.key = temp.key;
            steps.push({
                tree: deepClone(root),
                action: `Replaced ${key} with inorder successor ${temp.key}`,
                highlight: [root.key],
                rotationNodes: [root.key]
            });
            root.right = deleteNode(root.right, temp.key, steps);
        }
    }

    if (root === null) return root;

    root.height = Math.max(height(root.left), height(root.right)) + 1;
    const balance = getBalance(root);

    // Left Left Case
    if (balance > 1 && getBalance(root.left) >= 0) {
        steps.push({
            tree: deepClone(root),
            action: `Right Rotate at ${root.key} (LL)`,
            highlight: [root.key, root.left.key],
            rotationNodes: [root.key, root.left.key]
        });
        return rightRotate(root);
    }

    // Left Right Case
    if (balance > 1 && getBalance(root.left) < 0) {
        steps.push({
            tree: deepClone(root),
            action: `Left-Right Rotate at ${root.key} (LR)`,
            highlight: [root.key, root.left.key, root.left.right.key],
            rotationNodes: [root.key, root.left.key, root.left.right.key]
        });
        root.left = leftRotate(root.left);
        return rightRotate(root);
    }

    // Right Right Case
    if (balance < -1 && getBalance(root.right) <= 0) {
        steps.push({
            tree: deepClone(root),
            action: `Left Rotate at ${root.key} (RR)`,
            highlight: [root.key, root.right.key],
            rotationNodes: [root.key, root.right.key]
        });
        return leftRotate(root);
    }

    // Right Left Case
    if (balance < -1 && getBalance(root.right) > 0) {
        steps.push({
            tree: deepClone(root),
            action: `Right-Left Rotate at ${root.key} (RL)`,
            highlight: [root.key, root.right.key, root.right.left.key],
            rotationNodes: [root.key, root.right.key, root.right.left.key]
        });
        root.right = rightRotate(root.right);
        return leftRotate(root);
    }

    return root;
}

function deepClone(node) {
    if (!node) return null;
    return {
        key: node.key,
        left: deepClone(node.left),
        right: deepClone(node.right),
        height: node.height
    };
}

function getTreeLayout(root, x = 300, y = 40, dx = 80, depth = 0, nodes = [], edges = []) {
    if (!root) return { nodes, edges };
    
    // Calculate node position with better spacing
    const levelWidth = Math.pow(2, depth) * dx;
    const spacing = levelWidth / (Math.pow(2, depth + 1) - 1);
    
    nodes.push({ 
        key: root.key, 
        x, 
        y, 
        depth,
        left: root.left ? root.left.key : null,
        right: root.right ? root.right.key : null,
        height: root.height
    });

    if (root.left) {
        const leftX = x - spacing;
        edges.push({ 
            from: { x, y }, 
            to: { x: leftX, y: y + 60 },
            fromKey: root.key,
            toKey: root.left.key
        });
        getTreeLayout(root.left, leftX, y + 60, dx, depth + 1, nodes, edges);
    }
    if (root.right) {
        const rightX = x + spacing;
        edges.push({ 
            from: { x, y }, 
            to: { x: rightX, y: y + 60 },
            fromKey: root.key,
            toKey: root.right.key
        });
        getTreeLayout(root.right, rightX, y + 60, dx, depth + 1, nodes, edges);
    }
    return { nodes, edges };
}

function getRandomValues(size, min = 1, max = 99) {
    let values = [];
    while (values.length < size) {
        let v = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!values.includes(v)) values.push(v);
    }
    return values;
}

function Legend() {
    return (
        <div style={{ display: "flex", gap: 16, margin: "16px 0", flexWrap: "wrap" }}>
            <LegendItem color="#ffb703" label="Path Traversed" />
            <LegendItem color="#8bc34a" label="Current Operation" />
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
    const [treeSize, setTreeSize] = useState(6);
    const [values, setValues] = useState([]);
    const [customInput, setCustomInput] = useState("");
    const [deleteInput, setDeleteInput] = useState("");
    const [step, setStep] = useState(0);
    const [steps, setSteps] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [inputError, setInputError] = useState("");
    const [operation, setOperation] = useState("insert");
    const [prevNodes, setPrevNodes] = useState([]);
    const [prevEdges, setPrevEdges] = useState([]);
    const [treeStructure, setTreeStructure] = useState(null);
    const [activeNodes, setActiveNodes] = useState(new Set());
    const [activeEdges, setActiveEdges] = useState(new Set());

    useEffect(() => {
        if (treeSize > 0) {
            setValues(getRandomValues(treeSize));
        }
    }, [treeSize]);

    useEffect(() => {
        let root = null;
        let allSteps = [];
        
        if (operation === "insert") {
            for (let i = 0; i < values.length; i++) {
                root = insert(root, values[i], allSteps);
            }
        } else if (operation === "delete" && deleteInput) {
            // First build the tree
            for (let i = 0; i < values.length; i++) {
                root = insert(root, values[i], []);
            }
            // Then perform deletion
            root = deleteNode(root, parseInt(deleteInput), allSteps);
        }
        
        setSteps(allSteps);
        setStep(0);
    }, [values, operation, deleteInput]);

    useEffect(() => {
        if (steps.length > 0 && step > 0) {
            const currentStep = steps[step - 1];
            const { nodes, edges } = getTreeLayout(currentStep.tree);
            
            // Update tree structure
            setTreeStructure(currentStep.tree);

            // Update active nodes and edges
            const newActiveNodes = new Set();
            const newActiveEdges = new Set();

            // Add nodes involved in the current operation
            if (currentStep.highlight) {
                currentStep.highlight.forEach(key => newActiveNodes.add(key));
            }
            if (currentStep.rotationNodes) {
                currentStep.rotationNodes.forEach(key => newActiveNodes.add(key));
            }

            // Add edges connected to active nodes
            edges.forEach(edge => {
                if (newActiveNodes.has(edge.fromKey) || newActiveNodes.has(edge.toKey)) {
                    newActiveEdges.add(`${edge.fromKey}-${edge.toKey}`);
                }
            });

            setActiveNodes(newActiveNodes);
            setActiveEdges(newActiveEdges);
        }
    }, [steps, step]);

    const handleRandom = () => {
        setValues(getRandomValues(treeSize));
        setCustomInput("");
        setDeleteInput("");
        setInputError("");
        setOperation("insert");
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
        setOperation("insert");
    };

    const handleDelete = () => {
        const value = parseInt(deleteInput);
        if (isNaN(value)) {
            setInputError("Please enter a valid number to delete");
            return;
        }
        setOperation("delete");
        setInputError("");
    };

    const handleSizeChange = (e) => {
        const size = parseInt(e.target.value);
        if (size > 0 && size <= 20) {
            setTreeSize(size);
        }
    };

    const currentStep = steps[step - 1] || { tree: null, highlight: [], rotationNodes: [], action: "" };
    const { nodes, edges } = getTreeLayout(currentStep.tree);

    return (
        <div className="visualizer-fullscreen">
            <div className="visualizer-title">AVL Tree Operations</div>
            <div className="visualizer-desc">
                AVL Tree is a self-balancing BST. Watch how it balances itself after each operation.
            </div>
            <Legend />
            
            <div className="visualizer-controls" style={{ flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <label>Tree Size:</label>
                    <input
                        type="number"
                        min="1"
                        max="20"
                        value={treeSize}
                        onChange={handleSizeChange}
                        style={{
                            width: 60,
                            borderRadius: 4,
                            border: "1px solid #bfc0c0",
                            padding: "4px 8px",
                            fontSize: "1rem"
                        }}
                        disabled={isAnimating}
                    />
                </div>
                
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
                <button 
                    className="visualizer-btn" 
                    onClick={handleRandom} 
                    disabled={isAnimating}
                >
                    Randomize
                </button>
                
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
                            fontSize: "1rem"
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

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                        type="text"
                        placeholder="Value to delete"
                        value={deleteInput}
                        onChange={(e) => setDeleteInput(e.target.value)}
                        style={{
                            width: 120,
                            borderRadius: 4,
                            border: "1px solid #bfc0c0",
                            padding: "4px 8px",
                            fontSize: "1rem"
                        }}
                        disabled={isAnimating}
                    />
                    <button
                        className="visualizer-btn"
                        onClick={handleDelete}
                        disabled={isAnimating}
                    >
                        Delete
                    </button>
                </div>
            </div>

            {inputError && (
                <div style={{ color: "#d32f2f", fontWeight: "bold", margin: "8px 0" }}>
                    {inputError}
                </div>
            )}

            <div style={{ width: 600, height: 400, margin: "0 auto", background: "none", position: "relative" }}>
                <svg width={600} height={400} style={{ position: "absolute", left: 0, top: 0 }}>
                    {edges.map((edge, i) => {
                        const isActive = activeEdges.has(`${edge.fromKey}-${edge.toKey}`);
                        return (
                            <line
                                key={`${edge.fromKey}-${edge.toKey}`}
                                x1={edge.from.x}
                                y1={edge.from.y}
                                x2={edge.to.x}
                                y2={edge.to.y}
                                stroke={isActive ? "#4a4e69" : "#bfc0c0"}
                                strokeWidth={isActive ? "3" : "2"}
                                style={{
                                    transition: "all 0.3s ease-in-out"
                                }}
                            />
                        );
                    })}
                </svg>

                {nodes.map((node) => {
                    const isActive = activeNodes.has(node.key);
                    let color = isActive ? "#ffb703" : "#a3cef1";
                    
                    if (currentStep.rotationNodes && currentStep.rotationNodes.includes(node.key)) {
                        color = "#e76f51";
                    }

                    return (
                        <div
                            key={node.key}
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
                                transition: "all 0.3s ease-in-out",
                                transform: isActive ? "scale(1.1)" : "scale(1)",
                                boxShadow: isActive ? "0 0 10px rgba(0,0,0,0.2)" : "none"
                            }}
                        >
                            {node.key}
                            <div style={{
                                position: "absolute",
                                bottom: -15,
                                fontSize: "0.7rem",
                                color: "#666"
                            }}>
                                h:{node.height}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ margin: "18px 0", fontWeight: "bold", fontSize: "1.1rem", color: "#1976d2" }}>
                {step === 0
                    ? "Start inserting values to build the AVL tree."
                    : step < steps.length
                        ? currentStep.action
                        : "Operation complete!"}
            </div>

            <div style={{ margin: "16px 0" }}>
                <h4 style={{ color: "#4a4e69", marginBottom: 8 }}>Current Values:</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {values.map((v, i) => (
                        <span
                            key={i}
                            style={{
                                padding: "4px 8px",
                                background: "#f0f0f0",
                                borderRadius: 4,
                                fontSize: "0.9rem"
                            }}
                        >
                            {v}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}