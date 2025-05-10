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

function getDigit(num, place) {
    return Math.floor(num / place) % 10;
}

function radixSortSteps(arr) {
    let steps = [];
    let a = arr.slice();
    let max = getMax(a);
    let maxDigits = Math.floor(Math.log10(max)) + 1;

    // Initialize buckets for each digit (0-9)
    let buckets = Array.from({ length: 10 }, () => []);

    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
        // Clear buckets
        buckets = Array.from({ length: 10 }, () => []);
        
        // Record initial state
        steps.push({
            array: a.slice(),
            buckets: buckets.map(b => [...b]),
            exp,
            currentDigit: null,
            phase: "start",
            message: `Sorting by ${exp === 1 ? "ones" : exp === 10 ? "tens" : "hundreds"} place`
        });

        // Distribute numbers into buckets
        for (let i = 0; i < a.length; i++) {
            const digit = getDigit(a[i], exp);
            buckets[digit].push(a[i]);
            
            steps.push({
                array: a.slice(),
                buckets: buckets.map(b => [...b]),
                exp,
                currentDigit: digit,
                currentNumber: a[i],
                phase: "distribute",
                message: `Placing ${a[i]} in bucket ${digit}`
            });
        }

        // Collect numbers from buckets
        let index = 0;
        for (let i = 0; i < 10; i++) {
            while (buckets[i].length > 0) {
                a[index] = buckets[i].shift();
                steps.push({
                    array: a.slice(),
                    buckets: buckets.map(b => [...b]),
                    exp,
                    currentDigit: i,
                    currentNumber: a[index],
                    phase: "collect",
                    message: `Collecting ${a[index]} from bucket ${i}`
                });
                index++;
            }
        }
    }

    steps.push({
        array: a.slice(),
        buckets: Array.from({ length: 10 }, () => []),
        exp: null,
        currentDigit: null,
        phase: "done",
        message: "Sorting complete!"
    });

    return steps;
}

function Bucket({ numbers, digit, isActive, isCollecting }) {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            padding: "8px",
            background: isActive ? "#f0f0f0" : "white",
            borderRadius: 8,
            border: `2px solid ${isActive ? "#4a4e69" : "#bfc0c0"}`,
            minWidth: 60,
            minHeight: 100
        }}>
            <div style={{ 
                fontWeight: "bold", 
                color: "#4a4e69",
                marginBottom: 4
            }}>
                {digit}
            </div>
            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                alignItems: "center"
            }}>
                {numbers.map((num, idx) => (
                    <div
                        key={idx}
                        style={{
                            background: isCollecting ? "#8bc34a" : "#a3cef1",
                            padding: "4px 8px",
                            borderRadius: 4,
                            color: "#22223b",
                            fontWeight: "bold",
                            transition: "all 0.3s ease"
                        }}
                    >
                        {num}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function RadixSortVisualizer() {
    const [arraySize, setArraySize] = useState(5);
    const [array, setArray] = useState(getRandomArray(5));
    const [customInput, setCustomInput] = useState("");
    const [steps, setSteps] = useState(radixSortSteps(array));
    const [step, setStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [inputError, setInputError] = useState("");

    React.useEffect(() => {
        setSteps(radixSortSteps(array));
        setStep(0);
    }, [array]);

    const handleArraySizeChange = (e) => {
        const size = Math.max(2, Math.min(10, Number(e.target.value)));
        setArraySize(size);
        setArray(getRandomArray(size));
        setInputError("");
    };

    const handleCustomInput = (e) => {
        setCustomInput(e.target.value);
        setInputError("");
    };

    const handleSetCustomArray = () => {
        const numbers = customInput
            .split(",")
            .map(s => Number(s.trim()))
            .filter(n => !isNaN(n) && n >= 0 && n <= 999);

        if (numbers.length === 0) {
            setInputError("Please enter valid numbers (0-999) separated by commas");
            return;
        }

        setArray(numbers);
        setInputError("");
    };

    const handleRandomize = () => {
        setArray(getRandomArray(arraySize));
        setCustomInput("");
        setInputError("");
    };

    const handleAutoPlay = async () => {
        setIsAnimating(true);
        for (let i = step + 1; i < steps.length; i++) {
            await new Promise((res) => setTimeout(res, 800));
            setStep(i);
        }
        setIsAnimating(false);
    };

    const current = steps[step];

    return (
        <div className="visualizer-fullscreen">
            <div className="visualizer-title">Radix Sort</div>
            <div className="visualizer-desc">
                Radix Sort sorts numbers by processing individual digits. It uses buckets to sort by each digit, starting from the least significant digit.
            </div>

            <div className="visualizer-controls" style={{ flexWrap: "wrap", gap: 16 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
                    <button 
                        className="visualizer-btn" 
                        onClick={handleRandomize} 
                        disabled={isAnimating}
                    >
                        Randomize
                    </button>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                        type="text"
                        placeholder="Enter numbers (e.g., 123, 45, 678)"
                        value={customInput}
                        onChange={handleCustomInput}
                        disabled={isAnimating}
                        style={{
                            width: 250,
                            borderRadius: 4,
                            border: "1px solid #bfc0c0",
                            padding: "4px 8px",
                            fontSize: "1rem"
                        }}
                    />
                    <button
                        className="visualizer-btn"
                        onClick={handleSetCustomArray}
                        disabled={isAnimating}
                    >
                        Set Array
                    </button>
                </div>

                <button
                    className="visualizer-btn"
                    onClick={handleAutoPlay}
                    disabled={isAnimating || step === steps.length - 1}
                >
                    Auto Play
                </button>
            </div>

            {inputError && (
                <div style={{ color: "#d32f2f", fontWeight: "bold", margin: "8px 0" }}>
                    {inputError}
                </div>
            )}

            <div style={{ margin: "16px 0", textAlign: "center", color: "#4a4e69", fontWeight: "bold" }}>
                {current.message}
            </div>

            <div className="visualizer-array" style={{ marginBottom: 24 }}>
                {current.array.map((num, idx) => (
                    <div
                        key={idx}
                        className="visualizer-bar"
                        style={{
                            height: (num / 999) * 180 + 20,
                            width: 44,
                            background: current.phase === "done" ? "#8bc34a" : "#a3cef1",
                            color: "#22223b",
                            fontSize: "1.1rem",
                            transition: "all 0.3s ease"
                        }}
                    >
                        {num}
                    </div>
                ))}
            </div>

            {current.phase !== "done" && (
                <div style={{ margin: "24px 0" }}>
                    <div style={{ 
                        display: "flex", 
                        justifyContent: "center", 
                        gap: 16,
                        flexWrap: "wrap"
                    }}>
                        {current.buckets.map((numbers, digit) => (
                            <Bucket
                                key={digit}
                                numbers={numbers}
                                digit={digit}
                                isActive={current.currentDigit === digit}
                                isCollecting={current.phase === "collect" && current.currentDigit === digit}
                            />
                        ))}
                    </div>
                </div>
            )}

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