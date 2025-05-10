import React, { useState } from "react";

class Node {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }

    isEmpty() {
        return this.size === 0;
    }

    insertAtBeginning(value) {
        const newNode = new Node(value);
        newNode.next = this.head;
        this.head = newNode;
        this.size++;
        return this.getState();
    }

    insertAtEnd(value) {
        const newNode = new Node(value);
        if (this.isEmpty()) {
            this.head = newNode;
        } else {
            let current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = newNode;
        }
        this.size++;
        return this.getState();
    }

    insertAfter(value, afterValue) {
        if (this.isEmpty()) {
            throw new Error("List is empty");
        }
        let current = this.head;
        while (current && current.value !== afterValue) {
            current = current.next;
        }
        if (!current) {
            throw new Error("Value not found");
        }
        const newNode = new Node(value);
        newNode.next = current.next;
        current.next = newNode;
        this.size++;
        return this.getState();
    }

    delete(value) {
        if (this.isEmpty()) {
            throw new Error("List is empty");
        }
        if (this.head.value === value) {
            this.head = this.head.next;
            this.size--;
            return this.getState();
        }
        let current = this.head;
        while (current.next && current.next.value !== value) {
            current = current.next;
        }
        if (!current.next) {
            throw new Error("Value not found");
        }
        current.next = current.next.next;
        this.size--;
        return this.getState();
    }

    search(value) {
        let current = this.head;
        let index = 0;
        while (current) {
            if (current.value === value) {
                return { found: true, index };
            }
            current = current.next;
            index++;
        }
        return { found: false, index: -1 };
    }

    getState() {
        const nodes = [];
        let current = this.head;
        while (current) {
            nodes.push(current.value);
            current = current.next;
        }
        return {
            nodes,
            size: this.size
        };
    }
}

function LinkedListVisualizer() {
    const [list, setList] = useState(new LinkedList());
    const [inputValue, setInputValue] = useState("");
    const [afterValue, setAfterValue] = useState("");
    const [steps, setSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [error, setError] = useState("");
    const [operation, setOperation] = useState("insertAtBeginning");

    const handleOperation = () => {
        if (!inputValue.trim()) {
            setError("Please enter a value");
            return;
        }
        try {
            setError("");
            let result;
            switch (operation) {
                case "insertAtBeginning":
                    result = list.insertAtBeginning(inputValue);
                    setSteps([...steps, {
                        action: `Inserted ${inputValue} at beginning`,
                        ...result,
                        operation: "insertAtBeginning"
                    }]);
                    break;
                case "insertAtEnd":
                    result = list.insertAtEnd(inputValue);
                    setSteps([...steps, {
                        action: `Inserted ${inputValue} at end`,
                        ...result,
                        operation: "insertAtEnd"
                    }]);
                    break;
                case "insertAfter":
                    if (!afterValue.trim()) {
                        setError("Please enter a value to insert after");
                        return;
                    }
                    result = list.insertAfter(inputValue, afterValue);
                    setSteps([...steps, {
                        action: `Inserted ${inputValue} after ${afterValue}`,
                        ...result,
                        operation: "insertAfter"
                    }]);
                    break;
                case "delete":
                    result = list.delete(inputValue);
                    setSteps([...steps, {
                        action: `Deleted ${inputValue}`,
                        ...result,
                        operation: "delete"
                    }]);
                    break;
            }
            setCurrentStep(steps.length);
            setInputValue("");
            setAfterValue("");
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSearch = () => {
        if (!inputValue.trim()) {
            setError("Please enter a value to search");
            return;
        }
        const { found, index } = list.search(inputValue);
        setSteps([...steps, {
            action: found ? `Found ${inputValue} at index ${index}` : `${inputValue} not found`,
            ...list.getState(),
            operation: "search",
            searchResult: { found, index }
        }]);
        setCurrentStep(steps.length);
    };

    const handleReset = () => {
        setList(new LinkedList());
        setSteps([]);
        setCurrentStep(0);
        setError("");
        setInputValue("");
        setAfterValue("");
    };

    const handleAutoPlay = async () => {
        setIsAnimating(true);
        for (let i = currentStep + 1; i < steps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setCurrentStep(i);
        }
        setIsAnimating(false);
    };

    const currentState = steps[currentStep] || { nodes: [], size: 0, action: "List is empty" };

    return (
        <div className="visualizer-fullscreen">
            <div className="visualizer-title">Linked List Visualizer</div>
            <div className="visualizer-desc">
                A linked list is a linear data structure where elements are stored in nodes,
                and each node points to the next node in the sequence.
            </div>

            <div className="visualizer-controls">
                <div className="input-group">
                    <select
                        value={operation}
                        onChange={(e) => setOperation(e.target.value)}
                        disabled={isAnimating}
                        style={{ width: 150 }}
                    >
                        <option value="insertAtBeginning">Insert at Beginning</option>
                        <option value="insertAtEnd">Insert at End</option>
                        <option value="insertAfter">Insert After</option>
                        <option value="delete">Delete</option>
                    </select>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter value"
                        disabled={isAnimating}
                        style={{ width: 150 }}
                    />
                    {operation === "insertAfter" && (
                        <input
                            type="text"
                            value={afterValue}
                            onChange={(e) => setAfterValue(e.target.value)}
                            placeholder="Insert after value"
                            disabled={isAnimating}
                            style={{ width: 150 }}
                        />
                    )}
                    <button
                        className="visualizer-btn"
                        onClick={handleOperation}
                        disabled={isAnimating}
                    >
                        {operation === "delete" ? "Delete" : "Insert"}
                    </button>
                </div>
                <button
                    className="visualizer-btn"
                    onClick={handleSearch}
                    disabled={isAnimating}
                >
                    Search
                </button>
                <button
                    className="visualizer-btn"
                    onClick={handleReset}
                    disabled={isAnimating}
                >
                    Reset
                </button>
            </div>

            {error && (
                <div style={{ color: "#d32f2f", margin: "10px 0", fontWeight: "bold" }}>
                    {error}
                </div>
            )}

            <div className="linked-list-container">
                <div className="linked-list">
                    {currentState.nodes.map((value, index) => (
                        <div key={index} className="node-container">
                            <div className={`node ${currentState.operation === "search" && currentState.searchResult?.index === index ? "highlight" : ""}`}>
                                {value}
                            </div>
                            {index < currentState.nodes.length - 1 && (
                                <div className="arrow">→</div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="list-info">
                    <div>Size: {currentState.size}</div>
                </div>
            </div>

            <div className="visualizer-status">
                {currentState.action}
            </div>

            <div className="visualizer-controls">
                <button
                    className="visualizer-btn"
                    onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                    disabled={currentStep === 0 || isAnimating}
                >
                    Previous
                </button>
                <button
                    className="visualizer-btn"
                    onClick={handleAutoPlay}
                    disabled={currentStep === steps.length - 1 || isAnimating}
                >
                    Auto Play
                </button>
                <button
                    className="visualizer-btn"
                    onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                    disabled={currentStep === steps.length - 1 || isAnimating}
                >
                    Next
                </button>
            </div>

            <style jsx>{`
                .linked-list-container {
                    margin: 40px auto;
                    width: 800px;
                }

                .linked-list {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 20px;
                }

                .node-container {
                    display: flex;
                    align-items: center;
                }

                .node {
                    width: 60px;
                    height: 60px;
                    border: 2px solid #4a4e69;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #a3cef1;
                    color: #22223b;
                    font-weight: bold;
                    position: relative;
                }

                .node.highlight {
                    background: #8bc34a;
                    color: white;
                }

                .arrow {
                    color: #4a4e69;
                    font-size: 24px;
                    margin: 0 10px;
                }

                .list-info {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin-top: 20px;
                    font-weight: bold;
                    color: #4a4e69;
                }

                .visualizer-status {
                    text-align: center;
                    margin: 20px 0;
                    font-weight: bold;
                    color: #4a4e69;
                }

                .input-group {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }
            `}</style>
        </div>
    );
}

export default LinkedListVisualizer;
