// src/components/common/Sidebar.js
import React from "react";
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
            // Add Prim, Kruskal, etc. here
        ],
    },
];

export default function Sidebar() {
    return (
        <div style={{
            width: 220,
            background: "#22223b",
            color: "#fff",
            padding: "24px 0",
            height: "100vh"
        }}>
            <h2 style={{ textAlign: "center", marginBottom: 32 }}>DSA Dashboard</h2>
            <nav>
                {topics.map((topic) => (
                    <div key={topic.label} style={{ marginBottom: 16 }}>
                        <div style={{ fontWeight: "bold", paddingLeft: 24 }}>{topic.label}</div>
                        <ul style={{ listStyle: "none", paddingLeft: 32 }}>
                            {topic.children.map((item) => (
                                <li key={item.path} style={{ margin: "8px 0" }}>
                                    <NavLink
                                        to={item.path}
                                        style={({ isActive }) => ({
                                            color: isActive ? "#f2e9e4" : "#c9ada7",
                                            textDecoration: "none",
                                            fontWeight: isActive ? "bold" : "normal"
                                        })}
                                    >
                                        {item.label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>
        </div>
    );
}