import React, { useState, useEffect } from "react";

class MinHeap {
    constructor() {
        this.heap = [];
    }

    push(val) {
        this.heap.push(val);
        this._heapifyUp(this.heap.length - 1);
    }

    pop() {
        if (this.size() === 0) return null;
        if (this.size() === 1) return this.heap.pop();

        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this._heapifyDown(0);
        return min;
    }

    size() {
        return this.heap.length;
    }

    _heapifyUp(index) {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if (this.heap[parent][0] <= this.heap[index][0]) break;
            [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
            index = parent;
        }
    }

    _heapifyDown(index) {
        const n = this.heap.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;

            if (left < n && this.heap[left][0] < this.heap[smallest][0]) {
                smallest = left;
            }
            
            if (right < n && this.heap[right][0] < this.heap[smallest][0]) {
                smallest = right;
            }

            if (smallest === index) break;
            [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]];
            index = smallest;
        }
    }
}

function constructAdj(edges, V) {
    const adj = Array.from({ length: V }, () => []);
    for (const edge of edges) {
        const [u, v, wt] = edge;
        adj[u].push([v, wt]);
        adj[v].push([u, wt]);
    }
    return adj;
}

function dijkstraWithSteps(V, edges, src) {
    const adj = constructAdj(edges, V);
    const minHeap = new MinHeap();
    const dist = Array(V).fill(Number.MAX_SAFE_INTEGER);
    const parent = Array(V).fill(null);
    const visited = new Set();
    const steps = [];
    const unvisited = new Set(Array.from({ length: V }, (_, i) => i));

    minHeap.push([0, src]);
    dist[src] = 0;

    steps.push({
        dist: [...dist],
        parent: [...parent],
        visited: new Set(visited),
        unvisited: new Set(unvisited),
        current: src,
        edge: null,
        message: `Start from node ${src}`
    });

    while (minHeap.size() > 0) {
        const [d, u] = minHeap.pop();
        if (visited.has(u)) continue;
        visited.add(u);
        unvisited.delete(u);
        steps.push({
            dist: [...dist],
            parent: [...parent],
            visited: new Set(visited),
            unvisited: new Set(unvisited),
            current: u,
            edge: null,
            message: `Node ${u} is now visited, distance finalized: ${dist[u]}`
        });
        for (const [v, weight] of adj[u]) {
            steps.push({
                dist: [...dist],
                parent: [...parent],
                visited: new Set(visited),
                unvisited: new Set(unvisited),
                current: u,
                edge: [u, v],
                message: `Considering edge (${u}, ${v}) with weight ${weight}`
            });
            if (!visited.has(v) && dist[v] > dist[u] + weight) {
                dist[v] = dist[u] + weight;
                parent[v] = u;
                minHeap.push([dist[v], v]);
                steps.push({
                    dist: [...dist],
                    parent: [...parent],
                    visited: new Set(visited),
                    unvisited: new Set(unvisited),
                    current: u,
                    edge: [u, v],
                    message: `Updated distance of node ${v} to ${dist[v]} via ${u}`
                });
            }
        }
    }
    return steps;
}

function getRandomGraph(V, E) {
    const edges = [];
    const maxWeight = 10;
    
    // Ensure graph is connected
    for (let i = 1; i < V; i++) {
        const u = Math.floor(Math.random() * i);
        const weight = Math.floor(Math.random() * maxWeight) + 1;
        edges.push([u, i, weight]);
    }
    
    // Add remaining edges
    while (edges.length < E) {
        const u = Math.floor(Math.random() * V);
        const v = Math.floor(Math.random() * V);
        if (u !== v && !edges.some(([a, b]) => (a === u && b === v) || (a === v && b === u))) {
            const weight = Math.floor(Math.random() * maxWeight) + 1;
            edges.push([u, v, weight]);
        }
    }
    
    return edges;
}

function getNodePosition(index, total, radius = 200) {
    const angle = (2 * Math.PI * index) / total;
    return {
        x: 300 + radius * Math.cos(angle),
        y: 200 + radius * Math.sin(angle)
    };
}

function Legend() {
    return (
        <div style={{ display: "flex", gap: 16, margin: "16px 0", flexWrap: "wrap" }}>
            <LegendItem color="#8bc34a" label="Current Node" />
            <LegendItem color="#ffb703" label="Visited Node" />
            <LegendItem color="#a3cef1" label="Unvisited Node" />
            <LegendItem color="#4a4e69" label="Edge Being Considered" />
            <LegendItem color="#1976d2" label="Shortest Path Tree" />
            <span style={{ background: '#fffbe6', border: '1px solid #bfc0c0', borderRadius: 4, padding: '2px 8px', fontSize: 13, color: '#4a4e69' }}>Edge Weight</span>
            <span style={{ fontSize: 13, color: '#4a4e69' }}>d=distance (below node)</span>
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

function getPathEdges(parent) {
    // Returns array of [from, to] for the current shortest path tree
    const edges = [];
    for (let v = 0; v < parent.length; v++) {
        if (parent[v] !== null && parent[v] !== undefined) {
            edges.push([parent[v], v]);
        }
    }
    return edges;
}

export default function DijkstraVisualizer() {
    const [V, setV] = useState(6);
    const [E, setE] = useState(8);
    const [src, setSrc] = useState(0);
    const [edges, setEdges] = useState([]);
    const [step, setStep] = useState(0);
    const [steps, setSteps] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [customInput, setCustomInput] = useState("");
    const [inputError, setInputError] = useState("");

    useEffect(() => {
        setEdges(getRandomGraph(V, E));
        setStep(0);
        setSteps([]);
    }, [V, E]);

    useEffect(() => {
        if (edges.length > 0) {
            setSteps(dijkstraWithSteps(V, edges, src));
        }
    }, [edges, src, V]);

    const handleRandom = () => {
        setEdges(getRandomGraph(V, E));
        setStep(0);
        setInputError("");
    };

    const handleAutoPlay = async () => {
        setIsAnimating(true);
        for (let i = step + 1; i <= steps.length; i++) {
            await new Promise((res) => setTimeout(res, 1000));
            setStep(i);
        }
        setIsAnimating(false);
    };

    const handleCustomInput = (e) => {
        setCustomInput(e.target.value);
        setInputError("");
    };

    const handleSetGraph = () => {
        try {
            const inputEdges = customInput.split(';').map(edge => {
                const [u, v, w] = edge.split(',').map(Number);
                if (
                    isNaN(u) || isNaN(v) || isNaN(w) ||
                    u < 0 || v < 0 || w < 0 ||
                    u >= V || v >= V
                ) {
                    throw new Error("Invalid edge: node indices must be between 0 and " + (V - 1));
                }
                return [u, v, w];
            });
            setEdges(inputEdges);
            setStep(0);
            setInputError("");
        } catch (error) {
            setInputError(error.message || "Invalid input format. Use: u1,v1,w1;u2,v2,w2;... and node indices in [0, V-1]");
        }
    };

    const currentStep = steps[step - 1] || { dist: [], parent: [], visited: new Set(), unvisited: new Set(), current: -1, edge: null, message: "", };
    const pathEdges = getPathEdges(currentStep.parent || []);

    return (
        <div className="visualizer-fullscreen">
            <div className="visualizer-title">Dijkstra's Algorithm</div>
            <div className="visualizer-desc">
                Find shortest paths from a source node to all other nodes in a weighted graph.
            </div>
            <Legend />
            
            <div className="visualizer-controls" style={{ flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <label>Nodes:</label>
                    <input
                        type="number"
                        min="3"
                        max="10"
                        value={V}
                        onChange={(e) => setV(Math.min(10, Math.max(3, parseInt(e.target.value) || 3)))}
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
                
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <label>Edges:</label>
                    <input
                        type="number"
                        min={V - 1}
                        max={V * (V - 1) / 2}
                        value={E}
                        onChange={(e) => setE(Math.min(V * (V - 1) / 2, Math.max(V - 1, parseInt(e.target.value) || V - 1)))}
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

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <label>Source:</label>
                    <input
                        type="number"
                        min="0"
                        max={V - 1}
                        value={src}
                        onChange={(e) => setSrc(Math.min(V - 1, Math.max(0, parseInt(e.target.value) || 0)))}
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
            </div>

            <div className="visualizer-controls" style={{ flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                <input
                    type="text"
                    placeholder="e.g. 0,1,4;1,2,8;2,3,2"
                    value={customInput}
                    onChange={handleCustomInput}
                    style={{
                        width: 300,
                        borderRadius: 4,
                        border: "1px solid #bfc0c0",
                        padding: "4px 8px",
                        fontSize: "1rem"
                    }}
                    disabled={isAnimating}
                />
                <button
                    className="visualizer-btn"
                    onClick={handleSetGraph}
                    disabled={isAnimating}
                >
                    Set Graph
                </button>
            </div>

            {inputError && (
                <div style={{ color: "#d32f2f", fontWeight: "bold", margin: "8px 0" }}>
                    {inputError}
                </div>
            )}

            <div style={{ width: 600, height: 400, margin: "0 auto", position: "relative" }}>
                <svg width={600} height={400}>
                    {/* Draw all edges */}
                    {edges.map(([u, v, w], i) => {
                        const pos1 = getNodePosition(u, V);
                        const pos2 = getNodePosition(v, V);
                        // Highlight if this is the edge being considered
                        let stroke = "#bfc0c0";
                        let strokeWidth = 2;
                        if (currentStep.edge && ((currentStep.edge[0] === u && currentStep.edge[1] === v) || (currentStep.edge[0] === v && currentStep.edge[1] === u))) {
                            stroke = "#4a4e69";
                            strokeWidth = 4;
                        } else if (pathEdges.some(([a, b]) => (a === u && b === v) || (a === v && b === u))) {
                            stroke = "#1976d2";
                            strokeWidth = 3;
                        }
                        // Calculate midpoint for edge weight
                        const mx = (pos1.x + pos2.x) / 2;
                        const my = (pos1.y + pos2.y) / 2;
                        return (
                            <g key={i}>
                                <line
                                    x1={pos1.x}
                                    y1={pos1.y}
                                    x2={pos2.x}
                                    y2={pos2.y}
                                    stroke={stroke}
                                    strokeWidth={strokeWidth}
                                />
                                {/* Edge weight badge */}
                                <rect
                                    x={mx - 16}
                                    y={my - 16}
                                    width={32}
                                    height={20}
                                    rx={6}
                                    fill="#fffbe6"
                                    stroke="#bfc0c0"
                                    strokeWidth={1}
                                />
                                <text
                                    x={mx}
                                    y={my}
                                    textAnchor="middle"
                                    fill="#4a4e69"
                                    fontSize="13"
                                    fontWeight="bold"
                                    alignmentBaseline="middle"
                                >
                                    {w}
                                </text>
                            </g>
                        );
                    })}

                    {/* Draw nodes */}
                    {Array.from({ length: V }).map((_, i) => {
                        const pos = getNodePosition(i, V);
                        let color = "#a3cef1"; // Unvisited
                        if (currentStep.visited && currentStep.visited.has(i)) color = "#ffb703"; // Visited
                        if (i === currentStep.current) color = "#8bc34a"; // Current
                        
                        return (
                            <g key={i}>
                                <circle
                                    cx={pos.x}
                                    cy={pos.y}
                                    r={20}
                                    fill={color}
                                    stroke="#4a4e69"
                                    strokeWidth="2"
                                />
                                <text
                                    x={pos.x}
                                    y={pos.y + 6}
                                    textAnchor="middle"
                                    fill="#22223b"
                                    fontWeight="bold"
                                    fontSize="16"
                                >
                                    {i}
                                </text>
                                {/* Distance below node */}
                                <text
                                    x={pos.x}
                                    y={pos.y + 28}
                                    textAnchor="middle"
                                    fill="#222"
                                    fontSize="13"
                                    fontWeight="bold"
                                >
                                    {currentStep.dist && (typeof currentStep.dist[i] !== 'undefined') ? `d=${currentStep.dist[i] === Number.MAX_SAFE_INTEGER ? "∞" : currentStep.dist[i]}` : ''}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            <div style={{ margin: "18px 0", fontWeight: "bold", fontSize: "1.1rem", color: "#1976d2" }}>
                {step === 0
                    ? "Start Dijkstra's algorithm from the source node."
                    : step < steps.length
                        ? currentStep.message
                        : "Algorithm complete!"}
            </div>

            <div style={{ margin: "16px 0" }}>
                <h4 style={{ color: "#4a4e69", marginBottom: 8 }}>Current Distances:</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {currentStep.dist && currentStep.dist.map((d, i) => (
                        <span
                            key={i}
                            style={{
                                padding: "4px 8px",
                                background: "#f0f0f0",
                                borderRadius: 4,
                                fontSize: "0.9rem"
                            }}
                        >
                            {i}: {d === Number.MAX_SAFE_INTEGER ? "∞" : d}
                        </span>
                    ))}
                </div>
            </div>

            <div style={{ margin: "16px 0" }}>
                <h4 style={{ color: "#4a4e69", marginBottom: 8 }}>Visited / Unvisited Nodes:</h4>
                <div style={{ display: "flex", gap: 16 }}>
                    <div>
                        <b>Visited:</b> {Array.from(currentStep.visited || []).join(", ")}
                    </div>
                    <div>
                        <b>Unvisited:</b> {Array.from(currentStep.unvisited || []).join(", ")}
                    </div>
                </div>
            </div>

            {/* Styled Code Block */}
            <div style={{ marginTop: 32 }}>
                <h4 style={{ color: "#4a4e69", marginBottom: 8 }}>Dijkstra's Algorithm (JavaScript)</h4>
                <pre className="visualizer-code" style={{ background: "#232946", color: "#eebbc3", borderRadius: 8, padding: 16, fontSize: 15, overflowX: "auto" }}>
{`function dijkstra(V, edges, src) {
  const adj = constructAdj(edges, V);
  const minHeap = new MinHeap();
  const dist = Array(V).fill(Infinity);
  const visited = new Set();
  
  minHeap.push([0, src]);
  dist[src] = 0;
  
  while (minHeap.size() > 0) {
    const [d, u] = minHeap.pop();
    if (visited.has(u)) continue;
    visited.add(u);
    
    for (const [v, weight] of adj[u]) {
      if (dist[v] > dist[u] + weight) {
        dist[v] = dist[u] + weight;
        minHeap.push([dist[v], v]);
      }
    }
  }
  
  return dist;
}`}
                </pre>
            </div>
        </div>
    );
}