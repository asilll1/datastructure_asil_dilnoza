import React, { useState } from "react";

function generateRandomGraph(n, m) {
    let edges = [];
    let edgeSet = new Set();
    for (let i = 1; i < n; i++) {
        let u = i;
        let v = Math.floor(Math.random() * i);
        edges.push([u, v]);
        edgeSet.add(u < v ? `${u},${v}` : `${v},${u}`);
    }
    while (edges.length < m) {
        let u = Math.floor(Math.random() * n);
        let v = Math.floor(Math.random() * n);
        if (u !== v) {
            let key = u < v ? `${u},${v}` : `${v},${u}`;
            if (!edgeSet.has(key)) {
                edges.push([u, v]);
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
        let [u, v] = line.split(/\s|,/).map(Number);
        if (!isNaN(u) && !isNaN(v)) {
            edges.push([u, v]);
        }
    }
    return edges;
}

function labelFor(i) {
    return i < 26 ? String.fromCharCode(65 + i) : i;
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

function toAdjList(n, edges) {
    let adj = Array.from({ length: n }, () => []);
    for (let [u, v] of edges) {
        adj[u].push(v);
        adj[v].push(u);
    }
    return adj;
}

function toAdjMatrix(n, edges) {
    let mat = Array.from({ length: n }, () => Array(n).fill(0));
    for (let [u, v] of edges) {
        mat[u][v] = 1;
        mat[v][u] = 1;
    }
    return mat;
}

export default function GraphRepresentationVisualizer() {
    const [numNodes, setNumNodes] = useState(6);
    const [numEdges, setNumEdges] = useState(7);
    const [edgeInput, setEdgeInput] = useState("");
    const [edges, setEdges] = useState(generateRandomGraph(6, 7));
    const [representation, setRepresentation] = useState("adjlist");
    const [inputError, setInputError] = useState("");

    const handleRandom = () => {
        let m = Math.max(numNodes - 1, Math.min(numEdges, numNodes * (numNodes - 1) / 2));
        setEdges(generateRandomGraph(numNodes, m));
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

    const nodePos = getNodePositions(numNodes);

    let adjList = toAdjList(numNodes, edges);
    let adjMatrix = toAdjMatrix(numNodes, edges);

    return (
        <div className="visualizer-fullscreen">
            <div className="visualizer-title">Graph Representations</div>
            <div className="visualizer-desc">
                See how a graph can be represented as an adjacency list, adjacency matrix, or edge list.
            </div>
            <div className="visualizer-controls" style={{ flexWrap: "wrap", gap: 16 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <label>Nodes:</label>
                    <input
                        type="number"
                        min={2}
                        max={12}
                        value={numNodes}
                        onChange={e => setNumNodes(Math.max(2, Math.min(12, Number(e.target.value))))}
                        style={{ width: 50, borderRadius: 4, border: "1px solid #bfc0c0", padding: "4px 8px" }}
                    />
                    <label>Edges:</label>
                    <input
                        type="number"
                        min={numNodes - 1}
                        max={numNodes * (numNodes - 1) / 2}
                        value={numEdges}
                        onChange={e => setNumEdges(Math.max(numNodes - 1, Math.min(numNodes * (numNodes - 1) / 2, Number(e.target.value))))}
                        style={{ width: 50, borderRadius: 4, border: "1px solid #bfc0c0", padding: "4px 8px" }}
                    />
                    <button className="visualizer-btn" onClick={handleRandom}>
                        Randomize
                    </button>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <textarea
                        placeholder={"Edge list (u v, e.g.\n0 1\n1 2)"}
                        value={edgeInput}
                        onChange={e => setEdgeInput(e.target.value)}
                        rows={Math.max(3, numNodes)}
                        style={{ width: 220, borderRadius: 4, border: "1px solid #bfc0c0", padding: "4px 8px", fontFamily: "monospace" }}
                    />
                    <button className="visualizer-btn" onClick={handleSetCustom}>
                        Set Custom Graph
                    </button>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <label>Representation:</label>
                    <select value={representation} onChange={e => setRepresentation(e.target.value)}>
                        <option value="adjlist">Adjacency List</option>
                        <option value="adjmatrix">Adjacency Matrix</option>
                        <option value="edgelist">Edge List</option>
                    </select>
                </div>
            </div>
            {inputError && (
                <div style={{ color: "#d32f2f", fontWeight: "bold", margin: "8px 0" }}>{inputError}</div>
            )}
            <div style={{ width: 600, height: 380, margin: "0 auto", background: "none", position: "relative" }}>
                <svg width={600} height={380} style={{ position: "absolute", left: 0, top: 0 }}>
                    {/* Edges */}
                    {edges.map(([u, v], i) => (
                        <line
                            key={i}
                            x1={nodePos[u].x}
                            y1={nodePos[u].y}
                            x2={nodePos[v].x}
                            y2={nodePos[v].y}
                            stroke="#bfc0c0"
                            strokeWidth={2}
                        />
                    ))}
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
            <div style={{ margin: "32px 0" }}>
                {representation === "adjlist" && (
                    <div>
                        <h4>Adjacency List</h4>
                        <pre style={{ background: "#f5f5f5", padding: 12, borderRadius: 8 }}>
                            {adjList.map((nbrs, i) => `${labelFor(i)}: ${nbrs.map(labelFor).join(", ")}`).join("\n")}
                        </pre>
                    </div>
                )}
                {representation === "adjmatrix" && (
                    <div>
                        <h4>Adjacency Matrix</h4>
                        <pre style={{ background: "#f5f5f5", padding: 12, borderRadius: 8 }}>
                            {adjMatrix.map((row, i) => row.map(x => x ? 1 : 0).join(" ")).join("\n")}
                        </pre>
                    </div>
                )}
                {representation === "edgelist" && (
                    <div>
                        <h4>Edge List</h4>
                        <pre style={{ background: "#f5f5f5", padding: 12, borderRadius: 8 }}>
                            {edges.map(([u, v]) => `${labelFor(u)} - ${labelFor(v)}`).join("\n")}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}
