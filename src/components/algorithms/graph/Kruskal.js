import React, { useState } from "react";

// Disjoint set data structure
class DSU {
    constructor(n) {
        this.parent = Array.from({ length: n }, (_, i) => i);
        this.rank = Array(n).fill(1);
    }
    find(i) {
        if (this.parent[i] !== i) {
            this.parent[i] = this.find(this.parent[i]);
        }
        return this.parent[i];
    }
    unite(x, y) {
        const s1 = this.find(x);
        const s2 = this.find(y);
        if (s1 !== s2) {
            if (this.rank[s1] < this.rank[s2]) this.parent[s1] = s2;
            else if (this.rank[s1] > this.rank[s2]) this.parent[s2] = s1;
            else {
                this.parent[s2] = s1;
                this.rank[s1]++;
            }
        }
    }
}

function generateRandomWeightedGraph(n, m) {
    let edges = [];
    let edgeSet = new Set();
    for (let i = 1; i < n; i++) {
        let u = i;
        let v = Math.floor(Math.random() * i);
        let w = Math.floor(Math.random() * 20) + 1;
        edges.push([u, v, w]);
        edgeSet.add(u < v ? `${u},${v}` : `${v},${u}`);
    }
    while (edges.length < m) {
        let u = Math.floor(Math.random() * n);
        let v = Math.floor(Math.random() * n);
        if (u !== v) {
            let key = u < v ? `${u},${v}` : `${v},${u}`;
            if (!edgeSet.has(key)) {
                let w = Math.floor(Math.random() * 20) + 1;
                edges.push([u, v, w]);
                edgeSet.add(key);
            }
        }
    }
    return edges;
}

function parseEdgeList(input, n) {
    let edges = [];
    let lines = input.trim().split("\n");
    for (let line of lines) {
        let [u, v, w] = line.split(/\s|,/).map(Number);
        if (!isNaN(u) && !isNaN(v) && !isNaN(w)) {
            edges.push([u, v, w]);
        }
    }
    return edges;
}

function labelFor(i) {
    return i < 26 ? String.fromCharCode(65 + i) : i;
}

// Kruskal's algorithm steps (with DSU)
function kruskalSteps(n, edges) {
    let sorted = [...edges].sort((a, b) => a[2] - b[2]);
    let dsu = new DSU(n);
    let mst = [];
    let steps = [];
    let cost = 0;
    let count = 0;
    for (let i = 0; i < sorted.length; i++) {
        let [x, y, w] = sorted[i];
        let canAdd = dsu.find(x) !== dsu.find(y);
        steps.push({
            mst: [...mst],
            edge: { u: x, v: y, w },
            highlight: [x, y],
            canAdd,
            sorted: sorted.slice(0, i + 1),
            action: canAdd
                ? `Add edge ${labelFor(x)}-${labelFor(y)} (weight ${w}) to MST`
                : `Skip edge ${labelFor(x)}-${labelFor(y)} (weight ${w}) to avoid cycle`,
            cost
        });
        if (canAdd) {
            dsu.unite(x, y);
            mst.push({ u: x, v: y, w });
            cost += w;
            count++;
            if (count === n - 1) break;
        }
    }
    steps.push({
        mst: [...mst],
        edge: null,
        highlight: [],
        canAdd: false,
        sorted,
        action: `Kruskal's complete! MST weight: ${mst.reduce((a, e) => a + e.w, 0)}`,
        cost
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
            <LegendItem color="#fb8500" label="Edge Being Considered" />
            <LegendItem color="#8bc34a" label="MST Edge" />
            <LegendItem color="#bfc0c0" label="Other Edge" />
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

export default function KruskalVisualizer() {
    const [numNodes, setNumNodes] = useState(6);
    const [numEdges, setNumEdges] = useState(7);
    const [edgeInput, setEdgeInput] = useState("");
    const [edges, setEdges] = useState(generateRandomWeightedGraph(6, 7));
    const [steps, setSteps] = useState(kruskalSteps(6, edges));
    const [step, setStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [inputError, setInputError] = useState("");

    React.useEffect(() => {
        setSteps(kruskalSteps(numNodes, edges));
        setStep(0);
    }, [edges, numNodes]);

    const handleRandom = () => {
        let m = Math.max(numNodes - 1, Math.min(numEdges, numNodes * (numNodes - 1) / 2));
        setEdges(generateRandomWeightedGraph(numNodes, m));
        setEdgeInput("");
        setInputError("");
    };

    const handleSetCustom = () => {
        try {
            let edgeList = parseEdgeList(edgeInput, numNodes);
            setEdges(edgeList);
            setInputError("");
        } catch {
            setInputError("Invalid edge list format");
        }
    };

    const handleAutoPlay = async () => {
        setIsAnimating(true);
        for (let i = step + 1; i < steps.length; i++) {
            await new Promise((res) => setTimeout(res, 900));
            setStep(i);
        }
        setIsAnimating(false);
    };

    const handleReset = () => {
        setSteps(kruskalSteps(numNodes, edges));
        setStep(0);
        setIsAnimating(false);
        setInputError("");
    };

    const nodePos = getNodePositions(numNodes);
    const current = steps[step];

    return (
        <div className="visualizer-fullscreen">
            <div className="visualizer-title">Kruskal's Algorithm (MST)</div>
            <div className="visualizer-desc">
                Kruskal's algorithm finds a minimum spanning tree by adding the lowest-weight edge that doesn't form a cycle.
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
                    <textarea
                        placeholder={"Edge list (u v w, e.g.\n0 1 4\n1 2 7)"}
                        value={edgeInput}
                        onChange={e => setEdgeInput(e.target.value)}
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
                    {edges.map(([u, v, w], i) => {
                        let inMST = current.mst && current.mst.some(m => (m.u === u && m.v === v) || (m.u === v && m.v === u));
                        let isCurrent = current.edge && ((current.edge.u === u && current.edge.v === v) || (current.edge.u === v && current.edge.v === u));
                        let color = isCurrent ? "#fb8500" : inMST ? "#8bc34a" : "#bfc0c0";
                        let width = isCurrent ? 4 : inMST ? 4 : 2;
                        return (
                            <g key={i}>
                                <line
                                    x1={nodePos[u].x}
                                    y1={nodePos[u].y}
                                    x2={nodePos[v].x}
                                    y2={nodePos[v].y}
                                    stroke={color}
                                    strokeWidth={width}
                                    style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
                                />
                                <text
                                    x={(nodePos[u].x + nodePos[v].x) / 2}
                                    y={(nodePos[u].y + nodePos[v].y) / 2 - 8}
                                    textAnchor="middle"
                                    fontSize="1rem"
                                    fill="#4a4e69"
                                >
                                    {w}
                                </text>
                            </g>
                        );
                    })}
                </svg>
                {/* Nodes */}
                {nodePos.map((pos, i) => (
                    <div
                        key={i}
                        title={`Node ${labelFor(i)}`}
                        style={{
                            position: "absolute",
                            left: pos.x - 20,
                            top: pos.y - 20,
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: "#a3cef1",
                            border: "2px solid #4a4e69",
                            color: "#22223b",
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
                ))}
            </div>
            <div style={{ margin: "18px 0", fontWeight: "bold", fontSize: "1.1rem", color: "#8bc34a" }}>
                MST Edges: {current.mst && current.mst.length > 0 ? current.mst.map(e => `${labelFor(e.u)}-${labelFor(e.v)}(${e.w})`).join(", ") : "-"}
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
