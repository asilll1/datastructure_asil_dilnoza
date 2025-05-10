import React, { useState, useEffect } from "react";

const COLOR = {
    RED: "RED",
    BLACK: "BLACK"
};

class Node {
    constructor(val) {
        this.val = val;
        this.color = COLOR.RED;
        this.left = this.right = this.parent = null;
    }

    uncle() {
        if (!this.parent || !this.parent.parent) return null;
        return this.parent.isOnLeft() ? this.parent.parent.right : this.parent.parent.left;
    }

    isOnLeft() {
        return this === this.parent.left;
    }

    sibling() {
        if (!this.parent) return null;
        return this.isOnLeft() ? this.parent.right : this.parent.left;
    }

    moveDown(nParent) {
        if (this.parent) {
            if (this.isOnLeft()) this.parent.left = nParent;
            else this.parent.right = nParent;
        }
        nParent.parent = this.parent;
        this.parent = nParent;
    }

    hasRedChild() {
        return (this.left && this.left.color === COLOR.RED) || (this.right && this.right.color === COLOR.RED);
    }
}

class RBTree {
    constructor() {
        this.root = null;
    }

    leftRotate(x) {
        const y = x.right;
        x.right = y.left;
        if (y.left) y.left.parent = x;
        y.parent = x.parent;
        if (!x.parent) this.root = y;
        else if (x === x.parent.left) x.parent.left = y;
        else x.parent.right = y;
        y.left = x;
        x.parent = y;
    }

    rightRotate(x) {
        const y = x.left;
        x.left = y.right;
        if (y.right) y.right.parent = x;
        y.parent = x.parent;
        if (!x.parent) this.root = y;
        else if (x === x.parent.right) x.parent.right = y;
        else x.parent.left = y;
        y.right = x;
        x.parent = y;
    }

    swapColors(x1, x2) {
        const temp = x1.color;
        x1.color = x2.color;
        x2.color = temp;
    }

    swapValues(u, v) {
        const temp = u.val;
        u.val = v.val;
        v.val = temp;
    }

    fixRedRed(x, steps) {
        if (x === this.root) {
            x.color = COLOR.BLACK;
            steps.push({
                tree: this.deepClone(this.root),
                action: "Root is always black",
                highlight: [x.val]
            });
            return;
        }

        let parent = x.parent,
            grandparent = parent.parent,
            uncle = x.uncle();

        if (parent.color !== COLOR.BLACK) {
            if (uncle && uncle.color === COLOR.RED) {
                parent.color = COLOR.BLACK;
                uncle.color = COLOR.BLACK;
                grandparent.color = COLOR.RED;
                steps.push({
                    tree: this.deepClone(this.root),
                    action: "Recoloring (Uncle Red)",
                    highlight: [parent.val, uncle.val, grandparent.val]
                });
                this.fixRedRed(grandparent, steps);
            } else {
                if (parent.isOnLeft()) {
                    if (x.isOnLeft()) {
                        this.swapColors(parent, grandparent);
                        steps.push({
                            tree: this.deepClone(this.root),
                            action: "Right Rotate (LL)",
                            highlight: [parent.val, grandparent.val]
                        });
                    } else {
                        this.leftRotate(parent);
                        this.swapColors(x, grandparent);
                        steps.push({
                            tree: this.deepClone(this.root),
                            action: "Left-Right Rotate (LR)",
                            highlight: [x.val, parent.val, grandparent.val]
                        });
                    }
                    this.rightRotate(grandparent);
                } else {
                    if (x.isOnLeft()) {
                        this.rightRotate(parent);
                        this.swapColors(x, grandparent);
                        steps.push({
                            tree: this.deepClone(this.root),
                            action: "Right-Left Rotate (RL)",
                            highlight: [x.val, parent.val, grandparent.val]
                        });
                    } else {
                        this.swapColors(parent, grandparent);
                        steps.push({
                            tree: this.deepClone(this.root),
                            action: "Left Rotate (RR)",
                            highlight: [parent.val, grandparent.val]
                        });
                    }
                    this.leftRotate(grandparent);
                }
            }
        }
    }

    successor(x) {
        let temp = x;
        while (temp.left) temp = temp.left;
        return temp;
    }

    BSTreplace(x) {
        if (x.left && x.right) return this.successor(x.right);
        if (!x.left && !x.right) return null;
        return x.left || x.right;
    }

    deleteNode(v, steps) {
        const u = this.BSTreplace(v);
        const uvBlack = (!u || u.color === COLOR.BLACK) && (v.color === COLOR.BLACK);
        const parent = v.parent;

        if (!u) {
            if (v === this.root) {
                this.root = null;
            } else {
                if (uvBlack) {
                    this.fixDoubleBlack(v, steps);
                } else if (v.sibling()) {
                    v.sibling().color = COLOR.RED;
                }

                if (v.isOnLeft()) {
                    parent.left = null;
                } else {
                    parent.right = null;
                }
            }
            return;
        }

        if (!v.left || !v.right) {
            if (v === this.root) {
                v.val = u.val;
                v.left = v.right = null;
            } else {
                if (v.isOnLeft()) {
                    parent.left = u;
                } else {
                    parent.right = u;
                }
                u.parent = parent;
                if (uvBlack) {
                    this.fixDoubleBlack(u, steps);
                } else {
                    u.color = COLOR.BLACK;
                }
            }
            return;
        }

        this.swapValues(u, v);
        this.deleteNode(u, steps);
    }

    fixDoubleBlack(x, steps) {
        if (x === this.root) return;

        const sibling = x.sibling(),
            parent = x.parent;

        if (!sibling) {
            this.fixDoubleBlack(parent, steps);
        } else {
            if (sibling.color === COLOR.RED) {
                parent.color = COLOR.RED;
                sibling.color = COLOR.BLACK;
                if (sibling.isOnLeft()) {
                    this.rightRotate(parent);
                } else {
                    this.leftRotate(parent);
                }
                steps.push({
                    tree: this.deepClone(this.root),
                    action: "Sibling is red, rotating",
                    highlight: [sibling.val, parent.val]
                });
                this.fixDoubleBlack(x, steps);
            } else {
                if (sibling.hasRedChild()) {
                    if (sibling.left && sibling.left.color === COLOR.RED) {
                        if (sibling.isOnLeft()) {
                            sibling.left.color = sibling.color;
                            sibling.color = parent.color;
                            this.rightRotate(parent);
                        } else {
                            sibling.left.color = parent.color;
                            this.rightRotate(sibling);
                            this.leftRotate(parent);
                        }
                    } else {
                        if (sibling.isOnLeft()) {
                            sibling.right.color = parent.color;
                            this.leftRotate(sibling);
                            this.rightRotate(parent);
                        } else {
                            sibling.right.color = sibling.color;
                            sibling.color = parent.color;
                            this.leftRotate(parent);
                        }
                    }
                    parent.color = COLOR.BLACK;
                    steps.push({
                        tree: this.deepClone(this.root),
                        action: "Fixing double black with red child",
                        highlight: [sibling.val, parent.val]
                    });
                } else {
                    sibling.color = COLOR.RED;
                    if (parent.color === COLOR.BLACK) {
                        this.fixDoubleBlack(parent, steps);
                    } else {
                        parent.color = COLOR.BLACK;
                    }
                    steps.push({
                        tree: this.deepClone(this.root),
                        action: "Recoloring to fix double black",
                        highlight: [sibling.val, parent.val]
                    });
                }
            }
        }
    }

    search(n) {
        let temp = this.root;
        while (temp) {
            if (n < temp.val) {
                if (!temp.left) break;
                else temp = temp.left;
            } else if (n === temp.val) {
                break;
            } else {
                if (!temp.right) break;
                else temp = temp.right;
            }
        }
        return temp;
    }

    insert(n, steps) {
        let newNode = new Node(n);
        let y = null;
        let x = this.root;
        while (x) {
            y = x;
            if (n < x.val) x = x.left;
            else if (n > x.val) x = x.right;
            else {
                steps.push({
                    tree: this.deepClone(this.root),
                    action: `Value ${n} already exists`,
                    highlight: [n]
                });
                return;
            }
        }
        newNode.parent = y;
        if (!y) {
            this.root = newNode;
        } else if (n < y.val) {
            y.left = newNode;
        } else {
            y.right = newNode;
        }
        newNode.color = COLOR.RED;
        steps.push({
            tree: this.deepClone(this.root),
            action: `Inserted ${n} as red`,
            highlight: [n]
        });
        this.insertFixup(newNode, steps);
        this.root.color = COLOR.BLACK;
        steps.push({
            tree: this.deepClone(this.root),
            action: `Root is always black`,
            highlight: [this.root.val]
        });
    }

    insertFixup(z, steps) {
        while (z.parent && z.parent.color === COLOR.RED) {
            let parent = z.parent;
            let grandparent = parent.parent;
            if (!grandparent) break;
            if (parent === grandparent.left) {
                let uncle = grandparent.right;
                if (uncle && uncle.color === COLOR.RED) {
                    parent.color = COLOR.BLACK;
                    uncle.color = COLOR.BLACK;
                    grandparent.color = COLOR.RED;
                    steps.push({
                        tree: this.deepClone(this.root),
                        action: `Recolor parent (${parent.val}) and uncle (${uncle.val}) to black, grandparent (${grandparent.val}) to red`,
                        highlight: [parent.val, uncle.val, grandparent.val]
                    });
                    z = grandparent;
                } else {
                    if (z === parent.right) {
                        z = parent;
                        this.leftRotate(z);
                        steps.push({
                            tree: this.deepClone(this.root),
                            action: `Left Rotate at ${z.val} (LR case)`,
                            highlight: [z.val, z.parent.val]
                        });
                        parent = z.parent;
                        grandparent = parent.parent;
                    }
                    parent.color = COLOR.BLACK;
                    grandparent.color = COLOR.RED;
                    this.rightRotate(grandparent);
                    steps.push({
                        tree: this.deepClone(this.root),
                        action: `Right Rotate at ${grandparent.val} (LL case)`,
                        highlight: [parent.val, grandparent.val]
                    });
                }
            } else {
                let uncle = grandparent.left;
                if (uncle && uncle.color === COLOR.RED) {
                    parent.color = COLOR.BLACK;
                    uncle.color = COLOR.BLACK;
                    grandparent.color = COLOR.RED;
                    steps.push({
                        tree: this.deepClone(this.root),
                        action: `Recolor parent (${parent.val}) and uncle (${uncle.val}) to black, grandparent (${grandparent.val}) to red`,
                        highlight: [parent.val, uncle.val, grandparent.val]
                    });
                    z = grandparent;
                } else {
                    if (z === parent.left) {
                        z = parent;
                        this.rightRotate(z);
                        steps.push({
                            tree: this.deepClone(this.root),
                            action: `Right Rotate at ${z.val} (RL case)`,
                            highlight: [z.val, z.parent.val]
                        });
                        parent = z.parent;
                        grandparent = parent.parent;
                    }
                    parent.color = COLOR.BLACK;
                    grandparent.color = COLOR.RED;
                    this.leftRotate(grandparent);
                    steps.push({
                        tree: this.deepClone(this.root),
                        action: `Left Rotate at ${grandparent.val} (RR case)`,
                        highlight: [parent.val, grandparent.val]
                    });
                }
            }
        }
    }

    deleteByVal(n, steps) {
        if (!this.root) {
            steps.push({
                tree: null,
                action: "Tree is empty",
                highlight: []
            });
            return;
        }

        const v = this.search(n);
        if (v.val !== n) {
            steps.push({
                tree: this.deepClone(this.root),
                action: `Value ${n} not found`,
                highlight: []
            });
            return;
        }

        steps.push({
            tree: this.deepClone(this.root),
            action: `Deleting ${n}`,
            highlight: [n]
        });

        this.deleteNode(v, steps);
    }

    deepClone(node) {
    if (!node) return null;
    return {
            val: node.val,
        color: node.color,
            left: this.deepClone(node.left),
            right: this.deepClone(node.right)
    };
    }
}

function getRandomValues(size, min = 1, max = 99) {
    let values = [];
    while (values.length < size) {
        let v = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!values.includes(v)) values.push(v);
    }
    return values;
}

function getTreeLayout(root, x = 300, y = 40, dx = 120, depth = 0, nodes = [], edges = []) {
    if (!root) return { nodes, edges };
    
    nodes.push({ 
        val: root.val, 
        x, 
        y, 
        color: root.color,
        depth
    });

    if (root.left) {
        edges.push({ 
            from: { x, y }, 
            to: { x: x - dx / (depth + 1), y: y + 80 },
            fromVal: root.val,
            toVal: root.left.val
        });
        getTreeLayout(root.left, x - dx / (depth + 1), y + 80, dx, depth + 1, nodes, edges);
    }
    if (root.right) {
        edges.push({ 
            from: { x, y }, 
            to: { x: x + dx / (depth + 1), y: y + 80 },
            fromVal: root.val,
            toVal: root.right.val
        });
        getTreeLayout(root.right, x + dx / (depth + 1), y + 80, dx, depth + 1, nodes, edges);
    }
    return { nodes, edges };
}

function Legend() {
    return (
        <div style={{ display: "flex", gap: 16, margin: "16px 0", flexWrap: "wrap" }}>
            <LegendItem color="#d32f2f" label="Red Node" />
            <LegendItem color="#22223b" label="Black Node" />
            <LegendItem color="#ffb703" label="Path/Highlight" />
            <LegendItem color="#8bc34a" label="Operation Node" />
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
    const [treeSize, setTreeSize] = useState(6);
    const [values, setValues] = useState([]);
    const [customInput, setCustomInput] = useState("");
    const [deleteInput, setDeleteInput] = useState("");
    const [step, setStep] = useState(0);
    const [steps, setSteps] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [inputError, setInputError] = useState("");
    const [operation, setOperation] = useState("insert");

    useEffect(() => {
        if (treeSize > 0) {
            setValues(getRandomValues(treeSize));
        }
    }, [treeSize]);

    useEffect(() => {
        let tree = new RBTree();
        let allSteps = [];
        
        if (operation === "insert") {
            for (let i = 0; i < values.length; i++) {
                tree.insert(values[i], allSteps);
            }
        } else if (operation === "delete" && deleteInput) {
            // First build the tree
        for (let i = 0; i < values.length; i++) {
                tree.insert(values[i], []);
            }
            // Then perform deletion
            tree.deleteByVal(parseInt(deleteInput), allSteps);
        }
        
        setSteps(allSteps);
        setStep(0);
    }, [values, operation, deleteInput]);

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

    const currentStep = steps[step - 1] || { tree: null, highlight: [], action: "" };
    const { nodes, edges } = getTreeLayout(currentStep.tree);

    return (
        <div className="visualizer-fullscreen">
            <div className="visualizer-title">Red-Black Tree Operations</div>
            <div className="visualizer-desc">
                Red-Black Tree is a self-balancing BST. Watch how it balances itself after each operation.
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

                {nodes.map((node) => {
                    let background = node.color === COLOR.RED ? "#d32f2f" : "#22223b";
                    let border = "2px solid #4a4e69";
                    let textColor = "#fff";

                    if (currentStep.highlight && currentStep.highlight.includes(node.val)) {
                        border = "4px solid #ffb703";
                    }

                    return (
                        <div
                            key={node.val}
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
                                transition: "all 0.3s ease-in-out"
                            }}
                        >
                            {node.val}
                        </div>
                    );
                })}
            </div>

            <div style={{ margin: "18px 0", fontWeight: "bold", fontSize: "1.1rem", color: "#1976d2" }}>
                {step === 0
                    ? "Start inserting values to build the Red-Black tree."
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