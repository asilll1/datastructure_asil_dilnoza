import React, { useState } from "react";

function getRandomArray(size, min = 0, max = 9) {
    return Array.from({ length: size }, () =>
        Math.floor(Math.random() * (max - min + 1)) + min
    );
}

function countingSortSteps(arr, order = "asc") {
    let steps = [];
    let a = arr.slice();
    let n = a.length;
    let max = Math.max(...a);
    let min = Math.min(...a);
    let range = max - min + 1;
    let count = Array(range).fill(0);
    let output = Array(n).fill(0);

    // Count occurrences
    for (let i = 0; i < n; i++) {
        count[a[i] - min]++;
        steps.push({
            array: a.slice(),
            count: count.slice(),
            output: output.slice(),
            highlight: i,
            phase: "counting"
        });
    }

    // Accumulate counts
    if (order === "asc") {
        for (let i = 1; i < range; i++) {
            count[i] += count[i - 1];
            steps.push({
                array: a.slice(),
                count: count.slice(),
                output: output.slice(),
                highlight: i,
                phase: "accumulating"
            });
        }
    } else {
        for (let i = range - 2; i >= 0; i--) {
            count[i] += count[i + 1];
            steps.push({
                array: a.slice(),
                count: count.slice(),
                output: output.slice(),
                highlight: i,
                phase: "accumulating"
            });
        }
    }

    // Build output array
    if (order === "asc") {
        for (let i = n - 1; i >= 0; i--) {
            output[count[a[i] - min] - 1] = a[i];
            count[a[i] - min]--;
            steps.push({
                array: a.slice(),
                count: count.slice(),
                output: output.slice(),
                highlight: i,
                phase: "output"
            });
        }
    } else {
        for (let i = 0; i < n; i++) {
            output[count[a[i] - min] - 1] = a[i];
            count[a[i] - min]--;
            steps.push({
                array: a.slice(),
                count: count.slice(),
                output: output.slice(),
                highlight: i,
                phase: "output"
            });
        }
    }

    // Copy output to arr
    for (let i = 0; i < n; i++) {
        a[i] = output[i];
        steps.push({
            array: a.slice(),
            count: count.slice(),
            output: output.slice(),
            highlight: i,
            phase: "copy"
        });
    }

    steps.push({
        array: a.slice(),
        count: count.slice(),
        output: output.slice(),
        highlight: null,
        phase: "done"
    });

    return steps;
}

export default function CountingSortVisualizer() {
    const [arraySize, setArraySize] = useState(7);
    const [array, setArray] = useState(getRandomArray(7));
    const [order, setOrder] = useState("asc");
    const [steps, setSteps] = useState(countingSortSteps(array, order));
    const [step, setStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    React.useEffect(() => {
        setSteps(countingSortSteps(array, order));
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
            await new Promise((res) => setTimeout(res, 500));
            setStep(i);
        }
        setIsAnimating(false);
    };

    const current = steps[step];

    return (
        <div className="visualizer-fullscreen">
            <div className="visualizer-title">Counting Sort</div>
            <div className="visualizer-desc">
                Counting Sort is an integer sorting algorithm that counts the number of occurrences of each value, then calculates positions and builds the sorted array.
            </div>
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
                    if (current.highlight === idx) color = "#ffb703";
                    if (step === steps.length - 1) color = "#8bc34a";
                    return (
                        <div
                            key={idx}
                            className="visualizer-bar"
                            style={{
                                height: num * 18 + 20,
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
            {current.count && (
                <div style={{ margin: "16px 0" }}>
                    <b style={{ color: "#4a4e69" }}>Count array:</b>
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                        {current.count.map((c, i) => (
                            <div
                                key={i}
                                style={{
                                    background: "#f5f5f5",
                                    borderRadius: 4,
                                    padding: "4px 8px",
                                    border: "1px solid #bfc0c0",
                                    color: "#22223b"
                                }}
                            >
                                {i}: {c}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {current.output && (
                <div style={{ margin: "16px 0" }}>
                    <b style={{ color: "#4a4e69" }}>Output array:</b>
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                        {current.output.map((c, i) => (
                            <div
                                key={i}
                                style={{
                                    background: "#f5f5f5",
                                    borderRadius: 4,
                                    padding: "4px 8px",
                                    border: "1px solid #bfc0c0",
                                    color: "#22223b"
                                }}
                            >
                                {c}
                            </div>
                        ))}
                    </div>
                </div>
            )}
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
                <h4 style={{ color: "#4a4e69", marginTop: 32, marginBottom: 8 }}>Counting Sort (JavaScript)</h4>
                <pre className="visualizer-code">
{`function countingSort(arr, order = "asc") {
  let max = Math.max(...arr);
  let min = Math.min(...arr);
  let range = max - min + 1;
  let count = Array(range).fill(0);
  let output = Array(arr.length).fill(0);

  for (let i = 0; i < arr.length; i++) count[arr[i] - min]++;
  if (order === "asc") {
    for (let i = 1; i < range; i++) count[i] += count[i - 1];
    for (let i = arr.length - 1; i >= 0; i--) {
      output[count[arr[i] - min] - 1] = arr[i];
      count[arr[i] - min]--;
    }
  } else {
    for (let i = range - 2; i >= 0; i--) count[i] += count[i + 1];
    for (let i = 0; i < arr.length; i++) {
      output[count[arr[i] - min] - 1] = arr[i];
      count[arr[i] - min]--;
    }
  }
  for (let i = 0; i < arr.length; i++) arr[i] = output[i];
  return arr;
}`}
        </pre>
            </div>
        </div>
    );
}