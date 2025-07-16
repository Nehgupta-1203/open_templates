import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './Sidebar';
import ConnectToVM from './pages/ConnectToVM';
import DeployDockerImage from './pages/DeployDockerImage';
import Dashboard from './pages/Dashboard';
import { Box } from '@mui/material';
import { useVM } from './VMContext';


function App() {
    const { isConnected } = useVM();
    return (
        <Router>
            <Box sx={{ display: 'flex' }}>
                <Sidebar />
                <Box component="main" sx={{ flexGrow: 1, p: 3, minHeight: '100vh', background: '#f4f6fa' }}>
                    <Routes>
                        <Route path="/" element={<ConnectToVM />} />
                        <Route path="/deploy" element={isConnected ? <DeployDockerImage /> : "Please Connect to VM" } />
                        <Route path="/dashboard" element={isConnected ? <Dashboard />: "Please Connect to VM"} />
                    </Routes>
                </Box>
            </Box>
        </Router>
    );
}

export default App;