import React, { useState } from "react";

let nodeIdCounter = 1;
function generateAddress() {
    return "0x" + (nodeIdCounter++).toString(16).padStart(4, "0");
}

class Node {
    constructor(data) {
        this.data = data;
        this.address = generateAddress();
        this.next = null;
        this.prev = null;
    }
}

class DoubleLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    isEmpty() {
        return this.size === 0;
    }

    insertAtBeginning(data) {
        const newNode = new Node(data);
        if (this.isEmpty()) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            newNode.next = this.head;
            this.head.prev = newNode;
            this.head = newNode;
        }
        this.size++;
        return this.getState();
    }

    insertAtEnd(data) {
        const newNode = new Node(data);
        if (this.isEmpty()) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            newNode.prev = this.tail;
            this.tail.next = newNode;
            this.tail = newNode;
        }
        this.size++;
        return this.getState();
    }

    insertAfter(data, afterValue) {
        if (this.isEmpty()) {
            throw new Error("List is empty");
        }
        let current = this.head;
        while (current && current.data !== afterValue) {
            current = current.next;
        }
        if (!current) {
            throw new Error("Value not found");
        }
        const newNode = new Node(data);
        newNode.next = current.next;
        newNode.prev = current;
        if (current.next) {
            current.next.prev = newNode;
        } else {
            this.tail = newNode;
        }
        current.next = newNode;
        this.size++;
        return this.getState();
    }

    delete(data) {
        if (this.isEmpty()) {
            throw new Error("List is empty");
        }
        let current = this.head;
        while (current && current.data !== data) {
            current = current.next;
        }
        if (!current) {
            throw new Error("Value not found");
        }
        if (current === this.head) {
            this.head = current.next;
            if (this.head) {
                this.head.prev = null;
            } else {
                this.tail = null;
            }
        } else if (current === this.tail) {
            this.tail = current.prev;
            this.tail.next = null;
        } else {
            current.prev.next = current.next;
            current.next.prev = current.prev;
        }
        this.size--;
        return this.getState();
    }

    search(data) {
        let current = this.head;
        let index = 0;
        while (current) {
            if (current.data === data) {
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
            nodes.push({
                data: current.data,
                address: current.address,
                prevAddress: current.prev ? current.prev.address : null,
                nextAddress: current.next ? current.next.address : null
            });
            current = current.next;
        }
        return {
            nodes,
            size: this.size
        };
    }
}

function DoubleLinkedListVisualizer() {
    const [list, setList] = useState(new DoubleLinkedList());
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
        setList(new DoubleLinkedList());
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
            <div className="visualizer-title">Doubly Linked List Visualizer</div>
            <div className="visualizer-desc">
                A doubly linked list is a linear data structure where each node contains
                references to both the next and previous nodes in the sequence.
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
                    {currentState.nodes.map((node, index) => (
                        <div key={index} className="node-container">
                            <div className={`node-box ${currentState.operation === "search" && currentState.searchResult?.index === index ? "highlight" : ""}`}>
                                <div className="node-data">{node.data}</div>
                                <div className="node-address">{node.address}</div>
                                <div className="node-prev">prev: {node.prevAddress || "null"}</div>
                                <div className="node-next">next: {node.nextAddress || "null"}</div>
                            </div>
                            {index < currentState.nodes.length - 1 && (
                                <div className="arrows">
                                    <span className="arrow">⇄</span>
                                </div>
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

                .node-box {
                    width: 110px;
                    height: 90px;
                    border: 2px solid #4a4e69;
                    border-radius: 8px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: #a3cef1;
                    color: #22223b;
                    font-weight: bold;
                    position: relative;
                    font-size: 1rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                }

                .node-box.highlight {
                    background: #8bc34a;
                    color: white;
                }

                .node-data {
                    font-size: 1.2rem;
                    font-weight: bold;
                }
                .node-address {
                    font-size: 0.8rem;
                    color: #4a4e69;
                }
                .node-prev {
                    font-size: 0.8rem;
                    color: #e76f51;
                }
                .node-next {
                    font-size: 0.8rem;
                    color: #1976d2;
                }

                .arrows {
                    display: flex;
                    align-items: center;
                    margin: 0 10px;
                }

                .arrow {
                    color: #4a4e69;
                    font-size: 24px;
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

export default DoubleLinkedListVisualizer;
