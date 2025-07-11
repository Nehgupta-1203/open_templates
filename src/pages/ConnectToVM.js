// import React, {useState} from 'react';
// import {TextField, Button, Typography, Paper, Box, Alert} from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { useVM } from '../VMContext';

// export default function ConnectToVM() {
//     const [form, setForm] = useState({ip: '', port: ''});
//     const [pemFile, setPemFile] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');
//     const navigate = useNavigate();
//     // const {setIsConnected} = useVM();

//     const handleChange = (e) => {
//         setForm({...form, [e.target.name]: e.target.value});
//     };

//     const handleFileChange = (e) => {
//         setPemFile(e.target.files[0]);
//     };

//     const handleConnect = async(e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');

//         if(!form.ip || !form.port || !pemFile) {
//             setError('All fields are required');
//             setLoading(false);
//             return;
//         }
//         try {
//             const data = new FormData();
//             data.append('ip', form.ip);
//             data.append('port', form.port);
//             data.append('pemKey', pemFile);

//             const response = await axios.post('/', data, {headers: {'Content-Type': 'multipart/form-data'}});
//             if (response.data.success) {
//                 setIsConnected(true);
//                 navigate('/deploy');
//             } else {
//                 setError(response.data.message || 'Connection failed');
//                 setIsConnected(false);
//             }
//         } catch (err) {
//             setError(err.response?.data?.message || 'Connection failed');
//         } finally {
//             setLoading(false);
//         }
//     };

// return(
// <Paper sx={{maxWidth: 400, mx: "auto", mt:8, p:4}}>
//     <Typography variant="h5" align="center" gutterBottom>
//         Connect to VM
//     </Typography>
//     { error && 
//         <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
//     <form onSubmit={handleConnect}>
//         <TextField
//             label="IPV4 Address"
//             name="ip"
//             value={form.ip}
//             onChange={handleChange}
//             fullWidth
//             margin="normal"
//             required/>

//             <TextField
//             label="Port"
//             name="port"
//             value={form.port}
//             onChange={handleChange}
//             fullWidth
//             margin="normal"
//             required/>
//             <Button 
//                 variant="outlined"
//                 component="label"
//                 fullWidth
//                 sx ={{mt:2,mb:2}}>
//                     {pemFile ? pemFile.name : 'Upload PEM Key'}
//                     <input
//                         type="file"
//                         accept=".pem"
//                         hidden
//                         onChange={handleFileChange}
//                         required/>
//                 </Button>

//             <Box sx ={{mt:2}}>
//                 <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
//                     {loading ? 'Connecting...' : 'Connect'}
//                 </Button>
//             </Box>
//         </form>
//     </Paper>
// );
// }

import React, {useEffect, useState} from 'react';
import {TextField, Button, Typography, Grid, Paper, Box, Alert} from '@mui/material';
import axios from 'axios';

const defaultImages = [
    "tensorflow/tensorflow:latest",

]


export default function DeployDockerImage() {
    const [search, setSearch] = useState('');
    const [images, setImages] = useState(defaultImages);
    const [selected, setSelected] = useState('');
    const [deploying, setDeploying] = useState(false);
    const [deployStatus, setDeployStatus] = useState('');
    const [error, setError] = useState('');

    const handleSearch = async () => {
        setError('');
        try{
            const response = await axios.get('/search_images', {
                params: {query: search}});
            setImages(response.data.images.length ? response.data.images : defaultImages);
        }
        catch (err) {
            setError('Failed to fetch images');
        }
    }

    const handleDeploy = async() => {
        setDeploying(true);
        setDeployStatus('');
        setError('');
        try{
            const response = await axios.post('/deploy', {image: selected});
            setDeployStatus('Success');
        } catch (err) {
            setError('Deployment failed');
            setDeployStatus('Failed')
        }
        setDeploying(false);
    }

    return (
        <Box sx ={{maxWidth: 900, mx: 'auto', mt: 8, p: 4}}>
            <Typography variant="h5" align="center" gutterBottom>
                Deploy Docker Image 
            </Typography>
            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
            {deployStatus && <Alert severity='success' sx={{mb: 2}}>{deployStatus}</Alert> }
            <Box sx={{display: "flex", gap:2, mb:3}}>
                <TextField
                    label="Search Docker Images"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    fullWidth
                />
                <Button variant="contained" onClick={handleSearch} disabled={!search}> Search</Button>
            </Box>
            <Grid container spacing={2}>
                {images.map(img=>(
                    <Grid item xs={12} sm={6} md={4} key={img}>
                <Paper
                    onClick={() => setSelected(img)}
                    sx={{
                        p: 2,
                        cursor: 'pointer',
                        border: selected === img ? '2px solid #1976d2' : '1px solid #ccc',
                        backgroundColor: selected === img ? '#e3f2fd' : '#fff',
                    }}
                    elevation={selected === img ? 6 : 1}
                    >
                        <Typography>{img}</Typography>
                    </Paper>
            </Grid>
                ))}
            </Grid>
            <Box sx={{mt:3}}>
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