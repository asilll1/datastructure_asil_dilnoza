import React, { useState } from "react";

function getRandomArray(size, min = 1, max = 20) {
    return Array.from({ length: size }, () =>
        Math.floor(Math.random() * (max - min + 1)) + min
    );
}

function insertionSortSteps(arr, order = "asc") {
    let steps = [];
    let a = arr.slice();
    let n = a.length;
    const compare = order === "asc"
        ? (x, y) => x < y
        : (x, y) => x > y;

    steps.push({ array: a.slice(), keyIdx: -1, comparedIdx: -1, swapped: false });
    for (let i = 1; i < n; i++) {
        let key = a[i];
        let j = i - 1;
        steps.push({ array: a.slice(), keyIdx: i, comparedIdx: j, swapped: false });
        while (j >= 0 && compare(key, a[j])) {
            a[j + 1] = a[j];
            steps.push({ array: a.slice(), keyIdx: i, comparedIdx: j, swapped: true });
            j = j - 1;
            if (j >= 0) {
                steps.push({ array: a.slice(), keyIdx: i, comparedIdx: j, swapped: false });
            }
        }
        a[j + 1] = key;
        steps.push({ array: a.slice(), keyIdx: j + 1, comparedIdx: -1, swapped: false });
    }
    steps.push({ array: a.slice(), keyIdx: -1, comparedIdx: -1, swapped: false });
    return steps;
}

export default function InsertionSortVisualizer() {
    const [arraySize, setArraySize] = useState(5);
    const [array, setArray] = useState(getRandomArray(5));
    const [order, setOrder] = useState("asc");
    const [steps, setSteps] = useState(insertionSortSteps(array, order));
    const [step, setStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    React.useEffect(() => {
        setSteps(insertionSortSteps(array, order));
        setStep(0);
    }, [array, order]);

    const handleArraySizeChange = (e) => {
        const size = Math.max(2, Math.min(15, Number(e.target.value)));
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
            <div className="visualizer-title">Insertion Sort</div>
            <div className="visualizer-desc">
                Insertion Sort builds the sorted array one item at a time by repeatedly taking the next element and inserting it into the correct position.
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
                    if (idx === current.keyIdx) color = "#ffb703";
                    if (idx === current.comparedIdx) color = "#fb8500";
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
                <h4 style={{ color: "#4a4e69", marginTop: 32, marginBottom: 8 }}>Insertion Sort (JavaScript)</h4>
                <pre className="visualizer-code">
{`function insertionSort(arr, order = "asc") {
  const compare = order === "asc"
    ? (x, y) => x < y
    : (x, y) => x > y;
  let n = arr.length;
  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && compare(key, arr[j])) {
      arr[j + 1] = arr[j];
      j = j - 1;
    }
    arr[j + 1] = key;
  }
  return arr;
}`}
        </pre>
            </div>
        </div>
    );
}