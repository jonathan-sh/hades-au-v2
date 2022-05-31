import React from "react";
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';

import Log from './components/Log';

export default function Navigator() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Log />} />
                <Route path="/log" element={<Log />} />
            </Routes>
        </Router>
    );
}