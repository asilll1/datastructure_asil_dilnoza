import React, { useState } from "react";

function getRandomArray(size, min = 1, max = 99) {
    return Array.from({ length: size }, () =>
        Math.floor(Math.random() * (max - min + 1)) + min
    );
}

// Helper to deep copy arrays of arrays
function deepCopy(val) {
    if (Array.isArray(val)) {
        return val.map(deepCopy);
    } else if (typeof val === "object" && val !== null) {
        const res = {};
        for (const k in val) res[k] = deepCopy(val[k]);
        return res;
    } else {
        return val;
    }
}
function mergeSortSteps(arr, order = "asc") {
    let steps = [];
    let a = arr.slice();
    const compare = order === "asc"
        ? (x, y) => x <= y
        : (x, y) => x >= y;

    function mergeSort(a, l, r, level = 0) {
        if (l >= r) return;
        const m = Math.floor((l + r) / 2);
        mergeSort(a, l, m, level + 1);
        mergeSort(a, m + 1, r, level + 1);

        // Merge step
        let left = a.slice(l, m + 1);
        let right = a.slice(m + 1, r + 1);
        let i = 0, j = 0, k = l;
        let highlight = { left: [], right: [], merged: [] };
        for (let idx = l; idx <= m; idx++) highlight.left.push(idx);
        for (let idx = m + 1; idx <= r; idx++) highlight.right.push(idx);

        steps.push({
            array: a.slice(),
            highlight: deepCopy(highlight),
            phase: "start-merge"
        });

        while (i < left.length && j < right.length) {
            highlight.merged = [k];
            steps.push({
                array: a.slice(),
                highlight: deepCopy(highlight),
                phase: "compare"
            });
            if (compare(left[i], right[j])) {
                a[k] = left[i];
                i++;
            } else {
                a[k] = right[j];
                j++;
            }
            steps.push({
                array: a.slice(),
                highlight: deepCopy(highlight),
                phase: "insert"
            });
            k++;
        }
        while (i < left.length) {
            highlight.merged = [k];
            steps.push({
                array: a.slice(),
                highlight: deepCopy(highlight),
                phase: "insert"
            });
            a[k] = left[i];
            i++;
            k++;
        }
        while (j < right.length) {
            highlight.merged = [k];
            steps.push({
                array: a.slice(),
                highlight: deepCopy(highlight),
                phase: "insert"
            });
            a[k] = right[j];
            j++;
            k++;
        }
        steps.push({
            array: a.slice(),
            highlight: deepCopy(highlight),
            phase: "merged"
        });
    }

    mergeSort(a, 0, a.length - 1);
    steps.push({
        array: a.slice(),
        highlight: { left: [], right: [], merged: [] },
        phase: "done"
    });
    return steps;
}

function Legend() {
    return (
        <div style={{ display: "flex", gap: 16, margin: "16px 0", flexWrap: "wrap" }}>
            <LegendItem color="#ffb703" label="Left Subarray" />
            <LegendItem color="#219ebc" label="Right Subarray" />
            <LegendItem color="#fb8500" label="Merging" />
            <LegendItem color="#8bc34a" label="Sorted" />
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

export default function MergeSortVisualizer() {
    const [arraySize, setArraySize] = useState(7);
    const [array, setArray] = useState(getRandomArray(7));
    const [order, setOrder] = useState("asc");
    const [steps, setSteps] = useState(mergeSortSteps(array, order));
    const [step, setStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    React.useEffect(() => {
        setSteps(mergeSortSteps(array, order));
        setStep(0);
    }, [array, order]);

    const handleArraySizeChange = (e) => {
        const size = Math.max(2, Math.min(12, Number(e.target.value)));
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
            <div className="visualizer-title">Merge Sort</div>
            <div className="visualizer-desc">
                Merge Sort is a divide-and-conquer algorithm that splits the array, sorts each half, and merges them.
                <br />
                <b>
                    {order === "asc" ? "Ascending" : "Descending"} order
                </b>
            </div>
            <Legend />
            <div className="visualizer-controls">
                <label>
                    <span style={{ color: "#4a4e69", fontWeight: 500 }}>Array size:</span>&nbsp;
                    <input
                        type="number"
                        min={2}
                        max={12}
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
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
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
            <div className="visualizer-array">
                {current.array.map((num, idx) => {
                    let color = "#a3cef1";
                    if (current.highlight && current.highlight.left && current.highlight.left.includes(idx)) color = "#ffb703";
                    if (current.highlight && current.highlight.right && current.highlight.right.includes(idx)) color = "#219ebc";
                    if (current.highlight && current.highlight.merged && current.highlight.merged.includes(idx)) color = "#fb8500";
                    if (step === steps.length - 1) color = "#8bc34a";
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
                <h4 style={{ color: "#4a4e69", marginTop: 32, marginBottom: 8 }}>Merge Sort (JavaScript)</h4>
                <pre className="visualizer-code">
{`function mergeSort(arr, order = "asc") {
  const compare = order === "asc"
    ? (x, y) => x <= y
    : (x, y) => x >= y;
  function mergeSortRec(a, l, r) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    mergeSortRec(a, l, m);
    mergeSortRec(a, m + 1, r);
    let left = a.slice(l, m + 1), right = a.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
      if (compare(left[i], right[j])) a[k++] = left[i++];
      else a[k++] = right[j++];
    }
    while (i < left.length) a[k++] = left[i++];
    while (j < right.length) a[k++] = right[j++];
  }
  mergeSortRec(arr, 0, arr.length - 1);
  return arr;
}`}
        </pre>
            </div>
        </div>
    );
}