import React, { useState } from "react";

function getRandomArray(size, min = 1, max = 99) {
    return Array.from({ length: size }, () =>
        Math.floor(Math.random() * (max - min + 1)) + min
    );
}

function linearSearchSteps(arr, target) {
    let steps = [];
    for (let i = 0; i < arr.length; i++) {
        steps.push({
            array: arr.slice(),
            current: i,
            found: arr[i] === target,
            target
        });
        if (arr[i] === target) break;
    }
    if (steps.length === 0 || !steps[steps.length - 1].found) {
        steps.push({
            array: arr.slice(),
            current: null,
            found: false,
            target
        });
    }
    return steps;
}

export default function LinearSearchVisualizer() {
    const [arraySize, setArraySize] = useState(8);
    const [array, setArray] = useState(getRandomArray(8));
    const [target, setTarget] = useState(array[0]);
    const [steps, setSteps] = useState(linearSearchSteps(array, target));
    const [step, setStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    React.useEffect(() => {
        setSteps(linearSearchSteps(array, target));
        setStep(0);
    }, [array, target]);

    const handleArraySizeChange = (e) => {
        const size = Math.max(2, Math.min(15, Number(e.target.value)));
        const newArr = getRandomArray(size);
        setArraySize(size);
        setArray(newArr);
        setTarget(newArr[0]);
    };

    const handleRandomize = () => {
        const newArr = getRandomArray(arraySize);
        setArray(newArr);
        setTarget(newArr[0]);
    };

    const handleTargetChange = (e) => {
        setTarget(Number(e.target.value));
    };

    const handleAutoPlay = async () => {
        setIsAnimating(true);
        for (let i = step + 1; i < steps.length; i++) {
            await new Promise((res) => setTimeout(res, 600));
            setStep(i);
        }
        setIsAnimating(false);
    };

    const current = steps[step];

    return (
        <div className="visualizer-fullscreen">
            <div className="visualizer-title">Linear Search</div>
            <div className="visualizer-desc">
                Linear Search checks each element in the array sequentially until the target is found or the end is reached.
            </div>
            <div style={{ display: "flex", gap: 16, margin: "16px 0", flexWrap: "wrap" }}>
                <div style={{ color: "#ffb703", fontWeight: 500 }}>Yellow: Current</div>
                <div style={{ color: "#8bc34a", fontWeight: 500 }}>Green: Found</div>
            </div>
            <div className="visualizer-controls">
                <label>
                    <span style={{ color: "#4a4e69", fontWeight: 500 }}>Array size:</span>&nbsp;
                    <input
                        type="number"
                        min={2}
                        max={15}
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
                    Target:&nbsp;
                    <input
                        type="number"
                        value={target}
                        onChange={handleTargetChange}
                        disabled={isAnimating}
                        style={{
                            width: 60,
                            borderRadius: 4,
                            border: "1px solid #bfc0c0",
                            padding: "4px 8px",
                            fontSize: "1rem"
                        }}
                    />
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
                    if (idx === current.current) color = "#ffb703";
                    if (current.found && idx === current.current) color = "#8bc34a";
                    return (
                        <div
                            key={idx}
                            className="visualizer-bar"
                            style={{
                                height: num * 2 + 20,
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
            {/* --- Result Message --- */}
            {step === steps.length - 1 && (
                <div style={{
                    margin: "18px 0",
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    color: current.found ? "#388e3c" : "#d32f2f"
                }}>
                    {current.found
                        ? `Found at index ${current.current}`
                        : "Not found"}
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
                <h4 style={{ color: "#4a4e69", marginTop: 32, marginBottom: 8 }}>Linear Search (JavaScript)</h4>
                <pre className="visualizer-code">
{`function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}`}
        </pre>
            </div>
        </div>
    );
}