import React, { useState } from "react";

function generateRandomGraph(n, m) {
    let edges = [];
    let adj = Array.from({ length: n }, () => []);
    for (let i = 1; i < n; i++) {
        let u = i;
        let v = Math.floor(Math.random() * i);
        edges.push([u, v]);
        adj[u].push(v);
        adj[v].push(u);
    }
    while (edges.length < m) {
        let u = Math.floor(Math.random() * n);
        let v = Math.floor(Math.random() * n);
        if (u !== v && !adj[u].includes(v)) {
            edges.push([u, v]);
            adj[u].push(v);
            adj[v].push(u);
        }
    }
    return adj;
}

function parseAdjList(input, n) {
    let adj = Array.from({ length: n }, () => []);
    let lines = input.trim().split("\n");
    for (let i = 0; i < lines.length; i++) {
        let nums = lines[i].split(/\s|,/).map(s => parseInt(s)).filter(x => !isNaN(x));
        adj[i] = nums;
    }
    return adj;
}

function labelFor(i) {
    return i < 26 ? String.fromCharCode(65 + i) : i;
}

// DFS traversal steps (recursive, with stack visualization)
function dfsSteps(adj, start) {
    let n = adj.length;
    let visited = Array(n).fill(false);
    let steps = [];
    let order = [];
    let stack = [];
    function dfsRec(u, parent) {
        visited[u] = true;
        order.push(u);
        stack.push(u);
        steps.push({
            visited: [...visited],
            current: u,
            order: [...order],
            stack: [...stack],
            parent,
            edge: parent !== null ? [parent, u] : null,
            action: `Visit node ${labelFor(u)}`
        });
        for (let v of adj[u]) {
            if (!visited[v]) {
                steps.push({
                    visited: [...visited],
                    current: u,
                    order: [...order],
                    stack: [...stack, v],
                    parent: u,
                    edge: [u, v],
                    action: `Traverse edge ${labelFor(u)} → ${labelFor(v)}`
                });
                dfsRec(v, u);
            }
        }
        stack.pop();
        steps.push({
            visited: [...visited],
            current: u,
            order: [...order],
            stack: [...stack],
            parent,
            edge: parent !== null ? [parent, u] : null,
            action: `Backtrack from ${labelFor(u)}`
        });
    }
    dfsRec(start, null);
    steps.push({
        visited: [...visited],
        current: null,
        order: [...order],
        stack: [],
        parent: null,
        edge: null,
        action: `DFS complete! Order: ${order.map(labelFor).join(", ")}`
    });
    return steps;
}

function getNodePositions(n, cx = 300, cy = 180, r = 120) {
    let pos = [];
    for (let i = 0; i < n; i++) {
        let angle = (2 * Math.PI * i) / n;
        pos.push({
            x: cx + r * Math.cos(angle),
            y: cy + r * Math.sin(angle)
        });
    }
    return pos;
}

function Legend() {
    return (
        <div style={{ display: "flex", gap: 16, margin: "16px 0", flexWrap: "wrap" }}>
            <LegendItem color="#ffb703" label="Current Node" />
            <LegendItem color="#8bc34a" label="Visited" />
            <LegendItem color="#1976d2" label="In Stack" />
            <LegendItem color="#a3cef1" label="Unvisited" />
            <LegendItem color="#fb8500" label="Edge Being Traversed" />
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

export default function DFSVisualizer() {
    const [numNodes, setNumNodes] = useState(6);
    const [numEdges, setNumEdges] = useState(7);
    const [adjInput, setAdjInput] = useState("");
    const [adj, setAdj] = useState(generateRandomGraph(6, 7));
    const [startNode, setStartNode] = useState(0);
    const [steps, setSteps] = useState(dfsSteps(adj, 0));
    const [step, setStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [inputError, setInputError] = useState("");

    React.useEffect(() => {
        setSteps(dfsSteps(adj, startNode));
        setStep(0);
    }, [adj, startNode]);

    const handleRandom = () => {
        let m = Math.max(numNodes - 1, Math.min(numEdges, numNodes * (numNodes - 1) / 2));
        setAdj(generateRandomGraph(numNodes, m));
        setAdjInput("");
        setInputError("");
    };

    const handleSetCustom = () => {
        try {
            let adjList = parseAdjList(adjInput, numNodes);
            setAdj(adjList);
            setInputError("");
        } catch {
            setInputError("Invalid adjacency list format");
        }
    };

    const handleAutoPlay = async () => {
        setIsAnimating(true);
        for (let i = step + 1; i < steps.length; i++) {
            await new Promise((res) => setTimeout(res, 800));
            setStep(i);
        }
        setIsAnimating(false);
    };

    const handleReset = () => {
        setSteps(dfsSteps(adj, startNode));
        setStep(0);
        setIsAnimating(false);
        setInputError("");
    };

    const nodePos = getNodePositions(adj.length);
    const current = steps[step];

    let edgeSet = new Set();
    let edges = [];
    for (let u = 0; u < adj.length; u++) {
        for (let v of adj[u]) {
            let key = u < v ? `${u},${v}` : `${v},${u}`;
            if (!edgeSet.has(key)) {
                edgeSet.add(key);
                edges.push([u, v]);
            }
        }
    }

    const colors = {
        current: "#ffb703",
        visited: "#8bc34a",
        inStack: "#1976d2",
        unvisited: "#a3cef1",
        edge: "#fb8500"
    };

    return (
        <div className="visualizer-fullscreen">
            <div className="visualizer-title">Depth-First Search (DFS)</div>
            <div className="visualizer-desc">
                DFS explores as far as possible along each branch before backtracking. Watch the call stack and traversal order.
            </div>
            <Legend />
            <div className="visualizer-controls" style={{ flexWrap: "wrap", gap: 16 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <label>Nodes:</label>
                    <input
                        type="number"
                        min={2}
                        max={12}
                        value={numNodes}
                        onChange={e => setNumNodes(Math.max(2, Math.min(12, Number(e.target.value))))}
                        disabled={isAnimating}
                        style={{ width: 50, borderRadius: 4, border: "1px solid #bfc0c0", padding: "4px 8px" }}
                    />
                    <label>Edges:</label>
                    <input
                        type="number"
                        min={numNodes - 1}
                        max={numNodes * (numNodes - 1) / 2}
                        value={numEdges}
                        onChange={e => setNumEdges(Math.max(numNodes - 1, Math.min(numNodes * (numNodes - 1) / 2, Number(e.target.value))))}
                        disabled={isAnimating}
                        style={{ width: 50, borderRadius: 4, border: "1px solid #bfc0c0", padding: "4px 8px" }}
                    />
                    <button className="visualizer-btn" onClick={handleRandom} disabled={isAnimating}>
                        Randomize
                    </button>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <label>Start node:</label>
                    <input
                        type="number"
                        min={0}
                        max={adj.length - 1}
                        value={startNode}
                        onChange={e => setStartNode(Math.max(0, Math.min(adj.length - 1, Number(e.target.value))))}
                        disabled={isAnimating}
                        style={{ width: 50, borderRadius: 4, border: "1px solid #bfc0c0", padding: "4px 8px" }}
                    />
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <textarea
                        placeholder={"Adjacency list (one line per node, e.g.\n1 2\n0 2\n0 1)"}
                        value={adjInput}
                        onChange={e => setAdjInput(e.target.value)}
                        rows={Math.max(3, numNodes)}
                        style={{ width: 220, borderRadius: 4, border: "1px solid #bfc0c0", padding: "4px 8px", fontFamily: "monospace" }}
                        disabled={isAnimating}
                    />
                    <button className="visualizer-btn" onClick={handleSetCustom} disabled={isAnimating}>
                        Set Custom Graph
                    </button>
                </div>
                <button
                    className="visualizer-btn"
                    onClick={handleAutoPlay}
                    disabled={isAnimating || step === steps.length - 1}
                >
                    Auto Play
                </button>
                <button
                    className="visualizer-btn"
                    onClick={handleReset}
                    disabled={isAnimating}
                >
                    Reset
                </button>
            </div>
            {inputError && (
                <div style={{ color: "#d32f2f", fontWeight: "bold", margin: "8px 0" }}>{inputError}</div>
            )}
            <div style={{ margin: "16px 0", textAlign: "center", color: "#4a4e69", fontWeight: "bold" }}>
                {current.action}
            </div>
            <div style={{ width: 600, height: 380, margin: "0 auto", background: "none", position: "relative" }}>
                <svg width={600} height={380} style={{ position: "absolute", left: 0, top: 0 }}>
                    {/* Edges */}
                    {edges.map(([u, v], i) => {
                        let highlight = false;
                        if (current.edge && ((current.edge[0] === u && current.edge[1] === v) || (current.edge[0] === v && current.edge[1] === u))) {
                            highlight = true;
                        }
                        return (
                            <line
                                key={i}
                                x1={nodePos[u].x}
                                y1={nodePos[u].y}
                                x2={nodePos[v].x}
                                y2={nodePos[v].y}
                                stroke={highlight ? colors.edge : "#bfc0c0"}
                                strokeWidth={highlight ? 4 : 2}
                                style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
                            />
                        );
                    })}
                </svg>
                {/* Nodes */}
                {nodePos.map((pos, i) => {
                    let background = colors.unvisited;
                    let border = "2px solid #4a4e69";
                    let textColor = "#22223b";
                    let tooltip = `Node ${labelFor(i)}\nNeighbors: ${adj[i].map(labelFor).join(", ")}`;
                    if (current.current === i) {
                        border = `4px solid ${colors.current}`;
                        background = colors.current;
                        textColor = "#fff";
                        tooltip += "\n(Current)";
                    } else if (current.stack && current.stack.includes(i)) {
                        border = `4px dashed ${colors.inStack}`;
                        background = colors.inStack;
                        textColor = "#fff";
                        tooltip += "\n(In Stack)";
                    } else if (current.visited && current.visited[i]) {
                        background = colors.visited;
                        tooltip += "\n(Visited)";
                    }
                    return (
                        <div
                            key={i}
                            title={tooltip}
                            style={{
                                position: "absolute",
                                left: pos.x - 20,
                                top: pos.y - 20,
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
                            {labelFor(i)}
                        </div>
                    );
                })}
            </div>
            <div style={{ margin: "18px 0", fontWeight: "bold", fontSize: "1.1rem", color: "#1976d2" }}>
                Stack: {current.stack && current.stack.length > 0 ? (
                    <span style={{ display: "inline-flex", gap: 8 }}>
                        {current.stack.map((q, idx) => (
                            <span key={idx} style={{
                                background: colors.inStack,
                                color: "#fff",
                                borderRadius: 6,
                                padding: "2px 10px",
                                fontWeight: 600,
                                border: `2px solid #1976d2`,
                                fontSize: "1rem"
                            }}>{labelFor(q)}</span>
                        ))}
                    </span>
                ) : <span style={{ color: "#bfc0c0" }}>(empty)</span>}
            </div>
            <div style={{ margin: "18px 0", fontWeight: "bold", fontSize: "1.1rem", color: "#4a4e69" }}>
                Visited Order: {current.order && current.order.length > 0 ? current.order.map(labelFor).join(", ") : "-"}
            </div>
            <div className="visualizer-controls" style={{ justifyContent: "center", marginTop: 24 }}>
                <button
                    className="visualizer-btn"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0 || isAnimating}
                >
                    Previous
                </button>
                <button
                    className="visualizer-btn"
                    onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                    disabled={step === steps.length - 1 || isAnimating}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
