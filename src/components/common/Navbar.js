// src/components/common/Navbar.js
import React from "react";

export default function Navbar() {
    return (
        <div style={{
            height: 56,
            background: "#4a4e69",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            paddingLeft: 24,
            fontSize: 20,
            fontWeight: "bold"
        }}>
            Data Structures & Algorithms Visualizer
        </div>
    );
}