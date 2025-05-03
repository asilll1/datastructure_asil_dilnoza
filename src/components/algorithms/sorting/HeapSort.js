import React, { useState } from "react";

// Helper to generate a random array
function getRandomArray(size, min = 1, max = 99) {
    return Array.from({ length: size }, () =>
        Math.floor(Math.random() * (max - min + 1)) + min
    );
}

// Heap sort steps generator
function heapSortSteps(arr, order = "asc") {
    let steps = [];
    let a = arr.slice();
    let n = a.length;
    const isMaxHeap = order === "asc";
    const compare = isMaxHeap
        ? (x, y) => x > y
        : (x, y) => x < y;

    function heapify(n, i) {
        let extreme = i;
        let l = 2 * i + 1;
        let r = 2 * i + 2;

        if (l < n && compare(a[l], a[extreme])) extreme = l;
        if (r < n && compare(a[r], a[extreme])) extreme = r;

        steps.push({
            array: a.slice(),
            heapSize: n,
            current: i,
            extreme,
            left: l < n ? l : null,
            right: r < n ? r : null,
            phase: "heapify",
            isMaxHeap
        });

        if (extreme !== i) {
            [a[i], a[extreme]] = [a[extreme], a[i]];
            steps.push({
                array: a.slice(),
                heapSize: n,
                current: i,
                extreme,
                left: l < n ? l : null,
                right: r < n ? r : null,
                phase: "swap",
                isMaxHeap
            });
            heapify(n, extreme);
        }
    }

    // Build heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(n, i);
    }

    // Extract elements from heap
    for (let i = n - 1; i > 0; i--) {
        [a[0], a[i]] = [a[i], a[0]];
        steps.push({
            array: a.slice(),
            heapSize: i,
            current: 0,
            extreme: i,
            left: null,
            right: null,
            phase: "extract",
            isMaxHeap
        });
        heapify(i, 0);
    }

    steps.push({
        array: a.slice(),
        heapSize: 0,
        current: null,
        extreme: null,
        left: null,
        right: null,
        phase: "done",
        isMaxHeap
    });

    return steps;
}

// Calculate tree node positions for SVG rendering
function getTreeLayout(array, heapSize) {
    const levels = [];
    let level = 0;
    let count = 0;
    while (count < heapSize) {
        const nodesInLevel = Math.pow(2, level);
        levels.push({
            start: count,
            end: Math.min(count + nodesInLevel, heapSize)
        });
        count += nodesInLevel;
        level++;
    }

    // Assign x positions evenly for each node in a level
    const nodePositions = {};
    const width = 400;
    const height = 60 * levels.length;
    levels.forEach((lvl, i) => {
        const nodes = lvl.end - lvl.start;
        for (let j = 0; j < nodes; j++) {
            const idx = lvl.start + j;
            nodePositions[idx] = {
                x: width / (nodes + 1) * (j + 1),
                y: 40 + i * 60
            };
        }
    });
    return { nodePositions, width, height };
}

function HeapTreeSVG({ array, heapSize, highlight }) {
    const { nodePositions, width, height } = getTreeLayout(array, heapSize);

    // Draw edges
    const edges = [];
    for (let i = 0; i < heapSize; i++) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        if (left < heapSize) {
            edges.push(
                <line
                    key={`edge-${i}-${left}`}
                    x1={nodePositions[i].x}
                    y1={nodePositions[i].y}
                    x2={nodePositions[left].x}
                    y2={nodePositions[left].y}
                    stroke="#bfc0c0"
                    strokeWidth="2"
                />
            );
        }
        if (right < heapSize) {
            edges.push(
                <line
                    key={`edge-${i}-${right}`}
                    x1={nodePositions[i].x}
                    y1={nodePositions[i].y}
                    x2={nodePositions[right].x}
                    y2={nodePositions[right].y}
                    stroke="#bfc0c0"
                    strokeWidth="2"
                />
            );
        }
    }

    // Draw nodes
    const nodes = [];
    for (let i = 0; i < heapSize; i++) {
        let color = "#a3cef1";
        if (highlight.current === i) color = "#ffb703";
        if (highlight.extreme === i) color = "#fb8500";
        if (highlight.left === i) color = "#219ebc";
        if (highlight.right === i) color = "#8ecae6";
        if (highlight.phase === "extract" && i >= highlight.heapSize) color = "#bfc0c0";
        if (highlight.phase === "done") color = "#8bc34a";
        nodes.push(
            <g key={`node-${i}`}>
                <circle
                    cx={nodePositions[i].x}
                    cy={nodePositions[i].y}
                    r={20}
                    fill={color}
                    stroke="#4a4e69"
                    strokeWidth="2"
                />
                <text
                    x={nodePositions[i].x}
                    y={nodePositions[i].y + 6}
                    textAnchor="middle"
                    fontWeight="bold"
                    fontSize="1.1rem"
                    fill="#22223b"
                >
                    {array[i]}
                </text>
            </g>
        );
    }

    return (
        <svg width={width} height={height} style={{ background: "none" }}>
            {edges}
            {nodes}
        </svg>
    );
}

function Legend() {
    return (
        <div style={{ display: "flex", gap: 16, margin: "16px 0", flexWrap: "wrap" }}>
            <LegendItem color="#ffb703" label="Current Node" />
            <LegendItem color="#fb8500" label="Extreme (Max/Min) Node" />
            <LegendItem color="#219ebc" label="Left Child" />
            <LegendItem color="#8ecae6" label="Right Child" />
            <LegendItem color="#8bc34a" label="Sorted" />
            <LegendItem color="#bfc0c0" label="Extracted" />
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

export default function HeapSortVisualizer() {
    const [arraySize, setArraySize] = useState(7);
    const [array, setArray] = useState(getRandomArray(7));
    const [order, setOrder] = useState("asc");
    const [steps, setSteps] = useState(heapSortSteps(array, order));
    const [step, setStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    React.useEffect(() => {
        setSteps(heapSortSteps(array, order));
        setStep(0);
    }, [array, order]);

    const handleArraySizeChange = (e) => {
        const size = Math.max(2, Math.min(10, Number(e.target.value)));
        setArraySize(size);
        setArray(getRandomArray(size));
    };

    const handleRandomize = () => {
        setArray(getRandomArray(arraySize));
    };

    const handleOrderChange = (e) => {
        setOrder(e.target.value);
    };

    const handleAutoPlay = async () => {
        setIsAnimating(true);
        for (let i = step + 1; i < steps.length; i++) {
            await new Promise((res) => setTimeout(res, 700));
            setStep(i);
        }
        setIsAnimating(false);
    };

    const current = steps[step];

    return (
        <div className="visualizer-fullscreen">
            <div className="visualizer-title">Heap Sort</div>
            <div className="visualizer-desc">
                Heap Sort builds a heap from the array, then repeatedly extracts the root and rebuilds the heap.
                <br />
                <b>
                    {order === "asc" ? "Max Heapify (for Ascending Sort)" : "Min Heapify (for Descending Sort)"}
                </b>
            </div>
            <Legend />
            <div className="visualizer-controls">
                <label>
                    <span style={{ color: "#4a4e69", fontWeight: 500 }}>Array size:</span>&nbsp;
                    <input
                        type="number"
                        min={2}
                        max={10}
                        value={arraySize}
                        onChange={handleArraySizeChange}
                        disabled={isAnimating}
                        style={{
                            width: 50,
                            borderRadius: 4,
                            border: "1px solid #bfc0c0",
                            padding: "4px 8px",
                            fontSize: "1rem"
                        }}
                    />
                </label>
                <button className="visualizer-btn" onClick={handleRandomize} disabled={isAnimating}>
                    Randomize
                </button>
                <label style={{ marginLeft: 16, color: "#4a4e69", fontWeight: 500 }}>
                    Order:&nbsp;
                    <select
                        value={order}
                        onChange={handleOrderChange}
                        disabled={isAnimating}
                        style={{
                            borderRadius: 4,
                            border: "1px solid #bfc0c0",
                            padding: "4px 8px",
                            fontSize: "1rem"
                        }}
                    >
                        <option value="asc">Ascending (Max Heapify)</option>
                        <option value="desc">Descending (Min Heapify)</option>
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
            <div style={{ display: "flex", gap: 40, flexWrap: "wrap", justifyContent: "center" }}>
                <div>
                    <div style={{ textAlign: "center", color: "#4a4e69", fontWeight: 500, marginBottom: 8 }}>
                        Heap as Array
                    </div>
                    <div className="visualizer-array">
                        {current.array.map((num, idx) => {
                            let color = "#a3cef1";
                            if (idx === current.current) color = "#ffb703";
                            if (idx === current.extreme) color = "#fb8500";
                            if (idx === current.left) color = "#219ebc";
                            if (idx === current.right) color = "#8ecae6";
                            if (step === steps.length - 1) color = "#8bc34a";
                            if (current.phase === "extract" && idx >= current.heapSize) color = "#bfc0c0";
                            return (
                                <div
                                    key={idx}
                                    className="visualizer-bar"
                                    style={{
                                        height: num * 3 + 20,
                                        width: 34,
                                        background: color,
                                        color: "#22223b",
                                        fontSize: "1.1rem"
                                    }}
                                >
                                    {num}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div>
                    <div style={{ textAlign: "center", color: "#4a4e69", fontWeight: 500, marginBottom: 8 }}>
                        Heap as Tree
                    </div>
                    <div style={{ minWidth: 420, minHeight: 180, background: "none" }}>
                        <HeapTreeSVG
                            array={current.array}
                            heapSize={current.heapSize || current.array.length}
                            highlight={current}
                        />
                    </div>
                </div>
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
                <h4 style={{ color: "#4a4e69", marginTop: 32, marginBottom: 8 }}>Heap Sort (JavaScript)</h4>
                <pre className="visualizer-code">
{`function heapSort(arr, order = "asc") {
  const compare = order === "asc"
    ? (x, y) => x > y
    : (x, y) => x < y;
  let n = arr.length;
  function heapify(n, i) {
    let extreme = i, l = 2*i+1, r = 2*i+2;
    if (l < n && compare(arr[l], arr[extreme])) extreme = l;
    if (r < n && compare(arr[r], arr[extreme])) extreme = r;
    if (extreme !== i) {
      [arr[i], arr[extreme]] = [arr[extreme], arr[i]];
      heapify(n, extreme);
    }
  }
  for (let i = Math.floor(n/2)-1; i>=0; i--) heapify(n, i);
  for (let i = n-1; i>0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(i, 0);
  }
  return arr;
}`}
        </pre>
            </div>
        </div>
    );
}