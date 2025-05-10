import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Sidebar from "./components/common/Sidebar";

// Import your visualizer components
import BubbleSortVisualizer from "./components/algorithms/sorting/BubbleSort";
import SelectionSortVisualizer from "./components/algorithms/sorting/SelectionSort";
import InsertionSortVisualizer from "./components/algorithms/sorting/InsertionSort";
import RadixSortVisualizer from "./components/algorithms/sorting/RadixSort";
import CountingSortVisualizer from "./components/algorithms/sorting/CountingSort";
import HeapSortVisualizer from "./components/algorithms/sorting/HeapSort";
import MergeSortVisualizer from "./components/algorithms/sorting/MergeSort";
import LinearSearchVisualizer from "./components/algorithms/searching/LinearSearch";
import BinarySearchVisualizer from "./components/algorithms/searching/BinarySearch";
import StackVisualizer from "./components/algorithms/stack/StackVisualizer";
import QueueVisualizer from "./components/algorithms/queue/QueueVisualizer";
import CircularQueueVisualizer from "./components/algorithms/queue/CircularQueueVisualizer";
import BinarySearchTreeVisualizer from "./components/algorithms/tree/BinarySearchTree";
import AVLTreeVisualizer from "./components/algorithms/tree/AVLTree";
import RedBlackTreeVisualizer from "./components/algorithms/tree/RedBlackTree";
import DijkstraVisualizer from "./components/algorithms/graph/Dijkstra";
import BFSVisualizer from "./components/algorithms/graph/BFS";
import DFSVisualizer from "./components/algorithms/graph/DFS";
import KruskalVisualizer from "./components/algorithms/graph/Kruskal";
import PrimsVisualizer from "./components/algorithms/graph/Prims";
import GraphRepresentationVisualizer from "./components/algorithms/graph/GraphRepresentation";
import LinkedListVisualizer from "./components/algorithms/linkedlist/LinkedListVisualizer";
import DoubleLinkedListVisualizer from "./components/algorithms/linkedlist/DoubleLinkedListVisualizer";
import CircularLinkedListVisualizer from "./components/algorithms/linkedlist/CircularLinkedListVisualizer";
// (Import more as you add them)

function App() {
    return (
        <Router>
            <div style={{ display: "flex", height: "100vh" }}>
                <Sidebar />
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Navbar />
                    <div style={{ flex: 1, padding: 24, overflow: "auto" }}>
                        <Routes>
                            <Route path="/" element={<Navigate to="/sorting/bubble-sort" />} />
                            <Route path="/sorting/bubble-sort" element={<BubbleSortVisualizer />} />
                            <Route path="/sorting/selection-sort" element={<SelectionSortVisualizer />} />
                            <Route path="/sorting/insertion-sort" element={<InsertionSortVisualizer />} />
                            <Route path="/sorting/radix-sort" element={<RadixSortVisualizer />} />
                            <Route path="/sorting/counting-sort" element={<CountingSortVisualizer />} />
                            <Route path="/sorting/heap-sort" element={<HeapSortVisualizer />} />
                            <Route path="/sorting/merge-sort" element={<MergeSortVisualizer />} />
                            <Route path="/searching/linear-search" element={<LinearSearchVisualizer />} />
                            <Route path="/searching/binary-search" element={<BinarySearchVisualizer />} />
                            <Route path="/stack" element={<StackVisualizer />} />
                            <Route path="/queue" element={<QueueVisualizer />} />
                            <Route path="/queue/circular" element={<CircularQueueVisualizer />} />
                            <Route path="/tree/bst" element={<BinarySearchTreeVisualizer />} />
                            <Route path="/tree/avl" element={<AVLTreeVisualizer />} />
                            <Route path="/tree/red-black" element={<RedBlackTreeVisualizer />} />
                            <Route path="/graph/dijkstra" element={<DijkstraVisualizer />} />
                            <Route path="/graph/bfs" element={<BFSVisualizer />} />
                            <Route path="/graph/dfs" element={<DFSVisualizer />} />
                            <Route path="/graph/kruskal" element={<KruskalVisualizer />} />
                            <Route path="/graph/prims" element={<PrimsVisualizer />} />
                            <Route path="/graph/representation" element={<GraphRepresentationVisualizer />} />
                            <Route path="/linkedlist" element={<LinkedListVisualizer />} />
                            <Route path="/linkedlist/double" element={<DoubleLinkedListVisualizer />} />
                            <Route path="/linkedlist/circular" element={<CircularLinkedListVisualizer />} />
                            {/* Add more routes for other algorithms here */}
                        </Routes>
                    </div>
                </div>
            </div>
        </Router>
    );
}

export default App;