import React, { useState } from "react";

function getRandomValue(min = 1, max = 99) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function StackVisualizer() {
    const [stack, setStack] = useState([getRandomValue(), getRandomValue()]);
    const [inputValue, setInputValue] = useState("");
    const [message, setMessage] = useState("");

    const handlePush = () => {
        let value = inputValue.trim();
        if (value === "") value = getRandomValue();
        setStack((prev) => [...prev, Number(value)]);
        setInputValue("");
        setMessage(`Pushed ${value} to stack`);
    };

    const handlePop = () => {
        if (stack.length === 0) {
            setMessage("Stack is empty!");
            return;
        }
        const popped = stack[stack.length - 1];
        setStack((prev) => prev.slice(0, -1));
        setMessage(`Popped ${popped} from stack`);
    };

    const handleRandom = () => {
        setStack([getRandomValue(), getRandomValue()]);
        setMessage("Stack reset with random values");
    };

    return (
        <div className="visualizer-fullscreen">
            <div className="visualizer-title">Stack (LIFO)</div>
            <div className="visualizer-desc">
                A stack is a Last-In-First-Out (LIFO) data structure. You can only insert (push) or remove (pop) from the top.
            </div>
            <div style={{ display: "flex", gap: 16, margin: "16px 0", flexWrap: "wrap" }}>
                <div style={{ color: "#ffb703", fontWeight: 500 }}>Yellow: Top</div>
            </div>
            <div className="visualizer-controls">
                <input
                    type="number"
                    placeholder="Value"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    style={{
                        width: 80,
                        borderRadius: 4,
                        border: "1px solid #bfc0c0",
                        padding: "4px 8px",
                        fontSize: "1rem"
                    }}
                />
                <button className="visualizer-btn" onClick={handlePush}>
                    Push
                </button>
                <button className="visualizer-btn" onClick={handlePop}>
                    Pop
                </button>
                <button className="visualizer-btn" onClick={handleRandom}>
                    Randomize
                </button>
            </div>
            <div style={{
                display: "flex",
                flexDirection: "column-reverse",
                alignItems: "center",
                minHeight: 220,
                margin: "32px 0"
            }}>
                {stack.length === 0 && (
                    <div style={{
                        color: "#bfc0c0",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                        margin: "12px 0"
                    }}>
                        Stack is empty
                    </div>
                )}
                {stack.map((num, idx) => {
                    const isTop = idx === stack.length - 1;
                    return (
                        <div
                            key={idx}
                            style={{
                                width: 80,
                                height: 38,
                                background: isTop ? "#ffb703" : "#a3cef1",
                                color: "#22223b",
                                border: "2px solid #4a4e69",
                                borderRadius: 6,
                                margin: "4px 0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                fontSize: "1.1rem",
                                position: "relative"
                            }}
                        >
                            {num}
                            {isTop && (
                                <span style={{
                                    position: "absolute",
                                    right: 8,
                                    top: 2,
                                    fontSize: 12,
                                    color: "#4a4e69"
                                }}>
                  top
                </span>
                            )}
                        </div>
                    );
                })}
            </div>
            {message && (
                <div style={{
                    margin: "18px 0",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    color: "#1976d2"
                }}>
                    {message}
                </div>
            )}
            <div>
                <h4 style={{ color: "#4a4e69", marginTop: 32, marginBottom: 8 }}>Stack (JavaScript)</h4>
                <pre className="visualizer-code">
{`const stack = [];
// Push
stack.push(value);
// Pop
const popped = stack.pop();`}
        </pre>
            </div>
        </div>
    );
}