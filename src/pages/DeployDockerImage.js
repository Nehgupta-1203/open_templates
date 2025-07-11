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