import React, { useState } from "react";

// Example weighted undirected graph
const defaultGraph = {
    A: [{ node: "B", weight: 2 }, { node: "C", weight: 4 }],
    B: [{ node: "A", weight: 2 }, { node: "C", weight: 1 }, { node: "D", weight: 7 }],
    C: [{ node: "A", weight: 4 }, { node: "B", weight: 1 }, { node: "E", weight: 3 }],
    D: [{ node: "B", weight: 7 }, { node: "E", weight: 1 }, { node: "F", weight: 5 }],
    E: [{ node: "C", weight: 3 }, { node: "D", weight: 1 }, { node: "F", weight: 7 }],
    F: [{ node: "D", weight: 5 }, { node: "E", weight: 7 }],
};

const nodePositions = {
    A: { x: 300, y: 60 },
    B: { x: 180, y: 160 },
    C: { x: 420, y: 160 },
    D: { x: 120, y: 300 },
    E: { x: 300, y: 340 },
    F: { x: 480, y: 300 },
};

function dijkstraSteps(graph, start) {
    let steps = [];
    let dist = {};
    let prev = {};
    let visited = {};
    Object.keys(graph).forEach((n) => (dist[n] = Infinity));
    dist[start] = 0;

    let queue = Object.keys(graph);

    while (queue.length) {
        let u = queue.reduce((min, n) => (dist[n] < dist[min] ? n : min), queue[0]);
        queue = queue.filter((n) => n !== u);
        visited[u] = true;
        steps.push({
            dist: { ...dist },
            prev: { ...prev },
            visited: { ...visited },
            current: u,
            action: `Visit node ${u} (distance: ${dist[u]})`,
        });
        for (let { node: v, weight } of graph[u]) {
            if (!visited[v] && dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                prev[v] = u;
                steps.push({
                    dist: { ...dist },
                    prev: { ...prev },
                    visited: { ...visited },
                    current: v,
                    action: `Update distance of ${v} to ${dist[v]} via ${u}`,
                });
            }
        }
    }
    return steps;
}

export default function DijkstraVisualizer() {
    const [graph] = useState(defaultGraph);
    const [startNode, setStartNode] = useState("A");
    const [steps, setSteps] = useState(dijkstraSteps(graph, "A"));
    const [step, setStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    React.useEffect(() => {
        setSteps(dijkstraSteps(graph, startNode));
        setStep(0);
    }, [graph, startNode]);

    const handleStartNodeChange = (e) => {
        setStartNode(e.target.value);
    };

    const handleAutoPlay = async () => {
        setIsAnimating(true);
        for (let i = step + 1; i < steps.length; i++) {
            await new Promise((res) => setTimeout(res, 900));
            setStep(i);
        }
        setIsAnimating(false);
    };

    const current = steps[step];

    return (
        <div className="visualizer-fullscreen">
            <div className="visualizer-title">Dijkstra's Algorithm Visualizer</div>
            <div className="visualizer-desc">
                Visualize Dijkstra's shortest path algorithm on a weighted undirected graph.
            </div>
            <div style={{ display: "flex", gap: 16, margin: "16px 0", flexWrap: "wrap" }}>
                <div style={{ color: "#ffb703", fontWeight: 500 }}>Yellow: Current Node</div>
                <div style={{ color: "#8bc34a", fontWeight: 500 }}>Green: Visited</div>
            </div>
            <div className="visualizer-controls" style={{ flexWrap: "wrap", gap: 8 }}>
                <label>
                    Start Node:&nbsp;
                    <select value={startNode} onChange={handleStartNodeChange} style={{ fontSize: "1rem" }}>
                        {Object.keys(graph).map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </label>
                <button
                    className="visualizer-btn"
                    onClick={handleAutoPlay}
                    disabled={isAnimating || step === steps.length - 1}
                >
                    Auto Play
                </button>
            </div>
            <div style={{ width: 600, height: 400, margin: "0 auto", background: "none", position: "relative" }}>
                <svg width={600} height={400} style={{ position: "absolute", left: 0, top: 0 }}>
                    {/* Edges with weights */}
                    {Object.entries(graph).map(([from, neighbors]) =>
                        neighbors.map(({ node: to, weight }) =>
                            from < to ? (
                                <g key={from + to}>
                                    <line
                                        x1={nodePositions[from].x}
                                        y1={nodePositions[from].y}
                                        x2={nodePositions[to].x}
                                        y2={nodePositions[to].y}
                                        stroke="#bfc0c0"
                                        strokeWidth="2"
                                    />
                                    <text
                                        x={(nodePositions[from].x + nodePositions[to].x) / 2}
                                        y={(nodePositions[from].y + nodePositions[to].y) / 2 - 8}
                                        textAnchor="middle"
                                        fontSize="1rem"
                                        fill="#4a4e69"
                                    >
                                        {weight}
                                    </text>
                                </g>
                            ) : null
                        )
                    )}
                </svg>
                {/* Nodes */}
                {Object.keys(graph).map((node) => {
                    let color = "#a3cef1";
                    if (current && current.visited && current.visited[node]) color = "#8bc34a";
                    if (current && current.current === node) color = "#ffb703";
                    return (
                        <div
                            key={node}
                            style={{
                                position: "absolute",
                                left: nodePositions[node].x - 20,
                                top: nodePositions[node].y - 20,
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
                                transition: "background 0.3s"
                            }}
                        >
                            {node}
                            <div style={{
                                position: "absolute",
                                bottom: -22,
                                left: "50%",
                                transform: "translateX(-50%)",
                                fontSize: "0.9rem",
                                color: "#4a4e69"
                            }}>
                                {current && current.dist && current.dist[node] !== undefined && current.dist[node] !== Infinity
                                    ? `d=${current.dist[node]}`
                                    : ""}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div style={{ margin: "18px 0", fontWeight: "bold", fontSize: "1.1rem", color: "#1976d2" }}>
                {step === 0
                    ? "Start Dijkstra's algorithm."
                    : step < steps.length
                        ? current.action
                        : "Dijkstra's algorithm complete!"}
            </div>
            <div className="visualizer-controls" style={{ justifyContent: "center" }}>
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
            <div>
                <h4 style={{ color: "#4a4e69", marginTop: 32, marginBottom: 8 }}>Dijkstra's Algorithm (JavaScript)</h4>
                <pre className="visualizer-code">
{`function dijkstra(graph, start) {
  let dist = {}, prev = {}, visited = {};
  Object.keys(graph).forEach(n => dist[n] = Infinity);
  dist[start] = 0;
  let queue = Object.keys(graph);
  while (queue.length) {
    let u = queue.reduce((min, n) => dist[n] < dist[min] ? n : min, queue[0]);
    queue = queue.filter(n => n !== u);
    visited[u] = true;
    for (let { node: v, weight } of graph[u]) {
      if (!visited[v] && dist[u] + weight < dist[v]) {
        dist[v] = dist[u] + weight;
        prev[v] = u;
      }
    }
  }
}`}
        </pre>
            </div>
        </div>
    );
}