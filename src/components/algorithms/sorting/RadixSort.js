import React, { useState } from "react";

function getRandomArray(size, min = 1, max = 999) {
    return Array.from({ length: size }, () =>
        Math.floor(Math.random() * (max - min + 1)) + min
    );
}

// Only supports non-negative integers for simplicity
function getMax(arr) {
    return Math.max(...arr);
}

function countingSortForRadix(arr, exp, steps) {
    let n = arr.length;
    let output = Array(n).fill(0);
    let count = Array(10).fill(0);

    // Store count of occurrences
    for (let i = 0; i < n; i++) {
        count[Math.floor(arr[i] / exp) % 10]++;
        steps.push({
            array: arr.slice(),
            exp,
            count: count.slice(),
            output: output.slice(),
            highlight: i,
            phase: "counting"
        });
    }

    // Change count[i] so that count[i] contains actual position
    for (let i = 1; i < 10; i++) {
        count[i] += count[i - 1];
        steps.push({
            array: arr.slice(),
            exp,
            count: count.slice(),
            output: output.slice(),
            highlight: i,
            phase: "accumulating"
        });
    }

    // Build the output array
    for (let i = n - 1; i >= 0; i--) {
        let idx = Math.floor(arr[i] / exp) % 10;
        output[count[idx] - 1] = arr[i];
        count[idx]--;
        steps.push({
            array: arr.slice(),
            exp,
            count: count.slice(),
            output: output.slice(),
            highlight: i,
            phase: "output"
        });
    }

    // Copy output to arr
    for (let i = 0; i < n; i++) {
        arr[i] = output[i];
        steps.push({
            array: arr.slice(),
            exp,
            count: count.slice(),
            output: output.slice(),
            highlight: i,
            phase: "copy"
        });
    }
}

function radixSortSteps(arr) {
    let steps = [];
    let a = arr.slice();
    let max = getMax(a);

    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
        countingSortForRadix(a, exp, steps);
    }
    steps.push({
        array: a.slice(),
        exp: null,
        count: null,
        output: null,
        highlight: null,
        phase: "done"
    });
    return steps;
}

export default function RadixSortVisualizer() {
    const [arraySize, setArraySize] = useState(5);
    const [array, setArray] = useState(getRandomArray(5));
    const [steps, setSteps] = useState(radixSortSteps(array));
    const [step, setStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    React.useEffect(() => {
        setSteps(radixSortSteps(array));
        setStep(0);
    }, [array]);

    const handleArraySizeChange = (e) => {
        const size = Math.max(2, Math.min(10, Number(e.target.value)));
        setArraySize(size);
        setArray(getRandomArray(size));
    };

    const handleRandomize = () => {
        setArray(getRandomArray(arraySize));
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
            <div className="visualizer-title">Radix Sort</div>
            <div className="visualizer-desc">
                Radix Sort sorts numbers by processing individual digits. It uses Counting Sort as a subroutine to sort by each digit, starting from the least significant digit.
            </div>
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
                                height: (num / 999) * 180 + 20,
                                width: 44,
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
            {current.exp && (
                <div style={{ margin: "16px 0", color: "#4a4e69" }}>
                    <b>Current digit place:</b> {current.exp}
                </div>
            )}
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
                <h4 style={{ color: "#4a4e69", marginTop: 32, marginBottom: 8 }}>Radix Sort (JavaScript)</h4>
                <pre className="visualizer-code">
{`function radixSort(arr) {
  let max = Math.max(...arr);
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    countingSortForRadix(arr, exp);
  }
  return arr;
}`}
        </pre>
            </div>
        </div>
    );
}