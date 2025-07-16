import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Grid, Box, Alert, Card } from '@mui/material';
import axios from 'axios';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';

export default function Dashboard() {
    const [docker_containers, setDockerContainers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [containerStatus, setContainerStatus] = useState('');
    const [selected, setSelected] = useState('');

    const fetchContainersFromVM = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('/container_dashboard');
            setDockerContainers(response.data.containers);
        } catch (ex) {
            setError('Failed to fetch containers from VM');
        }
        setLoading(false);
    }

    const onActionButtonClick = async (containerId, action) => {
        setError('');
        try {
            if(action === 'restart') {
                await axios.post('/restart_container', { container_id: containerId });
            } else if(action === 'stop') {
                await axios.post('/stop_container', { container_id: containerId });
            }
        } catch (ex) {
            setError(`Failed to ${action} container: ${containerId}`);
        }
    }
    useEffect(() => {
        fetchContainersFromVM();
        // set interval to fetch containers every 30 seconds
        const interval = setInterval(() => {
            fetchContainersFromVM();
        }, 30000);
        return () => clearInterval(interval); // cleanup on unmount
    }, []);

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', mt: 8, p: 4 }}>
            <Typography variant="h5" align="center" gutterBottom>
                Dashboard
            </Typography>
            {error && <Alert severity="success" sx={{ mb: 2 }}>{error}</Alert>}
            <Grid container spacing={3}>
                {docker_containers.map(docker_container => (
                    <Grid item xs={12} sm={6} md={4} key={docker_container.id}>
                        <Box sx={{ position: 'relative', width: '100%', paddingTop: '100%', minWidth: 200, minHeight: 200 }}>
                            <Card
                                elevation={selected === docker_container.id ? 6 : 1}
                                sx={{
                                    border: selected === docker_container.id ? '2px solid #1976d2' : 'none',
                                    background: selected === docker_container.id ? '#e3f2fd' : '#fff',
                                    cursor: 'pointer',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    p: 2,
                                    boxSizing: 'border-box',
                                    transition: "border 0.2s"
                                }}
                            >
                                <Box>
                                    <Typography variant='h6' gutterBottom noWrap>{docker_container.id}</Typography>
                                    <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>{docker_container.image}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 'auto' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {docker_container.status}
                                    </Typography>
                                    {docker_container.status.includes('Up') ? (
                                         <Typography variant="body2" color="text.secondary">
                                            <StopIcon fontSize="small" sx={{ verticalAlign: "middle" }} onClick={()=>onActionButtonClick(docker_container.id, 'stop')} /> Stop
                                        </Typography>
                                    ) : (
                                       <Typography variant="body2" color="text.secondary">
                                            <PlayArrowIcon fontSize="small" sx={{ verticalAlign: "middle" }} onClick={()=>onActionButtonClick(docker_container.id, 'restart')} /> Restart
                                        </Typography>
                                    )}
                                </Box>
                            </Card>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}