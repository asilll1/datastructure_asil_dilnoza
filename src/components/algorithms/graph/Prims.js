import React, { useState } from "react";

// Priority Queue (Min-Heap) for Prim's
class PriorityQueue {
    constructor() {
        this.heap = [];
    }
    enqueue(value) {
        this.heap.push(value);
        let i = this.heap.length - 1;
        while (i > 0) {
            let j = Math.floor((i - 1) / 2);
            if (this.heap[i][0] >= this.heap[j][0]) break;
            [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
            i = j;
        }
    }
    dequeue() {
        if (this.heap.length === 0) throw new Error("Queue is empty");
        let i = this.heap.length - 1;
        const result = this.heap[0];
        this.heap[0] = this.heap[i];
        this.heap.pop();
        i--;
        let j = 0;
        while (true) {
            const left = j * 2 + 1;
            if (left > i) break;
            const right = left + 1;
            let k = left;
            if (right <= i && this.heap[right][0] < this.heap[left][0]) k = right;
            if (this.heap[j][0] <= this.heap[k][0]) break;
            [this.heap[j], this.heap[k]] = [this.heap[k], this.heap[j]];
            j = k;
        }
        return result;
    }
    get count() {
        return this.heap.length;
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

// Prim's algorithm steps (with PriorityQueue)
function primsSteps(n, edges, start = 0) {
    // Build adjacency list
    const adj = Array.from({ length: n }, () => []);
    for (const [u, v, w] of edges) {
        adj[u].push([v, w]);
        adj[v].push([u, w]);
    }
    let visited = Array(n).fill(false);
    let mst = [];
    let steps = [];
    let pq = new PriorityQueue();
    let totalWeight = 0;
    pq.enqueue([0, start, -1]); // [weight, node, parent]
    steps.push({
        mst: [...mst],
        pq: [],
        visited: [...visited],
        edge: null,
        action: `Start from node ${labelFor(start)}`
    });
    while (pq.count > 0 && mst.length < n - 1) {
        const [wt, u, parent] = pq.dequeue();
        if (visited[u]) {
            steps.push({
                mst: [...mst],
                pq: pq.heap.slice(),
                visited: [...visited],
                edge: parent !== -1 ? { u: parent, v: u, w: wt } : null,
                action: parent !== -1 ? `Skip edge ${labelFor(parent)}-${labelFor(u)} (weight ${wt}) (already visited)` : `Skip node ${labelFor(u)} (already visited)`
            });
            continue;
        }
        if (parent !== -1) {
            mst.push({ u: parent, v: u, w: wt });
            totalWeight += wt;
        }
        visited[u] = true;
        steps.push({
            mst: [...mst],
            pq: pq.heap.slice(),
            visited: [...visited],
            edge: parent !== -1 ? { u: parent, v: u, w: wt } : null,
            action: parent !== -1 ? `Add edge ${labelFor(parent)}-${labelFor(u)} (weight ${wt}) to MST` : `Visit start node ${labelFor(u)}`
        });
        for (const [v, w] of adj[u]) {
            if (!visited[v]) pq.enqueue([w, v, u]);
        }
    }
    steps.push({
        mst: [...mst],
        pq: [],
        visited: [...visited],
        edge: null,
        action: `Prim's complete! MST weight: ${totalWeight}`
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

export default function PrimsVisualizer() {
    const [numNodes, setNumNodes] = useState(6);
    const [numEdges, setNumEdges] = useState(7);
    const [edgeInput, setEdgeInput] = useState("");
    const [edges, setEdges] = useState(generateRandomWeightedGraph(6, 7));
    const [startNode, setStartNode] = useState(0);
    const [steps, setSteps] = useState(primsSteps(6, edges, 0));
    const [step, setStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [inputError, setInputError] = useState("");

    React.useEffect(() => {
        setSteps(primsSteps(numNodes, edges, startNode));
        setStep(0);
    }, [edges, numNodes, startNode]);

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
        setSteps(primsSteps(numNodes, edges, startNode));
        setStep(0);
        setIsAnimating(false);
        setInputError("");
    };

    const nodePos = getNodePositions(numNodes);
    const current = steps[step];

    return (
        <div className="visualizer-fullscreen">
            <div className="visualizer-title">Prim's Algorithm (MST)</div>
            <div className="visualizer-desc">
                Prim's algorithm finds a minimum spanning tree by growing a tree from a start node, always adding the lowest-weight edge to a new node.
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
                        max={numNodes - 1}
                        value={startNode}
                        onChange={e => setStartNode(Math.max(0, Math.min(numNodes - 1, Number(e.target.value))))}
                        disabled={isAnimating}
                        style={{ width: 50, borderRadius: 4, border: "1px solid #bfc0c0", padding: "4px 8px" }}
                    />
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
