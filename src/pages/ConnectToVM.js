import React, {useState} from 'react';
import {TextField, Button, Typography, Paper, Box, Alert} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useVM } from '../VMContext';

export default function ConnectToVM() {
    const [form, setForm] = useState({ip: '', port: '', username: ''});
    const [pemFile, setPemFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    // const {setIsConnected} = useVM();

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleFileChange = (e) => {
        setPemFile(e.target.files[0]);
    };

    const handleConnect = async(e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if(!form.ip || !form.port || !form.username || !pemFile) {
            setError('All fields are required');
            setLoading(false);
            return;
        }
        try {
            const data = new FormData();
            data.append('ip', form.ip);
            data.append('port', form.port);
            data.append('username',form.username);
            data.append('pemKey', pemFile);

            const response = await axios.post('/', data, {headers: {'Content-Type': 'multipart/form-data'}});
            if (response.data.success) {
                // setIsConnected(true);
                navigate('/deploy');
            } else {
                setError(response.data.message || 'Connection failed');
                // setIsConnected(false);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Connection failed');
        } finally {
            setLoading(false);
        }
    };

return(
<Paper sx={{maxWidth: 400, mx: "auto", mt:8, p:4}}>
    <Typography variant="h5" align="center" gutterBottom>
        Connect to VM
    </Typography>
    { error && 
        <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
    <form onSubmit={handleConnect}>
         <TextField
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required/>
        <TextField
            label="IPV4 Address"
            name="ip"
            value={form.ip}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required/>

            <TextField
            label="Port"
            name="port"
            value={form.port}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required/>
            <Button 
                variant="outlined"
                component="label"
                fullWidth
                sx ={{mt:2,mb:2}}>
                    {pemFile ? pemFile.name : 'Upload PEM Key'}
                    <input
                        type="file"
                        hidden
                        onChange={handleFileChange}
                        required/>
                </Button>

            <Box sx ={{mt:2}}>
                <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                    {loading ? 'Connecting...' : 'Connect'}
                </Button>
            </Box>
        </form>
    </Paper>
);
}

// import React, {useEffect, useState} from 'react';
// import {TextField, Button, Typography, Grid, Paper, Box, Alert, Card, CardContent,CardActions, CardActionArea} from '@mui/material';
// import axios from 'axios';
// import StarIcon from '@mui/icons-material/Star';
// import DownloadIcon from '@mui/icons-material/Download';

// const defaultImages = [
// //      "tensorflow/tensorflow:latest",
// //  "tensorflow/tensorflow:latest",
// //   "tensorflow/tensorflow:latest",
// //    "tensorflow/tensorflow:latest",
// ]


// export default function DeployDockerImage() {
//     const [search, setSearch] = useState('');
//     const [images, setImages] = useState(defaultImages);
//     const [tag, setImageTag] = useState('latest');
//     const [entrypoint, setEntryPoint] = useState('');
//     const [cpus, setCpus] = useState('1');
//     const [memory, setMemory] = useState('512m');
//     const [shmSize, setSHMSize] = useState('64m');
//     const [selected, setSelected] = useState('');
//     const [deploying, setDeploying] = useState(false);
//     const [deployStatus, setDeployStatus] = useState('');
//     const [error, setError] = useState('');

//     const handleSearch = async () => {
//         setError('');
//         try{
//             const response = await axios.get('/search_images', {
//                 params: {query: search}});
//             setImages(response.data.images.length ? response.data.images : defaultImages);
//         }
//         catch (err) {
//             setError('Failed to fetch images');
//         }
//     }

//     const handleDeploy = async() => {
//         setDeploying(true);
//         setDeployStatus('');
//         setError('');
//         try{
//             const response = await axios.post('/deploy', {image: selected});
//             setDeployStatus('Success');
//         } catch (err) {
//             setError('Deployment failed');
//             setDeployStatus('Failed')
//         }
//         setDeploying(false);
//     }

//     return (
//         <Box sx ={{maxWidth: 900, mx: 'auto', mt: 8, p: 4}}>
//             <Typography variant="h5" align="center" gutterBottom>
//                 Deploy Docker Image 
//             </Typography>
//             {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
//             {deployStatus && <Alert severity='success' sx={{mb: 2}}>{deployStatus}</Alert> }
//             <Box sx={{display: "flex", gap:2, mb:3}}>
//                 <TextField
//                     label="Search Docker Images"
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     fullWidth
//                 />
//                 <Button variant="contained" onClick={handleSearch} disabled={!search}> Search</Button>
//             </Box>
//             <Grid container spacing={3}>
//                 {images.map(img=>(
//                     <Grid item xs={12} sm={6} md={4} key={img.repo_name}>
//                         <Box sx={{position: 'relative', width: '100%', paddingTop: '100%', minWidth:200, minHeight: 200}}>
//                         <Card 
//                         elevation={selected === img.repo_name ? 6 : 1}
//                         // variant={selected === img.repo_name ? 'outlined' : 'elevation'}
//                             sx={{border:selected === img.repo_name ? '2px solid #1976d2' : 'none',
//                                 background: selected === img.repo_name ? '#e3f2fd' : '#fff',
//                                 cursor: 'pointer',
//                                 height: '100%',
//                                 display: 'flex',
//                                 flexDirection: 'column',
//                                 justifyContent: 'space-between',
//                                 position: "absolute",
//                                 top: 0,
//                                 left: 0,
//                                 right: 0,
//                                 bottom: 0,
//                                 p: 2,
//                                 boxSizing: 'border-box',
//                                 transition: "border 0.2s"
//                                 }}
//                             onClick={() => setSelected(img.repo_name)}>
//                                 <Box>
//                                     <Typography variant ='h6' gutterBottom noWrap>{img.repo_name}</Typography>
//                                     <Typography variant="body2" color="text.secondary" sx={{mb: 2}}> {img.description || 'No description provided'}</Typography>

//                                 </Box>
//                                 <Box sx={{display:'flex', alignItems:'center', gap:2, mt:'auto'}}>
//                                     <Typography variant="body2" color="text.secondary">
//                                         <StarIcon fontSize="small" sx={{ verticalAlign: "middle", color: "#fbc02d" }} /> {img.star_count}
//                                     </Typography>
//                                     <Typography variant="body2" color="text.secondary">
//                                         <DownloadIcon fontSize="small" sx={{ verticalAlign: "middle" }} /> {img.pull_count}
//                                     </Typography>
//                                 </Box>
//                                 {/* <CardActionArea>
//                                 <CardContent>
//                                     <Typography variant="h6" component="div" gutterBottom>
//                                     {img.repo_name}
//                                     </Typography>
//                                     <Typography variant="body2" color="text.secondary">
//                                     {img.description || "No description provided."}
//                                     </Typography>
//                                 </CardContent>
//                                 </CardActionArea>
//                                 <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
//                                 <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//                                     <Typography variant="body2" color="text.secondary">
//                                     <StarIcon fontSize="small" sx={{ verticalAlign: "middle", color: "#fbc02d" }} /> {img.star_count}
//                                     </Typography>
//                                     <Typography variant="body2" color="text.secondary">
//                                     <DownloadIcon fontSize="small" sx={{ verticalAlign: "middle" }} /> {img.pull_count}
//                                     </Typography>
//                                 </Box>
//                                 </CardActions> */}

//                          </Card>
//                          </Box>
//                     </Grid>
//                 ))}
//             {/* <Grid container spacing={2}>
//                 <Grid item xs={12} sm={6} md={4}>
//                     <TextField label="Image Tag" value={tag} onChange={e=>setImageTag(e.target.value)} fullWidth/>
//                 </Grid>
//                  <Grid item xs={12} sm={6} md={4}>
//                     <TextField label="Entrypoint" value={entrypoint} onChange={e=>setEntryPoint(e.target.value)} fullWidth/>
//                 </Grid>
//                  <Grid item xs={12} sm={6} md={4}>
//                     <TextField label="CPUs" value={cpus} onChange={e=>setCpus(e.target.value)} fullWidth/>
//                 </Grid>
//                 <Grid item xs={12} sm={6} md={4}>
//                     <TextField label="Memory" value={memory} onChange={e=>setMemory(e.target.value)} fullWidth/>
//                 </Grid>
//                 <Grid item xs={12} sm={6} md={4}>
//                     <TextField label="SHM size" value={shmSize} onChange={e=>setSHMSize(e.target.value)} fullWidth/>
//                 </Grid>

//             </Grid> */}
//             </Grid>

//             <Box sx={{mt:3}}>
//                 <Button
//                     variant="contained"
//                     color="primary"
//                     onClick={handleDeploy}
//                     disabled={!selected || deploying}
//                     >
//                         {deploying ? 'Deploying...' : 'Deploy Image'}
//                     </Button>
//             </Box>
//             </Box>

//     );
// }