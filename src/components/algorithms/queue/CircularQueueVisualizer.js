import React, { useState } from "react";

class CircularQueue {
    constructor(capacity) {
        this.capacity = capacity;
        this.items = new Array(capacity).fill(null);
        this.front = -1;
        this.rear = -1;
        this.size = 0;
    }

    isFull() {
        return this.size === this.capacity;
    }

    isEmpty() {
        return this.size === 0;
    }

    enqueue(value) {
        if (this.isFull()) {
            throw new Error("Queue is full");
        }
        if (this.isEmpty()) {
            this.front = 0;
        }
        this.rear = (this.rear + 1) % this.capacity;
        this.items[this.rear] = value;
        this.size++;
        return {
            items: [...this.items],
            front: this.front,
            rear: this.rear,
            size: this.size
        };
    }

    dequeue() {
        if (this.isEmpty()) {
            throw new Error("Queue is empty");
        }
        const value = this.items[this.front];
        this.items[this.front] = null;
        this.front = (this.front + 1) % this.capacity;
        this.size--;
        if (this.isEmpty()) {
            this.front = -1;
            this.rear = -1;
        }
        return {
            value,
            items: [...this.items],
            front: this.front,
            rear: this.rear,
            size: this.size
        };
    }

    peek() {
        if (this.isEmpty()) {
            throw new Error("Queue is empty");
        }
        return this.items[this.front];
    }
}

function CircularQueueVisualizer() {
    const [capacity, setCapacity] = useState(5);
    const [queue, setQueue] = useState(new CircularQueue(5));
    const [inputValue, setInputValue] = useState("");
    const [steps, setSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [error, setError] = useState("");

    const handleCapacityChange = (newCapacity) => {
        setCapacity(newCapacity);
        setQueue(new CircularQueue(newCapacity));
        setSteps([]);
        setCurrentStep(0);
        setError("");
    };

    const enqueue = (value) => {
        if (!value.trim()) {
            setError("Please enter a value to enqueue");
            return;
        }
        try {
            setError("");
            const result = queue.enqueue(value);
            setSteps([...steps, {
                action: `Enqueued: ${value}`,
                ...result,
                operation: "enqueue"
            }]);
            setCurrentStep(steps.length);
            setInputValue("");
        } catch (err) {
            setError(err.message);
        }
    };

    const dequeue = () => {
        try {
            setError("");
            const result = queue.dequeue();
            setSteps([...steps, {
                action: `Dequeued: ${result.value}`,
                ...result,
                operation: "dequeue"
            }]);
            setCurrentStep(steps.length);
        } catch (err) {
            setError(err.message);
        }
    };

    const peek = () => {
        try {
            setError("");
            const value = queue.peek();
            setSteps([...steps, {
                action: `Peeked: ${value}`,
                items: [...queue.items],
                front: queue.front,
                rear: queue.rear,
                size: queue.size,
                operation: "peek"
            }]);
            setCurrentStep(steps.length);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleReset = () => {
        setQueue(new CircularQueue(capacity));
        setSteps([]);
        setCurrentStep(0);
        setError("");
    };

    const handleAutoPlay = async () => {
        setIsAnimating(true);
        for (let i = currentStep + 1; i < steps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setCurrentStep(i);
        }
        setIsAnimating(false);
    };

    const currentState = steps[currentStep] || {
        items: new Array(capacity).fill(null),
        front: -1,
        rear: -1,
        size: 0,
        action: "Queue is empty"
    };

    return (
        <div className="visualizer-fullscreen">
            <div className="visualizer-title">Circular Queue Visualizer</div>
            <div className="visualizer-desc">
                A circular queue is a linear data structure that follows the First In First Out (FIFO) principle
                and reuses empty spaces in a circular manner.
            </div>

            <div className="visualizer-controls">
                <div className="input-group">
                    <label>Capacity:</label>
                    <input
                        type="number"
                        min="2"
                        max="10"
                        value={capacity}
                        onChange={(e) => handleCapacityChange(Math.max(2, Math.min(10, parseInt(e.target.value) || 2)))}
                        disabled={isAnimating}
                        style={{ width: 60 }}
                    />
                </div>
                <div className="input-group">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter value to enqueue"
                        disabled={isAnimating}
                        style={{ width: 200 }}
                    />
                    <button
                        className="visualizer-btn"
                        onClick={() => enqueue(inputValue)}
                        disabled={isAnimating}
                    >
                        Enqueue
                    </button>
                </div>
                <button
                    className="visualizer-btn"
                    onClick={dequeue}
                    disabled={isAnimating || queue.isEmpty()}
                >
                    Dequeue
                </button>
                <button
                    className="visualizer-btn"
                    onClick={peek}
                    disabled={isAnimating || queue.isEmpty()}
                >
                    Peek
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

            <div className="circular-queue-container">
                <div className="circular-queue">
                    {currentState.items.map((item, index) => (
                        <div
                            key={index}
                            className={`queue-slot ${index === currentState.front ? 'front' : ''} ${index === currentState.rear ? 'rear' : ''}`}
                        >
                            {item !== null ? (
                                <div className="queue-item">{item}</div>
                            ) : (
                                <div className="empty-slot">Empty</div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="queue-info">
                    <div>Size: {currentState.size}</div>
                    <div>Front: {currentState.front}</div>
                    <div>Rear: {currentState.rear}</div>
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
                .circular-queue-container {
                    margin: 40px auto;
                    width: 800px;
                }

                .circular-queue {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin-bottom: 20px;
                }

                .queue-slot {
                    width: 80px;
                    height: 80px;
                    border: 2px solid #4a4e69;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    background: #f5f5f5;
                }

                .queue-slot.front {
                    border-color: #8bc34a;
                }

                .queue-slot.rear {
                    border-color: #fb8500;
                }

                .queue-slot.front::before {
                    content: 'Front';
                    position: absolute;
                    top: -25px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #8bc34a;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 0.8rem;
                }

                .queue-slot.rear::before {
                    content: 'Rear';
                    position: absolute;
                    top: -25px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #fb8500;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 0.8rem;
                }

                .queue-item {
                    background: #a3cef1;
                    color: #22223b;
                    padding: 8px;
                    border-radius: 4px;
                    font-weight: bold;
                }

                .empty-slot {
                    color: #bfc0c0;
                    font-size: 0.9rem;
                }

                .queue-info {
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

export default CircularQueueVisualizer;
