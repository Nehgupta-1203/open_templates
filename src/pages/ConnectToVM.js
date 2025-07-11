import React, {useState} from 'react';
import {TextField, Button, Typography, Paper, Box, Alert} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useVM } from '../VMContext';

export default function ConnectToVM() {
    const [form, setForm] = useState({ip: '', port: ''});
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

        if(!form.ip || !form.port || !pemFile) {
            setError('All fields are required');
            setLoading(false);
            return;
        }
        try {
            const data = new FormData();
            data.append('ip', form.ip);
            data.append('port', form.port);
            data.append('pemKey', pemFile);

            const response = await axios.post('/', data, {headers: {'Content-Type': 'multipart/form-data'}});
            if (response.data.success) {
                setIsConnected(true);
                navigate('/deploy');
            } else {
                setError(response.data.message || 'Connection failed');
                setIsConnected(false);
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
                        accept=".pem"
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