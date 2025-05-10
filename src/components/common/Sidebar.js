// src/components/common/Sidebar.js
import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const topics = [
    {
        label: "Sorting",
        children: [
            { label: "Bubble Sort", path: "/sorting/bubble-sort" },
            { label: "Selection Sort", path: "/sorting/selection-sort" },
            { label: "Insertion Sort", path: "/sorting/insertion-sort" },
            { label: "Radix Sort", path: "/sorting/radix-sort" },
            { label: "Counting Sort", path: "/sorting/counting-sort" },
            { label: "Heap Sort", path: "/sorting/heap-sort" },
            { label: "Merge Sort", path: "/sorting/merge-sort" },
        ],
    },
    {
        label: "Searching",
        children: [
            { label: "Linear Search", path: "/searching/linear-search" },
            { label: "Binary Search", path: "/searching/binary-search" },
            // Add more searching algorithms here
        ],
    },
    {
        label: "Stack",
        children: [
            { label: "Stack (Insertion/Deletion)", path: "/stack" },
        ],
    },
    {
        label: "Queue",
        children: [
            { label: "Queue (FIFO)", path: "/queue" },
            { label: "Circular Queue", path: "/queue/circular" },
        ],
    },
    {
        label: "Tree",
        children: [
            { label: "Binary Search Tree", path: "/tree/bst" },
            { label: "AVL Tree", path: "/tree/avl" },
            { label: "Red-Black Tree", path: "/tree/red-black" },
            // Add AVL, Red-Black, etc. here
        ],
    },
    {
        label: "Graph",
        children: [
            { label: "Dijkstra's Algorithm", path: "/graph/dijkstra" },
            { label: "BFS", path: "/graph/bfs" },
            { label: "DFS", path: "/graph/dfs" },
            { label: "Kruskal's Algorithm", path: "/graph/kruskal" },
            { label: "Prim's Algorithm", path: "/graph/prims" },
            { label: "Graph Representation", path: "/graph/representation" },
            // Add Prim, Kruskal, etc. here
        ],
    },
    {
        label: "Linked List",
        children: [
            { label: "Singly Linked List", path: "/linkedlist" },
            { label: "Doubly Linked List", path: "/linkedlist/double" }
        ]
    },
];

export default function Sidebar() {
    const [openSections, setOpenSections] = useState(() => topics.map(() => false));

    const toggleSection = (idx) => {
        setOpenSections((prev) => prev.map((open, i) => (i === idx ? !open : open)));
    };

    return (
        <div className="sidebar">
            <h2 className="sidebar-title">DSA Dashboard</h2>
            <nav>
                {topics.map((topic, idx) => (
                    <div key={topic.label} className="sidebar-section">
                        <div
                            className="sidebar-section-label"
                            onClick={() => toggleSection(idx)}
                            tabIndex={0}
                            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggleSection(idx)}
                            aria-expanded={openSections[idx]}
                        >
                            <span>{topic.label}</span>
                            <span className={`sidebar-arrow ${openSections[idx] ? 'open' : ''}`}>▼</span>
                        </div>
                        <ul
                            className={`sidebar-list ${openSections[idx] ? 'open' : ''}`}
                            style={{ maxHeight: openSections[idx] ? topic.children.length * 44 + 8 : 0 }}
                        >
                            {topic.children.map((item) => (
                                <li key={item.path} className="sidebar-list-item">
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) =>
                                            isActive ? "sidebar-link active" : "sidebar-link"
                                        }
                                    >
                                        {item.label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>
            <style>{`
                .sidebar {
                    width: 250px;
                    background: #232946;
                    color: #fff;
                    padding: 24px 0;
                    height: 100vh;
                    box-shadow: 2px 0 8px rgba(44,44,84,0.08);
                    display: flex;
                    flex-direction: column;
                }
                .sidebar-title {
                    text-align: center;
                    margin-bottom: 32px;
                    font-size: 1.7rem;
                    letter-spacing: 1px;
                    font-weight: 700;
                    color: #eebbc3;
                }
                .sidebar-section {
                    margin-bottom: 8px;
                }
                .sidebar-section-label {
                    font-weight: 600;
                    padding: 12px 32px 12px 24px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: #232946;
                    border: none;
                    outline: none;
                    font-size: 1.08rem;
                    border-radius: 6px;
                    transition: background 0.2s;
                }
                .sidebar-section-label:hover, .sidebar-section-label:focus {
                    background: #393e6c;
                }
                .sidebar-arrow {
                    font-size: 1rem;
                    margin-left: 8px;
                    transition: transform 0.2s;
                }
                .sidebar-arrow.open {
                    transform: rotate(180deg);
                }
                .sidebar-list {
                    list-style: none;
                    padding-left: 36px;
                    margin: 0;
                    overflow: hidden;
                    transition: max-height 0.3s cubic-bezier(.4,0,.2,1);
                    background: #232946;
                }
                .sidebar-list.open {
                    border-left: 2px solid #eebbc3;
                    background: #232946;
                }
                .sidebar-list-item {
                    margin: 0;
                }
                .sidebar-link {
                    display: block;
                    padding: 10px 0 10px 0;
                    color: #b8c1ec;
                    text-decoration: none;
                    font-size: 1rem;
                    border-radius: 4px;
                    transition: color 0.2s, background 0.2s;
                }
                .sidebar-link:hover, .sidebar-link.active {
                    color: #232946;
                    background: #eebbc3;
                    font-weight: 700;
                }
                @media (max-width: 700px) {
                    .sidebar {
                        width: 100vw;
                        height: auto;
                        position: static;
                        box-shadow: none;
                    }
                }
            `}</style>
        </div>
    );
}