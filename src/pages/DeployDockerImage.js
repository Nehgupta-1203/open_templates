import React, { useEffect, useState } from 'react';
import {
    TextField, Button, Typography, Grid, Box, Alert, Card, FormControlLabel, Checkbox, Collapse, Tooltip, Select, MenuItem
} from '@mui/material';
import axios from 'axios';
import StarIcon from '@mui/icons-material/Star';
import DownloadIcon from '@mui/icons-material/Download';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const defaultImages = [
    //      "tensorflow/tensorflow:latest",
    //  "tensorflow/tensorflow:latest",
    //   "tensorflow/tensorflow:latest",
    //    "tensorflow/tensorflow:latest",
]


export default function DeployDockerImage() {
    const [search, setSearch] = useState('');
    const [images, setImages] = useState(defaultImages);
    const [selected, setSelected] = useState('');
    const [deploying, setDeploying] = useState(false);
    const [deployStatus, setDeployStatus] = useState('');
    const [error, setError] = useState('');
    const [advancedEnabled, setAdvancedEnabled] = useState(false);
    const [dockerOptions, setDockerOptions] = useState({
        containerName: "",
        tag: "",
        ports: "",
        volumes: "",
        envVars: "",
        num_of_cpus: "",
        memory_limit: "",
        shm_size: "",
        runtime: "",
        gpus: "",
        entrypoint: "",
        restart_policy: "",
        enable_ipc_host: "",
        enable_priviliged: ""
    })

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setDockerOptions((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSearch = async () => {
        setError('');
        try {
            const response = await axios.get('/search_images', {
                params: { query: search }
            });
            setImages(response.data.images.length ? response.data.images : defaultImages);
        }
        catch (err) {
            setError('Failed to fetch images');
        }
    }

    const handleDeploy = async () => {
        setDeploying(true);
        setDeployStatus('');
        setError('');
        try {
            const response = await axios.post('/deploy', { image: selected, dockerOptions }, { headers: { 'Content-Type': 'application/json' } });
            setDeployStatus(`Successfully deployed docker container ${selected}`);
        } catch (err) {
            setError('Deployment failed');
        }
        finally {
            setDeploying(false);
        }
    }

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', mt: 8, p: 4 }}>
            <Typography variant="h5" align="center" gutterBottom>
                Deploy Docker Image
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {deployStatus && <Alert severity='success' sx={{ mb: 2 }}>{deployStatus}</Alert>}
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <TextField
                    label="Search Docker Images"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    fullWidth
                />
                <Button variant="contained" onClick={handleSearch} disabled={!search}> Search</Button>
            </Box>
            <Grid container spacing={3}>
                {images.map(img => (
                    <Grid item xs={12} sm={6} md={4} key={img.repo_name}>
                        <Box sx={{ position: 'relative', width: '100%', paddingTop: '100%', minWidth: 200, minHeight: 200 }}>
                            <Card
                                elevation={selected === img.repo_name ? 6 : 1}
                                // variant={selected === img.repo_name ? 'outlined' : 'elevation'}
                                sx={{
                                    border: selected === img.repo_name ? '2px solid #1976d2' : 'none',
                                    background: selected === img.repo_name ? '#e3f2fd' : '#fff',
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
                                onClick={() => setSelected(img.repo_name)}>
                                <Box>
                                    <Typography variant='h6' gutterBottom noWrap>{img.repo_name}</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}> {img.description || 'No description provided'}</Typography>

                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 'auto' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        <StarIcon fontSize="small" sx={{ verticalAlign: "middle", color: "#fbc02d" }} /> {img.star_count}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        <DownloadIcon fontSize="small" sx={{ verticalAlign: "middle" }} /> {img.pull_count}
                                    </Typography>
                                </Box>
                            </Card>
                        </Box>
                    </Grid>
                ))}
            </Grid>
            {/* Checkbox to toggle advanced options */}
            <FormControlLabel
                control={
                    <Checkbox
                        checked={advancedEnabled}
                        onChange={() => { setAdvancedEnabled(!advancedEnabled) }}
                        color="primary"
                        disabled={!selected}
                    />
                }
                label="Enable Advanced Docker Run Options"
            />

            {/* Smooth collapse animation to reveal advanced options */}
            <Collapse in={advancedEnabled} timeout="auto" unmountOnExit>
                <Box component="dl" sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>

                    {/* Container Name */}
                    <Box>
                        <Typography component="dt" fontWeight={600}>Container Name:</Typography>
                        <TextField
                            name="containerName"
                            value={dockerOptions.containerName}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                        />
                    </Box>

                    {/* TAG */}
                    <Box>
                        <Typography component="dt" fontWeight={600}>TAG:</Typography>
                        <TextField
                            name="tag"
                            value={dockerOptions.tag}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                        />
                    </Box>

                    {/* Ports with Tooltip */}
                    <Box>
                        <Typography component="dt" fontWeight={600}>
                            Port:
                            <Tooltip title="Input one or multiple ports, comma-separated. e.g. 80:80,443:443">
                                <InfoOutlinedIcon fontSize="small" sx={{ ml: 1, verticalAlign: 'middle', cursor: 'pointer' }} />
                            </Tooltip>
                        </Typography>
                        <TextField
                            name="ports"
                            value={dockerOptions.ports}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                        />
                    </Box>

                    {/* Voumes */}
                    <Box>
                        <Typography component="dt" fontWeight={600}>Volumes:</Typography>
                        <TextField
                            name="volumes"
                            value={dockerOptions.volumes}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                        />
                    </Box>

                    {/* Environment Variables with Tooltip */}
                    <Box>
                        <Typography component="dt" fontWeight={600}>
                            Environment Variables:
                            <Tooltip title="Separate multiple values with commas. E.g. ENV1=value1,ENV2=value2">
                                <InfoOutlinedIcon fontSize="small" sx={{ ml: 1, verticalAlign: 'middle', cursor: 'pointer' }} />
                            </Tooltip>
                        </Typography>
                        <TextField
                            name="envVars"
                            value={dockerOptions.envVars}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                        />
                    </Box>

                    {/* CPUs */}
                    <Box>
                        <Typography component="dt" fontWeight={600}>Number of CPUs:</Typography>
                        <TextField
                            name="cpus"
                            value={dockerOptions.cpus}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                        />
                    </Box>

                    {/* Memory */}
                    <Box>
                        <Typography component="dt" fontWeight={600}>Memory Limit:</Typography>
                        <TextField
                            name="memory"
                            value={dockerOptions.memory}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                        />
                    </Box>

                    {/* Runtime */}
                    {/* <Box>
            <Typography component="dt" fontWeight={600}>IPC Mode:</Typography>
            <Select
              name="runtime"
              value={dockerOptions.ipc}
              label="Runtime"
              fullWidth
              size="small"
              onChange={handleChange}
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="nvidia">NVIDIA</MenuItem>
              <MenuItem value="shareable">shareable</MenuItem>
              <MenuItem value="host">host</MenuItem>
            </Select>
          </Box> */}
                    <Box>
                        <Typography component="dt" fontWeight={600}>Runtime:</Typography>
                        <TextField
                            name="runtime"
                            value={dockerOptions.runtime}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                        />
                    </Box>

                    {/* GPUs conditionally shown */}
                    {dockerOptions.runtime === 'nvidia' && (
                        <Box>
                            <Typography component="dt" fontWeight={600}>Number of GPUs:</Typography>
                            <TextField
                                name="gpus"
                                value={dockerOptions.gpus}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                            />
                        </Box>
                    )}

                    {/* Entrypoint */}
                    <Box>
                        <Typography component="dt" fontWeight={600}>Entrypoint:</Typography>
                        <TextField
                            name="entrypoint"
                            value={dockerOptions.entrypoint}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                        />
                    </Box>

                    {/* Restart Policy */}
                    <Box>
                        <Typography component="dt" fontWeight={600}>Restart Policy:</Typography>
                        <TextField
                            name="restartPolicy"
                            value={dockerOptions.restartPolicy}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                            placeholder="e.g. always, on-failure, unless-stopped, no"
                        />
                    </Box>

                    {/* SHM Size */}
                    <Box>
                        <Typography component="dt" fontWeight={600}>Shared Memory Size (shm-size):</Typography>
                        <TextField
                            name="shmSize"
                            value={dockerOptions.shmSize}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                        />
                    </Box>

                    {/* Privileged Checkbox */}
                    <Box>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="privileged"
                                    checked={dockerOptions.privileged}
                                    onChange={handleChange}
                                />
                            }
                            label="Enable Privileged Mode"
                        />
                    </Box>

                    {/* IPC Mode */}
                    <Box>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="enable_ipc_host"
                                    checked={dockerOptions.enable_ipc_host}
                                    onChange={handleChange}
                                />
                            }
                            label="Enable IPC Host"
                        />
                    </Box>
                    {/* <Box>
            <Typography component="dt" fontWeight={600}>IPC Mode:</Typography>
            <Select
              name="ipc"
              value={dockerOptions.ipc}
              label="IPC"
              fullWidth
              size="small"
              onChange={handleChange}
            >
              <MenuItem value="none">none</MenuItem>
              <MenuItem value="private">private</MenuItem>
              <MenuItem value="shareable">shareable</MenuItem>
              <MenuItem value="host">host</MenuItem>
            </Select>
          </Box> */}

                </Box>
                {/* <Box sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Container Name"
                name="containerName"
                value={options.containerName}
                onChange={handleOptionChange}
                fullWidth
                size="small"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Ports (e.g. 80:80)"
                name="ports"
                value={options.ports}
                onChange={handleOptionChange}
                fullWidth
                size="small"
                variant="outlined"
                placeholder="hostPort:containerPort"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Volumes (e.g. /host:/container)"
                name="volumes"
                value={options.volumes}
                onChange={handleOptionChange}
                fullWidth
                size="small"
                variant="outlined"
                placeholder="hostPath:containerPath"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Environment Variables (e.g. ENV=value)"
                name="envVars"
                value={options.envVars}
                onChange={handleOptionChange}
                fullWidth
                size="small"
                variant="outlined"
                placeholder="VAR1=value1 VAR2=value2"
              />
            </Grid> */}

                {/* Add more fields as needed */}
                {/* </Grid>
        </Box>*/}
            </Collapse>

            <Box sx={{ mt: 3 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleDeploy}
                    disabled={!selected || deploying}
                >
                    {deploying ? 'Deploying...' : 'Deploy Image'}
                </Button>
            </Box>
        </Box>

    );
}